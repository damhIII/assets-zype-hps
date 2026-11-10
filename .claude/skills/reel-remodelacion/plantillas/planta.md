# Plantilla `planta` · Planta 2D que se amuebla o cambia de estilo

**Cuándo**: el guion describe un espacio y cómo cambia: se amuebla, se redistribuye (abrir cocina, mover el panel eléctrico) o cambia de estilo.
**Bloque principal**: `cuerpo`; en `escena` puede verse la planta vacía o "mal resuelta".

## Parámetros
```jsonc
{
  "espacio": "sala",                    // cocina | bano | sala | dormitorio | sala_comedor | estudio | lavanderia | exterior | apartamento
  "modo": "cambiar_estilo",             // amueblar | cambiar_estilo (2-3 estilos) | redistribuir
  "estilos": [                          // ids de tokens.estilos_interior
    { "estilo": "costero", "ancla": 30 },
    { "estilo": "moderno_calido", "ancla": 41 }
  ],
  "elementos": [                        // 0-10, en el orden en que se nombran
    { "tipo": "sofa", "etiqueta": "Sofá en L", "ancla": 22 },
    { "tipo": "alfombra", "ancla": 25 }
  ],
  "muro_que_cae": { "etiqueta": "¿Muro de carga? Lo confirma un profesional", "ancla": 18 },
  "ilustrativo": true
}
```

## Escena
- Vista cenital **2D** sobre papel (`textures/blueprint.svg` muy tenue). Muros de `muro_planta` px en `texto`, puertas con arco de apertura en `estructura`, ventanas como doble línea.
- La planta se dibuja al empezar el bloque con `strokeDashoffset` (12-16 frames), luego entran los elementos.
- Cada elemento es un símbolo SVG simple y reconocible (sofá = rectángulo con respaldo, cama con almohadas, isla con taburetes…), dibujado por ti, con los colores del estilo activo: `piso` (relleno del suelo), `muro`, `madera`, `textil`, `metal`, `verde`, `acento`.
- `cambiar_estilo`: en cada `ancla_f` el relleno del piso y los colores de los elementos se interpolan al nuevo estilo durante 14 frames, y una etiqueta con `estilos_interior.<id>.nombre` entra arriba de la planta. Una pequeña muestra de materiales (3 círculos) acompaña cada estilo.
- `muro_que_cae`: el muro parpadea en `alerta`, aparece el aviso (`etiqueta`) y después se disuelve en polvo de partículas deterministas (índices, no `Math.random()`).
- Cotas: **sin números**.

## Disparadores
| Elemento | Frame |
|---|---|
| dibujo de muros | inicio del bloque |
| cada elemento (entra desde escala 0.3 con `spring_entrada`) | `ancla_f` − 2 |
| cambio de estilo | `estilos[i].ancla_f` |
| aviso y caída del muro | `muro_que_cae.ancla_f`, caída +18 frames |

## Honestidad
- `ilustrativo: true` → **EJEMPLO ILUSTRATIVO** visible (siempre: las plantas son hipotéticas).
- Nunca insinúes que un muro se puede tirar sin revisión profesional.
