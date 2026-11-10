# brief.json (versión 4) — los datos de render de UN idioma

Lo genera `scripts/preparar_brief.py` en `briefs/<BASE>/<idioma>/brief.json` a partir de `decisiones.json`, el guion y los tiempos de la voz. No lo edites a mano. Cópialo a `src/brief_<idioma>.json` e impórtalo; lee de él frames, textos, colores y tipografías: **no copies números a mano**.

```jsonc
{
  "version": 4,
  "base": "20261110-0930",
  "idioma": "es",
  "carpeta": "briefs/20261110-0930/es",         // audio = carpeta + "/" + audio
  "audio": "locucion.wav",
  "marca": { "nombre": null, "pendiente": true },   // pendiente → no dibujes wordmark: el header lleva solo la etiqueta
  "formato": "checklist",
  "video": { "width": 1080, "height": 1920, "fps": 30, "frames": 1497, "voz_s": 48.4, "cola_s": 1.5 },
  "etiqueta": "CONTRATISTAS · FLORIDA",
  "cta": "LICENCIA",
  "cta_f": 1430,                                // frame en que la voz dice la palabra clave
  "cta_previo": "Comenta o envía por DM",
  "tema": { "id": 6, "titulo": "...", "tesis": "..." },
  "aviso_legal": "Contenido informativo. No es asesoría legal ni una cotización.",   // null = no se muestra
  "ilustrativo": "EJEMPLO ILUSTRATIVO",
  "ambientes": { "gancho": "noche", "escena": "lino", "marco": "lino", "cuerpo": "lino", "resultado": "lino", "cta": "lino" },
  "fuentes": [ { "rol": "display", "familia": "Fraunces", "css": "fonts/css/fraunces__400-500-700-800-900.css", "stack": "\"Fraunces\", Georgia, serif" } ],
  "obra": null,                                 // o { id, titulo, carpeta, creditos, privacidad, tipo_espacio, activos: [{ archivo, ruta, tipo, momento, ... }] }
  "fuentes_en_pantalla": [ { "id": "verificar_licencia", "corta": "Florida DBPR" } ],
  "bloques": [
    { "id": "gancho", "ini_f": 0, "fin_f": 141, "ini_s": 0.0, "fin_s": 4.7,
      "titular": ["Pagaste el depósito", "Y desapareció"], "texto": "lo que dice la voz en este tramo", "palabras": [0, 12] }
  ],
  "plantilla": {
    "id": "checklist",
    "md": ".claude/skills/reel-remodelacion/plantillas/checklist.md",
    "params": {                                 // textos ya en este idioma; cada ancla con su frame (<clave>_f); cada fuente con su texto (<clave>_corta)
      "titulo": "Antes de contratar",
      "items": [ { "texto": "Licencia activa", "icono": "badge-check", "ancla": 36, "ancla_f": 402 } ],
      "bandera_roja": { "texto": "Todo en efectivo", "ancla": 70, "ancla_f": 1011 }
    }
  },
  "tokens": { "...": "copia completa de diseno/tokens.json" },
  "subtitulos": [["Pagaste", 0.0, 0.41], ["el", 0.41, 0.52]]   // palabras del GUION (su ortografía) con los tiempos de la voz
}
```

## Reglas de lectura
- Los rangos `ini_f`–`fin_f` son exactos y contiguos; el último acaba en `video.frames`.
- Todo elemento de la plantilla aparece en su `*_f` menos `tokens.movimiento.anticipacion_frames` (ver `sincronizacion.md`).
- Los colores salen de `tokens.color` y, en cada bloque, de `tokens.ambientes[ambientes[bloque]]`.
- Con dos idiomas hay dos briefs con los **mismos** bloques, plantilla y ambientes; cambian textos, anclas y frames.
