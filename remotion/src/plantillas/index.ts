import React from "react";
import {Checklist} from "./Checklist";
import {Comparador} from "./Comparador";
import {Cronograma} from "./Cronograma";
import {Errores} from "./Errores";
import {MitoRealidad} from "./MitoRealidad";
import {Planta} from "./Planta";

export const PLANTILLAS: Record<string, React.FC<{p: any}>> = {
  errores: Errores,
  mito_realidad: MitoRealidad,
  comparador: Comparador,
  checklist: Checklist,
  cronograma: Cronograma,
  planta: Planta,
};
export {Checklist, Comparador, Cronograma, Errores, MitoRealidad, Planta};
