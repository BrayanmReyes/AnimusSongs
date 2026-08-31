"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ChevronRight } from "lucide-react";
import { animeCatalog } from "@/lib/anime-data";
import { useFavorites } from "@/hooks/useFavorites";

export default function LibraryScreen() {
  const { favorites, isLoaded } = useFavorites();

  const favoriteAnimes = useMemo(() => {
    return animeCatalog.filter((anime) => favorites.includes(anime.id));
  }, [favorites]);

  return (
    <div className="px-5 pt-[18px] pb-8 min-h-full flex flex-col max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-7">
        <h2 className="text-[13px] font-semibold uppercase tracking-[2px] text-[var(--color-primary)]">
          BIBLIOTECA
        </h2>
        <h1 className="mt-2 text-[29px] font-bold tracking-[-1px] text-[var(--color-foreground)]">
          Tus series guardadas
        </h1>
        <p className="mt-2 text-[14px] leading-5 text-[var(--color-muted)]">
          Una colección pequeña para volver a tus canciones favoritas.
        </p>
      </div>

      {/* Empty State */}
      {isLoaded && favoriteAnimes.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center rounded-[24px] border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-7 min-h-[300px]">
          <div className="mb-4 h-14 w-14 flex items-center justify-center rounded-full bg-[var(--color-primary)]/15">
            <Heart size={25} className="fill-[#A78BFA] text-[#A78BFA]" />
          </div>
          <h3 className="text-center text-[17px] font-bold text-[var(--color-foreground)]">
            Todavía no guardas nada
          </h3>
          <p className="mt-2 text-center text-[13px] leading-5 text-[var(--color-muted)] max-w-[250px]">
            Toca el corazón de cualquier anime para crear tu propia biblioteca.
          </p>
        </div>
      )}

      {/* List */}
      {isLoaded && favoriteAnimes.length > 0 && (
        <div className="flex flex-col gap-3">
          {favoriteAnimes.map((item) => (
            <Link
              key={item.id}
              href={`/anime/${item.id}`}
              className="flex flex-row overflow-hidden rounded-[22px] border border-[var(--color-border)] bg-[var(--color-surface)] p-3 hover:opacity-75 transition-opacity items-center group"
            >
              <div className="relative h-[88px] w-[66px] flex-shrink-0">
                <Image
                  src={item.image}
                  alt={item.shortTitle}
                  fill
                  className="rounded-[15px] object-cover"
                  unoptimized={item.image.startsWith('http')}
                />
              </div>

              <div className="ml-3 flex-1 flex flex-col justify-center min-w-0">
                <h3 className="text-[16px] font-bold text-[var(--color-foreground)] truncate">
                  {item.shortTitle}
                </h3>
                <p className="mt-1 text-[12px] text-[var(--color-muted)] truncate">
                  {item.titleJapanese}
                </p>
                <p className="mt-2 text-[11px] font-semibold text-[var(--color-primary)]">
                  {item.day} · {item.time}
                </p>
              </div>

              <ChevronRight size={19} className="text-[#A9A3B8] group-hover:text-[var(--color-primary)] transition-colors flex-shrink-0 ml-2" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
