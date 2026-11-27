# Escenas: lo único que dibujas por video

Archivo: `remotion/src/escenas/actual.tsx` (lo crea vacío `revisar.py` la primera vez). Exporta `escenas` con cuatro componentes:

```tsx
import React from "react";
import {Zona, ZONA, useAncla, useColores, resorte, tramo, /* … */} from "../kit";
import type {Escenas} from "./tipos";

const Gancho: React.FC = () => { /* … */ };
export const escenas: Escenas = {gancho: Gancho, escena: Escena, marco: Marco, resultado: Resultado};
```

Opcionales: `cuerpo` (sustituye a la plantilla; casi nunca), `cuerpoFondo` (algo detrás de la plantilla) y `acento` (capa propia para cada acento). El cuerpo sale solo de la plantilla del formato con `plantilla.params`, y el CTA, el bucle, el marco, la cámara y el audio ya están hechos: **no los dibujes**.

**Patrón:** un componente ilustrado con props de estado de 0 a 1 (en el ejemplo, `<Fachada e={{ampolla, manchas, reparada…}} />`) que usan gancho, escena y resultado. Así el resultado es el mismo encuadre del frame 0 ya resuelto y el bucle (que vuelve al frame 0 del gancho) encaja solo. Lee `ejemplo_fachada.tsx` antes de empezar.

## Coordenadas
- Dibuja dentro de `<Zona>`: (0, 0) es la esquina superior izquierda de la zona de escena (Y 600–1320 del lienzo) y mide 1080 × 720. El **texto** va entre x 72 y 940 (`ZONA.x` … `ZONA.x + ZONA.ancho`); la ilustración puede usar el ancho, pero no tapes el titular (encima) ni los subtítulos (debajo).
- `useCurrentFrame()` es **local al bloque** (0 = primera palabra del párrafo).

## Tiempo
| Qué | Cómo |
|---|---|
| Lanzar algo cuando la voz dice la palabra [n] | `const A = useAncla();` → `A(n)` (frame local, ya con la anticipación de 2 frames) |
| Entrada con rebote 0 → 1 | `resorte(f, A(n), "entrada" \| "pop" \| "suave")` |
| Transición suave 0 → 1 | `tramo(f, desde, duración)` |
| Transformación que termina en la palabra | `tramo(f, A(n) - 8, 8)` |
| Golpe 0 → 1 → 0 | `pulso(f, desde, 18)` |
| Temblor de 3 frames | `temblor(f, desde)` (px para un translate) |

Mientras habla la voz, algo nuevo como mucho cada 4 s: cambios de bloque, elementos de la plantilla, el CTA y los acentos (los cuenta `preparar_brief`). Dentro de tus escenas, haz que cada cambio caiga en una palabra real.

## Color
- `const c = useColores();` da los colores del ambiente del bloque, ya fundidos en las transiciones: `fondo_a`, `fondo_b`, `superficie`, `linea`, `estructura`, `texto`, `texto_suave`, `alerta`, `exito`, `foco` (rojo de marca).
- `APOYO.<nombre>` para ilustrar: `carbon`, `piedra`, `greige`, `ladrillo`, `arcilla`, `terracota_suave`, `rosa_arcilla`, `miel`, `arena`, `salvia`, `eucalipto`, `niebla`. 2-3 por escena, mejor un par: arcilla + rosa_arcilla, salvia + arena, eucalipto + greige, niebla + carbon, ladrillo + terracota_suave, miel + carbon (miel solo en detalles pequeños).
- El rojo (`c.foco`) solo para el foco de la escena y los corchetes. `c.alerta` siempre con su icono (X, triángulo).

## Piezas (`import {…} from "../kit"`)
| Pieza | Uso |
|---|---|
| `Zona`, `ZONA` | contenedor y medidas de la zona de escena |
| `Icono nombre size color grosor` | icono de `icons/` (busca con `ls icons \| grep -i palabra`); `IconoSvg` dentro de un `<svg>` |
| `Corchetes ancho alto p` | corchetes `[ ]` de la marca alrededor de una caja; `p = resorte(f, A(n), "pop")` |
| `Entra desde modo` | envoltorio de entrada: `abajo`, `escala`, `izquierda`, `derecha`, `arriba` |
| `Tarjeta`, `Chip`, `Sello`, `Check p`, `Contador valor desde` | tarjeta con sombra suave, chip mono, sello estampado, check dibujado, número que cuenta |
| `TextoMarcado texto p` | lo que va entre `*asteriscos*` lleva marcador rojo |
| `Textura nombre opacidad` | `textures/<nombre>.svg` repetida (`mat_tablones`, `mat_concreto`, `mat_baldosa`, `blueprint`, `noise_grain`…) |
| `Particulas x y desde color` | polvo, gotas, chispas deterministas |
| `trazo(p)` | props para dibujar un `<path>` de 0 a 1 |
| `Pegatina nombre` | emoji de `illus/emoji/flat` (o `tresD`): una o dos por video como mucho |
| `Ilustrativo` | sello «EJEMPLO ILUSTRATIVO» (obligatorio en casos concretos) |
| `escala("cuerpo" \| "titular_l1" \| "etiqueta" \| "sello" \| "cifra", px)` | estilos tipográficos de la marca; `anchoTexto`, `ajustarPx` para que el texto quepa |
| `Planta`, `MitoRealidad`, `Errores`, … | las plantillas, reutilizables (p. ej. la planta «antes» en la escena: `<Planta p={brief.plantilla.params} estatico posiciones={{0: {x: 40, y: 200}}} />`) |
| `random(semilla)` | aleatorio determinista |

## Reglas visuales que dependen de ti
- **Frame 0** = `encargo.gancho.primer_frame` dibujado y **ya en movimiento** (algo crece, cae, gotea desde el frame 0). Es la portada y el destino del bucle. Nada de títulos dentro de la escena: el titular ya está arriba. Mientras la voz dice la apertura («No me lo pediste…»), el problema ya se ve y avanza; lo fuerte entra con el gancho real.
- Nada aparece solo con opacidad: entra desde abajo, desde escala 0,3 con rebote o se dibuja con trazo.
- Estética EN BRUTO: editorial, arquitectónica y cálida (plano de arquitecto + revista de interiores). Bloques sólidos, esquinas casi rectas (`RADIO`), sombras suaves (`SOMBRA`), nunca negras y duras. Objetos simples y reconocibles; sin personas fotorrealistas.
- Corchetes rojos: uno o dos por bloque, sobre lo que importa.
- Marco (el bloque): la pausa de criterio, tipográfica y aireada: 2-3 conceptos con conectores, el concepto clave entre corchetes.
- Resultado: el objeto del gancho ya resuelto (misma composición), con calma.
- Escenas compactas: ~300-400 líneas en total, reutilizando el componente ilustrado.

## Acentos (`decisiones.json → acentos`)
Cada acento da un golpe de cámara. Si su `que` empieza por `chip:` aparece solo un chip abajo a la derecha unos 2 s: `{"ancla": 81, "que": "chip: MEDIDOR DE HUMEDAD | gauge"}` (texto | icono opcional). Cualquier otro `que` lo dibujas tú dentro de la escena en `A(ancla)`.

## No toques
`remotion/src/marco`, `src/plantillas`, `src/kit`, `Reel.tsx` ni el resto del repo. Si algo de la plantilla falla, para y dilo en una línea.
