# Plantilla `comparador` · Comparador de materiales

**Cuándo**: el guion compara 2-3 opciones (pisos, encimeras, ventanas, techos, placas) en varios criterios.
**Bloque principal**: `cuerpo`.

## Parámetros
```jsonc
{
  "opciones": [                        // 2-3
    { "nombre": { "es": "Vinílico", "en": "Vinyl plank" }, "icono": "layers", "ancla": { "es": 20, "en": 18 } },
    { "nombre": { "es": "Porcelanato", "en": "Porcelain" }, "imagen": "muestra_porcelanato.jpg", "ancla": { "es": 22, "en": 20 } }
  ],
  "criterios": [                       // 2-5; "valores" en el mismo orden que "opciones"
    { "nombre": { "es": "Humedad", "en": "Moisture" }, "mejor_si_alto": true,
      "valores": [ { "nivel": "alto" }, { "nivel": "alto" } ],
      "ancla": { "es": 30, "en": 27 } },
    { "nombre": { "es": "Costo relativo", "en": "Relative cost" }, "mejor_si_alto": false,
      "valores": [ { "nivel": "bajo" }, { "nivel": "medio", "texto": { "es": "según formato", "en": "varies by size" } } ],
      "ancla": { "es": 38, "en": 35 } }
  ],
  "veredicto": { "texto": { "es": "Depende de tu planta baja", "en": "It depends on your ground floor" }, "ancla": { "es": 70, "en": 64 } }
}
```

## Escena
- **Columnas** por opción (2 o 3, ancho repartido dentro de `texto_vital`), cada una con una muestra de material arriba: textura dibujada en SVG (vetas de madera, veteado de piedra, losetas) o la `imagen` de una obra real recortada en círculo.
- Cada criterio es una fila que entra al nombrarlo: su nombre a la izquierda en `etiqueta` y, por columna, un **medidor de 3 segmentos** (bajo/medio/alto) o la palabra "DEPENDE". Con `mejor_si_alto: false`, el segmento lleno se pinta al revés (menos es mejor) y una flecha pequeña lo indica.
- Cifras solo si el valor trae `cifra` + `fuente` verificada.
- `veredicto`: las columnas se atenúan y entra una tarjeta con el criterio de decisión. **Nunca una corona ni "la mejor"**.

## Disparadores
| Elemento | Frame |
|---|---|
| columna de opción | `ancla_f` − 2 |
| fila de criterio (los medidores se llenan escalonados 4 frames por columna) | `ancla_f` |
| veredicto | `veredicto.ancla_f` |

## Honestidad
- Niveles cualitativos por defecto; nada de "30 % más resistente" sin fuente.
- Sin marcas comerciales de productos en pantalla.
