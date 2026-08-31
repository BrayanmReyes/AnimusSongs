"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2, Music, Heart } from "lucide-react";
import {
  availableYears, currentSeason, currentYear, getSeasonLabel, seasonNames,
  weekdays, type Anime, type Season, type Weekday
} from "@/lib/anime-data";
import { fetchSeasonAnime } from "@/lib/anime-api";
import { useFavorites } from "@/hooks/useFavorites";

export default function Home() {
  const [selectedDay, setSelectedDay] = useState<Weekday>("Lunes");
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedSeason, setSelectedSeason] = useState<Season>(currentSeason);
  const [seasonCatalog, setSeasonCatalog] = useState<Anime[]>([]);
  const [source, setSource] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { favorites, toggleFavorite, isLoaded } = useFavorites();

  useEffect(() => {
    let mounted = true;


    (async () => {
      setLoading(true);
      setError("");
      try {
        const result = await fetchSeasonAnime(selectedYear, selectedSeason);
        if (mounted) {
          setSeasonCatalog(result.items);
          setSource(result.source || "");
        }
      } catch (loadError) {
        if (mounted) {
          setSeasonCatalog([]);
          setSource("");
          setError(loadError instanceof Error ? loadError.message : "No fue posible cargar esta temporada.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [selectedSeason, selectedYear]);

  // Maintain loadSeason for the "Retry" button
  const loadSeason = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await fetchSeasonAnime(selectedYear, selectedSeason);
      setSeasonCatalog(result.items);
      setSource(result.source || "");
    } catch (loadError) {
      setSeasonCatalog([]);
      setSource("");
      setError(loadError instanceof Error ? loadError.message : "No fue posible cargar esta temporada.");
    } finally {
      setLoading(false);
    }
  }, [selectedSeason, selectedYear]);

  const hasSchedule = seasonCatalog.some((anime) => anime.day !== "Sin horario");
  const visibleShows = useMemo(
    () => hasSchedule ? seasonCatalog.filter((anime) => anime.day === selectedDay) : seasonCatalog,
    [hasSchedule, seasonCatalog, selectedDay]
  );
  const featured = seasonCatalog[0];

  const selector = (
    label: string,
    values: readonly (string | number)[],
    selected: string | number,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSelect: (value: any) => void
  ) => (
    <div className="mb-5">
      <h3 className="mb-3 text-[18px] font-bold text-[var(--color-foreground)]">{label}</h3>
      <div className="flex overflow-x-auto pb-2 scrollbar-hide -mx-5 px-5 md:mx-0 md:px-0">
        {values.map((value) => (
          <button
            key={String(value)}
            onClick={() => onSelect(value)}
            className={`mr-2 flex-shrink-0 px-4 py-2.5 rounded-full border text-[12px] font-semibold transition-opacity hover:opacity-70 ${
              selected === value
                ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-muted)]"
            }`}
          >
            {value}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="px-5 pt-12 pb-[30px] max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-[13px] font-semibold uppercase tracking-[2px] text-[var(--color-primary)]">
            ANIME OTO
          </h2>
          <h1 className="mt-1 max-w-[285px] text-[29px] font-bold leading-8 tracking-[-1px] text-[var(--color-foreground)] line-clamp-2">
            Descubre tu próxima canción
          </h1>
        </div>
        <div className="h-11 w-11 flex items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] flex-shrink-0">
          <Music size={21} className="text-[var(--color-primary)]" />
        </div>
      </div>

      {/* Season Card */}
      <div className="relative mb-5 overflow-hidden rounded-[26px] bg-[#211A3D] p-5">
        <div className="absolute -right-10 -top-12 h-40 w-40 rounded-full bg-[#A78BFA]/20" />
        <div className="absolute -bottom-16 -left-8 h-36 w-36 rounded-full bg-[#FF7A90]/15" />
        <p className="relative z-10 text-[12px] font-bold uppercase tracking-[1.5px] text-[#D8CCFF]">
          TEMPORADA SELECCIONADA
        </p>
        <h2 className="relative z-10 mt-2 text-[25px] font-bold text-white">
          {getSeasonLabel(selectedYear, selectedSeason)}
        </h2>
        <p className="relative z-10 mt-1 max-w-[270px] text-[13px] leading-5 text-[#C9C0DF]">
          El catálogo real de esta temporada, con sus estrenos y soundtrack cuando está disponible.
        </p>
        <div className="relative z-10 mt-4 flex items-center">
          <div className="h-2 w-2 rounded-full bg-[#39D39B]" />
          <span className="ml-2 text-[12px] font-semibold text-[#D8CCFF]">
            {loading ? "Cargando catálogo…" : source ? `Fuente: ${source}` : "Sin conexión"}
          </span>
        </div>
      </div>

      {/* Selectors */}
      {selector("Año", availableYears, selectedYear, setSelectedYear)}
      {selector("Temporada", seasonNames, selectedSeason, setSelectedSeason)}

      {/* Statuses */}
      {loading && (
        <div className="mb-5 flex items-center rounded-[22px] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <Loader2 className="animate-spin text-[var(--color-primary)]" size={24} />
          <span className="ml-3 text-[13px] text-[var(--color-muted)]">
            Cargando los animes de {getSeasonLabel(selectedYear, selectedSeason)}…
          </span>
        </div>
      )}

      {!loading && error && (
        <div className="mb-5 rounded-[22px] border border-[#FF7A90]/40 bg-[#FF7A90]/10 p-5">
          <h3 className="text-[15px] font-bold text-[var(--color-foreground)]">No se pudo cargar la temporada</h3>
          <p className="mt-1 text-[13px] leading-5 text-[var(--color-muted)]">{error}</p>
          <button
            onClick={loadSeason}
            className="mt-4 px-4 py-2.5 rounded-full bg-[var(--color-primary)] text-white text-[12px] font-bold hover:opacity-75 transition-opacity"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Featured Anime */}
      {!loading && !error && featured && (
        <Link href={`/anime/${featured.id}`} className="block mb-5 overflow-hidden rounded-[24px] bg-[var(--color-surface)] hover:opacity-90 transition-opacity">
          <div className="relative h-[150px] w-full">
            <Image
              src={featured.image}
              alt={featured.titleRomanji}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
              unoptimized={featured.image.startsWith('http')}
            />
          </div>
          <div className="-mt-5 mx-3 relative z-10 rounded-[18px] bg-[var(--color-surface)] p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-[1px] text-[var(--color-primary)]">
                SELECCIÓN OTO
              </span>
              <span className="text-[11px] text-[var(--color-muted)]">{featured.time}</span>
            </div>
            <h3 className="mt-1 text-[19px] font-bold text-[var(--color-foreground)] truncate">{featured.titleRomanji}</h3>
            <p className="mt-1 text-[12px] text-[var(--color-muted)] truncate">
              {featured.songs?.[0]?.titleRomanji || "Soundtrack disponible en el detalle"}
            </p>
          </div>
        </Link>
      )}

      {/* Days Filter */}
      {!loading && !error && (
        <div className="mb-4">
          <h3 className="mb-3 text-[18px] font-bold text-[var(--color-foreground)]">
            {hasSchedule ? "Emiten hoy" : "Catálogo de temporada"}
          </h3>

          {hasSchedule ? (
            <>
              <div className="flex overflow-x-auto pb-2 scrollbar-hide -mx-5 px-5 md:mx-0 md:px-0">
                {weekdays.map((item) => (
                  <button
                    key={item}
                    onClick={() => setSelectedDay(item)}
                    className={`mr-2 flex-shrink-0 px-4 py-2.5 rounded-full border text-[12px] font-semibold transition-opacity hover:opacity-70 ${
                      selectedDay === item
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                        : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-muted)]"
                    }`}
                  >
                    {item.slice(0, 3)}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-[13px] text-[var(--color-muted)]">
                {selectedDay} · {visibleShows.length} estreno{visibleShows.length === 1 ? "" : "s"}
              </p>
            </>
          ) : (
            <p className="text-[13px] text-[var(--color-muted)]">
              {seasonCatalog.length} anime{seasonCatalog.length === 1 ? "" : "s"} encontrados · selecciona cualquiera para ver su ficha.
            </p>
          )}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && visibleShows.length === 0 && (
        <div className="rounded-[22px] border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <h3 className="text-[15px] font-semibold text-[var(--color-foreground)]">No hay resultados para esta selección</h3>
          <p className="mt-1 text-[13px] leading-5 text-[var(--color-muted)]">
            Prueba otro año o temporada; si el catálogo existe, la app cargará todos sus títulos.
          </p>
        </div>
      )}

      {/* Grid of Anime */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-[14px]">
        {visibleShows.map((item) => {
          const isFav = isLoaded ? favorites.includes(item.id) : false;

          return (
            <Link
              key={item.id}
              href={`/anime/${item.id}`}
              className="flex flex-row overflow-hidden rounded-[22px] border border-[var(--color-border)] bg-[var(--color-surface)] p-3 hover:opacity-75 transition-opacity"
            >
              <div className="relative h-[104px] w-[78px] flex-shrink-0">
                <Image
                  src={item.image}
                  alt={item.titleRomanji}
                  fill
                  className="rounded-[16px] object-cover"
                  unoptimized={item.image.startsWith('http')}
                />
              </div>

              <div className="ml-3 flex-1 flex flex-col justify-between py-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="mr-2 flex-1 min-w-0">
                    <h4 className="text-[16px] font-bold leading-5 text-[var(--color-foreground)] truncate">
                      {item.shortTitle}
                    </h4>
                    <p className="mt-1 text-[12px] text-[var(--color-muted)] truncate">
                      {item.titleJapanese}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      toggleFavorite(item.id);
                    }}
                    className="flex-shrink-0 hover:opacity-55 transition-opacity pt-1"
                  >
                    <Heart
                      size={19}
                      className={isFav ? "fill-[#FF7A90] text-[#FF7A90]" : "text-[var(--color-muted)]"}
                    />
                  </button>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <div className="rounded-full bg-[var(--color-primary)]/15 px-2 py-1 flex-shrink-0">
                    <span className="text-[11px] font-bold text-[var(--color-primary)]">
                      {item.time}
                    </span>
                  </div>
                  <p className="flex-1 text-[11px] text-[var(--color-muted)] truncate">
                    {item.genres.join(" · ") || "Anime"}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
