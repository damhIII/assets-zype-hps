---
name: reel-remodelacion
description: Dirige, construye y renderiza con Remotion un Reel vertical de remodelación e interiores en Florida (español, inglés o ambos) a partir del guion, la locución y los tiempos por palabra que deja el notebook en briefs/<BASE>/<idioma>/. Úsala cuando pidan crear, dirigir, renderizar o corregir un reel de la marca, o cuando haya una carpeta nueva en briefs/.
---

# Reel de remodelación: dirección, montaje y render

El notebook te da, por idioma, **el guion** (texto plano), **la locución** (`locucion.wav`) y **el tiempo de cada palabra** (`palabras.json` v4), más un `encargo.json` común con la marca, el formato pedido, los idiomas y las obras reales disponibles. Todo lo demás es tuyo: bloques, titulares, parámetros de la plantilla, ambientes, cada escena y el render. Si hay dos idiomas, **un solo diseño de escenas** sirve a los dos: cambian los textos y los tiempos, no las escenas.

## 1. Localiza el material
- `briefs/<BASE>/encargo.json` + `briefs/<BASE>/<idioma>/{guion.txt, locucion.wav, palabras.json}`. "El último" = la carpeta `AAAAMMDD-HHMM` más reciente.
- Si te adjuntan un `<BASE>.zip` (el notebook no pudo subirlo), descomprímelo en `briefs/<BASE>/`.
- `python3 scripts/validar_repo.py` debe pasar antes de empezar.

## 2. Lee la locución
`python3 scripts/alinear.py briefs/<BASE>/<idioma>` por cada idioma: escribe `subtitulos.json` e imprime el guion numerado con pausas (`‖0.45s`). Los `[n]` son las **anclas** de todo lo que decidas. No oyes el audio: el ritmo está ahí. Un guion = un párrafo por bloque; las pausas largas son cortes naturales.

## 3. Lee la marca, el formato y el material
- Siempre: `editorial/marca.md` (incluida la sección **Declaraciones permitidas**), `editorial/adn.md`, `referencias/layout.md`, `referencias/sincronizacion.md`, `referencias/decisiones.md`, `diseno/tokens.json`.
- La ficha del formato: `plantillas/<formato>.md` y sus parámetros en `plantillas/plantillas.json`. Si `encargo.formato` es `auto`, usa el que eligió el guionista (`encargo.formato_guion`) salvo que el guion pida claramente otro: dilo en la entrega.
- Si el encargo trae obras reales: `referencias/activos_reales.md` y el `manifest.json` de cada una. Mira las fotos (Read) antes de elegir.
- Abre `contactos.png` (iconos, logos de canales, UI y texturas del repo).

## 4. Revisa el guion contra el ADN
El guion pasó por avisos automáticos, no por un editor. Con el checklist de `editorial/adn.md`:
- **Cifras**: cada precio, plazo, porcentaje o norma debe estar en `editorial/datos_verificados.json` con `verificado: true`, o en `datos_publicables` verificados de la obra elegida. Si no, **no la pongas en pantalla** y dilo en la entrega. Puedes proponer en la entrega la fuente oficial que la respaldaría, pero no cambies `verificado` a `true`: eso lo hace la persona tras leer la fuente (ver README).
- **Marca**: si la voz presenta a la marca como ejecutora ("construimos") o afirma licencia, seguro o garantías no declaradas, no lo tapes con la imagen: dilo en la entrega para que se regrabe. La voz no se toca.
- **Dos idiomas**: comprueba que los dos guiones cuentan lo mismo, en el mismo orden y con el mismo número de párrafos. Si no, dilo.

## 5. Dirige: escribe `briefs/<BASE>/decisiones.json`
Formato completo en `referencias/decisiones.md`. En resumen: los 6 bloques (`gancho, escena, marco, cuerpo, resultado, cta`) anclados por idioma, titulares de dos líneas por idioma, `etiqueta` del header, `cta` por idioma, `ambientes`, `obra` (o `null`), y `plantilla.params` según `plantillas.json`.
Después: `python3 scripts/preparar_brief.py briefs/<BASE>`. Valida contra marca, plantillas, datos y obras, y escribe `briefs/<BASE>/<idioma>/brief.json` con frames exactos. Si da errores, corrige `decisiones.json` y repite. Nunca edites frames a mano en `brief.json`.

## 6. Construye
Un proyecto Remotion con una composición por idioma (`Reel-es`, `Reel-en`) que comparten componentes; cada una lee su `src/brief_<idioma>.json` (`referencias/tecnico.md`). Las escenas del bloque `cuerpo` (y lo que la ficha diga de otros bloques) salen de la plantilla del formato; todo lo que no esté en las referencias, decídelo con el sistema de diseño de `tokens.json`.

## 7. Revisa como un editor
`python3 scripts/preparar_brief.py briefs/<BASE> --stills` imprime un comando de still por bloque, transición de ambiente, ancla de la plantilla, CTA y final, por idioma. Ejecútalos y mira cada imagen con la lista de `referencias/entrega.md` → "Antes de entregar". Corrige y repite.

## 8. Render y entrega
Comandos, formato de salida y qué decir en la entrega: `referencias/entrega.md`. Si tienes permiso de escritura en el repo, sube `briefs/<BASE>/decisiones.json` y los `brief.json` y `subtitulos.json` de cada idioma (así el siguiente video ve qué ambientes se usaron).

## Reglas fijas
- El marco (barra de progreso, header, titular, subtítulos, CTA) es igual en todos los videos; solo cambian el ambiente y la escena.
- Ninguna cifra en pantalla sin fuente verificada (DATOS u OBRA). Lo ilustrativo se marca como **EJEMPLO ILUSTRATIVO**.
- La marca coordina; nunca aparece como quien construye, instala o repara. Ni sellos de "licenciado", "asegurado" ni "garantizado" salvo lo que `marca.md` declare con `si`.
- Fotos reales solo de `assets/obras/` con `uso_autorizado: true`, respetando `privacidad` y mostrando los créditos de ejecución. Nunca fotos de bancos de imágenes presentadas como obra propia, ni logos de contratistas o fabricantes.
- La voz no se toca: ni recortes, ni cambios de velocidad, ni música encima.
- Determinismo: nada de `Math.random()` en Remotion.
