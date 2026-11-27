# decisiones.json (versión 5) — tu dirección del video

Uno por video, en `briefs/<BASE>/decisiones.json`. Las anclas (`desde`, `ancla…`) son los índices `[n]` de palabra que imprime `alinear.py`. `scripts/preparar_brief.py` lo valida y lo convierte en `briefs/<BASE>/es/brief.json`.

```jsonc
{
  "version": 5,
  "formato": "errores",                             // id de plantillas.json; normalmente encargo.formato
  "etiqueta": "PISCINA · FLORIDA",                  // header, MAYÚSCULAS, ≤ 4 palabras
  "cta": "LINK EN LA BIO",                          // texto de la caja del CTA (≤ 5 palabras). Si lo omites, tokens.textos_fijos.cta_defecto
  "cta_ancla": null,                                // opcional: palabra en que la voz manda al enlace. null = la última "bio/link/enlace/perfil"
  "aviso_legal": null,                              // null = lo que diga la plantilla; true/false para forzarlo
  "fuentes_en_pantalla": [],                        // ids verificados extra que quieras citar al pie
  "cola_s": 1.5,                                    // segundos de imagen tras la última palabra (1-2)
  "ambientes": { "gancho": "noche" },               // solo los bloques que NO van en lino
  "bloques": [                                      // uno por párrafo del guion, en orden
    { "id": "gancho",    "desde": 0,   "titular": ["Otra vez", "La piedra suelta"] },   // = encargo.gancho.pantalla
    { "id": "escena",    "desde": 14,  "titular": ["La pegas", "Y vuelve a caer"] },
    { "id": "marco",     "desde": 33,  "titular": ["El problema", "Está debajo"] },
    { "id": "cuerpo",    "desde": 58,  "titular": ["Antes de pegar", "Revisa esto"] },
    { "id": "resultado", "desde": 112, "titular": ["Borde firme", "Todo el verano"] },
    { "id": "cta",       "desde": 126, "titular": ["Tu piscina", "Hablemos"] }
  ],
  "plantilla": {
    "params": {                                     // según plantillas.json → plantillas.<formato>.params
      "contador": "riesgo",
      "errores": [
        { "titulo": "Pegar encima", "consecuencia": "Se suelta otra vez", "nivel": "medio", "icono": "hammer", "ancla": 64 },
        { "titulo": "Junta con cemento", "consecuencia": "El borde se agrieta", "nivel": "alto", "icono": "triangle-alert", "ancla": 81 }
      ],
      "antidoto": { "texto": "Sellador flexible en la junta", "ancla": 99 }
    }
  },
  "acentos": [                                      // opcional: golpes visuales extra en palabras concretas
    { "ancla": 40, "que": "corchetes rojos sobre 'junta'" },         // lo dibujas tú en la escena con A(40)
    { "ancla": 88, "que": "chip: SELLADOR FLEXIBLE | droplets" }      // «chip:» → chip automático ~2 s (texto | icono)
  ]
}
```

## Cómo decidir
**Bloques.** Siempre los 6, en orden, el primero en la palabra 0. El guion trae un párrafo por bloque (gancho, escena, marco, cuerpo, resultado y cierre → `cta`): `desde` = primera palabra de cada párrafo. Si el guion mezcla dos partes, corta en la palabra que cambia de idea; si se salta una, dale un bloque corto (≥ 1,5 s) con la frase más cercana. Un cuerpo largo está bien: la plantilla y las anclas lo mantienen vivo.

**Apertura.** La voz empieza siempre con `encargo.apertura` (tipo «No me lo pediste, pero aquí te lo dejo», unas 2-3 s) y después dice el gancho. La apertura va dentro del bloque gancho (`desde: 0`), no es el titular (el titular sigue siendo `encargo.gancho.pantalla`) y no se ilustra aparte: desde el frame 0 ya se ve el problema del `primer_frame` y se mueve; aprovecha esos segundos para que crezca, y deja lo fuerte (corchetes, el giro) para las anclas del gancho real.

**Gancho.** El titular del gancho es `encargo.gancho.pantalla` (partido en dos líneas de ≤ 4 palabras; si no cabe, recórtalo sin cambiar la idea). La escena del gancho es `encargo.gancho.primer_frame`: el problema en acción desde el frame 0 (la piedra que se despega, el charco que crece). Sin header ni logo en ese primer segundo y medio.

**Titulares.** Dos líneas de ≤ 4 palabras (≈ 22 caracteres), sin punto final. Línea 1 = contexto; línea 2 = el golpe, con marcador `foco`. Complementan la voz, no la copian, y pueden tener la misma chispa que el guion. En `cta`, el titular conecta el tema con la invitación ("Tu piscina" / "Hablemos"); el "link en la bio" ya va en la caja del CTA.

**Cifras.** Un número en pantalla (monto, semanas, porcentaje) solo con `fuente` = id verificado de `datos_verificados.json`: `preparar_brief.py` rechaza el resto. La cifra de oficio que dice la voz (por ejemplo "24 H" para una prueba de inundación) puede ir en un titular o en un texto de la plantilla tal como la dice la voz, sin fuente, una o dos veces por video. Nunca precios, plazos de obra, porcentajes de ahorro ni normas sin dato verificado.

**Ritmo.** Mientras habla la voz, nunca más de 4 s sin algo nuevo en pantalla. Cuentan los cambios de bloque, las anclas de la plantilla, el pop del CTA y los `acentos`. Si `preparar_brief.py` avisa de un hueco, añade un elemento de la plantilla o un acento en una palabra de ese tramo (un `chip:` con la idea clave, corchetes que se cierran, un icono o una pegatina).

**CTA.** El cierre invita a entrar al perfil y contactar por el enlace de la bio. La caja dice dónde está el enlace (por defecto "LINK EN LA BIO"; puedes ajustarla al tono, siempre diciendo que está en la bio), con `cta_previo` ("Entra a nuestro perfil") encima. El pop cae en `cta_f`: la última vez que la voz dice "bio", "link", "enlace" o "perfil".

**Etiqueta.** Logo + `[ {etiqueta} ]` en el header. Usa espacio + lugar: "PISCINA · FLORIDA", "PATIO · MIAMI".

**Formato y parámetros.** El de `encargo.formato`, salvo que el guion pida claramente otro. Rellena `plantilla.params` con la ficha `plantillas/<formato>.md`: cada elemento lleva el ancla de la palabra en que la voz lo nombra. En los textos de realidad, antídoto y veredicto, pon entre `*asteriscos*` las 1-3 palabras que llevan marcador rojo.

**Ilustración.** Todo es animación. Lo que represente un caso concreto se marca con **EJEMPLO ILUSTRATIVO**. Nada de fotos.

**Ambientes.** `cta` siempre en `lino`. Como mucho 3 bloques fuera de lino, cada ambiente solo en sus bloques: `noche` (carbón cálido; gancho, escena) para la tensión, `arena` (escena, cuerpo) para lo cálido, `arcilla` (escena, cuerpo, resultado) para lo hogareño, `salvia` (marco, resultado) para la calma, `niebla` (marco, cuerpo) para lo técnico (planos, comparaciones, criterio). Con `encargo.peligro`, `noche` en el gancho (y la escena si sigue la tensión) y `salvia` o `lino` en el resultado: el cambio de ambiente cuenta el paso del miedo a la calma.

## Lo que comprueba `preparar_brief.py`
Errores (bloquean): versión, guion sin material, formato desconocido, bloques incompletos o fuera de orden, anclas fuera del guion o no crecientes, titulares de más de 4 palabras, `cta` de más de 5 palabras, etiqueta ausente, ambientes inexistentes, fuera de sus bloques o de más, `cta` fuera de lino, parámetros que no cumplen `plantillas.json`, **cifras de la plantilla sin dato verificado**, acentos mal formados, bloques de menos de 0,5 s.
Avisos: huecos de más de 4 s sin nada nuevo, titular del gancho distinto del del encargo, titulares con cifras (revisa que sea la cifra de oficio), la voz no menciona el enlace ni la bio, `cta` que no dice dónde está el enlace, textos que suenan a garantía/licencia/ejecución, combinación de ambientes repetida (ignóralo), formato distinto del encargo, titulares largos, bloques de menos de 1,5 s.
