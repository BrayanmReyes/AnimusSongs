# Fuente de catálogo estacional

La documentación pública de Jikan describe el recurso estacional como un endpoint que acepta año y temporada; la documentación específica es https://docs.jikan.moe/usage/seasonal/.

El endpoint REST probado fue `https://api.jikan.moe/v4/seasons/2025/summer?page=1`. En esta prueba respondió `504 BadResponseException` indicando que Jikan no pudo conectar con MyAnimeList. Por esto la integración debe tolerar errores, mostrar reintento y conservar un caché/fallback local; no debe asumir que cada petición remota estará disponible.

El contrato esperado de la API incluye `data`, `pagination`, campos de anime como `mal_id`, títulos, imágenes, `type`, `episodes`, `status`, `aired`, `duration`, `score`, `genres`, `studios`, `broadcast` y `themes`. Las fichas detalladas pueden consultar `https://api.jikan.moe/v4/anime/{mal_id}/full` para obtener `theme.openings` y `theme.endings`; cuando un video oficial exista, el modelo debe convertir su `youtube_id` a `https://www.youtube.com/watch?v={youtube_id}`.
