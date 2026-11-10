# Plantilla `errores` · Errores caros

**Cuándo**: el guion enumera errores con su consecuencia y cierra con qué hacer antes.
**Bloque principal**: `cuerpo`; `gancho` suele ir en ambiente `noche`.

## Parámetros
```jsonc
{
  "contador": "riesgo",                // ninguno | riesgo (medidor cualitativo) | costo (solo si TODOS tienen costo_usd + fuente)
  "errores": [                         // 2-5
    { "titulo": { "es": "Pintar sobre la mancha", "en": "Painting over the stain" },
      "consecuencia": { "es": "Vuelve, y ahora detrás del drywall", "en": "It comes back, now behind the drywall" },
      "nivel": "alto", "icono": "droplets", "ancla": { "es": 20, "en": 18 } }
  ],
  "antidoto": { "texto": { "es": "Primero la causa: ventilación", "en": "Fix the cause first: ventilation" }, "ancla": { "es": 70, "en": 64 } }
}
```

## Escena
- Cada error es una **tarjeta numerada** (1, 2, 3… en `display` grande, color `alerta`) con icono, título y la consecuencia debajo en `texto_suave`. Las tarjetas entran apiladas: la anterior se reduce y sube.
- `contador: "riesgo"`: un medidor semicircular (sin números) avanza un tramo por error según `nivel` (bajo/medio/alto); la aguja tiembla 3 frames al llegar a alto.
- `contador: "costo"`: un contador de dólares suma cada `costo_usd` con `conteo_frames`; fuente al pie.
- `antidoto`: todas las tarjetas se voltean a gris y entra una tarjeta en `exito` con check, el texto del antídoto y marcador `foco` en la acción.

## Disparadores
| Elemento | Frame |
|---|---|
| tarjeta de error | `ancla_f` − 2 |
| consecuencia | `ancla_f` + 10 (o la primera palabra de la consecuencia si es más tarde) |
| avance del medidor / suma | `ancla_f` + 6 |
| antídoto | `antidoto.ancla_f` |

## Honestidad
- Sin `costo_usd` verificado, nada de dólares: la consecuencia se cuenta en retrabajo, tiempo o riesgo.
- No atribuyas el error a un contratista o empresa concreta.
