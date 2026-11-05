# Layout, bloques y movimiento

Rol: Lead Motion Designer y Creative Developer experto en Remotion y motion graphics para Reels (estilo Apple Event, Linear, Stripe Press). Formato base ZYPE: interfaz oscura, amarillo como acento, header fijo, titular de dos líneas y subtítulo grande abajo. Movimiento continuo y preciso: nada de diapositivas estáticas ni fundidos lentos. Libertad creativa dentro de estas reglas.

## Capas (de atrás hacia delante)
1. **Fondo**: degradado `fondo_a` → `fondo_b` del clima con un brillo radial de `tinte` que deriva lento, y la `textura` del clima en movimiento lento, opacidad ≤ 0.12. Viñeta suave (`textures/vignette.svg`).
2. **Escena** del bloque (Y≈600–1320).
3. **Marco ZYPE** (siempre igual, encima de todo): barra de progreso, header, titular, subtítulos.

## Layout fijo (px sobre 1080x1920)
- **Barra de progreso**: línea `#FFE600` de 6 px en Y=0, con una chispa brillante en la punta que pulsa con `Math.sin(frame / 3)`.
- **Header** fijo todo el video, centrado en Y≈250: `SISTEMAS PARA {nicho_header}` en Montserrat 800, ~34 px, letter-spacing 0.18em, blanco al 85 %, precedido de un pequeño cuadrado amarillo.
- **Titular** del bloque, Y≈320–560, alineado a la izquierda con margen de 80 px: línea 1 blanca y línea 2 amarilla, Montserrat 900, 80–96 px (redúcelo si no cabe en 920 px de ancho), interlineado 1.0. Entra desde abajo con spring y sale rápido hacia arriba en cada cambio de bloque.
- **Escena**: Y≈600–1320.
- **Subtítulos**: Y≈1390–1490.
- Nada vital por encima de Y=220 (salvo la barra) ni por debajo de Y=1580 (la interfaz de Instagram lo tapa).
- En climas claros, header y línea 1 cambian a color oscuro y la línea 2 pasa a marcador (ver `climas.md`).

## Bloques — una `<Sequence>` por bloque con EXACTAMENTE `ini_f`–`fin_f` del brief
1. **PROBLEMA**: el costo real hecho visible: el objeto vacío (mesa, silla, hueco en la agenda), un contador de dinero perdido que sube con `interpolate`, la notificación sin respuesta. Alerta `#E5484D` para la tensión y shake de 3–5 frames en el golpe.
2. **HOY**: la operación manual: chats que se acumulan, libreta, llamadas perdidas, reloj acelerado. Saturación con ritmo.
3. **CRITERIO**: el bloque que diferencia a ZYPE. Más tipográfico y aireado (la única pausa relativa del video, siempre con micro-movimiento): la idea estratégica como 2–3 conceptos que se ordenan en una secuencia "primero → después" con líneas conectoras. Si `hps`: la tarjeta HPS de `marca.md`.
4. **SISTEMA**: diagrama de flujo vivo entrada → decisión → acción con los `pasos` como nodos (tarjetas con icono, borde en color `estructura` del clima, el nodo activo en amarillo), conectados con líneas SVG animadas `strokeDashoffset={-frame * 8}`. Cada nodo se enciende en su `pasos_f`. Junto al flujo, un mockup de teléfono o panel donde ocurre de verdad (mensaje que entra, respuesta automática, confirmación con los `items_ejemplo`, su precio y la moneda de la ficha). Éxito con pop de escala 1.15 y verde `#30A46C`.
5. **RESULTADO**: el impacto en caja o tiempo: KPI grande que cuenta rápido (dinero recuperado, horas liberadas, huecos llenos) y un mini gráfico. Si hay `fuente_en_pantalla`, muéstrala bajo la cifra en Montserrat 500, 22 px, blanco al 60 %.
6. **CTA**: tarjeta final ZYPE, siempre en clima zype. Encima "Comenta o envía por DM"; la palabra `cta` en una caja `#FFE600` con texto `#0E1215` en Montserrat 900, latido `1 + Math.sin(frame / 5) * 0.06` y flechas animadas apuntándola. Logo ZYPE en la tarjeta. Si `hps`: la línea de cierre HPS.

La plantilla del brief (`plantillas.md`) modifica algunos de estos bloques.

## Dinamismo
- Cámara viva: el contenedor de la escena flota `Math.sin(frame / 12) * 6` px en Y, con rotación ±0.4°.
- Punch-ins en frases clave: escala 1.00 → 1.07 con `spring({ fps, frame: frame - triggerFrame, config: { damping: 10, stiffness: 200 } })`.
- Nada aparece solo con opacidad: entra desde abajo o desde escala 0.3 con overshoot.

## Subtítulos grandes (siempre estilo ZYPE, en cualquier clima)
- Máximo 2–3 palabras a la vez, en la zona de subtítulos, a partir de `brief.subtitulos` (palabras del guion con tiempos).
- Montserrat 800, 64 px, MAYÚSCULAS. Palabra actual `#FFE600` con escala 1.2, rebote spring y resplandor amarillo; pasadas `#FFFFFF`; futuras `#5E7C8C`.
- Cápsula `rgba(14,18,21,0.72)` con `backdropFilter: 'blur(16px)'`. La cápsula es la que garantiza la lectura sobre climas claros: no la quites.
