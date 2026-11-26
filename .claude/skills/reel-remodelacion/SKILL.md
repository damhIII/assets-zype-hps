---
name: reel-remodelacion
description: Anima y renderiza con Remotion un Reel vertical educativo y 100 % animado de EN BRUTO (remodelación e interiores en Florida, en español) a partir del encargo, el guion, la locución y los tiempos por palabra que deja el notebook en briefs/<BASE>/. Úsala cuando pidan crear, animar, renderizar o corregir un reel de EN BRUTO.
---

# Reel de EN BRUTO: animación y render

Tu único trabajo es **animar y renderizar** el video. El guion, la voz, el tema y la música ya están decididos y aprobados: no los revises, no los comentes, no propongas cambios. No edites nada del repo fuera de `briefs/<BASE>/` y de tu proyecto Remotion, y no hagas commits ni push.

En `briefs/<BASE>/` tienes:
- `encargo.json`: `formato`, `gancho` (`pantalla` = texto del primer segundo, `primer_frame` = lo que se ve en el frame 0), `tono` (`serio` · `explicativo` · `ligero`), `peligro` (el riesgo real que cuenta el video; puede estar vacío), `musica` (pista y volumen ya elegidos), `cifra_oficio` y `tema`.
- `es/guion.txt` (seis párrafos: gancho, escena, marco, cuerpo, resultado, cierre), `es/locucion.wav` y `es/palabras.json`.

Donde más importa tu criterio es en los **primeros tres segundos**: deciden si alguien sigue mirando.

## 1. Material y tiempos
- "El último" = la carpeta `AAAAMMDD-HHMM` más reciente de `briefs/`. Si te adjuntan `<BASE>.zip`, descomprímelo en `briefs/<BASE>/`.
- `python3 scripts/alinear.py briefs/<BASE>/es`: escribe `subtitulos.json` e imprime el guion numerado con pausas (`‖0.45s`). Los `[n]` son las **anclas** de todo lo que decidas. No oyes el audio: el ritmo está ahí.

## 2. Lee solo esto
`referencias/decisiones.md`, `referencias/layout.md`, `referencias/sincronizacion.md`, `referencias/audio.md`, la ficha `plantillas/<formato>.md` (parámetros en `plantillas/plantillas.json`), `diseno/tokens.json` y `contactos.png` (los assets que ya existen). Nada más de `editorial/` ni de `scripts/`.

## 3. Dirige: `briefs/<BASE>/decisiones.json`
Los **6 bloques** (`gancho`, `escena`, `marco`, `cuerpo`, `resultado`, `cta`), uno por párrafo del guion, titulares de dos líneas (el del gancho = `encargo.gancho.pantalla`), `etiqueta`, `cta`, `ambientes`, `plantilla.params` y, si hace falta, `acentos` para que nunca pasen más de 4 s sin algo nuevo en pantalla.
Después: `python3 scripts/preparar_brief.py briefs/<BASE>`. Escribe `briefs/<BASE>/es/brief.json` con frames exactos. Si da errores, corrige `decisiones.json` y repite; los avisos de ritmo cuentan como errores. Nunca edites frames a mano en `brief.json`.

**El peligro se ve.** Si `encargo.peligro` no está vacío, el gancho y la escena lo hacen sentir con imágenes simbólicas y en movimiento (la chispa que salta del enchufe, la mancha que crece dentro del muro, la grieta que avanza, el agua que sube, la baranda que cede), ambiente `noche` para la tensión y el corchete rojo sobre el punto exacto del riesgo. Nada gráfico: ni sangre, ni heridos, ni personas en peligro. El resultado devuelve la calma (`salvia` o `lino`) con el mismo objeto ya seguro. Con `tono` = `serio`, cero efectos o pegatinas cómicas.

## 4. Construye
Un proyecto Remotion con la composición `Reel-es` que lee `src/brief_es.json` (`referencias/tecnico.md`). El bloque `cuerpo` sale de la plantilla del formato. El frame 0 es `brief.gancho.primer_frame` dibujado y en movimiento, sin header. El final enlaza con el principio (`brief.bucle`). Todo se dibuja (SVG, iconos, texturas, tipografía), salvo el logo de `brand/en_bruto/`, que va tal cual en el header y en el CTA. Antes de dibujar algo desde cero, mira si existe en el repo. Música (`encargo.musica`) y efectos según `referencias/audio.md`.

## 5. Revisa los stills
`python3 scripts/preparar_brief.py briefs/<BASE> --stills` imprime un comando de still para el primer frame, la entrada del header, cada bloque, cada ancla y acento, el CTA y el final. Míralos con la lista de `referencias/entrega.md`, corrige y repite.

## 6. Render y entrega
Comandos y especificación: `referencias/entrega.md`. Entrega el MP4 y la portada con una o dos líneas (formato, ambientes, efectos). Sin informes, sin caption, sin comentarios sobre el guion.

## Reglas fijas
- El marco (barra de progreso, header con logo, titular, subtítulos, CTA con logo) es igual en todos los videos; el header entra en `brief.header_entra_f` (1,5 s), nunca en el frame 0.
- El CTA invita a entrar al perfil y tocar el enlace de la bio: nada de palabras clave, comentarios, DM ni "link en la descripción".
- Ninguna cifra en pantalla salvo un dato verificado o la cifra de oficio que dice la voz. Lo ilustrativo se marca como **EJEMPLO ILUSTRATIVO**.
- En pantalla la marca coordina; nunca aparece como quien construye, instala o repara, ni con sellos de "licenciado", "asegurado" o "garantizado".
- Animación pura: nada de fotos ni videos, ni logos de contratistas o fabricantes.
- La voz no se toca: ni recortes ni cambios de velocidad. Música y efectos solo del catálogo de `audio/`, por debajo de la voz.
- Determinismo: nada de `Math.random()` en Remotion.
