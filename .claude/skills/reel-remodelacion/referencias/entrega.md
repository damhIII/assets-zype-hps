# Salida y entrega

## Especificación (la aplica `scripts/render.py`)
| | |
|---|---|
| Resolución | 1080 × 1920 (9:16), 30 fps |
| Duración | voz + `cola_s` (1-2 s). La voz no se recorta ni se acelera |
| Video | H.264, `yuv420p`, CRF 18 |
| Audio | la locución sin tocar + música y efectos del catálogo por debajo, AAC 48 kHz |
| Archivo | `out/<BASE>_es.mp4` |

## Lo que comprueban las hojas de `revisar.py` (lo demás lo garantiza la plantilla)
- [ ] El frame 0 muestra el problema del gancho ya en movimiento, con el titular legible.
- [ ] Cada elemento entra cuando la voz lo nombra (stills de anclas y acentos) y nada se solapa con el titular ni los subtítulos.
- [ ] Ningún texto de tus escenas fuera del recuadro azul (zona segura).
- [ ] Si hay `encargo.peligro`, el gancho lo hace sentir (sin nada gráfico) y el resultado muestra el mismo objeto ya seguro.
- [ ] El resultado repite la composición del gancho, resuelta; el still `final` vuelve al frame 0.
- [ ] Rojo solo en el foco de cada escena y los corchetes; 2-3 matices de apoyo por escena, no un video gris y rojo.
- [ ] Toda cifra es un dato verificado o la cifra de oficio que dice la voz; lo ilustrativo lleva el sello.
- [ ] Nada dice o insinúa que la marca construye, tiene licencia o seguro, o garantiza precio, plazo o costo.

## Entrega
Cuando `render.py` diga `OK`, envía `out/<BASE>_es.mp4` como archivo. Esa es toda la respuesta: ni portada, ni resumen, ni caption, ni lista de música o efectos. Si el entorno no puede renderizar, entrega `remotion/` en zip (sin `node_modules` ni `public`) con `briefs/<BASE>/` y el comando `python3 scripts/render.py briefs/<BASE>`.
