# Plantilla `mito_realidad` · Mito vs. realidad

**Cuándo**: el guion corrige una o varias creencias ("si es por dentro no necesita permiso").
**Bloque principal**: `cuerpo`; el primer mito puede abrir ya en `gancho` (es un gancho excelente).

## Parámetros
```jsonc
{
  "pares": [                                       // 1-3
    { "mito": { "es": "Si es por dentro, no necesita permiso", "en": "Interior work doesn't need a permit" },
      "realidad": { "es": "Depende del condado y del tipo de obra", "en": "It depends on your county and the job" },
      "icono": "stamp",
      "fuente": null,                              // id verificado si la realidad cita una norma concreta
      "ancla_mito": { "es": 0, "en": 0 }, "ancla_realidad": { "es": 9, "en": 8 } }
  ],
  "animacion_mito": "tachado"                      // "tachado" | "voltear"
}
```

## Escena
- **Tarjeta MITO**: chip "MITO" / "MYTH" en `alerta`, el texto del mito en `display` grande entre comillas tipográficas, ligeramente inclinada (−1.5°).
- Giro: `tachado` = una línea de marcador `alerta` cruza el texto de izquierda a derecha (6 frames) y la tarjeta se encoge y baja de opacidad; `voltear` = la tarjeta gira en Y 180° y por detrás aparece la realidad.
- **Tarjeta REALIDAD**: chip "REALIDAD" / "REALITY" en `exito`, texto en `cuerpo` grande, recta y con sombra; una palabra clave de la realidad lleva marcador `foco`.
- Con varios pares, cada mito tachado se apila arriba en miniatura (contador 1/3, 2/3…).
- Si la realidad depende de una norma, icono `scale` o `stamp` y, si hay `fuente`, su `corta` al pie.

## Disparadores
| Elemento | Frame |
|---|---|
| tarjeta mito | `ancla_mito_f` − 2 |
| tachado / volteo | `ancla_realidad_f` − 6 |
| tarjeta realidad | `ancla_realidad_f` |

## Honestidad
- `aviso_legal` activo por defecto (`textos_fijos.aviso_legal`): estos videos suelen tocar normas.
- La realidad nunca contiene cifras sin `fuente` verificada; si el guion las dice, avisa en la entrega.
