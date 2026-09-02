export type Season = "Invierno" | "Primavera" | "Verano" | "Otoño";
export type Weekday = "Lunes" | "Martes" | "Miércoles" | "Jueves" | "Viernes" | "Sábado" | "Domingo" | "Sin horario";

export type Song = {
  id: string;
  kind: "OP" | "ED";
  titleRomanji: string;
  titleJapanese: string;
  artist: string;
  youtubeUrl: string;
  sourceChannel: string;
  version?: number | null;
  resolution?: number | null;
  episodes?: string | null;
};

export type Anime = {
  id: string;
  malId?: number;
  anilistId?: number;
  source?: string;
  status?: string;
  format?: string;
  popularity?: number;
  siteUrl?: string;
  themeSlug?: string;
  titleRomanji: string;
  titleJapanese: string;
  shortTitle: string;
  synopsis: string;
  image: string;
  accent: string;
  day: Weekday;
  time: string;
  genres: string[];
  studio: string;
  episodes: string;
  year: number;
  season: Season;
  songs: Song[];
};

export const weekdays: Weekday[] = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
export const seasonNames: Season[] = ["Invierno", "Primavera", "Verano", "Otoño"];
export const availableYears = [2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017];
export const currentYear = 2026;
export const currentSeason: Season = "Verano";

export const animeCatalog: Anime[] = [
  {
    id: "snowball-earth",
    titleRomanji: "Snowball Earth",
    titleJapanese: "スノウボールアース",
    shortTitle: "Snowball Earth",
    synopsis: "En un futuro helado, un grupo de supervivientes atraviesa una Tierra cubierta de nieve mientras busca la señal que podría devolver el calor al planeta.",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=900&q=85",
    accent: "#A78BFA",
    day: "Lunes",
    time: "22:00",
    genres: ["Ciencia ficción", "Aventura"],
    studio: "Studio Bind",
    episodes: "12 episodios",
    year: 2026,
    season: "Verano",
    songs: [
      { id: "snowball-op", kind: "OP", titleRomanji: "zero", titleJapanese: "ゼロ", artist: "tuki.", youtubeUrl: "https://www.youtube.com/watch?v=MGC4O4r673c", sourceChannel: "TOHO animation" },
      { id: "snowball-ed", kind: "ED", titleRomanji: "Ima Kono Mune ni Tagiru no wa", titleJapanese: "今この胸に滾るのは", artist: "Ai Higuchi", youtubeUrl: "https://www.youtube.com/watch?v=t2rCLj3vd58", sourceChannel: "TOHO animation" },
    ],
  },
  {
    id: "call-of-the-night-s2",
    titleRomanji: "Call of the Night Season 2",
    titleJapanese: "よふかしのうた Season 2",
    shortTitle: "Call of the Night S2",
    synopsis: "Ko Yamori vuelve a perderse en la noche junto a Nazuna, entre luces de neón, conversaciones a deshoras y una música que no deja dormir.",
    image: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=900&q=85",
    accent: "#FF7A90",
    day: "Jueves",
    time: "23:30",
    genres: ["Sobrenatural", "Romance"],
    studio: "LIDENFILMS",
    episodes: "12 episodios",
    year: 2025,
    season: "Verano",
    songs: [
      { id: "call-op", kind: "OP", titleRomanji: "Mirage", titleJapanese: "ミラージュ", artist: "Creepy Nuts", youtubeUrl: "https://www.youtube.com/watch?v=ce6yxES9oLA", sourceChannel: "Creepy Nuts" },
      { id: "call-ed", kind: "ED", titleRomanji: "Nemure", titleJapanese: "眠れ", artist: "Creepy Nuts", youtubeUrl: "https://www.youtube.com/watch?v=riG7nwIgzmo", sourceChannel: "Creepy Nuts" },
    ],
  },
];

export function getAnimeById(id: string) {
  return animeCatalog.find((anime) => anime.id === id);
}

export function getSeasonLabel(year: number, season: Season) {
  return `${season} ${year}`;
}

export function getCatalogForSeason(year: number, season: Season) {
  return animeCatalog.filter((anime) => anime.year === year && anime.season === season);
}
