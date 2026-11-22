# brief.json (versión 5) — los datos de render del video

Lo genera `scripts/preparar_brief.py` en `briefs/<BASE>/es/brief.json` a partir de `decisiones.json`, `encargo.json`, el guion y los tiempos de la voz. No lo edites a mano. Cópialo a `src/brief_es.json` e impórtalo; lee de él frames, textos, colores y tipografías: **no copies números a mano**.

```jsonc
{
  "version": 5,
  "base": "20261122-1009",
  "idioma": "es",
  "carpeta": "briefs/20261122-1009/es",         // audio = carpeta + "/" + audio
  "audio": "locucion.wav",
  "marca": { "nombre": "EN BRUTO", "pendiente": false,
             "logos": { "fondo_claro": "brand/en_bruto/logo_fondo_claro.png", "fondo_claro_sin_lema": "…", "fondo_oscuro": "…", "fondo_oscuro_sin_lema": "…", "original": "…" },
             "uso": { "header": { "variante": "sin_lema", "alto_px": 48 }, "cta": { "variante": "con_lema", "ancho_px": 620 } } },
  "formato": "errores",
  "video": { "width": 1080, "height": 1920, "fps": 30, "frames": 1680, "voz_s": 54.5, "cola_s": 1.5 },
  "header_entra_f": 45,                         // el header (logo + etiqueta) no aparece antes de este frame
  "bucle": { "ini_f": 1668, "fin_f": 1680 },    // sale el CTA y la escena vuelve a la composición del frame 0
  "gancho": { "pantalla": "Otra vez la piedra suelta", "primer_frame": "La piedra del borde se levanta sola mientras cae una gota" },
  "etiqueta": "PISCINA · FLORIDA",
  "cta": "LINK EN LA BIO",                      // texto de la caja del CTA
  "cta_ancla": 138,                              // palabra en que la voz manda al enlace
  "cta_f": 1612,                                // frame de esa palabra: pop de la caja y de la flecha
  "cta_previo": "Entra a nuestro perfil",
  "tema": { "titulo": "...", "tesis": "..." },
  "aviso_legal": null,                          // texto o null = no se muestra
  "ilustrativo": "EJEMPLO ILUSTRATIVO",
  "ambientes": { "gancho": "noche", "escena": "lino", "marco": "lino", "cuerpo": "lino", "resultado": "lino", "cta": "lino" },
  "fuentes": [ { "rol": "display", "familia": "Barlow Condensed", "css": "fonts/css/barlow_condensed__400-500-700-800-900.css", "stack": "…" },
               { "rol": "texto", "familia": "DM Sans", "…": "…" }, { "rol": "mono", "familia": "Space Mono", "…": "…" } ],
  "fuentes_en_pantalla": [],
  "bloques": [
    { "id": "gancho", "ini_f": 0, "fin_f": 96, "ini_s": 0.0, "fin_s": 3.2,
      "titular": ["Otra vez", "La piedra suelta"], "texto": "lo que dice la voz en este tramo", "palabras": [0, 14] }
  ],
  "plantilla": {
    "id": "errores",
    "md": ".claude/skills/reel-remodelacion/plantillas/errores.md",
    "params": {                                 // textos listos; cada ancla con su frame (<clave>_f); cada fuente con su texto (<clave>_corta)
      "contador": "riesgo",
      "errores": [ { "titulo": "Pegar encima", "consecuencia": "Se suelta otra vez", "nivel": "medio", "icono": "hammer", "ancla": 25, "ancla_f": 298 } ],
      "antidoto": { "texto": "Sellador flexible en la junta", "ancla": 60, "ancla_f": 702 }
    }
  },
  "acentos": [ { "ancla": 52, "ancla_f": 610, "que": "corchetes rojos sobre 'junta'" } ],
  "tokens": { "...": "copia completa de diseno/tokens.json" },
  "subtitulos": [["¿Otra", 0.0, 0.31], ["vez", 0.31, 0.52]]   // palabras del GUION (su ortografía) con los tiempos de la voz
}
```

## Reglas de lectura
- Los rangos `ini_f`–`fin_f` son exactos y contiguos; el último acaba en `video.frames`.
- Todo elemento de la plantilla y todo acento aparece en su `*_f` menos `tokens.movimiento.anticipacion_frames` (ver `sincronizacion.md`).
- Los colores salen de `tokens.color` y, en cada bloque, de `tokens.ambientes[ambientes[bloque]]` (incluido su `foco`).
- El logo: `marca.logos`, variante según `tokens.ambientes[ambiente].tipo` (`claro` → `fondo_claro…`, `oscuro` → `fondo_oscuro…`), y nunca antes de `header_entra_f`.
- No hay fotos ni activos externos: todo lo que se ve se dibuja con `tokens` y los assets gráficos del repo.
