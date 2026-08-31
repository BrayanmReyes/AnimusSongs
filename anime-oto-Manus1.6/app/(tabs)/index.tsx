import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, ScrollView, Text, View, useWindowDimensions } from "react-native";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { availableYears, currentSeason, currentYear, getSeasonLabel, seasonNames, weekdays, type Anime, type Season, type Weekday } from "@/lib/anime-data";
import { fetchSeasonAnime } from "@/lib/anime-api";
import { useColors } from "@/hooks/use-colors";

const FAVORITES_KEY = "anime-oto-favorites";

export default function HomeScreen() {
  const router = useRouter();
  const colors = useColors();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;
  const [selectedDay, setSelectedDay] = useState<Weekday>("Lunes");
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedSeason, setSelectedSeason] = useState<Season>(currentSeason);
  const [seasonCatalog, setSeasonCatalog] = useState<Anime[]>([]);
  const [source, setSource] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(FAVORITES_KEY).then((value) => {
      if (value) setFavorites(JSON.parse(value));
    });
  }, []);

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

  useEffect(() => {
    loadSeason();
  }, [loadSeason]);

  const hasSchedule = seasonCatalog.some((anime) => anime.day !== "Sin horario");
  const visibleShows = useMemo(() => hasSchedule ? seasonCatalog.filter((anime) => anime.day === selectedDay) : seasonCatalog, [hasSchedule, seasonCatalog, selectedDay]);
  const featured = seasonCatalog[0];

  const toggleFavorite = useCallback(async (id: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFavorites((previous) => {
      const next = previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id];
      AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const renderAnime = ({ item }: { item: Anime }) => (
    <Pressable onPress={() => router.push({ pathname: "/anime/[id]" as any, params: { id: item.id } })} style={({ pressed }) => [{ opacity: pressed ? 0.72 : 1 }, isDesktop && { width: "48%" }]}>
      <View className="mb-3 flex-row overflow-hidden rounded-[22px] border border-border bg-surface p-3">
        <Image source={item.image} contentFit="cover" transition={200} className="h-[104px] w-[78px] rounded-[16px]" />
        <View className="ml-3 flex-1 justify-between py-1">
          <View className="flex-row items-start justify-between"><View className="mr-2 flex-1"><Text className="text-[16px] font-bold leading-5 text-foreground">{item.shortTitle}</Text><Text className="mt-1 text-[12px] text-muted">{item.titleJapanese}</Text></View><Pressable onPress={() => toggleFavorite(item.id)} style={({ pressed }) => ({ opacity: pressed ? 0.55 : 1 })}><IconSymbol name="heart.fill" size={19} color={favorites.includes(item.id) ? "#FF7A90" : colors.muted} /></Pressable></View>
          <View className="flex-row items-center gap-2"><View className="rounded-full bg-primary/15 px-2 py-1"><Text className="text-[11px] font-bold text-primary">{item.time}</Text></View><Text numberOfLines={1} className="flex-1 text-[11px] text-muted">{item.genres.join(" · ") || "Anime"}</Text></View>
        </View>
      </View>
    </Pressable>
  );

  const selector = (label: string, values: readonly (string | number)[], selected: string | number, onSelect: (value: any) => void) => <View className="mb-5"><Text className="mb-3 text-[18px] font-bold text-foreground">{label}</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 12 }}>{values.map((value) => <View key={String(value)} className={`mr-2 overflow-hidden rounded-full border ${selected === value ? "border-primary bg-primary" : "border-border bg-surface"}`}><Pressable onPress={() => onSelect(value)} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}><View className="px-4 py-2.5"><Text className={`text-[12px] font-semibold ${selected === value ? "text-white" : "text-muted"}`}>{value}</Text></View></Pressable></View>)}</ScrollView></View>;

  return <ScreenContainer className="px-5" safeAreaClassName="bg-background"><FlatList data={visibleShows} keyExtractor={(item) => item.id} renderItem={renderAnime} numColumns={isDesktop ? 2 : 1} columnWrapperStyle={isDesktop ? { gap: 14 } : undefined} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 12, paddingBottom: 30 }} ListHeaderComponent={<View>
    <View className="mb-6 flex-row items-center justify-between"><View><Text className="text-[13px] font-semibold uppercase tracking-[2px] text-primary">ANIME OTO</Text><Text numberOfLines={2} className="mt-1 max-w-[285px] text-[29px] font-bold leading-8 tracking-[-1px] text-foreground">Descubre tu próxima canción</Text></View><View className="h-11 w-11 items-center justify-center rounded-full border border-border bg-surface"><IconSymbol name="music.note" size={21} color={colors.primary} /></View></View>
    <View className="mb-5 overflow-hidden rounded-[26px] bg-[#211A3D] p-5"><View className="absolute -right-10 -top-12 h-40 w-40 rounded-full bg-[#A78BFA]/20" /><View className="absolute -bottom-16 -left-8 h-36 w-36 rounded-full bg-[#FF7A90]/15" /><Text className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#D8CCFF]">TEMPORADA SELECCIONADA</Text><Text className="mt-2 text-[25px] font-bold text-white">{getSeasonLabel(selectedYear, selectedSeason)}</Text><Text className="mt-1 max-w-[270px] text-[13px] leading-5 text-[#C9C0DF]">El catálogo real de esta temporada, con sus estrenos y soundtrack cuando está disponible.</Text><View className="mt-4 flex-row items-center"><View className="h-2 w-2 rounded-full bg-[#39D39B]" /><Text className="ml-2 text-[12px] font-semibold text-[#D8CCFF]">{loading ? "Cargando catálogo…" : source ? `Fuente: ${source}` : "Sin conexión"}</Text></View></View>
    {selector("Año", availableYears, selectedYear, setSelectedYear)}
    {selector("Temporada", seasonNames, selectedSeason, setSelectedSeason)}
    {loading ? <View className="mb-5 flex-row items-center rounded-[22px] border border-border bg-surface p-5"><ActivityIndicator color={colors.primary} /><Text className="ml-3 text-[13px] text-muted">Cargando los animes de {getSeasonLabel(selectedYear, selectedSeason)}…</Text></View> : null}
    {!loading && error ? <View className="mb-5 rounded-[22px] border border-[#FF7A90]/40 bg-[#FF7A90]/10 p-5"><Text className="text-[15px] font-bold text-foreground">No se pudo cargar la temporada</Text><Text className="mt-1 text-[13px] leading-5 text-muted">{error}</Text><View className="mt-4 self-start overflow-hidden rounded-full bg-primary"><Pressable onPress={loadSeason} style={({ pressed }) => ({ opacity: pressed ? 0.75 : 1 })}><View className="px-4 py-2.5"><Text className="text-[12px] font-bold text-white">Reintentar</Text></View></Pressable></View></View> : null}
    {!loading && !error && featured ? <Pressable onPress={() => router.push({ pathname: "/anime/[id]" as any, params: { id: featured.id } })} style={({ pressed }) => ({ opacity: pressed ? 0.9 : 1 })} className="mb-5 overflow-hidden rounded-[24px] bg-surface"><Image source={featured.image} contentFit="cover" className="h-[150px] w-full" /><View className="-mt-5 mx-3 rounded-[18px] bg-surface p-4"><View className="flex-row items-center justify-between"><Text className="text-[11px] font-bold uppercase tracking-[1px] text-primary">SELECCIÓN OTO</Text><Text className="text-[11px] text-muted">{featured.time}</Text></View><Text className="mt-1 text-[19px] font-bold text-foreground">{featured.titleRomanji}</Text><Text className="mt-1 text-[12px] text-muted">{featured.songs[0]?.titleRomanji || "Soundtrack disponible en el detalle"}</Text></View></Pressable> : null}
    {!loading && !error ? <View className="mb-4"><Text className="mb-3 text-[18px] font-bold text-foreground">{hasSchedule ? "Emiten hoy" : "Catálogo de temporada"}</Text>{hasSchedule ? <><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 12 }}>{weekdays.map((item) => <View key={item} className={`mr-2 overflow-hidden rounded-full border ${selectedDay === item ? "border-primary bg-primary" : "border-border bg-surface"}`}><Pressable onPress={() => setSelectedDay(item)} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}><View className="px-4 py-2.5"><Text className={`text-[12px] font-semibold ${selectedDay === item ? "text-white" : "text-muted"}`}>{item.slice(0, 3)}</Text></View></Pressable></View>)}</ScrollView><Text className="mt-3 text-[13px] text-muted">{selectedDay} · {visibleShows.length} estreno{visibleShows.length === 1 ? "" : "s"}</Text></> : <Text className="text-[13px] text-muted">{seasonCatalog.length} anime{seasonCatalog.length === 1 ? "" : "s"} encontrados · selecciona cualquiera para ver su ficha.</Text>}</View> : null}
  </View>} ListEmptyComponent={!loading && !error ? <View className="rounded-[22px] border border-dashed border-border bg-surface p-5"><Text className="text-[15px] font-semibold text-foreground">No hay resultados para esta selección</Text><Text className="mt-1 text-[13px] leading-5 text-muted">Prueba otro año o temporada; si el catálogo existe, la app cargará todos sus títulos.</Text></View> : null} /></ScreenContainer>;
}
