# Layout, bloques y movimiento

Rol: motion designer y creative developer en Remotion para Reels de interiorismo. Estética **EN BRUTO**: editorial, arquitectónica y cálida (plano de arquitecto + revista de interiores moderna). El rojo del logo es el acento de marca; alrededor vive una paleta cálida con matices intermedios: piedra y greige para los fondos, arcilla, terracota suave y rosa arcilla para la calidez, salvia y eucalipto para la calma, arena y madera para los materiales, niebla para lo técnico, miel para chispas de luz y carbón cálido para la tensión. Bloques sólidos de esquinas casi rectas, titulares en display condensada y pesada en MAYÚSCULAS (como las letras del logo), etiquetas en mono espaciada (como su lema) y sans limpia para leer. El rojo es escaso y siempre significa "mira aquí". Los **corchetes rojos `[ ]`** del logo son el motivo gráfico de la marca. Movimiento preciso y con golpe, nunca de diapositiva estática. Todos los valores en `tokens.json`.

## Capas (de atrás hacia delante)
1. **Fondo**: degradado vertical `fondo_a` → `fondo_b` del ambiente del bloque, la `textura` del ambiente muy tenue (opacidad ≤ 0.10) con deriva lenta, y `textures/vignette.svg` al 25 % (al 45 % en ambientes oscuros).
2. **Escena** del bloque (`layout.escena`: Y 600–1320).
3. **Marco** (igual en todo el video, encima de todo): barra de progreso, header (desde `header_entra_f`), titular, subtítulos, aviso legal.

## Layout fijo (px sobre 1080×1920; ver `tokens.zonas_seguras`)
- **Barra de progreso**: línea `foco` de 6 px en Y=0, punta recta.
- **Header** centrado en Y≈250, **a partir de `brief.header_entra_f`** (1,5 s; entra con un fundido corto y se queda hasta el final, salvo en el bucle): el **logo** de la marca sin lema (`brief.marca.logos.fondo_claro_sin_lema`, o `fondo_oscuro_sin_lema` si el ambiente del bloque es `oscuro`; alto `marca.uso.header.alto_px` = 48 px) + un separador fino + la `etiqueta` entre corchetes rojos: `[ PISCINA · FLORIDA ]`, en escala `header` (Space Mono), `texto` al 80 %. El logo cambia de variante con un fundido en la transición de ambiente. Nunca escribas el nombre de la marca con tipografía: el logo lo sustituye.
- **Titular** Y 300–560, alineado a la izquierda con margen 72 px, ancho ≤ 868: línea 1 en `titular_l1` (`texto`, MAYÚSCULAS), línea 2 en `titular_l2` con **marcador** `foco` detrás (rectángulo recto, `radio_marcador` 0, que crece con `scaleX` 0 → 1, origen izquierdo, `spring_entrada`) y texto `texto_sobre_foco` (blanco). Si no cabe, baja hasta `px_min`. Entra desde abajo con spring y sale rápido hacia arriba en cada cambio de bloque.
- **Escena**: Y 600–1320, x 72–940 para todo lo que tenga texto (la columna derecha de 140 px la tapan los botones de Instagram).
- **Subtítulos**: Y 1370–1500.
- **Aviso legal** (si `aviso_legal` no es null): Y≈1545, escala `aviso_legal`, centrado, durante el cuerpo y el CTA.
- Nada vital por encima de Y=220 (salvo la barra) ni por debajo de Y=1580.

## Bloques — una `<Sequence>` por bloque con EXACTAMENTE `ini_f`–`fin_f` del brief
1. **GANCHO**: `brief.gancho.primer_frame` dibujado y **ya en movimiento en el frame 0** (la piedra que se despega, el charco que crece, el humo que entra a la sala): el problema que se ve, no un título. El titular es `brief.gancho.pantalla` y está legible desde el frame 0 (sin animación de entrada larga): mucha gente mira sin sonido. Sin header ni logo hasta `brief.header_entra_f`. Este frame es también la portada.
2. **ESCENA**: la situación del propietario, ilustrada con objetos simples (contrato, teléfono con mensajes, calendario que se estira, llaves). Sin personas fotorrealistas.
3. **MARCO**: la pausa de criterio. Tipográfica y aireada: 2-3 conceptos que se ordenan en "antes → después" con conectores; el concepto clave entre corchetes rojos que se cierran sobre él. Si el tema toca a la marca, una tarjeta discreta con el logo pequeño y "ORIENTAMOS · COORDINAMOS" (nunca "construimos").
4. **CUERPO**: la plantilla del formato (`plantillas/<formato>.md`). Es el tramo que se guarda: legible, ordenado, con la información completa visible al final del bloque ≥ 1 s.
5. **RESULTADO**: el impacto en dinero, tiempo o tranquilidad, sin cifras inventadas: el objeto del gancho **ya resuelto** (la misma composición del frame 0, ahora bien), la lista completa marcada, la planta ya resuelta. Si hay dato verificado, cifra grande en `cifra` con la fuente debajo en `fuente_dato`.
6. **CTA**: siempre en `lino`. De arriba abajo, dentro de la escena (Y 600–1320):
   - El **logo completo con lema** (`brief.marca.logos.fondo_claro`, ancho `marca.uso.cta.ancho_px` ≈ 620 px, centrado): entra al empezar el bloque, los corchetes rojos primero (se abren desde el centro) y las letras después.
   - `cta_previo` ("Entra a nuestro perfil") en escala `etiqueta`, `texto_suave`.
   - La caja `foco` (rectángulo recto) con `cta` ("LINK EN LA BIO" o lo que hayas decidido) en escala `cta`, texto `texto_sobre_foco`: hace pop en `cta_f` (cuando la voz dice "bio", "link", "enlace" o "perfil") y late suave `1 + Math.sin(frame / 6) * 0.04`.
   - Una **flecha hacia abajo y a la izquierda** (SVG nativo, trazo grueso en `foco`) bajo la caja, que rebota a partir de `cta_f` hacia la foto y el nombre de la cuenta (esquina inferior izquierda de Instagram, por donde se entra al perfil). La flecha se queda dentro de las zonas seguras: apunta hacia esa esquina, no la invade.
   - Nada de iconos de comentario ni de DM: el contacto es por el enlace de la bio del perfil.

## Bucle (el final enlaza con el principio)
En `brief.bucle` (los últimos `movimiento.bucle_frames` frames, después del CTA) el CTA sale con un fundido rápido y la escena vuelve a la composición exacta del frame 0 (mismo encuadre, mismo objeto, mismo ambiente que el gancho, con `interpolateColors` si el ambiente cambia). El último frame y el primero casi coinciden: al reiniciarse el Reel, el corte no se nota y la gente lo vuelve a ver. El titular y los subtítulos desaparecen en esos frames.


## Dinamismo
- Cámara viva: el contenedor de la escena flota `Math.sin(frame / 14) * camara_flotante_px` en Y.
- Punch-in suave (1.00 → 1.05) en la palabra que remata cada bloque, con `spring_pop`.
- **Algo nuevo cada ≤ 4 s** mientras habla la voz (`movimiento.max_sin_cambio_s`): elementos de la plantilla, cambios de bloque, el CTA y los `brief.acentos`, que se ejecutan en su `ancla_f` (lo que diga su `que`: corchetes, punch-in, icono, pegatina).
- Nada aparece solo con opacidad: entra desde abajo, desde escala 0.3 con overshoot, o se dibuja con trazo.
- Sombra suave `sombra_tarjeta` en tarjetas; nunca sombras negras duras.
- **Corchetes `[ ]`** (`marca.corchetes`): el gesto de la marca. Úsalos para enmarcar lo que importa en cada bloque (una palabra, una tarjeta, el elemento activo de la plantilla): se abren desde el centro y se cierran sobre el elemento con `spring_pop`. Uno o dos por bloque como mucho, para que sigan significando algo.
- **Rojo escaso, matices ricos**: `foco` (rojo de marca) solo en el marcador del titular, la barra, el subrayado de la palabra activa, los corchetes, el foco de cada escena y el CTA. El resto de la escena se pinta con neutros cálidos y la paleta `apoyo` de `tokens.json`: 2-3 matices por escena, preferiblemente uno de sus `pares_recomendados` (p. ej. arcilla + rosa arcilla para una cocina, salvia + arena para un patio, niebla + carbón para un plano técnico), con degradados suaves entre tonos vecinos. Los matices de apoyo nunca entran en el marco. La `alerta` (también roja, más oscura) siempre va acompañada de su icono (X, triángulo): nunca depende solo del color.

## Subtítulos grandes
- Máximo 3 palabras a la vez y 2 líneas, a partir de `brief.subtitulos`.
- Escala `subtitulo` (Barlow Condensed 800, 76 px, baja a 62 si una palabra larga no cabe en 868 px), MAYÚSCULAS. Palabra actual `subtitulos.activo` (blanco) con escala 1.12, rebote y una barra `subtitulos.subrayado_activo` (roja, 8 px) debajo; pasadas `subtitulos.pasado`; futuras `subtitulos.futuro`.
- Cápsula `subtitulos.capsula` a `capsula_opacidad`, radio `radio_chip`, `backdropFilter: blur(14px)`. La cápsula garantiza la lectura sobre fotos y fondos claros: no la quites.
