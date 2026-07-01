![Logo](../../admin/automatic-feeder.png)
# ioBroker.automatic-feeder

<p align="center">
  <a href="https://www.buymeacoffee.com/ssbingo"><img src="https://img.buymeacoffee.com/button-api/?text=Buy%20me%20a%20coffee&emoji=&slug=ssbingo&button_colour=FFDD00&font_colour=000000&font_family=Cookie&outline_colour=000000&coffee_colour=ffffff" /></a>
</p>

## Adaptador automatic-feeder para ioBroker

Este adaptador convierte cualquier interruptor de ioBroker ya existente (un enchufe, un relé, una
salida GPIO …) en un **comedero automático controlado por tiempo**. Enciende la salida a las horas
que tú definas durante una cantidad determinada de segundos y puede tener en cuenta la temperatura
así como el cambio día/noche, de modo que nunca se alimente en el momento equivocado.

Este documento es una guía completa. Si nunca has usado el adaptador, léelo de arriba a abajo: el
**Inicio rápido** te lleva en pocos minutos a la primera alimentación, y el resto explica cada
ajuste en detalle.

---

## Índice

1. [Qué hace el adaptador](#1-qué-hace-el-adaptador)
2. [Requisitos](#2-requisitos)
3. [Instalación](#3-instalación)
4. [Inicio rápido](#4-inicio-rápido--la-primera-alimentación)
5. [La página de ajustes en detalle](#5-la-página-de-ajustes-en-detalle)
6. [Objetos / puntos de datos](#6-objetos--puntos-de-datos)
7. [Ejemplos / recetas](#7-ejemplos--recetas)
8. [Notificaciones de Telegram](#8-notificaciones-de-telegram)
9. [Solución de problemas y preguntas frecuentes](#9-solución-de-problemas-y-preguntas-frecuentes)
10. [Registro y diagnóstico](#10-registro-y-diagnóstico)

---

## 1. Qué hace el adaptador

Una «alimentación» es en esencia muy sencilla: **salida ENCENDIDA → esperar una cantidad ajustable
de segundos → APAGAR de nuevo**. En un comedero automático reconvertido, durante ese tiempo el
motor funciona y dispensa comida.

El adaptador gestiona **hasta 5 interruptores**, cada uno completamente independiente y con su propia
pestaña de configuración, denominada según el interruptor. Para cada interruptor defines:

* **cuándo** se alimenta: ya sea a **horas fijas** (p. ej. 08:00 y 18:00) o por **intervalo**
  dentro de una ventana de tiempo (p. ej. cada 60 minutos entre las 08:00 y las 18:00);
* **cuánto tiempo** permanece encendida la salida (duración de la alimentación en segundos);
* **si se bloquea** cuando la temperatura del agua o del aire es demasiado baja/alta;
* **si por la noche** no se alimenta (basándose en el orto y el ocaso reales para tu
  ubicación);
* **si se supervisa el proceso de conmutación** (comprobación de si realmente se encendió y
  apagó) y, opcionalmente, se envía un mensaje de **Telegram** con el resultado.

Puedes activar una alimentación **manualmente** en cualquier momento: directamente en la página de
ajustes (botón con duración de libre elección) o mediante un punto de datos (p. ej. un botón en una
vista de VIS).

> Importante: el adaptador no crea el interruptor por sí mismo. **Controla un objeto ya existente**
> en tu ioBroker. Ese objeto lo seleccionas en la configuración.

---

## 2. Requisitos

| Necesitas | Detalles |
|-------------|---------|
| **ioBroker** con **admin** actual (≥ 7) | La página de configuración está implementada con React. |
| **Un objeto interruptor** | Un punto de datos de ioBroker escribible que encienda/apague el comedero automático, p. ej. un enchufe (`shelly.0.…`, `sonoff.0.…`, `zigbee.0.…`), un relé o una variable de script. |
| **Coordenadas geográficas** | Para el cálculo del orto y el ocaso. Ya sea desde los ajustes del sistema de ioBroker o mediante dirección/mapa. **Obligatorio.** |
| *(opcional)* Objetos de temperatura | Puntos de datos existentes con la temperatura del aire o del agua, si quieres bloquear en función de la temperatura. |
| *(opcional)* Una instancia de **Telegram** | El adaptador oficial `telegram`, configurado e iniciado, si quieres notificaciones push. |
| Acceso a Internet en el host de ioBroker | Solo para la búsqueda de direcciones/mapa en la configuración. El funcionamiento normal se realiza sin conexión. |

---

## 3. Instalación

1. En el **admin** de ioBroker, abre la pestaña **Adaptadores** (Adapter).
2. Busca **automatic-feeder** en la lista de adaptadores y haz clic en **Instalar**.
3. Crea una **instancia** del adaptador.
4. Abre los ajustes de la instancia (icono de engranaje): debería aparecer la página de
   configuración con la pestaña **Ajustes básicos** (Grundeinstellungen). Si permanece vacía,
   consulta [Solución de problemas](#9-solución-de-problemas-y-preguntas-frecuentes).

---

## 4. Inicio rápido – la primera alimentación

Objetivo: que un interruptor alimente, de inmediato y a modo de prueba, durante 5 segundos.

1. **Abre los ajustes** de la instancia de automatic-feeder.
2. En la pestaña **Ajustes básicos** (Grundeinstellungen):
   * En **Ubicación** (Standort), deja que se *adopten los ajustes del sistema* si tu ioBroker ya
     tiene coordenadas. De lo contrario, elige *Establecer ubicación específica*, introduce la
     dirección, haz clic en **Buscar** y confirma el marcador en el mapa.
   * Desplázate hacia abajo hasta **Interruptores** (Schalter) y haz clic en **Añadir interruptor**.
   * Asigna un **nombre** (p. ej. `Koi-Teich`). Este nombre pasa a ser el título de una pestaña
     propia.
   * Junto a **Objeto interruptor** (Schalter-Objekt), haz clic en el icono de lista y elige el
     punto de datos que conmuta tu comedero (p. ej. tu enchufe). El interruptor debe estar
     **activo** (casilla a la izquierda).
3. **Guarda** (disquete/marca de verificación abajo). Aparece una nueva pestaña con el nombre de tu
   interruptor.
4. Abre esa **pestaña del interruptor**. Arriba del todo, en **Alimentación manual**, ajusta una
   duración (p. ej. `5` segundos) y haz clic en **Alimentar ahora**. La salida debería encenderse
   durante 5 segundos y luego apagarse de nuevo.
5. En la misma pestaña, configura el horario real en **Plan de alimentación** (p. ej. horas fijas
   08:00 y 18:00) y establece la **duración de la alimentación** en **Proceso de alimentación**,
   luego **Guarda**.

Listo: a partir de ahora el adaptador alimenta automáticamente. Todo lo demás explica las opciones
en detalle.

---

## 5. La página de ajustes en detalle

La configuración tiene una pestaña **Ajustes básicos** (Grundeinstellungen) así como **una pestaña
por interruptor** (se crea automáticamente en cuanto un interruptor tiene un nombre). Si una página
no se desplaza, agranda la ventana o usa la barra de desplazamiento de la derecha: todas las
secciones son accesibles.

### 5.1 Pestaña «Ajustes básicos» (Grundeinstellungen)

#### Ubicación (obligatorio)

El adaptador necesita tu posición geográfica para calcular el orto y el ocaso (para el bloqueo
nocturno). Dos posibilidades:

* **Adoptar los ajustes del sistema** (Systemeinstellungen übernehmen): toma la latitud/longitud de
  la configuración del sistema de ioBroker (recomendado si ya está establecida allí). Se muestran
  los valores actuales.
* **Establecer ubicación específica** (Standort spezifisch festlegen): determinar la posición uno
  mismo:
  * Introduce una **dirección** y pulsa **Buscar**. El adaptador la resuelve (mediante
    OpenStreetMap / Nominatim) y coloca un marcador.
  * O bien **haz clic en el mapa** / **arrastra el marcador** para elegir el punto exacto.
  * La latitud/longitud también se pueden introducir directamente; el mapa las sigue.

> La búsqueda de direcciones se ejecuta en el backend del adaptador, por lo que la **instancia debe
> estar en ejecución**. El mapa y la búsqueda requieren acceso a Internet.

#### Ventana solar (sin alimentación por la noche)

Establece la ventana de tiempo en la que se permite alimentar:

* **Minutos después del orto** (Sonnenaufgang): empezar a alimentar solo tantos minutos *después*
  del orto.
* **Minutos antes del ocaso** (Sonnenuntergang): dejar de alimentar tantos minutos *antes* del
  ocaso.

Ejemplo: con un orto a las 06:30, un ocaso a las 21:00 y desfases de 30 / 30, la alimentación solo
se permite **entre las 07:00 y las 20:30**. Cada interruptor puede tener en cuenta esta ventana de
forma individual o ignorarla (consulta *Restricciones* en la pestaña del interruptor). Las horas
calculadas figuran además en los puntos de datos `sunrise` / `sunset` y se recalculan
automáticamente cada noche.

#### Fuentes de temperatura

Para el bloqueo en función de la temperatura, activa aquí las fuentes y elige los objetos:

* **Temperatura del aire** (Lufttemperatur): marca la casilla y selecciona el punto de datos con la
  temperatura del aire.
* **Temperatura del agua** (Wassertemperatur): marca la casilla y selecciona el punto de datos con
  la temperatura del agua.

Solo tienen sentido los puntos de datos numéricos. Los valores actuales se reflejan en los puntos de
datos `airTemperature` / `waterTemperature`. Los umbrales propiamente dichos se establecen **por
interruptor** (consulta *Bloqueo por temperatura*).

#### Interruptores

La lista de comederos automáticos (hasta 5). Por cada entrada:

* **Activo** (casilla): solo se planifican los interruptores activos.
* **Nombre**: texto libre; pasa a ser el título de la pestaña del interruptor y el nombre del canal
  en el árbol de objetos.
* **Objeto interruptor** (Schalter-Objekt): el punto de datos de ioBroker existente que se controla.
  Selecciónalo mediante el icono de lista; vacíalo con la cruz.

Con **Añadir interruptor** creas uno más (máx. 5); con el icono de la papelera eliminas uno. Al
eliminarlo también se borran sus puntos de datos.

### 5.2 Pestañas de interruptor

Cada interruptor configurado recibe su propia pestaña con su nombre. Contiene las siguientes
secciones.

#### Alimentación manual

* **Duración de la alimentación manual (segundos)**: la duración que utiliza el botón.
* **Alimentar ahora**: activa de inmediato una alimentación con esa duración. Práctico para probar o
  para una ración extra. (Que se ignoren los bloqueos depende de *El activador manual ignora todos
  los bloqueos* en *Restricciones*.)
* Para el botón, la instancia debe estar en ejecución y la configuración **guardada**.

#### Plan de alimentación

Elige **un** modo:

* **Horas fijas**: una lista de horas (`HH:mm`). Añade tantas como quieras; el comedero funciona a
  diario a cada una de ellas. Ejemplo: `08:00` y `18:00`.
* **Intervalo dentro de un periodo**: alimentar repetidamente dentro de una ventana:
  * **Inicio del periodo** / **Fin del periodo**: p. ej. de 08:00 a 18:00.
  * **Intervalo (minutos)**: p. ej. 60 → alimenta a diario a las 08:00, 09:00, … hasta el final de
    la ventana.

La siguiente hora planificada figura en todo momento en el punto de datos `nextFeeding`.

#### Proceso de alimentación

* **Duración de la alimentación (segundos)**: cuánto tiempo permanece ENCENDIDA la salida en una
  alimentación planificada.
* **Valor de encendido** / **Valor de apagado**: los valores que se escriben en el objeto
  interruptor. Por defecto son `true` y `false`, lo que encaja con la mayoría de enchufes/relés. Si
  tu dispositivo espera números o texto, introduce aquí p. ej. `1` / `0` o `ON` / `OFF`.

#### Bloqueo por temperatura

Solo se muestra para las fuentes de temperatura activadas en los ajustes básicos. Por cada
interruptor:

* **Bloquear según la temperatura del agua**: *Bloquear si está por debajo de* o *Bloquear si está
  por encima de* (°C).
* **Bloquear según la temperatura del aire**: lo mismo para el aire.

Si la temperatura actual está fuera del rango permitido, la alimentación se omite y el motivo se
escribe en `blockReason`. (Si un valor de temperatura es desconocido, esa fuente no bloquea.)

#### Restricciones

* **No alimentar por la noche**: tiene en cuenta la ventana solar (incluidos los desfases).
  Desactívalo si este interruptor puede alimentar las 24 horas.
* **El activador manual ignora todos los bloqueos**: si está activo, el botón y el punto de datos
  `feedNow` alimentan incluso con un bloqueo por temperatura/nocturno activo.

#### Pausa de invierno

Para cada interruptor puedes definir una **pausa de invierno** recurrente (estacional, como fechas `MM-DD` que se repiten cada año y pueden cruzar el Año Nuevo).

* **Activar la pausa de invierno** – activar la pausa.
* **Inicio / Fin del invierno** – elige el día y el mes en un calendario (se muestra como dd.mm), p. ej. del 01.11 al 15.03.
* **Modo** – durante la pausa, **suspender la alimentación**, alimentar con un intervalo propio **reducido** o **una vez al día** a una hora fija; se aplica una **duración de alimentación de invierno** propia.
* **Recordatorios (Telegram)** – en los días previos al inicio y al fin se envía cada día (la última vez el mismo día) un recordatorio a la hora configurada. Necesita una instancia de Telegram (ver abajo).

El estado actual se muestra en el punto de datos `winterActive`. La alimentación se reanuda automáticamente al terminar la pausa.

#### Supervisión de la conmutación

Tras la conmutación, el adaptador puede comprobar si el interruptor ha alcanzado **realmente** el
estado de encendido y apagado, y notifica por cada alimentación uno de tres resultados:

| Resultado | Significado | Mensaje |
|----------|-----------|---------|
| ✅ Éxito | El interruptor se encendió y apagó como se esperaba | „Alimentación activada durante x s." |
| ❌ Encendido fallido | El interruptor nunca confirmó el estado de ENCENDIDO | „No se pudo realizar la alimentación. ¡Compruebe el interruptor!" |
| ❌ Apagado fallido | Se encendió, pero no volvió a apagarse | „Avería: ¡el comedero no se apagó!" |

> El mensaje se envía en el idioma del sistema de ioBroker configurado (inglés de forma predeterminada).


* **Comprobar si el interruptor realmente se enciende y apaga**: activa la supervisión.
* **Tiempo de espera de la supervisión (segundos)**: cuánto tiempo se espera la confirmación.
* **Intentos de verificación**: cuántas recomprobaciones escalonadas se realizan antes de informar de una avería (3 por defecto). Cada intento también vuelve a leer el estado actual, de modo que una respuesta retardada (p. ej., radio Homematic) ya no provoca una avería falsa.

> **Importante:** la supervisión solo funciona si el interruptor **informa de su estado real**, es
> decir, si el objeto de destino se actualiza con `ack=true` (típico de enchufes/relés con
> retroalimentación de estado). Un simple booleano auxiliar que nadie confirma notificaría siempre
> una avería; en ese caso, desactiva la supervisión para ese interruptor.

El resultado figura además en los puntos de datos `lastResult` (texto) y `error` (booleano), de modo
que puedas reaccionar ante él (p. ej. activar una notificación propia).

#### Notificaciones de Telegram

Envía los mensajes de la supervisión de la conmutación a Telegram, configurado **por interruptor**:

* **Instancia de Telegram**: elige una de las instancias `telegram.*` instaladas (o *Ninguna*, para
  desactivar Telegram en ese interruptor). Si no hay ninguna instalada, el campo lo indica.
* **Destinatario de Telegram (opcional)**: un nombre concreto de usuario/chat, tal como está
  configurado en el adaptador de telegram; déjalo vacío para enviar a todos los destinatarios
  configurados.
* **Casillas de verificación**: selecciona qué mensajes se envían: alimentación exitosa, no
  realizable o avería del apagado.

La configuración completa se encuentra en [Notificaciones de Telegram](#8-notificaciones-de-telegram).

---

## 6. Objetos / puntos de datos

El adaptador crea los siguientes puntos de datos en su espacio de nombres
(`automatic-feeder.<instanz>.`).

**Global**

| Punto de datos | Tipo | Significado |
|------------|-----|-----------|
| `info.connection` | boolean (ro) | El adaptador está en ejecución y la configuración es válida. |
| `airTemperature` | number (ro) | Reflejo de la fuente de temperatura del aire configurada. |
| `waterTemperature` | number (ro) | Reflejo de la fuente de temperatura del agua configurada. |
| `sunrise` / `sunset` | string (ro) | Orto/ocaso calculados para hoy. |

**Por interruptor bajo `switches.<id>.`** (`<id>` es un ID interno como `sw-0`)

| Punto de datos | Tipo | Significado |
|------------|-----|-----------|
| `feedingActive` | boolean (ro) | En este momento hay una alimentación en curso. |
| `lastFeeding` | string (ro) | Momento de la última alimentación. |
| `nextFeeding` | string (ro) | Momento de la próxima alimentación planificada. |
| `blocked` | boolean (ro) | El último intento estaba bloqueado. |
| `blockReason` | string (ro) | Motivo del bloqueo (noche/temperatura). |
| `lastResult` | string (ro) | Texto del resultado del último intento de alimentación. |
| `error` | boolean (ro) | El último intento tuvo una avería de conmutación. |
| `feedNow` | boolean (rw) | Escribir `true` para alimentar manualmente. |

Estos puntos de datos pueden utilizarse en VIS, scripts u otros adaptadores, p. ej. mostrar
`nextFeeding` en un panel o activar una alarma propia cuando `error = true`.

---

## 7. Ejemplos / recetas

**Estanque de koi, dos veces al día, solo con suficiente calor**
* Modo *Horas fijas* → `08:00`, `18:00`; duración `6` s.
* Activa la temperatura del agua en los ajustes básicos, luego en la pestaña del interruptor
  *Bloquear según la temperatura del agua* → *Bloquear si está por debajo de* `8` °C (sin
  alimentación con el agua demasiado fría).
* *No alimentar por la noche* activado.

**Aviario, raciones pequeñas frecuentes durante el día**
* Modo *Intervalo dentro de un periodo* → 07:00–19:00, intervalo `90` min; duración `3` s.

**Ración extra manual mediante un botón de VIS**
* Crea en VIS un botón que escriba `true` en `automatic-feeder.0.switches.sw-0.feedNow`.
* Opcionalmente activa *El activador manual ignora todos los bloqueos* para que siempre se alimente.

---

## 8. Notificaciones de Telegram

1. Instala y configura el adaptador **telegram** (crea un bot con @BotFather, introduce el token,
   inicia un chat con el bot). La instancia de Telegram debe estar **en ejecución**.
2. En una **pestaña de interruptor** de automatic-feeder, abre la sección **Notificaciones de
   Telegram**:
   * Selecciona la **instancia de Telegram** en el desplegable (p. ej. `telegram.0`).
   * Opcionalmente, introduce un **destinatario** (el nombre de usuario/chat que se muestra en el
     adaptador de telegram); déjalo vacío para notificar a todos.
   * Marca los mensajes deseados: *alimentación exitosa*, *no realizable*, *avería del apagado*.
3. Guarda. A partir de ahora, los resultados de supervisión elegidos se envían a Telegram (con el
   nombre del interruptor delante). El requisito es que la *supervisión de la conmutación* esté
   activada para ese interruptor.

---

## 9. Solución de problemas y preguntas frecuentes

**La página de ajustes está vacía / en blanco.**
Recarga el navegador con **Ctrl+Shift+R**. Si el problema persiste, reinicia la instancia y vuelve a
abrir los ajustes.

**El nuevo icono / un cambio no aparece.**
Caché del navegador. Recarga de forma forzada con **Ctrl+Shift+R**.

**No se alimenta en absoluto.**
Comprueba en orden: el interruptor está **Activo**; hay un **objeto interruptor** seleccionado; el
**horario** es válido (`nextFeeding` muestra una hora); no está **bloqueado** (revisa `blocked` /
`blockReason`); la **ventana solar** no excluye la hora; pon el **nivel de registro** de la
instancia en `debug` y observa el registro.

**Nunca se alimenta de noche, aunque yo quiero.**
O bien desactiva *No alimentar por la noche* para ese interruptor, o bien ajusta los desfases
solares. Sin coordenadas válidas, el bloqueo nocturno está desactivado (y se registra una
advertencia).

**La supervisión notifica siempre una avería.**
Tu objeto interruptor probablemente no informe de su estado real (`ack=true`). O bien usa un
interruptor con retroalimentación de estado, o bien desactiva la *supervisión de la conmutación*
para ese interruptor.

**La búsqueda de direcciones dice que la instancia debe estar en ejecución.**
Inicia la instancia de automatic-feeder: la geocodificación se ejecuta en el backend.

**Los mensajes de Telegram no llegan.**
¿Hay una instancia de Telegram seleccionada en la pestaña del interruptor? ¿Está el adaptador de
telegram configurado e iniciado? ¿Hay al menos un tipo de mensaje marcado y la *supervisión de la
conmutación* activada?

---

## 10. Registro y diagnóstico

El adaptador registra en los niveles habituales de ioBroker. Para mensajes detallados, sube el nivel
de registro de la instancia (Instancias → automatic-feeder.x → nivel de registro) a **debug** o
**silly**:

* **error**: errores que requieren atención (p. ej. fallo al escribir en el interruptor).
* **warn**: configuración incorrecta (sin coordenadas, horario no válido …).
* **info**: hitos (inicio, una alimentación ejecutada o bloqueada, activador manual).
* **debug**: desarrollo detallado (decisiones de planificación, actualizaciones de temperatura,
  geocodificación, valores de encendido/apagado, verificación confirmada/tiempo de espera agotado).
* **silly**: rastreo muy detallado (cada temporizador, cada comprobación de bloqueo, cada cambio de
  estado).

---

📖 [Documentación principal (inglés)](../../README.md)
