# Audio · música de fondo y efectos (CC0)

Lo puebla el notebook `Actualizar_repo_assets.ipynb`, sin cuentas ni claves (se puede volver a ejecutar: solo añade lo nuevo).

- `sfx/`: efectos cortos en WAV (48 kHz, mono), sin silencio inicial, pico a −3 dBFS. Nombre = `<categoria>_<nn>.wav`.
- `musica/`: pistas de fondo en MP3 (160 kbps), normalizadas a −16 LUFS y recortadas a 100 s con fundido final. Nombre = `<mood>_<nn>.mp3`.
- `catalogo.json`: id, archivo, categoría o mood, duración, autor, fuente, licencia y enlace de cada archivo.

Fuentes, todas CC0 (dominio público: uso comercial sin atribución y redistribuibles en este repo público):
- Efectos: packs de [Kenney](https://kenney.nl/assets) (Interface Sounds, UI Audio, Impact Sounds, RPG Audio), descargados de sus réplicas en GitHub; los `whoosh`, `swoosh_transicion`, `tic_tac` y `goteo` se generan con ffmpeg en el propio notebook.
- Música: álbumes CC0 de [Komiku](https://archive.org/search?query=creator%3AKomiku) y [Loyalty Freak Music](https://archive.org/search?query=creator%3A%22Loyalty+Freak+Music%22) en Internet Archive (el notebook comprueba la licencia de cada álbum antes de bajarlo).

No añadas aquí música de Pixabay, YouTube Audio Library, Epidemic, etc.: sus licencias permiten usarla en videos, pero no redistribuir los archivos sueltos en un repo público.

Cómo se usa en los videos: `.claude/skills/reel-remodelacion/referencias/audio.md`.
