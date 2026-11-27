// Datos del video (brief.json y audio.json que copia scripts/preparar_proyecto.py) y utilidades de tiempo y color.
import briefJson from "../brief_es.json";
import audioJson from "../audio_es.json";
import {interpolateColors} from "remotion";

export type BloqueId = "gancho" | "escena" | "marco" | "cuerpo" | "resultado" | "cta";
export type Bloque = {
  id: BloqueId;
  ini_f: number;
  fin_f: number;
  ini_s: number;
  fin_s: number;
  titular: [string, string];
  texto: string;
  palabras: [number, number];
};
export type Acento = {ancla: number; ancla_f: number; que: string};
export type Ambiente = {
  nombre: string;
  tipo: "claro" | "oscuro";
  fondo_a: string;
  fondo_b: string;
  superficie: string;
  linea: string;
  estructura: string;
  texto: string;
  texto_suave: string;
  alerta: string;
  exito: string;
  primario: string;
  foco: string;
  textura: string;
};
export type Brief = {
  base: string;
  carpeta: string;
  audio: string;
  marca: {logos: Record<string, string>; uso: any};
  formato: string;
  video: {width: number; height: number; fps: number; frames: number; voz_s: number; cola_s: number};
  header_entra_f: number;
  bucle: {ini_f: number; fin_f: number};
  gancho: {pantalla: string; primer_frame: string};
  etiqueta: string;
  cta: string;
  cta_ancla: number;
  cta_f: number;
  cta_previo: string;
  tema: {titulo: string; tesis: string};
  aviso_legal: string | null;
  ilustrativo: string;
  ambientes: Record<BloqueId, string>;
  fuentes: {rol: string; familia: string; css: string; stack: string}[];
  fuentes_en_pantalla: {id: string; corta: string}[];
  bloques: Bloque[];
  plantilla: {id: string; params: any};
  acentos: Acento[];
  tokens: any;
  subtitulos: [string, number, number][];
};
export type PlanAudio = {
  musica: {id: string; volumen: number} | null;
  sfx: {id: string; ancla?: number; cta?: boolean; volumen?: number}[];
};

export const brief = briefJson as unknown as Brief;
export const planAudio = audioJson as unknown as PlanAudio;
export const T = brief.tokens;
export const FPS = brief.video.fps;
export const TOTAL = brief.video.frames;
export const ANTICIPA: number = T.movimiento.anticipacion_frames ?? 2;
export const PALABRAS = brief.subtitulos;

/** Frame global en que la voz empieza la palabra i (índice [n] de alinear.py). */
export const palabraF = (i: number): number => {
  const k = Math.max(0, Math.min(PALABRAS.length - 1, Math.round(i)));
  return Math.round(PALABRAS[k][1] * FPS);
};
/** Frame global en que la voz termina la palabra i. */
export const palabraFinF = (i: number): number => {
  const k = Math.max(0, Math.min(PALABRAS.length - 1, Math.round(i)));
  return Math.round(PALABRAS[k][2] * FPS);
};

export const bloque = (id: BloqueId): Bloque => brief.bloques.find((b) => b.id === id) as Bloque;
export const indiceBloqueEn = (f: number): number => {
  for (let k = brief.bloques.length - 1; k >= 0; k--) if (f >= brief.bloques[k].ini_f) return k;
  return 0;
};
export const enBucle = (f: number) => f >= brief.bucle.ini_f;

export const ambienteDe = (id: BloqueId): Ambiente => T.ambientes[brief.ambientes[id] ?? "lino"] as Ambiente;
export const COLORES_AMBIENTE = ["fondo_a", "fondo_b", "superficie", "linea", "estructura", "texto", "texto_suave",
  "alerta", "exito", "primario", "foco"] as const;
export type Colores = Record<(typeof COLORES_AMBIENTE)[number], string> & {oscuro: number; mezcla: {id: string; peso: number}[]};

const mezclar = (a: Ambiente, b: Ambiente, t: number, ida: string, idb: string): Colores => {
  const out: any = {};
  for (const k of COLORES_AMBIENTE) out[k] = t <= 0 ? a[k] : t >= 1 ? b[k] : interpolateColors(t, [0, 1], [a[k], b[k]]);
  out.oscuro = (a.tipo === "oscuro" ? 1 - t : 0) + (b.tipo === "oscuro" ? t : 0);
  out.mezcla = ida === idb ? [{id: ida, peso: 1}] : [{id: ida, peso: 1 - t}, {id: idb, peso: t}];
  return out as Colores;
};

/** Colores del ambiente en el frame global f, con el fundido de transicion_frames centrado en cada cambio de bloque
 *  y el regreso al ambiente del gancho durante el bucle. */
export const coloresEn = (f: number): Colores => {
  const tr: number = T.reglas_ambientes.transicion_frames ?? 12;
  const B = brief.bloques;
  const id = (k: number) => brief.ambientes[B[k].id] ?? "lino";
  if (enBucle(f)) {
    const {ini_f, fin_f} = brief.bucle;
    const t = Math.min(1, (f - ini_f) / Math.max(1, Math.min(8, fin_f - ini_f)));
    return mezclar(ambienteDe("cta"), ambienteDe("gancho"), t, id(B.length - 1), id(0));
  }
  const k = indiceBloqueEn(f);
  // transición de entrada a este bloque (mitad final) o de salida hacia el siguiente (mitad inicial)
  if (k > 0 && id(k) !== id(k - 1) && f < B[k].ini_f + tr / 2) {
    const t = (f - (B[k].ini_f - tr / 2)) / tr;
    return mezclar(T.ambientes[id(k - 1)], T.ambientes[id(k)], t, id(k - 1), id(k));
  }
  if (k + 1 < B.length && id(k + 1) !== id(k) && f >= B[k + 1].ini_f - tr / 2) {
    const t = (f - (B[k + 1].ini_f - tr / 2)) / tr;
    return mezclar(T.ambientes[id(k)], T.ambientes[id(k + 1)], t, id(k), id(k + 1));
  }
  return mezclar(T.ambientes[id(k)], T.ambientes[id(k)], 0, id(k), id(k));
};

/** Paleta de apoyo (matices para las escenas, nunca para el marco). */
export const APOYO: Record<string, string> = Object.fromEntries(
  Object.entries(T.apoyo).filter(([k, v]) => !k.startsWith("_") && typeof v === "string")) as Record<string, string>;
export const ESTILOS: Record<string, any> = Object.fromEntries(
  Object.entries(T.estilos_interior).filter(([k]) => !k.startsWith("_")));

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
