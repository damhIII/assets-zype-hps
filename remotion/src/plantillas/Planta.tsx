// Plantilla `planta` (plantillas/planta.md): planta 2D cenital a escala con los símbolos de illus/planta recoloreados
// con el estilo activo. Muros que se dibujan, elementos que entran al nombrarlos, cambio de estilo y muro que cae.
// También se puede usar en otras escenas: <Planta p={brief.plantilla.params} estatico estilo="..." posiciones={...} />.
import React from "react";
import {interpolate, interpolateColors, useCurrentFrame} from "remotion";
import {ANTICIPA, ESTILOS, T} from "../kit/brief";
import {partesSvg, useTexto} from "../kit/cargar";
import {Icono, Ilustrativo, Particulas, Textura, Zona, ZONA, trazo} from "../kit/piezas";
import {escala} from "../kit/texto";
import {aLocal, resorte, tramo, useBloque, useColores} from "../kit/tiempo";

type Pos = {x: number; y: number; rot?: number};
type Sala = {w: number; h: number; puerta: number; ventana: [number, number]; muroX: number; suelo: string; slots: Record<string, Pos[]>};

// Medidas en cm. Slots: esquina superior izquierda del símbolo SIN rotar; rot en grados alrededor de su centro.
const SALAS: Record<string, Sala> = {
  sala: {w: 520, h: 420, puerta: 30, ventana: [190, 150], muroX: 330, suelo: "tablones", slots: {
    alfombra: [{x: 150, y: 120}], sofa: [{x: 145, y: 8}], mesa: [{x: 195, y: 160}], sillas: [{x: 40, y: 150, rot: 90}],
    lampara: [{x: 380, y: 14}], planta: [{x: 450, y: 14}], armario: [{x: 330, y: 352}], escritorio: [{x: 380, y: 200, rot: -90}],
    ventana: [{x: 190, y: -8}], puerta: [{x: 30, y: 325}], aire_acondicionado: [{x: 400, y: 0}], panel_electrico: [{x: 470, y: 380}],
    cama: [{x: 300, y: 120}]}},
  sala_comedor: {w: 640, h: 440, puerta: 40, ventana: [240, 160], muroX: 360, suelo: "tablones", slots: {
    alfombra: [{x: 60, y: 140}], sofa: [{x: 55, y: 8}], mesa: [{x: 420, y: 130}], sillas: [{x: 420, y: 130}], lampara: [{x: 290, y: 14}],
    planta: [{x: 570, y: 14}], armario: [{x: 420, y: 372}], ventana: [{x: 240, y: -8}], puerta: [{x: 40, y: 345}],
    aire_acondicionado: [{x: 500, y: 0}], panel_electrico: [{x: 590, y: 400}], escritorio: [{x: 150, y: 330}]}},
  cocina: {w: 460, h: 380, puerta: 330, ventana: [150, 150], muroX: 300, suelo: "baldosa", slots: {
    encimera: [{x: 10, y: 0}, {x: 70, y: 0}, {x: 250, y: 0}], fregadero: [{x: 180, y: 0}], estufa: [{x: 320, y: 0}],
    nevera: [{x: 386, y: 0}], isla: [{x: 130, y: 170}], mesa: [{x: 130, y: 170}], sillas: [{x: 130, y: 170}],
    lavadora: [{x: 10, y: 120, rot: -90}], planta: [{x: 400, y: 300}], ventana: [{x: 150, y: -8}], puerta: [{x: 330, y: 285}],
    panel_electrico: [{x: 10, y: 330}], aire_acondicionado: [{x: 20, y: 0}], armario: [{x: 260, y: 318}], lampara: [{x: 30, y: 300}]}},
  bano: {w: 300, h: 240, puerta: 190, ventana: [40, 100], muroX: 170, suelo: "baldosa", slots: {
    ducha: [{x: 8, y: 0}], banera: [{x: 8, y: 0}], inodoro: [{x: 160, y: 0}], lavabo: [{x: 220, y: 0}], armario: [{x: 220, y: 180}],
    planta: [{x: 10, y: 180}], lampara: [{x: 120, y: 190}], ventana: [{x: 40, y: -8}], puerta: [{x: 190, y: 145}],
    lavadora: [{x: 10, y: 120}], panel_electrico: [{x: 250, y: 120}], aire_acondicionado: [{x: 110, y: 0}]}},
  dormitorio: {w: 440, h: 400, puerta: 330, ventana: [60, 150], muroX: 300, suelo: "tablones", slots: {
    cama: [{x: 140, y: 0}], alfombra: [{x: 120, y: 150}], armario: [{x: 10, y: 330}], escritorio: [{x: 320, y: 140, rot: 90}],
    lampara: [{x: 90, y: 10}], planta: [{x: 370, y: 10}], sillas: [{x: 300, y: 160}], sofa: [{x: 120, y: 300, rot: 180}],
    ventana: [{x: 60, y: -8}], puerta: [{x: 330, y: 305}], aire_acondicionado: [{x: 300, y: 0}], panel_electrico: [{x: 10, y: 240}],
    mesa: [{x: 60, y: 10}]}},
  estudio: {w: 380, h: 330, puerta: 260, ventana: [100, 150], muroX: 240, suelo: "tablones", slots: {
    escritorio: [{x: 120, y: 0}], sillas: [{x: 150, y: 100}], armario: [{x: 10, y: 270}], sofa: [{x: 80, y: 238, rot: 180}],
    lampara: [{x: 30, y: 20}], planta: [{x: 310, y: 20}], alfombra: [{x: 90, y: 110}], ventana: [{x: 100, y: -8}],
    puerta: [{x: 260, y: 235}], aire_acondicionado: [{x: 280, y: 0}], panel_electrico: [{x: 10, y: 180}], mesa: [{x: 140, y: 140}]}},
  lavanderia: {w: 280, h: 220, puerta: 170, ventana: [60, 100], muroX: 150, suelo: "baldosa", slots: {
    lavadora: [{x: 10, y: 0}, {x: 75, y: 0}], fregadero: [{x: 150, y: 0}], armario: [{x: 90, y: 158}], encimera: [{x: 210, y: 0}],
    panel_electrico: [{x: 230, y: 110}], planta: [{x: 10, y: 160}], ventana: [{x: 60, y: -8}], puerta: [{x: 170, y: 125}],
    aire_acondicionado: [{x: 200, y: 0}], lampara: [{x: 20, y: 100}]}},
  exterior: {w: 640, h: 420, puerta: 260, ventana: [60, 150], muroX: 400, suelo: "baldosa", slots: {
    mesa: [{x: 380, y: 140}], sillas: [{x: 380, y: 140}], sofa: [{x: 60, y: 300, rot: 180}], alfombra: [{x: 60, y: 140}],
    planta: [{x: 10, y: 10}, {x: 580, y: 10}], lampara: [{x: 300, y: 20}], encimera: [{x: 200, y: 0}, {x: 260, y: 0}],
    estufa: [{x: 320, y: 0}], fregadero: [{x: 380, y: 0}], nevera: [{x: 460, y: 0}], isla: [{x: 260, y: 130}],
    ventana: [{x: 60, y: -8}], puerta: [{x: 260, y: 325}], aire_acondicionado: [{x: 540, y: 380}], panel_electrico: [{x: 10, y: 380}]}},
  apartamento: {w: 800, h: 520, puerta: 360, ventana: [120, 160], muroX: 480, suelo: "tablones", slots: {
    cama: [{x: 560, y: 0}], sofa: [{x: 80, y: 8}], mesa: [{x: 120, y: 170}], alfombra: [{x: 80, y: 140}], isla: [{x: 120, y: 330}],
    encimera: [{x: 10, y: 440, rot: 180}, {x: 70, y: 440, rot: 180}], estufa: [{x: 130, y: 440, rot: 180}], fregadero: [{x: 190, y: 440, rot: 180}],
    nevera: [{x: 270, y: 440, rot: 180}], armario: [{x: 600, y: 452}], ducha: [{x: 690, y: 300}], inodoro: [{x: 740, y: 230}],
    lavabo: [{x: 720, y: 160, rot: 90}], lampara: [{x: 500, y: 20}], planta: [{x: 400, y: 20}], escritorio: [{x: 500, y: 300}],
    ventana: [{x: 120, y: -8}], puerta: [{x: 360, y: 425}], aire_acondicionado: [{x: 300, y: 0}], panel_electrico: [{x: 760, y: 470}],
    sillas: [{x: 400, y: 180}], lavadora: [{x: 500, y: 452}]}},
};

// tipo de elemento → símbolo de illus/planta
const SIMBOLO: Record<string, {archivo: string; w: number; h: number} | null> = {
  sofa: {archivo: "sofa_3", w: 210, h: 90}, mesa: {archivo: "mesa_centro", w: 110, h: 60}, sillas: {archivo: "comedor_4", w: 140, h: 180},
  cama: {archivo: "cama_doble", w: 160, h: 200}, isla: {archivo: "isla_cocina", w: 200, h: 150}, encimera: {archivo: "encimera_tramo", w: 60, h: 60},
  estufa: {archivo: "estufa", w: 60, h: 60}, nevera: {archivo: "nevera", w: 70, h: 70}, fregadero: {archivo: "fregadero", w: 80, h: 60},
  ducha: {archivo: "ducha_ras_lineal", w: 120, h: 90}, banera: {archivo: "banera", w: 170, h: 75}, inodoro: {archivo: "inodoro", w: 40, h: 70},
  lavabo: {archivo: "lavamanos", w: 60, h: 48}, armario: {archivo: "armario", w: 180, h: 60}, alfombra: {archivo: "alfombra", w: 200, h: 140},
  planta: {archivo: "planta_maceta", w: 50, h: 50}, lampara: {archivo: "lampara_pie", w: 40, h: 40}, escritorio: {archivo: "escritorio", w: 120, h: 105},
  lavadora: {archivo: "lavadora", w: 60, h: 60}, puerta: {archivo: "puerta_80", w: 95, h: 95}, ventana: {archivo: "ventana_120", w: 150, h: 15},
  panel_electrico: null, aire_acondicionado: null,
};

const NEUTRO = {piso: "#E4DACB", muro: "#F6F2ED", madera: "#C9B8A3", textil: "#FFFFFF", metal: "#85776A", verde: "#9AA88F", acento: "#B9AFA3"};
type Est = typeof NEUTRO;
const CLAVES = Object.keys(NEUTRO) as (keyof Est)[];

const mezclaEst = (a: Est, b: Est, t: number): Est =>
  Object.fromEntries(CLAVES.map((k) => [k, t <= 0 ? a[k] : t >= 1 ? b[k] : interpolateColors(t, [0, 1], [a[k], b[k]])])) as Est;

const Simbolo: React.FC<{archivo: string; x: number; y: number; w: number; h: number; rot: number; est: Est; texto: string; tipo: string}> =
  ({archivo, x, y, w, h, rot, est, texto, tipo}) => {
    const svg = useTexto(`illus/planta/${archivo}.svg`);
    if (!svg) return null;
    const p = partesSvg(svg);
    const verde = tipo === "planta";
    const interior = p.interior
      .replace(/#FFFFFF/gi, verde ? est.verde : tipo === "alfombra" ? est.acento : est.textil)
      .replace(/#DCD2C6/gi, verde ? est.verde : est.madera)
      .replace(/#85776A/gi, est.metal)
      .replace(/#241F1C/gi, texto)
      .replace(/#5E544C/gi, est.metal);
    return <g transform={`rotate(${rot} ${x + w / 2} ${y + h / 2})`} dangerouslySetInnerHTML={{__html:
      `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="${p.viewBox}" preserveAspectRatio="none" overflow="visible">${interior}</svg>`}} />;
  };

export const Planta: React.FC<{p: any; estatico?: boolean; estilo?: string; posiciones?: Record<number, Pos>; sinMuro?: boolean}> =
  ({p, estatico = false, estilo, posiciones = {}, sinMuro = false}) => {
    const f = useCurrentFrame();
    const b = useBloque();
    const c = useColores();
    const sala = SALAS[p.espacio] ?? SALAS.sala;
    const caja = {x: ZONA.x, y: 76, w: ZONA.ancho, h: ZONA.alto - 76 - 50};
    const s = Math.min(caja.w / sala.w, caja.h / sala.h) * 0.96;
    const ox = caja.x + (caja.w - sala.w * s) / 2;
    const oy = caja.y + (caja.h - sala.h * s) / 2;
    const muroPx: number = T.forma.muro_planta;
    const pMuros = estatico ? 1 : tramo(f, 0, 16);

    // estilo activo
    const estilos: any[] = p.estilos || [];
    let est: Est = NEUTRO;
    let etiquetaEst: {nombre: string; desde: number; colores: Est} | null = null;
    if (estilo && ESTILOS[estilo]) est = ESTILOS[estilo];
    else if (estatico && estilos.length) est = ESTILOS[estilos[estilos.length - 1].estilo] ?? NEUTRO;
    else {
      estilos.forEach((e, i) => {
        const aL = aLocal(b, e.ancla_f, ANTICIPA);
        if (f >= aL) {
          const prev = i ? ESTILOS[estilos[i - 1].estilo] ?? NEUTRO : NEUTRO;
          est = mezclaEst(prev, ESTILOS[e.estilo] ?? NEUTRO, tramo(f, aL, 14));
          etiquetaEst = {nombre: ESTILOS[e.estilo]?.nombre ?? e.estilo, desde: aL, colores: ESTILOS[e.estilo] ?? NEUTRO};
        }
      });
      if (p.modo !== "cambiar_estilo" && estilos.length === 1 && !etiquetaEst) est = ESTILOS[estilos[0].estilo] ?? NEUTRO;
    }

    // muro que cae
    const mq = p.muro_que_cae && !sinMuro;
    const mL = mq ? aLocal(b, p.muro_que_cae.ancla_f, ANTICIPA) : Infinity;
    const parpadeo = mq && f >= mL && f < mL + 18 ? Math.floor((f - mL) / 3) % 2 === 0 : false;
    const cae = mq ? tramo(f, mL + 18, 14) : 0;
    const muroX = ox + sala.muroX * s;

    // posiciones de los elementos
    const usados: Record<string, number> = {};
    const elementos: any[] = p.elementos || [];
    const libres = (k: number): Pos => ({x: 20 + ((k * 137) % Math.max(60, sala.w - 120)), y: 20 + ((k * 89) % Math.max(60, sala.h - 120))});
    const textoC = c.texto;

    return (
      <Zona>
        {etiquetaEst ? <EtiquetaEstilo {...(etiquetaEst as {nombre: string; desde: number; colores: Est})} f={f} /> : null}
        <div style={{position: "absolute", left: ox, top: oy, width: sala.w * s, height: sala.h * s, background: est.piso, overflow: "hidden",
          opacity: Math.min(1, pMuros * 2)}}>
          <Textura nombre={`mat_${sala.suelo}`} opacidad={0.55} />
        </div>
        <Textura nombre="blueprint" opacidad={0.5} style={{left: ox - 30, top: oy - 30, width: sala.w * s + 60, height: sala.h * s + 60,
          right: "auto", bottom: "auto"}} />
        <svg width={1080} height={ZONA.alto} style={{position: "absolute", left: 0, top: 0, overflow: "visible"}}>
          {/* muros */}
          <rect x={ox} y={oy} width={sala.w * s} height={sala.h * s} fill="none" stroke={textoC} strokeWidth={muroPx} {...trazo(pMuros)} />
          {mq && cae < 1 ? (
            <line x1={muroX} y1={oy} x2={muroX} y2={oy + sala.h * s * 0.58} stroke={parpadeo ? c.alerta : textoC} strokeWidth={muroPx * 0.8}
              opacity={1 - cae} {...trazo(pMuros)} />
          ) : null}
          {/* puerta: hueco en el muro inferior con arco de apertura */}
          {pMuros > 0.85 ? (
            <g opacity={tramo(pMuros, 0.85, 0.15)}>
              <rect x={ox + sala.puerta * s} y={oy + sala.h * s - muroPx} width={85 * s} height={muroPx * 2} fill={est.piso} />
              <path d={`M ${ox + sala.puerta * s} ${oy + sala.h * s} L ${ox + sala.puerta * s} ${oy + sala.h * s - 85 * s} A ${85 * s} ${85 * s} 0 0 1 ${ox + (sala.puerta + 85) * s} ${oy + sala.h * s}`}
                fill="none" stroke={c.estructura} strokeWidth={3} />
              {/* ventana: doble línea sobre el muro superior */}
              <rect x={ox + sala.ventana[0] * s} y={oy - muroPx / 2} width={sala.ventana[1] * s} height={muroPx} fill={c.superficie} />
              <line x1={ox + sala.ventana[0] * s} y1={oy - 3} x2={ox + (sala.ventana[0] + sala.ventana[1]) * s} y2={oy - 3} stroke={c.estructura} strokeWidth={2} />
              <line x1={ox + sala.ventana[0] * s} y1={oy + 3} x2={ox + (sala.ventana[0] + sala.ventana[1]) * s} y2={oy + 3} stroke={c.estructura} strokeWidth={2} />
            </g>
          ) : null}
          {/* elementos (las alfombras primero, debajo de todo) */}
          {elementos.map((e, k) => ({e, k})).sort((a, z) => Number(z.e.tipo === "alfombra") - Number(a.e.tipo === "alfombra")).map(({e, k}) => {
            const n = usados[e.tipo] ?? 0;
            usados[e.tipo] = n + 1;
            const pos: Pos = posiciones[k] ?? (sala.slots[e.tipo] ?? [])[n] ?? libres(k);
            const sim = SIMBOLO[e.tipo];
            const w = (sim?.w ?? (e.tipo === "aire_acondicionado" ? 80 : 40)) * s;
            const h = (sim?.h ?? (e.tipo === "aire_acondicionado" ? 24 : 16)) * s;
            const x = ox + pos.x * s, y = oy + pos.y * s;
            const aL = estatico ? -999 : aLocal(b, e.ancla_f);
            const pe = estatico ? 1 : resorte(f, aL, "entrada");
            if (pe <= 0) return null;
            const sc = interpolate(pe, [0, 1], [0.3, 1]);
            return (
              <g key={k} transform={`translate(${x + w / 2} ${y + h / 2}) scale(${sc}) translate(${-(x + w / 2)} ${-(y + h / 2)})`} opacity={Math.min(1, pe * 3)}>
                {sim ? <Simbolo archivo={sim.archivo} x={x} y={y} w={w} h={h} rot={pos.rot ?? 0} est={est} texto={textoC} tipo={e.tipo} /> : (
                  <rect x={x} y={y} width={w} height={h} fill={est.metal} stroke={textoC} strokeWidth={2} />
                )}
              </g>
            );
          })}
        </svg>
        {/* etiquetas de los elementos: visibles 3 s desde que entran */}
        {elementos.map((e, k) => {
          if (!e.etiqueta || estatico) return null;
          const aL = aLocal(b, e.ancla_f);
          const pe = resorte(f, aL + 4, "entrada");
          const q = tramo(f, aL + 90, 10);
          if (pe <= 0 || q >= 1) return null;
          const n = elementos.slice(0, k).filter((x) => x.tipo === e.tipo).length;
          const pos: Pos = posiciones[k] ?? (sala.slots[e.tipo] ?? [])[n] ?? libres(k);
          const sim = SIMBOLO[e.tipo];
          const cx = ox + (pos.x + (sim?.w ?? 40) / 2) * s;
          const cy = oy + (pos.y + (sim?.h ?? 16)) * s + 14;
          return (
            <div key={`t${k}`} style={{position: "absolute", left: Math.max(ZONA.x, Math.min(ZONA.x + ZONA.ancho - 300, cx - 150)), top: cy,
              width: 300, textAlign: "center", opacity: Math.min(1, pe * 3) * (1 - q), transform: `translateY(${(1 - pe) * 16}px)`}}>
              <span style={{...escala("sello", 19), background: c.texto, color: c.superficie, padding: "6px 10px 4px", borderRadius: 3}}>{e.etiqueta}</span>
            </div>
          );
        })}
        {mq && f >= mL ? (
          <>
            <Particulas x={muroX} y={oy + sala.h * s * 0.15} desde={mL + 18} dur={26} color={c.estructura} n={18} semilla="m1" dispersion={120} />
            <Particulas x={muroX} y={oy + sala.h * s * 0.42} desde={mL + 20} dur={26} color={c.estructura} n={18} semilla="m2" dispersion={120} />
            <div style={{position: "absolute", left: ZONA.x, top: 8, width: ZONA.ancho, display: "flex", alignItems: "center", gap: 14,
              opacity: Math.min(1, resorte(f, mL + 4, "entrada") * 3), background: c.superficie, borderLeft: `8px solid ${c.alerta}`,
              padding: "12px 18px", boxSizing: "border-box", boxShadow: T.forma.sombra_tarjeta}}>
              <Icono nombre="triangle-alert" size={36} color={c.alerta} />
              <div style={{...escala("cuerpo", 28), fontWeight: 700, color: c.texto}}>{p.muro_que_cae.etiqueta}</div>
            </div>
          </>
        ) : null}
        {p.ilustrativo !== false ? <Ilustrativo /> : null}
      </Zona>
    );
  };

const EtiquetaEstilo: React.FC<{nombre: string; desde: number; colores: Est; f: number}> = ({nombre, desde, colores, f}) => {
  const c = useColores();
  const pe = resorte(f, desde, "entrada");
  return (
    <div style={{position: "absolute", left: ZONA.x, top: 0, height: 64, display: "flex", alignItems: "center", gap: 18,
      transform: `translateY(${(1 - pe) * 30}px)`, opacity: Math.min(1, pe * 3)}}>
      <div style={{...escala("titular_l1", 50), color: c.texto}}>{nombre}</div>
      {(["piso", "madera", "acento"] as const).map((k, i) => (
        <div key={k} style={{width: 34, height: 34, borderRadius: "50%", background: colores[k], border: `3px solid ${c.superficie}`,
          boxShadow: "0 4px 10px rgba(36,31,28,0.18)", transform: `scale(${resorte(f, desde + 4 + i * 3, "pop")})`}} />
      ))}
    </div>
  );
};
