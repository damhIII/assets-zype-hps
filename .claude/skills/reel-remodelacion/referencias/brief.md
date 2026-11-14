# brief.json (versión 4) — los datos de render del video

Lo genera `scripts/preparar_brief.py` en `briefs/<BASE>/es/brief.json` a partir de `decisiones.json`, el guion y los tiempos de la voz. No lo edites a mano. Cópialo a `src/brief_es.json` e impórtalo; lee de él frames, textos, colores y tipografías: **no copies números a mano**.

```jsonc
{
  "version": 4,
  "base": "20261110-0930",
  "idioma": "es",
  "carpeta": "briefs/20261110-0930/es",         // audio = carpeta + "/" + audio
  "audio": "locucion.wav",
  "marca": { "nombre": "EN BRUTO", "pendiente": false,
             "logos": { "fondo_claro": "brand/en_bruto/logo_fondo_claro.png", "fondo_claro_sin_lema": "…", "fondo_oscuro": "…", "fondo_oscuro_sin_lema": "…", "original": "…" },
             "uso": { "header": { "variante": "sin_lema", "alto_px": 48 }, "cta": { "variante": "con_lema", "ancho_px": 620 } } },
  "formato": "checklist",
  "video": { "width": 1080, "height": 1920, "fps": 30, "frames": 1497, "voz_s": 48.4, "cola_s": 1.5 },
  "etiqueta": "CONTRATISTAS · FLORIDA",
  "cta": "LINK EN LA BIO",                      // texto de la caja del CTA
  "cta_ancla": 112,                             // palabra en que la voz manda al enlace
  "cta_f": 1430,                                // frame de esa palabra: pop de la caja y de la flecha
  "cta_previo": "Entra a nuestro perfil",
  "tema": { "id": 6, "titulo": "...", "tesis": "..." },
  "aviso_legal": "Contenido informativo. No es asesoría legal ni una cotización.",   // null = no se muestra
  "ilustrativo": "EJEMPLO ILUSTRATIVO",
  "ambientes": { "gancho": "noche", "escena": "lino", "marco": "lino", "cuerpo": "lino", "resultado": "lino", "cta": "lino" },
  "fuentes": [ { "rol": "display", "familia": "Barlow Condensed", "css": "fonts/css/barlow_condensed__400-500-700-800-900.css", "stack": "…" },
               { "rol": "texto", "familia": "DM Sans", "…": "…" }, { "rol": "mono", "familia": "Space Mono", "…": "…" } ],
  "fuentes_en_pantalla": [ { "id": "verificar_licencia", "corta": "Florida DBPR" } ],
  "bloques": [
    { "id": "gancho", "ini_f": 0, "fin_f": 141, "ini_s": 0.0, "fin_s": 4.7,
      "titular": ["Pagaste el depósito", "Y desapareció"], "texto": "lo que dice la voz en este tramo", "palabras": [0, 12] }
  ],
  "plantilla": {
    "id": "checklist",
    "md": ".claude/skills/reel-remodelacion/plantillas/checklist.md",
    "params": {                                 // textos listos; cada ancla con su frame (<clave>_f); cada fuente con su texto (<clave>_corta)
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
- Los colores salen de `tokens.color` y, en cada bloque, de `tokens.ambientes[ambientes[bloque]]` (incluido su `foco`).
- El logo: `marca.logos`, variante según `tokens.ambientes[ambiente].tipo` (`claro` → `fondo_claro…`, `oscuro` → `fondo_oscuro…`).
- No hay fotos ni activos externos: todo lo que se ve se dibuja con `tokens` y los assets gráficos del repo.
