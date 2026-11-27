// Bloque CTA (siempre en lino): logo con lema, «Entra a nuestro perfil», caja roja que hace pop en cta_f y flecha
// hacia la foto del perfil (abajo a la izquierda). Sin iconos de comentario ni DM.
import React from "react";
import {interpolate, useCurrentFrame} from "remotion";
import {ANTICIPA, brief, T} from "../kit/brief";
import {Logo, Zona} from "../kit/piezas";
import {ajustarPx, escala, escalaPx} from "../kit/texto";
import {resorte, tramo, useBloque, useColores, trazoProps} from "./util";

const TV = T.zonas_seguras.texto_vital;
const CX = (TV.x_min + TV.x_max) / 2;

export const Cta: React.FC = () => {
  const l = useCurrentFrame();
  const b = useBloque();
  const c = useColores();
  const ctaL = brief.cta_f - b.ini_f - ANTICIPA;
  const bucleL = brief.bucle.ini_f - b.ini_f;
  const salida = 1 - tramo(l, bucleL, 6);
  const anchoLogo: number = T.marca.uso.cta.ancho_px;
  const altoLogo = anchoLogo / T.marca.proporcion.con_lema;
  // corchetes SVG que se abren desde el centro; después aparece el logo desde el centro y releva a los corchetes
  const pc = resorte(l, 0, "pop");
  const pl = tramo(l, 6, 14);
  const altoC = altoLogo * 0.8;
  const g = anchoLogo * 0.03;
  const brazo = anchoLogo * 0.045;
  const xi = interpolate(pc, [0, 1], [anchoLogo / 2 - brazo * 1.5, 0]);
  const xd = interpolate(pc, [0, 1], [anchoLogo / 2 + brazo * 1.5, anchoLogo]);
  const pPrevio = resorte(l, 12, "entrada");
  const pCaja = resorte(l, ctaL, "pop");
  const late = l > ctaL + 10 ? 1 + Math.sin(l / 6) * 0.04 : 1;
  const {px: maxCta, min: minCta} = escalaPx("cta");
  const pxCta = ajustarPx(brief.cta, "display", 800, maxCta, minCta, 760, 0, true);
  const pFlecha = tramo(l, ctaL + 4, 10);
  const rebote = l > ctaL + 14 ? Math.abs(Math.sin((l - ctaL) / 5)) * 16 : 0;
  // flecha: de debajo de la caja hacia la esquina inferior izquierda, sin salir de la zona segura
  const x0 = 590, y0 = 470, x1 = 300, y1 = 690;
  const ux = (x1 - x0) / Math.hypot(x1 - x0, y1 - y0), uy = (y1 - y0) / Math.hypot(x1 - x0, y1 - y0);
  return (
    <Zona style={{opacity: salida}}>
      <div style={{position: "absolute", left: CX - anchoLogo / 2, top: 24, width: anchoLogo, height: altoLogo}}>
        <div style={{position: "absolute", inset: 0, clipPath: `inset(0 ${(1 - pl) * 50}% 0 ${(1 - pl) * 50}%)`,
          transform: `scale(${interpolate(pl, [0, 1], [0.94, 1])})`}}>
          <Logo conLema ancho={anchoLogo} />
        </div>
        <svg width={anchoLogo} height={altoC} style={{position: "absolute", left: 0, top: altoLogo * 0.02, overflow: "visible",
          opacity: 1 - tramo(l, 14, 6)}}>
          <path d={`M ${xi + brazo} ${g / 2} H ${xi + g / 2} V ${altoC - g / 2} H ${xi + brazo}`} fill="none" stroke={T.marca.rojo} strokeWidth={g} />
          <path d={`M ${xd - brazo} ${g / 2} H ${xd - g / 2} V ${altoC - g / 2} H ${xd - brazo}`} fill="none" stroke={T.marca.rojo} strokeWidth={g} />
        </svg>
      </div>
      <div style={{position: "absolute", left: CX, top: 24 + altoLogo + 36, transform: `translate(-50%, ${(1 - pPrevio) * 30}px)`,
        opacity: Math.min(1, pPrevio * 3), ...escala("etiqueta"), color: c.texto_suave, whiteSpace: "nowrap"}}>{brief.cta_previo}</div>
      {pCaja > 0 ? (
        <div style={{position: "absolute", left: CX, top: 24 + altoLogo + 100, transform: `translateX(-50%) scale(${interpolate(pCaja, [0, 1], [0.3, 1]) * late})`,
          background: c.foco, color: T.color.texto_sobre_foco, padding: "22px 44px 18px", ...escala("cta", pxCta), whiteSpace: "nowrap",
          boxShadow: T.forma.sombra_tarjeta, opacity: Math.min(1, pCaja * 3)}}>{brief.cta}</div>
      ) : null}
      {pFlecha > 0 ? (
        <svg width={1080} height={720} style={{position: "absolute", left: rebote * ux, top: rebote * uy, overflow: "visible"}}>
          <path d={`M ${x0} ${y0} Q ${x0 - 40} ${(y0 + y1) / 2 + 30} ${x1} ${y1}`} fill="none" stroke={c.foco} strokeWidth={14}
            strokeLinecap="square" {...trazoProps(pFlecha)} />
          <path d={`M ${x1 + 70} ${y1 + 6} L ${x1} ${y1} L ${x1 + 18} ${y1 - 66}`} fill="none" stroke={c.foco} strokeWidth={14}
            strokeLinecap="square" strokeLinejoin="miter" opacity={pFlecha >= 1 ? 1 : 0} />
        </svg>
      ) : null}
    </Zona>
  );
};
