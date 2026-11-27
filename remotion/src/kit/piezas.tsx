// Piezas reutilizables para escenas y plantillas. Todas leen colores y medidas de tokens.json.
import React from "react";
import {AbsoluteFill, Img, interpolate, random, staticFile, useCurrentFrame} from "remotion";
import {brief, FPS, T} from "./brief";
import {partesSvg, useSvgUrl, useTexto} from "./cargar";
import {escala, FAMILIAS, partesMarcadas} from "./texto";
import {pulso, resorte, tramo, useColores} from "./tiempo";

export const ZONA = {y: T.layout.escena.y_min as number, alto: (T.layout.escena.y_max - T.layout.escena.y_min) as number,
  x: T.zonas_seguras.texto_vital.x_min as number, ancho: (T.zonas_seguras.texto_vital.x_max - T.zonas_seguras.texto_vital.x_min) as number};
export const RADIO = T.forma.radio_tarjeta as number;
export const SOMBRA = T.forma.sombra_tarjeta as string;

/** Contenedor de la zona de escena (Y 600–1320). Dentro, (0,0) es la esquina superior izquierda de la zona y el ancho
 *  es el del lienzo (1080): el texto vital va entre x 72 y 940 (ZONA.x … ZONA.x + ZONA.ancho). */
export const Zona: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <div style={{position: "absolute", left: 0, top: ZONA.y, width: 1080, height: ZONA.alto, ...style}}>{children}</div>
);

/** Icono de icons/<nombre>.svg (Lucide/Tabler), en línea: hereda `color`. */
export const Icono: React.FC<{nombre: string; size?: number; color?: string; grosor?: number; style?: React.CSSProperties}> =
  ({nombre, size = 64, color, grosor, style}) => {
    const svg = useTexto(`icons/${nombre}.svg`);
    if (!svg) return <div style={{width: size, height: size, ...style}} />;
    const p = partesSvg(svg);
    const attrs = grosor ? p.atributos.replace(/stroke-width="[^"]*"/, `stroke-width="${grosor}"`) : p.atributos;
    const html = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${p.viewBox}" width="${size}" height="${size}" ${attrs}>${p.interior}</svg>`;
    return <div style={{width: size, height: size, color, lineHeight: 0, flexShrink: 0, ...style}} dangerouslySetInnerHTML={{__html: html}} />;
  };

/** Icono dentro de un <svg> (x, y = esquina superior izquierda). */
export const IconoSvg: React.FC<{nombre: string; x: number; y: number; size: number; color: string; grosor?: number}> =
  ({nombre, x, y, size, color, grosor}) => {
    const svg = useTexto(`icons/${nombre}.svg`);
    if (!svg) return null;
    const p = partesSvg(svg);
    const attrs = grosor ? p.atributos.replace(/stroke-width="[^"]*"/, `stroke-width="${grosor}"`) : p.atributos;
    return <g style={{color}} dangerouslySetInnerHTML={{__html:
      `<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="${p.viewBox}" ${attrs}>${p.interior}</svg>`}} />;
  };

/** Logo de la marca (PNG tal cual: sin teñir, sin deformar). variante: con o sin lema; fondo según el ambiente. */
export const Logo: React.FC<{conLema?: boolean; oscuro?: boolean; alto?: number; ancho?: number; style?: React.CSSProperties}> =
  ({conLema = false, oscuro = false, alto, ancho, style}) => {
    const prop = conLema ? T.marca.proporcion.con_lema : T.marca.proporcion.sin_lema;
    const h = alto ?? (ancho ? ancho / prop : 48);
    const w = h * prop;
    const clave = `${oscuro ? "fondo_oscuro" : "fondo_claro"}${conLema ? "" : "_sin_lema"}`;
    return <Img src={staticFile(brief.marca.logos[clave])} style={{width: w, height: h, display: "block", ...style}} />;
  };

/** Corchetes [ ] de la marca alrededor de una caja de ancho × alto. p: 0 (juntos en el centro) → 1 (abiertos sobre el
 *  elemento). Úsalo con resorte(f, desde, "pop"). Va posicionado en absoluto sobre su caja (left/top del padre). */
export const Corchetes: React.FC<{ancho: number; alto: number; p: number; color?: string; aire?: number; grosor?: number}> =
  ({ancho, alto, p, color, aire = 14, grosor}) => {
    const c = useColores();
    const col = color ?? c.foco;
    const g = grosor ?? Math.max(5, T.marca.corchetes.grosor_rel * alto * 0.45);
    const brazo = Math.max(12, T.marca.corchetes.brazo_rel * alto * 0.5);
    const h = alto + aire * 2;
    const cx = ancho / 2;
    const xi = interpolate(p, [0, 1], [cx - brazo, -aire]);
    const xd = interpolate(p, [0, 1], [cx + brazo, ancho + aire]);
    const op = Math.min(1, p * 4);
    const st = {position: "absolute" as const, overflow: "visible" as const, left: 0, top: -aire, pointerEvents: "none" as const};
    return (
      <svg width={ancho} height={h} style={st}>
        <path d={`M ${xi + brazo} ${g / 2} H ${xi + g / 2} V ${h - g / 2} H ${xi + brazo}`} fill="none" stroke={col}
          strokeWidth={g} strokeLinecap="butt" strokeLinejoin="miter" opacity={op} />
        <path d={`M ${xd - brazo} ${g / 2} H ${xd - g / 2} V ${h - g / 2} H ${xd - brazo}`} fill="none" stroke={col}
          strokeWidth={g} strokeLinecap="butt" strokeLinejoin="miter" opacity={op} />
      </svg>
    );
  };

type Modo = "abajo" | "escala" | "izquierda" | "derecha" | "arriba";
/** Entrada con resorte desde el frame local `desde` (nunca solo opacidad). */
export const Entra: React.FC<{desde: number; modo?: Modo; distancia?: number; tipo?: "entrada" | "pop" | "suave";
  style?: React.CSSProperties; children: React.ReactNode}> = ({desde, modo = "abajo", distancia = 60, tipo = "entrada", style, children}) => {
  const f = useCurrentFrame();
  const p = resorte(f, desde, modo === "escala" ? "pop" : tipo);
  const op = Math.min(1, p * 3);
  const tr = modo === "escala" ? `scale(${interpolate(p, [0, 1], [0.3, 1])})`
    : modo === "abajo" ? `translateY(${(1 - p) * distancia}px)` : modo === "arriba" ? `translateY(${-(1 - p) * distancia}px)`
      : modo === "izquierda" ? `translateX(${-(1 - p) * distancia}px)` : `translateX(${(1 - p) * distancia}px)`;
  return <div style={{opacity: op, transform: tr, ...style}}>{children}</div>;
};

/** Tarjeta: superficie, esquinas casi rectas, sombra suave. */
export const Tarjeta: React.FC<{style?: React.CSSProperties; children?: React.ReactNode; color?: string}> = ({style, children, color}) => {
  const c = useColores();
  return <div style={{background: color ?? c.superficie, borderRadius: RADIO, boxShadow: SOMBRA, position: "relative", ...style}}>{children}</div>;
};

/** Chip de texto en mono (MITO, REALIDAD, INSPECCIÓN…). */
export const Chip: React.FC<{texto: string; fondo: string; color?: string; style?: React.CSSProperties}> = ({texto, fondo, color = "#FFFFFF", style}) => (
  <div style={{...escala("sello"), display: "inline-block", background: fondo, color, padding: "8px 14px 6px", borderRadius: 3,
    lineHeight: 1, opacity: 1, ...style}}>{texto}</div>
);

/** Texto con la parte marcada con *asteriscos* sobre marcador rojo (rectángulo recto que crece de izquierda a derecha). */
export const TextoMarcado: React.FC<{texto: string; p?: number; style?: React.CSSProperties}> = ({texto, p = 1, style}) => {
  const c = useColores();
  return (
    <span style={style}>
      {partesMarcadas(texto).map((x, i) => x.marca ? (
        <span key={i} style={{position: "relative", display: "inline-block", padding: "0 0.12em"}}>
          <span style={{position: "absolute", inset: "0.04em 0", background: c.foco, transform: `scaleX(${p})`, transformOrigin: "left"}} />
          <span style={{position: "relative", color: p >= 1 ? T.color.texto_sobre_foco : "inherit"}}>{x.t}</span>
          {p > 0 && p < 1 ? <span style={{position: "absolute", left: "0.12em", top: 0, color: T.color.texto_sobre_foco,
            clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`, whiteSpace: "nowrap"}}>{x.t}</span> : null}
        </span>
      ) : <span key={i}>{x.t}</span>)}
    </span>
  );
};

/** Sello «EJEMPLO ILUSTRATIVO» (obligatorio cuando se muestra un caso concreto). Por defecto, abajo a la izquierda de la zona. */
export const Ilustrativo: React.FC<{x?: number; y?: number}> = ({x = ZONA.x, y = ZONA.alto - 34}) => {
  const c = useColores();
  return (
    <div style={{position: "absolute", left: x, top: y, ...escala("sello", 18), color: c.texto_suave, border: `2px solid ${c.linea}`,
      padding: "6px 10px 4px", borderRadius: 3, background: c.superficie, lineHeight: 1}}>{brief.ilustrativo}</div>
  );
};

/** Textura del repo (textures/<nombre>.svg) repetida como fondo. */
export const Textura: React.FC<{nombre: string; opacidad?: number; escala?: number; deriva?: number; style?: React.CSSProperties}> =
  ({nombre, opacidad = 0.5, escala: esc = 1, deriva = 0, style}) => {
    const url = useSvgUrl(`textures/${nombre}.svg`);
    const f = useCurrentFrame();
    if (!url) return null;
    return <AbsoluteFill style={{backgroundImage: url, opacity: opacidad, backgroundSize: esc !== 1 ? `auto ${100 * esc}%` : undefined,
      backgroundPosition: `${f * deriva}px ${f * deriva * 0.6}px`, ...style}} />;
  };

/** Partículas deterministas (polvo, gotas, chispas): n puntos que salen de (x, y) entre los frames locales desde y desde+dur. */
export const Particulas: React.FC<{x: number; y: number; n?: number; desde: number; dur?: number; color: string; radio?: number;
  dispersion?: number; gravedad?: number; semilla?: string}> = ({x, y, n = 24, desde, dur = 24, color, radio = 6, dispersion = 160,
  gravedad = 220, semilla = "p"}) => {
  const f = useCurrentFrame();
  const t = (f - desde) / dur;
  if (t < 0 || t > 1) return null;
  return (
    <svg style={{position: "absolute", left: 0, top: 0, overflow: "visible"}} width={1} height={1}>
      {Array.from({length: n}).map((_, i) => {
        const a = random(`${semilla}a${i}`) * Math.PI * 2;
        const v = 0.35 + random(`${semilla}v${i}`) * 0.65;
        const px = x + Math.cos(a) * dispersion * v * t;
        const py = y + Math.sin(a) * dispersion * v * t * 0.6 + gravedad * t * t;
        return <circle key={i} cx={px} cy={py} r={radio * (0.5 + random(`${semilla}r${i}`)) * (1 - t * 0.6)} fill={color} opacity={1 - t} />;
      })}
    </svg>
  );
};

/** Props para dibujar un trazo SVG de 0 → 1 (añádelas a un <path>, <line>, <rect>, <circle>). */
export const trazo = (p: number) => ({pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 - Math.max(0, Math.min(1, p))});

/** Check dibujado (para listas). */
export const Check: React.FC<{size?: number; p: number; color?: string; grosor?: number}> = ({size = 40, p, color, grosor = 6}) => {
  const c = useColores();
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" style={{overflow: "visible"}}>
      <path d="M8 21 L17 30 L33 11" fill="none" stroke={color ?? c.exito} strokeWidth={grosor} strokeLinecap="square" strokeLinejoin="miter"
        {...trazo(p)} />
    </svg>
  );
};

/** Número que cuenta hasta `valor` en conteo_frames (formato EE. UU.: 1,200). */
export const Contador: React.FC<{valor: number; desde: number; prefijo?: string; sufijo?: string; style?: React.CSSProperties}> =
  ({valor, desde, prefijo = "", sufijo = "", style}) => {
    const f = useCurrentFrame();
    const v = Math.round(valor * tramo(f, desde, T.movimiento.conteo_frames ?? 18));
    return <span style={{fontVariantNumeric: "tabular-nums", ...style}}>{prefijo}{v.toLocaleString("en-US")}{sufijo}</span>;
  };

/** Sello circular estampado (INSPECCIÓN, REVISADO…): entra con resorte pop y rotación −8°. */
export const Sello: React.FC<{texto: string; desde: number; size?: number; color?: string}> = ({texto, desde, size = 110, color}) => {
  const f = useCurrentFrame();
  const c = useColores();
  const p = resorte(f, desde, "pop");
  if (p <= 0) return null;
  const col = color ?? c.estructura;
  return (
    <div style={{width: size, height: size, borderRadius: "50%", border: `5px solid ${col}`, color: col, display: "flex",
      alignItems: "center", justifyContent: "center", textAlign: "center", transform: `rotate(-8deg) scale(${interpolate(p, [0, 1], [1.8, 1])})`,
      opacity: Math.min(1, p * 2), fontFamily: FAMILIAS.mono, fontWeight: 700, fontSize: size * 0.13, letterSpacing: "0.08em",
      boxShadow: `inset 0 0 0 4px transparent, inset 0 0 0 7px ${col}33`}}>{texto}</div>
  );
};

/** Pegatina emoji (illus/emoji/flat/<nombre>.svg o 3d/<nombre>.png): una o dos por video como mucho, nunca en el marco. */
export const Pegatina: React.FC<{nombre: string; size?: number; tresD?: boolean; style?: React.CSSProperties}> = ({nombre, size = 120, tresD, style}) => (
  <Img src={staticFile(`illus/emoji/${tresD ? "3d" : "flat"}/${nombre}.${tresD ? "png" : "svg"}`)}
    style={{width: Math.min(size, tresD ? 260 : size), height: Math.min(size, tresD ? 260 : size), ...style}} />
);

/** Temblor determinista de `dur` frames desde `desde` (px). */
export const temblor = (f: number, desde: number, dur = 3, px = 5) =>
  f >= desde && f < desde + dur ? Math.sin((f - desde) * 9.7) * px : 0;

export {pulso, FPS};
