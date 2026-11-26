# Reels educativos de remodelación e interiores · Florida · EN BRUTO

Pipeline de contenido para Instagram Reels **educativos, en español y 100 % animados** de EN BRUTO, una agencia de decoración, remodelación, construcción e interiores en Florida. Este sistema **solo produce contenido**: cada video cierra invitando a entrar al perfil y contactarnos desde el **enlace de la bio**; esas conversaciones las atiende el socio.

```
Notebook (Colab)                             Repo (este)                              Claude (skill reel-remodelacion)
───────────────                              ───────────                              ───────────────────────────────
ESPACIO ──► tema (algoritmo + modelo)        editorial/espacios.json, historial.jsonl skill: solo anima
        ──► guion (modelo)                   briefs/<BASE>/encargo.json               decisiones.json
        ──► voz (Gemini TTS)                 briefs/<BASE>/es/{guion,wav,palabras}    preparar_brief.py → brief
        ──► tiempos (Whisper) ──► subida ──►                                          Remotion → MP4
        ──► prompt para Claude
```

## Uso diario
1. Abre el notebook `Crear_reel_En_Bruto` (la versión más reciente, hoy la 7) en Colab y ejecuta **Configuración** (una vez por sesión).
2. **▶️ 1 · Tema**: elige el espacio en el desplegable (o escribe uno nuevo, o "AL AZAR") y ejecútala. El algoritmo propone un dolor que no se ha usado hace poco, con su formato y tres ganchos. Si no te convence, vuelve a ejecutarla. Elige un gancho. Opcional: en `IDEA` puedes escribir un problema concreto.
3. **▶️ 2 · Guion**: escribe el guion con ese gancho. Lee los avisos (nunca reescriben nada) y retócalo en la caja si quieres.
4. **▶️ 3 · Voz, tiempos y subida**: genera la voz y los tiempos, sube todo a `briefs/<BASE>/`, añade el video al historial y te da el prompt para Claude. Si no se puede subir, descarga `<BASE>.zip`.
5. Copia el **prompt para Claude** y pégalo en Claude (con acceso al repo). Si se descargó el zip, adjúntalo.
6. Copia el **caption** que propone la celda 4 (lo escribe el notebook, no Claude).

Claude solo anima: el guion, la voz, el tono, el peligro que se cuenta y la música llegan decididos en `briefs/<BASE>/encargo.json`.

## Configuración (una sola vez)
- Secretos de Colab (icono de llave): `OPENAI_API_KEY`, `GEMINI_API_KEY` (o `GOOGLE_API_KEY`) y `GITHUB_TOKEN` (token fine-grained con permiso *Contents: read and write* solo sobre este repo). Ningún secreto va en el código.
- Modelos y voz (`MODELO_GUION`, `MODELO_TEMA`, `TTS_MODEL`, `TTS_VOZ`) y la rama del repo (`REPO_BRANCH`) están al principio de la celda Configuración.

## Cómo elige el tema
- **Peligro y tono**: el brief del tema nombra el riesgo real detrás del trabajo mal hecho (salud y seguridad > daño a la casa > dinero; si no hay riesgo real, el costo) y fija el tono (`serio`, `explicativo`, `ligero`). El guion lo usa para enganchar por el miedo y cerrar con tranquilidad; Claude lo usa para la imagen.
- **Música**: el notebook elige la pista según el tono (`MUSICA_POR_TONO` en Configuración), sin repetir las tres últimas del historial.
- **Dolor**: de `editorial/espacios.json`, uno que no haya salido en los últimos 20 videos (los nunca usados y los de temporada pesan más: huracanes jun-nov, lluvias may-oct, calor jun-sep, temporada seca nov-abr). Cuando a un espacio le quedan menos de tres sin usar, el notebook pide diez nuevos y los guarda en el catálogo.
- **Formato**: el menos usado en los últimos 6 videos entre los que encajan con el dolor, nunca el mismo que el anterior. `errores`, `mito_realidad` y `planta` pesan más (`peso` en `formatos.json`).
- **Tipo de gancho**: rota entre los seis de `formatos.json` sin repetir los dos últimos.
- **Duración**: entre 40 y 60 s de voz (100-150 palabras); el guionista decide dentro de ese rango según lo que pida la explicación (`duracion` en `formatos.json`).

## Mantener el contenido
| Quiero… | Edito… | Compruebo con… |
|---|---|---|
| Cambiar el tono, las reglas, la estructura o el cierre del guion (incluido cuánto miedo) | `editorial/prompt_guion.md` | `python3 scripts/validar_repo.py` |
| Cambiar cómo se escribe el caption | `editorial/prompt_caption.md` | idem |
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
- `editorial/`: prompt del guionista con la marca, las declaraciones permitidas, las cifras y los límites (`prompt_guion.md`), prompts del generador de temas (`prompt_tema.md`, `prompt_catalogo.md`), catálogo de dolores por espacio (`espacios.json`), historial de videos publicados (`historial.jsonl`), los 6 formatos, los tipos de gancho y la duración (`formatos.json`), datos con fuente (`datos_verificados.json`: solo valen los `verificado: true`) y perfil de voz (`voz_tts.md`).
- `.claude/skills/reel-remodelacion/`: la skill, `plantillas/` (una ficha por formato + `plantillas.json` con sus parámetros), `diseno/tokens.json` (colores, tipografías, logos, tamaños, márgenes seguros, movimiento) y `referencias/`.
- `brand/en_bruto/`: **logo oficial de EN BRUTO** (PNG transparente) en variantes para fondo claro y oscuro, con y sin lema. Va en el header y en el CTA de cada video, con `<Img>`, sin teñir ni deformar. (`logo_hps.png`, `logo_zype.png` y `brand/paletas.json` son de otra marca: no se usan.)
- `icons/` Lucide y Tabler (`tb-*`), de trazo y `currentColor` · `logos/` canales (monocromos) → siempre con máscara CSS.
- `illus/planta/`: símbolos de planta 2D a escala real (1 unidad = 1 cm; medidas en `catalogo.json`) · `illus/emoji/`: emoji Fluent de Microsoft (`flat/` SVG, `3d/` PNG) para pegatinas puntuales.
- `audio/`: efectos (`sfx/`) y música de fondo (`musica/`) con licencia CC0, normalizados. Qué hay y cómo usarlos: `referencias/audio.md`.
- `ui/`, `textures/` (incluidos los materiales `mat_*`): SVG en los colores del ambiente `lino` → para otros ambientes, `scripts/tenir_svg.py`.
- `contactos.png`: hoja con todos los assets gráficos (logo incluido). Ábrela antes de diseñar.
- `fonts/css/`: `@font-face` con woff2 en base64 (se usan Barlow Condensed, DM Sans y Space Mono).
- `scripts/`: `alinear.py` (guion ↔ voz), `preparar_brief.py` (decisiones → brief con frames), `validar_repo.py` (editorial y plantillas), `validar_tokens.py` (contrastes), `tenir_svg.py`, `contactos.py`.
- `briefs/<BASE>/`: lo que sube el notebook (`encargo.json` con tono, peligro y música, y `es/`). Las decisiones y el brief de Claude se quedan en su sesión.

## Reglas que valen siempre
- **Videos educativos**: cada uno enseña algo concreto. Los ejemplos son hipotéticos; nunca casos de clientes ni proyectos presentados como reales.
- **Nunca inventar datos**: precios, plazos de obra, porcentajes, normas o requisitos de permisos solo con un dato `verificado: true`. Las **cifras de oficio** (medidas, tiempos de prueba o de curado, pendientes) valen si la voz las dice como referencia, una o dos por video. Lo ilustrativo se marca.
- **La marca coordina, no ejecuta**: nunca "construimos", "remodelamos", "instalamos". Nada de licencia, seguro o garantías salvo lo que `editorial/prompt_guion.md` → Declaraciones permitidas marque con `si`.
- **Animación pura**: nada de fotos ni videos (de obras, de bancos de imágenes o de internet), ni logos de contratistas o fabricantes.
- **Los primeros tres segundos mandan**: el frame 0 muestra el problema del gancho en movimiento, con su texto en pantalla; el header con el logo entra a los 1,5 s.
- **Seis bloques**, uno por párrafo del guion (gancho, escena, marco, cuerpo, resultado, cta), algo nuevo en pantalla como mucho cada 4 s, y el final vuelve a la imagen del principio (bucle).
- El marco (barra de progreso, header con logo, titular, subtítulos, CTA con logo) es fijo; solo cambian el ambiente y la escena.
- **El cierre manda al perfil y al enlace de la bio**: nada de palabras clave, "comenta", DM ni enlace de la descripción.
- **Duración**: entre 40 y 60 s de voz, según lo que pida la explicación.
- La voz no se toca: ni recortes ni cambios de velocidad. Música y efectos solo del catálogo `audio/` y siempre por debajo de la voz.
- Determinismo: nada de `Math.random()` en Remotion.
