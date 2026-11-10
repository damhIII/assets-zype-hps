Cada video tiene aquí su carpeta `<BASE>/` (`AAAAMMDD-HHMM`, hora de Nueva York).

Lo sube el notebook de Colab:
- `encargo.json`: marca, formato pedido (`formato`) y el que usó el guionista (`formato_guion`), idiomas, seed y obras reales utilizables.
- `<idioma>/guion.txt`: el texto locutado, sin indicaciones (`es` y/o `en`; en `ambos`, el inglés es una adaptación del español con los mismos párrafos).
- `<idioma>/locucion.wav`: la voz (Gemini TTS).
- `<idioma>/palabras.json` (versión 4): idioma, duración de la voz y cada palabra con su inicio y fin (Whisper).

Lo añade Claude al dirigir el video:
- `<idioma>/subtitulos.json`: el guion alineado con la voz (`scripts/alinear.py`).
- `decisiones.json`: un único diseño de escenas para todos los idiomas.
- `<idioma>/brief.json`: los datos de render con frames exactos (`scripts/preparar_brief.py`).
