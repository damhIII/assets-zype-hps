import React from "react";
import {escala} from "../kit/texto";
import {TextoMarcado} from "../kit/piezas";

/** Texto con marcador rojo en la acción: lo que vaya entre *asteriscos*; sin asteriscos, lo que sigue a «:». */
export const TextoAntidoto: React.FC<{texto: string; p: number; px: number; color: string; style?: React.CSSProperties}> =
  ({texto, p, px, color, style}) => {
    let t = String(texto);
    if (!t.includes("*") && t.includes(":")) {
      const [a, ...r] = t.split(":");
      t = `${a}: *${r.join(":").trim()}*`;
    }
    return (
      <div style={{...escala("cuerpo", px), fontWeight: 700, color, lineHeight: 1.2, ...style}}>
        <TextoMarcado texto={t} p={p} />
      </div>
    );
  };
