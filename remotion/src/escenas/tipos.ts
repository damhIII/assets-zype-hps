import React from "react";
import type {Acento} from "../kit/brief";

/** Lo que exporta src/escenas/actual.tsx (lo único que se escribe por video). */
export type Escenas = {
  /** Frame 0 = brief.gancho.primer_frame dibujado y ya en movimiento. También es la portada y el destino del bucle. */
  gancho: React.FC;
  escena: React.FC;
  marco: React.FC;
  /** El objeto del gancho ya resuelto (misma composición del frame 0, ahora bien). */
  resultado: React.FC;
  /** Opcional: sustituye a la plantilla del formato en el cuerpo (casi nunca hace falta). */
  cuerpo?: React.FC;
  /** Opcional: se dibuja detrás de la plantilla del cuerpo. */
  cuerpoFondo?: React.FC;
  /** Opcional: capa extra en cada acento de decisiones.json (siempre hay además un golpe de cámara). */
  acento?: React.FC<{acento: Acento; indice: number}>;
};
