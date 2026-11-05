#!/usr/bin/env python3
"""Tiñe SVGs de ui/ e illus/ (que traen los colores ZYPE fijos) con los colores de un clima.

Uso:
  python3 scripts/tenir_svg.py --clima brasa ui/flow_node.svg illus/empty_chair.svg --out public/climas
  → public/climas/brasa/ui/flow_node.svg, public/climas/brasa/illus/empty_chair.svg

El amarillo ZYPE (#FFE600), el rojo de alerta (#E5484D), el verde de éxito y el blanco NO se tocan:
son constantes de marca en todos los climas.
"""
import argparse, json, re
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent

# color ZYPE en el SVG original → rol del clima que lo sustituye
MAPA = {
    "#7FB8C8": "estructura",   # cian: bordes, líneas, trazos de ilustración
    "#0B6082": "acento",       # petróleo: rellenos secundarios
    "#1B2630": "superficie",   # tarjetas, celdas, burbujas entrantes
    "#0E1215": "fondo_a",      # fondo de tarjeta / grafito
    "#041420": "fondo_b",      # grafito profundo
    "#3B5B6D": "texto_suave",  # estrellas apagadas
    "#5E7480": "texto_suave",
    "#3A4652": "superficie",   # bisel del teléfono
}


def tenir(svg: str, clima: dict) -> str:
    def sub(m):
        rol = MAPA.get(m.group(0).upper())
        return clima[rol] if rol else m.group(0)
    return re.sub(r"#[0-9A-Fa-f]{6}\b", sub, svg)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--clima", required=True)
    ap.add_argument("--out", default="public/climas")
    ap.add_argument("--paletas", default=str(RAIZ / "brand" / "paletas.json"))
    ap.add_argument("archivos", nargs="+", help="rutas relativas a la raíz del repo (ui/..., illus/...)")
    a = ap.parse_args()
    climas = json.loads(Path(a.paletas).read_text(encoding="utf-8"))["climas"]
    if a.clima not in climas:
        raise SystemExit(f"Clima desconocido: {a.clima}. Disponibles: {', '.join(climas)}")
    clima = climas[a.clima]
    for rel in a.archivos:
        src = RAIZ / rel
        dst = Path(a.out) / a.clima / rel
        dst.parent.mkdir(parents=True, exist_ok=True)
        dst.write_text(tenir(src.read_text(encoding="utf-8"), clima), encoding="utf-8")
        print(f"{rel} → {dst}")


if __name__ == "__main__":
    main()
