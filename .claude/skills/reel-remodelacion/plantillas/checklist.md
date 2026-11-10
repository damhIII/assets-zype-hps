# Plantilla `checklist` · Checklist para verificar a un contratista (o una compra, o una asociación)

**Cuándo**: el guion da comprobaciones que el propietario puede hacer él mismo.
**Bloque principal**: `cuerpo`; el `resultado` puede mostrar la lista completa marcada (ideal para que la guarden: deja 1,5 s quieta y legible).

## Parámetros
```jsonc
{
  "titulo": { "es": "Antes de contratar", "en": "Before you hire" },
  "items": [                           // 3-7
    { "texto": { "es": "Licencia activa", "en": "Active license" },
      "como_verificar": { "es": "Búscala en la web oficial del estado", "en": "Look it up on the state's official site" },
      "fuente": null,                  // "verificar_licencia" cuando esté verificado → su corta al pie
      "icono": "badge-check", "ancla": { "es": 24, "en": 22 } }
  ],
  "bandera_roja": { "texto": { "es": "Te pide todo en efectivo", "en": "Wants it all in cash" }, "ancla": { "es": 66, "en": 60 } }
}
```

## Escena
- Una **tarjeta portapapeles** (clip superior, `superficie`) con `titulo` en `display`.
- Cada ítem: casilla vacía → al llegar su ancla, la casilla se marca con un check dibujado (`strokeDashoffset`, 8 frames, color `exito`), el texto entra y `como_verificar` aparece debajo en `texto_suave` más pequeño.
- `bandera_roja`: banderín en `alerta` que entra desde la derecha, con pequeño ondeo (seno), y el ítem queda tachado si corresponde.
- Al final del bloque, la lista completa queda visible ≥ 1,5 s (pensada para captura de pantalla: todo dentro de `texto_vital`).

## Disparadores
| Elemento | Frame |
|---|---|
| ítem + check | `ancla_f` − 2 (check completo en +8) |
| cómo verificar | `ancla_f` + 10 |
| bandera roja | `bandera_roja.ancla_f` |

## Honestidad
- `aviso_legal` activo por defecto.
- `como_verificar` no inventa procedimientos: si no hay dato verificado, usa fórmulas generales ("pídelo por escrito", "compruébalo en la fuente oficial del estado / del condado").
- No digas que la marca verifica licencias salvo que `marca.md` declare `verifica_licencias: si`.
