import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

export default function TabLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isDesktopWeb = Platform.OS === "web" && typeof window !== "undefined" && window.innerWidth >= 900;
  const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);
  return <Tabs screenOptions={{ tabBarActiveTintColor: isDesktopWeb ? "#FFFFFF" : colors.primary, tabBarInactiveTintColor: isDesktopWeb ? "#9B93B6" : colors.muted, headerShown: false, tabBarButton: HapticTab, tabBarStyle: isDesktopWeb ? { display: "none" } : { paddingTop: 8, paddingBottom: bottomPadding, height: 56 + bottomPadding, backgroundColor: colors.background, borderTopColor: colors.border, borderTopWidth: 0.5 } }}><Tabs.Screen name="index" options={{ title: "Inicio", tabBarIcon: ({ color }) => <IconSymbol size={23} name="house.fill" color={color} /> }} /><Tabs.Screen name="calendar" options={{ title: "Calendario", tabBarIcon: ({ color }) => <IconSymbol size={23} name="calendar" color={color} /> }} /><Tabs.Screen name="library" options={{ title: "Biblioteca", tabBarIcon: ({ color }) => <IconSymbol size={23} name="heart.fill" color={color} /> }} /></Tabs>;
}
