---
name: reel-remodelacion
description: Dirige, construye y renderiza con Remotion un Reel vertical educativo y 100 % animado de remodelación e interiores en Florida, en español, para la marca EN BRUTO, a partir del guion, la locución y los tiempos por palabra que deja el notebook en briefs/<BASE>/es/. Úsala cuando pidan crear, dirigir, renderizar o corregir un reel de la marca, o cuando haya una carpeta nueva en briefs/.
---

# Reel de remodelación: dirección, montaje y render

Estos videos son **instructivos-educativos** y **solo de animación**: no hay fotos ni videos de obras reales, ni casos de clientes. El notebook te da **el guion** (texto plano en español), **la locución** (`locucion.wav`) y **el tiempo de cada palabra** (`palabras.json` v4) en `briefs/<BASE>/es/`, más un `encargo.json` con la marca (EN BRUTO), el formato que eligió el guionista y el seed del que salió el guion. Todo lo demás es tuyo: bloques, titulares, parámetros de la plantilla, ambientes, cada escena y el render.

## 1. Localiza el material
- `briefs/<BASE>/encargo.json` + `briefs/<BASE>/es/{guion.txt, locucion.wav, palabras.json}`. "El último" = la carpeta `AAAAMMDD-HHMM` más reciente.
- Si te adjuntan un `<BASE>.zip` (el notebook no pudo subirlo), descomprímelo en `briefs/<BASE>/`.
- `python3 scripts/validar_repo.py` debe pasar antes de empezar.

## 2. Lee la locución
`python3 scripts/alinear.py briefs/<BASE>/es`: escribe `subtitulos.json` e imprime el guion numerado con pausas (`‖0.45s`). Los `[n]` son las **anclas** de todo lo que decidas. No oyes el audio: el ritmo está ahí. Un guion = un párrafo por bloque; las pausas largas son cortes naturales.

## 3. Lee la marca, el formato y el encargo
- Siempre: `editorial/marca.md` (incluida la sección **Declaraciones permitidas**), `editorial/adn.md`, `referencias/layout.md`, `referencias/sincronizacion.md`, `referencias/decisiones.md`, `diseno/tokens.json`.
- La ficha del formato: `plantillas/<formato>.md` y sus parámetros en `plantillas/plantillas.json`. Usa el que eligió el guionista (`encargo.formato_guion`) salvo que el guion pida claramente otro: dilo en la entrega. Si viene `null`, elige tú la plantilla que mejor cuente el guion.
- `encargo.seed` te dice la intención (tema, ángulo, servicio a promocionar…): úsala para la etiqueta, los titulares y el tono visual.
- Abre `contactos.png` (iconos, logos de canales, UI y texturas del repo).

## 4. Revisa el guion contra el ADN
El guion pasó por avisos automáticos, no por un editor. Con el checklist de `editorial/adn.md`:
- **Cifras**: cada precio, plazo, porcentaje o norma debe estar en `editorial/datos_verificados.json` con `verificado: true`. Si no, **no la pongas en pantalla** y dilo en la entrega. Puedes proponer en la entrega la fuente oficial que la respaldaría, pero no cambies `verificado` a `true`: eso lo hace la persona tras leer la fuente (ver README).
- **Marca**: si la voz presenta a la marca como ejecutora ("construimos") o afirma licencia, seguro o garantías no declaradas, no lo tapes con la imagen: dilo en la entrega para que se regrabe. La voz no se toca.
- **Casos**: si la voz cuenta un caso de cliente o un proyecto concreto como real, dilo en la entrega. En pantalla todo ejemplo es ilustrativo.

## 5. Dirige: escribe `briefs/<BASE>/decisiones.json`
Formato completo en `referencias/decisiones.md`. En resumen: los 6 bloques (`gancho, escena, marco, cuerpo, resultado, cta`) anclados al guion, titulares de dos líneas, `etiqueta` del header, `cta`, `ambientes` y `plantilla.params` según `plantillas.json`.
Después: `python3 scripts/preparar_brief.py briefs/<BASE>`. Valida contra marca, plantillas y datos, y escribe `briefs/<BASE>/es/brief.json` con frames exactos. Si da errores, corrige `decisiones.json` y repite. Nunca edites frames a mano en `brief.json`.

## 6. Construye
Un proyecto Remotion con la composición `Reel-es`, que lee `src/brief_es.json` (`referencias/tecnico.md`). Las escenas del bloque `cuerpo` (y lo que la ficha diga de otros bloques) salen de la plantilla del formato; todo lo que no esté en las referencias, decídelo con el sistema de diseño de `tokens.json`. Todo se dibuja: SVG, iconos, texturas y tipografía.

## 7. Revisa como un editor
`python3 scripts/preparar_brief.py briefs/<BASE> --stills` imprime un comando de still por bloque, transición de ambiente, ancla de la plantilla, CTA y final. Ejecútalos y mira cada imagen con la lista de `referencias/entrega.md` → "Antes de entregar". Corrige y repite.

## 8. Render y entrega
Comandos, formato de salida y qué decir en la entrega: `referencias/entrega.md`. Si tienes permiso de escritura en el repo, sube `briefs/<BASE>/decisiones.json`, `briefs/<BASE>/es/brief.json` y `briefs/<BASE>/es/subtitulos.json` (así el siguiente video ve qué ambientes se usaron).

## Reglas fijas
- El marco (barra de progreso, header, titular, subtítulos, CTA) es igual en todos los videos; solo cambian el ambiente y la escena.
- Ninguna cifra en pantalla sin un dato verificado de `datos_verificados.json`. Lo ilustrativo se marca como **EJEMPLO ILUSTRATIVO**.
- La marca coordina; nunca aparece como quien construye, instala o repara. Ni sellos de "licenciado", "asegurado" ni "garantizado" salvo lo que `marca.md` declare con `si`.
- Animación pura: nada de fotos ni videos (ni de obras, ni de bancos de imágenes, ni de internet), ni logos de contratistas o fabricantes.
- La voz no se toca: ni recortes, ni cambios de velocidad, ni música encima.
- Determinismo: nada de `Math.random()` en Remotion.
