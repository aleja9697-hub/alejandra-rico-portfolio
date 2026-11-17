# VIDEOO EDITING

Ruta: `/videos/`. Archivo generado: `site/videos/index.html`.

Toda la configuración vive en `videoPage`, en `content/site.mjs`.

## Categorías y videos

- Portadas asignadas: `site/img/videos/01.webp` → Campaigns, `02.webp` → Political, `03.webp` → Institutional, `04.webp` → Organizational.
- Las imágenes incluyen sus títulos gráficos: no se superpone otro título visible. Los nombres se conservan en los datos, las etiquetas accesibles y los encabezados de los paneles.
- Las tarjetas conservan la proporción 6667:4167 de las portadas y usan `contain`, sin recortar letras ni aplicar degradados a estas imágenes.
- Campaigns incluye `site/videos/campaigns/1.mp4`, `2.mp4` y `3.mp4`, en ese orden. Son videos originales verticales 1080 × 1920, sin recodificar.
- Posters: `site/img/videos/campaigns/01.webp`–`03.webp`, fotogramas reales de los respectivos videos, también 1080 × 1920.
- Los títulos provisionales son «Campaigns 01», «Campaigns 02» y «Campaigns 03», configurables en `content/site.mjs`.
- Political: `site/videos/political/10.mp4`, `11.mp4`, `12.mp4`.
- Institutional: `site/videos/Institutional/7.mp4`, `8.mp4`, `9.mp4`.
- Organizational: `site/videos/Organizational/4.mp4`, `5.mp4`, `6.mp4`.
- Las cuatro categorías tienen tres videos cada una, en el orden numérico indicado: doce en total. Se conservan las mayúsculas de las carpetas originales.
- Posters reales adicionales: `site/img/videos/political/10.webp`–`12.webp`, `site/img/videos/institutional/07.webp`–`09.webp`, `site/img/videos/organizational/04.webp`–`06.webp`.

## Build de esta publicación

`node build.mjs --videos-only` regenera `/videos/` y conserva las páginas aprobadas que ya están en `site/`. Vercel utiliza este modo para esta publicación: el generador completo tiene diferencias anteriores ajenas a VIDEOO EDITING. `node build.mjs` sigue disponible para regenerar el sitio completo; revisar esas diferencias antes de utilizarlo para otra publicación.

Los originales de Institutional 7 y 8 y Organizational 4 y 6 se respaldan fuera de Git en `C:\ProyectosWeb\video-editing-originals`, con verificación SHA-256. Solo sus versiones web optimizadas se incluyen en el sitio. No incorporar esa carpeta al repositorio.

Optimización FFmpeg: H.264, preset medium, yuv420p, AAC estéreo 160 kb/s, faststart. CRF 26 para Institutional 7; CRF 25 para los otros tres. Se conserva 1080 × 1920, 30 fps, el número de cuadros y la duración. Se comprobaron la decodificación completa y muestras comparativas al 10 %, 50 % y 90 % de cada video.

| Video | Original (bytes) | Web (bytes) |
| --- | ---: | ---: |
| Institutional/7.mp4 | 258044152 | 89717567 |
| Institutional/8.mp4 | 104047535 | 44132423 |
| Organizational/4.mp4 | 184399728 | 82562966 |
| Organizational/6.mp4 | 134655111 | 62398739 |

Se priorizó conservar la calidad visual sobre alcanzar 50 MB en todos los archivos. Todos quedan por debajo de 100 MB decimales y del límite de GitHub de 100 MiB.

## Portada actual

Video proporcionado: `site/media/videos/1116.mp4` (854 × 480 px, aproximadamente 7,7 segundos). Se conserva el archivo original sin recodificar. La imagen `site/img/videos/hero.webp` es un fotograma del mismo video y funciona como respaldo. Ambos están configurados en `videoPage`. Para mayor nitidez en pantallas grandes puede sustituirse posteriormente por una exportación de mayor resolución.

Las imágenes pueden ser WebP, JPG o PNG. Los posters de cada video deben ser verticales 9:16. El hero usa `cover`; las portadas de categoría y los videos usan `contain`, sin deformaciones.

## Integración

Guardar portadas, por ejemplo, en `site/img/videos/` y videos en `site/media/videos/`. Las rutas de configuración son relativas a `site/`, sin barra inicial.

En cada uno de los tres objetos de `videos` de una categoría, completar:

```js
{
  title: 'Título real del proyecto',
  src: 'media/videos/campaigns/01.mp4',
  poster: 'img/videos/campaigns/01.webp',
}
```

Este ejemplo documenta el formato: esos archivos no se han creado ni se solicitan desde la página. Mantener `src: null` hasta que el video exista. El build verifica que los archivos configurados existan y requiere título para cada video.

Ejecutar `node build.mjs` después de configurar los archivos reales.

La portada admite `heroVideo: 'media/videos/hero.mp4'` y `heroImage: 'img/videos/hero.webp'`. El video se reproduce automáticamente, muteado, en loop y con `playsinline`. La imagen queda debajo como respaldo si falla la reproducción. Un control permite pausarlo; con movimiento reducido se conserva inicialmente la imagen. No configurar rutas hasta que los archivos existan.

## Comportamiento

Solo hay un panel modal compartido. Las cuatro categorías lo abren con su propio contenido. El cierre visible y Escape regresan el foco a la tarjeta que abrió el panel. El navegador mantiene el foco dentro del modal y la página de fondo queda bloqueada.

Los reproductores solo se insertan al abrir la categoría correspondiente; usan controles HTML5, `playsinline` y `preload="none"`, sin autoplay. Al reproducir uno, se pausan los otros de la categoría. Al cerrar, se pausan y se retiran del documento.

Mientras no haya videos reales configurados, se muestra únicamente el estado «Coming soon», sin reproductores vacíos ni solicitudes a MP4 inexistentes.
