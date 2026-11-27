// Plantilla `errores` (plantillas/errores.md): tarjetas numeradas que se apilan, medidor de riesgo o contador de costo,
// y antídoto final con check.
import React from "react";
import {interpolate, useCurrentFrame} from "remotion";
import {ANTICIPA, APOYO} from "../kit/brief";
import {Check, Corchetes, Icono, Tarjeta, Zona, ZONA, temblor} from "../kit/piezas";
import {escala, FAMILIAS, ajustarPx} from "../kit/texto";
import {aLocal, resorte, tramo, useBloque, useColores} from "../kit/tiempo";
import {TextoAntidoto} from "./comun";

const NIVEL: Record<string, number> = {bajo: 1, medio: 2, alto: 3};

export const Errores: React.FC<{p: any}> = ({p}) => {
  const f = useCurrentFrame();
  const b = useBloque();
  const c = useColores();
  const errores: any[] = p.errores || [];
  const n = errores.length;
  const contador = p.contador ?? "riesgo";
  const conCont = contador !== "ninguno";
  const top0 = conCont ? 128 : 8;
  const rowH = 70, gap = 12;
  const antiL = p.antidoto ? aLocal(b, p.antidoto.ancla_f) : Infinity;
  const pAnti = p.antidoto ? resorte(f, antiL, "entrada") : 0;
  const ultimoTop = top0 + (n - 1) * (rowH + gap);
  const cardH = Math.min(276, ZONA.alto - ultimoTop - 6);
  const antiTop = top0 + n * (rowH + gap);
  const antiH = Math.min(210, ZONA.alto - antiTop - 4);
  const W = ZONA.ancho;

  // medidor / contador
  let valor = 0;
  let sacudida = 0;
  errores.forEach((e) => {
    const t = resorte(f, aLocal(b, e.ancla_f, ANTICIPA + 6), "suave");
    valor += t * (contador === "costo" ? e.costo_usd ?? 0 : NIVEL[e.nivel ?? "medio"]);
    if ((e.nivel ?? "medio") === "alto") sacudida += temblor(f, aLocal(b, e.ancla_f, ANTICIPA + 18), 3, 4);
  });
  const maxRiesgo = 3 * n;

  return (
    <Zona>
      {contador === "riesgo" ? <Medidor valor={valor / maxRiesgo} sacudida={sacudida} /> : null}
      {contador === "costo" ? (
        <div style={{position: "absolute", left: ZONA.x, top: 0, height: 116, display: "flex", flexDirection: "column", justifyContent: "center"}}>
          <div style={{...escala("etiqueta"), color: c.texto_suave}}>Costo del error</div>
          <div style={{...escala("cifra", 84), color: c.alerta, lineHeight: 1}}>${Math.round(valor).toLocaleString("en-US")}</div>
          {errores[0]?.fuente_corta ? <div style={{...escala("fuente_dato"), color: c.texto_suave}}>Fuente: {errores[0].fuente_corta}</div> : null}
        </div>
      ) : null}

      {errores.map((e, i) => {
        const entra = aLocal(b, e.ancla_f);
        const pe = resorte(f, entra, "entrada");
        if (pe <= 0) return null;
        const sigL = i + 1 < n ? aLocal(b, errores[i + 1].ancla_f) : antiL;
        const pc = sigL === Infinity ? 0 : Math.min(1, resorte(f, sigL, "suave"));
        const pCons = resorte(f, entra + ANTICIPA + 10, "entrada");
        const top = top0 + i * (rowH + gap);
        const h = interpolate(pc, [0, 1], [cardH, rowH]);
        const numPx = interpolate(pc, [0, 1], [150, 50]);
        const titPx = interpolate(pc, [0, 1], [62, 34]);
        const icono = interpolate(pc, [0, 1], [60, 34]);
        const titulo = String(e.titulo);
        const titAjust = ajustarPx(titulo, "display", 800, titPx, 26, W - 200 - icono, 0, true);
        return (
          <Tarjeta key={i} style={{position: "absolute", left: ZONA.x, top, width: W, height: h, overflow: "hidden",
            transform: `translateY(${(1 - pe) * 70}px)`, opacity: Math.min(1, pe * 3) * (1 - 0.45 * pAnti),
            filter: pAnti > 0 ? `saturate(${1 - pAnti})` : undefined, display: "flex", alignItems: "center"}}>
            <div style={{width: interpolate(pc, [0, 1], [150, 70]), textAlign: "center", fontFamily: FAMILIAS.display, fontWeight: 800,
              fontSize: numPx, lineHeight: 1, color: c.alerta, flexShrink: 0}}>{i + 1}</div>
            <div style={{flex: 1, paddingRight: 28, minWidth: 0}}>
              <div style={{display: "flex", alignItems: "center", gap: 16}}>
                <div style={{width: icono + 18, height: icono + 18, borderRadius: "50%", background: APOYO.rosa_arcilla ?? c.linea,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0}}>
                  <Icono nombre={e.icono ?? "triangle-alert"} size={icono * 0.7} color={c.texto} />
                </div>
                <div style={{...escala("titular_l1", titAjust), color: c.texto, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}}>{titulo}</div>
              </div>
              {pc < 0.35 ? (
                <div style={{...escala("cuerpo", 40), fontWeight: 600, color: c.texto_suave, marginTop: 18, lineHeight: 1.18,
                  opacity: Math.min(1, pCons * 2) * (1 - pc / 0.35), transform: `translateY(${(1 - pCons) * 20}px)`}}>{e.consecuencia}</div>
              ) : null}
            </div>
          </Tarjeta>
        );
      })}

      {p.antidoto && pAnti > 0 ? (
        <div style={{position: "absolute", left: ZONA.x, top: antiTop, width: W, height: antiH,
          transform: `translateY(${(1 - pAnti) * 60}px)`, opacity: Math.min(1, pAnti * 3)}}>
          <Tarjeta style={{width: "100%", height: "100%", borderLeft: `12px solid ${c.exito}`, display: "flex", alignItems: "center", gap: 26,
            padding: "0 30px", boxSizing: "border-box"}}>
            <div style={{width: 84, height: 84, borderRadius: "50%", background: c.exito, display: "flex", alignItems: "center",
              justifyContent: "center", flexShrink: 0}}>
              <Check size={52} p={tramo(f, antiL + 4, 8)} color="#FFFFFF" grosor={7} />
            </div>
            <TextoAntidoto texto={p.antidoto.texto} p={resorte(f, antiL + 10, "entrada")} px={42} color={c.texto} />
          </Tarjeta>
          <Corchetes ancho={W} alto={antiH} p={resorte(f, antiL + 6, "pop")} aire={12} />
        </div>
      ) : null}
    </Zona>
  );
};

const Medidor: React.FC<{valor: number; sacudida: number}> = ({valor, sacudida}) => {
  const c = useColores();
  const r = 78, cx = ZONA.x + r + 10, cy = 100;
  const arco = (a0: number, a1: number) => {
    const p0 = [cx + r * Math.cos(Math.PI * (1 - a0)), cy - r * Math.sin(Math.PI * (1 - a0))];
    const p1 = [cx + r * Math.cos(Math.PI * (1 - a1)), cy - r * Math.sin(Math.PI * (1 - a1))];
    return `M ${p0[0]} ${p0[1]} A ${r} ${r} 0 0 1 ${p1[0]} ${p1[1]}`;
  };
  const v = Math.max(0, Math.min(1, valor));
  const ang = Math.PI * (1 - v) + (sacudida * Math.PI) / 180;
  const col = v < 0.34 ? APOYO.miel : v < 0.67 ? APOYO.terracota_suave : c.alerta;
  return (
    <>
      <svg width={1080} height={120} style={{position: "absolute", left: 0, top: 0}}>
        <path d={arco(0, 1)} stroke={c.linea} strokeWidth={20} fill="none" strokeLinecap="butt" />
        {v > 0.001 ? <path d={arco(0, v)} stroke={col} strokeWidth={20} fill="none" strokeLinecap="butt" /> : null}
        <line x1={cx} y1={cy} x2={cx + (r - 6) * Math.cos(ang)} y2={cy - (r - 6) * Math.sin(ang)} stroke={c.texto} strokeWidth={6} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={10} fill={c.texto} />
      </svg>
      <div style={{position: "absolute", left: cx + r + 30, top: 44, ...escala("etiqueta"), color: c.texto_suave}}>Nivel de riesgo</div>
      <div style={{position: "absolute", left: cx + r + 30, top: 74, display: "flex", gap: 8}}>
        {[0, 1, 2].map((k) => (
          <div key={k} style={{width: 54, height: 10, background: v > (k + 0.5) / 3 ? col : c.linea}} />
        ))}
      </div>
    </>
  );
};
