Cada video tiene aquí su carpeta `<BASE>/` (`AAAAMMDD-HHMM`, hora de Nueva York).

Lo sube el notebook de Colab:
- `encargo.json` (versión 3): marca, espacio, dolor del catálogo, tema (seed, tesis, puntos), formato, tipo de gancho, gancho (`voz`, `pantalla`, `primer_frame`), cifra de oficio, a quién mandárselo y palabras clave.
- `es/guion.txt`: el texto locutado, en seis párrafos (gancho, escena, marco, cuerpo, resultado, cierre).
- `es/locucion.wav`: la voz (Gemini TTS).
- `es/palabras.json` (versión 4): idioma, duración de la voz y cada palabra con su inicio y fin (Whisper).

Lo añade Claude al dirigir el video:
- `es/subtitulos.json`: el guion alineado con la voz (`scripts/alinear.py`).
- `decisiones.json` (versión 5): el diseño de escenas.
- `audio.json`: la música y los efectos elegidos.
- `es/brief.json` (versión 5): los datos de render con frames exactos (`scripts/preparar_brief.py`).

El historial de lo publicado (para no repetir temas) vive en `editorial/historial.jsonl`, no aquí: puedes borrar carpetas viejas sin que el generador repita temas.
