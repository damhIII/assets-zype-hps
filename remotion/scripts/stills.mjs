// Renderiza varios stills con UN solo bundle y UN solo navegador (mucho más rápido que un `npx remotion still` por frame).
// Uso (desde remotion/): node scripts/stills.mjs <carpeta_salida> nombre:frame [nombre:frame …]
// Lo llama scripts/revisar.py; no hace falta usarlo a mano.
import path from "node:path";
import fs from "node:fs";
import {bundle} from "@remotion/bundler";
import {openBrowser, renderStill, selectComposition} from "@remotion/renderer";

const [, , salida, ...pares] = process.argv;
fs.mkdirSync(salida, {recursive: true});
const chrome = process.env.CHROME || null;
const opcionesNav = chrome ? {browserExecutable: chrome, chromeMode: "chrome-for-testing"} : {};

try {
  const serveUrl = await bundle({entryPoint: path.resolve("src/index.ts"), onProgress: () => undefined});
  const browser = await openBrowser("chrome", {...opcionesNav, logLevel: "error"});
  const composition = await selectComposition({serveUrl, id: "Reel-es", puppeteerInstance: browser, logLevel: "error", ...opcionesNav});
  for (const par of pares) {
    const i = par.lastIndexOf(":");
    const nombre = par.slice(0, i), frame = Math.min(composition.durationInFrames - 1, Math.max(0, Number(par.slice(i + 1))));
    await renderStill({composition, serveUrl, output: path.join(salida, `${nombre}.png`), frame, puppeteerInstance: browser,
      imageFormat: "png", logLevel: "error", ...opcionesNav});
  }
  await browser.close({silent: true});
} catch (e) {
  const msg = String(e?.stack || e).split("\n").slice(0, 14).join("\n");
  console.error(`ERROR al renderizar los stills:\n${msg}`);
  process.exit(1);
}
