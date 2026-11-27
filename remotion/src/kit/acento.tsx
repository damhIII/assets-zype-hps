// Acento por defecto (si actual.tsx no exporta `acento`): además del golpe de cámara, si el `que` del acento empieza por
// «chip:» aparece un chip con ese texto (y un icono opcional tras «|») abajo a la derecha de la escena, ~2 s.
//   { "ancla": 81, "que": "chip: MEDIDOR DE HUMEDAD | gauge" }
// Cualquier otro `que` solo da el golpe de cámara (dibuja lo que describa dentro de tu escena con useAncla).
import React from "react";
import {interpolate, useCurrentFrame} from "remotion";
import {Acento} from "./brief";
import {Icono, ZONA} from "./piezas";
import {escala} from "./texto";
import {resorte, tramo, useColores} from "./tiempo";

export const AcentoPorDefecto: React.FC<{acento: Acento; indice: number}> = ({acento}) => {
  const f = useCurrentFrame();
  const c = useColores();
  const m = acento.que.match(/^\s*chip:\s*([^|]+?)\s*(?:\|\s*([a-z0-9-]+))?\s*$/i);
  if (!m) return null;
  const p = resorte(f, 0, "pop");
  const q = tramo(f, 56, 8);
  return (
    <div style={{position: "absolute", right: 1080 - (ZONA.x + ZONA.ancho), top: ZONA.y + ZONA.alto - 84, display: "flex", alignItems: "center",
      gap: 12, background: c.texto, color: c.superficie, padding: "12px 18px 10px", borderRadius: 4, ...escala("sello", 22),
      transform: `scale(${interpolate(p, [0, 1], [0.3, 1])}) translateY(${q * 20}px)`, opacity: Math.min(1, p * 3) * (1 - q),
      transformOrigin: "right center", boxShadow: "0 12px 26px rgba(36,31,28,0.25)"}}>
      {m[2] ? <Icono nombre={m[2]} size={28} color={c.superficie} /> : null}
      <span>{m[1]}</span>
    </div>
  );
};
