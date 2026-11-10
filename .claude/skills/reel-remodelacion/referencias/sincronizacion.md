# Sincronización con la voz (`palabras.json` → `subtitulos.json` → `brief.json`)

## De dónde salen los tiempos
1. El notebook guarda en `palabras.json` (v4) lo que Whisper oyó: `[[palabra, inicio_s, fin_s], …]`, con `idioma`.
2. `alinear.py` casa esas palabras con las del **guion** (que es la ortografía buena) y deja `subtitulos.json`: cada palabra del guion con su inicio y fin. Los números que Whisper escribe en dígitos se casan con su versión en palabras.
3. `preparar_brief.py` convierte los índices de palabra de `decisiones.json` en frames (`round(inicio_s × 30)`).

Nunca leas `palabras.json` directamente desde Remotion: usa `brief.subtitulos` y los `*_f` del brief.

## Qué palabra dispara qué
| Disparador | Palabra (índice) | Animación |
|---|---|---|
| Cambio de bloque | `bloques[].desde` | sale el titular anterior, entra el nuevo; la escena del bloque empieza; fundido de ambiente si cambia |
| Elemento de plantilla (partida, fase, ítem, error, opción, criterio, mueble, estilo, foto) | su `ancla` | entra el elemento (ver la ficha de la plantilla) |
| Giro (realidad, después, antídoto, veredicto, retraso) | su `ancla…` | la transformación termina **en** la palabra (empieza unos frames antes) |
| Cifra verificada | el `ancla` de su elemento | conteo de `conteo_frames`, termina antes de la siguiente palabra larga |
| Palabra clave | `cta_f` (lo calcula el script: última aparición de la palabra `cta`) | pop de la caja CTA y flechas |
| Subtítulo | cada palabra de `subtitulos` | resaltado de la palabra actual |
| Remate de bloque | última palabra antes de una pausa `‖` ≥ 0,3 s | punch-in suave |

## Reglas de tiempo
- **Anticipación**: lo que aparece entra `anticipacion_frames` (2) antes del frame del ancla, para que el ojo lo vea justo cuando el oído lo oye. Las transformaciones largas (cortina, tachado, volteo) empiezan antes y **terminan** en el ancla.
- Un elemento por palabra ancla: si dos elementos caen a menos de 6 frames, escalónalos 4 frames en el orden en que se nombran.
- Nada nuevo en los últimos 10 frames de un bloque (se cortaría con el cambio de titular).
- Transición entre ambientes: `reglas_ambientes.transicion_frames` (12) centrados en `ini_f` del bloque nuevo, con `interpolateColors`; nunca un corte seco de color.
- La cola (`cola_s`) es imagen quieta con micro-movimiento: CTA visible y legible hasta el último frame.
- Con dos idiomas, el **orden** y el **tipo** de cada animación son idénticos; solo cambian los frames. No compenses diferencias de duración añadiendo o quitando elementos.
