/* eslint-disable @typescript-eslint/no-explicit-any */
import { animeCatalog, type Anime, type Season, type Song, type Weekday } from "@/lib/anime-data";

const JIKAN_BASE = "https://api.jikan.moe/v4";
const ANILIST_BASE = "https://graphql.anilist.co";
const ANIMETHEMES_BASE = "https://api.animethemes.moe";
const PAGE_SIZE = 25;

const seasonSlugs: Record<Season, string> = { Invierno: "winter", Primavera: "spring", Verano: "summer", Otoño: "fall" };
const seasonEnums: Record<Season, string> = { Invierno: "WINTER", Primavera: "SPRING", Verano: "SUMMER", Otoño: "FALL" };
const weekdayMap: Record<string, Weekday> = { Monday: "Lunes", Tuesday: "Martes", Wednesday: "Miércoles", Thursday: "Jueves", Friday: "Viernes", Saturday: "Sábado", Sunday: "Domingo", Mondays: "Lunes", Tuesdays: "Martes", Wednesdays: "Miércoles", Thursdays: "Jueves", Fridays: "Viernes", Saturdays: "Sábado", Sundays: "Domingo" };

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(url, { ...init, signal: controller.signal, headers: { Accept: "application/json", ...(init?.headers ?? {}) } });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return (await response.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

function toWeekday(day?: string | null): Weekday {
  return (day && weekdayMap[day]) || "Sin horario";
}

function mapJikanAnime(item: any): Anime {
  const malId = Number(item.mal_id);
  return {
    id: `mal-${malId}`,
    malId,
    titleRomanji: item.title || item.title_english || "Título sin nombre",
    titleJapanese: item.title_japanese || "",
    shortTitle: item.title || item.title_english || "Título sin nombre",
    synopsis: item.synopsis || "La sinopsis todavía no está disponible.",
    image: item.images?.jpg?.large_image_url || item.images?.jpg?.image_url || "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=900&q=85",
    accent: "#A78BFA",
    day: toWeekday(item.broadcast?.day),
    time: item.broadcast?.time || "Horario no indicado",
    genres: (item.genres || []).slice(0, 3).map((genre: any) => genre.name),
    studio: item.studios?.[0]?.name || "Estudio no indicado",
    episodes: item.episodes ? `${item.episodes} episodios` : "Episodios por anunciar",
    year: item.year || new Date(item.aired?.from || Date.now()).getFullYear(),
    season: item.season ? ({ winter: "Invierno", spring: "Primavera", summer: "Verano", fall: "Otoño" } as Record<string, Season>)[item.season] : "Verano",
    songs: [],
    source: "jikan",
    status: item.status || "",
    format: item.type || "",
    popularity: item.popularity,
  };
}

function weekdayFromUnix(timestamp?: number | null): Weekday {
  if (!timestamp) return "Sin horario";
  return ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"][new Date(timestamp * 1000).getDay()] as Weekday;
}

function timeFromUnix(timestamp?: number | null) {
  if (!timestamp) return "Horario no indicado";
  return new Date(timestamp * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
}

function mapAniListAnime(item: any): Anime {
  const airingAt = item.airingSchedule?.nodes?.[0]?.airingAt || item.nextAiringEpisode?.airingAt;
  return {
    id: `anilist-${item.id}`,
    anilistId: Number(item.id),
    malId: item.idMal ? Number(item.idMal) : undefined,
    titleRomanji: item.title?.romaji || item.title?.english || "Título sin nombre",
    titleJapanese: item.title?.native || "",
    shortTitle: item.title?.romaji || item.title?.english || "Título sin nombre",
    synopsis: (item.description || "La sinopsis todavía no está disponible.").replace(/<[^>]*>/g, ""),
    image: item.coverImage?.extraLarge || item.coverImage?.large || "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=900&q=85",
    accent: "#A78BFA",
    day: weekdayFromUnix(airingAt),
    time: airingAt ? timeFromUnix(airingAt) : item.nextAiringEpisode ? `Episodio ${item.nextAiringEpisode.episode}` : "Horario no indicado",
    genres: (item.genres || []).slice(0, 3),
    studio: item.studios?.nodes?.[0]?.name || "Estudio no indicado",
    episodes: item.episodes ? `${item.episodes} episodios` : "Episodios por anunciar",
    year: Number(item.seasonYear),
    season: ({ WINTER: "Invierno", SPRING: "Primavera", SUMMER: "Verano", FALL: "Otoño" } as Record<string, Season>)[item.season] || "Verano",
    songs: [],
    source: "anilist",
    status: item.status || "",
    format: item.format || "",
    popularity: item.popularity,
    siteUrl: item.siteUrl,
  };
}

async function fetchJikanSeason(year: number, season: Season) {
  const all: Anime[] = [];
  for (let page = 1; page <= 3; page += 1) {
    const url = `${JIKAN_BASE}/seasons/${year}/${seasonSlugs[season]}?page=${page}&limit=${PAGE_SIZE}`;
    const body = await fetchJson<any>(url);
    all.push(...(body.data || []).map(mapJikanAnime));
    if (!body.pagination?.has_next_page) break;
  }
  return all;
}

const ANILIST_QUERY = `query SeasonalAnime($page: Int!, $perPage: Int!, $season: MediaSeason!, $year: Int!) { Page(page: $page, perPage: $perPage) { pageInfo { hasNextPage } media(season: $season, seasonYear: $year, type: ANIME, sort: POPULARITY_DESC) { id idMal title { romaji english native } description(asHtml: false) season seasonYear episodes coverImage { large extraLarge } genres studios(isMain: true) { nodes { name } } status format nextAiringEpisode { episode airingAt } airingSchedule(notYetAired: false, perPage: 1) { nodes { airingAt } } siteUrl } } }`;

async function fetchAniListSeason(year: number, season: Season) {
  const all: Anime[] = [];
  for (let page = 1; page <= 2; page += 1) {
    const body = await fetchJson<any>(ANILIST_BASE, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query: ANILIST_QUERY, variables: { page, perPage: 50, season: seasonEnums[season], year } }) });
    if (body.errors?.length) throw new Error(body.errors[0].message || "AniList query failed");
    const pageData = body.data?.Page;
    all.push(...(pageData?.media || []).map(mapAniListAnime));
    if (!pageData?.pageInfo?.hasNextPage || (pageData.media || []).length < 50) break;
  }
  return all;
}

function dedupeAnime(items: Anime[]) {
  return Array.from(new Map(items.map((item) => [item.id, item])).values());
}

export async function fetchSeasonAnime(year: number, season: Season) {
  try {
    const aniList = await fetchAniListSeason(year, season);
    if (aniList.length >= 1) return { items: dedupeAnime(aniList), source: "AniList" };
  } catch {
    // Jikan remains available as a second public source.
  }
  try {
    const jikan = await fetchJikanSeason(year, season);
    if (jikan.length >= 1) return { items: dedupeAnime(jikan), source: "Jikan" };
  } catch {
    // The UI handles the final fallback with a clear error state.
  }
  const local = animeCatalog.filter((anime) => anime.year === year && anime.season === season);
  if (local.length) return { items: local, source: "Catálogo local" };
  throw new Error("No fue posible cargar esta temporada. Intenta de nuevo.");
}

export async function fetchAnimeById(id: string): Promise<Anime> {
  if (id.startsWith("mal-")) {
    const malId = id.replace("mal-", "");
    const body = await fetchJson<any>(`${JIKAN_BASE}/anime/${malId}/full`);
    if (!body.data) throw new Error("No fue posible cargar el detalle del anime.");
    return mapJikanAnime(body.data);
  }
  const anilistId = id.replace("anilist-", "");
  const body = await fetchJson<any>(ANILIST_BASE, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query: `query AnimeById($id: Int!) { Media(id: $id, type: ANIME) { id idMal title { romaji english native } description(asHtml: false) season seasonYear episodes coverImage { large extraLarge } genres studios(isMain: true) { nodes { name } } status format siteUrl } }`, variables: { id: Number(anilistId) } }) });
  if (body.errors?.length || !body.data?.Media) throw new Error("No fue posible cargar el detalle del anime.");
  return mapAniListAnime(body.data.Media);
}

function buildThemeSong(theme: any, video: any): Song {
  const kind = theme.type === "ED" ? "ED" : "OP";
  const themeSlug = theme.slug || `${kind} oficial`;
  const songTitle = theme.song?.title || themeSlug;
  const artistName = theme.song?.artists?.[0]?.name || "Artista desconocido";

  return {
    id: `animethemes-${video.id}`,
    kind,
    titleRomanji: songTitle,
    titleJapanese: themeSlug,
    artist: artistName,
    youtubeUrl: video.link,
    sourceChannel: "AnimeThemes.moe"
  };
}

export async function fetchThemeSongs(malId?: number) {
  if (!malId) return [];
  const params = new URLSearchParams();
  params.set("filter[has]", "resources");
  params.set("filter[site]", "MyAnimeList");
  params.set("filter[external_id]", String(malId));
  params.set("include", "animethemes,animethemes.song,animethemes.song.artists,animethemes.animethemeentries,animethemes.animethemeentries.videos");
  const body = await fetchJson<any>(`${ANIMETHEMES_BASE}/anime?${params.toString()}`);
  const anime = body.anime?.[0];
  return (anime?.animethemes || []).flatMap((theme: any) => (theme.animethemeentries || []).flatMap((entry: any) => (entry.videos || []).map((video: any) => buildThemeSong(theme, video))));
}
