---
name: zype-reel
description: Dirige, construye y renderiza con Remotion un Reel vertical de ZYPE / Hitch Point Studio a partir de un guion de texto y su locución (briefs/<BASE>/guion.txt, locucion.wav, palabras.json) que deja el notebook de Colab. Úsala cuando pidan crear, dirigir, renderizar o corregir un video o reel de ZYPE o HPS, o cuando haya una carpeta nueva en briefs/.
---

# Reel ZYPE: dirección, montaje y render

El notebook te da solo tres cosas: **el guion** (texto plano, sin ninguna indicación), **la locución** y **el tiempo de cada palabra**. Todo lo demás es tuyo: dónde empieza cada bloque, los titulares, la plantilla, si lleva sello HPS, el negocio ilustrativo del mockup y su estética, los climas, los pasos del sistema, cada escena y el render. Eres el director: decide pensando en lo que mejor cuenta **este** guion, dentro de la marca.

## 1. Localiza el material
- `briefs/<BASE>/` con `guion.txt`, `locucion.wav` y `palabras.json`. "El último" = la carpeta `AAAAMMDD-HHMM` más reciente.
- Si te adjuntan los archivos en el chat, crea `briefs/<BASE>/` con ellos (BASE = la que diga el prompt).
- Las carpetas con solo `brief.json` versión 2 son del pipeline anterior: si te piden una de esas, sáltate los pasos 2-5 y construye desde su brief.

## 2. Lee la locución
`python3 scripts/alinear.py briefs/<BASE>` escribe `subtitulos.json` e imprime el guion numerado por frases, con el tiempo de cada frase y las pausas de la voz (`‖0.45s`). Los números `[n]` son las **anclas** de todo lo que decidas. No oyes el audio: el ritmo está ahí. Las pausas largas son cortes naturales; la palabra que sigue a una micro-pausa suele ser el remate.

## 3. Lee la marca y mira el material
- Siempre: `editorial/marca.md`, `editorial/adn.md` y, en `referencias/`, `marca.md`, `layout_y_bloques.md`, `decisiones.md`.
- **Abre `contactos.png`** (todos los iconos, logos, UI, ilustraciones y texturas del repo): diseña con lo que existe y dibuja en SVG lo que falte.
- Cuando toque: `plantillas.md`, `climas.md`, `tecnico.md`.

## 4. Revisa el guion contra el ADN
El guion ya pasó por avisos automáticos, pero no por un editor. Léelo con el checklist de `editorial/adn.md`:
- Si una cifra es una estadística, debe estar en `editorial/datos_verificados.json`: su `corta` va en pantalla como `fuente_en_pantalla`. Si no está, búscala en la fuente original; si se sostiene, añádela a la biblioteca (con `url`, `cita_literal`, `verificado` y `anadido_por: "claude"`); si no, no pongas la cifra en pantalla y dilo en la entrega.
- Si algo contradice el ADN (promesa garantizada, ataque a la tecnología que vendemos, nombre del negocio, sin palabra clave al final), **no lo tapes con la imagen**: dilo en la entrega para que el usuario decida si regraba. La voz no se toca.

## 5. Dirige: escribe `briefs/<BASE>/decisiones.json`
Formato completo y criterios en `referencias/decisiones.md`. En resumen:
- **Bloques**: los 6 del formato ZYPE (problema, hoy, criterio, sistema, resultado, cta) anclados a palabras del guion. Corta en las pausas y donde cambia la idea, no por número de palabras.
- **Titulares** de dos líneas (≤4 palabras cada una): complementan lo que dice la voz, no lo copian. En cta, la línea 2 es la palabra clave.
- **Plantilla**, **sello HPS**, **cabecera** "SISTEMAS PARA ___", **pasos** del sistema anclados a la palabra en que la voz los nombra.
- **Negocio ilustrativo** (rubro del guion, nombre ficticio que la voz no dice, 2-3 productos con precio redondo) y su **paleta** de `brand/paletas.json` → `paletas_negocio`.
- **Climas**: 1-2 bloques fuera de zype, sin repetir la combinación de los últimos videos.

Después: `python3 scripts/preparar_brief.py briefs/<BASE>`. Valida tus decisiones contra las reglas de marca y escribe `briefs/<BASE>/brief.json` con los frames exactos. Si da errores, corrige `decisiones.json` y repite.

## 6. Construye
Proyecto Remotion según `tecnico.md`, con `src/brief.json` como única fuente de datos (`referencias/brief.md`). Para cada bloque, decide la escena pensando en lo que dice la voz en ese tramo (`bloques[].texto`), en la plantilla y en el clima asignado. Lo que no está en las referencias, decídelo tú con la estética ZYPE.

## 7. Revisa como un editor
`python3 scripts/preparar_brief.py briefs/<BASE> --stills` imprime un comando de still por bloque, por cada transición de clima, por cada paso del sistema y del final. Ejecútalos y mira cada imagen. Antes de renderizar, todas estas deben ser ciertas:
- Ningún texto vital fuera de Y 220–1580; nada se solapa con el titular ni con los subtítulos.
- Las fuentes cargaron (no hay serif por defecto del navegador).
- El amarillo solo está en el foco; en climas claros la línea 2 va como marcador y se lee.
- Las transiciones de clima son fundidos, no cortes.
- El nombre del negocio solo aparece como wordmark del mockup; ningún logo de negocio.
- Cada paso del sistema se enciende cuando la voz lo nombra.
- Duración = `brief.video.frames`.
Si cambias una decisión, edita `decisiones.json` y vuelve a ejecutar `preparar_brief.py`: no corrijas frames a mano en `brief.json`.

## 8. Render y entrega
- `npx remotion render Video out/<BASE>.mp4 --codec=h264 --crf=18` y la portada: `npx remotion still Video out/portada.png --frame=<frame con acción del arranque>`.
- Entrega el MP4 y la portada con 3–5 líneas: plantilla, climas y por qué, y cualquier problema del guion que hayas visto (paso 4).
- Si tienes permiso de escritura en el repo, sube `briefs/<BASE>/decisiones.json`, `brief.json`, `subtitulos.json` y, si cambió, `editorial/datos_verificados.json`. Así el siguiente video ve qué climas se usaron.

## Reglas fijas
- El marco ZYPE (barra de progreso, header, titular, subtítulos, CTA, logo) es fijo en todos los videos; solo cambia el clima de la escena.
- Nunca logos, nombre real ni fotos reales de un negocio. El negocio del video es ilustrativo.
- La voz no se toca: ni recortes, ni cambios de velocidad, ni música encima.
- Determinismo: nada de `Math.random()` en Remotion.
