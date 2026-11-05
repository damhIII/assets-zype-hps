#!/usr/bin/env python3
"""Comprueba un brief.json antes de construir el video y, con --stills, imprime los comandos de revisión.

Uso:
  python3 scripts/validar_brief.py briefs/<BASE>/brief.json
  python3 scripts/validar_brief.py briefs/<BASE>/brief.json --stills   # un fotograma por bloque + cambios de clima
"""
import json, sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
ORDEN = ["problema", "hoy", "criterio", "sistema", "resultado", "cta"]


def main():
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)
    ruta = Path(sys.argv[1])
    b = json.loads(ruta.read_text(encoding="utf-8"))
    err, avisos = [], []
    paletas = json.loads((RAIZ / "brand" / "paletas.json").read_text(encoding="utf-8"))

    v = b.get("video", {})
    frames = v.get("frames")
    if (v.get("width"), v.get("height"), v.get("fps")) != (1080, 1920, 30):
        avisos.append(f"formato inesperado: {v.get('width')}x{v.get('height')} @ {v.get('fps')} fps")
    bloques = b.get("bloques", [])
    ids = [x["id"] for x in bloques]
    if ids != ORDEN:
        err.append(f"bloques fuera de orden o incompletos: {ids}")
    for i, x in enumerate(bloques):
        if x["fin_f"] <= x["ini_f"]:
            err.append(f"{x['id']}: rango vacío {x['ini_f']}–{x['fin_f']}")
        if i == 0 and x["ini_f"] != 0:
            err.append("el primer bloque no empieza en 0")
        if i and x["ini_f"] != bloques[i - 1]["fin_f"]:
            err.append(f"{x['id']}: no es contiguo con {bloques[i - 1]['id']}")
        if len(x.get("titular", [])) != 2:
            err.append(f"{x['id']}: el titular debe tener 2 líneas")
    if bloques and bloques[-1]["fin_f"] != frames:
        err.append(f"el último bloque acaba en {bloques[-1]['fin_f']} y el video dura {frames} frames")
    if bloques and b.get("cta") and b["cta"].lower() not in " ".join(bloques[-1]["titular"]).lower():
        avisos.append("la palabra CTA no está en el titular del bloque cta")

    climas = b.get("climas") or {}
    for bid, cid in climas.items():
        if cid not in paletas["climas"]:
            err.append(f"clima desconocido en {bid}: {cid}")
    if b.get("hps") and climas.get("criterio") in paletas["reglas_rotacion"].get("sin_hps_en_criterio", []):
        avisos.append(f"clima {climas['criterio']} en CRITERIO con sello HPS: el teal HPS pierde contraste")
    if not b.get("subtitulos"):
        avisos.append("el brief no trae 'subtitulos': genera los subtítulos desde bloques[].texto + palabras")
    for bid in paletas["reglas_rotacion"]["fijos_zype"]:
        if climas.get(bid, "zype") != "zype":
            err.append(f"el bloque {bid} debe ir en clima zype")

    base = ruta.parent
    audio = b.get("audio")
    if audio and not (base / audio).exists():
        avisos.append(f"audio {audio} no está junto al brief: búscalo entre los adjuntos del chat")
    for f in b.get("fuentes", []):
        if f.get("css") and not (RAIZ / f["css"]).exists():
            err.append(f"falta la fuente {f['familia']}: {f['css']}")
    for logo, archivo in (("zype", "logo_transparente.png"), ("hps", "logo_hps.png")):
        if (b.get("logos") or {}).get(logo) and not (RAIZ / archivo).exists():
            err.append(f"el brief espera {archivo} y no está en el repo")

    print(f"Brief {b.get('base')} · {frames} frames · plantilla {b.get('plantilla')} · HPS {b.get('hps')} · "
          f"climas {', '.join(f'{k}={c}' for k, c in climas.items() if c != 'zype') or 'todo zype'}")
    for a in avisos:
        print(f"  aviso: {a}")
    if err:
        print("ERRORES:\n - " + "\n - ".join(err))
        sys.exit(1)
    print("OK")

    if "--stills" in sys.argv:
        marcas = []
        for x in bloques:
            marcas.append((x["id"], (x["ini_f"] + x["fin_f"]) // 2))
        prev = None
        for x in bloques:  # mitad de cada transición de clima
            c = climas.get(x["id"], "zype")
            if prev is not None and c != prev:
                marcas.append((f"transicion_{x['id']}", x["ini_f"]))
            prev = c
        for nombre, f in marcas:
            print(f"npx remotion still Video out/stills/{nombre}.png --frame={f}")


if __name__ == "__main__":
    main()
