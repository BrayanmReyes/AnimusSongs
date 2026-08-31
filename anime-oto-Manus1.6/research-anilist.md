# Fuente alternativa de catálogo

AniList expone una API GraphQL pública en `https://graphql.anilist.co`. Su documentación confirma que la consulta raíz `Page` acepta `page` y `perPage`, con `perPage` máximo de 50. El filtro `Media` acepta `season`, `seasonYear`, `type`, `format`, `status` y `sort`, por lo que la app puede solicitar cada combinación histórica.

La referencia de Media confirma los campos `id`, `idMal`, `title`, `description`, `season`, `seasonYear`, `episodes`, `duration`, `coverImage`, `bannerImage`, `genres`, `studios`, `nextAiringEpisode`, `externalLinks`, `streamingEpisodes` y `siteUrl`. La API no documenta un campo nativo de canciones OP/ED; esos datos se mantienen como una capa separada con enlaces oficiales verificados o se resuelven posteriormente desde Jikan/otras fuentes.

La implementación usará AniList para poblar la lista completa, solicitando hasta 50 elementos por página y siguiendo `pageInfo.hasNextPage`. Si la consulta remota falla, la interfaz mostrará reintento y un fallback local; no se volverá a presentar un único anime como si fuera la temporada completa.
