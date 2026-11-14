# Reels educativos de remodelación e interiores · Florida · EN BRUTO

Pipeline de contenido para Instagram Reels **instructivos-educativos, en español y 100 % animados** de EN BRUTO, una agencia de decoración, remodelación, construcción e interiores en Florida. Este sistema **solo produce contenido**: cada video cierra invitando a contactar por el **enlace de la descripción**, y esas conversaciones las atiende el socio. (Los videos con fotos de obras reales irán en otro pipeline.)

```
Notebook (Colab)                         Repo (este)                            Claude (skill reel-remodelacion)
───────────────                          ───────────                            ───────────────────────────────
SEED_PROMPT                              briefs/<BASE>/encargo.json             lee CLAUDE.md + skill
lee editorial/ ──► guion + formato (GPT) briefs/<BASE>/es/{guion,wav,palabras}  decisiones.json
               ──► voz (Gemini TTS) ──►                                         preparar_brief.py → brief
               ──► tiempos (Whisper)                                            Remotion → MP4
               ──► prompt para Claude
```

## Uso diario
1. Abre `Crear_reel_remodelacion.ipynb` en Colab.
2. Celda **Parámetros**: escribe el `SEED_PROMPT`. Admite cualquier cosa: un tema, ideas sueltas, un boceto de guion, un servicio a promocionar, un ángulo, un tono, un público, un gancho o una duración, o varias a la vez. Vacío = el guionista elige el tema. El idioma (español), el formato (lo elige el guionista), la marca y el repo ya están fijos.
3. Ejecuta **Configuración** (una vez por sesión) y **▶️ 1 · Escribir el guion**. Lee los avisos: nunca reescriben nada, tú decides si vuelves a generar. Para retocar, pega el texto en la celda 2.
4. **▶️ 2 · Locutar y subir**: genera la voz y los tiempos y los sube a `briefs/<BASE>/`. Si no se puede subir, descarga `<BASE>.zip`.
5. Copia el **prompt para Claude** y pégalo en Claude (con acceso al repo). Si se descargó el zip, adjúntalo.

## Configuración (una sola vez)
- Secretos de Colab (icono de llave): `OPENAI_API_KEY`, `GEMINI_API_KEY` (o `GOOGLE_API_KEY`) y `GITHUB_TOKEN` (token fine-grained con permiso *Contents: read and write* solo sobre este repo). Ningún secreto va en el código.
- Modelos y voz (`MODELO_GUION`, `TTS_MODEL`, `TTS_VOZ`) están en la celda Configuración, marcados como ajustables.

## Mantener el contenido
| Quiero… | Edito… | Compruebo con… |
|---|---|---|
| Cambiar el tono, las reglas o cómo se interpreta el seed | `editorial/prompt_guion.md`, `marca.md`, `adn.md` | `python3 scripts/validar_repo.py` |
| Permitir que la marca diga que tiene licencia/seguro | `editorial/marca.md → Declaraciones permitidas` (solo con respaldo documental) | idem |
| Añadir temas o ideas | `editorial/temas.json` (gancho + formato) | idem |
| Cambiar el destino del cierre (p. ej. "link en la bio") | `editorial/marca.md → Contacto` y `prompt_guion.md → Cierre` (y `CIERRE` en el notebook) | idem |
| Verificar un dato | `editorial/datos_verificados.json`: texto exacto, `url`, `cita_literal`, `fecha_consulta`, `verificado: true` | idem |
| Cambiar colores o tipografías | `.claude/skills/reel-remodelacion/diseno/tokens.json` | `python3 scripts/validar_tokens.py` |
| Cambiar el logo | reemplaza los PNG de `brand/en_bruto/` (mismos nombres) | `python3 scripts/validar_tokens.py` y `python3 scripts/contactos.py` |
| Añadir iconos o texturas | `icons/`, `ui/`, `textures/` | `python3 scripts/contactos.py` |

**Datos**: el guionista solo recibe los datos con `verificado: true`; Claude solo pone en pantalla esos. Los datos los verifica una persona leyendo la fuente oficial; Claude puede sugerir fuentes en sus entregas, pero no marca nada como verificado.

**Extensión del guion**: el guionista elige entre 30 y 60 s de voz (≈ 75-150 palabras, la voz lee ~2,5 palabras/s) según lo que pida la idea. El notebook avisa si la estimación o la voz real quedan fuera de ese rango (`DURACION_S` en la configuración), pero no reescribe nada.

## Estructura
`editorial/` · `.claude/skills/reel-remodelacion/` (skill, plantillas, tokens, referencias) · `brand/en_bruto/` (logo) · `icons/` · `logos/` · `ui/` · `textures/` · `fonts/css/` · `scripts/` · `briefs/` · `contactos.png`. Detalle en `CLAUDE.md`.
