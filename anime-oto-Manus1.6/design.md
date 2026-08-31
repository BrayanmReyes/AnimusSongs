# Diseño de interfaz — Anime Oto

## Dirección del producto

Anime Oto es un explorador editorial para descubrir qué anime sale hoy y convertir cada estreno en una entrada musical. La experiencia está pensada para uso con una mano, navegación vertical y lectura rápida: primero el día y la temporada, después la ficha y finalmente el OP/ED.

## Pantallas

| Pantalla | Contenido principal | Funcionalidad |
| --- | --- | --- |
| **Inicio / Esta temporada** | Encabezado con temporada actual, selector de día, lista de estrenos y una tarjeta destacada. | Cambiar el día, abrir un anime, guardar como favorito y reproducir un video oficial. |
| **Calendario** | Vista semanal de lunes a domingo con cantidad de estrenos y tarjetas por día. | Saltar directamente a un día y consultar su programación. |
| **Biblioteca** | Favoritos guardados y estado vacío cuando todavía no hay una colección. | Quitar favoritos y abrir el detalle. |
| **Detalle de anime** | Hero con portada, título japonés/romanji, sinopsis, metadatos y sección de canciones. | Guardar, abrir OP/ED y elegir entre título romanji o japonés. |
| **Reproductor oficial** | Hoja/modal con miniatura del video, artista, canción y aviso de que se abrirá la fuente oficial. | Abrir YouTube en navegador del sistema y volver a la ficha. |

## Flujos clave

### Descubrir el estreno de hoy

El usuario entra en **Inicio**, ve la temporada actual y el día seleccionado automáticamente. Toca una tarjeta de anime, revisa sus detalles y puede tocar **Ver OP oficial** o **Ver ED oficial**.

### Explorar por otro día

El usuario toca **Calendario** en la barra inferior, selecciona un día y vuelve a la lista filtrada de Inicio con ese día activo.

### Guardar una serie

Desde una tarjeta o desde el detalle, el usuario toca el botón de guardar. El icono cambia de estado con feedback háptico y el anime aparece en **Biblioteca**. La persistencia será local con AsyncStorage, sin requerir cuenta.

### Reproducir una canción

En la ficha, el usuario elige OP o ED. La app muestra una hoja con la canción, intérprete y fuente. El CTA abre el enlace oficial de YouTube mediante el navegador del sistema; no se incrusta ni redistribuye el video.

## Lenguaje visual

La marca usa una estética nocturna de club musical: fondo **#0B0A12**, superficies **#151322**, texto marfil **#F7F4FF**, violeta eléctrico **#A78BFA** como color principal y coral **#FF7A90** como acento para etiquetas y favoritos. Los gradientes se reservan para el hero; las tarjetas son mate, con radios de 22 px y bordes de baja opacidad.

La tipografía prioriza jerarquía editorial: títulos grandes y compactos, metadatos pequeños en mayúsculas y etiquetas tipo cápsula. Las acciones primarias tienen una altura mínima de 48 px y feedback de escala sutil; las listas usan FlatList y todo el contenido respeta Safe Area.

## Datos y alcance inicial

La primera versión usa un catálogo local tipado con títulos reales, portadas remotas y enlaces oficiales de YouTube para demostrar el flujo completo. El modelo separa `Anime`, `Song` y `ScheduleDay`, de modo que el catálogo pueda conectarse después a una fuente en vivo sin rehacer la interfaz. Cada anime incluye `year` y `season`; el usuario puede alternar año y temporada desde una hoja de selección histórica, mientras Inicio conserva por defecto la temporada actual.

Los videos se almacenan como URLs `watch?v=` directas, no como consultas de YouTube. La interfaz etiqueta el canal o fuente verificada y abre el video elegido mediante `expo-web-browser`, con retorno natural a la ficha.
