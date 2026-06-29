![Logo](../../admin/futterautomat.png)
# ioBroker.futterautomat

<p align="center">
  <a href="https://www.buymeacoffee.com/ssbingo"><img src="https://img.buymeacoffee.com/button-api/?text=Buy%20me%20a%20coffee&emoji=&slug=ssbingo&button_colour=FFDD00&font_colour=000000&font_family=Cookie&outline_colour=000000&coffee_colour=ffffff" /></a>
</p>

## Adaptador futterautomat para ioBroker

Control para comederos automáticos (modificados). El adaptador enciende y apaga hasta
**5 interruptores de libre elección** (objetos de ioBroker existentes) según una programación
durante una duración configurable («alimentación»). Opcionalmente se tienen en cuenta la
temperatura del aire y del agua, y con las coordenadas geográficas se calcula la posición del
sol para no alimentar de noche.

### Funciones

* Hasta 5 interruptores, cada uno con un nombre libre (= su propia pestaña de configuración).
* Dos modos de alimentación por interruptor:
  * **Horas fijas** (p. ej. 08:00 y 18:00).
  * **Intervalo dentro de una ventana horaria** (p. ej. cada 60 min entre 08:00 y 18:00).
* **Duración de alimentación en segundos** configurable por interruptor.
* **Bloqueo por temperatura**: bloquear la alimentación por debajo o por encima de
  temperaturas de agua y/o aire de libre elección.
* **Protección nocturna** mediante amanecer/atardecer con desfase configurable (mañana/tarde).
* **Activación manual** (`feedNow`) por interruptor y un **botón «Alimentar ahora»** con
  duración seleccionable; opcionalmente ignorando todos los bloqueos.
* **Supervisión de conmutación** por interruptor: verifica que el interruptor realmente se
  encienda y se apague (requiere un interruptor que informe su estado, `ack=true`), con
  **notificaciones de Telegram** opcionales (alimentación correcta / no realizada / fallo de
  apagado).

### Configuración

**Pestaña «Ajustes generales»**
* **Ubicación (obligatoria)**: usar los ajustes del sistema *o* definirla específicamente –
  mediante búsqueda de dirección y un marcador en un mapa de OpenStreetMap (sin clave API).
* **Ventana solar**: desfases en minutos después del amanecer / antes del atardecer.
* **Fuentes de temperatura**: activar la temperatura del aire y del agua y elegir el objeto
  correspondiente.
* **Interruptores**: añadir interruptores (máx. 5), nombrarlos, seleccionar el objeto, activar.

**Pestaña por interruptor** (creada dinámicamente, con el nombre del interruptor)
* Modo (horas fijas / intervalo), horas o ventana + intervalo, duración de alimentación,
  bloqueo por temperatura, opciones de noche/manual, supervisión de conmutación, notificaciones
  de Telegram, botón de alimentación manual.

### Puntos de datos

Global:
* `info.connection` – adaptador en funcionamiento / configuración válida
* `airTemperature`, `waterTemperature` – temperaturas medidas actualmente
* `sunrise`, `sunset` – horas calculadas

Por interruptor en `switches.<id>.`:
* `feedingActive` – alimentación en curso
* `lastFeeding`, `nextFeeding` – última / próxima alimentación
* `blocked`, `blockReason` – bloqueado actualmente + motivo
* `lastResult`, `error` – resultado del último intento + indicador de fallo
* `feedNow` – activación manual (escribible)

> Nota: la búsqueda de direcciones/geocodificación (Nominatim) y los mosaicos del mapa
> requieren acceso a Internet. La geocodificación se ejecuta en el backend del adaptador; la
> instancia debe estar en ejecución.

---

📖 [Documentación principal (inglés)](../../README.md)
