# Plantilla `cronograma` · Línea de tiempo de obra

**Cuándo**: el guion cuenta una obra fase por fase (permiso → demolición → instalaciones → inspección → acabados) o explica qué la retrasa.
**Bloque principal**: `cuerpo`. En `gancho` puede verse el calendario "ideal" que luego se estira.

## Parámetros
```jsonc
{
  "titulo": { "es": "Cambio de techo", "en": "Roof replacement" },
  "unidad": "fases",                   // "fases": solo orden, sin duraciones (por defecto) · "semanas": cada fase con semanas + fuente
  "fases": [                           // 3-8
    { "etiqueta": { "es": "Permiso", "en": "Permit" }, "icono": "stamp", "ancla": { "es": 30, "en": 27 } },
    { "etiqueta": { "es": "Retiro", "en": "Tear-off" }, "icono": "hammer", "riesgo": { "es": "Madera dañada", "en": "Rotten decking" }, "ancla": { "es": 36, "en": 33 } },
    { "etiqueta": { "es": "Inspección", "en": "Inspection" }, "icono": "clipboard-check", "inspeccion": true, "ancla": { "es": 44, "en": 40 } }
    // con unidad "semanas": "semanas": 2, "fuente": "obra:duracion_semanas"
  ],
  "retraso": { "fase": 1, "texto": { "es": "Todo lo de después se mueve", "en": "Everything after it slides" }, "ancla": { "es": 50, "en": 46 } },
  "total": { "ancla": { "es": 58, "en": 53 } }
}
```

## Escena
- Una **línea de tiempo vertical** (se lee mejor en 9:16) a la izquierda de la escena, con nodos circulares; a la derecha de cada nodo, una tarjeta con icono + etiqueta.
- `unidad: "semanas"`: una regla de semanas acompaña la línea y cada fase ocupa un alto proporcional; las cifras van en `etiqueta` ("SEMANA 3").
- `unidad: "fases"`: todas las fases con la misma altura; sin números de semana.
- `inspeccion: true`: sello circular "INSPECCIÓN" / "INSPECTION" que se estampa (rotación −8°, `spring_pop`).
- `riesgo`: chip en `alerta` junto a la tarjeta.
- `retraso`: la fase indicada se estira con un resorte y empuja hacia abajo todas las siguientes (las tarjetas se desplazan juntas), con un pequeño shake de 3 frames.
- `total`: la línea completa hace un barrido de luz `foco` de arriba abajo.

## Disparadores
| Elemento | Frame |
|---|---|
| nodo + tarjeta de fase | `ancla_f` − 2 |
| el trazo de la línea hasta el siguiente nodo | se dibuja entre una fase y la siguiente (`strokeDashoffset`) |
| sello de inspección | `ancla_f` + 10 |
| empuje de retraso | `retraso.ancla_f` |
| barrido final | `total.ancla_f` |

## Honestidad
- Sin `semanas` verificadas, nada de números de duración en pantalla. Etiqueta **EJEMPLO ILUSTRATIVO** si el orden de fases es genérico y no de una obra real.
- Si viene de una obra real (`fuente: "obra:..."`), crédito de la obra al pie.
