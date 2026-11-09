# brief.json (versión 3) — los datos de render

Lo genera `scripts/preparar_brief.py` a partir de tu `decisiones.json`, el guion y los tiempos de la voz. No lo edites a mano: si algo cambia, corrige `decisiones.json` y vuelve a ejecutar el script. Cópialo a `src/brief.json` e impórtalo; lee de él frames, textos y colores: **no copies números a mano**.

```jsonc
{
  "version": 3,
  "base": "20261109-1300",                  // carpeta briefs/<BASE> y nombre del MP4
  "audio": "locucion.wav",                  // en briefs/<BASE>/
  "video": { "width": 1080, "height": 1920, "fps": 30, "frames": 1997, "voz_s": 65.05, "cola_s": 1.5 },

  "nicho_header": "IMPRENTAS",              // → "SISTEMAS PARA IMPRENTAS"
  "cta": "PAGOS",
  "plantilla": "dividida",                  // → plantillas.md
  "hps": false,                             // → marca.md
  "logos": { "zype": true, "hps": true },   // false = el PNG no está: usa el wordmark de texto
  "tema": { "id": 10, "titulo": "...", "tesis": "..." },
  "fuente_en_pantalla": "",

  "climas": { "problema": "zype", "hoy": "zype", "criterio": "zype", "sistema": "oceano", "resultado": "bosque", "cta": "zype" },
  "estetica_negocio": {                     // interior del mockup (null = mockup en el clima del bloque)
    "origen": "curada", "paleta_id": "pizarra",
    "paleta": { "fondo": "#...", "superficie": "#...", "primario": "#...", "secundario": "#...", "acento": "#...", "texto": "#...", "texto_suave": "#...", "alerta": "#E5484D", "exito": "#30A46C" },
    "tipografia": { "titulos": "\"Inter\", sans-serif", "texto": "\"Inter\", sans-serif" },
    "lenguaje_visual": { "radios": "12px", "motivo": "..." }
  },
  "fuentes": [                              // css = fonts/css/*.css (woff2 en base64) o null si no está cacheada (usa solo el stack genérico)
    { "rol": "zype", "familia": "Montserrat", "css": "fonts/css/montserrat__400-500-700-800-900.css", "stack": "\"Montserrat\", sans-serif" }
  ],
  "negocio": { "nombre_mostrado": "Tinta Vecinal", "rubro": "imprenta", "moneda": "$", "items_ejemplo": [{ "nombre": "500 volantes", "precio": 600 }], "canales": ["..."] },

  "bloques": [
    { "id": "problema", "ini_f": 0, "fin_f": 194, "ini_s": 0.0, "fin_s": 6.47,
      "titular": ["Persigues pagos", "En vez de vender"], "texto": "lo que dice la voz en este tramo",
      "palabras": [0, 14] },                // índices [desde, hasta) en "subtitulos"
    { "id": "sistema", "...": "...", "pasos": ["Comprobante entra", "IA lo asigna", "Recordatorio sale"],
      "pasos_f": [960, 1010, 1130] }        // frame en que la voz nombra cada paso
  ],

  "subtitulos": [["Persigues", 0.0, 0.42], ["pagos", 0.5, 0.81]]   // palabras del GUION (su ortografía) con los tiempos de la voz
}
```

## Reglas de lectura
- Los rangos `ini_f`–`fin_f` son exactos y contiguos; el último acaba en `video.frames`.
- Los subtítulos salen de `subtitulos`: ya traen la ortografía del guion con los tiempos de la voz.
- Briefs versión 2 (pipeline anterior): mismos campos salvo `ficha` en lugar de `negocio` (`ficha.vocabulario.items_ejemplo`, `ficha.negocio.moneda`), `palabras` crudas de Whisper y `notas_direccion`.
