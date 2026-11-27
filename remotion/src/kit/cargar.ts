// Carga de fuentes y de SVG del repo (iconos, símbolos de planta, texturas) con delayRender: ningún frame se
// captura antes de que estén listos, así no hay iconos en blanco ni fuentes por defecto en el render.
import {useEffect, useState} from "react";
import {cancelRender, continueRender, delayRender, staticFile} from "remotion";
import {brief} from "./brief";
import {marcarFuentesListas} from "./texto";

const textos = new Map<string, string>();
const pendientes = new Map<string, Promise<string>>();

export const cargarTexto = (ruta: string): Promise<string> => {
  if (!pendientes.has(ruta)) {
    pendientes.set(ruta, fetch(staticFile(ruta)).then((r) => {
      if (!r.ok) throw new Error(`No existe ${ruta} en public/ (¿el nombre está bien? ¿corriste preparar_proyecto.py?)`);
      return r.text();
    }).then((t) => {
      textos.set(ruta, t);
      return t;
    }));
  }
  return pendientes.get(ruta)!;
};

/** Texto de un archivo de public/ (SVG). Devuelve null en el primer render y bloquea la captura hasta tenerlo. */
export const useTexto = (ruta: string): string | null => {
  const [, refrescar] = useState(0);
  const [handle] = useState(() => (textos.has(ruta) ? null : delayRender(`Cargando ${ruta}`)));
  useEffect(() => {
    if (handle === null) return;
    cargarTexto(ruta).then(() => {
      refrescar((x) => x + 1);
      continueRender(handle);
    }).catch((e) => cancelRender(e));
  }, [handle, ruta]);
  return textos.get(ruta) ?? null;
};

/** SVG como data URL (fondos repetidos: texturas). */
export const useSvgUrl = (ruta: string): string | null => {
  const t = useTexto(ruta);
  return t ? `url("data:image/svg+xml;utf8,${encodeURIComponent(t)}")` : null;
};

/** Separa la raíz de un SVG: atributos (sin width/height/class) y contenido. */
export const partesSvg = (svg: string): {atributos: string; viewBox: string; interior: string} => {
  const limpio = svg.replace(/<!--[\s\S]*?-->/g, "").replace(/<\?xml[^>]*>/g, "");
  const m = limpio.match(/<svg([^>]*)>([\s\S]*)<\/svg>/);
  if (!m) return {atributos: "", viewBox: "0 0 24 24", interior: ""};
  const vb = m[1].match(/viewBox="([^"]+)"/);
  const atributos = m[1].replace(/\s(width|height|class|xmlns|viewBox|data-[a-z-]+)="[^"]*"/g, "").replace(/\s+/g, " ");
  return {atributos, viewBox: vb ? vb[1] : "0 0 24 24", interior: m[2]};
};

// --- Fuentes: los .css de fonts/css traen los woff2 en base64
let fuentesPromesa: Promise<void> | null = null;
const PESOS: Record<string, number[]> = {display: [700, 800], texto: [500, 700, 800], mono: [700]};

export const cargarFuentes = (): Promise<void> => {
  if (!fuentesPromesa) {
    fuentesPromesa = Promise.all(brief.fuentes.map(async (f) => {
      const css = await cargarTexto(f.css);
      const id = `fuente-${f.rol}`;
      if (!document.getElementById(id)) {
        const s = document.createElement("style");
        s.id = id;
        s.textContent = css;
        document.head.appendChild(s);
      }
      await Promise.all((PESOS[f.rol] ?? [400]).map((p) => document.fonts.load(`${p} 40px "${f.familia}"`)));
      const ok = (PESOS[f.rol] ?? [400]).every((p) => document.fonts.check(`${p} 40px "${f.familia}"`));
      if (!ok) throw new Error(`La fuente ${f.familia} no cargó`);
    })).then(() => marcarFuentesListas());
  }
  return fuentesPromesa;
};

export const useFuentes = () => {
  const [listo, setListo] = useState(false);
  const [handle] = useState(() => delayRender("Cargando fuentes"));
  useEffect(() => {
    cargarFuentes().then(() => {
      setListo(true);
      continueRender(handle);
    }).catch((e) => cancelRender(e));
  }, [handle]);
  return listo;
};
