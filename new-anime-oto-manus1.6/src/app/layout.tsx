import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { Home, Calendar, Heart } from "lucide-react";
import { ThemeProvider } from "../components/theme-provider";
import { ThemeToggle } from "../components/theme-toggle";

export const metadata: Metadata = {
  title: "Anime Oto",
  description: "Soundtrack discovery - Explora temporadas, descubre temas y guarda tus favoritos.",
};

function DesktopSidebar() {
  const items = [
    { label: "Inicio", path: "/", icon: Home },
    { label: "Calendario", path: "/calendar", icon: Calendar },
    { label: "Biblioteca", path: "/library", icon: Heart },
  ];

  return (
    <div className="hidden md:flex flex-col w-[242px] px-[18px] pt-9 pb-6 bg-[var(--color-surface)] border-r border-[var(--color-border)] fixed inset-y-0 left-0 z-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[var(--color-foreground)] text-[22px] font-extrabold tracking-wide">ANIME OTO</h1>
          <p className="mt-[5px] text-[var(--color-muted)] text-[12px]">soundtrack discovery</p>
        </div>
        <ThemeToggle />
      </div>

      <div className="mt-[42px] flex flex-col space-y-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              href={item.path}
              className="flex items-center h-[50px] px-[14px] rounded-[15px] text-[var(--color-muted)] hover:bg-[var(--color-border)] hover:text-[var(--color-foreground)] transition-colors"
            >
              <Icon size={21} className="mr-[13px]" />
              <span className="text-[14px] font-semibold">{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="flex-1" />

      <div className="pt-[18px] border-t border-[var(--color-border)]">
        <p className="text-[var(--color-muted)] text-[11px] leading-[17px]">
          Explora temporadas, descubre temas y guarda tus favoritos.
        </p>
      </div>
    </div>
  );
}

function MobileTabBar() {
  const items = [
    { label: "Inicio", path: "/", icon: Home },
    { label: "Calendario", path: "/calendar", icon: Calendar },
    { label: "Biblioteca", path: "/library", icon: Heart },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-[65px] bg-[var(--color-surface)] border-t border-[var(--color-border)] flex items-center justify-around z-50 pb-safe">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.path}
            href={item.path}
            className="flex flex-col items-center justify-center w-full h-full text-[var(--color-muted)] hover:text-[var(--color-primary)]"
          >
            <Icon size={24} />
            <span className="text-[10px] mt-1 font-medium">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-[var(--background)]">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <div className="flex h-screen overflow-hidden">
            <DesktopSidebar />

            <main className="flex-1 w-full md:pl-[242px] overflow-y-auto pb-[65px] md:pb-0 relative">
              <div className="md:hidden absolute top-4 right-4 z-50">
                <ThemeToggle />
              </div>
              {children}
            </main>

            <MobileTabBar />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
