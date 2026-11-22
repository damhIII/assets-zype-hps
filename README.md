# Reels educativos de remodelación e interiores · Florida · EN BRUTO

Pipeline de contenido para Instagram Reels **educativos, en español y 100 % animados** de EN BRUTO, una agencia de decoración, remodelación, construcción e interiores en Florida. Este sistema **solo produce contenido**: cada video cierra invitando a entrar al perfil y contactarnos desde el **enlace de la bio**; esas conversaciones las atiende el socio.

```
Notebook (Colab)                             Repo (este)                              Claude (skill reel-remodelacion)
───────────────                              ───────────                              ───────────────────────────────
ESPACIO ──► tema (algoritmo + modelo)        editorial/espacios.json, historial.jsonl lee CLAUDE.md + skill
        ──► guion (modelo)                   briefs/<BASE>/encargo.json               decisiones.json
        ──► voz (Gemini TTS)                 briefs/<BASE>/es/{guion,wav,palabras}    preparar_brief.py → brief
        ──► tiempos (Whisper) ──► subida ──►                                          Remotion → MP4
        ──► prompt para Claude
```

## Uso diario
1. Abre el notebook `Crear_reel_En_Bruto` (la versión más reciente, hoy la 6.1) en Colab y ejecuta **Configuración** (una vez por sesión).
2. **▶️ 1 · Tema**: elige el espacio en el desplegable (o escribe uno nuevo, o "AL AZAR") y ejecútala. El algoritmo propone un dolor que no se ha usado hace poco, con su formato y tres ganchos. Si no te convence, vuelve a ejecutarla. Elige un gancho. Opcional: en `IDEA` puedes escribir un problema concreto.
3. **▶️ 2 · Guion**: escribe el guion con ese gancho. Lee los avisos (nunca reescriben nada) y retócalo en la caja si quieres.
4. **▶️ 3 · Voz, tiempos y subida**: genera la voz y los tiempos, sube todo a `briefs/<BASE>/`, añade el video al historial y te da el prompt para Claude. Si no se puede subir, descarga `<BASE>.zip`.
5. Copia el **prompt para Claude** y pégalo en Claude (con acceso al repo). Si se descargó el zip, adjúntalo.

## Configuración (una sola vez)
- Secretos de Colab (icono de llave): `OPENAI_API_KEY`, `GEMINI_API_KEY` (o `GOOGLE_API_KEY`) y `GITHUB_TOKEN` (token fine-grained con permiso *Contents: read and write* solo sobre este repo). Ningún secreto va en el código.
- Modelos y voz (`MODELO_GUION`, `MODELO_TEMA`, `TTS_MODEL`, `TTS_VOZ`) y la rama del repo (`REPO_BRANCH`) están al principio de la celda Configuración.

## Cómo elige el tema
- **Dolor**: de `editorial/espacios.json`, uno que no haya salido en los últimos 20 videos (los nunca usados y los de temporada pesan más: huracanes jun-nov, lluvias may-oct, calor jun-sep, temporada seca nov-abr). Cuando a un espacio le quedan menos de tres sin usar, el notebook pide diez nuevos y los guarda en el catálogo.
- **Formato**: el menos usado en los últimos 6 videos entre los que encajan con el dolor, nunca el mismo que el anterior. `errores`, `mito_realidad` y `planta` pesan más (`peso` en `formatos.json`).
- **Tipo de gancho**: rota entre los seis de `formatos.json` sin repetir los dos últimos.
- **Duración**: entre 40 y 60 s de voz (100-150 palabras); el guionista decide dentro de ese rango según lo que pida la explicación (`duracion` en `formatos.json`).

## Mantener el contenido
| Quiero… | Edito… | Compruebo con… |
|---|---|---|
| Cambiar el tono, las reglas, la estructura o el cierre del guion | `editorial/prompt_guion.md` | `python3 scripts/validar_repo.py` |
| Permitir que la marca diga que tiene licencia/seguro | `editorial/prompt_guion.md → Declaraciones permitidas` (solo con respaldo documental) | idem |
| Añadir, quitar o corregir dolores de un espacio, o un espacio nuevo | `editorial/espacios.json` | idem |
| Cambiar cómo se concreta el tema o los ganchos | `editorial/prompt_tema.md` | idem |
| Cambiar los pesos de los formatos, los tipos de gancho o la duración | `editorial/formatos.json` | idem |
| Que un tema pueda volver a salir antes | borrar su línea de `editorial/historial.jsonl` (o bajar `EVITAR_ULTIMOS` en el notebook) | idem |
| Cambiar el destino del cierre (hoy: perfil → enlace de la bio) | `prompt_guion.md → Cierre`, `voz_tts.md`, la skill (`tokens.json → textos_fijos`, `layout.md`, `decisiones.md`), `scripts/preparar_brief.py` (`CTA_VOZ`, `CTA_TEXTO`) y `chequeos()` en el notebook | idem |
| Verificar un dato | `editorial/datos_verificados.json`: texto exacto, `url`, `cita_literal`, `fecha_consulta`, `verificado: true` | idem |
| Cambiar colores o tipografías | `.claude/skills/reel-remodelacion/diseno/tokens.json` | `python3 scripts/validar_tokens.py` |
| Cambiar el logo | reemplaza los PNG de `brand/en_bruto/` (mismos nombres) | `python3 scripts/validar_tokens.py` y `python3 scripts/contactos.py` |
| Añadir iconos o texturas | `icons/`, `ui/`, `textures/` | `python3 scripts/contactos.py` |

**Cifras**: el guion puede usar una o dos **cifras de oficio** (medidas, tiempos de prueba o de curado, pendientes) dichas como referencia. Precios, plazos de obra, porcentajes, normas y requisitos de permisos solo si están en `datos_verificados.json` con `verificado: true`; el guionista solo recibe esos y Claude solo pone en pantalla esos. Los datos los verifica una persona leyendo la fuente oficial.

## Estructura
`editorial/` · `.claude/skills/reel-remodelacion/` (skill, plantillas, tokens, referencias) · `brand/en_bruto/` (logo) · `icons/` · `logos/` · `ui/` · `textures/` · `fonts/css/` · `audio/` · `scripts/` · `briefs/` · `contactos.png`. Detalle en `CLAUDE.md`.
