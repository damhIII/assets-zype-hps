# Salida y entrega

## Especificación
| | |
|---|---|
| Resolución | 1080 × 1920 (9:16), 30 fps |
| Duración | voz + `cola_s` (1-2 s). La que pida el guion: no se recorta ni se acelera. Si pasa de 90 s, menciónalo en la entrega como dato (no como error) |
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
- [ ] Las fuentes cargaron (Fraunces y DM Sans; ningún serif por defecto del navegador).
- [ ] Cada elemento de la plantilla entra cuando la voz lo nombra (mira los stills de anclas) y el CTA hace pop en `cta_f`.
- [ ] Toda cifra en pantalla tiene su fuente visible (`fuente_dato`) y viene de un dato verificado; lo ilustrativo dice **EJEMPLO ILUSTRATIVO**.
- [ ] Ningún texto ni sello dice o insinúa que la marca construye, tiene licencia o seguro, o garantiza precio, plazo o costo (salvo lo declarado con `si` en `marca.md`).
- [ ] No hay ninguna foto ni video: todo es animación.
- [ ] La palabra clave en pantalla es exactamente la que dice la voz.
- [ ] El foco (miel) solo está en el marcador del titular, la palabra activa, la barra, el foco de cada escena y el CTA.
- [ ] Las transiciones de ambiente son fundidos, no cortes.
- [ ] Duración = `video.frames`; el audio no se recortó ni se aceleró.

## Mensaje de entrega (3-6 líneas)
- Formato y plantilla usados (y por qué, si cambiaste el del guionista) y ambientes.
- Cualquier problema del guion visto en el paso 4 (cifra sin verificar, marca como ejecutora, caso presentado como real) y qué dato habría que verificar, con su fuente oficial.
- Un caption sugerido: dos líneas + la invitación con la palabra clave. Sin promesas de archivos.
