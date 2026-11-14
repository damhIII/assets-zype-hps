# Cambios EN BRUTO v3 (+ paleta cálida v4) · CTA al enlace, 30-60 s, logo, identidad y tono

Copia estas carpetas sobre la raíz del repo `damhIII/assets-zype-hps` (sustituyendo archivos) y haz commit.
Alternativa con git: `git apply --binary cambios_repo_en_bruto.patch`.
Después: `python3 scripts/validar_repo.py` y `python3 scripts/validar_tokens.py` (deben pasar).
Orden: primero el repo, después el notebook v3 (el notebook v3 se detiene si no encuentra el logo en el repo).

## Nuevos
- brand/en_bruto/ : logo original + variantes fondo claro / oscuro, con y sin lema.

## Editorial
- prompt_guion.md : cierre al enlace de la descripción (con palabras del guionista), duración 30-60 s elegida por el guionista, sección TONO Y CREATIVIDAD, ganchos variados, sin mayúsculas de palabra clave.
- marca.md : voz más cercana y con chispa; embudo y nueva sección "Contacto".
- adn.md : humor de situación permitido; checklist con el nuevo cierre y "se disfruta".
- voz_tts.md : locución con sonrisa y complicidad; énfasis en la invitación final.
- temas.json : sin palabras clave (campo cta eliminado).

## Diseño (skill)
- tokens.json v3 : rojo del logo (#C81414) como acento + neutros cálidos (piedra, greige) y paleta 'apoyo' de matices (arcilla, terracota suave, rosa arcilla, ladrillo, miel, arena, salvia, eucalipto, niebla, carbón cálido); ambientes lino (piedra cálida), salvia, arena, arcilla (nuevo), niebla (nuevo) y noche (carbón cálido); hasta 3 bloques fuera de lino; Barlow Condensed + DM Sans + Space Mono, logos, corchetes, esquinas casi rectas, CTA "LINK EN LA DESCRIPCIÓN".
- layout, decisiones, brief, tecnico, entrega, sincronizacion, SKILL.md : logo en header y CTA, CTA con flecha a la descripción, motivo de corchetes, rojo escaso.
- ui/*.svg, textures/*.svg : reteñidos a la nueva base; contactos.png regenerado (incluye el logo).

## Scripts
- preparar_brief.py : `cta` = texto de la caja; `cta_f` = cuando la voz dice link/enlace/descripción (o `cta_ancla`); logo y fuente mono en el brief.
- validar_repo.py : `cta` de temas ya no es obligatorio; comprueba que existan los logos y la fuente mono.
- validar_tokens.py : contrastes para un acento rojo, foco por ambiente, subrayado de subtítulos, logos.
- tenir_svg.py, contactos.py : nueva base de color; logo en la hoja de contactos.

Nota: el zip y el parche son acumulativos desde `main` actual (incluyen v3 y la paleta v4). Si ya copiaste el zip anterior, copia este encima.
