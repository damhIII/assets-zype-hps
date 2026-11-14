# Salida y entrega

## Especificación
| | |
|---|---|
| Resolución | 1080 × 1920 (9:16), 30 fps |
| Duración | voz + `cola_s` (1-2 s). El guionista apunta a 30-60 s de voz; no se recorta ni se acelera. Si la voz queda fuera de 30-60 s, menciónalo en la entrega como dato (no como error) |
| Video | H.264, `yuv420p`, CRF 18 |
| Audio | la locución sin tocar, AAC 48 kHz |
| Archivos | `out/<BASE>_es.mp4` y `out/<BASE>_es_portada.png` (1080 × 1920; lo esencial dentro del recorte 3:4 de `zonas_seguras.recorte_grilla_3x4`) |

## Comandos
```bash
npx remotion render Reel-es out/<BASE>_es.mp4 --codec=h264 --crf=18 --pixel-format=yuv420p --audio-codec=aac
npx remotion still Reel-es out/<BASE>_es_portada.png --frame=<frame del gancho con acción>
```
Si el entorno no puede renderizar, entrega el proyecto en zip (sin `node_modules`) y los comandos exactos.

## Antes de entregar (todas deben ser ciertas)
- [ ] `python3 scripts/preparar_brief.py briefs/<BASE>` sin errores y los stills revisados uno por uno.
- [ ] Ningún texto vital fuera de x 72–940 / y 220–1580; nada se solapa con titular, subtítulos ni aviso legal.
- [ ] Las fuentes cargaron (Barlow Condensed, DM Sans y Space Mono; ninguna fuente por defecto del navegador).
- [ ] El logo aparece en el header y en el CTA, en la variante correcta para el fondo, sin deformar ni teñir; el nombre de la marca no está escrito con tipografía.
- [ ] Cada elemento de la plantilla entra cuando la voz lo nombra (mira los stills de anclas) y el CTA hace pop en `cta_f`.
- [ ] Toda cifra en pantalla tiene su fuente visible (`fuente_dato`) y viene de un dato verificado; lo ilustrativo dice **EJEMPLO ILUSTRATIVO**.
- [ ] Ningún texto ni sello dice o insinúa que la marca construye, tiene licencia o seguro, o garantiza precio, plazo o costo (salvo lo declarado con `si` en `marca.md`).
- [ ] No hay ninguna foto ni video: todo es animación.
- [ ] El CTA invita a entrar al perfil y dice dónde está el enlace (la bio), hace pop cuando la voz lo menciona y la flecha apunta hacia la foto y el nombre de la cuenta (abajo a la izquierda); no hay iconos de comentario ni DM.
- [ ] El rojo (`foco`) solo está en el marcador del titular, el subrayado de la palabra activa, la barra, los corchetes, el foco de cada escena y el CTA; las escenas usan neutros cálidos y 2-3 matices de `apoyo`, no un video monocromo gris y rojo.
- [ ] Las transiciones de ambiente son fundidos, no cortes.
- [ ] Duración = `video.frames`; el audio no se recortó ni se aceleró.

## Mensaje de entrega (3-6 líneas)
- Formato y plantilla usados (y por qué, si cambiaste el del guionista) y ambientes.
- Cualquier problema del guion visto en el paso 4 (cifra sin verificar, marca como ejecutora, caso presentado como real) y qué dato habría que verificar, con su fuente oficial.
- Un caption sugerido: dos líneas con el tono del video + una línea que recuerde que el enlace para escribirnos está en la bio del perfil (no hace falta pegar el enlace en el caption). Sin promesas de archivos.
