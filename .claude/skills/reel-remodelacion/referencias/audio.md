# Música y efectos de sonido

La voz manda. La música acompaña por debajo y los efectos subrayan lo que ya pasa en pantalla; si se oyen más que la voz, sobran.

## Qué hay (no hace falta abrir `audio/catalogo.json`)
Todo es **CC0** (dominio público, sin atribución, válido para Reels comerciales). Usa solo estos ids; nada descargado de internet ni música con derechos.

**Música** (`audio/musica/<id>.mp3`, instrumental, 100 s con fundido final, normalizada a −16 LUFS):
| mood | ids |
|---|---|
| acustico_positivo | `_01` `_02` `_03` |
| alegre_ukelele | `_01` `_02` `_03` |
| funk_groove | `_01` `_02` `_03` |
| hiphop_beat | `_01` `_02` |
| lofi_relajado | `_01` `_02` `_03` `_04` |
| minimal_suave | `_01` `_02` |

**Efectos** (`audio/sfx/<id>.wav`, ≤ 1,6 s, sin silencio inicial, pico a −3 dBFS): `campana_01-03`, `cerrojo_01-02`, `click_01-03`, `cristal_01-03`, `crujido_01-03`, `desaparecer_01-03`, `deslizar_01-03`, `ding_01-03`, `error_01-03`, `golpe_madera_01-03`, `golpe_metal_01-03`, `golpe_obra_01-03`, `golpe_suave_01-03`, `goteo_01-02`, `monedas_01-02`, `papel_01-03`, `pasos_01-03`, `pop_01-03`, `pregunta_01-03`, `puerta_01-03`, `scratch_01-03`, `swoosh_transicion_01-02`, `tic_01`, `tic_tac_01`, `whoosh_01-03`.

## `briefs/<BASE>/audio.json`
Escríbelo junto a `decisiones.json` (no se sube al repo). La música la copias de `encargo.musica`; los efectos son tu decisión.
```jsonc
{
  "musica": { "id": "lofi_relajado_01", "volumen": 0.12 },     // = encargo.musica (null = sin música)
  "sfx": [
    { "id": "whoosh_01", "ancla": 0,  "volumen": 0.35 },          // ancla = índice de palabra de subtitulos.json
    { "id": "pop_02",    "ancla": 24, "volumen": 0.4 },
    { "id": "ding_01", "cta": true, "volumen": 0.45 }             // cta: true → en cta_f del brief
  ]
}
```
La plantilla pone cada efecto 2 frames antes de su ancla, igual que las animaciones. `revisar.py` comprueba que los ids existen.

## Música
- **Llega elegida** en `encargo.musica`: cópiala tal cual en `audio.json` (`id` y `volumen`, 0.10–0.15). Si es `null`, sin música.
- La plantilla ya la mezcla: fundidos de entrada y salida, y sube un poco en las pausas largas (≥ 1 s) y en la cola. No hace falta nada más.

## Efectos: qué va con qué
| Momento | Categoría del catálogo | Notas |
|---|---|---|
| Cambio de bloque | `whoosh`, `swoosh_transicion`, `deslizar` | no en todos: 2-3 por video, en los cambios grandes |
| Entra un elemento de la plantilla | `pop`, `click` | el más corto; volumen 0.3-0.4 |
| Check de `checklist` | `click`, `tic` | uno por ítem como mucho |
| Bandera roja, error caro | `error` | suave, nunca alarma |
| Giro mito → realidad | `scratch` (tono divertido) o `whoosh` | en el ancla del giro |
| Pregunta en el gancho | `pregunta` | en el frame 0 solo si el gancho es una pregunta; si no, un golpe acorde al problema (`golpe_obra`, `goteo`, `crujido`) |
| Dinero que se pierde o se ahorra | `monedas` | solo si se ve en pantalla |
| Fases de `cronograma` (paso a paso) | `tic_tac`, `tic` | |
| Muebles que caen en la `planta` | `pop`, `golpe_suave`, `golpe_madera` | |
| Obra, herramientas, demolición | `golpe_obra` (pico sobre piedra), `golpe_madera`, `golpe_metal` | uno, corto |
| Puertas, cerraduras, papeles | `puerta`, `cerrojo`, `crujido`, `papel` | |
| Humedad, filtraciones | `goteo` | muy bajo |
| Remate de un chiste | `campana`, `scratch` | máximo uno por video y solo si el guion tiene un remate claro |
| Pop del CTA | `ding`, `cristal` | siempre el mismo tipo de sonido: es la firma del cierre |

## Reglas
- Como mucho un efecto cada 2 s de media, y nunca dos a la vez.
- Ningún efecto encima de una palabra clave: entra 2 frames antes del ancla y es más corto que la palabra.
- Volumen de los efectos: 0.3–0.5 (ya vienen normalizados). Si uno tapa la voz en el still de audio o al escucharlo, bájalo o quítalo.
- `encargo.tono` = `serio` (riesgo para la salud o la casa): sin efectos cómicos (`scratch`, `campana`, `pop` juguetón). El peligro se subraya con un golpe seco y grave (`golpe_obra`, `golpe_metal`, `crujido`, `goteo`), uno solo, en el ancla donde la voz nombra el riesgo.
