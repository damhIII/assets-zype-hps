#!/usr/bin/env python3
"""Valida el sistema de diseño (tokens.json de la skill): contrastes WCAG, foco y ambientes.

Uso: python3 scripts/validar_tokens.py [ruta]   (sale con código 1 si algo falla)
Hereda la lógica de contraste del antiguo validar_paletas.py.
"""
import colorsys, json, sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
RUTA = Path(sys.argv[1]) if len(sys.argv) > 1 else RAIZ / ".claude" / "skills" / "reel-remodelacion" / "diseno" / "tokens.json"


def lum(hx):
    r, g, b = (int(hx[i:i + 2], 16) / 255 for i in (1, 3, 5))
    f = lambda c: c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)


def contraste(a, b):
    la, lb = sorted((lum(a), lum(b)), reverse=True)
    return (la + 0.05) / (lb + 0.05)


def tono(hx):
    r, g, b = (int(hx[i:i + 2], 16) / 255 for i in (1, 3, 5))
    return colorsys.rgb_to_hls(r, g, b)[0] * 360


def dist_tono(a, b):
    d = abs(tono(a) - tono(b)) % 360
    return min(d, 360 - d)


def mezcla(a, b, alfa):
    """Color resultante de a con opacidad alfa sobre b."""
    A = [int(a[i:i + 2], 16) for i in (1, 3, 5)]
    B = [int(b[i:i + 2], 16) for i in (1, 3, 5)]
    return "#" + "".join(f"{round(x * alfa + y * (1 - alfa)):02X}" for x, y in zip(A, B))


def main():
    t = json.loads(RUTA.read_text(encoding="utf-8"))
    fallos, filas = [], []

    def chk(nombre, valor, minimo):
        ok = valor >= minimo
        filas.append(("OK " if ok else "XX ") + f"{nombre}: {valor:.2f} ≥ {minimo}")
        if not ok:
            fallos.append(f"{nombre}: {valor:.2f} (mínimo {minimo})")

    c = t["color"]
    for fondo in ("fondo_a", "fondo_b"):
        chk(f"base texto/{fondo}", contraste(c["texto"], c[fondo]), 7)
        chk(f"base texto_suave/{fondo}", contraste(c["texto_suave"], c[fondo]), 4.5)
        chk(f"base estructura/{fondo} (trazos)", contraste(c["estructura"], c[fondo]), 3)
        chk(f"base primario/{fondo} (gráfico)", contraste(c["primario"], c[fondo]), 3)
        chk(f"base alerta/{fondo} (texto)", contraste(c["alerta"], c[fondo]), 4.5)
        chk(f"base exito/{fondo} (texto)", contraste(c["exito"], c[fondo]), 4.5)
    chk("texto blanco sobre primario", contraste("#FFFFFF", c["primario"]), 4.5)
    chk("texto_sobre_foco / foco (marcador)", contraste(c["texto_sobre_foco"], c["foco"]), 7)
    chk("alerta lejos del primario (grados de tono)", dist_tono(c["alerta"], c["primario"]), 20)
    chk("foco lejos del primario (grados de tono)", dist_tono(c["foco"], c["primario"]), 15)

    s = t["subtitulos"]
    for fondo in (c["fondo_a"], t["ambientes"]["noche"]["fondo_a"]):
        cap = mezcla(s["capsula"], fondo, s["capsula_opacidad"])
        chk(f"subtítulo activo / cápsula sobre {fondo}", contraste(s["activo"], cap), 7)
        chk(f"subtítulo pasado / cápsula sobre {fondo}", contraste(s["pasado"], cap), 7)
        chk(f"subtítulo futuro / cápsula sobre {fondo}", contraste(s["futuro"], cap), 4.5)

    for aid, a in t["ambientes"].items():
        if aid.startswith("_"):
            continue
        for fondo in ("fondo_a", "fondo_b"):
            chk(f"ambiente {aid} texto/{fondo}", contraste(a["texto"], a[fondo]), 7)
            chk(f"ambiente {aid} texto_suave/{fondo}", contraste(a["texto_suave"], a[fondo]), 4.5)
            chk(f"ambiente {aid} estructura/{fondo}", contraste(a["estructura"], a[fondo]), 3)
            chk(f"ambiente {aid} alerta/{fondo}", contraste(a["alerta"], a[fondo]), 4.5)
            chk(f"ambiente {aid} exito/{fondo}", contraste(a["exito"], a[fondo]), 4.5)
            chk(f"ambiente {aid} primario/{fondo}", contraste(a["primario"], a[fondo]), 3)
        chk(f"ambiente {aid} superficie≠fondo", contraste(a["superficie"], a["fondo_a"]), 1.03)
        if a["tipo"] == "oscuro":
            chk(f"ambiente {aid} foco/fondo_a", contraste(c["foco"], a["fondo_a"]), 7)
        if not (RAIZ / a["textura"]).is_file():
            fallos.append(f"ambiente {aid}: no existe la textura {a['textura']}")

    for eid, e in t["estilos_interior"].items():
        if eid.startswith("_"):
            continue
        chk(f"estilo {eid} piso≠muro", contraste(e["piso"], e["muro"]), 1.15)

    for rol in ("display", "texto"):
        css = t["tipografia"][rol]["css"]
        if not (RAIZ / css).is_file():
            fallos.append(f"tipografía {rol}: no existe {css}")

    print("\n".join(filas))
    print(f"\n{len(filas) - len([f for f in fallos if ':' in f and 'mínimo' in f])}/{len(filas)} comprobaciones OK")
    if fallos:
        print("\nFALLOS:\n - " + "\n - ".join(fallos))
        sys.exit(1)


if __name__ == "__main__":
    main()
