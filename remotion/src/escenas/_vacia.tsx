// Punto de partida de src/escenas/actual.tsx (lo copia preparar_proyecto.py si no existe). Sustituye cada escena.
import React from "react";
import {Zona, ZONA, useColores, escala} from "../kit";
import type {Escenas} from "./tipos";

const Pendiente: React.FC<{nombre: string}> = ({nombre}) => {
  const c = useColores();
  return (
    <Zona>
      <div style={{position: "absolute", left: ZONA.x, top: ZONA.alto / 2 - 30, width: ZONA.ancho, textAlign: "center",
        ...escala("etiqueta"), color: c.texto_suave}}>escena «{nombre}» pendiente</div>
    </Zona>
  );
};

export const escenas: Escenas = {
  gancho: () => <Pendiente nombre="gancho" />,
  escena: () => <Pendiente nombre="escena" />,
  marco: () => <Pendiente nombre="marco" />,
  resultado: () => <Pendiente nombre="resultado" />,
};
