// Tipografía de tokens.json → CSS, medida de textos con las fuentes reales y partición en líneas.
import React from "react";
import {T} from "./brief";

const familia = (rol: string): string => T.tipografia[rol]?.stack ?? T.tipografia.texto.stack;
export const FAMILIAS = {display: familia("display"), texto: familia("texto"), mono: familia("mono")};

export type Escala = "header" | "titular_l1" | "titular_l2" | "subtitulo" | "cifra" | "etiqueta" | "cuerpo" | "fuente_dato"
  | "aviso_legal" | "sello" | "cta";

/** Estilo CSS de una escala tipográfica de tokens.json (px opcional para reducirla). */
export const escala = (nombre: Escala, px?: number): React.CSSProperties => {
  const e = T.tipografia.escalas[nombre];
  return {
    fontFamily: familia(e.familia),
    fontSize: px ?? e.px,
    fontWeight: e.peso,
    lineHeight: e.interlineado ?? 1.15,
    letterSpacing: e.tracking ?? "normal",
    textTransform: e.mayusculas ? "uppercase" : "none",
    opacity: e.opacidad ?? 1,
    fontVariantNumeric: e.numeros ?? "normal",
  };
};
export const escalaPx = (nombre: Escala): {px: number; min: number} => {
  const e = T.tipografia.escalas[nombre];
  return {px: e.px, min: e.px_min ?? e.px};
};

let lienzo: CanvasRenderingContext2D | null = null;
let fuentesListas = false;
const cache = new Map<string, number>();
export const marcarFuentesListas = () => {
  fuentesListas = true;
  cache.clear();
};

/** Ancho en px de un texto con la fuente real (después de cargarlas). tracking en em. */
export const anchoTexto = (texto: string, rol: "display" | "texto" | "mono", peso: number, px: number, tracking = 0, mayus = false) => {
  const t = mayus ? texto.toUpperCase() : texto;
  const clave = `${rol}|${peso}|${px}|${tracking}|${t}`;
  const c = cache.get(clave);
  if (c !== undefined) return c;
  if (!lienzo) lienzo = document.createElement("canvas").getContext("2d");
  lienzo!.font = `${peso} ${px}px ${FAMILIAS[rol]}`;
  const w = lienzo!.measureText(t).width + tracking * px * t.length;
  if (fuentesListas) cache.set(clave, w);
  return w;
};

/** Mayor tamaño (entre max y min) con el que el texto cabe en `ancho`. */
export const ajustarPx = (texto: string, rol: "display" | "texto" | "mono", peso: number, max: number, min: number, ancho: number,
  tracking = 0, mayus = false) => {
  const w = anchoTexto(texto, rol, peso, max, tracking, mayus);
  if (w <= ancho) return max;
  return Math.max(min, Math.floor((max * ancho) / w));
};

/** Parte un texto en líneas que caben en `ancho` (para tachados, marcadores por línea, etc.). */
export const partirLineas = (texto: string, rol: "display" | "texto" | "mono", peso: number, px: number, ancho: number,
  tracking = 0, mayus = false): string[] => {
  const palabras = texto.split(/\s+/).filter(Boolean);
  const lineas: string[] = [];
  let actual = "";
  for (const p of palabras) {
    const prueba = actual ? `${actual} ${p}` : p;
    if (actual && anchoTexto(prueba, rol, peso, px, tracking, mayus) > ancho) {
      lineas.push(actual);
      actual = p;
    } else actual = prueba;
  }
  if (actual) lineas.push(actual);
  return lineas;
};

/** Separa el texto marcado con *asteriscos* (la palabra clave que lleva marcador rojo). Sin asteriscos: [texto]. */
export const partesMarcadas = (texto: string): {t: string; marca: boolean}[] => {
  const out: {t: string; marca: boolean}[] = [];
  const re = /\*([^*]+)\*/g;
  let ult = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(texto))) {
    if (m.index > ult) out.push({t: texto.slice(ult, m.index), marca: false});
    out.push({t: m[1], marca: true});
    ult = m.index + m[0].length;
  }
  if (ult < texto.length) out.push({t: texto.slice(ult), marca: false});
  return out.length ? out : [{t: texto, marca: false}];
};
export const sinAsteriscos = (texto: string) => texto.replace(/\*/g, "");
