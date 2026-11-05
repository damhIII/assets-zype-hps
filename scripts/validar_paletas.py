#!/usr/bin/env python3
"""Valida brand/paletas.json: contrastes WCAG y distancia al amarillo ZYPE.

Uso: python3 scripts/validar_paletas.py [ruta]   (sale con código 1 si algo falla)
"""
import colorsys, json, sys
from pathlib import Path

RUTA = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).resolve().parent.parent / "brand" / "paletas.json"
AMARILLO = "#FFE600"


def lum(hx):
    r, g, b = (int(hx[i:i + 2], 16) / 255 for i in (1, 3, 5))
    f = lambda c: c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)


def contraste(a, b):
    la, lb = sorted((lum(a), lum(b)), reverse=True)
    return (la + 0.05) / (lb + 0.05)


def tono(hx):
    r, g, b = (int(hx[i:i + 2], 16) / 255 for i in (1, 3, 5))
    h, l, s = colorsys.rgb_to_hls(r, g, b)
    return h * 360, s


def dist_amarillo(hx):
    """Distancia de tono al amarillo ZYPE (grados). Los colores casi grises no compiten: devuelven 180."""
    h, s = tono(hx)
    if s < 0.25:
        return 180.0
    d = abs(h - tono(AMARILLO)[0]) % 360
    return min(d, 360 - d)


def main():
    data = json.loads(RUTA.read_text(encoding="utf-8"))
    fallos, filas = [], []

    def chk(nombre, cond, detalle):
        filas.append(("OK " if cond else "XX ") + f"{nombre}: {detalle}")
        if not cond:
            fallos.append(f"{nombre}: {detalle}")

    for cid, c in data["climas"].items():
        claro = c["tipo"] == "claro"
        for fondo in ("fondo_a", "fondo_b"):
            chk(f"clima {cid} texto/{fondo}", contraste(c["texto"], c[fondo]) >= 7, f"{contraste(c['texto'], c[fondo]):.1f} ≥ 7")
            chk(f"clima {cid} texto_suave/{fondo}", contraste(c["texto_suave"], c[fondo]) >= 4.5, f"{contraste(c['texto_suave'], c[fondo]):.1f} ≥ 4.5")
            chk(f"clima {cid} estructura/{fondo}", contraste(c["estructura"], c[fondo]) >= 4.5, f"{contraste(c['estructura'], c[fondo]):.1f} ≥ 4.5")
            # el acento vale como trazo (≥3 sobre el fondo) o como relleno con texto encima (≥4.5)
            ok_acento = contraste(c["acento"], c[fondo]) >= 3 or contraste(c["texto"], c["acento"]) >= 4.5
            chk(f"clima {cid} acento/{fondo}", ok_acento, f"trazo {contraste(c['acento'], c[fondo]):.1f} ≥ 3 o relleno {contraste(c['texto'], c['acento']):.1f} ≥ 4.5")
            if not claro:  # en climas claros el amarillo pasa a marcador detrás de texto oscuro
                chk(f"clima {cid} amarillo/{fondo}", contraste(AMARILLO, c[fondo]) >= 7, f"{contraste(AMARILLO, c[fondo]):.1f} ≥ 7")
        chk(f"clima {cid} superficie≠fondo", contraste(c["superficie"], c["fondo_a"]) >= 1.08, f"{contraste(c['superficie'], c['fondo_a']):.2f} ≥ 1.08")
        if cid != "zype":
            for k in ("estructura", "acento"):
                chk(f"clima {cid} {k} lejos del amarillo", dist_amarillo(c[k]) >= 22, f"{dist_amarillo(c[k]):.0f}° ≥ 22°")
        if claro:
            chk(f"clima {cid} amarillo marcador", contraste(c["texto"], AMARILLO) >= 7, f"texto sobre amarillo {contraste(c['texto'], AMARILLO):.1f} ≥ 7")

    for pid, p in data["paletas_negocio"].items():
        pal = p["paleta"]
        chk(f"negocio {pid} texto/fondo", contraste(pal["texto"], pal["fondo"]) >= 4.5, f"{contraste(pal['texto'], pal['fondo']):.1f}")
        chk(f"negocio {pid} texto/superficie", contraste(pal["texto"], pal["superficie"]) >= 4.5, f"{contraste(pal['texto'], pal['superficie']):.1f}")
        chk(f"negocio {pid} acento/fondo", contraste(pal["acento"], pal["fondo"]) >= 3, f"{contraste(pal['acento'], pal['fondo']):.1f}")
        sobre = max(("#FFFFFF", pal["texto"], pal["fondo"]), key=lambda t: contraste(t, pal["primario"]))
        chk(f"negocio {pid} botón primario", contraste(sobre, pal["primario"]) >= 4.5, f"{sobre} sobre primario {contraste(sobre, pal['primario']):.1f}")

    print("\n".join(filas))
    print(f"\n{len(filas) - len(fallos)}/{len(filas)} comprobaciones OK")
    if fallos:
        print("\nFALLOS:\n - " + "\n - ".join(fallos))
        sys.exit(1)


if __name__ == "__main__":
    main()
