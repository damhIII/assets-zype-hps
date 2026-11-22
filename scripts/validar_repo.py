#!/usr/bin/env python3
"""Valida el contenido editorial, las plantillas y los tokens del repo (pipeline educativo, solo español, solo animación).

Uso: python3 scripts/validar_repo.py [raiz]   (sale con código 1 si hay errores)

También lo importa preparar_brief.py:
  validar(raiz) -> (errores, avisos)        mensajes en español, listos para mostrar
  cargar_datos(raiz) / declaraciones(texto) / secciones_voz(texto_voz)
Solo lee: nunca modifica archivos.
"""
import json, re, sys
from pathlib import Path

SKILL = Path(".claude/skills/reel-remodelacion")
EDITORIAL = ("editorial/prompt_guion.md", "editorial/prompt_tema.md", "editorial/prompt_catalogo.md", "editorial/formatos.json",
             "editorial/espacios.json", "editorial/historial.jsonl", "editorial/datos_verificados.json", "editorial/voz_tts.md")
REQUERIDOS = EDITORIAL + ("CLAUDE.md", str(SKILL / "SKILL.md"), str(SKILL / "plantillas" / "plantillas.json"),
                          str(SKILL / "diseno" / "tokens.json"))
FORMATOS = ("errores", "mito_realidad", "planta", "comparador", "checklist", "cronograma")
TEMPORADAS = ("huracanes", "lluvias", "calor", "seca")
IDIOMA = "es"
FECHA_RE = re.compile(r"\d{4}-\d{2}-\d{2}")
DECLARACIONES = ("licencia", "seguro", "garantia_precio", "garantia_plazo", "sin_sobrecostos", "verifica_licencias")
PLACEHOLDERS = {
    "editorial/prompt_guion.md": ("{{MARCA}}", "{{DATOS}}", "{{RECIENTES}}"),
    "editorial/prompt_tema.md": ("{{MARCA}}",),
    "editorial/prompt_catalogo.md": ("{{MARCA}}",),
}
OBSOLETOS = {  # restos de versiones anteriores: avisan para que se borren
    "editorial/marca.md": "se fusionó en prompt_guion.md",
    "editorial/adn.md": "se fusionó en prompt_guion.md",
    "editorial/temas.json": "los temas los genera el notebook a partir de editorial/espacios.json",
    str(SKILL / "plantillas" / "presupuesto.md"): "el formato presupuesto se eliminó",
    "assets/obras": "este pipeline solo hace animaciones, sin fotos de obras reales",
}


def _json(raiz, rel, err):
    try:
        return json.loads((Path(raiz) / rel).read_text(encoding="utf-8"))
    except FileNotFoundError:
        err.append(f"falta {rel}")
    except ValueError as e:
        err.append(f"{rel} no es JSON válido ({e})")
    return None


def declaraciones(texto):
    """'- licencia: no' → {'licencia': False, ...} (solo las claves conocidas)."""
    out = {}
    for m in re.finditer(r"^\s*-\s*([a-z_]+)\s*:\s*(si|sí|no)\s*$", texto, re.M | re.I):
        if m.group(1) in DECLARACIONES:
            out[m.group(1)] = m.group(2).lower() in ("si", "sí")
    return out


def secciones_voz(texto):
    """voz_tts.md → {'es': perfil} (secciones '# IDIOMA: xx')."""
    partes = re.split(r"^#\s*IDIOMA:\s*([a-z]{2})\s*$", texto, flags=re.M)
    return {partes[i]: partes[i + 1].strip() for i in range(1, len(partes) - 1, 2)}


def cargar_datos(raiz, solo_verificados=False):
    d = json.loads((Path(raiz) / "editorial/datos_verificados.json").read_text(encoding="utf-8"))["datos"]
    return {k: v for k, v in d.items() if v.get("verificado") is True} if solo_verificados else d


def _validar_formatos(raiz, plantillas, err):
    cfg = _json(raiz, "editorial/formatos.json", err) or {}
    formatos = cfg.get("formatos", {})
    if sorted(formatos) != sorted(FORMATOS):
        err.append(f"editorial/formatos.json: los formatos deben ser exactamente {', '.join(FORMATOS)} (llegaron {', '.join(formatos) or 'ninguno'})")
    for fid, f in formatos.items():
        for k in ("nombre", "guion", "guardable"):
            if not str(f.get(k) or "").strip():
                err.append(f"editorial/formatos.json: '{fid}' necesita '{k}'")
        if not isinstance(f.get("peso"), (int, float)) or f["peso"] <= 0:
            err.append(f"editorial/formatos.json: '{fid}' necesita 'peso' (número mayor que 0)")
        if f.get("plantilla") not in plantillas:
            err.append(f"editorial/formatos.json: '{fid}' apunta a una plantilla que no existe ({f.get('plantilla')})")
    tipos = cfg.get("tipos_gancho") or {}
    if len(tipos) < 3:
        err.append("editorial/formatos.json: 'tipos_gancho' necesita al menos tres tipos")
    for tid, t in tipos.items():
        if not str((t or {}).get("descripcion") or "").strip():
            err.append(f"editorial/formatos.json: el tipo de gancho '{tid}' necesita 'descripcion'")
    tramos = cfg.get("tramos") or {}
    for tid in ("corto", "largo"):
        p = (tramos.get(tid) or {}).get("palabras")
        if not (isinstance(p, list) and len(p) == 2 and all(isinstance(x, int) for x in p) and p[0] < p[1]):
            err.append(f"editorial/formatos.json: el tramo '{tid}' necesita 'palabras': [mínimo, máximo]")
    for bid in ("gancho", "problema", "cierre"):
        if not isinstance(((cfg.get("bloques") or {}).get(bid) or {}).get("palabras_max"), int):
            err.append(f"editorial/formatos.json: 'bloques.{bid}.palabras_max' debe ser un entero")


def _validar_espacios(raiz, err, avisos):
    espacios = (_json(raiz, "editorial/espacios.json", err) or {}).get("espacios")
    if not isinstance(espacios, dict) or not espacios:
        err.append("editorial/espacios.json: necesita un objeto 'espacios'")
        return {}
    ids = {}
    for esp, e in espacios.items():
        dolores = (e or {}).get("dolores")
        if not isinstance(dolores, list) or not dolores:
            avisos.append(f"espacios.json → {esp}: no tiene dolores (el notebook generará diez la primera vez)")
            continue
        for d in dolores:
            pre = f"espacios.json → {esp} → {d.get('id', '?')}"
            if not str(d.get("id") or "").strip():
                err.append(f"{pre}: falta 'id'")
            elif d["id"] in ids:
                err.append(f"{pre}: id repetido (también está en {ids[d['id']]})")
            else:
                ids[d["id"]] = esp
            for k in ("elemento", "dolor", "solucion"):
                if not str(d.get(k) or "").strip():
                    err.append(f"{pre}: falta '{k}'")
            fm = d.get("formatos")
            if not isinstance(fm, list) or not fm or any(f not in FORMATOS for f in fm):
                err.append(f"{pre}: 'formatos' debe ser una lista con ids de {', '.join(FORMATOS)}")
            if any(t not in TEMPORADAS for t in d.get("temporadas") or []):
                err.append(f"{pre}: 'temporadas' solo admite {', '.join(TEMPORADAS)}")
    return ids


def _validar_historial(raiz, ids, err, avisos):
    p = Path(raiz) / "editorial/historial.jsonl"
    if not p.is_file():
        return
    for n, linea in enumerate(p.read_text(encoding="utf-8").splitlines(), 1):
        if not linea.strip():
            continue
        try:
            h = json.loads(linea)
        except ValueError:
            err.append(f"editorial/historial.jsonl, línea {n}: no es JSON válido")
            continue
        for k in ("base", "espacio", "formato"):
            if not h.get(k):
                err.append(f"editorial/historial.jsonl, línea {n}: falta '{k}'")
        if h.get("dolor_id") and h["dolor_id"] != "libre" and h["dolor_id"] not in ids:
            avisos.append(f"editorial/historial.jsonl, línea {n}: el dolor '{h['dolor_id']}' ya no está en espacios.json")


def validar(raiz):
    raiz = Path(raiz)
    err, avisos = [], []
    faltan = [f for f in REQUERIDOS if not (raiz / f).is_file()]
    if faltan:
        return [f"faltan archivos en el repo: {', '.join(faltan)}"], avisos

    for rel, marcas in PLACEHOLDERS.items():
        txt = (raiz / rel).read_text(encoding="utf-8")
        falta = [p for p in marcas if p not in txt]
        if falta:
            err.append(f"{rel}: faltan las variables {', '.join(falta)}")

    for rel, motivo in OBSOLETOS.items():
        if (raiz / rel).exists():
            avisos.append(f"{rel} sobra ({motivo}): bórralo del repo")

    voz = secciones_voz((raiz / "editorial/voz_tts.md").read_text(encoding="utf-8"))
    if IDIOMA not in voz:
        err.append(f"editorial/voz_tts.md: falta la sección '# IDIOMA: {IDIOMA}'")
    elif "{{GUION}}" not in voz[IDIOMA]:
        err.append(f"editorial/voz_tts.md: la sección '{IDIOMA}' no tiene {{{{GUION}}}}")

    decl = declaraciones((raiz / "editorial/prompt_guion.md").read_text(encoding="utf-8"))
    falta = [k for k in DECLARACIONES if k not in decl]
    if falta:
        err.append(f"editorial/prompt_guion.md: en 'Declaraciones permitidas' faltan las líneas '- <clave>: si|no' de: {', '.join(falta)}")

    plantillas = (_json(raiz, SKILL / "plantillas" / "plantillas.json", err) or {}).get("plantillas", {})
    for fid in FORMATOS:
        if fid not in plantillas:
            err.append(f"plantillas.json: falta la plantilla '{fid}'")
        elif not (raiz / SKILL / "plantillas" / plantillas[fid].get("md", "")).is_file():
            err.append(f"plantillas.json: no existe la ficha {plantillas[fid].get('md')} de '{fid}'")
    for fid in plantillas:
        if fid not in FORMATOS:
            err.append(f"plantillas.json: '{fid}' no es uno de los formatos ({', '.join(FORMATOS)})")

    _validar_formatos(raiz, plantillas, err)
    ids = _validar_espacios(raiz, err, avisos)
    _validar_historial(raiz, ids, err, avisos)

    datos = (_json(raiz, "editorial/datos_verificados.json", err) or {}).get("datos")
    if not isinstance(datos, dict):
        err.append("editorial/datos_verificados.json: necesita un objeto 'datos'")
        datos = {}
    for did, d in datos.items():
        pre = f"datos_verificados.json → {did}"
        for k in ("dato", "fuente", "acotacion"):
            if not str(d.get(k) or "").strip():
                err.append(f"{pre}: falta '{k}'")
        if not isinstance(d.get("verificado"), bool):
            err.append(f"{pre}: 'verificado' debe ser true o false (no null)")
        elif d["verificado"]:
            if "TODO" in str(d.get("dato")):
                err.append(f"{pre}: está verificado pero el texto aún dice TODO")
            if not d.get("url") or not d.get("cita_literal"):
                err.append(f"{pre}: un dato verificado necesita 'url' exacta y 'cita_literal'")
            if not (isinstance(d.get("fecha_consulta"), str) and FECHA_RE.fullmatch(d["fecha_consulta"])):
                err.append(f"{pre}: un dato verificado necesita 'fecha_consulta' (AAAA-MM-DD)")
            if not str(d.get("corta") or "").strip():
                err.append(f"{pre}: un dato verificado necesita 'corta' (la fuente que va en pantalla)")

    tokens = _json(raiz, SKILL / "diseno" / "tokens.json", err) or {}
    for rol in ("display", "texto", "mono"):
        css = ((tokens.get("tipografia") or {}).get(rol) or {}).get("css")
        if css and not (raiz / css).is_file():
            err.append(f"tokens.json: no existe la fuente {css}")
    logos = ((tokens.get("marca") or {}).get("logos") or {})
    if not logos:
        err.append("tokens.json: falta 'marca.logos' (las rutas del logo de la marca en brand/)")
    for vid, rel in logos.items():
        if not (raiz / rel).is_file():
            err.append(f"tokens.json → marca.logos.{vid}: no existe {rel} (sube el logo al repo)")
    return err, avisos


def main():
    raiz = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).resolve().parent.parent
    err, avisos = validar(raiz)
    for a in avisos:
        print(f"  aviso: {a}")
    if err:
        print("ERRORES:\n - " + "\n - ".join(err))
        sys.exit(1)
    print(f"Repo válido · {len(cargar_datos(raiz, True))}/{len(cargar_datos(raiz))} datos verificados")


if __name__ == "__main__":
    main()
