# decisiones.json — tu dirección del video

Lo escribes tú en `briefs/<BASE>/decisiones.json` después de leer el guion numerado (`scripts/alinear.py`). Las anclas (`desde`, `en`) son los índices `[n]` de palabra del guion; no escribas frames. `scripts/preparar_brief.py` lo valida y lo convierte en `brief.json` con los frames exactos.

```jsonc
{
  "version": 3,
  "tema": { "id": 10, "titulo": "El dinero que no cobraste", "tesis": "Vender no es lo mismo que cobrar." },
                                        // tema de editorial/temas.json al que se parece el guion (id 0 = fuera del catálogo). Informativo.
  "nicho_header": "IMPRENTAS",          // → header "SISTEMAS PARA IMPRENTAS". Plural, MAYÚSCULAS. Si el guion es genérico: "NEGOCIOS LOCALES"
  "cta": "PAGOS",                       // la palabra clave que dice la voz al final (tiene que estar en el guion)
  "plantilla": "dividida",              // estandar | dividida | calculadora | dato | circulo → plantillas.md
  "hps": false,                         // sello Hitch Point Studio en CRITERIO y en el cierre → marca.md
  "fuente_en_pantalla": "",             // "corta" de editorial/datos_verificados.json si la voz cita un dato (obligatoria con plantilla dato)
  "cola_s": 1.5,                        // segundos de imagen tras la última palabra (1-2)
  "climas": { "sistema": "oceano", "resultado": "bosque" },   // solo los bloques que NO van en zype → climas.md
  "negocio": {                          // el negocio ILUSTRATIVO del mockup
    "nombre_mostrado": "Tinta Vecinal", // ficticio, 1-2 palabras, que no se parezca a una marca real y que la voz NO diga
    "rubro": "imprenta",                // el del guion, en singular
    "moneda": "$",
    "items_ejemplo": [{ "nombre": "500 volantes", "precio": 600 }, { "nombre": "100 tarjetas", "precio": 300 }],
    "canales": ["WhatsApp", "correo", "mostrador"]
  },
  "estetica_negocio": { "paleta_id": "pizarra" },   // id de brand/paletas.json → paletas_negocio (interior del mockup). null = mockup en el clima del bloque
  "bloques": [
    { "id": "problema",  "desde": 0,   "titular": ["Persigues pagos", "En vez de vender"] },
    { "id": "hoy",       "desde": 14,  "titular": ["Buscas una factura", "Frenas una cotización"] },
    { "id": "criterio",  "desde": 36,  "titular": ["Antes de automatizar", "Ordena el cobro"] },
    { "id": "sistema",   "desde": 54,  "titular": ["Tu sistema organiza", "Tu equipo decide"],
      "pasos": [ { "texto": "Todo en el CRM", "en": 65 }, { "texto": "IA lee comprobantes", "en": 68 }, { "texto": "Recordatorio sale", "en": 83 }, { "texto": "Equipo confirma", "en": 98 } ] },
    { "id": "resultado", "desde": 106, "titular": ["Menos búsqueda", "Más control de caja"] },
    { "id": "cta",       "desde": 128, "titular": ["Ordena tus cobros", "PAGOS"] }
  ],
  "notas": "1-3 líneas: por qué esta plantilla y estos climas"
}
```

## Cómo decidir
**Bloques.** Siempre los 6, en orden, el primero en la palabra 0. El guion sigue ese arco aunque no lleve etiquetas: busca dónde empieza la escena del dueño (hoy), dónde aparece el "antes de" o el porqué (criterio), dónde arranca el flujo (sistema), dónde cae el impacto en caja o tiempo (resultado) y la invitación final (cta). Corta en una pausa (`‖`) o en el arranque de frase. Si el guion mezcla dos partes en una frase, parte por la palabra que cambia de idea. Si el guion se salta claramente una parte, no la inventes: dale un bloque corto (≥1,5 s) con la frase más cercana y dilo en la entrega.

**Titulares.** Dos líneas de ≤4 palabras, sin punto final, cifras en número. Línea 1 (blanca) = contexto; línea 2 (amarilla) = el golpe. Complementan o rematan la voz de ese tramo, no la copian palabra por palabra. En cta, línea 2 = la palabra `cta`.

**Plantilla** (detalles en `plantillas.md`):
- `dividida` si el guion contrasta el mismo negocio sin y con sistema, o un "antes / ahora".
- `calculadora` si el costo del problema se puede multiplicar (huecos por semana × ticket × 4 semanas).
- `dato` solo si la voz cita una estadística de `datos_verificados.json`.
- `circulo` si el guion describe un círculo vicioso (poco margen → no invierto → no crezco).
- `estandar` para todo lo demás (la mayoría).

**Sello HPS.** `true` si la voz nombra a Hitch Point Studio, o si el criterio habla de estrategia, marca, oferta o contenido y el sello refuerza "primero preparamos, después activamos". Si la voz no nombra a HPS, que el sello sea discreto.

**Pasos.** 3-4 etiquetas de 2-3 palabras que resumen el flujo del bloque sistema (entrada → decisión → acción), cada una anclada (`en`) a la palabra donde la voz la nombra. Si no hay una palabra clara, `"en": null` (se reparte uniforme).

**Negocio y paleta.** El rubro sale del guion ("tu imprenta"). Inventa un nombre corto y verosímil para el wordmark del mockup, distinto de cualquier palabra del guion. Elige la paleta de `paletas_negocio` cuyos `rubros` encajen; si ninguna encaja, `pizarra`. Los precios, redondos y coherentes con lo que diga la voz.

**Climas** (reglas completas en `climas.md`): problema y cta siempre zype; 1-2 bloques intermedios con otro clima, elegidos por lo que pasa en ese tramo (fricción → brasa, noche → medianoche, pausa estratégica → papel o ciruela, caja que entra → bosque…). No repitas la combinación de los últimos 3 videos: el validador lo mira en `briefs/*/decisiones.json`.

## Lo que comprueba `preparar_brief.py`
Errores (bloquean): bloques incompletos o fuera de orden, anclas fuera del guion o no crecientes, titulares de más de 4 palabras por línea, palabra CTA ausente del guion o del titular final, plantilla desconocida, `dato` sin fuente, climas inexistentes o en bloques que no les tocan, problema/cta fuera de zype, más de 2 climas, océano en criterio con HPS, paleta desconocida, nombre del negocio dicho por la voz, bloques de menos de 0,5 s.
Avisos: combinación de climas repetida, HPS incoherente con la voz, paleta pensada para otro rubro, fuentes que no están en `fonts/css/`, bloques de menos de 1,5 s, pasos anclados fuera del bloque.
