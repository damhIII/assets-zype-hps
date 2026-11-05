# Construcción técnica (Remotion)

## Proyecto
- Remotion 4 en TypeScript, composición `Video`: `brief.video.width` x `height`, `fps`, **`brief.video.frames`** exactos.
- Copia `brief.json` a `src/brief.json` e impórtalo; lee de ahí rangos, textos, colores y tiempos.
- Copia a `public/` el audio y SOLO los assets que uses; referencia todo con `staticFile()`.
- Audio: la locución es la única pista. No la recortes, no la aceleres ni le añadas música.

## Assets del repo
- `icons/*.svg` (Lucide, `stroke="currentColor"`) y `logos/*.svg` (Simple Icons, monocromos): **siempre con máscara CSS**, no con `<Img>` (con `<Img>`, `currentColor` se pinta negro):
  ```tsx
  <div style={{ width: 64, height: 64, backgroundColor: color,
    WebkitMaskImage: `url(${staticFile("icons/zap.svg")})`, maskImage: `url(${staticFile("icons/zap.svg")})`,
    WebkitMaskSize: "contain", maskSize: "contain", WebkitMaskRepeat: "no-repeat", maskRepeat: "no-repeat",
    WebkitMaskPosition: "center", maskPosition: "center" }} />
  ```
- `ui/`, `textures/`, `illus/`: con `<Img src={staticFile(...)} />`. En climas distintos de zype, usa las copias teñidas de `scripts/tenir_svg.py` (ver `climas.md`).
- `logo_transparente.png` (ZYPE) y `logo_hps.png` (HPS).
- `fonts/css/*.css`: `@font-face` con los woff2 en base64. Usa las de `brief.fuentes` (con su `stack` en `fontFamily`). `fonts/*.ttf` no se usan.
- Si un asset no te sirve o no existe, dibújalo como SVG nativo con los colores del clima.

## Fuentes
Carga las fuentes antes del primer frame: importa los `.css` (o inyéctalos en un `<style>`) y bloquea con `delayRender`/`continueRender` hasta que `document.fonts.load` resuelva cada familia, con un `catch` que también llame a `continueRender`.

## Reglas de código
- Determinismo total: prohibido `Math.random()` (usa `Math.sin`, `Math.cos`, índices o `random(seed)` de Remotion). Hooks solo dentro de componentes.
- Un componente por capa del marco (`ProgressBar`, `Header`, `Titular`, `Subtitulos`, `Fondo`) y uno por bloque; el clima entra por props o por `useClima()`.

## Revisión y render
1. `python3 scripts/validar_brief.py <brief> --stills` imprime un comando `npx remotion still` por bloque y por cada transición de clima. Ejecútalos y mira las imágenes: corrige solapes, textos fuera de la zona segura, fuentes que no cargaron, subtítulos desincronizados, amarillo ilegible en climas claros.
2. Render: `npx remotion render Video out/{base}.mp4 --codec=h264 --crf=18`.
3. Entrega el MP4 y el proyecto en zip (sin `node_modules`). Si el entorno no puede renderizar, entrega el proyecto listo y el comando exacto para renderizar en local.
