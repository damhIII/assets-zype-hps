# Obras reales (`assets/obras/`)

Fotos y videos de proyectos coordinados por la marca. Una carpeta por proyecto: `assets/obras/<id>/` con un `manifest.json` y los archivos. El notebook las lista para el prompt de Claude y para el guionista (solo las cifras verificadas); `preparar_brief.py` las valida y copia sus rutas al brief.

**Carpetas que empiezan por `_`** (como `_ejemplo/`) son plantillas: se validan pero nunca se usan.

## Antes de subir una obra
1. Permiso escrito del propietario para publicar. Guarda el documento fuera del repo y marca `uso_autorizado: true`.
2. Revisa cada foto: dirección, número de casa, caras, matrículas, documentos sobre la mesa. Si algo se ve, recorta la foto o marca el campo de `privacidad` en `true` (Claude desenfocará esa zona o descartará el activo).
3. Optimiza: JPG de 1080-2160 px de lado mayor (≤ 2 MB), MP4 H.264 vertical ≤ 30 s (≤ 40 MB). Sin Git LFS: el render clona el repo sin LFS.

## `manifest.json`
| Campo | Obligatorio | Valores |
|---|---|---|
| `version` | sí | `1` |
| `id` | sí | igual al nombre de la carpeta; minúsculas, números y guiones |
| `ejemplo` | no | `true` = plantilla, se ignora |
| `titulo` | sí | texto corto, sin dirección |
| `tipo_espacio` | sí | `cocina`, `bano`, `sala`, `dormitorio`, `sala_comedor`, `estudio`, `lavanderia`, `exterior`, `techo`, `ventanas`, `pisos`, `fachada`, `casa_completa`, `otro` |
| `ciudad`, `condado` | sí | sin dirección exacta |
| `fecha_inicio`, `fecha_fin` | sí | `AAAA-MM-DD` o `null` |
| `uso_autorizado` | sí | `true` solo con permiso escrito |
| `creditos.ejecucion` | sí | quién ejecutó la obra (la marca coordina, no ejecuta) |
| `creditos.coordinacion` | sí | normalmente `{{NOMBRE_MARCA}}` (se sustituye por la variable `MARCA`) |
| `creditos.fotos` | no | autor |
| `datos_publicables.<campo>` | no | `{ "valor": número, "verificado": bool, "fuente": "documento" }`; solo los verificados se pueden decir o mostrar |
| `activos[]` | sí (≥ 1) | `{ archivo, tipo: foto|video, momento: antes|despues|proceso|detalle, descripcion, orientacion: vertical|horizontal|cuadrada, duracion_s? }` |
| `privacidad` | sí | `direccion_visible`, `caras_visibles`, `matriculas_visibles` (bool) |

Comprueba con `python3 scripts/validar_repo.py`.
