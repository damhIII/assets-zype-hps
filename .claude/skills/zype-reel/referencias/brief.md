# brief.json — lo que manda el notebook de Colab

El notebook escribe guion, locución y tiempos; todo lo que varía de un video a otro llega en este archivo. Lo que no varía (marca, layout, técnica) está en las otras referencias de la skill. Impórtalo tal cual en el proyecto (`src/brief.json`) y lee de él frames, textos y colores: **no copies números a mano**.

```jsonc
{
  "version": 2,
  "base": "02-2_mesa_hipotetico_1105-1323", // nombre base de los archivos de salida (tema_cta_modo_fecha)
  "modo": "hipotetico",                     // "hipotetico" (negocio ILUSTRATIVO) | "real" (cliente)
  "audio": "02-2_mesa_hipotetico_locucion.wav",   // en la misma carpeta que el brief, o adjunto en el chat
  "video": { "width": 1080, "height": 1920, "fps": 30, "frames": 1274, "voz_s": 40.96, "cola_s": 1.5 },

  "nicho_header": "RESTAURANTES",           // → "SISTEMAS PARA RESTAURANTES"
  "cta": "MESA",
  "plantilla": "estandar",                  // estandar | dividida | calculadora | dato | circulo → plantillas.md
  "hps": true,                              // sello Hitch Point Studio en CRITERIO y en el cierre → marca.md
  "logos": { "zype": true, "hps": true },   // false = el PNG no está: usa el wordmark de texto
  "tema": { "id": 2, "variante": 2, "titulo": "...", "tesis": "...", "gancho": "...", "sistema": "..." },
  "fuente_en_pantalla": "",                 // fuente de un dato, si se cita alguno
  "notas_direccion": "",                    // indicación creativa del usuario solo para este video: tiene prioridad sobre tu criterio, no sobre la marca

  "climas": { "problema": "zype", "hoy": "brasa", "criterio": "papel", "sistema": "zype", "resultado": "bosque", "cta": "zype" },
                                            // id de brand/paletas.json → climas.md. Si falta: todo "zype"
  "estetica_negocio": {                     // interior del mockup (null = mockup en clima del bloque)
    "origen": "curada",                     // "real" (ficha del cliente) | "curada" (paletas_negocio del repo)
    "paleta_id": "terracota",
    "paleta": { "fondo": "#...", "superficie": "#...", "primario": "#...", "secundario": "#...", "acento": "#...", "texto": "#...", "texto_suave": "#...", "alerta": "#E5484D", "exito": "#30A46C" },
    "tipografia": { "titulos": "\"DM Serif Display\", serif", "texto": "\"DM Sans\", sans-serif" },
    "lenguaje_visual": { "radios": "16px", "motivo": "..." }
  },

  "fuentes": [                              // CSS con woff2 en base64, ya en el repo
    { "rol": "zype", "familia": "Montserrat", "css": "fonts/css/montserrat__400-500-700-800-900.css", "stack": "\"Montserrat\", sans-serif" }
  ],

  "ficha": { "nombre_mostrado": "...", "negocio": {...}, "vocabulario": {...}, "operacion": {...} },

  "bloques": [
    { "id": "problema", "ini_f": 0, "fin_f": 141, "ini_s": 0.0, "fin_s": 4.7,
      "titular": ["línea 1 blanca", "línea 2 amarilla"], "texto": "lo que se locuta",
      "palabras": [0, 11] },                // índices [desde, hasta) en "palabras"
    { "id": "sistema", "...": "...", "pasos": ["Mensaje entra", "IA confirma", "Mesa asignada"],
      "pasos_f": [612, 680, 741] }          // frame en que se nombra cada paso (null si no se encontró)
  ],

  "subtitulos": [["Agendó.", 0.0, 0.42], ["No", 0.5, 0.61]],  // palabras del GUION alineadas con la voz → úsalas para los subtítulos
  "palabras": [["Agendó", 0.0, 0.42], ["No", 0.5, 0.61]]      // salida cruda de Whisper [palabra, inicio_s, fin_s]
}
```

## Reglas de lectura
- Los rangos `ini_f`–`fin_f` de los bloques son exactos y contiguos; `video.frames` es la duración de la composición.
- `pasos_f` es orientativo: si un valor es null, usa el reparto uniforme dentro del bloque.
- Los subtítulos salen de `subtitulos`: ya traen la ortografía del guion con los tiempos de la voz (cifras incluidas). `palabras` queda solo como referencia.
- Si `version` es 1 o no existe (brief viejo, prompt largo), sigue lo que diga el prompt.
