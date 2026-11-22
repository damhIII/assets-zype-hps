# Plantilla `checklist` · Checklist

**Cuándo**: el guion da comprobaciones que el propietario puede hacer o pedir él mismo (antes de contratar, de comprar un material, de una tormenta…).
**Bloque principal**: `cuerpo`; el `resultado` puede mostrar la lista completa marcada (ideal para que la guarden: deja 1,5 s quieta y legible).

## Parámetros
```jsonc
{
  "titulo": "Antes de la tormenta",
  "items": [                           // 3-7
    { "texto": "Tejas bien fijas",
      "como_verificar": "Míralas desde el suelo, con prismáticos",
      "fuente": null,                  // id verificado de datos_verificados.json si cita una norma → su corta al pie
      "icono": "badge-check", "ancla": 24 }
  ],
  "bandera_roja": { "texto": "Manchas nuevas en el techo", "ancla": 66 }
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
- No digas que la marca verifica licencias salvo que `editorial/prompt_guion.md` → Declaraciones permitidas diga `verifica_licencias: si`.
