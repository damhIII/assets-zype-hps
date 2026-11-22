# Repo de Reels educativos de remodelación e interiores (Florida) · EN BRUTO

Contenido editorial, sistema de diseño, assets e instrucciones para dirigir y construir con Remotion los Reels de Instagram de **EN BRUTO**, una agencia de decoración, remodelación, construcción e interiores en Florida. Este pipeline hace **solo videos educativos, en español y 100 % animados**: sin fotos de obras, sin casos reales de clientes.

Para dirigir un reel usa **solo** la skill **reel-remodelacion** (`.claude/skills/reel-remodelacion/SKILL.md`). La skill `zype-reel` es de otra marca: no la uses para EN BRUTO.

## Cómo llega un encargo
El notebook de Colab (`Crear_reel_En_Bruto`, versión 6.1) solo pide un **espacio de la casa** (cocina de exteriores, baños, piscina…). Con él:
1. **Tema**: un algoritmo elige un dolor de `editorial/espacios.json` que no se haya usado hace poco (más peso a los de temporada), rota el formato y el tipo de gancho, y una llamada corta al modelo lo convierte en un brief con tres ganchos. El usuario elige uno.
2. **Guion**: una llamada al modelo con `editorial/prompt_guion.md`: seis párrafos (gancho, escena, marco, cuerpo, resultado, cierre).
3. **Voz y tiempos**: Gemini TTS y Whisper.
4. **Subida**: deja en `briefs/<BASE>/` (BASE = `AAAAMMDD-HHMM`, hora de Nueva York) `encargo.json` y `es/{guion.txt, locucion.wav, palabras.json}`, y añade una línea a `editorial/historial.jsonl`.

Todo lo demás lo haces tú con la skill: revisar el guion, decidir bloques, titulares, ambientes y parámetros (`briefs/<BASE>/decisiones.json`), construir, revisar y renderizar.

## Estructura
- `editorial/`: prompt del guionista con la marca, las declaraciones permitidas, las cifras y los límites (`prompt_guion.md`), prompts del generador de temas (`prompt_tema.md`, `prompt_catalogo.md`), catálogo de dolores por espacio (`espacios.json`), historial de videos publicados (`historial.jsonl`), los 6 formatos, los tipos de gancho y la duración (`formatos.json`), datos con fuente (`datos_verificados.json`: solo valen los `verificado: true`) y perfil de voz (`voz_tts.md`).
- `.claude/skills/reel-remodelacion/`: la skill, `plantillas/` (una ficha por formato + `plantillas.json` con sus parámetros), `diseno/tokens.json` (colores, tipografías, logos, tamaños, márgenes seguros, movimiento) y `referencias/`.
- `brand/en_bruto/`: **logo oficial de EN BRUTO** (PNG transparente) en variantes para fondo claro y oscuro, con y sin lema. Va en el header y en el CTA de cada video, con `<Img>`, sin teñir ni deformar. (`logo_hps.png`, `logo_zype.png` y `brand/paletas.json` son de otra marca: no los uses aquí.)
- `icons/` Lucide y Tabler (`tb-*`), de trazo y `currentColor` · `logos/` canales (monocromos) → siempre con máscara CSS.
- `illus/planta/`: símbolos de planta 2D a escala real (1 unidad = 1 cm; medidas en `catalogo.json`) · `illus/emoji/`: emoji Fluent de Microsoft (`flat/` SVG, `3d/` PNG) para pegatinas puntuales.
- `audio/`: efectos (`sfx/`) y música de fondo (`musica/`) con licencia CC0, normalizados. Qué hay y cómo usarlos: `referencias/audio.md`.
- `ui/`, `textures/` (incluidos los materiales `mat_*`): SVG en los colores del ambiente `lino` → para otros ambientes, `scripts/tenir_svg.py`.
- `contactos.png`: hoja con todos los assets gráficos (logo incluido). Ábrela antes de diseñar.
- `fonts/css/`: `@font-face` con woff2 en base64 (se usan Barlow Condensed, DM Sans y Space Mono).
- `scripts/`: `alinear.py` (guion ↔ voz), `preparar_brief.py` (decisiones → brief con frames), `validar_repo.py` (editorial y plantillas), `validar_tokens.py` (contrastes), `tenir_svg.py`, `contactos.py`.
- `briefs/<BASE>/`: lo que sube el notebook + tus decisiones y el brief generado.

## Reglas que valen siempre
- **Videos educativos**: cada uno enseña algo concreto. Los ejemplos son hipotéticos; nunca casos de clientes ni proyectos presentados como reales.
- **Nunca inventar datos**: precios, plazos de obra, porcentajes, normas o requisitos de permisos solo con un dato `verificado: true`. Las **cifras de oficio** (medidas, tiempos de prueba o de curado, pendientes) valen si la voz las dice como referencia, una o dos por video. Lo ilustrativo se marca.
- **La marca coordina, no ejecuta**: nunca "construimos", "remodelamos", "instalamos". Nada de licencia, seguro o garantías salvo lo que `editorial/prompt_guion.md` → Declaraciones permitidas marque con `si`.
- **Animación pura**: nada de fotos ni videos (de obras, de bancos de imágenes o de internet), ni logos de contratistas o fabricantes.
- **Los primeros tres segundos mandan**: el frame 0 muestra el problema del gancho en movimiento, con su texto en pantalla; el header con el logo entra a los 1,5 s.
- **Seis bloques**, uno por párrafo del guion (gancho, escena, marco, cuerpo, resultado, cta), algo nuevo en pantalla como mucho cada 4 s, y el final vuelve a la imagen del principio (bucle).
- El marco (barra de progreso, header con logo, titular, subtítulos, CTA con logo) es fijo; solo cambian el ambiente y la escena.
- **El cierre manda al perfil y al enlace de la bio**: nada de palabras clave, "comenta", DM ni enlace de la descripción.
- **Duración**: entre 40 y 60 s de voz, según lo que pida la explicación.
- La voz no se toca: ni recortes ni cambios de velocidad. Música y efectos solo del catálogo `audio/` y siempre por debajo de la voz.
- Determinismo: nada de `Math.random()` en Remotion.

## Qué se edita dónde
Todo vive en este repo. Para cambiar cómo escribe o suena el guion, edita `editorial/*`: el notebook lo lee en cada ejecución. Comprueba los cambios con `python3 scripts/validar_repo.py`. Tras tocar `diseno/tokens.json`, ejecuta `python3 scripts/validar_tokens.py`. Si añades assets gráficos, regenera `contactos.png` con `python3 scripts/contactos.py`.
