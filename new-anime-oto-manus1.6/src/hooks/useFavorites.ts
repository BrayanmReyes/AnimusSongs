"use client";

import { useCallback, useEffect, useState } from "react";

const FAVORITES_KEY = "anime-oto-favorites";

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      if (stored) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFavorites(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Error reading favorites from local storage:", e);
    } finally {

      setIsLoaded(true);
    }
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id];

      try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
      } catch (e) {
        console.error("Error writing favorites to local storage:", e);
      }

      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (id: string) => favorites.includes(id),
    [favorites]
  );

  return {
    favorites,
    isLoaded,
    toggleFavorite,
    isFavorite,
  };
}
