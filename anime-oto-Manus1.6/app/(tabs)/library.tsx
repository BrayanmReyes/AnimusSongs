import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { animeCatalog, type Anime } from "@/lib/anime-data";

const FAVORITES_KEY = "anime-oto-favorites";

export default function LibraryScreen() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<Anime[]>([]);
  useFocusEffect(useCallback(() => {
    AsyncStorage.getItem(FAVORITES_KEY).then((value) => {
      const ids: string[] = value ? JSON.parse(value) : [];
      setFavorites(animeCatalog.filter((anime) => ids.includes(anime.id)));
    });
  }, []));

  return <ScreenContainer className="px-5" safeAreaClassName="bg-background"><FlatList data={favorites} keyExtractor={(item) => item.id} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 18, paddingBottom: 32, flexGrow: 1 }} ListHeaderComponent={<View className="mb-7"><Text className="text-[13px] font-semibold uppercase tracking-[2px] text-primary">BIBLIOTECA</Text><Text className="mt-2 text-[29px] font-bold tracking-[-1px] text-foreground">Tus series guardadas</Text><Text className="mt-2 text-[14px] leading-5 text-muted">Una colección pequeña para volver a tus canciones favoritas.</Text></View>} ListEmptyComponent={<View className="flex-1 items-center justify-center rounded-[24px] border border-dashed border-border bg-surface p-7"><View className="mb-4 h-14 w-14 items-center justify-center rounded-full bg-primary/15"><IconSymbol name="heart.fill" size={25} color="#A78BFA" /></View><Text className="text-center text-[17px] font-bold text-foreground">Todavía no guardas nada</Text><Text className="mt-2 text-center text-[13px] leading-5 text-muted">Toca el corazón de cualquier anime para crear tu propia biblioteca.</Text></View>} renderItem={({ item }) => <Pressable onPress={() => router.push({ pathname: "/anime/[id]" as any, params: { id: item.id } })} style={({ pressed }) => ({ opacity: pressed ? 0.72 : 1 })} className="mb-3 flex-row overflow-hidden rounded-[22px] border border-border bg-surface p-3"><Image source={item.image} contentFit="cover" className="h-[88px] w-[66px] rounded-[15px]" /><View className="ml-3 flex-1 justify-center"><Text className="text-[16px] font-bold text-foreground">{item.shortTitle}</Text><Text className="mt-1 text-[12px] text-muted">{item.titleJapanese}</Text><Text className="mt-2 text-[11px] font-semibold text-primary">{item.day} · {item.time}</Text></View><IconSymbol name="chevron.right" size={19} color="#A9A3B8" /></Pressable>} /></ScreenContainer>;
}
