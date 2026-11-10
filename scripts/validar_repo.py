#!/usr/bin/env python3
"""Valida el contenido editorial, las plantillas y los tokens del repo (pipeline educativo, solo español, solo animación).

Uso: python3 scripts/validar_repo.py [raiz]   (sale con código 1 si hay errores)

También se importa desde el notebook de Colab (preparar_repo) y desde preparar_brief.py:
  validar(raiz) -> (errores, avisos)        mensajes en español, listos para mostrar
  cargar_datos(raiz) / declaraciones(texto_marca) / secciones_voz(texto_voz)
Solo lee: nunca modifica archivos.
"""
import json, re, sys
from pathlib import Path

SKILL = Path(".claude/skills/reel-remodelacion")
EDITORIAL = ("editorial/prompt_guion.md", "editorial/marca.md", "editorial/adn.md",
             "editorial/temas.json", "editorial/formatos.json", "editorial/datos_verificados.json", "editorial/voz_tts.md")
REQUERIDOS = EDITORIAL + ("CLAUDE.md", str(SKILL / "SKILL.md"), str(SKILL / "plantillas" / "plantillas.json"),
                          str(SKILL / "diseno" / "tokens.json"))
FORMATOS = ("presupuesto", "cronograma", "mito_realidad", "planta", "errores", "checklist", "comparador")
IDIOMA = "es"
CLAVE_RE = re.compile(r"[A-Z]{2,12}")
FECHA_RE = re.compile(r"\d{4}-\d{2}-\d{2}")
DECLARACIONES = ("licencia", "seguro", "garantia_precio", "garantia_plazo", "sin_sobrecostos", "verifica_licencias")
PLACEHOLDERS = {
    "editorial/prompt_guion.md": ("{{NOMBRE_MARCA}}", "{{MARCA}}", "{{ADN}}", "{{FORMATO}}", "{{FORMATOS}}",
                                  "{{DATOS}}", "{{TEMAS}}", "{{RECIENTES}}"),
}
OBSOLETOS = {  # restos del pipeline anterior (bilingüe y con obras reales): avisan para que se borren
    "editorial/prompt_adaptacion.md": "la adaptación al inglés ya no existe",
    "assets/obras": "este pipeline solo hace animaciones, sin fotos de obras reales",
    ".claude/skills/reel-remodelacion/referencias/activos_reales.md": "este pipeline solo hace animaciones",
    ".claude/skills/reel-remodelacion/plantillas/antes_despues.md": "el formato antes_despues se eliminó",
}
CAMPOS_VIEJOS = {"toca_hps": "toca_marca", "sistema": "formato"}


def _json(raiz, rel, err):
    try:
        return json.loads((Path(raiz) / rel).read_text(encoding="utf-8"))
    except FileNotFoundError:
        err.append(f"falta {rel}")
    except ValueError as e:
        err.append(f"{rel} no es JSON válido ({e})")
    return None


def declaraciones(texto_marca):
    """'- licencia: no' → {'licencia': False, ...} (solo las claves conocidas)."""
    out = {}
    for m in re.finditer(r"^\s*-\s*([a-z_]+)\s*:\s*(si|sí|no)\s*$", texto_marca, re.M | re.I):
        if m.group(1) in DECLARACIONES:
            out[m.group(1)] = m.group(2).lower() in ("si", "sí")
    return out


def secciones_voz(texto):
    """voz_tts.md → {'es': perfil, 'en': perfil} (secciones '# IDIOMA: xx')."""
    partes = re.split(r"^#\s*IDIOMA:\s*([a-z]{2})\s*$", texto, flags=re.M)
    return {partes[i]: partes[i + 1].strip() for i in range(1, len(partes) - 1, 2)}


def cargar_datos(raiz, solo_verificados=False):
    d = json.loads((Path(raiz) / "editorial/datos_verificados.json").read_text(encoding="utf-8"))["datos"]
    return {k: v for k, v in d.items() if v.get("verificado") is True} if solo_verificados else d


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

    decl = declaraciones((raiz / "editorial/marca.md").read_text(encoding="utf-8"))
    falta = [k for k in DECLARACIONES if k not in decl]
    if falta:
        err.append(f"editorial/marca.md: en 'Declaraciones permitidas' faltan las líneas '- <clave>: si|no' de: {', '.join(falta)}")

    plantillas = (_json(raiz, SKILL / "plantillas" / "plantillas.json", err) or {}).get("plantillas", {})
    for fid in FORMATOS:
        if fid not in plantillas:
            err.append(f"plantillas.json: falta la plantilla '{fid}'")
        elif not (raiz / SKILL / "plantillas" / plantillas[fid].get("md", "")).is_file():
            err.append(f"plantillas.json: no existe la ficha {plantillas[fid].get('md')} de '{fid}'")

    formatos = (_json(raiz, "editorial/formatos.json", err) or {}).get("formatos", {})
    if sorted(formatos) != sorted(FORMATOS):
        err.append(f"editorial/formatos.json: los formatos deben ser exactamente {', '.join(FORMATOS)} (llegaron {', '.join(formatos) or 'ninguno'})")
    for fid, f in formatos.items():
        if not isinstance(f.get("nombre"), str) or not f["nombre"].strip():
            err.append(f"editorial/formatos.json: '{fid}' necesita 'nombre' (texto)")
        if not str(f.get("guion") or "").strip():
            err.append(f"editorial/formatos.json: '{fid}' necesita 'guion'")
        if f.get("plantilla") not in plantillas:
            err.append(f"editorial/formatos.json: '{fid}' apunta a una plantilla que no existe ({f.get('plantilla')})")

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
    if datos and not any(d.get("verificado") is True for d in datos.values()):
        avisos.append("datos_verificados.json: ningún dato está verificado todavía; el guion no podrá citar cifras")

    temas = (_json(raiz, "editorial/temas.json", err) or {}).get("temas")
    if not isinstance(temas, list) or not temas:
        err.append("editorial/temas.json: necesita una lista 'temas'")
        temas = []
    vistas = {}
    for t in temas:
        pre = f"temas.json → tema {t.get('id', '?')}"
        for viejo, nuevo in CAMPOS_VIEJOS.items():
            if viejo in t or any(isinstance(i, dict) and viejo in i for i in t.get("ideas", [])):
                err.append(f"{pre}: campo antiguo '{viejo}': renómbralo a '{nuevo}'")
        for k in ("titulo", "tesis"):
            if not str(t.get(k) or "").strip():
                err.append(f"{pre}: falta '{k}'")
        if not isinstance(t.get("toca_marca"), bool):
            err.append(f"{pre}: 'toca_marca' debe ser true o false")
        for did in t.get("datos", []):
            if did not in datos:
                err.append(f"{pre}: el dato '{did}' no existe en datos_verificados.json")
        ideas = t.get("ideas")
        if not isinstance(ideas, list) or not ideas:
            err.append(f"{pre}: necesita al menos una idea")
            continue
        for j, idea in enumerate(ideas):
            p = f"{pre}, idea {j + 1}"
            if not isinstance(idea, dict):
                err.append(f"{p}: debe ser un objeto con gancho, formato y cta")
                continue
            if not str(idea.get("gancho") or "").strip():
                err.append(f"{p}: falta 'gancho'")
            if idea.get("formato") not in FORMATOS:
                err.append(f"{p}: 'formato' debe ser uno de {', '.join(FORMATOS)}")
            k = idea.get("cta")
            if not (isinstance(k, str) and CLAVE_RE.fullmatch(k)):
                err.append(f"{p}: 'cta' debe ser una palabra en MAYÚSCULAS sin tildes, eñe ni números (2-12 letras)")
            elif k in vistas:
                err.append(f"{p}: palabra clave repetida '{k}': ya se usa en {vistas[k]}")
            else:
                vistas[k] = p

    tokens = _json(raiz, SKILL / "diseno" / "tokens.json", err) or {}
    for rol in ("display", "texto"):
        css = ((tokens.get("tipografia") or {}).get(rol) or {}).get("css")
        if css and not (raiz / css).is_file():
            err.append(f"tokens.json: no existe la fuente {css}")
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
