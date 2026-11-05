# assets-zype-hps

Assets de los Reels de ZYPE + Hitch Point Studio. Los assets se sincronizan desde Drive con el notebook de creación de videos: no los edites aquí a mano.

Instrucciones para Claude: `CLAUDE.md` y la skill `.claude/skills/zype-reel/`. Lista completa de archivos: `manifest.json`. Cada video: `briefs/<BASE>/`.

- **icons/**: Iconos de trazo (Lucide) con stroke=currentColor: colorear con máscara CSS (mask-image), no con <Img>.
- **logos/**: Logos de canales y herramientas (blancos). Con máscara CSS para colorearlos. Nunca representan al negocio del cliente.
- **ui/**: Piezas de interfaz ZYPE (colores fijos; teñir con scripts/tenir_svg.py en otros climas): teléfono, burbujas, KPI, nodos, calendario, estrellas, VS, CTA.
- **textures/**: Texturas de fondo (grano, rejillas, puntos, scanlines, viñeta, brillos). Usar con opacidad baja.
- **illus/**: Ilustraciones de escena en línea cian sobre oscuro (teñibles con scripts/tenir_svg.py).
- **fonts/**: fonts/css/*.css: @font-face con los woff2 ya incrustados en base64 (listos para importar). Los .ttf sueltos no se usan.
- **brand/**: brand/paletas.json: climas de escena y paletas de negocio (validar con scripts/validar_paletas.py).
