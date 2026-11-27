// Plantilla `mito_realidad` (plantillas/mito_realidad.md): tarjeta MITO (tachado o volteo) → tarjeta REALIDAD con la
// palabra clave en marcador rojo; los mitos ya corregidos se apilan arriba en miniatura.
import React from "react";
import {interpolate, useCurrentFrame} from "remotion";
import {ANTICIPA} from "../kit/brief";
import {Chip, Icono, Tarjeta, TextoMarcado, Zona, ZONA} from "../kit/piezas";
import {ajustarPx, escala, partirLineas, sinAsteriscos} from "../kit/texto";
import {aLocal, resorte, tramo, useBloque, useColores} from "../kit/tiempo";

const MINI = 0.3;
const MAIN_Y = 128;

export const MitoRealidad: React.FC<{p: any}> = ({p}) => {
  const f = useCurrentFrame();
  const b = useBloque();
  const c = useColores();
  const pares: any[] = p.pares || [];
  const n = pares.length;
  const voltear = p.animacion_mito === "voltear";
  const W = ZONA.ancho;

  return (
    <Zona>
      {pares.map((par, i) => {
        const mL = aLocal(b, par.ancla_mito_f);
        const rL = aLocal(b, par.ancla_realidad_f);
        const anclaR = rL + ANTICIPA;
        const sigL = i + 1 < n ? aLocal(b, pares[i + 1].ancla_mito_f) : Infinity;
        const pm = resorte(f, mL, "entrada");
        if (pm <= 0) return null;
        // texto del mito partido en líneas (para tachar cada una)
        const mito = `«${sinAsteriscos(par.mito)}»`;
        let px = 76;
        let lineas = partirLineas(mito, "display", 800, px, W - 80, 0, true);
        while (lineas.length > 3 && px > 50) {
          px -= 6;
          lineas = partirLineas(mito, "display", 800, px, W - 80, 0, true);
        }
        const altoMito = 96 + lineas.length * px * 0.98 + 34;
        // tachado: termina en el ancla de la realidad
        const tIni = anclaR - 10;
        const pMini = resorte(f, anclaR - 2, "entrada");
        const flipA = voltear ? tramo(f, anclaR - 8, 4) : 0;
        const enMini = voltear ? f >= anclaR + 6 : true;
        const pMiniEf = voltear ? (f >= anclaR + 6 ? 1 : 0) * resorte(f, anclaR + 6, "suave") : pMini;
        const xMini = ZONA.x + i * (W * MINI + 24);
        const tx = interpolate(pMiniEf, [0, 1], [ZONA.x, xMini]);
        const ty = interpolate(pMiniEf, [0, 1], [MAIN_Y, 4]);
        const sc = interpolate(pMiniEf, [0, 1], [1, MINI]);
        const op = interpolate(pMiniEf, [0, 1], [1, 0.62]);
        const ocultoPorVolteo = voltear && f >= anclaR - 4 && f < anclaR + 6;
        const tarjetaMito = (
          <Tarjeta key={`m${i}`} style={{position: "absolute", left: 0, top: 0, width: W, height: altoMito, padding: "28px 40px",
            boxSizing: "border-box", transformOrigin: "top left",
            transform: `translate(${tx}px, ${ty + (1 - pm) * 70}px) scale(${sc}) rotate(${-1.5 * (1 - pMiniEf)}deg) rotateY(${flipA * 90}deg)`,
            opacity: Math.min(1, pm * 3) * op * (ocultoPorVolteo ? 0 : 1)}}>
            <Chip texto="Mito" fondo={c.alerta} />
            <div style={{marginTop: 18}}>
              {lineas.map((l, k) => {
                const pt = enMini || !voltear ? tramo(f, tIni + (k * 8) / lineas.length, 8 / lineas.length, (t) => t) : 0;
                return (
                  <div key={k} style={{position: "relative", width: "fit-content"}}>
                    <div style={{...escala("titular_l2", px), color: c.texto, whiteSpace: "nowrap"}}>{l}</div>
                    <div style={{position: "absolute", left: -6, right: -6, top: "48%", height: Math.max(8, px * 0.13), background: c.alerta,
                      transform: `scaleX(${pt})`, transformOrigin: "left", opacity: 0.92}} />
                  </div>
                );
              })}
            </div>
          </Tarjeta>
        );
        // realidad
        const pr = resorte(f, voltear ? anclaR - 4 : anclaR + 2, "entrada");
        const salida = tramo(f, sigL - 2, 8);
        const flipB = voltear ? 1 - tramo(f, anclaR - 4, 4) : 0;
        const realidad = String(par.realidad);
        const pxR = ajustarPx(sinAsteriscos(realidad), "texto", 700, 46, 34, (W - 100) * 3.2);
        const conIcono = !!par.icono || !!par.fuente;
        const tarjetaReal = pr > 0 && salida < 1 ? (
          <Tarjeta key={`r${i}`} style={{position: "absolute", left: ZONA.x, top: MAIN_Y + 150, width: W, padding: "30px 40px 34px",
            boxSizing: "border-box", transform: `translateY(${(1 - pr) * 80 + salida * 120}px) rotateY(${-flipB * 90}deg)`,
            opacity: Math.min(1, pr * 3) * (1 - salida), borderTop: `10px solid ${c.exito}`}}>
            <div style={{display: "flex", alignItems: "center", gap: 18}}>
              <Chip texto="Realidad" fondo={c.exito} />
              {n > 1 ? <div style={{...escala("etiqueta"), color: c.texto_suave}}>{i + 1}/{n}</div> : null}
            </div>
            <div style={{display: "flex", gap: 24, alignItems: "flex-start", marginTop: 22}}>
              {conIcono ? <Icono nombre={par.icono ?? "scale"} size={64} color={c.estructura} style={{marginTop: 6}} /> : null}
              <div style={{...escala("cuerpo", pxR), fontWeight: 700, color: c.texto, lineHeight: 1.22}}>
                <TextoMarcado texto={marcarClave(realidad)} p={tramo(f, anclaR + 12, 10)} />
              </div>
            </div>
            {par.fuente_corta ? <div style={{...escala("fuente_dato"), color: c.texto_suave, marginTop: 16}}>Fuente: {par.fuente_corta}</div> : null}
          </Tarjeta>
        ) : null;
        return <React.Fragment key={i}>{tarjetaMito}{tarjetaReal}</React.Fragment>;
      })}
    </Zona>
  );
};

/** Sin *asteriscos*, marca la palabra más larga (la clave suele ser la más informativa). */
const marcarClave = (t: string) => {
  if (t.includes("*")) return t;
  const palabras = t.split(/\s+/);
  let k = 0;
  palabras.forEach((w, i) => {
    if (w.replace(/[^\p{L}]/gu, "").length > palabras[k].replace(/[^\p{L}]/gu, "").length) k = i;
  });
  const m = palabras[k].match(/^([^\p{L}]*)(.*?)([^\p{L}]*)$/u);
  palabras[k] = m ? `${m[1]}*${m[2]}*${m[3]}` : `*${palabras[k]}*`;
  return palabras.join(" ");
};
