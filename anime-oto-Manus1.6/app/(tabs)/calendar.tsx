import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, ScrollView, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { availableYears, currentSeason, currentYear, seasonNames, weekdays, type Anime, type Season } from "@/lib/anime-data";
import { fetchSeasonAnime } from "@/lib/anime-api";
import { useColors } from "@/hooks/use-colors";

export default function CalendarScreen() {
  const router = useRouter();
  const colors = useColors();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedSeason, setSelectedSeason] = useState<Season>(currentSeason);
  const [seasonCatalog, setSeasonCatalog] = useState<Anime[]>([]);
  const [source, setSource] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSeason = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await fetchSeasonAnime(selectedYear, selectedSeason);
      setSeasonCatalog(result.items);
      setSource(result.source);
    } catch (loadError) {
      setSeasonCatalog([]);
      setSource("");
      setError(loadError instanceof Error ? loadError.message : "No fue posible cargar esta temporada.");
    } finally {
      setLoading(false);
    }
  }, [selectedSeason, selectedYear]);

  useEffect(() => { loadSeason(); }, [loadSeason]);
  const days = useMemo(() => weekdays.map((day) => ({ day, shows: seasonCatalog.filter((anime) => anime.day === day) })), [seasonCatalog]);
  const noSchedule = seasonCatalog.length > 0 && seasonCatalog.every((anime) => anime.day === "Sin horario");

  const selector = (label: string, values: readonly (string | number)[], selected: string | number, onSelect: (value: any) => void) => <View className="mb-5"><Text className="mb-3 text-[17px] font-bold text-foreground">{label}</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 12 }}>{values.map((value) => <View key={String(value)} className={`mr-2 overflow-hidden rounded-full border ${selected === value ? "border-primary bg-primary" : "border-border bg-surface"}`}><Pressable onPress={() => onSelect(value)} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}><View className="px-4 py-2.5"><Text className={`text-[12px] font-semibold ${selected === value ? "text-white" : "text-muted"}`}>{value}</Text></View></Pressable></View>)}</ScrollView></View>;

  return <ScreenContainer className="px-5" safeAreaClassName="bg-background"><FlatList data={noSchedule ? [] : days} keyExtractor={(item) => item.day} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 18, paddingBottom: 32 }} ListHeaderComponent={<View className="mb-6"><Text className="text-[13px] font-semibold uppercase tracking-[2px] text-primary">CALENDARIO</Text><Text className="mt-2 text-[29px] font-bold tracking-[-1px] text-foreground">Toda la semana, a tu ritmo</Text><Text className="mt-2 text-[14px] leading-5 text-muted">Elige cualquier año y temporada para volver a sus estrenos.</Text><View className="mt-6">{selector("Año", availableYears, selectedYear, setSelectedYear)}{selector("Temporada", seasonNames, selectedSeason, setSelectedSeason)}</View><View className="flex-row items-center"><View className={`h-2 w-2 rounded-full ${loading ? "bg-warning" : error ? "bg-error" : "bg-success"}`} /><Text className="ml-2 text-[12px] text-muted">{loading ? "Cargando catálogo…" : error ? "Fuente no disponible" : `${seasonCatalog.length} series · ${source}`}</Text></View>{loading ? <View className="mt-4 flex-row items-center rounded-[20px] border border-border bg-surface p-4"><ActivityIndicator color={colors.primary} /><Text className="ml-3 text-[13px] text-muted">Cargando la agenda completa…</Text></View> : null}{error ? <View className="mt-4 rounded-[20px] border border-[#FF7A90]/40 bg-[#FF7A90]/10 p-4"><Text className="text-[14px] font-bold text-foreground">No se pudo cargar la agenda</Text><Text className="mt-1 text-[13px] leading-5 text-muted">{error}</Text><View className="mt-3 self-start overflow-hidden rounded-full bg-primary"><Pressable onPress={loadSeason} style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}><View className="px-4 py-2.5"><Text className="text-[12px] font-bold text-white">Reintentar</Text></View></Pressable></View></View> : null}{noSchedule ? <View className="mt-4 rounded-[20px] border border-dashed border-border bg-surface p-4"><Text className="text-[14px] font-bold text-foreground">Horarios no publicados</Text><Text className="mt-1 text-[13px] leading-5 text-muted">La temporada tiene {seasonCatalog.length} animes, pero la fuente no informa día de emisión para esta selección.</Text></View> : null}</View>} renderItem={({ item, index }) => <View className="mb-3 overflow-hidden rounded-[22px] border border-border bg-surface"><View className="flex-row items-center justify-between p-4"><View className="flex-row items-center"><View className={`mr-3 h-10 w-10 items-center justify-center rounded-full ${item.shows.length ? "bg-primary/15" : "bg-background"}`}><Text className="text-[14px] font-bold text-primary">{String(index + 1).padStart(2, "0")}</Text></View><View><Text className="text-[16px] font-bold text-foreground">{item.day}</Text><Text className="mt-0.5 text-[12px] text-muted">{item.shows.length ? `${item.shows.length} estreno${item.shows.length > 1 ? "s" : ""}` : "Sin estrenos"}</Text></View></View><IconSymbol name="chevron.right" size={20} color={colors.muted} /></View>{item.shows.map((show) => <Pressable key={show.id} onPress={() => router.push({ pathname: "/anime/[id]" as any, params: { id: show.id } })} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })} className="flex-row items-center border-t border-border px-4 py-3"><View className="h-2 w-2 rounded-full" style={{ backgroundColor: show.accent }} /><Text className="ml-3 flex-1 text-[13px] font-medium text-foreground">{show.shortTitle}</Text><Text className="text-[12px] text-muted">{show.time}</Text></Pressable>)}</View>} ListEmptyComponent={!loading && !error && !noSchedule ? <View className="rounded-[22px] border border-dashed border-border bg-surface p-5"><Text className="text-[15px] font-semibold text-foreground">No hay resultados para esta selección</Text><Text className="mt-1 text-[13px] leading-5 text-muted">Prueba otra combinación de año y temporada.</Text></View> : null} /></ScreenContainer>;
}
