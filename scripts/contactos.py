#!/usr/bin/env python3
"""Regenera contactos.png: hoja con todos los assets gráficos del repo (logo de la marca, iconos, logos de canales, ui, texturas).

Uso: python3 scripts/contactos.py            (necesita rsvg-convert y Pillow: apt install librsvg2-bin · pip install pillow)
Ejecútalo cada vez que añadas o cambies assets en icons/, logos/, ui/ o textures/.
"""
import subprocess, sys, io, re
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

RAIZ = Path(__file__).resolve().parent.parent
OUT = RAIZ / "contactos.png"
# colores del ambiente base "lino" (concreto) de tokens.json
BG, CARD, TXT, SUB, TITULO = (236, 229, 220), (255, 255, 255), (36, 31, 28), (133, 119, 106), (200, 20, 20)
def F(s, b=False):
    try:
        return ImageFont.truetype("DejaVuSans%s.ttf" % ("-Bold" if b else ""), s)
    except OSError:
        return ImageFont.load_default()

def render(svg, w, h, color=None, tile=False):
    data = svg.read_text(encoding="utf-8")
    if color:  # iconos con currentColor y logos monocromos en blanco → color legible sobre tarjeta clara
        data = data.replace("currentColor", color).replace('fill="#FFFFFF"', f'fill="{color}"')
    if tile:  # texturas: patrón en un lienzo grande
        m = re.search(r"<svg([^>]*)>", data)
        data = re.sub(r'\swidth="[^"]*"|\sheight="[^"]*"', "", data[:m.end()]) .replace("<svg", f'<svg width="{w}" height="{h}"', 1) + data[m.end():]
    png = subprocess.run(["rsvg-convert", "-w", str(w), "-h", str(h), "--keep-aspect-ratio"], input=data.encode(), capture_output=True).stdout
    return Image.open(io.BytesIO(png)).convert("RGBA")

secciones = [("icons", "ICONOS (Lucide · máscara CSS)", 9, 96, "#85776A", False),
             ("logos", "LOGOS de canales y herramientas (máscara CSS)", 9, 96, "#241F1C", False),
             ("ui", "UI (ambiente lino · teñir con scripts/tenir_svg.py)", 5, 190, None, False),
             ("textures", "TEXTURAS (opacidad baja)", 5, 190, None, True)]
W, M = 1800, 30
bloques = []
for carpeta, titulo, cols, cel, color, tile in secciones:
    files = sorted((RAIZ / carpeta).glob("*.svg"))
    if not files:
        continue
    cw = (W - 2 * M) // cols
    ch = cel + 34
    filas = -(-len(files) // cols)
    img = Image.new("RGB", (W, 60 + filas * ch + 10), BG)
    d = ImageDraw.Draw(img)
    d.text((M, 18), f"{titulo} · {len(files)}", font=F(26, True), fill=SUB)
    for i, f in enumerate(files):
        x, y = M + (i % cols) * cw, 60 + (i // cols) * ch
        d.rounded_rectangle([x + 4, y, x + cw - 4, y + cel], 12, fill=CARD)
        try:
            pad = 18 if cel < 120 else 12
            im = render(f, cw - 8 - 2 * pad if tile else cel - 2 * pad, cel - 2 * pad, color, tile)
            img.paste(im, (x + 4 + (cw - 8 - im.width) // 2, y + (cel - im.height) // 2), im)
        except Exception as e:
            d.text((x + 10, y + 10), "error", font=F(14), fill=(229, 72, 77))
        nombre = f.stem if len(f.stem) <= (cw // 11) else f.stem[: cw // 11 - 1] + "…"
        d.text((x + cw // 2, y + cel + 6), nombre, font=F(15), fill=TXT, anchor="ma")
    bloques.append(img)
# logo de la marca (PNG en brand/en_bruto/, con <Img>): cada variante sobre el fondo para el que está hecha
logos = [("logo_fondo_claro", BG), ("logo_fondo_claro_sin_lema", BG), ("logo_fondo_oscuro", (42, 36, 33)), ("logo_fondo_oscuro_sin_lema", (42, 36, 33))]
logos = [(RAIZ / "brand/en_bruto" / f"{n}.png", fondo) for n, fondo in logos if (RAIZ / "brand/en_bruto" / f"{n}.png").is_file()]
if logos:
    cw, cel = (W - 2 * M) // 2, 230
    img = Image.new("RGB", (W, 60 + -(-len(logos) // 2) * (cel + 34) + 10), BG)
    d = ImageDraw.Draw(img)
    d.text((M, 18), "LOGO EN BRUTO (brand/en_bruto · <Img>, nunca máscara)", font=F(26, True), fill=SUB)
    for i, (f, fondo) in enumerate(logos):
        x, y = M + (i % 2) * cw, 60 + (i // 2) * (cel + 34)
        d.rounded_rectangle([x + 4, y, x + cw - 4, y + cel], 12, fill=fondo if fondo != BG else CARD)
        im = Image.open(f).convert("RGBA")
        im.thumbnail((cw - 80, cel - 50))
        img.paste(im, (x + (cw - im.width) // 2, y + (cel - im.height) // 2), im)
        d.text((x + cw // 2, y + cel + 6), f.stem, font=F(15), fill=TXT, anchor="ma")
    bloques.insert(0, img)
alto = sum(b.height for b in bloques) + 80
hoja = Image.new("RGB", (W, alto), BG)
ImageDraw.Draw(hoja).text((M, 22), f"{RAIZ.name} · contactos", font=F(34, True), fill=TITULO)
y = 80
for b in bloques:
    hoja.paste(b, (0, y)); y += b.height
hoja.save(OUT, optimize=True)
print(OUT, hoja.size, OUT.stat().st_size // 1024, "KB")
