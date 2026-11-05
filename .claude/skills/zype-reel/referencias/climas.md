# Climas de escena: variar la paleta sin perder la marca

Problema que resuelven: si todo el video es grafito + petróleo + cian, el feed se vuelve monótono. Un **clima** cambia el ambiente de color de un bloque concreto; el **marco ZYPE** (lo que hace reconocible la marca) no cambia nunca.

Valores en `brand/paletas.json` → `climas`. El brief trae la asignación en `brief.climas` (`{bloque: id}`); si falta, todo es `zype`.

## Qué cambia con el clima
| Rol del clima | Sustituye a | Dónde |
|---|---|---|
| `fondo_a` → `fondo_b`, `tinte` | grafito y degradado petróleo | fondo de pantalla |
| `textura` | textura del fondo | fondo, opacidad ≤ 0.12 |
| `superficie` | `#1B2630` | tarjetas, celdas, burbujas, nodos inactivos |
| `estructura` | cian `#7FB8C8` | bordes, conectores, trazos de ilustración, iconos no destacados |
| `acento` | petróleo `#0B6082` | rellenos secundarios, brillos, burbuja saliente |
| `texto`, `texto_suave` | blanco / gris azulado | textos dentro de la escena |

## Qué NO cambia nunca
Barra de progreso, header, cápsula de subtítulos y sus colores, línea 2 del titular en amarillo, el foco amarillo de la escena (nodo activo, cifra clave), alerta `#E5484D`, éxito `#30A46C`, el bloque CTA completo y los logos.

## Cómo implementarlo
1. Lee `paletas.json` y `brief.climas`; crea un hook `useClima()` que, para el frame actual, devuelva los colores del clima del bloque.
2. **Transición**: en cada frontera entre bloques con climas distintos, interpola cada color con `interpolateColors` durante `reglas_rotacion.transicion_frames` (12) frames centrados en `ini_f` del bloque nuevo. El fondo se funde con el cambio de titular; nunca un corte seco de color.
3. **Assets con colores fijos**: `ui/*.svg` e `illus/*.svg` traen los hex ZYPE dentro. Para un clima distinto de zype, genera copias teñidas antes de usarlas:
   `python3 scripts/tenir_svg.py --clima brasa ui/flow_node.svg illus/empty_chair.svg --out <proyecto>/public/climas`
   y referencia `staticFile("climas/brasa/ui/flow_node.svg")`. Si dibujas el elemento como componente SVG propio, pásale los colores de `useClima()`.
4. **Iconos y logos de canales**: siempre con máscara CSS; `backgroundColor` = `estructura` (o amarillo si es el foco).
5. **Mockup del negocio**: su interior usa `brief.estetica_negocio` (no el clima). El marco del teléfono sí se tiñe con el clima (`ui/phone_frame.svg` teñido o bisel en `superficie`).

## Climas claros (`tipo: "claro"`, hoy solo `papel`)
Son la pausa visual más fuerte, por eso solo se permiten en CRITERIO.
- Header y línea 1 del titular pasan a `texto` (oscuro) al 85 %.
- Línea 2: el amarillo deja de ser color de texto (no se leería sobre papel) y pasa a **marcador**: un rectángulo `#FFE600` detrás de la palabra que crece con `scaleX` 0 → 1 (spring, origen izquierdo) mientras el texto entra en `#0E1215`.
- La barra de progreso sigue amarilla con una sombra fina `rgba(14,18,21,0.25)` debajo para que se vea.
- La cápsula de subtítulos se mantiene oscura (es la que garantiza la lectura).
- Si hay tarjeta HPS, sobre papel resalta mucho: aprovéchalo, es el contraste buscado.

## Personalidad de cada clima (para elegir el tratamiento de la escena)
- **zype**: el marco de siempre.
- **brasa** (HOY): fricción, operación que se quema; brillos cálidos, grano.
- **medianoche** (HOY, SISTEMA): la noche del dueño respondiendo chats, o el flujo de datos; puntos densos, índigo.
- **ciruela** (CRITERIO): pausa estratégica, íntima.
- **papel** (CRITERIO): pausa editorial clara, como una página de revista.
- **océano** (CRITERIO, SISTEMA): calma y orden. No se usa en CRITERIO si hay sello HPS (el teal HPS se perdería).
- **bosque** (RESULTADO): la caja que entra; verde profundo.
