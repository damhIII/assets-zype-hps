Cada video tiene aquí su carpeta `<BASE>/` (`AAAAMMDD-HHMM`).

Lo sube el notebook de Colab:
- `guion.txt`: el texto locutado, sin ninguna indicación.
- `locucion.wav`: la voz (Gemini TTS).
- `palabras.json`: duración de la voz y cada palabra con su inicio y fin (Whisper).

Lo añade Claude al dirigir el video:
- `subtitulos.json`: el guion alineado con la voz (`scripts/alinear.py`).
- `decisiones.json`: bloques, titulares, plantilla, HPS, negocio, paleta y climas.
- `brief.json`: los datos de render con frames exactos (`scripts/preparar_brief.py`).

Las carpetas antiguas (`<tema>_<cta>_hipotetico_<fecha>/` con `brief.json` versión 2) son del pipeline anterior y quedan como histórico (el validador las usa para no repetir climas).
