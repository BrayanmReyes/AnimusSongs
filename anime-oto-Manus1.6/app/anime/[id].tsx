import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { animeCatalog, getSeasonLabel, type Anime, type Song } from "@/lib/anime-data";
import { fetchAnimeById, fetchThemeSongs } from "@/lib/anime-api";
import { useColors } from "@/hooks/use-colors";

const FAVORITES_KEY = "anime-oto-favorites";

export default function AnimeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useColors();
  const isRemote = Boolean(id && (id.startsWith("anilist-") || id.startsWith("mal-")));
  const [anime, setAnime] = useState<Anime | null>(() => animeCatalog.find((item) => item.id === id) || null);
  const [loading, setLoading] = useState(isRemote);
  const [songsLoading, setSongsLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    AsyncStorage.getItem(FAVORITES_KEY).then((value) => setSaved((value ? JSON.parse(value) : []).includes(id)));
  }, [id]);

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
            if (!cancelled && songs.length) setAnime({ ...loaded, songs });
          } catch {
            // La ficha se mantiene disponible aunque no exista mapping de temas.
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

  const toggleSaved = async () => {
    if (!anime) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const value = await AsyncStorage.getItem(FAVORITES_KEY);
    const ids: string[] = value ? JSON.parse(value) : [];
    const next = saved ? ids.filter((item) => item !== anime.id) : [...ids, anime.id];
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
    setSaved(!saved);
  };

  const openOfficial = async (song: Song) => {
    if (song.youtubeUrl) await WebBrowser.openBrowserAsync(song.youtubeUrl);
  };

  if (loading) return <ScreenContainer className="items-center justify-center px-5"><ActivityIndicator color={colors.primary} size="large" /><Text className="mt-4 text-[14px] text-muted">Cargando la ficha y su soundtrack…</Text></ScreenContainer>;
  if (error || !anime) return <ScreenContainer className="items-center justify-center px-5"><View className="w-full rounded-[24px] border border-border bg-surface p-5"><Text className="text-[18px] font-bold text-foreground">No se pudo abrir el anime</Text><Text className="mt-2 text-[14px] leading-5 text-muted">{error || "Este anime ya no está disponible en el catálogo."}</Text><Pressable onPress={() => router.back()} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })} className="mt-5 self-start overflow-hidden rounded-full bg-primary"><View className="px-4 py-2.5"><Text className="text-[12px] font-bold text-white">Volver</Text></View></Pressable></View></ScreenContainer>;

  return <><Stack.Screen options={{ headerShown: false }} /><ScreenContainer edges={["top", "bottom", "left", "right"]} className="px-5" safeAreaClassName="bg-background"><FlatList data={anime.songs} keyExtractor={(item) => item.id} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }} ListHeaderComponent={<View><View className="mb-4 flex-row items-center justify-between"><Pressable onPress={() => router.back()} style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })} className="h-10 w-10 items-center justify-center rounded-full border border-border bg-surface"><IconSymbol name="chevron.left" size={21} color={colors.foreground} /></Pressable><Pressable onPress={toggleSaved} style={({ pressed }) => ({ opacity: pressed ? 0.55 : 1 })} className="h-10 w-10 items-center justify-center rounded-full border border-border bg-surface"><IconSymbol name="heart.fill" size={19} color={saved ? "#FF7A90" : colors.muted} /></Pressable></View><View className="overflow-hidden rounded-[26px] bg-surface"><Image source={anime.image} contentFit="cover" transition={200} className="h-[260px] w-full" /><View className="p-5"><View className="flex-row flex-wrap gap-2">{anime.genres.map((genre) => <View key={genre} className="rounded-full bg-primary/15 px-3 py-1.5"><Text className="text-[11px] font-semibold text-primary">{genre}</Text></View>)}</View><Text className="mt-3 text-[28px] font-bold tracking-[-1px] text-foreground">{anime.titleRomanji}</Text><Text className="mt-1 text-[16px] text-muted">{anime.titleJapanese}</Text><View className="mt-4 flex-row flex-wrap gap-x-4 gap-y-2"><Text className="text-[12px] text-muted">{anime.day} · {anime.time}</Text><Text className="text-[12px] text-muted">{anime.episodes}</Text><Text className="text-[12px] text-muted">{anime.studio}</Text></View><Text className="mt-2 text-[12px] text-primary">{getSeasonLabel(anime.year, anime.season)}</Text></View></View><Text className="mb-2 mt-7 text-[18px] font-bold text-foreground">La historia</Text><Text className="text-[14px] leading-6 text-muted">{anime.synopsis}</Text><View className="mb-3 mt-7 flex-row items-end justify-between"><View><Text className="text-[18px] font-bold text-foreground">Soundtrack</Text><Text className="mt-1 text-[12px] text-muted">Opening y ending directos cuando existen</Text></View><IconSymbol name="music.note" size={22} color={anime.accent} /></View>{songsLoading ? <View className="mb-3 flex-row items-center rounded-[20px] border border-border bg-surface p-4"><ActivityIndicator color={colors.primary} /><Text className="ml-3 text-[13px] text-muted">Buscando openings y endings…</Text></View> : null}{!songsLoading && anime.songs.length === 0 ? <View className="mb-3 rounded-[20px] border border-dashed border-border bg-surface p-4"><Text className="text-[14px] font-semibold text-foreground">Temas aún no disponibles</Text><Text className="mt-1 text-[13px] leading-5 text-muted">La ficha existe, pero todavía no hay un recurso directo OP/ED asociado.</Text></View> : null}</View>} renderItem={({ item }) => <View className="mb-3 rounded-[20px] border border-border bg-surface p-4"><View className="flex-row items-start"><View className="mr-3 h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: `${anime.accent}22` }}><Text className="text-[12px] font-bold" style={{ color: anime.accent }}>{item.kind}</Text></View><View className="flex-1"><Text className="text-[15px] font-bold text-foreground">{item.titleRomanji}</Text><Text className="mt-0.5 text-[13px] text-muted">{item.titleJapanese}</Text><Text className="mt-2 text-[12px] text-muted">{item.artist} · {item.sourceChannel}</Text></View><Pressable disabled={!item.youtubeUrl} onPress={() => openOfficial(item)} style={({ pressed }) => ({ opacity: pressed ? 0.6 : item.youtubeUrl ? 1 : 0.45 })} className="h-10 w-10 items-center justify-center rounded-full bg-primary"><IconSymbol name="play.fill" size={17} color="#FFFFFF" /></Pressable></View><Pressable disabled={!item.youtubeUrl} onPress={() => openOfficial(item)} style={({ pressed }) => ({ opacity: pressed ? 0.65 : item.youtubeUrl ? 1 : 0.45 })} className="mt-4 flex-row items-center justify-center rounded-full border border-border py-2.5"><IconSymbol name="play.fill" size={13} color={colors.primary} /><Text className="ml-2 text-[12px] font-semibold text-foreground">{item.youtubeUrl ? "Abrir video directo" : "Video no disponible"}</Text></Pressable></View>} /></ScreenContainer></>;
}
