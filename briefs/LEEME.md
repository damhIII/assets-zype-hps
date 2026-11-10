Cada video tiene aquí su carpeta `<BASE>/` (`AAAAMMDD-HHMM`, hora de Nueva York).

Lo sube el notebook de Colab:
- `encargo.json`: marca (EN BRUTO), formato que eligió el guionista (`formato_guion`; `formato` vale siempre `auto`), idioma (`["es"]`) y seed.
- `es/guion.txt`: el texto locutado, sin indicaciones.
- `es/locucion.wav`: la voz (Gemini TTS).
- `es/palabras.json` (versión 4): idioma, duración de la voz y cada palabra con su inicio y fin (Whisper).

Lo añade Claude al dirigir el video:
- `es/subtitulos.json`: el guion alineado con la voz (`scripts/alinear.py`).
- `decisiones.json`: el diseño de escenas.
- `es/brief.json`: los datos de render con frames exactos (`scripts/preparar_brief.py`).

Las carpetas anteriores pueden tener otra estructura (bilingüe o sin subcarpeta `es/`): el notebook y los scripts las siguen leyendo.
