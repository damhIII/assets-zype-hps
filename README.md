# Reels de remodelación e interiores · Florida

Pipeline de contenido para Instagram Reels de una agencia de decoración, remodelación, construcción e interiores en Florida, en español, inglés o ambos. Este sistema **solo produce contenido**: la captación por comentarios y DM la atiende el socio.

```
Notebook (Colab)                         Repo (este)                            Claude (skill reel-remodelacion)
───────────────                          ───────────                            ───────────────────────────────
lee editorial/ ──► guion (GPT)           briefs/<BASE>/encargo.json             lee CLAUDE.md + skill
               ──► [adaptación EN]       briefs/<BASE>/es/{guion,wav,palabras}  decisiones.json (un diseño)
               ──► voz (Gemini TTS) ──►  briefs/<BASE>/en/{guion,wav,palabras}  preparar_brief.py → brief por idioma
               ──► tiempos (Whisper)                                            Remotion → MP4 por idioma
               ──► prompt para Claude
```

## Uso diario
1. Abre `Crear_reel_remodelacion.ipynb` en Colab.
2. Celda **Parámetros**: `SEED_PROMPT` (la idea en una frase, o vacío), `IDIOMA` (`es`, `en`, `ambos`), `FORMATO` (uno de los 8 o `auto`), `OBRA` (`auto`, `ninguna` o el id de una carpeta de `assets/obras/`).
3. Ejecuta **Configuración** (una vez por sesión) y **▶️ 1 · Escribir el guion**. Lee los avisos: nunca reescriben nada, tú decides si vuelves a generar. Para retocar, pega el texto en la celda 2.
4. **▶️ 2 · Locutar y subir**: genera voz y tiempos por idioma y los sube a `briefs/<BASE>/`. Si no se puede subir, descarga `<BASE>.zip`.
5. Copia el **prompt para Claude** y pégalo en Claude (con acceso al repo). Si se descargó el zip, adjúntalo.

## Configuración (una sola vez)
- En la celda Configuración: `MARCA` (el nombre; mientras sea `{{NOMBRE_MARCA}}`, el guion no la nombra) y `REPO_SLUG` (`usuario/repo`).
- Secretos de Colab (icono de llave): `OPENAI_API_KEY`, `GEMINI_API_KEY` (o `GOOGLE_API_KEY`) y `GITHUB_TOKEN` (token fine-grained con permiso *Contents: read and write* solo sobre este repo). Ningún secreto va en el código.
- Modelos y voces (`MODELO_GUION`, `TTS_MODEL`, `TTS_VOZ` por idioma) están en la celda Configuración, marcados como ajustables.

## Mantener el contenido
| Quiero… | Edito… | Compruebo con… |
|---|---|---|
| Cambiar el tono o las reglas del guion | `editorial/prompt_guion.md`, `marca.md`, `adn.md` | `python3 scripts/validar_repo.py` |
| Permitir que la marca diga que tiene licencia/seguro | `editorial/marca.md → Declaraciones permitidas` (solo con respaldo documental) | idem |
| Añadir temas o ideas | `editorial/temas.json` (palabras clave únicas, sin tildes) | idem |
| Verificar un dato | `editorial/datos_verificados.json`: texto exacto, `url`, `cita_literal`, `fecha_consulta`, `verificado: true` | idem |
| Subir una obra real | `assets/obras/<id>/manifest.json` + archivos (ver `assets/obras/LEEME.md`) | idem |
| Cambiar colores o tipografías | `.claude/skills/reel-remodelacion/diseno/tokens.json` | `python3 scripts/validar_tokens.py` |
| Añadir iconos o texturas | `icons/`, `ui/`, `textures/` | `python3 scripts/contactos.py` |

**Datos**: el guionista solo recibe los datos con `verificado: true`; Claude solo pone en pantalla esos. Los datos los verifica una persona leyendo la fuente oficial; Claude puede sugerir fuentes en sus entregas, pero no marca nada como verificado.

## Estructura
`editorial/` · `.claude/skills/reel-remodelacion/` (skill, plantillas, tokens, referencias) · `assets/obras/` · `icons/` · `logos/` · `ui/` · `textures/` · `fonts/css/` · `scripts/` · `briefs/` · `contactos.png`. Detalle en `CLAUDE.md`.
