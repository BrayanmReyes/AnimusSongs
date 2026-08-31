# Fuente de temas OP/ED

AnimeThemes publica una API especializada para anime openings y endings. Su documentación está en https://api-docs.animethemes.moe/ y ofrece GraphQL además de JSON:API.

La documentación confirma que existe soporte de búsqueda, filtrado y mappings externos para asociar recursos con sitios como MyAnimeList o AniList. Esta fuente puede complementar el catálogo estacional de AniList: AniList carga la lista real y AnimeThemes resuelve temas asociados y recursos `video` reproducibles directamente desde su propia plataforma.

Se priorizará AnimeThemes para OP/ED cuando exista un recurso coincidente. Para cada tema se mostrará el nombre del tema, artista y un CTA que abre directamente la URL de AnimeThemes o la URL oficial de YouTube verificada; no se generarán URLs de búsqueda.

La guía JSON:API confirma que la base es `https://api.animethemes.moe`, que `/anime` es un endpoint válido, y que la respuesta usa un wrapper `anime` con atributos a nivel superior. Las relaciones se incluyen explícitamente con `include`, por ejemplo `/anime/{slug}?include=animethemes,series`; los temas pueden incluir recursos relacionados y videos. La guía advierte que JSON:API está deprecada, por lo que se deja aislada detrás de un adaptador para migrar a GraphQL si fuera necesario.
