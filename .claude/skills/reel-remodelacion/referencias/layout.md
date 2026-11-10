# Layout, bloques y movimiento

Rol: motion designer y creative developer en Remotion para Reels de interiorismo. Estética: editorial cálida y luminosa (revista de interiores + plano de arquitecto): fondos de lino, terracota y salvia, tipografía serif con carácter para los titulares, sans limpia para leer, mucho aire. Movimiento preciso y suave, nunca de diapositiva estática. Todos los valores en `tokens.json`.

## Capas (de atrás hacia delante)
1. **Fondo**: degradado vertical `fondo_a` → `fondo_b` del ambiente del bloque, la `textura` del ambiente muy tenue (opacidad ≤ 0.10) con deriva lenta, y `textures/vignette.svg` al 25 % (al 45 % en ambientes oscuros).
2. **Escena** del bloque (`layout.escena`: Y 600–1320).
3. **Marco** (igual en todo el video, encima de todo): barra de progreso, header, titular, subtítulos, aviso legal.

## Layout fijo (px sobre 1080×1920; ver `tokens.zonas_seguras`)
- **Barra de progreso**: línea `foco` de 6 px en Y=0 con la punta redondeada.
- **Header** centrado en Y≈250: si `marca.pendiente`, solo `etiqueta`; si no, `MARCA · ETIQUETA`. Escala `header`, `texto` al 80 %, precedido de un pequeño rombo `primario`.
- **Titular** Y 300–560, alineado a la izquierda con margen 72 px, ancho ≤ 868: línea 1 en `titular_l1` (`texto`), línea 2 en `titular_l2` con **marcador** `foco` detrás (rectángulo que crece con `scaleX` 0 → 1, origen izquierdo, `spring_entrada`) y texto `texto_sobre_foco`. Si no cabe, baja hasta `px_min`. Entra desde abajo con spring y sale rápido hacia arriba en cada cambio de bloque.
- **Escena**: Y 600–1320, x 72–940 para todo lo que tenga texto (la columna derecha de 140 px la tapan los botones de Instagram).
- **Subtítulos**: Y 1370–1500.
- **Aviso legal** (si `aviso_legal` no es null): Y≈1545, escala `aviso_legal`, centrado, durante el cuerpo y el CTA.
- Nada vital por encima de Y=220 (salvo la barra) ni por debajo de Y=1580.

## Bloques — una `<Sequence>` por bloque con EXACTAMENTE `ini_f`–`fin_f` del brief
1. **GANCHO**: el riesgo o el costo hecho visible en un golpe (un sello de "OBRA PARADA", una hoja de presupuesto de una sola línea que se rompe, nubes y viento sobre una ventana, un mito en grande). Primer frame con acción: es la portada.
2. **ESCENA**: la situación del propietario, ilustrada con objetos simples (contrato, teléfono con mensajes, calendario que se estira, llaves). Sin personas fotorrealistas.
3. **MARCO**: la pausa de criterio. Tipográfica y aireada: 2-3 conceptos que se ordenan en "antes → después" con conectores. Si el tema toca a la marca, una tarjeta discreta "ORIENTAMOS · COORDINAMOS" (nunca "construimos").
4. **CUERPO**: la plantilla del formato (`plantillas/<formato>.md`). Es el tramo que se guarda: legible, ordenado, con la información completa visible al final del bloque ≥ 1 s.
5. **RESULTADO**: el impacto en dinero, tiempo o tranquilidad, sin cifras inventadas: la lista completa marcada, el calendario sin huecos, el antes/después lado a lado. Si hay dato verificado, cifra grande en `cifra` con la fuente debajo en `fuente_dato`.
6. **CTA**: siempre en `lino`. Encima `cta_previo`; la palabra `cta` en una caja `foco` con texto `texto_sobre_foco` en `display` 800, que hace pop en `cta_f` y late suave `1 + Math.sin(frame / 6) * 0.04`. Un icono de comentario y otro de DM (`message-circle`, `send`) a los lados. Si la marca no está pendiente, wordmark tipográfico de la marca en `display` debajo (no hay logo en el repo: no inventes uno).

## Dinamismo
- Cámara viva: el contenedor de la escena flota `Math.sin(frame / 14) * camara_flotante_px` en Y.
- Punch-in suave (1.00 → 1.05) en la palabra que remata cada bloque, con `spring_pop`.
- Nada aparece solo con opacidad: entra desde abajo, desde escala 0.3 con overshoot, o se dibuja con trazo.
- Sombra cálida `sombra_tarjeta` en tarjetas; nunca sombras negras duras.

## Subtítulos grandes
- Máximo 3 palabras a la vez y 2 líneas, a partir de `brief.subtitulos`.
- Escala `subtitulo` (64 px, baja a 54 si una palabra inglesa larga no cabe en 868 px), MAYÚSCULAS. Palabra actual `subtitulos.activo` con escala 1.12 y rebote; pasadas `subtitulos.pasado`; futuras `subtitulos.futuro`.
- Cápsula `subtitulos.capsula` a `capsula_opacidad`, radio `radio_chip`, `backdropFilter: blur(14px)`. La cápsula garantiza la lectura sobre fotos y fondos claros: no la quites.
