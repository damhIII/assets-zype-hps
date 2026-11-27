// El marco: igual en todos los videos (layout.md). Fondo, barra de progreso, header, titular, subtítulos y aviso legal.
import React from "react";
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame} from "remotion";
import {brief, coloresEn, enBucle, indiceBloqueEn, PALABRAS, T, TOTAL, FPS} from "../kit/brief";
import {Logo, Textura} from "../kit/piezas";
import {ajustarPx, anchoTexto, escala, escalaPx} from "../kit/texto";
import {resorte, tramo, SPRING} from "../kit/tiempo";

const TV = T.zonas_seguras.texto_vital;
const CENTRO_X = (TV.x_min + TV.x_max) / 2;
const ANCHO = TV.x_max - TV.x_min;

/** Opacidad del marco en el bucle (titular, header y subtítulos desaparecen). */
const salidaBucle = (f: number) => (enBucle(f) ? 1 - tramo(f, brief.bucle.ini_f, 6) : 1);

// ------------------------------------------------------------------------------------------------- Fondo
export const Fondo: React.FC = () => {
  const f = useCurrentFrame();
  const c = coloresEn(f);
  return (
    <AbsoluteFill style={{background: `linear-gradient(180deg, ${c.fondo_a} 0%, ${c.fondo_b} 100%)`}}>
      {c.mezcla.filter((m) => m.peso > 0.01).map((m) => {
        const tex = String(T.ambientes[m.id].textura || "").replace(/^textures\//, "").replace(/\.svg$/, "");
        return tex ? <Textura key={m.id} nombre={tex} opacidad={0.09 * m.peso} deriva={0.12} /> : null;
      })}
      <Img src={staticFile("textures/vignette.svg")} style={{position: "absolute", inset: 0, width: "100%", height: "100%",
        opacity: 0.25 + 0.2 * c.oscuro}} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------------------------------------- Barra
export const BarraProgreso: React.FC = () => {
  const f = useCurrentFrame();
  const c = coloresEn(f);
  const alto = T.layout.barra_progreso.alto;
  return <div style={{position: "absolute", left: 0, top: T.layout.barra_progreso.y, height: alto, background: c.foco,
    width: `${(100 * f) / Math.max(1, TOTAL - 1)}%`}} />;
};

// ------------------------------------------------------------------------------------------------- Header
export const Header: React.FC = () => {
  const f = useCurrentFrame();
  const c = coloresEn(f);
  const entra = brief.header_entra_f;
  if (f < entra) return null;
  const p = tramo(f, entra, 8);
  const op = p * salidaBucle(f);
  const altoLogo = T.marca.uso.header.alto_px;
  const anchoLogo = altoLogo * T.marca.proporcion.sin_lema;
  const e = escala("header");
  const etiqueta = brief.etiqueta.toUpperCase();
  const disponible = ANCHO - anchoLogo - 40;
  const px = ajustarPx(`[ ${etiqueta} ]`, "mono", 700, e.fontSize as number, 18, disponible, 0.2, true);
  return (
    <div style={{position: "absolute", left: CENTRO_X, top: T.layout.header.y, transform: `translate(-50%, -50%) translateY(${(1 - p) * -10}px)`,
      display: "flex", alignItems: "center", gap: 20, opacity: op, whiteSpace: "nowrap"}}>
      <div style={{position: "relative", width: anchoLogo, height: altoLogo}}>
        <Logo alto={altoLogo} style={{position: "absolute", opacity: 1 - c.oscuro}} />
        <Logo alto={altoLogo} oscuro style={{position: "absolute", opacity: c.oscuro}} />
      </div>
      <div style={{width: 2, height: altoLogo * 0.7, background: c.texto, opacity: 0.25}} />
      <div style={{...e, fontSize: px, color: c.texto, opacity: 1}}>
        <span style={{color: c.foco}}>[</span><span style={{opacity: 0.8}}> {etiqueta} </span><span style={{color: c.foco}}>]</span>
      </div>
    </div>
  );
};

// ------------------------------------------------------------------------------------------------- Titular
const TIT = T.layout.titular;

const Linea: React.FC<{texto: string; segunda: boolean; p: number; color: string; foco: string}> = ({texto, segunda, p, color, foco}) => {
  const nombre = segunda ? "titular_l2" : "titular_l1";
  const {px: max, min} = escalaPx(nombre);
  const peso = T.tipografia.escalas[nombre].peso;
  const pad = segunda ? 0.14 : 0;
  const px = ajustarPx(texto, "display", peso, max, min, TIT.ancho_max / (1 + 2 * pad * 0.6), 0, true);
  const w = anchoTexto(texto, "display", peso, px, 0, true);
  const st: React.CSSProperties = {...escala(nombre, px), whiteSpace: "nowrap", position: "relative", display: "inline-block"};
  if (!segunda) return <div style={{...st, color}}>{texto}</div>;
  return (
    <div style={{...st, color: T.color.texto_sobre_foco, padding: `0.06em ${pad}em 0.02em`, marginLeft: `-${pad}em`, width: w + 2 * pad * px}}>
      <div style={{position: "absolute", inset: 0, background: foco, transform: `scaleX(${p})`, transformOrigin: "left", borderRadius: 0}} />
      <span style={{position: "relative", color: p >= 1 ? T.color.texto_sobre_foco : color}}>{texto}</span>
      {p < 1 ? <span style={{position: "absolute", left: `${pad}em`, top: "0.06em", color: T.color.texto_sobre_foco,
        clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`}}>{texto}</span> : null}
    </div>
  );
};

export const Titular: React.FC = () => {
  const f = useCurrentFrame();
  const c = coloresEn(f);
  const k = indiceBloqueEn(f);
  const b = brief.bloques[k];
  const local = f - b.ini_f;
  const primero = k === 0;
  const p = primero ? 1 : resorte(local, 0, "entrada");
  const pm = primero ? 1 : resorte(local, 4, "entrada");
  const ultimo = k === brief.bloques.length - 1;
  const fin = ultimo ? brief.bucle.ini_f : b.fin_f;
  const q = tramo(f, fin - 6, 6);
  const op = Math.min(1, p * 3) * (1 - q) * (ultimo ? salidaBucle(f) : 1);
  if (op <= 0.001) return null;
  return (
    <div style={{position: "absolute", left: TV.x_min, top: TIT.y_min + 14, width: TIT.ancho_max, opacity: op,
      transform: `translateY(${(1 - p) * 50 - q * 40}px)`, display: "flex", flexDirection: "column", gap: 14, alignItems: "flex-start"}}>
      <Linea texto={b.titular[0]} segunda={false} p={1} color={c.texto} foco={c.foco} />
      <Linea texto={b.titular[1]} segunda p={pm} color={c.texto} foco={c.foco} />
    </div>
  );
};

// ------------------------------------------------------------------------------------------------- Subtítulos
type Trozo = {palabras: number[]; ini_f: number; fin_f: number};
const PAUSA = 0.3;
const TROZOS: Trozo[] = (() => {
  const out: number[][] = [];
  let cur: number[] = [];
  PALABRAS.forEach(([w, , fin], i) => {
    cur.push(i);
    const sig = PALABRAS[i + 1];
    if (/[.,;:?!…]["»”')]*$/.test(w) || !sig || sig[1] - fin >= PAUSA || cur.length >= 3) {
      out.push(cur);
      cur = [];
    }
  });
  return out.map((ps, k) => {
    const ini = Math.round(PALABRAS[ps[0]][1] * FPS);
    const finVoz = PALABRAS[ps[ps.length - 1]][2];
    const sig = out[k + 1];
    const iniSig = sig ? PALABRAS[sig[0]][1] : Infinity;
    const fin = iniSig - finVoz > 0.6 ? Math.round((finVoz + 0.3) * FPS) : Math.round(iniSig * FPS);
    return {palabras: ps, ini_f: ini, fin_f: Math.min(fin, brief.bucle.ini_f)};
  });
})();

export const Subtitulos: React.FC = () => {
  const f = useCurrentFrame();
  const S = T.subtitulos;
  const tr = TROZOS.find((t) => f >= t.ini_f && f < t.fin_f);
  if (!tr || enBucle(f)) return null;
  const {px: max, min} = escalaPx("subtitulo");
  const disponible = ANCHO - 64;
  const larga = Math.max(...tr.palabras.map((i) => anchoTexto(PALABRAS[i][0], "display", 800, max, 0, true)));
  const px = larga * 1.12 > disponible ? min : max;
  const pe = resorte(f, tr.ini_f, "entrada");
  const zona = T.layout.subtitulos;
  return (
    <div style={{position: "absolute", left: CENTRO_X, top: (zona.y_min + zona.y_max) / 2, transform: `translate(-50%, -50%) scale(${interpolate(pe, [0, 1], [0.94, 1])})`,
      maxWidth: ANCHO, width: "max-content", padding: "14px 30px 18px", borderRadius: T.forma.radio_chip,
      background: hexA(S.capsula, S.capsula_opacidad), backdropFilter: "blur(14px)", display: "flex", flexWrap: "wrap",
      justifyContent: "center", columnGap: "0.26em", rowGap: 0, ...escala("subtitulo", px), lineHeight: 1.08}}>
      {tr.palabras.map((i) => {
        const ini = Math.round(PALABRAS[i][1] * FPS);
        const sig = PALABRAS[i + 1] ? Math.round(PALABRAS[i + 1][1] * FPS) : tr.fin_f;
        const activa = f >= ini && (f < sig || i === tr.palabras[tr.palabras.length - 1]);
        const pasada = f >= sig && !activa;
        const pa = activa ? resorte(f, ini, "pop") : 0;
        const color = activa ? S.activo : pasada ? S.pasado : S.futuro;
        const palabra = PALABRAS[i][0].replace(/^[¿¡«“"(]+|[.,;:?!…»”")]+$/g, "");
        const esc = activa ? interpolate(pa, [0, 1], [1, 1.12]) : 1;
        const margen = ((esc - 1) * anchoTexto(palabra, "display", 800, px, 0, true)) / 2;
        return (
          <span key={i} style={{position: "relative", display: "inline-block", color, transform: `scale(${esc})`,
            transformOrigin: "50% 70%", margin: `0 ${margen}px`}}>
            {palabra}
            {activa ? <span style={{position: "absolute", left: "4%", right: "4%", bottom: -2, height: 8, background: S.subrayado_activo,
              transform: `scaleX(${Math.min(1, pa)})`, transformOrigin: "left"}} /> : null}
          </span>
        );
      })}
    </div>
  );
};

const hexA = (hex: string, a: number) => {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((x) => x + x).join("") : h, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};

// ------------------------------------------------------------------------------------------------- Aviso legal y fuentes
export const PieLegal: React.FC = () => {
  const f = useCurrentFrame();
  const c = coloresEn(f);
  const id = brief.bloques[indiceBloqueEn(f)].id;
  if (enBucle(f)) return null;
  let texto: string | null = null;
  const fuentes = brief.fuentes_en_pantalla.map((x) => x.corta).join(" · ");
  if (brief.aviso_legal && (id === "cuerpo" || id === "cta")) texto = brief.aviso_legal;
  else if (fuentes && (id === "resultado" || (id === "cuerpo" && !brief.aviso_legal))) texto = `Fuente: ${fuentes}`;
  if (!texto) return null;
  const est = escala(texto.startsWith("Fuente") ? "fuente_dato" : "aviso_legal");
  return <div style={{position: "absolute", left: CENTRO_X, top: T.layout.aviso_legal.y, transform: "translate(-50%, -50%)",
    width: ANCHO, textAlign: "center", ...est, color: c.texto_suave}}>{texto}</div>;
};

export {SPRING};
