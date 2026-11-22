---
name: reel-remodelacion
description: Dirige, construye y renderiza con Remotion un Reel vertical educativo y 100 % animado de remodelación e interiores en Florida, en español, para la marca EN BRUTO, a partir del encargo, el guion, la locución y los tiempos por palabra que deja el notebook en briefs/<BASE>/. Úsala cuando pidan crear, dirigir, renderizar o corregir un reel de EN BRUTO.
---

# Reel de EN BRUTO: dirección, montaje y render

Videos **educativos** y **solo de animación**: nada de fotos ni videos de obras reales, ni casos de clientes. El notebook te deja en `briefs/<BASE>/`:
- `encargo.json`: el espacio, el tema (seed, tesis, puntos), el **formato**, el **gancho** (`pantalla` = texto del primer segundo, `primer_frame` = lo que se ve en el frame 0), `mandar_a`, `palabras_clave` y `cifra_oficio`.
- `es/guion.txt` (seis párrafos: gancho, escena, marco, cuerpo, resultado, cierre), `es/locucion.wav` y `es/palabras.json` (tiempo de cada palabra).

Todo lo demás es tuyo: bloques, titulares, parámetros de la plantilla, ambientes, cada escena y el render. Donde más importa tu criterio es en los **primeros tres segundos**: deciden si alguien sigue mirando.

## 1. Localiza el material
- "El último" = la carpeta `AAAAMMDD-HHMM` más reciente de `briefs/`. Si te adjuntan `<BASE>.zip`, descomprímelo en `briefs/<BASE>/`.
- `python3 scripts/validar_repo.py` debe pasar antes de empezar.

## 2. Lee la locución
`python3 scripts/alinear.py briefs/<BASE>/es`: escribe `subtitulos.json` e imprime el guion numerado con pausas (`‖0.45s`). Los `[n]` son las **anclas** de todo lo que decidas. No oyes el audio: el ritmo está ahí.

## 3. Lee lo necesario
- `referencias/decisiones.md` (qué escribes y cómo decidir), `referencias/layout.md` (marco, bloques, gancho, cierre y bucle), `referencias/sincronizacion.md`, `referencias/audio.md` y la ficha del formato `plantillas/<formato>.md` (sus parámetros en `plantillas/plantillas.json`).
- `diseno/tokens.json` para colores, tipografías, tamaños y movimiento; `contactos.png` para ver los assets que ya existen.
- Las reglas de marca están en `editorial/prompt_guion.md` (secciones **Declaraciones permitidas**, **Cifras** y **Límites**).

## 4. Revisa el guion
El guion pasó por unas pocas comprobaciones automáticas, no por un editor:
- **Cifras**: precios, plazos de obra, porcentajes, normas o requisitos de permisos solo si están en `editorial/datos_verificados.json` con `verificado: true`. Las **cifras de oficio** (medidas, tiempos de prueba o curado, pendientes) son válidas si la voz las dice como referencia; una o dos por video. Lo que no cumpla, no va a pantalla y lo dices en la entrega.
- **Marca**: si la voz presenta a la marca como ejecutora ("construimos") o afirma licencia, seguro o garantías no declaradas, no lo tapes con la imagen: dilo en la entrega para que se regrabe. La voz no se toca.
- **Casos**: si la voz cuenta un caso de cliente como real, dilo en la entrega. En pantalla todo ejemplo es ilustrativo.

## 5. Dirige: escribe `briefs/<BASE>/decisiones.json`
Formato completo en `referencias/decisiones.md`: los **6 bloques** (`gancho`, `escena`, `marco`, `cuerpo`, `resultado`, `cta`), uno por párrafo del guion, titulares de dos líneas (el del gancho = `encargo.gancho.pantalla`), `etiqueta`, `cta`, `ambientes`, `plantilla.params` y, si hace falta, `acentos` para que nunca pasen más de 4 s sin algo nuevo en pantalla.
Después: `python3 scripts/preparar_brief.py briefs/<BASE>`. Valida contra marca, plantillas, datos y ritmo, y escribe `briefs/<BASE>/es/brief.json` con frames exactos. Si da errores, corrige `decisiones.json` y repite. Trata los avisos de ritmo como errores salvo que tengas un motivo. Nunca edites frames a mano en `brief.json`.

## 6. Construye
Un proyecto Remotion con la composición `Reel-es` que lee `src/brief_es.json` (`referencias/tecnico.md`). El bloque `cuerpo` sale de la plantilla del formato. El frame 0 es `brief.gancho.primer_frame` dibujado y en movimiento, sin header. El final enlaza con el principio (`brief.bucle`, ver `referencias/layout.md`). Todo se dibuja (SVG, iconos, texturas, tipografía), salvo el logo de `brand/en_bruto/`, que va tal cual en el header y en el CTA. Antes de dibujar algo desde cero, mira si existe en el repo. Suma música y efectos según `referencias/audio.md`.

## 7. Revisa como un editor
`python3 scripts/preparar_brief.py briefs/<BASE> --stills` imprime un comando de still para el primer frame, la entrada del header, cada bloque, cada ancla y acento, el CTA y el final. Ejecútalos y mira cada imagen con la lista de `referencias/entrega.md` → "Antes de entregar". Corrige y repite.

## 8. Render y entrega
Comandos, formato de salida y mensaje de entrega: `referencias/entrega.md`. Si tienes permiso de escritura en el repo, sube `briefs/<BASE>/decisiones.json`, `briefs/<BASE>/audio.json`, `briefs/<BASE>/es/brief.json` y `briefs/<BASE>/es/subtitulos.json`.

## Reglas fijas
- El marco (barra de progreso, header con logo, titular, subtítulos, CTA con logo) es igual en todos los videos; el header entra en `brief.header_entra_f` (1,5 s), nunca en el frame 0.
- El CTA invita a entrar al perfil y tocar el enlace de la bio: nada de palabras clave, comentarios, DM ni "link en la descripción".
- Ninguna cifra en pantalla salvo un dato verificado o la cifra de oficio que dice la voz. Lo ilustrativo se marca como **EJEMPLO ILUSTRATIVO**.
- La marca coordina; nunca aparece como quien construye, instala o repara, ni con sellos de "licenciado", "asegurado" o "garantizado" salvo lo declarado con `si`.
- Animación pura: nada de fotos ni videos, ni logos de contratistas o fabricantes.
- La voz no se toca: ni recortes ni cambios de velocidad. Música y efectos solo del catálogo de `audio/`, por debajo de la voz.
- Determinismo: nada de `Math.random()` en Remotion.
