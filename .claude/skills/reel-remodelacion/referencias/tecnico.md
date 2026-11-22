# Construcción técnica (Remotion)

## Proyecto
- Remotion 4 en TypeScript. Una composición, `Reel-es`, con `width`, `height`, `fps` y **`frames`** exactos del brief.
- Copia `briefs/<BASE>/es/brief.json` a `src/brief_es.json` e impórtalo; pasa el brief por props a un único componente `<Reel brief={…} />`.
- Copia a `public/` el audio (`public/es/locucion.wav`) y SOLO los assets del repo que uses; referencia todo con `staticFile()`. No hay fotos ni videos: todo se dibuja.
- Audio: la locución va intacta (sin recortes ni cambios de velocidad). Por debajo, una pista de música y efectos puntuales del catálogo `audio/`, con los volúmenes y reglas de `referencias/audio.md`. Copia a `public/audio/` solo los archivos que uses.

## Assets del repo
- `icons/*.svg` (Lucide, `stroke="currentColor"`) y `logos/*.svg` (canales, monocromos): **siempre con máscara CSS**, no con `<Img>`:
  ```tsx
  <div style={{ width: 64, height: 64, backgroundColor: color,
    WebkitMaskImage: `url(${staticFile("icons/house.svg")})`, maskImage: `url(${staticFile("icons/house.svg")})`,
    WebkitMaskSize: "contain", maskSize: "contain", WebkitMaskRepeat: "no-repeat", maskRepeat: "no-repeat",
    WebkitMaskPosition: "center", maskPosition: "center" }} />
  ```
- `ui/*.svg` y `textures/*.svg`: con `<Img>`. Vienen en los colores del ambiente `lino`; para otro ambiente genera copias teñidas: `python3 scripts/tenir_svg.py --ambiente noche ui/kpi_card.svg --out <proyecto>/public/ambientes`.
- `logos/` son canales y herramientas (Instagram, WhatsApp, Google Maps…), nunca de un contratista o fabricante.
- **Logo de la marca**: `brand/en_bruto/*.png` (rutas en `brief.marca.logos`). Es multicolor: va con `<Img src={staticFile(...)}>`, **nunca con máscara CSS**, sin teñir, sin deformar (respeta `marca.proporcion`) y con al menos `marca.uso.aire_min_px` de aire. Cópialo a `public/brand/en_bruto/`. Para animar los corchetes por separado, dibújalos como SVG nativo encima del logo sin lema solo si coinciden exactamente; si no, anima el logo entero (escala + recorte).
- `fonts/css/*.css`: `@font-face` con woff2 en base64. Usa las de `brief.fuentes` con su `stack`. No descargues fuentes.
- `illus/planta/*.svg`: símbolos de planta a escala real (1 unidad del viewBox = 1 cm; `catalogo.json` trae ancho y fondo). Inclúyelos inline para recolorearlos con el estilo activo (ver `plantillas/planta.md`).
- `illus/emoji/flat/*.svg` (vector) y `illus/emoji/3d/*.png` (256 px, no los escales por encima de ~260 px): pegatinas puntuales con `<Img>`, como mucho una o dos por video y nunca en el marco.
- Lo que no exista, dibújalo como SVG nativo con los colores de `brief.tokens`.

## Fuentes
Carga las fuentes antes del primer frame: importa los `.css` de `brief.fuentes` (o inyéctalos en un `<style>`) y bloquea con `delayRender`/`continueRender` hasta que `document.fonts.load` resuelva cada familia y peso usado (Barlow Condensed 700/800, DM Sans 500/700/800, Space Mono 700), con un `catch` que también llame a `continueRender`.

## Reglas de código
- Determinismo total: prohibido `Math.random()` (usa `Math.sin`, índices o `random(seed)` de Remotion).
- Componentes: uno por capa del marco (`ProgressBar`, `Header`, `Titular`, `Subtitulos`, `AvisoLegal`, `Fondo`), uno por bloque (`Gancho`, `Problema`, `Valor`, `Cierre`), uno por plantilla (`PlantillaErrores`, `PlantillaCronograma`, …) que recibe `brief.plantilla.params`, uno para los `brief.acentos` y uno para el `Bucle`. El ambiente entra con un hook `useAmbiente()` que interpola colores en las fronteras.
- Ningún texto escrito a mano en los componentes: todo viene del brief (titulares, `gancho`, params, `acentos`, `cta`, `cta_previo`, `aviso_legal`, `ilustrativo`).
- Componentes de marca: `Logo` (elige la variante por ambiente y tamaño) y `Corchetes` (SVG nativo animable con `marca.corchetes`).
