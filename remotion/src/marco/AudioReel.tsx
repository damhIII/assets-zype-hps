// Audio (audio.md): la locución intacta a volumen 1; la música por debajo (sube en los huecos de voz y en la cola) y los
// efectos de audio.json en su ancla, 2 frames antes.
import React from "react";
import {Audio, interpolate, Sequence, staticFile} from "remotion";
import {ANTICIPA, brief, FPS, PALABRAS, palabraF, planAudio, TOTAL} from "../kit/brief";

// La música solo sube en pausas largas (≥ 1 s) y en la cola: en las pausas normales entre frases se queda quieta,
// así no «bombea» en cada frase.
const HUECO_S = 1.0;
const RAMPA = 12;

/** Volumen de la música por frame: base mientras habla la voz, más alto en huecos ≥ 1 s y en la cola, con rampas. */
const VOL_MUSICA: number[] = (() => {
  const m = planAudio.musica;
  if (!m) return [];
  const base = m.volumen;
  const alto = Math.min(0.25, Math.max(0.22, base + 0.1));
  const objetivo = new Array(TOTAL).fill(alto);
  PALABRAS.forEach(([, ini, fin], i) => {
    const sig = PALABRAS[i + 1];
    const hasta = sig && sig[1] - fin <= HUECO_S ? sig[1] : fin;
    for (let f = Math.floor(ini * FPS); f <= Math.ceil(hasta * FPS) && f < TOTAL; f++) objetivo[f] = base;
  });
  return objetivo.map((_, f) => {
    let s = 0, n = 0;
    for (let k = f - RAMPA / 2; k <= f + RAMPA / 2; k++) if (k >= 0 && k < TOTAL) { s += objetivo[k]; n++; }
    return s / n;
  });
})();

export const AudioReel: React.FC = () => {
  const m = planAudio.musica;
  return (
    <>
      <Audio src={staticFile(`es/${brief.audio}`)} volume={1} />
      {m ? (
        <Audio src={staticFile(`audio/musica/${m.id}.mp3`)}
          volume={(f) => Math.min(interpolate(f, [0, 10], [0, 1], {extrapolateRight: "clamp"}),
            interpolate(f, [TOTAL - 30, TOTAL], [1, 0], {extrapolateLeft: "clamp", extrapolateRight: "clamp"})) * (VOL_MUSICA[f] ?? m.volumen)} />
      ) : null}
      {(planAudio.sfx || []).map((s, k) => {
        const f = Math.max(0, (s.cta ? brief.cta_f : palabraF(s.ancla ?? 0)) - ANTICIPA);
        return (
          <Sequence key={k} from={f} durationInFrames={Math.max(1, TOTAL - f)} layout="none">
            <Audio src={staticFile(`audio/sfx/${s.id}.wav`)} volume={s.volumen ?? 0.4} />
          </Sequence>
        );
      })}
    </>
  );
};
