---
name: reel-remodelacion
description: Anima y renderiza con la plantilla Remotion del repo un Reel vertical educativo y 100 % animado de EN BRUTO (remodelación e interiores en Florida, en español) a partir del encargo, el guion, la locución y los tiempos que deja el notebook en briefs/<BASE>/. Úsala cuando pidan crear, animar, renderizar o corregir un reel de EN BRUTO.
---

# Reel de EN BRUTO: animación y render

Tu único trabajo es **animar y renderizar** el video. El guion, la voz, el tema y la música ya están decididos y aprobados: no los revises ni los comentes. La plantilla `remotion/` ya hace todo lo que se repite en cada video (fondo y ambientes, barra, header con logo, titulares, subtítulos, aviso legal, CTA, bucle, cámara, audio con música y efectos). **Tú solo escribes tres archivos**:

1. `briefs/<BASE>/decisiones.json`: la dirección (bloques, titulares, ambientes, parámetros de la plantilla, acentos).
2. `briefs/<BASE>/audio.json`: los efectos de sonido (la música llega elegida en el encargo).
3. `remotion/src/escenas/actual.tsx`: las cuatro escenas ilustradas (gancho, escena, marco, resultado).

No edites nada más del repo, no hagas commits ni push. Donde más importa tu criterio es en los **primeros tres segundos**: deciden si alguien sigue mirando.

## 1. Material y anclas
`python3 scripts/alinear.py briefs/<BASE>/es` imprime el guion numerado con pausas (`‖0.45s`). Los `[n]` son las **anclas** de todo lo que decidas. No oyes el audio: el ritmo está ahí. En `briefs/<BASE>/encargo.json` tienes `formato`, `apertura` (la frase con la que siempre arranca la voz, antes del gancho), `gancho` (`pantalla` = titular del primer segundo, `primer_frame` = lo que se ve en el frame 0), `tono`, `peligro` y `cifra_oficio`.

## 2. Lee solo esto
`referencias/decisiones.md`, la ficha `plantillas/<formato>.md`, `referencias/escenas.md`, `referencias/audio.md`, `referencias/entrega.md` (la lista para revisar las hojas) y el ejemplo `remotion/src/escenas/ejemplo_fachada.tsx` (el patrón a seguir). Nada más: ni `tokens.json`, ni `contactos.png`, ni `README.md`, ni `editorial/`, ni `palabras.json` o `brief.json`, ni el código de `remotion/src/` fuera de `escenas/`. Los iconos se buscan por nombre: `ls icons | grep -i agua`.

## 3. Dirige y dibuja
Escribe `decisiones.json` y `audio.json`, y luego `actual.tsx` con un componente ilustrado reutilizable (como `<Fachada>` en el ejemplo) para que el resultado sea el mismo encuadre del frame 0 ya resuelto.

**El peligro se ve.** Si `encargo.peligro` no está vacío, el gancho y la escena lo hacen sentir con imágenes simbólicas y en movimiento (la chispa que salta del enchufe, la mancha que crece dentro del muro, la grieta que avanza, el agua que sube, la baranda que cede), ambiente `noche` para la tensión y corchetes rojos sobre el punto exacto del riesgo. Nada gráfico: ni sangre, ni heridos, ni personas en peligro. El resultado devuelve la calma (`salvia` o `lino`) con el mismo objeto ya seguro. Con `tono` = `serio`, cero efectos o pegatinas cómicas.

## 4. Revisa
`python3 scripts/revisar.py briefs/<BASE>` valida `decisiones.json` y `audio.json`, prepara el proyecto y deja en `out/stills/` unas hojas de contactos (8 momentos clave por hoja, con nombre, frame y la zona segura en azul). Si hay errores o avisos de ritmo, corrige y repite: los avisos de ritmo cuentan como errores. Mira **las hojas**; abre un still suelto (`out/stills/<nombre>.png`) solo si en la hoja algo parece mal. Tras corregir, repite solo lo afectado: `--solo gancho,plantilla`. Como mucho dos rondas de correcciones.

## 5. Render y entrega
`python3 scripts/render.py briefs/<BASE>` renderiza `out/<BASE>_es.mp4` y comprueba duración, resolución, audio y niveles. Si dice `OK`, **envía el MP4 como archivo y nada más**: sin portada, sin resumen, sin caption, sin lista de efectos ni comentarios. Si dice `REVISA` o `ERROR`, corrige lo que indique y repite. Si el fallo es de la plantilla (no de tus tres archivos), para y explícalo en una línea.

## Reglas fijas
- El CTA invita a entrar al perfil y tocar el enlace de la bio: nada de palabras clave, comentarios, DM ni «link en la descripción».
- Ninguna cifra en pantalla salvo un dato verificado o la cifra de oficio que dice la voz. Lo ilustrativo se marca con `<Ilustrativo />`.
- En pantalla la marca coordina; nunca aparece como quien construye, instala o repara, ni con sellos de «licenciado», «asegurado» o «garantizado».
- Animación pura: nada de fotos ni videos, ni logos de contratistas o fabricantes.
- La voz no se toca. Música y efectos solo del catálogo de `audio/`, por debajo de la voz.
- Determinismo: nada de `Math.random()` (usa `random(semilla)` del kit).
