# Cambios en `damhIII/assets-zype-hps`

Orden recomendado: **primero el repo, después el notebook** (el notebook nuevo valida el repo con `scripts/validar_repo.py`; el notebook viejo ya no pasa con el repo nuevo).

## 1. Eliminar (5 archivos)
| Archivo | Por qué |
|---|---|
| `editorial/prompt_adaptacion.md` | ya no hay adaptación al inglés |
| `assets/obras/LEEME.md` | sin obras reales (borra la carpeta `assets/` entera) |
| `assets/obras/_ejemplo/manifest.json` | idem |
| `.claude/skills/reel-remodelacion/referencias/activos_reales.md` | sin fotos ni videos reales |
| `.claude/skills/reel-remodelacion/plantillas/antes_despues.md` | se elimina el formato `antes_despues` (era el de casos reales) |

Si se te olvida alguno, `validar_repo.py` lo avisa ("… sobra: bórralo del repo"), pero no bloquea.

## 2. Reemplazar (28 archivos, todos en el zip con su ruta)
**Editorial**
- `editorial/prompt_guion.md`: nueva sección "EL SEED" (tema, ideas sueltas, servicio a promocionar, ángulo, público, gancho o palabra clave); enfoque educativo; extensión como guía, no como límite; regla nueva de solo ejemplos hipotéticos; sin `{{IDIOMA}}` ni `{{OBRAS}}`.
- `editorial/adn.md`: punto 8 nuevo (educativo, ejemplos hipotéticos); sin referencias a obras.
- `editorial/marca.md`: el nombre es EN BRUTO.
- `editorial/formatos.json`: 7 formatos (sin `antes_despues`), `nombre` solo en español.
- `editorial/temas.json`: las 3 ideas de "obra real" pasan a ideas educativas (mismas palabras clave: COCINA, DUCHA, OFICINA); `cta` es una sola palabra (sin inglés).
- `editorial/voz_tts.md`: solo el perfil en español.
- `editorial/datos_verificados.json`: sin `dato_en` ni menciones a obras propias.

**Scripts**
- `scripts/validar_repo.py`: solo español, 7 formatos, sin validación de obras; avisa de archivos obsoletos.
- `scripts/preparar_brief.py`: sin obras ni activos; el brief ya no lleva `obra`; avisa si decides un formato distinto del que eligió el guionista; ahora también detecta "garantía/licencia" en textos simples.

**Skill** (`.claude/skills/reel-remodelacion/`)
- `SKILL.md`, `referencias/{decisiones,brief,entrega,tecnico,sincronizacion,layout}.md`: educativo, solo español, animación pura, header `EN BRUTO · ETIQUETA`.
- `plantillas/plantillas.json`: sin `antes_despues`, sin tipo `activo`, sin `usa_obra`, sin `imagen` en el comparador.
- `plantillas/*.md` (7 fichas): ejemplos solo en español y sin `obra:`.
- `diseno/tokens.json`: sin `textos_fijos.creditos_obra`.

**Raíz**
- `CLAUDE.md`, `README.md`, `briefs/LEEME.md`.

## 3. Nada que añadir
No hay archivos nuevos en el repo.

## 4. Comprobar
```bash
python3 scripts/validar_repo.py      # → "Repo válido · 0/24 datos verificados"
```

## Lo que se deja igual a propósito
- `briefs/<BASE>/es/`: se mantiene la subcarpeta `es/` para que `alinear.py`, `preparar_brief.py` y los briefs viejos sigan funcionando sin cambios.
- `scripts/alinear.py` y la lógica interna de idiomas de `preparar_brief.py` siguen aceptando `{"es": …}`, pero las fichas ya documentan valores directos.
- `.claude/skills/zype-reel/` es otra skill (de otro proyecto): no se toca.
