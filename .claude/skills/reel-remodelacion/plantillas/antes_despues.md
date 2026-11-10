# Plantilla `antes_despues` · Antes / después con costo y tiempo

**Cuándo**: el guion cuenta una transformación. Es el único formato que **prefiere** activos reales (`assets/obras/<id>/`).
**Bloque principal**: `cuerpo`; el `gancho` puede abrir con un destello del después.

## Parámetros
```jsonc
{
  "fuente_visual": "obra",             // "obra": fotos/videos de decisiones.obra · "ilustracion": dibujo en SVG (sin obra)
  "antes":   { "activo": "antes_01.jpg",   "etiqueta": { "es": "Antes", "en": "Before" }, "ancla": { "es": 14, "en": 12 } },
  "despues": { "activo": "despues_01.jpg", "etiqueta": { "es": "Después", "en": "After" }, "ancla": { "es": 48, "en": 44 } },
  "proceso": [ { "activo": "proceso_01.mp4", "etiqueta": { "es": "Demolición", "en": "Demo" }, "ancla": { "es": 30, "en": 27 } } ],
  "transicion": "cortina",             // cortina | deslizar | fundido_luz
  "datos": [                           // 0-3, SOLO con fuente verificada
    { "etiqueta": { "es": "Tiempo de obra", "en": "Build time" }, "valor": 6, "unidad": "semanas",
      "fuente": "obra:duracion_semanas", "ancla": { "es": 56, "en": 51 } }
  ],
  "creditos": true
}
```

## Escena
- Foto o video a sangre dentro de un marco con `radio_foto`, ocupando la escena (recorte 4:5 centrado si la foto es horizontal; nunca deformes). Ken Burns suave (`ken_burns.escala`).
- Chip "ANTES" / "BEFORE" en `texto` sobre `superficie`; chip "DESPUÉS" / "AFTER" en `texto_sobre_foco` sobre `foco`.
- `cortina`: una línea vertical `foco` barre de izquierda a derecha revelando el después; `deslizar`: el antes sale por la izquierda; `fundido_luz`: destello cálido de 6 frames.
- `proceso`: miniaturas o clips cortos (≤ 2 s cada uno, sin audio) en tira.
- `datos`: tarjetas pequeñas que cuentan su cifra (`cifra` reducida) con la fuente debajo.
- `creditos: true`: línea al pie con `textos_fijos.creditos_obra` rellenada con `creditos` del manifest.
- **Sin obra** (`fuente_visual: "ilustracion"`): dibuja el espacio en estilo planta axonométrica simple con los colores de `estilos_interior`, etiqueta **EJEMPLO ILUSTRATIVO** y ningún dato numérico salvo DATOS verificados.

## Disparadores
| Elemento | Frame |
|---|---|
| foto antes | `antes.ancla_f` − 2 |
| clips de proceso | `proceso[i].ancla_f` |
| transición al después | `despues.ancla_f` − 8 (la revelación termina en la palabra) |
| tarjetas de datos | `datos[i].ancla_f` |

## Honestidad y privacidad (ver `referencias/activos_reales.md`)
- Solo obras con `uso_autorizado: true`. Respeta `privacidad`: si `direccion_visible`, `caras_visibles` o `matriculas_visibles` son `true`, desenfoca esas zonas o descarta el activo.
- La obra la ejecutó un contratista: en pantalla, "coordinado por" para la marca, nunca "construido por".
