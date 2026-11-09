# Plantillas visuales (`brief.plantilla`)

La eliges tú en `decisiones.json` (cuándo usar cada una: `decisiones.md`).

## estandar
Un bloque tras otro tal como se describe en `layout_y_bloques.md`.

## dividida
Desde HOY hasta RESULTADO la zona de escena se divide en dos columnas (~460 px cada una, con `ui/split_divider.svg` o un separador SVG con "VS"): izquierda "SIN SISTEMA" (tono alerta `#E5484D`, todo se acumula y falla), derecha "CON SISTEMA" (fluye, se confirma, verde `#30A46C` y foco amarillo). Ambas avanzan en paralelo con el mismo reloj del día (ej. 8 am → 11 pm). En CRITERIO la división se mantiene atenuada mientras manda el titular.
Con climas: la columna izquierda puede llevar el clima del bloque y la derecha volver a zype, o al revés, pero no mezcles dos climas no-zype a la vez en pantalla.

## calculadora
En PROBLEMA y RESULTADO aparece una calculadora: (citas o mesas perdidas por semana) × (ticket promedio de `brief.negocio.items_ejemplo`) × 4 semanas = dinero perdido al mes. Cada factor entra al mencionarse y el total cuenta rápido. Etiqueta pequeña "EJEMPLO ILUSTRATIVO" junto al total.

## dato
En PROBLEMA un número gigante animado (ej. $100 que se encoge hasta $3) con la fuente en pequeño debajo; en RESULTADO la cifra se reencuadra con lo que el negocio sí puede hacer por etapas.

## circulo
En PROBLEMA y HOY un círculo de 3 nodos ("POCO MARGEN" → "NO INVIERTO" → "NO CREZCO") gira con flechas (puedes partir de `illus/vicious_circle.svg`, teñido si el clima no es zype); en CRITERIO una cuña amarilla lo rompe; en SISTEMA el círculo se abre en una línea de etapas.
