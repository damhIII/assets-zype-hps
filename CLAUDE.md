# Repo de Reels de remodelación e interiores (Florida)

Contenido editorial, sistema de diseño, assets e instrucciones para dirigir y construir con Remotion los Reels de Instagram de una agencia de decoración, remodelación, construcción e interiores en Florida. El nombre de la marca **no está escrito en el repo**: llega en `briefs/<BASE>/encargo.json → marca` (lo pone el notebook desde su variable `MARCA`). Si vale `{{NOMBRE_MARCA}}` o está vacío, la marca está pendiente: no la dibujes ni la nombres.

## Cómo llega un encargo
El notebook de Colab (`Crear_reel_remodelacion.ipynb`) hace solo esto: escribe el **guion** (GPT; en `ambos`, el inglés es una adaptación del español), lo **locuta** (Gemini TTS) y saca el **tiempo de cada palabra** (Whisper). Deja en `briefs/<BASE>/` (BASE = `AAAAMMDD-HHMM`, hora de Nueva York):
- `encargo.json`: marca, formato pedido y el que usó el guionista, idiomas, seed, obras reales utilizables.
- `<idioma>/guion.txt`, `<idioma>/locucion.wav`, `<idioma>/palabras.json` (versión 4, con `idioma`), para `es` y/o `en`.

Todo lo demás lo haces tú con la skill **reel-remodelacion** (`.claude/skills/reel-remodelacion/SKILL.md`): revisar el guion contra el ADN, decidir bloques, titulares, ambientes, obra y parámetros de la plantilla del formato (`briefs/<BASE>/decisiones.json`, uno para los dos idiomas), construir, revisar y renderizar una versión por idioma.

## Estructura
- `editorial/`: marca y declaraciones permitidas (`marca.md`), ADN y checklist (`adn.md`), temas (`temas.json`), los 8 formatos (`formatos.json`), datos con fuente (`datos_verificados.json`: solo valen los `verificado: true`), prompt del guionista (`prompt_guion.md`), prompt de adaptación al inglés (`prompt_adaptacion.md`) y perfiles de voz por idioma (`voz_tts.md`).
- `.claude/skills/reel-remodelacion/`: la skill, `plantillas/` (una ficha por formato + `plantillas.json` con sus parámetros), `diseno/tokens.json` (colores, tipografías, tamaños, márgenes seguros, movimiento) y `referencias/`.
- `assets/obras/<id>/`: fotos y videos reales de obras con su `manifest.json` (ver `assets/obras/LEEME.md`).
- `icons/` Lucide (trazo, `currentColor`) · `logos/` canales (monocromos) → siempre con máscara CSS.
- `ui/`, `textures/`: SVG en los colores del ambiente `lino` → para otros ambientes, `scripts/tenir_svg.py`.
- `contactos.png`: hoja con todos los assets gráficos. Ábrela antes de diseñar.
- `fonts/css/`: `@font-face` con woff2 en base64 (se usan Fraunces y DM Sans).
- `scripts/`: `alinear.py` (guion ↔ voz), `preparar_brief.py` (decisiones → briefs con frames), `validar_repo.py` (editorial, obras, plantillas), `validar_tokens.py` (contrastes), `tenir_svg.py`, `contactos.py`.
- `briefs/<BASE>/`: lo que sube el notebook + tus decisiones y los briefs generados.

## Reglas que valen siempre
- **Nunca inventar datos**: ninguna cifra (precio, plazo, porcentaje, norma) en pantalla sin un dato `verificado: true` o un dato verificado de una obra real. Lo ilustrativo se marca.
- **La marca coordina, no ejecuta**: nunca "construimos", "remodelamos", "instalamos". Nada de licencia, seguro o garantías salvo lo que `marca.md → Declaraciones permitidas` marque con `si`.
- Fotos reales solo de `assets/obras/` autorizadas, respetando su privacidad y con créditos de ejecución. Nunca fotos de internet ni logos de contratistas o fabricantes.
- El marco (barra de progreso, header, titular, subtítulos, CTA) es fijo; solo cambian el ambiente y la escena.
- Dos idiomas = un diseño de escenas, dos renders.
- La voz no se toca: ni recortes, ni cambios de velocidad, ni música encima.
- Determinismo: nada de `Math.random()` en Remotion.

## Qué se edita dónde
Todo vive en este repo. Para cambiar cómo escribe o suena el guion, edita `editorial/*`: el notebook lo lee en cada ejecución y lo valida con `scripts/validar_repo.py` (si algo falla, el notebook se detiene con el motivo). Tras tocar `diseno/tokens.json`, ejecuta `python3 scripts/validar_tokens.py`. Si añades assets gráficos, regenera `contactos.png` con `python3 scripts/contactos.py`.
