// Plantilla `checklist` (plantillas/checklist.md): portapapeles con casillas que se marcan cuando la voz nombra cada
// ítem, «cómo verificar» debajo y bandera roja final. La lista completa queda legible al final del bloque.
import React from "react";
import {useCurrentFrame} from "remotion";
import {ANTICIPA} from "../kit/brief";
import {Check, Icono, Tarjeta, Zona, ZONA} from "../kit/piezas";
import {ajustarPx, escala} from "../kit/texto";
import {aLocal, resorte, tramo, useBloque, useColores} from "../kit/tiempo";

export const Checklist: React.FC<{p: any}> = ({p}) => {
  const f = useCurrentFrame();
  const b = useBloque();
  const c = useColores();
  const items: any[] = p.items || [];
  const n = items.length;
  const W = ZONA.ancho;
  const top = 14, alto = ZONA.alto - 22;
  const tituloH = 92;
  const banderaH = p.bandera_roja ? 84 : 0;
  const areaH = alto - tituloH - (banderaH ? banderaH + 28 : 0) - 24;
  const itemH = areaH / Math.max(1, n);
  const pxTexto = Math.round(Math.min(44, itemH * 0.38));
  const pxComo = Math.round(Math.min(28, itemH * 0.235));
  const pIn = resorte(f, 0, "entrada");
  const bL = p.bandera_roja ? aLocal(b, p.bandera_roja.ancla_f, ANTICIPA) : Infinity;
  const pb = resorte(f, bL, "entrada");

  return (
    <Zona>
      <Tarjeta style={{position: "absolute", left: ZONA.x, top, width: W, height: alto, transform: `translateY(${(1 - pIn) * 50}px)`,
        opacity: Math.min(1, pIn * 3)}}>
        <div style={{position: "absolute", left: W / 2 - 80, top: -14, width: 160, height: 40, background: c.estructura, borderRadius: 8}} />
        <div style={{position: "absolute", left: W / 2 - 22, top: -6, width: 44, height: 16, background: c.superficie, borderRadius: 8}} />
        <div style={{position: "absolute", left: 40, top: 40, width: W - 80, ...escala("titular_l1",
          ajustarPx(p.titulo ?? "", "display", 700, 56, 38, W - 80, 0, true)), color: c.texto, whiteSpace: "nowrap"}}>{p.titulo}</div>
        {items.map((it, i) => {
          const aL = aLocal(b, it.ancla_f);
          const pi = resorte(f, aL, "entrada");
          const pc = tramo(f, aL, 8);
          const pComo = resorte(f, aL + ANTICIPA + 10, "entrada");
          const y = tituloH + 24 + i * itemH;
          const como = [it.como_verificar, it.fuente_corta ? `Fuente: ${it.fuente_corta}` : null].filter(Boolean).join(" · ");
          return (
            <div key={i} style={{position: "absolute", left: 40, top: y, width: W - 80, height: itemH, display: "flex", gap: 24,
              alignItems: "flex-start", borderTop: i ? `2px solid ${c.linea}` : "none", paddingTop: 10, boxSizing: "border-box"}}>
              <div style={{width: 46, height: 46, border: `4px solid ${pc > 0 ? c.exito : c.estructura}`, borderRadius: 6, flexShrink: 0,
                opacity: 0.45 + 0.55 * Math.min(1, pi * 2), display: "flex", alignItems: "center", justifyContent: "center",
                transform: `scale(${1 + 0.15 * Math.sin(Math.PI * Math.min(1, pc))})`, marginTop: 2}}>
                {pc > 0 ? <Check size={40} p={pc} /> : null}
              </div>
              <div style={{flex: 1, opacity: Math.min(1, pi * 3), transform: `translateX(${(1 - pi) * 40}px)`}}>
                <div style={{display: "flex", alignItems: "center", gap: 12}}>
                  {it.icono ? <Icono nombre={it.icono} size={pxTexto} color={c.estructura} /> : null}
                  <div style={{...escala("cuerpo", pxTexto), fontWeight: 700, color: c.texto, lineHeight: 1.12}}>{it.texto}</div>
                </div>
                {como && itemH > pxTexto * 1.6 ? (
                  <div style={{...escala("cuerpo", pxComo), color: c.texto_suave, marginTop: 6, opacity: Math.min(1, pComo * 3), lineHeight: 1.15}}>{como}</div>
                ) : null}
              </div>
            </div>
          );
        })}
        {p.bandera_roja && pb > 0 ? (
          <div style={{position: "absolute", left: 24, top: alto - banderaH - 18, width: W - 48, height: banderaH, background: c.alerta,
            borderRadius: 6, display: "flex", alignItems: "center", gap: 20, padding: "0 24px", boxSizing: "border-box",
            transform: `translateX(${(1 - pb) * 400}px)`, opacity: Math.min(1, pb * 3)}}>
            <div style={{transform: `rotate(${Math.sin(f / 4) * 8}deg)`, transformOrigin: "10% 90%"}}>
              <Icono nombre="flag" size={44} color="#FFFFFF" grosor={2.5} />
            </div>
            <div style={{...escala("cuerpo", 36), fontWeight: 800, color: "#FFFFFF", lineHeight: 1.1}}>{p.bandera_roja.texto}</div>
          </div>
        ) : null}
      </Tarjeta>
    </Zona>
  );
};
