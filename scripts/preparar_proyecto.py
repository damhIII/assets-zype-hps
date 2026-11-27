#!/usr/bin/env python3
"""Deja el proyecto Remotion de remotion/ listo para un video: valida decisiones.json (preparar_brief), copia el brief y
audio.json a remotion/src/, llena remotion/public/ con la voz, la música elegida y los assets del repo, e instala las
dependencias si faltan. Es idempotente: revisar.py y render.py lo llaman solos.

Uso: python3 scripts/preparar_proyecto.py briefs/<BASE>
"""
import json, os, shutil, subprocess, sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
REMOTION = RAIZ / "remotion"
sys.path.insert(0, str(Path(__file__).resolve().parent))
import preparar_brief  # noqa: E402

ASSETS = ["icons", "logos", "ui", "textures", "illus", "brand/en_bruto", "fonts/css", "audio/sfx"]


def _copiar(src: Path, dst: Path):
    if dst.exists() and dst.stat().st_size == src.stat().st_size and dst.stat().st_mtime >= src.stat().st_mtime:
        return
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dst)


def _copiar_arbol(rel: str):
    origen = RAIZ / rel
    if not origen.is_dir():
        return
    for f in origen.rglob("*"):
        if f.is_file():
            _copiar(f, REMOTION / "public" / rel / f.relative_to(origen))


def preparar(dir_base: str, silencioso=False) -> dict:
    d = Path(dir_base).resolve()
    brief, err, avisos = preparar_brief.escribir(d)
    for a in avisos:
        print(f"  aviso: {a}")
    if err:
        print("ERRORES en decisiones.json (corrígelos y repite):\n - " + "\n - ".join(err))
        sys.exit(1)
    src = REMOTION / "src"
    (src / "brief_es.json").write_text(json.dumps(brief, ensure_ascii=False), encoding="utf-8")
    audio_p = d / "audio.json"
    encargo = json.loads((d / "encargo.json").read_text(encoding="utf-8")) if (d / "encargo.json").is_file() else {}
    if audio_p.is_file():
        audio = json.loads(audio_p.read_text(encoding="utf-8"))
    else:
        m = encargo.get("musica")
        audio = {"musica": {"id": m["id"], "volumen": m.get("volumen", 0.12)} if m else None, "sfx": []}
        print("  aviso: no hay audio.json: va solo la música del encargo, sin efectos")
    errores_audio = []
    if audio.get("musica") and not (RAIZ / "audio" / "musica" / f"{audio['musica']['id']}.mp3").is_file():
        errores_audio.append(f"no existe audio/musica/{audio['musica']['id']}.mp3")
    n = len(brief["subtitulos"])
    for k, s in enumerate(audio.get("sfx") or []):
        if not (RAIZ / "audio" / "sfx" / f"{s.get('id')}.wav").is_file():
            errores_audio.append(f"sfx[{k}]: no existe audio/sfx/{s.get('id')}.wav")
        if not s.get("cta") and not (isinstance(s.get("ancla"), int) and 0 <= s["ancla"] < n):
            errores_audio.append(f"sfx[{k}]: necesita 'ancla' (0-{n - 1}) o 'cta': true")
    if errores_audio:
        print("ERRORES en audio.json:\n - " + "\n - ".join(errores_audio))
        sys.exit(1)
    (src / "audio_es.json").write_text(json.dumps(audio, ensure_ascii=False), encoding="utf-8")
    # public/
    pub = REMOTION / "public"
    _copiar(d / "es" / brief["audio"], pub / "es" / brief["audio"])
    if audio.get("musica"):
        _copiar(RAIZ / "audio" / "musica" / f"{audio['musica']['id']}.mp3", pub / "audio" / "musica" / f"{audio['musica']['id']}.mp3")
    for rel in ASSETS:
        _copiar_arbol(rel)
    actual = src / "escenas" / "actual.tsx"
    if not actual.is_file():
        shutil.copy2(src / "escenas" / "_vacia.tsx", actual)
    if not (REMOTION / "node_modules" / "remotion").is_dir():
        print("  instalando dependencias de remotion/ (una vez)…")
        r = subprocess.run(["npm", "ci", "--no-audit", "--no-fund", "--loglevel=error"], cwd=REMOTION, capture_output=True, text=True)
        if r.returncode:
            print(r.stdout[-1500:] + r.stderr[-1500:])
            sys.exit(1)
    if not silencioso:
        a = ", ".join(f"{k}={v}" for k, v in brief["ambientes"].items() if v != "lino") or "todo lino"
        print(f"proyecto listo · {brief['video']['frames']} frames · formato {brief['formato']} · ambientes {a}")
        for b in brief["bloques"]:
            print(f"  {b['id']:<9} {b['ini_f']:>5}–{b['fin_f']:<5} {b['titular'][0]} / {b['titular'][1]}")
    return brief


if __name__ == "__main__":
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)
    preparar(sys.argv[1])
