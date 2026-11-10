#!/usr/bin/env python3
"""Convierte tus decisiones de dirección en los briefs con frames exactos que lee el proyecto Remotion (uno por idioma).

Uso:
  python3 scripts/preparar_brief.py briefs/<BASE>            # valida decisiones.json y escribe briefs/<BASE>/<idioma>/brief.json
  python3 scripts/preparar_brief.py briefs/<BASE> --stills   # además imprime los comandos de stills de revisión

Entrada (en briefs/<BASE>/):
  encargo.json                                   → lo deja el notebook (marca, formato pedido, idiomas, obra)
  <idioma>/guion.txt, palabras.json, locucion.wav → los deja el notebook (idioma = es, en)
  <idioma>/subtitulos.json                       → scripts/alinear.py (se genera solo si falta)
  decisiones.json                                → lo escribes tú, UNO para todos los idiomas (mismo diseño de escenas)
                                                   formato en .claude/skills/reel-remodelacion/referencias/decisiones.md
Salida: briefs/<BASE>/<idioma>/brief.json (versión 4), la única fuente de datos del proyecto (cópialo a src/brief_<idioma>.json).
Las anclas ("desde", "ancla…") son índices de palabra del guion de cada idioma: los [n] que imprime alinear.py.
"""
import json, math, re, sys, unicodedata
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(Path(__file__).resolve().parent))
import alinear  # noqa: E402
import validar_repo  # noqa: E402

SKILL = RAIZ / ".claude" / "skills" / "reel-remodelacion"
FPS, WIDTH, HEIGHT = 30, 1080, 1920
ORDEN = ["gancho", "escena", "marco", "cuerpo", "resultado", "cta"]
IDIOMAS = ("es", "en")
PLACEHOLDER_MARCA = "{{NOMBRE_MARCA}}"
RECLAMOS = re.compile(r"garantiz|guarante|licenciad|licensed|asegurad|insured|sin sobrecosto|no hidden|construimos|remodelamos|we build|we remodel", re.I)


def sin_tildes(s):
    return unicodedata.normalize("NFD", str(s)).encode("ascii", "ignore").decode().lower()


def leer(p):
    return json.loads(Path(p).read_text(encoding="utf-8"))


def historial(base_actual):
    """Combinaciones de ambientes (no lino) de los videos anteriores, del más viejo al más nuevo."""
    carpeta = RAIZ / "briefs"
    nombres = [d.name for d in carpeta.iterdir() if d.is_dir() and d.name != base_actual] if carpeta.is_dir() else []
    nombres.sort()
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
    """Lo que necesita el validador de parámetros: idiomas, longitud de cada guion, datos, obra, tokens."""
    def __init__(self, idiomas, n, datos_ok, obra, tokens):
        self.idiomas, self.n, self.datos_ok, self.obra, self.tokens = idiomas, n, datos_ok, obra, tokens
        self.err, self.avisos, self.raiz_params = [], [], {}


def _por_idioma(v, idiomas):
    """True si v es {es: ..., en: ...} con todos los idiomas pedidos."""
    return isinstance(v, dict) and all(i in v for i in idiomas) and set(v) <= set(IDIOMAS)


def validar_valor(spec, v, ruta, ctx):
    t = spec["tipo"]
    if t == "texto":
        if isinstance(v, str):
            if not v.strip():
                ctx.err.append(f"{ruta}: texto vacío")
            elif len(ctx.idiomas) > 1:
                ctx.avisos.append(f"{ruta}: texto sin versión por idioma ('{v}'): se mostrará igual en {', '.join(ctx.idiomas)}")
        elif _por_idioma(v, ctx.idiomas):
            for i in ctx.idiomas:
                if not str(v[i]).strip():
                    ctx.err.append(f"{ruta}.{i}: texto vacío")
                elif RECLAMOS.search(str(v[i])):
                    ctx.avisos.append(f"{ruta}.{i}: '{v[i]}' suena a garantía, licencia o ejecución de obra: revisa marca.md → Declaraciones")
        else:
            ctx.err.append(f"{ruta}: debe ser un texto o {{{', '.join(repr(i) for i in ctx.idiomas)}}}")
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
        if isinstance(v, int) and not isinstance(v, bool):
            if len(ctx.idiomas) > 1:
                ctx.err.append(f"{ruta}: con dos idiomas el ancla va por idioma: {{\"es\": n, \"en\": m}}")
                return
            v = {ctx.idiomas[0]: v}
        if not _por_idioma(v, ctx.idiomas):
            ctx.err.append(f"{ruta}: ancla inválida (índice de palabra o {{\"es\": n, \"en\": m}})")
            return
        for i in ctx.idiomas:
            x = v[i]
            if not isinstance(x, int) or isinstance(x, bool) or not 0 <= x < ctx.n[i]:
                ctx.err.append(f"{ruta}.{i}: ancla {x} fuera del guion {i} (0-{ctx.n[i] - 1})")
    elif t == "dato":
        if not isinstance(v, str):
            ctx.err.append(f"{ruta}: debe ser el id de un dato")
        elif v.startswith("obra:"):
            campo = v[5:]
            if not ctx.obra:
                ctx.err.append(f"{ruta}: '{v}' necesita una obra elegida en decisiones.obra")
            elif not ((ctx.obra.get("datos_publicables") or {}).get(campo) or {}).get("verificado") is True:
                ctx.err.append(f"{ruta}: el dato '{campo}' de la obra {ctx.obra['id']} no está verificado: no se puede mostrar")
        elif v not in ctx.datos_ok:
            ctx.err.append(f"{ruta}: el dato '{v}' no existe o no está verificado en datos_verificados.json: no se puede mostrar")
    elif t == "activo":
        if not ctx.obra:
            ctx.err.append(f"{ruta}: '{v}' necesita una obra elegida en decisiones.obra")
        elif v not in [a.get("archivo") for a in ctx.obra.get("activos", [])]:
            ctx.err.append(f"{ruta}: '{v}' no está en los activos de la obra {ctx.obra['id']}")
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
        if spec.get("fuente_en"):
            fuente = v.get(spec["fuente_en"])
            if not fuente:
                ctx.err.append(f"{ruta}: '{k}' = {val} necesita '{spec['fuente_en']}' con un dato verificado (nunca cifras sin fuente)")
            elif isinstance(fuente, str) and fuente.startswith("obra:") and ctx.obra:
                dp = (ctx.obra.get("datos_publicables") or {}).get(fuente[5:]) or {}
                if dp.get("verificado") and dp.get("valor") != val:
                    ctx.err.append(f"{ruta}: '{k}' = {val} no coincide con la obra ({fuente[5:]} = {dp.get('valor')})")


def reglas_plantilla(pid, p, ctx, tiene_obra):
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
    if pid == "antes_despues" and p.get("fuente_visual") == "obra" and not tiene_obra:
        ctx.err.append("plantilla: fuente_visual 'obra' necesita decisiones.obra (si no hay obra, usa 'ilustracion')")
    for lista, campo, clave in (("partidas", "alerta", "partida"), ("fases", "retraso", "fase")):
        extra = p.get(campo)
        if isinstance(extra, dict) and isinstance(extra.get(clave), int):
            idx = extra[clave]
            if not 0 <= idx < len(p.get(lista) or []):
                ctx.err.append(f"plantilla.{campo}: índice {idx} fuera de '{lista}' (0-{len(p.get(lista) or []) - 1})")


def resolver(spec, v, idioma, frame, corta):
    """Valor listo para el render en un idioma: textos en su idioma, anclas con frame, defectos aplicados."""
    t = spec["tipo"]
    if t == "texto":
        return v if isinstance(v, str) else v.get(idioma)
    if t == "ancla":
        return v if isinstance(v, int) else v.get(idioma)
    if t == "lista":
        return [resolver(spec["item"], x, idioma, frame, corta) for x in v]
    if t == "objeto":
        out = {}
        for k, s in spec["campos"].items():
            val = v.get(k, s.get("defecto"))
            if val is None:
                continue
            out[k] = resolver(s, val, idioma, frame, corta)
            if s["tipo"] == "ancla":
                out[f"{k}_f"] = frame(out[k])
            elif s["tipo"] == "dato":
                out[f"{k}_corta"] = corta(val)
        return out
    return v


def preparar(dir_base):
    d = Path(dir_base).resolve()
    err, avisos = [], []
    if not (d / "decisiones.json").is_file():
        raise SystemExit(f"falta {d.name}/decisiones.json")
    dec = leer(d / "decisiones.json")
    encargo = leer(d / "encargo.json") if (d / "encargo.json").is_file() else {}
    if not encargo:
        avisos.append("no hay encargo.json: la marca saldrá como pendiente")
    tokens = leer(SKILL / "diseno" / "tokens.json")
    plantillas = leer(SKILL / "plantillas" / "plantillas.json")["plantillas"]
    datos = validar_repo.cargar_datos(RAIZ)
    datos_ok = {k for k, v in datos.items() if v.get("verificado") is True}

    if dec.get("version") != 4:
        err.append("decisiones.json debe ser 'version': 4")
    idiomas = dec.get("idiomas") or encargo.get("idiomas") or []
    if not idiomas or any(i not in IDIOMAS for i in idiomas):
        return None, [f"'idiomas' debe ser una lista con es y/o en (llegó {idiomas})"], avisos
    for i in idiomas:
        for f in ("guion.txt", "palabras.json"):
            if not (d / i / f).is_file():
                err.append(f"falta {d.name}/{i}/{f}")
    if err:
        return None, err, avisos

    # --- material por idioma
    mat = {}
    for i in idiomas:
        if not (d / i / "subtitulos.json").is_file():
            (d / i / "subtitulos.json").write_text(json.dumps(alinear.construir(d / i), ensure_ascii=False, indent=1), encoding="utf-8")
        sub, pj = leer(d / i / "subtitulos.json"), leer(d / i / "palabras.json")
        guion = (d / i / "guion.txt").read_text(encoding="utf-8")
        voz_s = float(pj.get("duracion_s") or sub["duracion_s"])
        mat[i] = {"P": sub["palabras"], "n": len(sub["palabras"]), "guion": guion, "voz_s": voz_s, "pj": pj}

    cola_s = float(dec.get("cola_s", 1.5))
    if not 0.5 <= cola_s <= 4:
        avisos.append(f"cola_s = {cola_s}: lo normal es 1-2 s")

    def frame_de(i):
        P, n = mat[i]["P"], mat[i]["n"]
        total = math.ceil((mat[i]["voz_s"] + cola_s) * FPS)
        return lambda x: max(0, min(total - 1, round(P[max(0, min(n - 1, int(x)))]["ini"] * FPS)))

    def por_idioma(v, i):
        return v.get(i) if isinstance(v, dict) else v

    # --- formato y plantilla
    formato = dec.get("formato")
    if formato not in plantillas:
        err.append(f"formato desconocido: {formato} (válidos: {', '.join(plantillas)})")
    elif encargo.get("formato") not in (None, "auto", formato):
        avisos.append(f"el encargo pedía el formato '{encargo['formato']}' y decidiste '{formato}': explícalo en la entrega")

    # --- obra real
    obra_id, obra = dec.get("obra"), None
    if obra_id:
        utiles = {o["id"]: o for o in validar_repo.cargar_obras(RAIZ)}
        obra = utiles.get(obra_id)
        if not obra:
            err.append(f"obra '{obra_id}' no existe, no está autorizada o su manifest tiene errores (python3 scripts/validar_repo.py)")
    elif formato in plantillas and plantillas[formato].get("usa_obra") == "preferida":
        avisos.append(f"el formato {formato} luce mejor con una obra real y no hay ninguna elegida: irá como ilustración")

    # --- bloques
    bloques_d = dec.get("bloques") or []
    ids = [b.get("id") for b in bloques_d]
    if ids != ORDEN:
        err.append(f"los bloques deben ser {ORDEN} en ese orden (llegaron {ids})")
    desdes = {i: [] for i in idiomas}
    for b in bloques_d:
        for i in idiomas:
            x = por_idioma(b.get("desde"), i)
            if not isinstance(x, int) or isinstance(x, bool):
                err.append(f"{b.get('id')}: 'desde' necesita un índice de palabra para '{i}'" + (" ({\"es\": n, \"en\": m})" if len(idiomas) > 1 else ""))
                x = 0
            elif not desdes[i] and x != 0:
                err.append(f"{b.get('id')} [{i}]: el primer bloque debe empezar en la palabra 0")
            if not 0 <= x < mat[i]["n"]:
                err.append(f"{b.get('id')} [{i}]: 'desde' {x} fuera del guion (0-{mat[i]['n'] - 1})")
            if desdes[i] and x <= desdes[i][-1]:
                err.append(f"{b.get('id')} [{i}]: 'desde' {x} no es mayor que el del bloque anterior ({desdes[i][-1]})")
            desdes[i].append(x)
            tit = por_idioma(b.get("titular"), i) or []
            if len(idiomas) > 1 and not isinstance(b.get("titular"), dict):
                err.append(f"{b.get('id')}: con dos idiomas el titular va por idioma: {{\"es\": [..], \"en\": [..]}}")
            if len(tit) != 2 or not all(str(t).strip() for t in tit):
                err.append(f"{b.get('id')} [{i}]: el titular necesita 2 líneas con texto")
            for linea in tit:
                linea = str(linea)
                if len(linea.split()) > 4:
                    err.append(f"{b.get('id')} [{i}]: titular demasiado largo ('{linea}', máximo 4 palabras por línea)")
                elif len(linea) > 22:
                    avisos.append(f"{b.get('id')} [{i}]: '{linea}' tiene {len(linea)} caracteres; puede no caber a 88 px (baja a px_min)")
                if RECLAMOS.search(linea):
                    avisos.append(f"{b.get('id')} [{i}]: titular '{linea}' suena a garantía, licencia o ejecución de obra")

    cta = {i: str(por_idioma(dec.get("cta"), i) or "").strip().upper() for i in idiomas}
    for i in idiomas:
        palabras_guion = [re.sub(r"[^A-Z]", "", sin_tildes(p["w"]).upper()) for p in mat[i]["P"]]
        if not cta[i]:
            err.append(f"falta 'cta' para '{i}' (la palabra clave que dice la voz al final)")
        elif re.sub(r"[^A-Z]", "", sin_tildes(cta[i]).upper()) not in palabras_guion:
            err.append(f"la palabra CTA '{cta[i]}' no aparece en el guion {i}")
        if bloques_d and bloques_d[-1].get("id") == "cta" and cta[i]:
            l2 = (por_idioma(bloques_d[-1].get("titular"), i) or ["", ""])[-1]
            if sin_tildes(cta[i]) not in sin_tildes(l2):
                err.append(f"cta [{i}]: la línea 2 del titular debe ser la palabra {cta[i]}")
    etiqueta = dec.get("etiqueta")
    for i in idiomas:
        e = str(por_idioma(etiqueta, i) or "").strip()
        if not e:
            err.append(f"falta 'etiqueta' [{i}] (2-3 palabras para el header, p. ej. 'PERMISOS · BROWARD')")
        elif len(e.replace("·", " ").split()) > 4:
            err.append(f"etiqueta [{i}] demasiado larga ('{e}')")

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

    # --- parámetros de la plantilla
    params = (dec.get("plantilla") or {}).get("params")
    ctx = Ctx(idiomas, {i: mat[i]["n"] for i in idiomas}, datos_ok, obra, tokens)
    if formato in plantillas:
        if not isinstance(params, dict):
            err.append("falta 'plantilla.params' (los parámetros de la plantilla del formato)")
        else:
            ctx.raiz_params = params
            validar_campos(plantillas[formato]["params"], params, "plantilla", ctx)
            reglas_plantilla(formato, params, ctx, bool(obra))
    err += ctx.err
    avisos += ctx.avisos
    extra = dec.get("fuentes_en_pantalla") or []
    for fid in extra:
        if fid not in datos_ok:
            err.append(f"fuentes_en_pantalla: '{fid}' no está verificado")

    # --- similitud entre idiomas (mismo diseño de escenas)
    if len(idiomas) == 2 and not err:
        dur = {}
        for i in idiomas:
            f = frame_de(i)
            ini = [0] + [f(x) for x in desdes[i][1:]]
            total = math.ceil((mat[i]["voz_s"] + cola_s) * FPS)
            dur[i] = [(ini[k + 1] if k + 1 < len(ini) else total) - ini[k] for k in range(len(ini))]
        for k, bid in enumerate(ORDEN):
            a, b = dur["es"][k], dur["en"][k]
            if min(a, b) and max(a, b) / min(a, b) > 1.8:
                avisos.append(f"{bid}: dura {a / FPS:.1f} s en es y {b / FPS:.1f} s en en; revisa que las anclas marquen la misma idea")

    if err:
        return None, err, avisos

    # --- briefs por idioma
    marca_nombre = str(encargo.get("marca") or "").strip()
    pendiente = not marca_nombre or marca_nombre == PLACEHOLDER_MARCA
    plantilla_def = plantillas[formato]
    aviso_legal = dec.get("aviso_legal")
    if aviso_legal is None:
        aviso_legal = plantilla_def.get("aviso_legal", False)
    obra_brief = None
    if obra:
        cred = dict(obra.get("creditos") or {})
        if cred.get("coordinacion") == PLACEHOLDER_MARCA:
            cred["coordinacion"] = "" if pendiente else marca_nombre
        obra_brief = {"id": obra["id"], "titulo": obra["titulo"], "carpeta": obra["_dir"], "creditos": cred,
                      "privacidad": obra["privacidad"], "tipo_espacio": obra["tipo_espacio"],
                      "activos": [dict(a, ruta=f"{obra['_dir']}/{a['archivo']}") for a in obra["activos"]]}

    def corta(fid):
        if fid.startswith("obra:"):
            return f"Obra real · {obra['titulo']}" if obra else ""
        return datos[fid].get("corta") or datos[fid]["fuente"]

    fuentes = [{"rol": rol, "familia": t["familia"], "css": t["css"], "stack": t["stack"]}
               for rol, t in (("display", tokens["tipografia"]["display"]), ("texto", tokens["tipografia"]["texto"]))]
    briefs = {}
    for i in idiomas:
        P, n = mat[i]["P"], mat[i]["n"]
        total = math.ceil((mat[i]["voz_s"] + cola_s) * FPS)
        frame = frame_de(i)
        ini_f = [0] + [frame(x) for x in desdes[i][1:]]
        bloques = []
        for k, b in enumerate(bloques_d):
            fin_f = ini_f[k + 1] if k + 1 < len(ini_f) else total
            hasta = desdes[i][k + 1] if k + 1 < len(desdes[i]) else n
            dur = (fin_f - ini_f[k]) / FPS
            if dur < 0.5:
                err.append(f"{b['id']} [{i}]: dura {dur:.2f} s (mínimo 0,5 s)")
            elif dur < 1.5:
                avisos.append(f"{b['id']} [{i}]: dura {dur:.2f} s; el titular casi no se podrá leer")
            bloques.append({"id": b["id"], "ini_f": ini_f[k], "fin_f": fin_f, "ini_s": round(ini_f[k] / FPS, 2), "fin_s": round(fin_f / FPS, 2),
                            "titular": [str(t).strip().rstrip(".") for t in por_idioma(b["titular"], i)],
                            "texto": " ".join(P[j]["w"] for j in range(desdes[i][k], hasta)), "palabras": [desdes[i][k], hasta]})
        clave = re.sub(r"[^A-Z]", "", sin_tildes(cta[i]).upper())
        idx_cta = max(j for j, p in enumerate(P) if re.sub(r"[^A-Z]", "", sin_tildes(p["w"]).upper()) == clave)
        params_i = resolver({"tipo": "objeto", "campos": plantilla_def["params"]}, params, i, frame, corta)
        fuentes_pantalla = sorted(set(extra) | set(re.findall(r'"fuente": "([^"]+)"', json.dumps(params))))
        tema = dec.get("tema") or {}
        briefs[i] = {
            "version": 4,
            "base": d.name,
            "idioma": i,
            "carpeta": f"briefs/{d.name}/{i}",
            "audio": mat[i]["pj"].get("audio", "locucion.wav"),
            "marca": {"nombre": None if pendiente else marca_nombre, "pendiente": pendiente},
            "formato": formato,
            "video": {"width": WIDTH, "height": HEIGHT, "fps": FPS, "frames": total, "voz_s": round(mat[i]["voz_s"], 2), "cola_s": cola_s},
            "etiqueta": str(por_idioma(etiqueta, i)).strip().upper(),
            "cta": cta[i],
            "cta_f": frame(idx_cta),
            "cta_previo": tokens["textos_fijos"]["cta_previo"][i],
            "tema": {"id": tema.get("id", 0), "titulo": tema.get("titulo", ""), "tesis": tema.get("tesis", "")},
            "aviso_legal": tokens["textos_fijos"]["aviso_legal"][i] if aviso_legal else None,
            "ilustrativo": tokens["textos_fijos"]["ilustrativo"][i],
            "ambientes": ambientes,
            "fuentes": fuentes,
            "obra": obra_brief,
            "fuentes_en_pantalla": [{"id": f, "corta": corta(f)} for f in fuentes_pantalla],
            "bloques": bloques,
            "plantilla": {"id": formato, "md": f".claude/skills/reel-remodelacion/plantillas/{plantilla_def['md']}", "params": params_i},
            "tokens": tokens,
            "subtitulos": [[p["w"], p["ini"], p["fin"]] for p in P],
        }
    if err:
        return None, err, avisos
    return briefs, err, avisos


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


def main():
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)
    d = Path(sys.argv[1])
    briefs, err, avisos = preparar(d)
    for a in avisos:
        print(f"  aviso: {a}")
    if err:
        print("ERRORES (corrige decisiones.json y vuelve a ejecutar):\n - " + "\n - ".join(err))
        sys.exit(1)
    for i, brief in briefs.items():
        (d / i / "brief.json").write_text(json.dumps(brief, ensure_ascii=False, indent=1), encoding="utf-8")
        a = ", ".join(f"{k}={v}" for k, v in brief["ambientes"].items() if v != "lino") or "todo lino"
        print(f"[{i}] brief.json listo · {brief['video']['frames']} frames ({brief['video']['voz_s']} s de voz + {brief['video']['cola_s']} s) · "
              f"formato {brief['formato']} · obra {brief['obra']['id'] if brief['obra'] else 'ninguna (animación pura)'} · ambientes {a}")
        for b in brief["bloques"]:
            print(f"  {b['id']:<10} {b['ini_f']:>5}–{b['fin_f']:<5} {b['titular'][0]} / {b['titular'][1]}")
        if "--stills" in sys.argv:
            comp = f"Reel-{i}"
            marcas = [(b["id"], (b["ini_f"] + b["fin_f"]) // 2) for b in brief["bloques"]]
            prev = None
            for b in brief["bloques"]:
                amb = brief["ambientes"].get(b["id"], "lino")
                if prev is not None and amb != prev:
                    marcas.append((f"transicion_{b['id']}", b["ini_f"]))
                prev = amb
            for nombre, f in anclas_f(brief["plantilla"]["params"], "plantilla_"):
                marcas.append((nombre, min(f + 8, brief["video"]["frames"] - 1)))
            marcas.append(("palabra_clave", min(brief["cta_f"] + 10, brief["video"]["frames"] - 1)))
            marcas.append(("final", brief["video"]["frames"] - 1))
            for nombre, f in marcas:
                print(f"npx remotion still {comp} out/stills/{i}/{nombre}.png --frame={f}")


if __name__ == "__main__":
    main()
