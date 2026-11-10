# decisiones.json (versión 4) — tu dirección del video

Uno por video, en `briefs/<BASE>/decisiones.json`, **común a todos los idiomas**. Lo que cambia por idioma se escribe como `{"es": ..., "en": ...}`; con un solo idioma puedes escribir el valor directo. Las anclas (`desde`, `ancla…`) son los índices `[n]` de palabra que imprime `alinear.py` para cada idioma. `scripts/preparar_brief.py` lo valida y lo convierte en un `brief.json` por idioma.

```jsonc
{
  "version": 4,
  "idiomas": ["es", "en"],                          // los de encargo.json
  "formato": "checklist",                           // id de plantillas.json (los 8 formatos)
  "tema": { "id": 6, "titulo": "Contratista sin licencia", "tesis": "..." },   // de editorial/temas.json (id 0 = fuera del catálogo). Informativo
  "etiqueta": { "es": "CONTRATISTAS · FLORIDA", "en": "CONTRACTORS · FLORIDA" },   // header, MAYÚSCULAS, ≤ 4 palabras
  "cta": { "es": "LICENCIA", "en": "LICENSE" },     // la palabra clave que dice la voz al final en cada idioma
  "obra": null,                                     // id de assets/obras/<id>/ autorizada, o null = animación pura
  "aviso_legal": null,                              // null = lo que diga la plantilla; true/false para forzarlo
  "fuentes_en_pantalla": [],                        // ids verificados extra que quieras citar al pie (los de la plantilla se añaden solos)
  "cola_s": 1.5,                                    // segundos de imagen tras la última palabra (1-2)
  "ambientes": { "gancho": "noche" },               // solo los bloques que NO van en lino → tokens.json → ambientes
  "bloques": [
    { "id": "gancho",    "desde": { "es": 0,  "en": 0 },  "titular": { "es": ["Pagaste el depósito", "Y desapareció"], "en": ["You paid the deposit", "Then he vanished"] } },
    { "id": "escena",    "desde": { "es": 12, "en": 11 }, "titular": { "es": ["Te lo recomendó", "Un conocido"],        "en": ["A friend's referral", "No questions asked"] } },
    { "id": "marco",     "desde": { "es": 25, "en": 22 }, "titular": { "es": ["Antes de firmar", "Verifica"],           "en": ["Before you sign", "Verify"] } },
    { "id": "cuerpo",    "desde": { "es": 33, "en": 30 }, "titular": { "es": ["Lo que revisas", "Tú mismo"],            "en": ["What you check", "Yourself"] } },
    { "id": "resultado", "desde": { "es": 78, "en": 70 }, "titular": { "es": ["Menos riesgo", "Obra protegida"],        "en": ["Less risk", "Protected project"] } },
    { "id": "cta",       "desde": { "es": 90, "en": 81 }, "titular": { "es": ["Guárdalo y comenta", "LICENCIA"],       "en": ["Save it and comment", "LICENSE"] } }
  ],
  "plantilla": {
    "params": {                                     // según plantillas.json → plantillas.<formato>.params
      "titulo": { "es": "Antes de contratar", "en": "Before you hire" },
      "items": [
        { "texto": { "es": "Licencia activa", "en": "Active license" }, "icono": "badge-check", "ancla": { "es": 36, "en": 33 } },
        { "texto": { "es": "Contrato por escrito", "en": "Written contract" }, "icono": "file-signature", "ancla": { "es": 47, "en": 43 } },
        { "texto": { "es": "Pagos por etapas", "en": "Staged payments" }, "icono": "hand-coins", "ancla": { "es": 58, "en": 52 } }
      ],
      "bandera_roja": { "texto": { "es": "Todo en efectivo", "en": "Cash only" }, "ancla": { "es": 70, "en": 63 } }
    }
  },
  "notas": "1-3 líneas: por qué este formato, estos ambientes y esta obra"
}
```

## Cómo decidir
**Bloques.** Siempre los 6, en orden, el primero en la palabra 0 de cada idioma. El guion trae un párrafo por bloque: normalmente `desde` = primera palabra de cada párrafo. Si el guion mezcla dos partes, corta en la palabra que cambia de idea; si se salta una, dale un bloque corto (≥ 1,5 s) con la frase más cercana y dilo en la entrega. Mismo bloque = misma idea en los dos idiomas.

**Titulares.** Dos líneas de ≤ 4 palabras (≈ 22 caracteres) por idioma, sin punto final, cifras en número solo si son un dato verificado. Línea 1 = contexto (`texto`); línea 2 = el golpe, con marcador `foco`. Complementan la voz, no la copian. En `cta`, línea 2 = la palabra clave de ese idioma.

**Etiqueta.** El header es `{MARCA} · {etiqueta}` o, si la marca está pendiente, solo la etiqueta. Usa tema + lugar: "PERMISOS · BROWARD", "HURRICANE PREP".

**Formato y parámetros.** Los de `encargo.formato` (o el que eligió el guionista si era `auto`). Rellena `plantilla.params` con la ficha `plantillas/<formato>.md`: cada elemento que aparece en pantalla lleva el ancla de la palabra en que la voz lo nombra **en cada idioma**.

**Cifras.** Un número en pantalla (monto, semanas, porcentaje) solo con `fuente` = id verificado de `datos_verificados.json` u `obra:<campo>` verificado. `preparar_brief.py` rechaza el resto. Mientras no haya datos: modos sin cifras (`preguntas`, `fases`, `riesgo`, niveles cualitativos).

**Obra.** Si `encargo.obras` trae obras y alguna encaja con el guion (mismo tipo de espacio o tema), elígela y úsala en la plantilla (`activo`, `imagen`, `obra:…`). Si no encaja ninguna, `null` y animación pura. Nunca uses una obra para "ilustrar" algo que no le pasó.

**Ambientes.** `cta` siempre en `lino`. Como mucho 2 bloques fuera de lino, cada ambiente solo en sus bloques (`tokens.json`): `noche` para la tensión del gancho o la escena (huracán, estafa, error caro), `arena` para un cuerpo cálido, `salvia` para la calma del marco o el resultado. No repitas la combinación de los últimos 3 videos.

## Lo que comprueba `preparar_brief.py`
Errores (bloquean): versión, idiomas sin material, formato desconocido, bloques incompletos o fuera de orden, anclas fuera del guion o no crecientes, titulares de más de 4 palabras o sin versión por idioma, palabra CTA ausente del guion o del titular final, etiqueta ausente, ambientes inexistentes, fuera de sus bloques o de más, `cta` fuera de lino, parámetros de plantilla que no cumplen `plantillas.json` (tipos, obligatorios, listas, iconos, estilos, activos), **cifras sin dato verificado**, cifras que no coinciden con la obra, obra inexistente o no autorizada, bloques de menos de 0,5 s.
Avisos: textos sin versión por idioma, textos que suenan a garantía/licencia/ejecución, combinación de ambientes repetida, formato distinto del pedido, formato que prefiere obra sin obra, titulares largos, bloques de menos de 1,5 s, duraciones de bloque muy distintas entre idiomas.
