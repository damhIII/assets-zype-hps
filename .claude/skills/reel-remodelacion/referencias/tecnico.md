# Construcción técnica (Remotion)

## Proyecto
- Remotion 4 en TypeScript. Una composición por idioma del encargo: `Reel-es` y/o `Reel-en`, cada una con `width`, `height`, `fps` y **`frames`** exactos de su brief.
- Copia `briefs/<BASE>/<idioma>/brief.json` a `src/brief_<idioma>.json` e impórtalo; pasa el brief por props a un único componente `<Reel brief={…} />`: mismas escenas para los dos idiomas.
- Copia a `public/` el audio (`public/<idioma>/locucion.wav`), los activos de obra que uses y SOLO los assets del repo que uses; referencia todo con `staticFile()`.
- Audio: la locución es la única pista. No la recortes, no la aceleres, sin música.

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
- `fonts/css/*.css`: `@font-face` con woff2 en base64. Usa las de `brief.fuentes` con su `stack`. No descargues fuentes.
- Lo que no exista, dibújalo como SVG nativo con los colores de `brief.tokens`.

## Fuentes
Carga las fuentes antes del primer frame: importa los `.css` (o inyéctalos en un `<style>`) y bloquea con `delayRender`/`continueRender` hasta que `document.fonts.load` resuelva cada familia y peso usado (Fraunces 700/800, DM Sans 500/700/800), con un `catch` que también llame a `continueRender`.

## Reglas de código
- Determinismo total: prohibido `Math.random()` (usa `Math.sin`, índices o `random(seed)` de Remotion).
- Componentes: uno por capa del marco (`ProgressBar`, `Header`, `Titular`, `Subtitulos`, `AvisoLegal`, `Fondo`), uno por bloque y uno por plantilla (`PlantillaPresupuesto`, `PlantillaCronograma`, …) que recibe `brief.plantilla.params`. El ambiente entra con un hook `useAmbiente()` que interpola colores en las fronteras.
- Ningún texto escrito a mano en los componentes: todo viene del brief (titulares, params, `cta_previo`, `aviso_legal`, `ilustrativo`, créditos). Así la versión en inglés no arrastra español.
