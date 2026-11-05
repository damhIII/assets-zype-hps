# assets-zype-hps

Repositorio de los Reels de Instagram de **ZYPE** (Digital Execution Studio) y **Hitch Point Studio (HPS)**. Contiene los assets gráficos, las paletas y las instrucciones para construir los videos con Remotion.

## Cómo llega un encargo
El notebook de Colab escribe el guion, genera la locución y deja un `brief.json` (en `briefs/<BASE>/` o adjunto en el chat). Para construir el video, usa la skill **zype-reel** (`.claude/skills/zype-reel/SKILL.md`): ahí están la marca, el layout, las plantillas, los climas de color y la parte técnica.

## Estructura
- `icons/` Lucide (trazo, `currentColor`) · `logos/` canales y herramientas (monocromos) → siempre con máscara CSS.
- `ui/`, `illus/`, `textures/` SVG con los colores ZYPE fijos → teñirlos con `scripts/tenir_svg.py` si el clima no es zype.
- `fonts/css/` `@font-face` con woff2 en base64 (los `.ttf` sueltos no se usan).
- `logo_transparente.png` (ZYPE), `logo_hps.png` (HPS).
- `brand/paletas.json` climas de escena y paletas de negocio · `scripts/` validadores y utilidades.
- `briefs/<BASE>/` brief + locución de cada video (los sube el notebook).

## Reglas que valen siempre
- El marco ZYPE (barra de progreso, header, titular, subtítulos, CTA, logo) es fijo en todos los videos; solo cambia el clima de la escena.
- Nunca logos, nombre real ni fotos reales del negocio del video.
- Determinismo: nada de `Math.random()` en Remotion.

## Qué se edita dónde
- Los assets, `brand/paletas.json`, `manifest.json` y `README.md` llegan desde Drive con el notebook: si los cambias aquí, el siguiente sync los sobrescribe. Cámbialos en Drive.
- `CLAUDE.md`, `.claude/` y `scripts/` viven solo aquí: edítalos en GitHub.
- Tras tocar `brand/paletas.json`, ejecuta `python3 scripts/validar_paletas.py`.
