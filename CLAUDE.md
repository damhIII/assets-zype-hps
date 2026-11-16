# Repo de Reels educativos de remodelación e interiores (Florida) · EN BRUTO

Contenido editorial, sistema de diseño, assets e instrucciones para dirigir y construir con Remotion los Reels de Instagram de **EN BRUTO**, una agencia de decoración, remodelación, construcción e interiores en Florida. Este pipeline hace **solo videos instructivos-educativos, en español y 100 % animados**: sin fotos de obras, sin casos reales de clientes. El nombre de la marca llega en `briefs/<BASE>/encargo.json → marca` (lo pone el notebook desde su constante `MARCA`).

## Cómo llega un encargo
El notebook de Colab (`Crear_reel_remodelacion.ipynb`) tiene un solo parámetro, `SEED_PROMPT` (tema, ideas sueltas, servicio a promocionar, ángulo… o vacío). Con él escribe el **guion** (GPT, que elige también el formato), lo **locuta** (Gemini TTS) y saca el **tiempo de cada palabra** (Whisper). Deja en `briefs/<BASE>/` (BASE = `AAAAMMDD-HHMM`, hora de Nueva York):
- `encargo.json`: marca, formato que eligió el guionista (`formato_guion`), idioma (`["es"]`) y seed.
- `es/guion.txt`, `es/locucion.wav`, `es/palabras.json` (versión 4).

Todo lo demás lo haces tú con la skill **reel-remodelacion** (`.claude/skills/reel-remodelacion/SKILL.md`): revisar el guion contra el ADN, decidir bloques, titulares, ambientes y parámetros de la plantilla del formato (`briefs/<BASE>/decisiones.json`), construir, revisar y renderizar.

## Estructura
- `editorial/`: marca y declaraciones permitidas (`marca.md`), ADN y checklist (`adn.md`), temas (`temas.json`), los 7 formatos (`formatos.json`), datos con fuente (`datos_verificados.json`: solo valen los `verificado: true`), prompt del guionista (`prompt_guion.md`) y perfil de voz (`voz_tts.md`).
- `.claude/skills/reel-remodelacion/`: la skill, `plantillas/` (una ficha por formato + `plantillas.json` con sus parámetros), `diseno/tokens.json` (rojo del logo como acento + paleta cálida de apoyo con matices intermedios, tipografías, logos, tamaños, márgenes seguros, movimiento) y `referencias/`.
- `brand/en_bruto/`: **logo oficial de EN BRUTO** (PNG transparente) en variantes para fondo claro y oscuro, con y sin lema. Va en el header y en el CTA de cada video, con `<Img>`, sin teñir ni deformar. (`logo_transparente.png`, `logo_hps.png` y `brand/paletas.json` de la raíz son de otra marca: no los uses aquí.)
- `icons/` Lucide y Tabler (`tb-*`), de trazo y `currentColor` · `logos/` canales (monocromos) → siempre con máscara CSS.
- `illus/planta/`: símbolos de planta 2D a escala real (1 unidad = 1 cm; medidas en `catalogo.json`) · `illus/emoji/`: emoji Fluent de Microsoft (`flat/` SVG, `3d/` PNG) para pegatinas puntuales.
- `audio/`: efectos (`sfx/`) y música de fondo (`musica/`) con licencia CC0, normalizados; qué hay y de dónde sale en `audio/catalogo.json`. Cómo usarlos: `referencias/audio.md`.
- `ui/`, `textures/` (incluidos los materiales `mat_*`: azulejo, madera, ladrillo, terrazo…): SVG en los colores del ambiente `lino` → para otros ambientes, `scripts/tenir_svg.py`.
- `contactos.png`: hoja con todos los assets gráficos (logo incluido). Ábrela antes de diseñar.
- `fonts/css/`: `@font-face` con woff2 en base64 (se usan Barlow Condensed, DM Sans y Space Mono).
- `scripts/`: `alinear.py` (guion ↔ voz), `preparar_brief.py` (decisiones → brief con frames), `validar_repo.py` (editorial y plantillas), `validar_tokens.py` (contrastes), `tenir_svg.py`, `contactos.py`.
- `briefs/<BASE>/`: lo que sube el notebook + tus decisiones y el brief generado.

## Reglas que valen siempre
- **Videos educativos**: cada uno enseña algo concreto. Los ejemplos son hipotéticos; nunca casos de clientes ni proyectos presentados como reales.
- **Nunca inventar datos**: ninguna cifra (precio, plazo, porcentaje, norma) en pantalla sin un dato `verificado: true`. Lo ilustrativo se marca.
- **La marca coordina, no ejecuta**: nunca "construimos", "remodelamos", "instalamos". Nada de licencia, seguro o garantías salvo lo que `marca.md → Declaraciones permitidas` marque con `si`.
- **Animación pura**: nada de fotos ni videos (de obras, de bancos de imágenes o de internet), ni logos de contratistas o fabricantes.
- El marco (barra de progreso, header con logo, titular, subtítulos, CTA con logo) es fijo; solo cambian el ambiente y la escena.
- **El cierre manda al perfil y al enlace de la bio**: nada de palabras clave, "comenta", DM ni enlace de la descripción.
- **Duración**: el guionista elige entre 30 y 60 s de voz según la idea.
- La voz no se toca: ni recortes ni cambios de velocidad. Música de fondo y efectos de sonido solo del catálogo `audio/` y siempre por debajo de la voz (`referencias/audio.md`).
- Determinismo: nada de `Math.random()` en Remotion.

## Qué se edita dónde
Todo vive en este repo. Para cambiar cómo escribe o suena el guion, edita `editorial/*`: el notebook lo lee en cada ejecución y lo valida con `scripts/validar_repo.py` (si algo falla, el notebook se detiene con el motivo). Tras tocar `diseno/tokens.json`, ejecuta `python3 scripts/validar_tokens.py`. Si añades assets gráficos, regenera `contactos.png` con `python3 scripts/contactos.py`.
