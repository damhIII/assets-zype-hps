# Marcas: ZYPE (marco) y Hitch Point Studio (sello)

## ZYPE — marco de TODO el video
Digital Execution Studio. "Construimos tu marca lista para operar: Identidad · Web · CRM · IA."
Estética de producto tech premium (Stripe, Linear, Apple): geométrica, con peso físico y movimiento preciso. Sobriedad editorial, nada de efectos baratos.

| Rol | Color |
|---|---|
| Grafito (base) | `#0E1215` → `#041420` |
| Petróleo (degradado sutil, rellenos) | `#0B6082` / `#005C82` |
| Cian (estructura: bordes, líneas, trazos) | `#7FB8C8` |
| **Amarillo ZYPE (foco, escaso)** | `#FFE600` |
| Alerta | `#E5484D` |
| Éxito | `#30A46C` |

- Tipografía: Montserrat (400–900).
- Amarillo escaso: solo línea 2 del titular, palabra actual del subtítulo, barra de progreso, el foco de cada escena (nodo activo, cifra clave) y el CTA. Si todo es amarillo, nada lo es.
- El clima de un bloque puede sustituir grafito, petróleo y cian en la zona de escena y el fondo (ver `climas.md`). El amarillo, el rojo de alerta y el verde de éxito no cambian nunca.
- Logo: `logo_transparente.png`. Si `brief.logos.zype` es false: wordmark "ZYPE." en Montserrat 900 con el punto amarillo.

## Hitch Point Studio (HPS) — solo si `brief.hps` es true (lo decides tú: ver `decisiones.md`)
"Creamos marcas con alma". Prepara las condiciones (estrategia, marca, oferta, contenido); ZYPE activa el sistema.
- Negro `#000000`, blanco `#FFFFFF`, teal `#1A9488` como ÚNICO acento.
- Playfair Display (mensajes) y Space Mono en mayúsculas (textos pequeños).
- Su logo va siempre como imagen (`logo_hps.png`); nunca lo recrees con tipografía. Si `brief.logos.hps` es false: texto "HITCH POINT STUDIO" en Space Mono 700 mayúsculas.
- Los colores y fuentes HPS solo existen dentro de su tarjeta y su línea de cierre.

**Escena (en CRITERIO):** tarjeta HPS (fondo `#000000`, borde fino blanco al 20 %, teal como acento) con `logo_hps.png`, la etiqueta "PREPARA" en Space Mono mayúsculas 22 px teal y la frase "Creamos marcas con alma" en Playfair Display 400, 40 px, blanca. Una flecha la une a una etiqueta ZYPE "ACTIVA" en amarillo: primero preparamos, después activamos.

**Cierre (en CTA):** bajo el logo ZYPE, la línea "con Hitch Point Studio" en Space Mono 18 px blanco al 70 % y el logo HPS a ~140 px de ancho.

## Negocio del video
- Siempre es ILUSTRATIVO: lo defines tú en `decisiones.json` → `negocio` a partir del rubro que diga el guion. Nunca lo presentes como caso real ni sus cifras como resultados.
- La "app" del negocio dentro del mockup se identifica con `negocio.nombre_mostrado` como wordmark tipográfico + un monograma geométrico genérico (inicial dentro de una forma simple). La voz nunca dice ese nombre.
- Interior del mockup: si hay `brief.estetica_negocio`, su paleta, tipografías, radios y motivo (así el dueño siente que el sistema es suyo). Si es null, el clima del bloque.

## Prohibido
- Logotipos del negocio o recreaciones de ellos, su nombre real, fotos reales.
- Los logos de `logos/` son solo de canales y herramientas (WhatsApp, Instagram, Google…), nunca del negocio.
- Colores o fuentes del negocio fuera del mockup.
