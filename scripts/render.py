#!/usr/bin/env python3
"""Render final silencioso + comprobaciones. Imprime una sola línea si todo va bien.

Uso: python3 scripts/render.py briefs/<BASE>     → out/<BASE>_es.mp4
     python3 scripts/render.py briefs/<BASE> --portada   → además out/<BASE>_es_portada.png (frame 0)
"""
import json, re, subprocess, sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
REMOTION = RAIZ / "remotion"
sys.path.insert(0, str(Path(__file__).resolve().parent))
import preparar_proyecto  # noqa: E402


def correr(args, **kw):
    return subprocess.run(args, cwd=REMOTION, capture_output=True, text=True, **kw)


def main():
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)
    brief = preparar_proyecto.preparar(sys.argv[1], silencioso=True)
    base = brief["base"]
    (RAIZ / "out").mkdir(exist_ok=True)
    mp4 = RAIZ / "out" / f"{base}_es.mp4"
    r = correr(["npx", "remotion", "render", "Reel-es", str(mp4), "--log=error"])
    if r.returncode or not mp4.is_file():
        print("ERROR en el render:\n" + "\n".join((r.stderr or r.stdout).strip().splitlines()[-25:]))
        sys.exit(1)
    if "--portada" in sys.argv:
        correr(["npx", "remotion", "still", "Reel-es", str(RAIZ / "out" / f"{base}_es_portada.png"), "--frame=0", "--log=error"])
    # comprobaciones: duración exacta, resolución, audio presente y niveles de voz y música
    pr = correr(["npx", "remotion", "ffprobe", "-v", "error", "-show_entries", "stream=codec_type,width,height,nb_frames:format=duration",
                 "-of", "json", str(mp4)])
    avisos = []
    try:
        info = json.loads(pr.stdout)
        streams = info.get("streams", [])
        v = next(s for s in streams if s.get("codec_type") == "video")
        dur = float(info["format"]["duration"])
        if (v.get("width"), v.get("height")) != (brief["video"]["width"], brief["video"]["height"]):
            avisos.append(f"resolución {v.get('width')}x{v.get('height')}")
        esperado = brief["video"]["frames"] / brief["video"]["fps"]
        if abs(dur - esperado) > 0.1:
            avisos.append(f"dura {dur:.2f} s y debería durar {esperado:.2f} s")
        if not any(s.get("codec_type") == "audio" for s in streams):
            avisos.append("el MP4 no tiene audio")
    except Exception as e:  # noqa: BLE001
        dur = 0.0
        avisos.append(f"no pude leer el MP4 con ffprobe ({e})")
    # niveles: voz (con la música debajo) frente a la música sola en las pausas largas y la cola
    niveles = ""
    wav = RAIZ / "out" / f".{base}_mono.wav"
    correr(["npx", "remotion", "ffmpeg", "-hide_banner", "-loglevel", "error", "-i", str(mp4), "-vn", "-ac", "1", "-ar", "16000",
            "-c:a", "pcm_s16le", "-y", str(wav)])
    if wav.is_file():
        import array, math, wave
        with wave.open(str(wav)) as w:
            sr, a = w.getframerate(), array.array("h", w.readframes(w.getnframes()))
        wav.unlink()
        db = lambda seg: 20 * math.log10(max(1e-9, math.sqrt(sum(x * x for x in seg) / max(1, len(seg))) / 32768))
        P = brief["subtitulos"]
        voz, musica = [], []
        for i, (_, ini, fin) in enumerate(P):
            voz += a[int(ini * sr):int(fin * sr)]
            if i + 1 < len(P) and P[i + 1][1] - fin > 1.0:
                musica += a[int((fin + 0.15) * sr):int((P[i + 1][1] - 0.15) * sr)]
        musica += a[int((P[-1][2] + 0.2) * sr):int((P[-1][2] + 1.2) * sr)]
        dv, dm = db(voz), db(musica)
        niveles = f" · voz {dv:.0f} dBFS, música sola {dm:.0f} dBFS"
        if dm > dv - 4:
            avisos.append("la música sola suena casi tan alta como la voz: baja su volumen en audio.json")
    estado = "OK" if not avisos else "REVISA: " + "; ".join(avisos)
    print(f"{estado} · {mp4.relative_to(RAIZ)} · {dur:.1f} s{niveles}")
    sys.exit(1 if avisos else 0)


if __name__ == "__main__":
    main()
