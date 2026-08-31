"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2, ChevronRight } from "lucide-react";
import {
  availableYears, currentSeason, currentYear, seasonNames, weekdays,
  type Anime, type Season
} from "@/lib/anime-data";
import { fetchSeasonAnime } from "@/lib/anime-api";

export default function CalendarScreen() {
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedSeason, setSelectedSeason] = useState<Season>(currentSeason);
  const [seasonCatalog, setSeasonCatalog] = useState<Anime[]>([]);
  const [source, setSource] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const days = useMemo(
    () => weekdays.map((day) => ({ day, shows: seasonCatalog.filter((anime) => anime.day === day) })),
    [seasonCatalog]
  );

  const noSchedule = seasonCatalog.length > 0 && seasonCatalog.every((anime) => anime.day === "Sin horario");

  const selector = (
    label: string,
    values: readonly (string | number)[],
    selected: string | number,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSelect: (value: any) => void
  ) => (
    <div className="mb-5">
      <h3 className="mb-3 text-[17px] font-bold text-[var(--color-foreground)]">{label}</h3>
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
    <div className="px-5 pt-[18px] pb-8 max-w-3xl mx-auto">
      {/* Header section */}
      <div className="mb-6">
        <h2 className="text-[13px] font-semibold uppercase tracking-[2px] text-[var(--color-primary)]">
          CALENDARIO
        </h2>
        <h1 className="mt-2 text-[29px] font-bold tracking-[-1px] text-[var(--color-foreground)]">
          Toda la semana, a tu ritmo
        </h1>
        <p className="mt-2 text-[14px] leading-5 text-[var(--color-muted)]">
          Elige cualquier año y temporada para volver a sus estrenos.
        </p>

        <div className="mt-6">
          {selector("Año", availableYears, selectedYear, setSelectedYear)}
          {selector("Temporada", seasonNames, selectedSeason, setSelectedSeason)}
        </div>

        <div className="flex items-center">
          <div className={`h-2 w-2 rounded-full ${loading ? "bg-[var(--color-warning)]" : error ? "bg-[var(--color-error)]" : "bg-[var(--color-success)]"}`} />
          <span className="ml-2 text-[12px] text-[var(--color-muted)]">
            {loading ? "Cargando catálogo…" : error ? "Fuente no disponible" : `${seasonCatalog.length} series · ${source}`}
          </span>
        </div>

        {/* Status Messages */}
        {loading && (
          <div className="mt-4 flex items-center rounded-[20px] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            <Loader2 className="animate-spin text-[var(--color-primary)]" size={24} />
            <span className="ml-3 text-[13px] text-[var(--color-muted)]">Cargando la agenda completa…</span>
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-[20px] border border-[#FF7A90]/40 bg-[#FF7A90]/10 p-4">
            <h3 className="text-[14px] font-bold text-[var(--color-foreground)]">No se pudo cargar la agenda</h3>
            <p className="mt-1 text-[13px] leading-5 text-[var(--color-muted)]">{error}</p>
            <button
              onClick={loadSeason}
              className="mt-3 px-4 py-2.5 rounded-full bg-[var(--color-primary)] text-white text-[12px] font-bold hover:opacity-75 transition-opacity"
            >
              Reintentar
            </button>
          </div>
        )}

        {noSchedule && (
          <div className="mt-4 rounded-[20px] border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            <h3 className="text-[14px] font-bold text-[var(--color-foreground)]">Horarios no publicados</h3>
            <p className="mt-1 text-[13px] leading-5 text-[var(--color-muted)]">
              La temporada tiene {seasonCatalog.length} animes, pero la fuente no informa día de emisión para esta selección.
            </p>
          </div>
        )}
      </div>

      {/* Calendar List */}
      {!loading && !error && !noSchedule && days.length === 0 && (
        <div className="rounded-[22px] border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <h3 className="text-[15px] font-semibold text-[var(--color-foreground)]">No hay resultados para esta selección</h3>
          <p className="mt-1 text-[13px] leading-5 text-[var(--color-muted)]">Prueba otra combinación de año y temporada.</p>
        </div>
      )}

      {!noSchedule && days.map((item, index) => (
        <div key={item.day} className="mb-3 overflow-hidden rounded-[22px] border border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <div className={`mr-3 h-10 w-10 flex items-center justify-center rounded-full ${item.shows.length ? "bg-[var(--color-primary)]/15" : "bg-[var(--background)]"}`}>
                <span className="text-[14px] font-bold text-[var(--color-primary)]">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <div>
                <h3 className="text-[16px] font-bold text-[var(--color-foreground)]">{item.day}</h3>
                <p className="mt-0.5 text-[12px] text-[var(--color-muted)]">
                  {item.shows.length ? `${item.shows.length} estreno${item.shows.length > 1 ? "s" : ""}` : "Sin estrenos"}
                </p>
              </div>
            </div>
            <ChevronRight size={20} className="text-[var(--color-muted)]" />
          </div>

          {item.shows.map((show) => (
            <Link
              key={show.id}
              href={`/anime/${show.id}`}
              className="flex items-center border-t border-[var(--color-border)] px-4 py-3 hover:opacity-70 transition-opacity group"
            >
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: show.accent }} />
              <span className="ml-3 flex-1 text-[13px] font-medium text-[var(--color-foreground)] group-hover:text-[var(--color-primary)] transition-colors">
                {show.shortTitle}
              </span>
              <span className="text-[12px] text-[var(--color-muted)]">{show.time}</span>
            </Link>
          ))}
        </div>
      ))}
    </div>
  );
}
