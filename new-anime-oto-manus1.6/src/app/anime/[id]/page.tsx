"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronLeft, Heart, Loader2, Music, Play } from "lucide-react";
import { animeCatalog, getSeasonLabel, type Anime } from "@/lib/anime-data";
import { fetchAnimeById, fetchThemeSongs } from "@/lib/anime-api";
import { useFavorites } from "@/hooks/useFavorites";

export default function AnimeDetailScreen({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const isRemote = Boolean(id && (id.startsWith("anilist-") || id.startsWith("mal-")));

  const [anime, setAnime] = useState<Anime | null>(
    () => animeCatalog.find((item) => item.id === id) || null
  );

  const [loading, setLoading] = useState(isRemote && !anime);
  const [songsLoading, setSongsLoading] = useState(false);
  const [error, setError] = useState("");

  const { isLoaded, isFavorite, toggleFavorite } = useFavorites();
  const saved = isLoaded ? isFavorite(id) : false;

  useEffect(() => {
    let cancelled = false;

    async function loadRemote() {
      if (!id || !isRemote) return;

      setLoading(true);
      setError("");

      try {
        const loaded = await fetchAnimeById(id);
        if (cancelled) return;

        setAnime(loaded);
        setLoading(false);

        if (loaded.malId) {
          setSongsLoading(true);
          try {
            const songs = await fetchThemeSongs(loaded.malId);
            if (!cancelled && songs.length) {
              setAnime((prev) => prev ? { ...prev, songs } : loaded);
            }
          } catch {
            // Fails silently for songs, keeping anime info
          } finally {
            if (!cancelled) setSongsLoading(false);
          }
        }
      } catch (loadError) {
        if (cancelled) return;
        setError(loadError instanceof Error ? loadError.message : "No fue posible cargar este detalle.");
        setLoading(false);
      }
    }

    loadRemote();
    return () => { cancelled = true; };
  }, [id, isRemote]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-5">
        <Loader2 className="animate-spin text-[var(--color-primary)]" size={32} />
        <p className="mt-4 text-[14px] text-[var(--color-muted)]">Cargando la ficha y su soundtrack…</p>
      </div>
    );
  }

  if (error || !anime) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-5 max-w-lg mx-auto">
        <div className="w-full rounded-[24px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <h2 className="text-[18px] font-bold text-[var(--color-foreground)]">No se pudo abrir el anime</h2>
          <p className="mt-2 text-[14px] leading-5 text-[var(--color-muted)]">
            {error || "Este anime ya no está disponible en el catálogo."}
          </p>
          <button
            onClick={() => router.back()}
            className="mt-5 self-start px-4 py-2.5 rounded-full bg-[var(--color-primary)] text-white text-[12px] font-bold hover:opacity-75 transition-opacity"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-5 pt-5 pb-8 max-w-3xl mx-auto">
      {/* Top Navigation */}
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="h-10 w-10 flex items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] hover:opacity-70 transition-opacity"
        >
          <ChevronLeft size={21} className="text-[var(--color-foreground)]" />
        </button>

        <button
          onClick={() => toggleFavorite(anime.id)}
          className="h-10 w-10 flex items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] hover:opacity-70 transition-opacity"
        >
          <Heart size={19} className={saved ? "fill-[var(--color-error)] text-[var(--color-error)]" : "text-[var(--color-muted)]"} />
        </button>
      </div>

      {/* Hero Section */}
      <div className="overflow-hidden rounded-[26px] bg-[var(--color-surface)]">
        <div className="relative h-[260px] w-full">
          <Image
            src={anime.image}
            alt={anime.titleRomanji}
            fill
            className="object-cover"
            unoptimized={anime.image.startsWith('http')}
          />
        </div>

        <div className="p-5">
          <div className="flex flex-wrap gap-2">
            {anime.genres.map((genre) => (
              <div key={genre} className="rounded-full bg-[var(--color-primary)]/15 px-3 py-1.5">
                <span className="text-[11px] font-semibold text-[var(--color-primary)]">{genre}</span>
              </div>
            ))}
          </div>

          <h1 className="mt-3 text-[28px] font-bold tracking-[-1px] text-[var(--color-foreground)]">
            {anime.titleRomanji}
          </h1>
          <p className="mt-1 text-[16px] text-[var(--color-muted)]">{anime.titleJapanese}</p>

          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
            <span className="text-[12px] text-[var(--color-muted)]">{anime.day} · {anime.time}</span>
            <span className="text-[12px] text-[var(--color-muted)]">{anime.episodes}</span>
            <span className="text-[12px] text-[var(--color-muted)]">{anime.studio}</span>
          </div>

          <p className="mt-2 text-[12px] text-[var(--color-primary)]">
            {getSeasonLabel(anime.year, anime.season)}
          </p>
        </div>
      </div>

      {/* Synopsis */}
      <h2 className="mb-2 mt-7 text-[18px] font-bold text-[var(--color-foreground)]">La historia</h2>
      <p className="text-[14px] leading-6 text-[var(--color-muted)] whitespace-pre-wrap">{anime.synopsis}</p>

      {/* Soundtrack Section */}
      <div className="mb-3 mt-7 flex items-end justify-between">
        <div>
          <h2 className="text-[18px] font-bold text-[var(--color-foreground)]">Soundtrack</h2>
          <p className="mt-1 text-[12px] text-[var(--color-muted)]">Opening y ending directos cuando existen</p>
        </div>
        <Music size={22} style={{ color: anime.accent || 'var(--color-primary)' }} />
      </div>

      {/* Songs Status */}
      {songsLoading && (
        <div className="mb-3 flex items-center rounded-[20px] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <Loader2 className="animate-spin text-[var(--color-primary)]" size={20} />
          <span className="ml-3 text-[13px] text-[var(--color-muted)]">Buscando openings y endings…</span>
        </div>
      )}

      {!songsLoading && (!anime.songs || anime.songs.length === 0) && (
        <div className="mb-3 rounded-[20px] border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <h3 className="text-[14px] font-semibold text-[var(--color-foreground)]">Temas aún no disponibles</h3>
          <p className="mt-1 text-[13px] leading-5 text-[var(--color-muted)]">
            La ficha existe, pero todavía no hay un recurso directo OP/ED asociado.
          </p>
        </div>
      )}

      {/* Songs List */}
      {!songsLoading && anime.songs && anime.songs.map((item) => (
        <div key={item.id} className="mb-3 rounded-[20px] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <div className="flex items-start">
            <div
              className="mr-3 h-10 w-10 flex items-center justify-center rounded-full flex-shrink-0"
              style={{ backgroundColor: `${anime.accent || 'var(--color-primary)'}22` }}
            >
              <span className="text-[12px] font-bold" style={{ color: anime.accent || 'var(--color-primary)' }}>
                {item.kind}
              </span>
            </div>

            <div className="flex-1 min-w-0 pr-3">
              <h3 className="text-[15px] font-bold text-[var(--color-foreground)] truncate">{item.titleRomanji}</h3>
              <p className="mt-0.5 text-[13px] text-[var(--color-muted)] truncate">{item.titleJapanese}</p>
              <p className="mt-2 text-[12px] text-[var(--color-muted)] truncate">
                {item.artist} · {item.sourceChannel}
              </p>
            </div>

            <a
              href={item.youtubeUrl || "#"}
              target={item.youtubeUrl ? "_blank" : undefined}
              rel="noopener noreferrer"
              className={`h-10 w-10 flex items-center justify-center rounded-full bg-[var(--color-primary)] flex-shrink-0 ${!item.youtubeUrl ? 'opacity-45 pointer-events-none' : 'hover:opacity-80 transition-opacity'}`}
            >
              <Play size={17} className="text-white fill-white ml-0.5" />
            </a>
          </div>

          <a
            href={item.youtubeUrl || "#"}
            target={item.youtubeUrl ? "_blank" : undefined}
            rel="noopener noreferrer"
            className={`mt-4 flex items-center justify-center rounded-full border border-[var(--color-border)] py-2.5 ${!item.youtubeUrl ? 'opacity-45 pointer-events-none' : 'hover:bg-[var(--color-border)]/50 transition-colors'}`}
          >
            <Play size={13} className="text-[var(--color-primary)] fill-[var(--color-primary)]" />
            <span className="ml-2 text-[12px] font-semibold text-[var(--color-foreground)]">
              {item.youtubeUrl ? "Abrir video directo" : "Video no disponible"}
            </span>
          </a>
        </div>
      ))}
    </div>
  );
}
