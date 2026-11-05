---
name: zype-reel
description: Construye y renderiza con Remotion un Reel vertical de ZYPE / Hitch Point Studio a partir de un brief.json y su locución generados por el notebook de Colab. Úsala cuando pidan crear, renderizar o corregir un video o reel de ZYPE o HPS, o cuando haya un brief en briefs/.
---

# Reel ZYPE desde un brief

El notebook de Colab ya escribió y verificó el guion, generó la locución y calculó los tiempos. Tu trabajo es la dirección de arte y la construcción: convertir `brief.json` + audio en un MP4 que respete la marca.

## 1. Localiza el material
- Brief: `briefs/<BASE>/brief.json` (si te dan un nombre o "el último", es la carpeta más reciente de `briefs/`), o un `brief.json` adjunto en el chat.
- Audio: `brief.audio`, junto al brief o adjunto.
- Valida antes de nada: `python3 scripts/validar_brief.py briefs/<BASE>/brief.json`. Si falla, para y dilo; no inventes rangos.

## 2. Lee las referencias que tocan (están en `referencias/`)
| Archivo | Cuándo |
|---|---|
| `brief.md` | siempre: qué significa cada campo |
| `marca.md` | siempre: colores, HPS, prohibiciones |
| `layout_y_bloques.md` | siempre: layout fijo, los 6 bloques, movimiento, subtítulos |
| `plantillas.md` | la sección de `brief.plantilla` |
| `climas.md` | si algún valor de `brief.climas` no es `zype` |
| `tecnico.md` | al montar el proyecto y al renderizar |

## 3. Construye
Proyecto Remotion según `tecnico.md`, con `src/brief.json` como única fuente de datos. Para cada bloque, decide la escena pensando en lo que dice la voz en ese tramo (`bloques[].texto`) y en el clima asignado. Si `brief.notas_direccion` trae algo, aplícalo: es la indicación del usuario para este video y manda sobre tu criterio (no sobre la marca). Tienes libertad creativa dentro de las reglas; lo que no está en el brief ni en las referencias, decídelo tú con la estética ZYPE.

## 4. Revisa como un editor
Ejecuta los stills que imprime `validar_brief.py --stills` y mira cada imagen. Antes de renderizar, todas estas deben ser ciertas:
- Ningún texto vital fuera de Y 220–1580; nada se solapa con el titular ni con los subtítulos.
- Las fuentes cargaron (no hay serif por defecto del navegador).
- El amarillo solo está en el foco; en climas claros la línea 2 va como marcador y se lee.
- Las transiciones de clima son fundidos, no cortes.
- El nombre del negocio solo aparece como wordmark del mockup; ningún logo de negocio.
- Duración = `brief.video.frames`.

## 5. Renderiza y entrega
`npx remotion render Video out/<base>.mp4 --codec=h264 --crf=18`. Entrega el MP4 y el proyecto en zip sin `node_modules`, con una línea por bloque de lo que hiciste y los climas usados.
