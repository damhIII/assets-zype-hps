#!/usr/bin/env python3
"""Revisión visual barata: prepara el proyecto, renderiza los stills de revisión con un solo bundle y los junta en hojas
de contactos (8 por hoja) con su nombre, frame y la zona segura dibujada (x 72–940, y 220–1580).

Uso:
  python3 scripts/revisar.py briefs/<BASE>                    # todos los momentos clave → out/stills/hoja_N.png
  python3 scripts/revisar.py briefs/<BASE> --solo cta,plantilla   # solo esos nombres o prefijos (tras corregir algo concreto)

Mira las hojas; abre un still a tamaño completo (out/stills/<nombre>.png) solo si en la hoja algo parece mal.
"""
import os, subprocess, sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(Path(__file__).resolve().parent))
import preparar_brief  # noqa: E402
import preparar_proyecto  # noqa: E402

COLS, FILAS, TW, TH, ROT = 4, 2, 360, 640, 40


def hojas(brief, marcas, carpeta: Path):
    try:
        from PIL import Image, ImageDraw, ImageFont
    except ImportError:
        subprocess.run([sys.executable, "-m", "pip", "install", "-q", "--break-system-packages", "pillow"], check=False)
        from PIL import Image, ImageDraw, ImageFont
    try:
        fuente = ImageFont.truetype("DejaVuSans-Bold.ttf", 20)
    except OSError:
        fuente = ImageFont.load_default()
    tv = brief["tokens"]["zonas_seguras"]["texto_vital"]
    k = TW / brief["video"]["width"]
    salidas = []
    n_hojas = -(-len(marcas) // (COLS * FILAS))
    por_hoja = -(-len(marcas) // n_hojas)          # reparte por igual: nada de una hoja con un solo still
    for h in range(0, len(marcas), por_hoja):
        grupo = marcas[h:h + por_hoja]
        filas = (len(grupo) + COLS - 1) // COLS
        hoja = Image.new("RGB", (COLS * TW + (COLS + 1) * 8, filas * (TH + ROT) + (filas + 1) * 8), (24, 22, 20))
        d = ImageDraw.Draw(hoja)
        for i, (nombre, f) in enumerate(grupo):
            x, y = 8 + (i % COLS) * (TW + 8), 8 + (i // COLS) * (TH + ROT + 8)
            im = Image.open(carpeta / f"{nombre}.png").convert("RGB").resize((TW, TH), Image.LANCZOS)
            hoja.paste(im, (x, y + ROT))
            caja = [x + tv["x_min"] * k, y + ROT + tv["y_min"] * k, x + tv["x_max"] * k, y + ROT + tv["y_max"] * k]
            d.rectangle(caja, outline=(0, 200, 255), width=1)
            d.text((x + 6, y + 9), f"{nombre} · f{f} · {f / brief['video']['fps']:.1f}s", fill=(240, 236, 230), font=fuente)
        p = carpeta / f"hoja_{h // por_hoja + 1}.png"
        hoja.save(p)
        salidas.append(p)
    return salidas


def main():
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)
    base = sys.argv[1]
    brief = preparar_proyecto.preparar(base, silencioso=True)
    marcas = preparar_brief.marcas_stills(brief)
    if "--solo" in sys.argv:
        quiero = sys.argv[sys.argv.index("--solo") + 1].split(",")
        marcas = [m for m in marcas if any(m[0] == q or m[0].startswith(q) for q in quiero)] or marcas
    carpeta = RAIZ / "out" / "stills"
    carpeta.mkdir(parents=True, exist_ok=True)
    for viejo in carpeta.glob("*.png"):
        viejo.unlink()
    r = subprocess.run(["node", "scripts/stills.mjs", str(carpeta), *[f"{n}:{f}" for n, f in marcas]], cwd=RAIZ / "remotion",
                       capture_output=True, text=True)
    if r.returncode:
        print((r.stderr or r.stdout)[-2500:])
        sys.exit(1)
    salidas = hojas(brief, marcas, carpeta)
    print(f"{len(marcas)} stills · {len(salidas)} hojas: " + " ".join(str(p.relative_to(RAIZ)) for p in salidas))


if __name__ == "__main__":
    main()
