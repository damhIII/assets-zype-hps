# decisiones.json (versión 4) — tu dirección del video

Uno por video, en `briefs/<BASE>/decisiones.json`. El video sale solo en español: cada texto es una cadena y cada ancla un número. Las anclas (`desde`, `ancla…`) son los índices `[n]` de palabra que imprime `alinear.py`. `scripts/preparar_brief.py` lo valida y lo convierte en `briefs/<BASE>/es/brief.json`.

```jsonc
{
  "version": 4,
  "idiomas": ["es"],                                // siempre ["es"] (el de encargo.json)
  "formato": "checklist",                           // id de plantillas.json (los 7 formatos)
  "tema": { "id": 6, "titulo": "Contratista sin licencia", "tesis": "..." },   // de editorial/temas.json (id 0 = fuera del catálogo). Informativo
  "etiqueta": "CONTRATISTAS · FLORIDA",             // header, MAYÚSCULAS, ≤ 4 palabras
  "cta": "LICENCIA",                                // la palabra clave que dice la voz al final
  "aviso_legal": null,                              // null = lo que diga la plantilla; true/false para forzarlo
  "fuentes_en_pantalla": [],                        // ids verificados extra que quieras citar al pie (los de la plantilla se añaden solos)
  "cola_s": 1.5,                                    // segundos de imagen tras la última palabra (1-2)
  "ambientes": { "gancho": "noche" },               // solo los bloques que NO van en lino → tokens.json → ambientes
  "bloques": [
    { "id": "gancho",    "desde": 0,  "titular": ["Pagaste el depósito", "Y desapareció"] },
    { "id": "escena",    "desde": 12, "titular": ["Te lo recomendó", "Un conocido"] },
    { "id": "marco",     "desde": 25, "titular": ["Antes de firmar", "Verifica"] },
    { "id": "cuerpo",    "desde": 33, "titular": ["Lo que revisas", "Tú mismo"] },
    { "id": "resultado", "desde": 78, "titular": ["Menos riesgo", "Obra protegida"] },
    { "id": "cta",       "desde": 90, "titular": ["Guárdalo y comenta", "LICENCIA"] }
  ],
  "plantilla": {
    "params": {                                     // según plantillas.json → plantillas.<formato>.params
      "titulo": "Antes de contratar",
      "items": [
        { "texto": "Licencia activa", "icono": "badge-check", "ancla": 36 },
        { "texto": "Contrato por escrito", "icono": "file-signature", "ancla": 47 },
        { "texto": "Pagos por etapas", "icono": "hand-coins", "ancla": 58 }
      ],
      "bandera_roja": { "texto": "Todo en efectivo", "ancla": 70 }
    }
  },
  "notas": "1-3 líneas: por qué este formato y estos ambientes"
}
```

## Cómo decidir
**Bloques.** Siempre los 6, en orden, el primero en la palabra 0. El guion trae un párrafo por bloque: normalmente `desde` = primera palabra de cada párrafo. Si el guion mezcla dos partes, corta en la palabra que cambia de idea; si se salta una, dale un bloque corto (≥ 1,5 s) con la frase más cercana y dilo en la entrega. Si un guion largo deja un bloque muy extenso (por ejemplo, el cuerpo), está bien: la plantilla y las anclas se encargan de mantenerlo vivo.

**Titulares.** Dos líneas de ≤ 4 palabras (≈ 22 caracteres), sin punto final, cifras en número solo si son un dato verificado. Línea 1 = contexto (`texto`); línea 2 = el golpe, con marcador `foco`. Complementan la voz, no la copian. En `cta`, línea 2 = la palabra clave.

**Etiqueta.** El header es `EN BRUTO · {etiqueta}`. Usa tema + lugar: "PERMISOS · BROWARD", "HURACANES · FLORIDA".

**Formato y parámetros.** El que eligió el guionista (`encargo.formato_guion`), salvo que el guion pida claramente otro. Rellena `plantilla.params` con la ficha `plantillas/<formato>.md`: cada elemento que aparece en pantalla lleva el ancla de la palabra en que la voz lo nombra.

**Cifras.** Un número en pantalla (monto, semanas, porcentaje) solo con `fuente` = id verificado de `datos_verificados.json`. `preparar_brief.py` rechaza el resto. Mientras no haya datos: modos sin cifras (`preguntas`, `fases`, `riesgo`, niveles cualitativos).

**Ilustración.** Todo es animación: plantas, tarjetas, iconos, texturas. Lo que represente un caso concreto (una cocina, un presupuesto, un calendario) es un ejemplo hipotético y se marca con `ilustrativo` (**EJEMPLO ILUSTRATIVO**). Nada de fotos.

**Ambientes.** `cta` siempre en `lino`. Como mucho 2 bloques fuera de lino, cada ambiente solo en sus bloques (`tokens.json`): `noche` para la tensión del gancho o la escena (huracán, estafa, error caro), `arena` para un cuerpo cálido, `salvia` para la calma del marco o el resultado. No repitas la combinación de los últimos 3 videos.

## Lo que comprueba `preparar_brief.py`
Errores (bloquean): versión, guion sin material, formato desconocido, bloques incompletos o fuera de orden, anclas fuera del guion o no crecientes, titulares de más de 4 palabras, palabra CTA ausente del guion o del titular final, etiqueta ausente, ambientes inexistentes, fuera de sus bloques o de más, `cta` fuera de lino, parámetros de plantilla que no cumplen `plantillas.json` (tipos, obligatorios, listas, iconos, estilos), **cifras sin dato verificado**, bloques de menos de 0,5 s.
Avisos: textos que suenan a garantía/licencia/ejecución, combinación de ambientes repetida, formato distinto del que eligió el guionista, titulares largos, bloques de menos de 1,5 s.
