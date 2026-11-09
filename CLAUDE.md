# assets-zype-hps

Repositorio de los Reels de Instagram de **ZYPE** (Digital Execution Studio) y **Hitch Point Studio (HPS)**. Contiene el contenido editorial, los assets gráficos, las paletas, las fuentes y las instrucciones para dirigir y construir los videos con Remotion.

## Cómo llega un encargo
El notebook de Colab (`Crear_video_ZYPE_HPS_v2.ipynb`) hace solo tres cosas: escribe el **guion** (una llamada a GPT, solo texto), lo **locuta** (Gemini TTS) y saca el **tiempo de cada palabra** (Whisper). Deja `guion.txt`, `locucion.wav` y `palabras.json` en `briefs/<BASE>/` (BASE = `AAAAMMDD-HHMM`).

Todo lo demás lo haces tú con la skill **zype-reel** (`.claude/skills/zype-reel/SKILL.md`): revisar el guion contra el ADN, decidir bloques, titulares, plantilla, sello HPS, negocio ilustrativo, paleta y climas (`briefs/<BASE>/decisiones.json`), construir, revisar y renderizar.

## Estructura
- `editorial/` voz y marca (`marca.md`), ADN y checklist (`adn.md`), los 20 temas (`temas.json`), datos con fuente (`datos_verificados.json`, biblioteca que comparten GPT y Claude), el prompt del guionista (`prompt_guion.md`) y el perfil de locución (`voz_tts.md`).
- `icons/` Lucide (trazo, `currentColor`) · `logos/` canales y herramientas (monocromos) → siempre con máscara CSS.
- `ui/`, `illus/`, `textures/` SVG con los colores ZYPE fijos → teñirlos con `scripts/tenir_svg.py` si el clima no es zype.
- `contactos.png` hoja con todos los assets gráficos: ábrela antes de diseñar.
- `fonts/css/` `@font-face` con woff2 en base64 (los `.ttf` sueltos no se usan).
- `logo_transparente.png` (ZYPE), `logo_hps.png` (HPS).
- `brand/paletas.json` climas de escena y paletas de negocio.
- `scripts/` `alinear.py` (guion ↔ voz), `preparar_brief.py` (decisiones → brief con frames), `tenir_svg.py`, `validar_paletas.py`.
- `briefs/<BASE>/` guion, locución y tiempos (los sube el notebook) + tus decisiones y el brief generado.

## Reglas que valen siempre
- El marco ZYPE (barra de progreso, header, titular, subtítulos, CTA, logo) es fijo en todos los videos; solo cambia el clima de la escena.
- Nunca logos, nombre real ni fotos reales de un negocio: el negocio del video es siempre ilustrativo.
- Estadísticas en pantalla solo con su fuente de `editorial/datos_verificados.json`.
- La voz no se toca: ni recortes, ni cambios de velocidad, ni música encima.
- Determinismo: nada de `Math.random()` en Remotion.

## Qué se edita dónde
Todo vive en este repo (ya no hay sincronización desde Drive). Para cambiar cómo escribe o suena el guion, edita `editorial/prompt_guion.md`, `editorial/marca.md`, `editorial/adn.md`, `editorial/temas.json` o `editorial/voz_tts.md`: el notebook los lee de aquí en cada ejecución. Tras tocar `brand/paletas.json`, ejecuta `python3 scripts/validar_paletas.py`. Si añades assets gráficos, regenera `contactos.png`.
