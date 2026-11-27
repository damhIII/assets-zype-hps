// Plantilla `cronograma` (plantillas/cronograma.md): línea de tiempo vertical con fases que entran cuando la voz las
// nombra, sello de inspección, chip de riesgo, retraso que empuja las fases siguientes y barrido final.
import React from "react";
import {interpolate, useCurrentFrame} from "remotion";
import {ANTICIPA} from "../kit/brief";
import {Chip, Icono, Ilustrativo, Sello, Tarjeta, Zona, ZONA, temblor} from "../kit/piezas";
import {ajustarPx, escala} from "../kit/texto";
import {aLocal, resorte, tramo, useBloque, useColores} from "../kit/tiempo";

export const Cronograma: React.FC<{p: any}> = ({p}) => {
  const f = useCurrentFrame();
  const b = useBloque();
  const c = useColores();
  const fases: any[] = p.fases || [];
  const n = fases.length;
  const lineaX = ZONA.x + 56;
  const cardX = lineaX + 56;
  const cardW = ZONA.x + ZONA.ancho - cardX;
  const top0 = 64;
  const extra = p.retraso ? 74 : 0;
  const disponible = ZONA.alto - top0 - 48 - extra;
  const pesos = fases.map((x) => (p.unidad === "semanas" && x.semanas ? Number(x.semanas) : 1));
  const suma = pesos.reduce((a, x) => a + x, 0) || 1;
  const alturas = pesos.map((w) => (w / suma) * disponible);
  const rL = p.retraso ? aLocal(b, p.retraso.ancla_f, ANTICIPA) : Infinity;
  const pR = resorte(f, rL, "pop");
  const sh = temblor(f, rL + 4, 3, 5);
  const tL = p.total ? aLocal(b, p.total.ancla_f, ANTICIPA) : Infinity;
  const pT = tramo(f, tL, 24);
  const tops: number[] = [];
  let acc = top0;
  fases.forEach((_, i) => {
    tops.push(acc);
    acc += alturas[i] + (p.retraso && i === p.retraso.fase ? extra * pR : 0);
  });
  const nodoY = (i: number) => tops[i] + Math.min(alturas[i], 120) / 2;
  const cardH = (i: number) => Math.max(56, Math.min(104, alturas[i] - 14));
  const pxEt = n >= 7 ? 30 : n >= 5 ? 36 : 40;
  const titulo = String(p.titulo ?? "");

  return (
    <Zona>
      <div style={{position: "absolute", left: ZONA.x, top: 0, ...escala("etiqueta", 28), color: c.texto, display: "flex", gap: 10,
        alignItems: "center", opacity: Math.min(1, resorte(f, 0, "entrada") * 3)}}>
        <span style={{color: c.foco}}>[</span>{titulo}<span style={{color: c.foco}}>]</span>
      </div>
      <svg width={1080} height={ZONA.alto} style={{position: "absolute", left: sh, top: 0, overflow: "visible"}}>
        {fases.map((x, i) => {
          if (i === n - 1) return null;
          const a = aLocal(b, x.ancla_f), z = aLocal(b, fases[i + 1].ancla_f);
          const pl = tramo(f, a + 4, Math.max(4, z - a - 2));
          return <line key={i} x1={lineaX} y1={nodoY(i)} x2={lineaX} y2={nodoY(i) + (nodoY(i + 1) - nodoY(i)) * pl} stroke={c.texto} strokeWidth={5} />;
        })}
        {p.total && pT > 0 && pT < 1 ? (
          <rect x={lineaX - 10} y={interpolate(pT, [0, 1], [nodoY(0) - 60, nodoY(n - 1)])} width={20} height={80} fill={c.foco} opacity={0.55} rx={10} />
        ) : null}
        {fases.map((x, i) => {
          const pe = resorte(f, aLocal(b, x.ancla_f), "pop");
          if (pe <= 0) return null;
          const ultima = fases.findIndex((y) => aLocal(b, y.ancla_f) > f) - 1;
          const activa = (ultima === -2 ? n - 1 : ultima) === i;
          const brillo = p.total && pT > 0 ? Math.max(0, 1 - Math.abs(pT * (n - 1) - i) * 1.2) : 0;
          return <circle key={i} cx={lineaX} cy={nodoY(i)} r={20 * interpolate(pe, [0, 1], [0.3, 1]) + brillo * 6} fill={activa || brillo > 0.3 ? c.foco : c.texto}
            stroke={c.superficie} strokeWidth={5} />;
        })}
      </svg>
      {fases.map((x, i) => {
        const aL = aLocal(b, x.ancla_f);
        const pe = resorte(f, aL, "entrada");
        if (pe <= 0) return null;
        const h = cardH(i);
        const retrasada = p.retraso && i === p.retraso.fase;
        const pxE = ajustarPx(x.etiqueta, "texto", 700, pxEt, 22, cardW - 200);
        return (
          <div key={i} style={{position: "absolute", left: cardX + sh, top: nodoY(i) - h / 2, width: cardW,
            transform: `translateX(${(1 - pe) * 50}px)`, opacity: Math.min(1, pe * 3)}}>
            <Tarjeta style={{height: h, display: "flex", alignItems: "center", gap: 16, padding: "0 20px", boxSizing: "border-box",
              borderLeft: retrasada && pR > 0 ? `8px solid ${c.alerta}` : `8px solid ${c.linea}`}}>
              {x.icono ? <Icono nombre={x.icono} size={h * 0.5} color={c.estructura} /> : null}
              <div style={{...escala("cuerpo", pxE), fontWeight: 700, color: c.texto, whiteSpace: "nowrap", flex: 1}}>{x.etiqueta}</div>
              {x.riesgo ? <Chip texto={x.riesgo} fondo={c.alerta} style={{fontSize: 20, whiteSpace: "nowrap", maxWidth: 260, overflow: "hidden"}} /> : null}
            </Tarjeta>
            {x.inspeccion ? (
              <div style={{position: "absolute", right: -10, top: -h * 0.55}}>
                <Sello texto="INSPECCIÓN" desde={aL + ANTICIPA + 10} size={Math.min(104, h * 1.3)} />
              </div>
            ) : null}
            {retrasada && pR > 0 ? (
              <div style={{marginTop: 10, ...escala("cuerpo", 28), fontWeight: 800, color: c.alerta, opacity: Math.min(1, pR * 2),
                display: "flex", alignItems: "center", gap: 10}}>
                <Icono nombre="clock" size={30} color={c.alerta} />{p.retraso.texto}
              </div>
            ) : null}
          </div>
        );
      })}
      <Ilustrativo />
    </Zona>
  );
};
