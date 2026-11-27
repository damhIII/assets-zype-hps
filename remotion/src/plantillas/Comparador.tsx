// Plantilla `comparador` (plantillas/comparador.md): columnas por opción con muestra de material, filas de criterios
// con medidor de 3 segmentos y veredicto final (nunca «la mejor»).
import React from "react";
import {interpolate, useCurrentFrame} from "remotion";
import {ANTICIPA, APOYO} from "../kit/brief";
import {Corchetes, Icono, Tarjeta, Textura, Zona, ZONA} from "../kit/piezas";
import {ajustarPx, escala} from "../kit/texto";
import {aLocal, resorte, tramo, useBloque, useColores} from "../kit/tiempo";
import {TextoAntidoto} from "./comun";

const N_NIVEL: Record<string, number> = {bajo: 1, medio: 2, alto: 3};
const TONOS = [["arena", "madera"], ["greige", "piedra"], ["salvia", "eucalipto"]];

export const Comparador: React.FC<{p: any}> = ({p}) => {
  const f = useCurrentFrame();
  const b = useBloque();
  const c = useColores();
  const ops: any[] = p.opciones || [];
  const crit: any[] = p.criterios || [];
  const N = ops.length;
  const labelW = 232;
  const x0 = ZONA.x + labelW + 16;
  const areaW = ZONA.x + ZONA.ancho - x0;
  const gapC = 18;
  const colW = (areaW - (N - 1) * gapC) / N;
  const tileH = 156;
  const filasTop = 246;
  const verL = p.veredicto ? aLocal(b, p.veredicto.ancla_f, ANTICIPA) : Infinity;
  const pVer = resorte(f, verL, "entrada");
  const reservaVer = p.veredicto ? 150 : 0;
  const rowH = Math.min(118, (ZONA.alto - filasTop - 6) / Math.max(1, crit.length));
  const atenua = 1 - 0.7 * Math.min(1, pVer);

  return (
    <Zona>
      <div style={{opacity: atenua}}>
        {ops.map((o, j) => {
          const pe = resorte(f, aLocal(b, o.ancla_f), "pop");
          if (pe <= 0) return null;
          const x = x0 + j * (colW + gapC);
          const [t1, t2] = TONOS[j % TONOS.length].map((k) => APOYO[k] ?? c.linea);
          const pxN = ajustarPx(o.nombre, "display", 800, 46, 26, colW, 0, true);
          return (
            <div key={j} style={{position: "absolute", left: x, top: 0, width: colW, transform: `scale(${interpolate(pe, [0, 1], [0.3, 1])})`,
              opacity: Math.min(1, pe * 3), transformOrigin: "50% 60%"}}>
              <div style={{position: "relative", width: colW, height: tileH, borderRadius: 6, overflow: "hidden",
                background: `linear-gradient(135deg, ${t1}, ${t2})`, boxShadow: "0 10px 24px rgba(36,31,28,0.16)"}}>
                {o.muestra ? <Textura nombre={`mat_${o.muestra}`} opacidad={1} escala={1} /> : null}
                <div style={{position: "absolute", right: 10, bottom: 10, width: 60, height: 60, borderRadius: "50%", background: c.superficie,
                  display: "flex", alignItems: "center", justifyContent: "center"}}>
                  <Icono nombre={o.icono ?? "layers"} size={36} color={c.texto} />
                </div>
              </div>
              <div style={{...escala("titular_l1", pxN), color: c.texto, textAlign: "center", marginTop: 12, whiteSpace: "nowrap"}}>{o.nombre}</div>
            </div>
          );
        })}

        {crit.map((cr, i) => {
          const fl = aLocal(b, cr.ancla_f, ANTICIPA);
          const pf = resorte(f, fl, "entrada");
          if (pf <= 0) return null;
          const y = filasTop + i * rowH;
          const reves = cr.mejor_si_alto === false;
          return (
            <div key={i} style={{position: "absolute", left: 0, top: y, width: 1080, height: rowH - 8,
              transform: `translateY(${(1 - pf) * 40}px)`, opacity: Math.min(1, pf * 3)}}>
              <div style={{position: "absolute", left: ZONA.x, top: 0, width: labelW, height: rowH - 8, display: "flex", alignItems: "center",
                gap: 8, borderTop: `2px solid ${c.linea}`}}>
                <div style={{...escala("etiqueta", 26), color: c.texto, lineHeight: 1.2}}>{cr.nombre}</div>
                {reves ? (
                  <svg width={22} height={28} viewBox="0 0 22 28" style={{flexShrink: 0}}>
                    <path d="M11 2 V24 M3 16 L11 25 L19 16" fill="none" stroke={c.estructura} strokeWidth={3.5} strokeLinecap="square" />
                  </svg>
                ) : null}
              </div>
              {(cr.valores || []).map((v: any, j: number) => {
                const x = x0 + j * (colW + gapC);
                const pv = tramo(f, fl + 4 + j * 4, 10);
                const nivel = v.nivel ?? "medio";
                return (
                  <div key={j} style={{position: "absolute", left: x, top: 0, width: colW, height: rowH - 8, borderTop: `2px solid ${c.linea}`,
                    display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 6}}>
                    {v.cifra != null && v.fuente ? (
                      <div style={{...escala("cifra", 44), color: c.texto, opacity: pv}}>{v.cifra}</div>
                    ) : nivel === "depende" ? (
                      <div style={{...escala("sello", 24), color: c.estructura, opacity: pv, border: `3px dashed ${c.estructura}`, padding: "6px 12px 4px"}}>Depende</div>
                    ) : (
                      <div style={{display: "flex", gap: 6, flexDirection: reves ? "row-reverse" : "row"}}>
                        {[0, 1, 2].map((k) => {
                          const lleno = k < N_NIVEL[nivel];
                          const pk = tramo(f, fl + 4 + j * 4 + k * 2, 6);
                          return (
                            <div key={k} style={{width: (colW - 30) / 3, height: 26, background: c.linea, position: "relative", overflow: "hidden"}}>
                              {lleno ? <div style={{position: "absolute", inset: 0, background: c.texto, transform: `scaleX(${pk})`,
                                transformOrigin: reves ? "right" : "left"}} /> : null}
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {v.texto ? <div style={{...escala("cuerpo", 22), color: c.texto_suave, opacity: pv, textAlign: "center", lineHeight: 1.1}}>{v.texto}</div> : null}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {p.veredicto && pVer > 0 ? (
        <div style={{position: "absolute", left: ZONA.x + 20, top: ZONA.alto - reservaVer - 40, width: ZONA.ancho - 40, height: reservaVer,
          transform: `translateY(${(1 - pVer) * 70}px)`, opacity: Math.min(1, pVer * 3)}}>
          <Tarjeta style={{width: "100%", height: "100%", display: "flex", alignItems: "center", padding: "0 34px", boxSizing: "border-box",
            borderLeft: `12px solid ${c.foco}`}}>
            <TextoAntidoto texto={p.veredicto.texto} p={resorte(f, verL + 8, "entrada")} px={44} color={c.texto} />
          </Tarjeta>
          <Corchetes ancho={ZONA.ancho - 40} alto={reservaVer} p={resorte(f, verL + 4, "pop")} />
        </div>
      ) : null}
    </Zona>
  );
};
