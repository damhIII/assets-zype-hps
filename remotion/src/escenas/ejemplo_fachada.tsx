// EJEMPLO DE REFERENCIA (brief 20261127-0808 · «No tapes la señal» · mito_realidad · peligro: pintura que se ampolla).
// Patrón recomendado: UN componente ilustrado con props de estado (aquí <Fachada>) que reutilizan gancho, escena y
// resultado. Así el resultado es el mismo encuadre del frame 0 ya resuelto y el bucle encaja solo.
import React from "react";
import {
  APOYO, Check, Corchetes, Entra, Icono, Ilustrativo, Particulas, Tarjeta, Textura, Zona, ZONA, anchoTexto, escala, interpolate,
  interpolateColors, random, resorte, tramo, trazo, useAncla, useColores, useCurrentFrame,
} from "../kit";
import type {Escenas} from "./tipos";

// ---------------------------------------------------------------------------------------------- la ilustración
type Estado = {
  dia?: number; lluvia?: number; ampolla?: number; corte?: number; cubierta?: number; grietas?: number;
  desprendimientos?: number; manchas?: number; humedo?: number; marcas?: number; reparada?: number; sol?: number;
};
const MURO = {x: 100, y: 16, w: 880, h: 688};
const AMP = {x: 380, y: 380};
const VENTANA = {x: 640, y: 70, w: 250, h: 250};
const MANCHAS = [{x: 700, y: 380, rx: 70, ry: 46}, {x: 805, y: 420, rx: 60, ry: 70}, {x: 745, y: 500, rx: 46, ry: 34}];
const LASCAS = [{x: 190, y: 600, s: 1}, {x: 560, y: 640, s: 0.8}, {x: 925, y: 600, s: 0.7}];
const clamp = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;

const Fachada: React.FC<{e: Estado}> = ({e}) => {
  const f = useCurrentFrame();
  const c = useColores();
  const {dia = 0, lluvia = 0, ampolla = 0, corte = 0, cubierta = 0, grietas = 0, desprendimientos = 0, manchas = 0, humedo = 0,
    marcas = 0, reparada = 0, sol = 0} = e;
  const defecto = 1 - reparada;
  const muro = interpolateColors(dia, [0, 1], ["#C7B49E", "#F1E8DB"]);
  const pintura = interpolateColors(dia, [0, 1], ["#D8C8B4", "#F8F2E9"]);
  const vidrioA = interpolateColors(dia, [0, 1], ["#4F5A5D", "#DCE8EC"]);
  const vidrioB = interpolateColors(dia, [0, 1], ["#2E3436", "#9FB0B3"]);
  const rx = 124 * ampolla, ry = 90 * ampolla;
  return (
    <>
      {/* muro con textura de estuco */}
      <div style={{position: "absolute", left: MURO.x, top: MURO.y, width: MURO.w, height: MURO.h, background: muro, overflow: "hidden",
        boxShadow: "0 30px 60px rgba(0,0,0,0.28)"}}>
        <Textura nombre="mat_concreto" opacidad={0.9} />
        <Textura nombre="noise_grain" opacidad={0.12} />
      </div>
      <svg width={1080} height={720} style={{position: "absolute", left: 0, top: 0, overflow: "visible"}}>
        <defs>
          <radialGradient id="amp" cx="38%" cy="32%" r="70%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.85} />
            <stop offset="45%" stopColor={pintura} />
            <stop offset="100%" stopColor="#6E6257" />
          </radialGradient>
          <radialGradient id="mancha">
            <stop offset="0%" stopColor="#5C4A3A" stopOpacity={0.62} />
            <stop offset="100%" stopColor="#5C4A3A" stopOpacity={0} />
          </radialGradient>
          <linearGradient id="vidrio" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={vidrioA} />
            <stop offset="100%" stopColor={vidrioB} />
          </linearGradient>
          <radialGradient id="sol" cx="90%" cy="0%" r="90%">
            <stop offset="0%" stopColor={APOYO.miel} stopOpacity={0.45} />
            <stop offset="100%" stopColor={APOYO.miel} stopOpacity={0} />
          </radialGradient>
          <clipPath id="lupa"><circle cx={215} cy={548} r={130 * corte} /></clipPath>
        </defs>
        {/* ventana */}
        <rect x={VENTANA.x - 16} y={VENTANA.y - 16} width={VENTANA.w + 32} height={VENTANA.h + 32} fill="#6E5A47" />
        <rect x={VENTANA.x} y={VENTANA.y} width={VENTANA.w} height={VENTANA.h} fill="url(#vidrio)" />
        <rect x={VENTANA.x} y={VENTANA.y} width={VENTANA.w} height={VENTANA.h} fill={APOYO.miel} opacity={0.22 * (1 - dia)} />
        <line x1={VENTANA.x + VENTANA.w / 2} y1={VENTANA.y} x2={VENTANA.x + VENTANA.w / 2} y2={VENTANA.y + VENTANA.h} stroke="#6E5A47" strokeWidth={10} />
        <line x1={VENTANA.x} y1={VENTANA.y + VENTANA.h / 2} x2={VENTANA.x + VENTANA.w} y2={VENTANA.y + VENTANA.h / 2} stroke="#6E5A47" strokeWidth={10} />
        <path d={`M ${VENTANA.x + 24} ${VENTANA.y + 90} L ${VENTANA.x + 90} ${VENTANA.y + 24}`} stroke="#FFFFFF" strokeOpacity={0.35} strokeWidth={8} />
        <rect x={VENTANA.x - 36} y={VENTANA.y + VENTANA.h + 16} width={VENTANA.w + 72} height={22} fill="#8E7B68" />
        {/* manchas húmedas bajo la ventana */}
        {MANCHAS.map((m, i) => {
          const p = Math.min(1, manchas * 1.25 - i * 0.12) * defecto;
          if (p <= 0) return null;
          return (
            <g key={i}>
              <ellipse cx={m.x} cy={m.y} rx={m.rx * p} ry={m.ry * p} fill="url(#mancha)" />
              <line x1={m.x} y1={m.y + m.ry * 0.3} x2={m.x + 4} y2={m.y + m.ry * 0.3 + 70 * p * humedo} stroke="#5C4A3A" strokeOpacity={0.35}
                strokeWidth={6} strokeLinecap="round" />
              <circle cx={m.x - m.rx * 0.3} cy={m.y - m.ry * 0.25} r={6} fill="#FFFFFF" opacity={0.7 * humedo * p * (0.6 + 0.4 * Math.sin(f / 5 + i))} />
            </g>
          );
        })}
        {/* lascas: pintura desprendida que deja ver el estuco */}
        {LASCAS.map((l, i) => {
          const p = Math.min(1, desprendimientos * 1.3 - i * 0.15) * defecto;
          if (p <= 0) return null;
          return (
            <g key={i} transform={`translate(${l.x} ${l.y}) scale(${l.s * p})`}>
              <path d="M -46 -10 L -20 -36 L 14 -30 L 44 -6 L 30 26 L -6 34 L -38 20 Z" fill="#9C8F7F" />
              <path d="M 14 -30 L 44 -6 L 58 -28 L 26 -46 Z" fill={pintura} stroke="#6E6257" strokeWidth={2}
                transform={`rotate(${-8 + Math.sin(f / 9 + i) * 3} 30 -20)`} />
              <path d="M -38 20 L -6 34 L -14 54 L -48 40 Z" fill={pintura} stroke="#6E6257" strokeWidth={2} />
            </g>
          );
        })}
        {/* ampolla */}
        {ampolla > 0 && defecto > 0 ? (
          <g opacity={defecto}>
            <ellipse cx={AMP.x + 10} cy={AMP.y + 14} rx={rx} ry={ry} fill="#000000" opacity={0.18} />
            <ellipse cx={AMP.x} cy={AMP.y} rx={rx} ry={ry} fill="url(#amp)" />
            {grietas > 0 ? (
              <path d={`M ${AMP.x - rx * 0.7} ${AMP.y - 6} L ${AMP.x - rx * 0.3} ${AMP.y + 10} L ${AMP.x} ${AMP.y - 12} L ${AMP.x + rx * 0.35} ${AMP.y + 14} L ${AMP.x + rx * 0.75} ${AMP.y}`}
                fill="none" stroke="#4A4038" strokeWidth={5} strokeLinejoin="miter" {...trazo(grietas)} />
            ) : null}
          </g>
        ) : null}
        {/* mano de pintura nueva encima (tapar la señal) */}
        {cubierta > 0 ? (
          <rect x={230} y={276} width={340 * cubierta} height={210} rx={46} fill={interpolateColors(dia, [0, 1], ["#DCCDBA", "#FBF7F1"])}
            opacity={0.93 * (1 - grietas * 0.8)} />
        ) : null}
        {/* lluvia */}
        {lluvia > 0 ? Array.from({length: 54}).map((_, i) => {
          const x0 = random(`x${i}`) * 1240 - 80;
          const v = 22 + random(`v${i}`) * 14;
          const y = ((random(`y${i}`) * 820 + f * v) % 820) - 60;
          return <line key={i} x1={x0 - y * 0.22} y1={y} x2={x0 - (y + 46) * 0.22} y2={y + 46} stroke="#D7E4E8" strokeWidth={3}
            strokeLinecap="round" opacity={0.55 * lluvia} />;
        }) : null}
        {/* lupa: corte que deja ver la humedad bajo la capa */}
        {corte > 0 ? (
          <g>
            <line x1={AMP.x - 70} y1={AMP.y + 50} x2={215 + 80 * corte} y2={548 - 80 * corte} stroke={c.foco} strokeWidth={5} opacity={corte} />
            <circle cx={215} cy={548} r={130 * corte} fill="#A89C8E" stroke={c.foco} strokeWidth={8} />
            <g clipPath="url(#lupa)">
              {Array.from({length: 40}).map((_, i) => (
                <circle key={i} cx={100 + random(`g${i}`) * 230} cy={560 + random(`h${i}`) * 110} r={3 + random(`r${i}`) * 4}
                  fill={i % 3 ? "#8C8072" : "#6F9AA8"} />
              ))}
              <path d="M 90 532 C 150 532 165 470 215 470 C 265 470 280 532 340 532 L 340 552 C 280 552 265 492 215 492 C 165 492 150 552 90 552 Z"
                fill="#F2EBE1" stroke="#5E544C" strokeWidth={2} />
              <path d="M 160 540 C 180 500 250 500 270 540 Z" fill="#7FA3B0" opacity={0.9} />
              {[0, 1, 2, 3].map((k) => (
                <circle key={k} cx={185 + k * 22} cy={528 + Math.sin(f / 6 + k) * 3} r={6} fill="#D7E9EF" />
              ))}
            </g>
          </g>
        ) : null}
        {/* marcas rojas sobre cada zona */}
        {marcas > 0 ? [[AMP.x, AMP.y, 156], [760, 440, 118], [LASCAS[0].x, LASCAS[0].y, 74]].map(([x, y, r], i) => (
          <ellipse key={i} cx={x} cy={y} rx={r} ry={r * 0.82} fill="none" stroke={c.foco} strokeWidth={9} transform={`rotate(-12 ${x} ${y})`}
            {...trazo(tramo(marcas, i * 0.22, 0.45))} opacity={defecto} />
        )) : null}
        {/* brillo de pintura nueva y sol */}
        {reparada > 0 && reparada < 1 ? (
          <rect x={MURO.x - 400 + reparada * 1500} y={MURO.y} width={160} height={MURO.h} fill="#FFFFFF" opacity={0.35}
            transform={`skewX(-16)`} />
        ) : null}
        {sol > 0 ? <rect x={MURO.x} y={MURO.y} width={MURO.w} height={MURO.h} fill="url(#sol)" opacity={sol} /> : null}
        {/* noche: el muro se oscurece arriba */}
        <rect x={MURO.x} y={MURO.y} width={MURO.w} height={MURO.h} fill="#1C1816" opacity={0.2 * (1 - dia)} />
      </svg>
      {corte > 0.6 ? (
        <>
          <div style={{position: "absolute", left: 230, top: 420, ...escala("sello", 17), color: "#FFFFFF", background: "#241F1C",
            padding: "4px 8px 2px", opacity: tramo(corte, 0.6, 0.4)}}>Pintura</div>
          <div style={{position: "absolute", left: 120, top: 640, ...escala("sello", 17), color: "#FFFFFF", background: "#4F6F62",
            padding: "4px 8px 2px", opacity: tramo(corte, 0.6, 0.4)}}>Humedad</div>
        </>
      ) : null}
    </>
  );
};

/** Rodillo que avanza de x0 a x1 a la altura y (p: 0 → 1). */
const Rodillo: React.FC<{p: number; x0: number; x1: number; y: number; size?: number}> = ({p, x0, x1, y, size = 150}) => {
  if (p <= 0 || p >= 1) return null;
  const x = interpolate(p, [0, 1], [x0, x1]);
  return (
    <div style={{position: "absolute", left: x - size * 0.4, top: y - size * 0.55, transform: `rotate(${Math.sin(p * 20) * 4}deg)`,
      filter: "drop-shadow(0 10px 14px rgba(0,0,0,0.35))"}}>
      <Icono nombre="paint-roller" size={size} color="#F6F2ED" grosor={1.6} />
    </div>
  );
};

/** Corchetes alrededor de la ampolla. */
const CorchetesAmpolla: React.FC<{p: number; op?: number}> = ({p, op = 1}) => (
  <div style={{position: "absolute", left: AMP.x - 150, top: AMP.y - 112, width: 300, height: 224, opacity: op}}>
    <Corchetes ancho={300} alto={224} p={p} />
  </div>
);

// ---------------------------------------------------------------------------------------------- escenas
const Gancho: React.FC = () => {
  const f = useCurrentFrame();
  const A = useAncla();
  const crece = interpolate(f, [0, 70], [0.62, 1], clamp);
  const corte = tramo(f, A(5) + 4, 12) * (1 - tramo(f, A(9) - 8, 8));
  const cubierta = tramo(f, A(9), A(11) - A(9) + 6);
  const grietas = tramo(f, A(12), 16);
  return (
    <Zona>
      <Fachada e={{dia: 0, lluvia: 1, ampolla: crece * (1 + 0.18 * grietas), corte, cubierta, grietas}} />
      <CorchetesAmpolla p={resorte(f, A(5), "pop")} op={1 - tramo(f, A(9) - 6, 6)} />
      <Rodillo p={cubierta} x0={250} x1={560} y={380} />
      <Particulas x={AMP.x} y={AMP.y} desde={A(14)} dur={30} color="#D6CCBE" n={22} radio={7} dispersion={150} semilla="g" />
    </Zona>
  );
};

const Escena: React.FC = () => {
  const f = useCurrentFrame();
  const A = useAncla();
  const c = useColores();
  const pStop = resorte(f, A(24), "pop");
  const fueraStop = tramo(f, A(26) - 2, 8);
  return (
    <Zona>
      <Fachada e={{dia: 0, lluvia: 1 - 0.65 * tramo(f, 0, 70), ampolla: 1.18, cubierta: 1, grietas: 1,
        desprendimientos: resorte(f, A(19), "entrada"), manchas: tramo(f, A(21), 26), humedo: tramo(f, A(23), 12), marcas: tramo(f, A(26), 26)}} />
      {pStop > 0 && fueraStop < 1 ? (
        <div style={{position: "absolute", left: 540 - 110, top: 250, width: 220, height: 220, borderRadius: "50%", background: c.foco,
          display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
          transform: `scale(${interpolate(pStop, [0, 1], [0.3, 1]) * (1 - fueraStop)})`, opacity: Math.min(1, pStop * 3)}}>
          <Icono nombre="tb-hand-stop" size={130} color="#FFFFFF" grosor={1.8} />
        </div>
      ) : null}
      <Ilustrativo />
    </Zona>
  );
};

const Marco: React.FC = () => {
  const f = useCurrentFrame();
  const A = useAncla();
  const c = useColores();
  const fila = (y: number, icono: string, concepto: string[], consecuencia: string, aC: number, aR: number, colores: [string, string], corchete?: number) => {
    const pFlecha = tramo(f, aC + 8, Math.max(6, aR - aC - 6));
    const anchoC = Math.max(...concepto.map((l) => anchoTexto(l, "display", 700, 70, 0, true)));
    const altoC = concepto.length * 70 * 0.98;
    const yFlecha = y + 70;
    return (
      <>
        <div style={{position: "absolute", left: ZONA.x, top: y, width: 470}}>
          <Entra desde={aC} modo="escala">
            <div style={{display: "flex", alignItems: "center", gap: 22}}>
              <div style={{width: 128, height: 128, borderRadius: "50%", background: `linear-gradient(135deg, ${colores[0]}, ${colores[1]})`,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 14px 30px rgba(36,31,28,0.18)"}}>
                <Icono nombre={icono} size={74} color="#FFFFFF" />
              </div>
              <div style={{position: "relative", ...escala("titular_l1", 70), color: c.texto, width: anchoC}}>
                {concepto.map((l) => <div key={l}>{l}</div>)}
                {corchete !== undefined ? (
                  <div style={{position: "absolute", left: 0, top: 0, width: anchoC, height: altoC}}>
                    <Corchetes ancho={anchoC} alto={altoC} p={resorte(f, corchete, "pop")} aire={14} />
                  </div>
                ) : null}
              </div>
            </div>
          </Entra>
        </div>
        <svg width={1080} height={720} style={{position: "absolute", left: 0, top: 0, overflow: "visible"}}>
          <path d={`M 500 ${yFlecha} L 556 ${yFlecha}`} stroke={c.estructura} strokeWidth={7} {...trazo(pFlecha)} />
          <path d={`M 538 ${yFlecha - 18} L 558 ${yFlecha} L 538 ${yFlecha + 18}`} fill="none" stroke={c.estructura} strokeWidth={7}
            opacity={pFlecha >= 1 ? 1 : 0} />
        </svg>
        <div style={{position: "absolute", left: 580, top: y + 4, width: 360}}>
          <Entra desde={aR} modo="derecha">
            <Tarjeta style={{padding: "24px 24px", borderLeft: `10px solid ${c.alerta}`}}>
              <div style={{...escala("cuerpo", 36), fontWeight: 800, color: c.texto, lineHeight: 1.14}}>{consecuencia}</div>
            </Tarjeta>
          </Entra>
        </div>
      </>
    );
  };
  return (
    <Zona>
      {fila(60, "cloud-rain", ["Lluvia"], "Lava la pintura recién puesta", A(30), A(32), [APOYO.niebla, APOYO.eucalipto])}
      {fila(380, "droplets", ["Humedad", "atrapada"], "La despega desde dentro", A(36), A(39), [APOYO.arcilla, APOYO.ladrillo], A(37))}
    </Zona>
  );
};

const PASOS = [
  {texto: "Origen de la humedad", icono: "droplet-off", ancla: 124},
  {texto: "Retirar lo suelto", icono: "brush-cleaning", ancla: 129},
  {texto: "Preparar y pintar", icono: "paint-roller", ancla: 134},
];

const Resultado: React.FC = () => {
  const f = useCurrentFrame();
  const A = useAncla();
  const c = useColores();
  const limpia = tramo(f, A(129), 14);
  const pinta = tramo(f, A(134), 24);
  const pCheck = resorte(f, A(137), "pop");
  return (
    <Zona>
      <Fachada e={{dia: tramo(f, 0, 24), lluvia: 0.35 * (1 - tramo(f, 0, 30)), ampolla: 1.18 * (1 - limpia), grietas: 1 - limpia,
        cubierta: 0, desprendimientos: 1 - limpia, manchas: 1 - tramo(f, A(124), 22), humedo: 1 - tramo(f, A(124), 12),
        marcas: 1 - tramo(f, 0, 12), reparada: pinta, sol: tramo(f, A(137), 20)}} />
      <Particulas x={AMP.x} y={AMP.y} desde={A(129)} dur={28} color="#9C8F7F" n={20} semilla="r1" />
      <Particulas x={LASCAS[0].x} y={LASCAS[0].y} desde={A(129) + 3} dur={28} color="#9C8F7F" n={14} semilla="r2" />
      <Rodillo p={pinta} x0={120} x1={980} y={420} size={170} />
      {PASOS.map((p, i) => {
        const aL = A(p.ancla);
        const hecho = i + 1 < PASOS.length ? f >= A(PASOS[i + 1].ancla) : f >= A(137);
        return (
          <div key={i} style={{position: "absolute", left: 124, top: 34 + i * 90, width: 500}}>
            <Entra desde={aL} modo="izquierda">
              <Tarjeta style={{display: "flex", alignItems: "center", gap: 16, padding: "12px 18px", height: 72, boxSizing: "border-box"}}>
                <div style={{width: 40, height: 40, borderRadius: 4, background: hecho ? c.exito : c.texto, display: "flex", alignItems: "center",
                  justifyContent: "center", flexShrink: 0}}>
                  {hecho ? <Check size={28} p={tramo(f, i + 1 < PASOS.length ? A(PASOS[i + 1].ancla) : A(137), 8)} color="#FFFFFF" grosor={6} />
                    : <span style={{...escala("sello", 22), color: "#FFFFFF"}}>{i + 1}</span>}
                </div>
                <Icono nombre={p.icono} size={34} color={c.estructura} />
                <div style={{...escala("cuerpo", 33), fontWeight: 700, color: c.texto, whiteSpace: "nowrap"}}>{p.texto}</div>
              </Tarjeta>
            </Entra>
          </div>
        );
      })}
      {pCheck > 0 ? (
        <>
          <div style={{position: "absolute", left: AMP.x - 70, top: AMP.y - 70, width: 140, height: 140, borderRadius: "50%", background: c.exito,
            display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${interpolate(pCheck, [0, 1], [0.3, 1])})`,
            boxShadow: "0 18px 36px rgba(0,0,0,0.25)"}}>
            <Check size={84} p={tramo(f, A(137) + 4, 10)} color="#FFFFFF" grosor={7} />
          </div>
          <CorchetesAmpolla p={resorte(f, A(137) + 4, "pop")} />
        </>
      ) : null}
    </Zona>
  );
};

export const escenas: Escenas = {gancho: Gancho, escena: Escena, marco: Marco, resultado: Resultado};
