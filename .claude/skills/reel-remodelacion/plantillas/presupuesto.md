# Plantilla `presupuesto` · Presupuesto desglosado animado

**Cuándo**: el guion recorre las partidas de una obra (materiales, mano de obra, permisos, escombros, imprevistos…) o enseña a leer un presupuesto.
**Bloque principal**: `cuerpo`. En `gancho` puede aparecer un presupuesto de "una sola línea" que se rompe; en `resultado`, la tabla completa ya ordenada.

## Parámetros (`decisiones.json → plantilla.params`)
```jsonc
{
  "titulo": { "es": "Tu presupuesto de cocina", "en": "Your kitchen quote" },
  "modo": "preguntas",                 // "preguntas": sin montos (por defecto mientras no haya datos) · "montos": cada partida con monto_usd + fuente
  "partidas": [                        // 3-7, en el orden en que la voz las nombra
    { "etiqueta": { "es": "Materiales", "en": "Materials" }, "icono": "paint-roller",
      "pregunta": { "es": "¿Marca y modelo por escrito?", "en": "Brand and model in writing?" },
      "ancla": { "es": 31, "en": 28 } },
    { "etiqueta": { "es": "Permisos", "en": "Permits" }, "icono": "stamp", "ancla": { "es": 40, "en": 36 } }
    // con modo "montos": "monto_usd": 1200, "fuente": "obra:costo_total_usd" o un id verificado
  ],
  "alerta": { "partida": 3, "texto": { "es": "La que casi nunca aparece", "en": "The one most quotes skip" }, "ancla": { "es": 52, "en": 47 } },
  "total": { "ancla": { "es": 60, "en": 55 } }   // sin monto_usd = barra de total sin cifra
}
```

## Escena
- Una **hoja de presupuesto** (tarjeta `superficie`, radio `radio_tarjeta`, sombra) que ocupa la escena. Encabezado con `titulo` en `display`.
- Cada partida es una fila: icono (máscara CSS en `estructura`), etiqueta en `cuerpo` y, a la derecha, el monto o la `pregunta` en `texto_suave`.
- Una **barra apilada** horizontal debajo de la tabla crece segmento a segmento. En modo `preguntas` los segmentos tienen el mismo ancho y no llevan cifras; en modo `montos`, ancho proporcional al monto y cifra en `cifra` reducida.
- `alerta`: la fila indicada parpadea una vez en `alerta`, entra un sello "FALTA" / "MISSING" (escala 0.3 → 1 con `spring_pop`) y la barra deja un hueco rayado.
- `total`: línea doble y el total cuenta en `conteo_frames`; sin monto, la palabra "TOTAL" se subraya con el marcador `foco`.

## Disparadores
| Elemento | Frame |
|---|---|
| fila de partida + su segmento de barra | `ancla_f` − `anticipacion_frames` |
| pregunta de la partida | `ancla_f` + 8 |
| sello de alerta | `alerta.ancla_f` |
| total | `total.ancla_f` (el conteo termina antes de la siguiente palabra larga) |

## Honestidad
- En modo `preguntas`, etiqueta **EJEMPLO ILUSTRATIVO** (`textos_fijos.ilustrativo`) en la esquina de la hoja.
- En modo `montos`, cada monto lleva su fuente en `fuente_dato` al pie de la hoja (`corta` del dato o "Obra real · <titulo>"). Sin fuente, `preparar_brief.py` no deja pasar el monto.
- Nunca pongas "precio final", "garantizado" ni "sin sorpresas" en la hoja.
