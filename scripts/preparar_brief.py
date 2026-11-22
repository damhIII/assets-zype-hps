#!/usr/bin/env python3
"""Convierte tus decisiones de dirección en el brief con frames exactos que lee el proyecto Remotion.

Uso:
  python3 scripts/preparar_brief.py briefs/<BASE>            # valida decisiones.json y escribe briefs/<BASE>/es/brief.json
  python3 scripts/preparar_brief.py briefs/<BASE> --stills   # además imprime los comandos de stills de revisión

Entrada (en briefs/<BASE>/):
  encargo.json                                  → lo deja el notebook (espacio, tema, formato, gancho, mandar_a…)
  es/guion.txt, es/palabras.json, es/locucion.wav → los deja el notebook
  es/subtitulos.json                            → scripts/alinear.py (se genera solo si falta)
  decisiones.json                               → lo escribes tú (formato en .claude/skills/reel-remodelacion/referencias/decisiones.md)
Salida: briefs/<BASE>/es/brief.json (versión 5), la única fuente de datos del proyecto (cópialo a src/brief_es.json).
Las anclas ("desde", "ancla…") son índices de palabra del guion: los [n] que imprime alinear.py.
"""
import json, math, re, sys, unicodedata
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(Path(__file__).resolve().parent))
import alinear  # noqa: E402
import validar_repo  # noqa: E402

SKILL = RAIZ / ".claude" / "skills" / "reel-remodelacion"
FPS, WIDTH, HEIGHT = 30, 1080, 1920
ORDEN = ["gancho", "escena", "marco", "cuerpo", "resultado", "cta"]   # un bloque por párrafo del guion (el último párrafo, "cierre", es el bloque cta)
IDIOMA = "es"
# Palabras con las que la voz manda al perfil y al enlace de la bio (el CTA hace pop en la última que aparezca)
CTA_VOZ = re.compile(r"^(link|links|enlace|enlaces|bio|biografia|perfil)$")
CTA_TEXTO = re.compile(r"link|enlace|\bbio\b|biografia|perfil", re.I)
RECLAMOS = re.compile(r"garantiz|licenciad|asegurad|sin sobrecosto|construimos|remodelamos|instalamos", re.I)


def sin_tildes(s):
    return unicodedata.normalize("NFD", str(s)).encode("ascii", "ignore").decode().lower()


def leer(p):
    return json.loads(Path(p).read_text(encoding="utf-8"))


def es_ancla(x):
    return isinstance(x, int) and not isinstance(x, bool)


def historial(base_actual):
    """Combinaciones de ambientes (no lino) de los videos anteriores, del más viejo al más nuevo."""
    carpeta = RAIZ / "briefs"
    nombres = sorted(d.name for d in carpeta.iterdir() if d.is_dir() and d.name != base_actual) if carpeta.is_dir() else []
    out = []
    for n in nombres:
        p = carpeta / n / "decisiones.json"
        if p.is_file():
            try:
                amb = leer(p).get("ambientes") or {}
            except ValueError:
                continue
            out.append(tuple(sorted((k, v) for k, v in amb.items() if v != "lino")))
    return out


class Ctx:
    """Lo que necesita el validador de parámetros: longitud del guion, datos verificados y tokens."""
    def __init__(self, n, datos_ok, tokens):
        self.n, self.datos_ok, self.tokens = n, datos_ok, tokens
        self.err, self.avisos, self.raiz_params = [], [], {}


def validar_valor(spec, v, ruta, ctx):
    t = spec["tipo"]
    if t == "texto":
        if not isinstance(v, str) or not v.strip():
            ctx.err.append(f"{ruta}: debe ser un texto no vacío")
        elif RECLAMOS.search(v):
            ctx.avisos.append(f"{ruta}: '{v}' suena a garantía, licencia o ejecución de obra: revisa prompt_guion.md → Declaraciones permitidas")
    elif t in ("numero", "entero"):
        ok = isinstance(v, int) if t == "entero" else isinstance(v, (int, float))
        if not ok or isinstance(v, bool):
            ctx.err.append(f"{ruta}: debe ser un {'entero' if t == 'entero' else 'número'}")
    elif t == "bool":
        if not isinstance(v, bool):
            ctx.err.append(f"{ruta}: debe ser true o false")
    elif t == "enum":
        if v not in spec["valores"]:
            ctx.err.append(f"{ruta}: '{v}' no es válido (usa uno de: {', '.join(spec['valores'])})")
    elif t == "ancla":
        if not es_ancla(v) or not 0 <= v < ctx.n:
            ctx.err.append(f"{ruta}: ancla {v} fuera del guion (0-{ctx.n - 1})")
    elif t == "dato":
        if not isinstance(v, str):
            ctx.err.append(f"{ruta}: debe ser el id de un dato")
        elif v not in ctx.datos_ok:
            ctx.err.append(f"{ruta}: el dato '{v}' no existe o no está verificado en datos_verificados.json: no se puede mostrar")
    elif t == "estilo":
        if v not in ctx.tokens["estilos_interior"] or str(v).startswith("_"):
            ctx.err.append(f"{ruta}: estilo desconocido '{v}' (de tokens.json → estilos_interior)")
    elif t == "icono":
        if not (isinstance(v, str) and (RAIZ / "icons" / f"{v}.svg").is_file()):
            ctx.err.append(f"{ruta}: no existe icons/{v}.svg")
    elif t == "lista":
        if not isinstance(v, list):
            ctx.err.append(f"{ruta}: debe ser una lista")
            return
        if not spec.get("min", 0) <= len(v) <= spec.get("max", 99):
            ctx.err.append(f"{ruta}: {len(v)} elementos (entre {spec.get('min', 0)} y {spec.get('max', 99)})")
        for k, item in enumerate(v):
            validar_valor(spec["item"], item, f"{ruta}[{k}]", ctx)
    elif t == "objeto":
        if not isinstance(v, dict):
            ctx.err.append(f"{ruta}: debe ser un objeto")
            return
        validar_campos(spec["campos"], v, ruta, ctx)


def validar_campos(campos, v, ruta, ctx):
    for k in v:
        if k not in campos:
            ctx.avisos.append(f"{ruta}: campo desconocido '{k}' (se ignora)")
    for k, spec in campos.items():
        val = v.get(k)
        cond = spec.get("requerido_si")
        req = spec.get("requerido") or (cond and ctx.raiz_params.get(cond["param"]) == cond["igual"])
        if val is None:
            if req:
                motivo = f" (porque {cond['param']} = {cond['igual']})" if cond and not spec.get("requerido") else ""
                ctx.err.append(f"{ruta}: falta '{k}'{motivo}")
            continue
        validar_valor(spec, val, f"{ruta}.{k}", ctx)
        if spec.get("fuente_en") and not v.get(spec["fuente_en"]):
            ctx.err.append(f"{ruta}: '{k}' = {val} necesita '{spec['fuente_en']}' con un dato verificado (nunca cifras sin fuente)")


def reglas_plantilla(pid, p, ctx):
    """Reglas cruzadas que el esquema no puede expresar."""
    if pid == "comparador":
        n = len(p.get("opciones") or [])
        for k, c in enumerate(p.get("criterios") or []):
            if len(c.get("valores") or []) != n:
                ctx.err.append(f"plantilla.criterios[{k}]: necesita {n} valores (uno por opción, en el mismo orden)")
    if pid == "planta":
        if p.get("modo") == "cambiar_estilo" and len(p.get("estilos") or []) < 2:
            ctx.err.append("plantilla: modo 'cambiar_estilo' necesita al menos 2 estilos")
        if p.get("modo") in ("amueblar", "redistribuir") and not p.get("elementos"):
            ctx.avisos.append("plantilla: una planta para amueblar o redistribuir sin 'elementos' se queda vacía")
    extra = p.get("retraso")
    if pid == "cronograma" and isinstance(extra, dict) and isinstance(extra.get("fase"), int):
        if not 0 <= extra["fase"] < len(p.get("fases") or []):
            ctx.err.append(f"plantilla.retraso: índice {extra['fase']} fuera de 'fases' (0-{len(p.get('fases') or []) - 1})")


def resolver(spec, v, frame, corta):
    """Valor listo para el render: anclas con su frame, fuentes con su texto corto, defectos aplicados."""
    t = spec["tipo"]
    if t == "lista":
        return [resolver(spec["item"], x, frame, corta) for x in v]
    if t == "objeto":
        out = {}
        for k, s in spec["campos"].items():
            val = v.get(k, s.get("defecto"))
            if val is None:
                continue
            out[k] = resolver(s, val, frame, corta)
            if s["tipo"] == "ancla":
                out[f"{k}_f"] = frame(val)
            elif s["tipo"] == "dato":
                out[f"{k}_corta"] = corta(val)
        return out
    return v


def anclas_f(obj, ruta=""):
    """[(nombre, frame)] de todas las claves *_f de los parámetros resueltos."""
    out = []
    if isinstance(obj, dict):
        for k, v in obj.items():
            if k.endswith("_f") and isinstance(v, int):
                out.append((f"{ruta}{k[:-2]}", v))
            else:
                out += anclas_f(v, f"{ruta}{k}_")
    elif isinstance(obj, list):
        for j, v in enumerate(obj):
            out += anclas_f(v, f"{ruta}{j + 1}_")
    return out


def preparar(dir_base):
    d = Path(dir_base).resolve()
    err, avisos = [], []
    if not (d / "decisiones.json").is_file():
        raise SystemExit(f"falta {d.name}/decisiones.json")
    dec = leer(d / "decisiones.json")
    encargo = leer(d / "encargo.json") if (d / "encargo.json").is_file() else {}
    if not encargo:
        avisos.append("no hay encargo.json: la marca saldrá como pendiente y no hay gancho del generador")
    tokens = leer(SKILL / "diseno" / "tokens.json")
    plantillas = leer(SKILL / "plantillas" / "plantillas.json")["plantillas"]
    datos = validar_repo.cargar_datos(RAIZ)
    datos_ok = {k for k, v in datos.items() if v.get("verificado") is True}

    if dec.get("version") != 5:
        err.append("decisiones.json debe ser 'version': 5 (seis bloques: gancho, escena, marco, cuerpo, resultado, cta)")
    e = d / IDIOMA
    faltan = [f"falta {d.name}/{IDIOMA}/{f}" for f in ("guion.txt", "palabras.json") if not (e / f).is_file()]
    if faltan:
        return None, err + faltan, avisos

    # --- material
    if not (e / "subtitulos.json").is_file():
        (e / "subtitulos.json").write_text(json.dumps(alinear.construir(e), ensure_ascii=False, indent=1), encoding="utf-8")
    sub, pj = leer(e / "subtitulos.json"), leer(e / "palabras.json")
    P, n = sub["palabras"], len(sub["palabras"])
    voz_s = float(pj.get("duracion_s") or sub["duracion_s"])
    cola_s = float(dec.get("cola_s", 1.5))
    if not 0.5 <= cola_s <= 4:
        avisos.append(f"cola_s = {cola_s}: lo normal es 1-2 s")
    total = math.ceil((voz_s + cola_s) * FPS)

    def frame(x):
        return max(0, min(total - 1, round(P[max(0, min(n - 1, int(x)))]["ini"] * FPS)))

    # --- formato y plantilla
    formato = dec.get("formato")
    if formato not in plantillas:
        err.append(f"formato desconocido: {formato} (válidos: {', '.join(plantillas)})")
    else:
        pedido = encargo.get("formato") or encargo.get("formato_guion")
        if pedido and pedido != formato:
            avisos.append(f"el encargo pide el formato '{pedido}' y decidiste '{formato}': explícalo en la entrega")

    # --- bloques
    bloques_d = dec.get("bloques") or []
    ids = [b.get("id") for b in bloques_d]
    if ids != ORDEN:
        err.append(f"los bloques deben ser {ORDEN} en ese orden (llegaron {ids})")
    desdes = []
    for b in bloques_d:
        x = b.get("desde")
        if not es_ancla(x):
            err.append(f"{b.get('id')}: 'desde' necesita un índice de palabra")
            x = 0
        elif not desdes and x != 0:
            err.append(f"{b.get('id')}: el primer bloque debe empezar en la palabra 0")
        if not 0 <= x < n:
            err.append(f"{b.get('id')}: 'desde' {x} fuera del guion (0-{n - 1})")
        if desdes and x <= desdes[-1]:
            err.append(f"{b.get('id')}: 'desde' {x} no es mayor que el del bloque anterior ({desdes[-1]})")
        desdes.append(x)
        tit = b.get("titular") or []
        if len(tit) != 2 or not all(str(t).strip() for t in tit):
            err.append(f"{b.get('id')}: el titular necesita 2 líneas con texto")
        for linea in map(str, tit):
            if len(linea.split()) > 4:
                err.append(f"{b.get('id')}: titular demasiado largo ('{linea}', máximo 4 palabras por línea)")
            elif len(linea) > 22:
                avisos.append(f"{b.get('id')}: '{linea}' tiene {len(linea)} caracteres; puede no caber al tamaño máximo (baja a px_min)")
            if RECLAMOS.search(linea):
                avisos.append(f"{b.get('id')}: titular '{linea}' suena a garantía, licencia o ejecución de obra")
            if re.search(r"\d", linea):
                avisos.append(f"{b.get('id')}: titular '{linea}' lleva una cifra: solo si es la cifra de oficio que dice la voz o un dato verificado")
    gancho_enc = encargo.get("gancho") or {}
    if bloques_d and gancho_enc.get("pantalla"):
        tit0 = " ".join(map(str, bloques_d[0].get("titular") or []))
        if sin_tildes(re.sub(r"\W+", " ", tit0)).split() != sin_tildes(re.sub(r"\W+", " ", gancho_enc["pantalla"])).split():
            avisos.append(f"el titular del gancho ('{tit0}') no es el texto de pantalla del encargo ('{gancho_enc['pantalla']}'): explícalo en la entrega")

    # --- CTA: lleva al perfil y al enlace de la bio
    cta = str(dec.get("cta") or tokens["textos_fijos"]["cta_defecto"]).strip().upper()
    if len(cta.split()) > 5:
        err.append(f"cta: '{cta}' es largo para la caja del CTA (máximo 5 palabras)")
    if not CTA_TEXTO.search(sin_tildes(cta)):
        avisos.append(f"cta: '{cta}' no dice dónde está el enlace (link / enlace / bio / perfil)")
    idx_cta = dec.get("cta_ancla")
    if idx_cta is not None and (not es_ancla(idx_cta) or not 0 <= idx_cta < n):
        err.append(f"cta_ancla: debe ser un índice de palabra del guion (0-{n - 1})")
        idx_cta = None
    if idx_cta is None:
        dichas = [j for j, p in enumerate(P) if CTA_VOZ.match(re.sub(r"[^a-z]", "", sin_tildes(p["w"])))]
        if dichas:
            idx_cta = dichas[-1]
        else:
            inicio = desdes[-1] if desdes else n - 1
            idx_cta = inicio if 0 <= inicio < n else max(0, n - 1)
            avisos.append("la voz no menciona el enlace ni la bio: el CTA hará pop al empezar el bloque cta "
                          "(el cierre debe mandar al perfil y al enlace de la bio)")
    etiqueta = str(dec.get("etiqueta") or "").strip()
    if not etiqueta:
        err.append("falta 'etiqueta' (2-3 palabras para el header, p. ej. 'PISCINA · FLORIDA')")
    elif len(etiqueta.replace("·", " ").split()) > 4:
        err.append(f"etiqueta demasiado larga ('{etiqueta}')")

    # --- ambientes
    reglas, amb_cat = tokens["reglas_ambientes"], tokens["ambientes"]
    ambientes = {b: "lino" for b in ORDEN}
    ambientes.update(dec.get("ambientes") or {})
    for bid, aid in ambientes.items():
        if bid not in ORDEN:
            err.append(f"ambiente para un bloque que no existe: {bid}")
        elif aid not in amb_cat or aid.startswith("_"):
            err.append(f"ambiente desconocido en {bid}: {aid}")
        elif bid not in amb_cat[aid]["bloques"]:
            err.append(f"el ambiente {aid} no se usa en {bid} (solo en {', '.join(amb_cat[aid]['bloques'])})")
    for bid in reglas["fijos_lino"]:
        if ambientes.get(bid) != "lino":
            err.append(f"el bloque {bid} va siempre en ambiente lino")
    fuera = [a for a in ambientes.values() if a != "lino"]
    if len(fuera) > reglas["max_bloques_fuera_de_lino"]:
        err.append(f"{len(fuera)} bloques fuera de lino (máximo {reglas['max_bloques_fuera_de_lino']})")
    firma = tuple(sorted((k, v) for k, v in ambientes.items() if v != "lino"))
    recientes = historial(d.name)[-reglas["evitar_repetir_ultimas"]:]
    if firma and firma in recientes:
        avisos.append(f"la combinación de ambientes {dict(firma)} ya salió en uno de los últimos {len(recientes)} videos")

    # --- parámetros de la plantilla y acentos
    params = (dec.get("plantilla") or {}).get("params")
    ctx = Ctx(n, datos_ok, tokens)
    if formato in plantillas:
        if not isinstance(params, dict):
            err.append("falta 'plantilla.params' (los parámetros de la plantilla del formato)")
        else:
            ctx.raiz_params = params
            validar_campos(plantillas[formato]["params"], params, "plantilla", ctx)
            reglas_plantilla(formato, params, ctx)
    acentos = dec.get("acentos") or []
    for k, a in enumerate(acentos):
        if not isinstance(a, dict) or not es_ancla(a.get("ancla")) or not 0 <= a["ancla"] < n or not str(a.get("que") or "").strip():
            err.append(f"acentos[{k}]: necesita 'ancla' (índice de palabra) y 'que' (qué pasa en pantalla)")
    err += ctx.err
    avisos += ctx.avisos
    extra = dec.get("fuentes_en_pantalla") or []
    for fid in extra:
        if fid not in datos_ok:
            err.append(f"fuentes_en_pantalla: '{fid}' no está verificado")
    if err:
        return None, err, avisos

    # --- brief
    marca_nombre = str(encargo.get("marca") or "").strip()
    plantilla_def = plantillas[formato]
    aviso_legal = dec.get("aviso_legal")
    if aviso_legal is None:
        aviso_legal = plantilla_def.get("aviso_legal", False)

    def corta(fid):
        return datos[fid].get("corta") or datos[fid]["fuente"]

    ini_f = [0] + [frame(x) for x in desdes[1:]]
    bloques = []
    for k, b in enumerate(bloques_d):
        fin_f = ini_f[k + 1] if k + 1 < len(ini_f) else total
        hasta = desdes[k + 1] if k + 1 < len(desdes) else n
        dur = (fin_f - ini_f[k]) / FPS
        if dur < 0.5:
            err.append(f"{b['id']}: dura {dur:.2f} s (mínimo 0,5 s)")
        elif dur < 1.5:
            avisos.append(f"{b['id']}: dura {dur:.2f} s; el titular casi no se podrá leer")
        bloques.append({"id": b["id"], "ini_f": ini_f[k], "fin_f": fin_f, "ini_s": round(ini_f[k] / FPS, 2), "fin_s": round(fin_f / FPS, 2),
                        "titular": [str(t).strip().rstrip(".") for t in b["titular"]],
                        "texto": " ".join(P[j]["w"] for j in range(desdes[k], hasta)), "palabras": [desdes[k], hasta]})
    params_r = resolver({"tipo": "objeto", "campos": plantilla_def["params"]}, params, frame, corta)
    acentos_r = [{"ancla": a["ancla"], "ancla_f": frame(a["ancla"]), "que": str(a["que"]).strip()} for a in acentos]
    cta_f = frame(idx_cta)

    # Ritmo: algo nuevo en pantalla como mucho cada max_sin_cambio_s mientras habla la voz
    max_s = tokens["movimiento"].get("max_sin_cambio_s", 4)
    fin_voz = min(total - 1, math.ceil(voz_s * FPS))
    eventos = sorted({0, cta_f, *ini_f, *(f for _, f in anclas_f(params_r)), *(a["ancla_f"] for a in acentos_r)})
    eventos = [f for f in eventos if f <= fin_voz] + [fin_voz]
    for a, z in zip(eventos, eventos[1:]):
        if (z - a) / FPS > max_s:
            avisos.append(f"de {a / FPS:.1f} s a {z / FPS:.1f} s pasan {(z - a) / FPS:.1f} s sin nada nuevo en pantalla "
                          f"(máximo {max_s} s): añade un elemento de la plantilla o un 'acento' en una palabra de ese tramo")
    if err:
        return None, err, avisos

    tema = encargo.get("tema") or dec.get("tema") or {}
    fuentes = [{"rol": rol, "familia": tokens["tipografia"][rol]["familia"], "css": tokens["tipografia"][rol]["css"],
                "stack": tokens["tipografia"][rol]["stack"]} for rol in ("display", "texto", "mono") if rol in tokens["tipografia"]]
    fuentes_pantalla = sorted(set(extra) | set(re.findall(r'"fuente": "([^"]+)"', json.dumps(params))))
    brief = {
        "version": 5,
        "base": d.name,
        "idioma": IDIOMA,
        "carpeta": f"briefs/{d.name}/{IDIOMA}",
        "audio": pj.get("audio", "locucion.wav"),
        "marca": {"nombre": marca_nombre or None, "pendiente": not marca_nombre,
                  "logos": (tokens.get("marca") or {}).get("logos", {}), "uso": (tokens.get("marca") or {}).get("uso", {})},
        "formato": formato,
        "video": {"width": WIDTH, "height": HEIGHT, "fps": FPS, "frames": total, "voz_s": round(voz_s, 2), "cola_s": cola_s},
        "header_entra_f": tokens["layout"]["header"].get("entra_f", 45),
        "bucle": {"ini_f": max(cta_f + 1, total - tokens["movimiento"].get("bucle_frames", 12)), "fin_f": total},
        "gancho": {"pantalla": gancho_enc.get("pantalla", ""), "primer_frame": gancho_enc.get("primer_frame", "")},
        "etiqueta": etiqueta.upper(),
        "cta": cta,
        "cta_ancla": idx_cta,
        "cta_f": cta_f,
        "cta_previo": tokens["textos_fijos"]["cta_previo"],
        "tema": {"titulo": tema.get("titulo", ""), "tesis": tema.get("tesis", "")},
        "aviso_legal": tokens["textos_fijos"]["aviso_legal"] if aviso_legal else None,
        "ilustrativo": tokens["textos_fijos"]["ilustrativo"],
        "ambientes": ambientes,
        "fuentes": fuentes,
        "fuentes_en_pantalla": [{"id": f, "corta": corta(f)} for f in fuentes_pantalla],
        "bloques": bloques,
        "plantilla": {"id": formato, "md": f".claude/skills/reel-remodelacion/plantillas/{plantilla_def['md']}", "params": params_r},
        "acentos": acentos_r,
        "tokens": tokens,
        "subtitulos": [[p["w"], p["ini"], p["fin"]] for p in P],
    }
    return brief, err, avisos


def main():
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)
    d = Path(sys.argv[1])
    brief, err, avisos = preparar(d)
    for a in avisos:
        print(f"  aviso: {a}")
    if err:
        print("ERRORES (corrige decisiones.json y vuelve a ejecutar):\n - " + "\n - ".join(err))
        sys.exit(1)
    (d / IDIOMA / "brief.json").write_text(json.dumps(brief, ensure_ascii=False, indent=1), encoding="utf-8")
    a = ", ".join(f"{k}={v}" for k, v in brief["ambientes"].items() if v != "lino") or "todo lino"
    print(f"brief.json listo · {brief['video']['frames']} frames ({brief['video']['voz_s']} s de voz + {brief['video']['cola_s']} s) · "
          f"formato {brief['formato']} · ambientes {a}")
    for b in brief["bloques"]:
        print(f"  {b['id']:<9} {b['ini_f']:>5}–{b['fin_f']:<5} {b['titular'][0]} / {b['titular'][1]}")
    if "--stills" in sys.argv:
        marcas = [("primer_frame", 0), ("header", brief["header_entra_f"] + 6)]
        marcas += [(b["id"], (b["ini_f"] + b["fin_f"]) // 2) for b in brief["bloques"]]
        prev = None
        for b in brief["bloques"]:
            amb = brief["ambientes"].get(b["id"], "lino")
            if prev is not None and amb != prev:
                marcas.append((f"transicion_{b['id']}", b["ini_f"]))
            prev = amb
        for nombre, f in anclas_f(brief["plantilla"]["params"], "plantilla_"):
            marcas.append((nombre, min(f + 8, brief["video"]["frames"] - 1)))
        for k, ac in enumerate(brief["acentos"]):
            marcas.append((f"acento_{k + 1}", min(ac["ancla_f"] + 6, brief["video"]["frames"] - 1)))
        marcas.append(("cta", min(brief["cta_f"] + 10, brief["video"]["frames"] - 1)))
        marcas.append(("final", brief["video"]["frames"] - 1))
        for nombre, f in marcas:
            print(f"npx remotion still Reel-es out/stills/{nombre}.png --frame={f}")


if __name__ == "__main__":
    main()
