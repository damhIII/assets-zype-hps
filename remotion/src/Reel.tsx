// Composición Reel-es: fondo → escenas (con cámara viva, punch-in de remate y golpe en cada acento) → bucle → marco → audio.
// No hace falta tocar este archivo: por video solo cambian src/escenas/actual.tsx, src/brief_es.json y src/audio_es.json.
import React from "react";
import {AbsoluteFill, Freeze, Sequence, useCurrentFrame} from "remotion";
import {ANTICIPA, Bloque, brief, indiceBloqueEn, palabraF, T} from "./kit/brief";
import {useFuentes} from "./kit/cargar";
import {BloqueContext, pulso, resorte, tramo} from "./kit/tiempo";
import {AudioReel} from "./marco/AudioReel";
import {Cta} from "./marco/Cta";
import {BarraProgreso, Fondo, Header, PieLegal, Subtitulos, Titular} from "./marco/Marco";
import {PLANTILLAS} from "./plantillas";
import {escenas} from "./escenas/actual";
import {AcentoPorDefecto} from "./kit/acento";

const Cuerpo: React.FC = () => {
  const P = PLANTILLAS[brief.plantilla.id];
  const Fondo = escenas.cuerpoFondo;
  if (escenas.cuerpo) return <escenas.cuerpo />;
  return <>{Fondo ? <Fondo /> : null}{P ? <P p={brief.plantilla.params} /> : null}</>;
};

const COMPONENTE: Record<string, React.FC> = {
  gancho: escenas.gancho, escena: escenas.escena, marco: escenas.marco, cuerpo: Cuerpo, resultado: escenas.resultado, cta: Cta,
};

/** Frame del remate de cada bloque (última palabra que dice la voz en él): punch-in suave 1 → 1,05. */
const REMATE = brief.bloques.map((b) => palabraF(Math.max(b.palabras[0], b.palabras[1] - 1)));

const Camara: React.FC<{children: React.ReactNode}> = ({children}) => {
  const f = useCurrentFrame();
  const k = indiceBloqueEn(f);
  const b = brief.bloques[k];
  const flota = Math.sin(f / 14) * T.movimiento.camara_flotante_px;
  const remate = b.id === "cta" ? 0 : 0.05 * resorte(f, REMATE[k], "pop");
  const golpe = brief.acentos.reduce((s, a) => s + 0.035 * pulso(f, a.ancla_f - ANTICIPA, 16), 0);
  return (
    <AbsoluteFill style={{transform: `translateY(${flota}px) scale(${1 + remate + golpe})`, transformOrigin: "540px 960px"}}>
      {children}
    </AbsoluteFill>
  );
};

const Acentos: React.FC = () => {
  const A = escenas.acento ?? AcentoPorDefecto;
  return (
    <>
      {brief.acentos.map((a, i) => {
        const desde = Math.max(0, a.ancla_f - ANTICIPA);
        const b = brief.bloques[indiceBloqueEn(a.ancla_f)];
        const dur = Math.max(1, Math.min(75, b.fin_f - desde));
        return (
          <Sequence key={i} from={desde} durationInFrames={dur}>
            <BloqueContext.Provider value={{...b, ini_f: desde} as Bloque}>
              <A acento={a} indice={i} />
            </BloqueContext.Provider>
          </Sequence>
        );
      })}
    </>
  );
};

/** Bucle: el CTA se funde y vuelve la composición exacta del frame 0. */
const Bucle: React.FC = () => {
  const {ini_f, fin_f} = brief.bucle;
  const G = escenas.gancho;
  return (
    <Sequence from={ini_f} durationInFrames={Math.max(1, fin_f - ini_f)}>
      <BucleInterior G={G} />
    </Sequence>
  );
};
const BucleInterior: React.FC<{G: React.FC}> = ({G}) => {
  const l = useCurrentFrame();
  return (
    <AbsoluteFill style={{opacity: tramo(l, 0, Math.max(1, Math.min(8, brief.bucle.fin_f - brief.bucle.ini_f - 1)))}}>
      <Freeze frame={0}>
        <BloqueContext.Provider value={brief.bloques[0]}>
          <G />
        </BloqueContext.Provider>
      </Freeze>
    </AbsoluteFill>
  );
};

export const Reel: React.FC = () => {
  useFuentes();
  return (
    <AbsoluteFill style={{overflow: "hidden"}}>
      <Fondo />
      <Camara>
        {brief.bloques.map((b) => {
          const C = COMPONENTE[b.id];
          return (
            <Sequence key={b.id} from={b.ini_f} durationInFrames={Math.max(1, b.fin_f - b.ini_f)} name={b.id}>
              <BloqueContext.Provider value={b}>
                <C />
              </BloqueContext.Provider>
            </Sequence>
          );
        })}
        <Acentos />
      </Camara>
      <Bucle />
      <BarraProgreso />
      <Header />
      <Titular />
      <Subtitulos />
      <PieLegal />
      <AudioReel />
    </AbsoluteFill>
  );
};
