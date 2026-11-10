#!/usr/bin/env python3
"""Tiñe SVGs de ui/ y textures/ (que traen los colores del ambiente base 'lino') con los colores de otro ambiente.

Uso:
  python3 scripts/tenir_svg.py --ambiente noche ui/flow_node.svg ui/kpi_card.svg --out <proyecto>/public/ambientes
  → <proyecto>/public/ambientes/noche/ui/flow_node.svg, ...

El foco (#F2B544) no se toca: es constante del marco en todos los ambientes.
Los ambientes salen de .claude/skills/reel-remodelacion/diseno/tokens.json → ambientes.
"""
import argparse, json, re
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
TOKENS = RAIZ / ".claude" / "skills" / "reel-remodelacion" / "diseno" / "tokens.json"

# rol del token en el ambiente base cuyos colores aparecen en los SVG
ROLES = ("superficie", "linea", "estructura", "texto", "texto_suave", "alerta", "exito", "primario")


def mapa(tokens, ambiente):
    base = tokens["ambientes"]["lino"]
    destino = tokens["ambientes"][ambiente]
    m = {base[r].upper(): destino[r] for r in ROLES if r in base and r in destino}
    c = tokens["color"]
    m.setdefault(c["superficie_2"].upper(), destino["superficie"])
    m.setdefault(c["secundario"].upper(), destino["estructura"])
    return m


def tenir(svg, m):
    return re.sub(r"#[0-9A-Fa-f]{6}\b", lambda x: m.get(x.group(0).upper(), x.group(0)), svg)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--ambiente", required=True)
    ap.add_argument("--out", default="public/ambientes")
    ap.add_argument("--tokens", default=str(TOKENS))
    ap.add_argument("archivos", nargs="+", help="rutas relativas a la raíz del repo (ui/..., textures/...)")
    a = ap.parse_args()
    tokens = json.loads(Path(a.tokens).read_text(encoding="utf-8"))
    ambientes = [k for k in tokens["ambientes"] if not k.startswith("_")]
    if a.ambiente not in ambientes:
        raise SystemExit(f"Ambiente desconocido: {a.ambiente}. Disponibles: {', '.join(ambientes)}")
    m = mapa(tokens, a.ambiente)
    for rel in a.archivos:
        src = RAIZ / rel
        dst = Path(a.out) / a.ambiente / rel
        dst.parent.mkdir(parents=True, exist_ok=True)
        dst.write_text(tenir(src.read_text(encoding="utf-8"), m), encoding="utf-8")
        print(f"{rel} → {dst}")


if __name__ == "__main__":
    main()
