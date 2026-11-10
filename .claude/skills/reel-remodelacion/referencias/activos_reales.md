# Fotos y videos reales de obras (`assets/obras/`)

El encargo (`encargo.json → obras`) lista las obras **utilizables**: con `uso_autorizado: true`, que no son ejemplo y cuyo manifest es válido. Si la lista está vacía o el prompt dice "animación pura", no uses fotos: todo se dibuja.

## Elegir
- Elige una obra solo si encaja con lo que cuenta el guion (mismo tipo de espacio o el mismo problema). Nunca uses una obra para ilustrar algo que no le pasó.
- Mira cada foto (Read) antes de decidir: encuadre, luz, si se lee en vertical, si hay datos privados.
- Pon su id en `decisiones.obra`. Solo entonces puedes usar `activo`, `imagen` y `fuente: "obra:<campo>"` en los parámetros.

## Usar
- Copia a `public/obras/<id>/` solo los archivos que uses; referencia con `staticFile()`.
- Fotos: `objectFit: "cover"` dentro de un marco con `radio_foto`; recorte 4:5 o 9:16 centrado en lo importante; Ken Burns suave. Nunca las deformes, no les cambies el color más allá de un ajuste ligero y nunca les añadas elementos que no estaban (muebles, ventanas): eso sería falsear el resultado.
- Videos: sin audio (`volume={0}`), tramos ≤ 2-3 s, a velocidad real o como mucho ×2 con la etiqueta "ACELERADO" / "SPED UP".
- **Privacidad**: si `privacidad.direccion_visible`, `caras_visibles` o `matriculas_visibles` es `true`, desenfoca la zona (blur ≥ 24 px con una máscara fija y determinista) o descarta el activo. En la duda, descártalo.
- **Créditos**: si se ve cualquier activo real, la línea `textos_fijos.creditos_obra` con `obra.creditos` va al pie durante el bloque en que aparece (escala `fuente_dato`).
- **Cifras**: solo `datos_publicables` con `verificado: true`, mostradas con "Obra real · <titulo>" como fuente.

## Sin obra
Animación pura con el sistema de diseño: plantas, tarjetas, iconos, texturas. Lo que represente un caso concreto se marca con `ilustrativo` (**EJEMPLO ILUSTRATIVO**). No uses fotos de bancos de imágenes ni de internet.
