// Tiempo dentro de una escena: cada bloque se renderiza en su <Sequence>, así que useCurrentFrame() es local al bloque.
import React, {createContext, useContext} from "react";
import {spring, useCurrentFrame, interpolate, Easing} from "remotion";
import {ANTICIPA, Bloque, brief, coloresEn, FPS, palabraF, T, Colores} from "./brief";

export const BloqueContext = createContext<Bloque>(brief.bloques[0]);
export const useBloque = () => useContext(BloqueContext);

/** Frame global (el del video entero), también dentro de una escena. */
export const useFrameGlobal = () => useCurrentFrame() + useBloque().ini_f;

/** Frame local (dentro del bloque) en que hay que lanzar lo que la voz nombra en la palabra i: entra ANTICIPA frames antes. */
export const useAncla = () => {
  const b = useBloque();
  return (i: number, extra = 0) => palabraF(i) - b.ini_f - ANTICIPA + extra;
};
/** Igual que useAncla pero a partir de un frame global ya calculado (los *_f de plantilla.params). */
export const aLocal = (b: Bloque, fGlobal: number, extra = 0) => fGlobal - b.ini_f - ANTICIPA + extra;

/** Colores del ambiente activo (se funden solos en los cambios de ambiente). */
export const useColores = (): Colores => coloresEn(useFrameGlobal());

type Cfg = {damping: number; stiffness: number};
const M = T.movimiento;
export const SPRING = {entrada: M.spring_entrada as Cfg, pop: M.spring_pop as Cfg, suave: M.spring_suave as Cfg};

/** 0 → 1 (con rebote) desde el frame local `desde`. Antes de `desde` vale 0. */
export const resorte = (f: number, desde: number, tipo: keyof typeof SPRING = "entrada", duracion?: number) =>
  f < desde || !Number.isFinite(desde) ? 0 : spring({frame: f - desde, fps: FPS, config: SPRING[tipo], durationInFrames: duracion});

/** 0 → 1 lineal (con easing) entre dos frames locales. */
export const tramo = (f: number, desde: number, dur: number, ease: (t: number) => number = Easing.inOut(Easing.cubic)) =>
  !Number.isFinite(desde) ? (desde < 0 ? 1 : 0) : interpolate(f, [desde, desde + Math.max(1, dur)], [0, 1], {extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease});

/** Pulso 0 → 1 → 0 de `dur` frames que empieza en `desde` (golpes, punch-ins, destellos). */
export const pulso = (f: number, desde: number, dur = 18) =>
  f < desde || f > desde + dur ? 0 : Math.sin((Math.PI * (f - desde)) / dur);

export const useF = () => useCurrentFrame();
export {React};
