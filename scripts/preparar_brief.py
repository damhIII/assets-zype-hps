#!/usr/bin/env python3
"""Convierte tus decisiones de dirección en el brief con frames exactos que lee el proyecto Remotion.

Uso:
  python3 scripts/preparar_brief.py briefs/<BASE>            # valida decisiones.json y escribe brief.json
  python3 scripts/preparar_brief.py briefs/<BASE> --stills   # además imprime los comandos de stills de revisión

Entrada (en briefs/<BASE>/):
  guion.txt, palabras.json, locucion.wav  → los deja el notebook de Colab
  subtitulos.json                         → scripts/alinear.py (se genera solo si falta)
  decisiones.json                         → lo escribes tú (formato en .claude/skills/zype-reel/referencias/decisiones.md)
Salida: briefs/<BASE>/brief.json (versión 3), la única fuente de datos del proyecto (cópialo a src/brief.json).
Las anclas ("desde", "en") son índices de palabra del guion: los [n] que imprime alinear.py.
"""
import json, math, re, sys, unicodedata
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(Path(__file__).resolve().parent))
import alinear  # noqa: E402

FPS, WIDTH, HEIGHT = 30, 1080, 1920
ORDEN = ["problema", "hoy", "criterio", "sistema", "resultado", "cta"]
PLANTILLAS = {"estandar", "dividida", "calculadora", "dato", "circulo"}
COLORES_DEF = {"alerta": "#E5484D", "exito": "#30A46C"}


def sin_tildes(s):
    return unicodedata.normalize("NFD", str(s)).encode("ascii", "ignore").decode().lower()


def slug(s):
    return re.sub(r"[^a-z0-9]+", "_", sin_tildes(s)).strip("_")


def leer(p):
    return json.loads(Path(p).read_text(encoding="utf-8"))


def generica(estilo):
    e = (estilo or "").lower()
    if any(w in e for w in ("manuscrit", "script", "caligr", "brush")):
        return "cursive"
    if "mono" in e:
        return "monospace"
    if "serif" in e and "sans" not in e:
        return "serif"
    return "sans-serif"


def css_fuente(familia):
    """Ruta (relativa al repo) del CSS cacheado de una familia en fonts/css/, o None."""
    carpeta = RAIZ / "fonts" / "css"
    hallados = sorted(carpeta.glob(f"{slug(familia)}__*.css")) if carpeta.is_dir() else []
    return str(hallados[0].relative_to(RAIZ)).replace("\\", "/") if hallados else None


def historial(base_actual):
    """Combinaciones de climas (no zype) de los videos anteriores, del más viejo al más nuevo."""
    carpeta = RAIZ / "briefs"
    nombres = [d.name for d in carpeta.iterdir() if d.is_dir() and d.name != base_actual] if carpeta.is_dir() else []
    nombres.sort(key=lambda d: (1, d) if re.fullmatch(r"\d{8}-\d{4}", d) else (0, d))
    out = []
    for n in nombres:
        for archivo in ("decisiones.json", "brief.json"):
            p = carpeta / n / archivo
            if p.is_file():
                try:
                    climas = leer(p).get("climas") or {}
                except ValueError:
                    break
                out.append(tuple(sorted((k, v) for k, v in climas.items() if v != "zype")))
                break
    return out


def preparar(dir_base):
    d = Path(dir_base).resolve()
    err, avisos = [], []
    for f in ("guion.txt", "palabras.json", "decisiones.json"):
        if not (d / f).is_file():
            raise SystemExit(f"falta {d.name}/{f}")
    if not (d / "subtitulos.json").is_file():
        (d / "subtitulos.json").write_text(json.dumps(alinear.construir(d), ensure_ascii=False, indent=1), encoding="utf-8")
    sub, dec, pj = leer(d / "subtitulos.json"), leer(d / "decisiones.json"), leer(d / "palabras.json")
    paletas = leer(RAIZ / "brand" / "paletas.json")
    reglas, climas_cat = paletas["reglas_rotacion"], paletas["climas"]
    P = sub["palabras"]
    n = len(P)
    guion = (d / "guion.txt").read_text(encoding="utf-8")
    guion_n = sin_tildes(guion)

    voz_s = float(pj.get("duracion_s") or sub["duracion_s"])
    cola_s = float(dec.get("cola_s", 1.5))
    if not 0.5 <= cola_s <= 4:
        avisos.append(f"cola_s = {cola_s}: lo normal es 1-2 s")
    total = math.ceil((voz_s + cola_s) * FPS)

    def frame(i):
        return max(0, min(total - 1, round(P[max(0, min(n - 1, int(i)))]["ini"] * FPS)))

    # --- bloques
    bloques_d = dec.get("bloques") or []
    ids = [b.get("id") for b in bloques_d]
    if ids != ORDEN:
        err.append(f"los bloques deben ser {ORDEN} en ese orden (llegaron {ids})")
    desdes = []
    for k, b in enumerate(bloques_d):
        try:
            x = int(b.get("desde"))
        except (TypeError, ValueError):
            err.append(f"{b.get('id')}: 'desde' debe ser un índice de palabra")
            x = 0
        if k == 0 and x != 0:
            err.append("el primer bloque debe empezar en la palabra 0")
        if not 0 <= x < n:
            err.append(f"{b.get('id')}: 'desde' {x} fuera del guion (0-{n - 1})")
        if desdes and x <= desdes[-1]:
            err.append(f"{b.get('id')}: 'desde' {x} no es mayor que el del bloque anterior ({desdes[-1]})")
        desdes.append(x)
        tit = b.get("titular") or []
        if len(tit) != 2 or not all(str(t).strip() for t in tit):
            err.append(f"{b.get('id')}: el titular necesita 2 líneas con texto")
        for linea in tit:
            if len(str(linea).split()) > 4:
                err.append(f"{b.get('id')}: titular demasiado largo ('{linea}', máximo 4 palabras por línea)")
            if str(linea).strip().endswith("."):
                avisos.append(f"{b.get('id')}: el titular no lleva punto final ('{linea}')")

    cta = str(dec.get("cta") or "").strip().upper()
    if not cta:
        err.append("falta 'cta' (la palabra clave que dice la voz al final)")
    elif sin_tildes(cta) not in guion_n:
        err.append(f"la palabra CTA '{cta}' no aparece en el guion")
    if bloques_d and bloques_d[-1].get("id") == "cta" and cta:
        if sin_tildes(cta) not in sin_tildes(" ".join(map(str, bloques_d[-1].get("titular") or []))):
            err.append(f"la línea 2 del titular del bloque cta debe ser la palabra {cta}")

    plantilla = dec.get("plantilla", "estandar")
    if plantilla not in PLANTILLAS:
        err.append(f"plantilla desconocida: {plantilla} (válidas: {', '.join(sorted(PLANTILLAS))})")
    if plantilla == "dato" and not str(dec.get("fuente_en_pantalla") or "").strip():
        err.append("la plantilla 'dato' necesita 'fuente_en_pantalla' (de editorial/datos_verificados.json)")
    hps = bool(dec.get("hps"))
    if hps and "hitch" not in guion_n:
        avisos.append("hps = true pero la voz no nombra a Hitch Point Studio: confirma que el sello encaja")
    if not hps and "hitch point" in guion_n:
        avisos.append("la voz nombra a Hitch Point Studio y hps = false: lo normal es activar el sello")

    # --- climas
    climas = {b: "zype" for b in ORDEN}
    climas.update(dec.get("climas") or {})
    for bid, cid in climas.items():
        if bid not in ORDEN:
            err.append(f"clima para un bloque que no existe: {bid}")
        elif cid not in climas_cat:
            err.append(f"clima desconocido en {bid}: {cid}")
        elif cid != "zype" and bid not in climas_cat[cid].get("bloques", []):
            err.append(f"el clima {cid} no se usa en {bid} (solo en {', '.join(climas_cat[cid].get('bloques', []))})")
    for bid in reglas["fijos_zype"]:
        if climas.get(bid) != "zype":
            err.append(f"el bloque {bid} va siempre en clima zype")
    distintos = [c for c in climas.values() if c != "zype"]
    if len(distintos) > reglas["max_climas_distintos_de_zype"]:
        err.append(f"{len(distintos)} bloques con clima distinto de zype (máximo {reglas['max_climas_distintos_de_zype']})")
    if hps and climas.get("criterio") in reglas.get("sin_hps_en_criterio", []):
        err.append(f"clima {climas['criterio']} en CRITERIO con sello HPS: el teal HPS se pierde")
    firma = tuple(sorted((k, v) for k, v in climas.items() if v != "zype"))
    recientes = historial(d.name)[-reglas.get("evitar_repetir_ultimas", 3):]
    if firma and firma in recientes:
        avisos.append(f"la combinación de climas {dict(firma)} ya salió en uno de los últimos {len(recientes)} videos")

    # --- negocio y estética
    neg = dec.get("negocio") or {}
    if not str(neg.get("rubro") or "").strip():
        err.append("falta 'negocio.rubro'")
    nombre = str(neg.get("nombre_mostrado") or "").strip()
    if nombre and sin_tildes(nombre) in guion_n:
        err.append(f"la voz pronuncia el nombre del negocio '{nombre}': elige otro nombre para el mockup")
    neg.setdefault("moneda", "$")
    est, est_id = None, (dec.get("estetica_negocio") or {}).get("paleta_id")
    fuentes = [("zype", "Montserrat", "sans-serif")]
    if hps:
        fuentes += [("hps_serif", "Playfair Display", "serif"), ("hps_mono", "Space Mono", "monospace")]
    if est_id:
        p = paletas["paletas_negocio"].get(est_id)
        if not p:
            err.append(f"paleta de negocio desconocida: {est_id} (válidas: {', '.join(paletas['paletas_negocio'])})")
        else:
            pal = dict(p["paleta"])
            pal.setdefault("secundario", pal["primario"])
            pal.setdefault("texto_suave", pal["texto"])
            for k, v in COLORES_DEF.items():
                pal.setdefault(k, v)
            tip = p["tipografia"]
            stacks = {}
            for rol in ("titulos", "texto"):
                fam, gen = tip[rol]["google_font"], generica(tip[rol].get("estilo"))
                fuentes.append((f"negocio_{rol}", fam, gen))
                stacks[rol] = f'"{fam}", {gen}' if css_fuente(fam) else gen
            est = {"origen": "curada", "paleta_id": est_id, "paleta": pal, "tipografia": stacks,
                   "lenguaje_visual": p.get("lenguaje_visual", {})}
            rubro = sin_tildes(neg.get("rubro", ""))
            if p.get("rubros") and not any(r in rubro for r in p["rubros"]):
                avisos.append(f"la paleta {est_id} está pensada para {', '.join(p['rubros'][:4])}…, no para '{neg.get('rubro')}'")
    lista_fuentes, vistas = [], set()
    for rol, fam, gen in fuentes:
        css = css_fuente(fam)
        if not css and fam not in vistas:
            avisos.append(f"la fuente {fam} no está en fonts/css/: se usará {gen}")
        vistas.add(fam)
        lista_fuentes.append({"rol": rol, "familia": fam, "css": css, "stack": f'"{fam}", {gen}' if css else gen})

    if err:
        return None, err, avisos

    # --- frames
    ini_f = [0] + [frame(x) for x in desdes[1:]]
    bloques = []
    for k, b in enumerate(bloques_d):
        fin_f = ini_f[k + 1] if k + 1 < len(ini_f) else total
        hasta = desdes[k + 1] if k + 1 < len(desdes) else n
        item = {"id": b["id"], "ini_f": ini_f[k], "fin_f": fin_f, "ini_s": round(ini_f[k] / FPS, 2), "fin_s": round(fin_f / FPS, 2),
                "titular": [str(t).strip().rstrip(".") for t in b["titular"]],
                "texto": " ".join(P[i]["w"] for i in range(desdes[k], hasta)), "palabras": [desdes[k], hasta]}
        dur = (fin_f - ini_f[k]) / FPS
        if dur < 0.5:
            err.append(f"{b['id']}: dura {dur:.2f} s (mínimo 0,5 s)")
        elif dur < 1.5:
            avisos.append(f"{b['id']}: dura {dur:.2f} s; el titular casi no se podrá leer")
        if b.get("pasos"):
            pasos = b["pasos"]
            if not 2 <= len(pasos) <= 4:
                avisos.append(f"{b['id']}: {len(pasos)} pasos (lo normal son 3-4)")
            textos, frames_p = [], []
            for j, ps in enumerate(pasos):
                ps = ps if isinstance(ps, dict) else {"texto": str(ps)}
                textos.append(str(ps.get("texto", "")).strip())
                en = ps.get("en")
                if en is None or not desdes[k] <= int(en) < hasta:
                    if en is not None:
                        avisos.append(f"{b['id']}: el paso '{textos[-1]}' se ancla fuera del bloque; se reparte uniforme")
                    frames_p.append(round(ini_f[k] + (fin_f - ini_f[k]) * (j + 0.5) / len(pasos)))
                else:
                    frames_p.append(frame(en))
            item["pasos"], item["pasos_f"] = textos, frames_p
        bloques.append(item)
    if err:
        return None, err, avisos

    tema = dec.get("tema") or {}
    brief = {
        "version": 3,
        "base": d.name,
        "audio": pj.get("audio", "locucion.wav"),
        "video": {"width": WIDTH, "height": HEIGHT, "fps": FPS, "frames": total, "voz_s": round(voz_s, 2), "cola_s": cola_s},
        "nicho_header": str(dec.get("nicho_header") or sin_tildes(neg.get("rubro", "negocios")).upper()).strip().upper(),
        "cta": cta,
        "plantilla": plantilla,
        "hps": hps,
        "logos": {"zype": (RAIZ / "logo_transparente.png").is_file(), "hps": (RAIZ / "logo_hps.png").is_file()},
        "tema": {"id": tema.get("id", 0), "titulo": tema.get("titulo", ""), "tesis": tema.get("tesis", "")},
        "fuente_en_pantalla": str(dec.get("fuente_en_pantalla") or "").strip(),
        "climas": climas,
        "estetica_negocio": est,
        "fuentes": lista_fuentes,
        "negocio": neg,
        "bloques": bloques,
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
    (d / "brief.json").write_text(json.dumps(brief, ensure_ascii=False, indent=1), encoding="utf-8")
    c = ", ".join(f"{k}={v}" for k, v in brief["climas"].items() if v != "zype") or "todo zype"
    print(f"brief.json listo · {brief['video']['frames']} frames ({brief['video']['voz_s']} s de voz + {brief['video']['cola_s']} s) · "
          f"plantilla {brief['plantilla']} · HPS {brief['hps']} · climas {c}")
    for b in brief["bloques"]:
        print(f"  {b['id']:<10} {b['ini_f']:>5}–{b['fin_f']:<5} {b['titular'][0]} / {b['titular'][1]}")
    if "--stills" in sys.argv:
        marcas = [(b["id"], (b["ini_f"] + b["fin_f"]) // 2) for b in brief["bloques"]]
        prev = None
        for b in brief["bloques"]:
            c = brief["climas"].get(b["id"], "zype")
            if prev is not None and c != prev:
                marcas.append((f"transicion_{b['id']}", b["ini_f"]))
            prev = c
        for b in brief["bloques"]:
            for j, f in enumerate(b.get("pasos_f", [])):
                marcas.append((f"{b['id']}_paso{j + 1}", min(f + 8, b["fin_f"] - 1)))
        marcas.append(("final", brief["video"]["frames"] - 1))
        for nombre, f in marcas:
            print(f"npx remotion still Video out/stills/{nombre}.png --frame={f}")


if __name__ == "__main__":
    main()
