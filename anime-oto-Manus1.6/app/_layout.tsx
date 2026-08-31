import "@/global.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, usePathname, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Platform, Pressable, Text, View, useWindowDimensions } from "react-native";
import "react-native-reanimated";
import { IconSymbol } from "@/components/ui/icon-symbol";
import "@/lib/_core/nativewind-pressable";
import { ThemeProvider } from "@/lib/theme-provider";
import {
  SafeAreaFrameContext,
  SafeAreaInsetsContext,
  SafeAreaProvider,
  initialWindowMetrics,
} from "react-native-safe-area-context";
import type { EdgeInsets, Metrics, Rect } from "react-native-safe-area-context";

import { trpc, createTRPCClient } from "@/lib/trpc";
import { initManusRuntime, subscribeSafeAreaInsets } from "@/lib/_core/manus-runtime";

const DEFAULT_WEB_INSETS: EdgeInsets = { top: 0, right: 0, bottom: 0, left: 0 };
const DEFAULT_WEB_FRAME: Rect = { x: 0, y: 0, width: 0, height: 0 };

function DesktopSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  if (Platform.OS !== "web" || width < 900) return null;
  const items = [
    { label: "Inicio", path: "/", icon: "house.fill" as const },
    { label: "Calendario", path: "/calendar", icon: "calendar" as const },
    { label: "Biblioteca", path: "/library", icon: "heart.fill" as const },
  ];
  return <View style={{ position: "absolute", zIndex: 20, left: 0, top: 0, bottom: 0, width: 242, paddingHorizontal: 18, paddingTop: 36, paddingBottom: 24, backgroundColor: "#211A3D", borderRightColor: "#352C57", borderRightWidth: 1 }}><Text style={{ color: "#FFFFFF", fontSize: 22, fontWeight: "800", letterSpacing: 1 }}>ANIME OTO</Text><Text style={{ marginTop: 5, color: "#AFA6CC", fontSize: 12 }}>soundtrack discovery</Text><View style={{ marginTop: 42 }}>{items.map((item) => { const active = item.path === "/" ? pathname === "/" || pathname === "/(tabs)" : pathname.startsWith(item.path); return <Pressable key={item.path} onPress={() => router.push(item.path as any)} style={({ pressed }) => ({ opacity: pressed ? 0.72 : 1, marginBottom: 8, borderRadius: 15, backgroundColor: active ? "#8B5CF6" : "transparent" })}><View style={{ height: 50, paddingHorizontal: 14, flexDirection: "row", alignItems: "center" }}><IconSymbol name={item.icon} size={21} color={active ? "#FFFFFF" : "#AFA6CC"} /><Text style={{ marginLeft: 13, color: active ? "#FFFFFF" : "#AFA6CC", fontSize: 14, fontWeight: active ? "700" : "600" }}>{item.label}</Text></View></Pressable>; })}</View><View style={{ flex: 1 }} /><View style={{ borderTopColor: "#352C57", borderTopWidth: 1, paddingTop: 18 }}><Text style={{ color: "#AFA6CC", fontSize: 11, lineHeight: 17 }}>Explora temporadas, descubre temas y guarda tus favoritos.</Text></View></View>;
}

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const initialInsets = initialWindowMetrics?.insets ?? DEFAULT_WEB_INSETS;
  const initialFrame = initialWindowMetrics?.frame ?? DEFAULT_WEB_FRAME;

  const [insets, setInsets] = useState<EdgeInsets>(initialInsets);
  const [frame, setFrame] = useState<Rect>(initialFrame);

  // Initialize Manus runtime for cookie injection from parent container
  useEffect(() => {
    initManusRuntime();
  }, []);

  const handleSafeAreaUpdate = useCallback((metrics: Metrics) => {
    setInsets(metrics.insets);
    setFrame(metrics.frame);
  }, []);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    const unsubscribe = subscribeSafeAreaInsets(handleSafeAreaUpdate);
    return () => unsubscribe();
  }, [handleSafeAreaUpdate]);

  // Create clients once and reuse them
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Disable automatic refetching on window focus for mobile
            refetchOnWindowFocus: false,
            // Retry failed requests once
            retry: 1,
          },
        },
      }),
  );
  const [trpcClient] = useState(() => createTRPCClient());

  // Ensure minimum 8px padding for top and bottom on mobile
  const providerInitialMetrics = useMemo(() => {
    const metrics = initialWindowMetrics ?? { insets: initialInsets, frame: initialFrame };
    return {
      ...metrics,
      insets: {
        ...metrics.insets,
        top: Math.max(metrics.insets.top, 16),
        bottom: Math.max(metrics.insets.bottom, 12),
      },
    };
  }, [initialInsets, initialFrame]);

  const content = (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          {/* Default to hiding native headers so raw route segments don't appear (e.g. "(tabs)", "products/[id]"). */}
          {/* If a screen needs the native header, explicitly enable it and set a human title via Stack.Screen options. */}
          {/* in order for ios apps tab switching to work properly, use presentation: "fullScreenModal" for login page, whenever you decide to use presentation: "modal*/}
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="oauth/callback" />
          </Stack>
          <DesktopSidebar />
          <StatusBar style="auto" />
        </QueryClientProvider>
      </trpc.Provider>
    </GestureHandlerRootView>
  );

  const shouldOverrideSafeArea = Platform.OS === "web";

  if (shouldOverrideSafeArea) {
    return (
      <ThemeProvider>
        <SafeAreaProvider initialMetrics={providerInitialMetrics}>
          <SafeAreaFrameContext.Provider value={frame}>
            <SafeAreaInsetsContext.Provider value={insets}>
              {content}
            </SafeAreaInsetsContext.Provider>
          </SafeAreaFrameContext.Provider>
        </SafeAreaProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <SafeAreaProvider initialMetrics={providerInitialMetrics}>{content}</SafeAreaProvider>
    </ThemeProvider>
  );
}
