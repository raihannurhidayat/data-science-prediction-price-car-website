"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIcon,
  BarChart3Icon,
  CarIcon,
  HistoryIcon,
  InfoIcon,
  MenuIcon,
  XIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/lib/car-data";

const navItems = [
  { href: "/", label: "Prediksi", icon: CarIcon },
  { href: "/dashboard", label: "Dashboard", icon: BarChart3Icon },
  { href: "/history", label: "Riwayat", icon: HistoryIcon },
  { href: "/about", label: "About", icon: InfoIcon },
];

type HealthState = "checking" | "online" | "offline";

export function SiteHeader() {
  const pathname = usePathname();
  const [health, setHealth] = useState<HealthState>("checking");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isCancelled = false;
    let retryTimer: number | undefined;
    let activeController: AbortController | null = null;

    const checkHealth = async () => {
      const controller = new AbortController();
      activeController = controller;
      const timeoutTimer = window.setTimeout(() => controller.abort(), 6000);

      try {
        const response = await fetch(`${API_BASE_URL}/health`, {
          signal: controller.signal,
          cache: "no-store",
        });

        if (isCancelled) return;

        if (response.ok) {
          setHealth("online");
          return;
        }

        setHealth("offline");
      } catch {
        if (!isCancelled) {
          setHealth("offline");
        }
      } finally {
        window.clearTimeout(timeoutTimer);
      }

      if (!isCancelled) {
        retryTimer = window.setTimeout(checkHealth, 2500);
      }
    };

    void checkHealth();

    return () => {
      isCancelled = true;
      activeController?.abort();
      window.clearTimeout(retryTimer);
    };
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const handleOutsidePress = (event: MouseEvent | TouchEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;

      if (!navWrapperRef.current?.contains(target)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsidePress);
    document.addEventListener("touchstart", handleOutsidePress);

    return () => {
      document.removeEventListener("mousedown", handleOutsidePress);
      document.removeEventListener("touchstart", handleOutsidePress);
    };
  }, [isMobileMenuOpen]);

  const healthLabel = useMemo(() => {
    if (health === "checking") return "Checking API";
    if (health === "online") return "API Online";
    return "API Offline";
  }, [health]);

  const loadingMessage =
    health === "offline"
      ? "API belum terhubung. Mencoba ulang..."
      : "Menghubungkan ke API...";

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div
        ref={navWrapperRef}
        className="mx-auto flex min-h-16 w-full max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8"
      >
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg border bg-card">
              <CarIcon />
            </span>
            <span className="flex flex-col leading-tight">
              <span className="font-semibold">Car Price Predictor</span>
              <span className="text-xs text-muted-foreground">
                UAS Data Science
              </span>
            </span>
          </Link>

          <Button
            variant="outline"
            size="icon-sm"
            className="lg:hidden cursor-pointer"
            aria-label={
              isMobileMenuOpen ? "Close navigation" : "Open navigation"
            }
            aria-expanded={isMobileMenuOpen}
            aria-controls="site-navigation"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
          >
            {isMobileMenuOpen ? <XIcon /> : <MenuIcon />}
          </Button>
        </div>

        <nav
          id="site-navigation"
          className={cn(
            "w-full flex-col gap-2 overflow-hidden transition-all duration-300 ease-out lg:flex lg:w-auto lg:flex-row lg:items-center lg:overflow-visible lg:transition-none",
            isMobileMenuOpen
              ? "mt-1 max-h-72 opacity-100 translate-y-0 space-y-2"
              : "max-h-0 opacity-0 -translate-y-2 pointer-events-none lg:pointer-events-auto lg:max-h-none lg:opacity-100 lg:translate-y-0",
          )}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Button
                key={item.href}
                variant={active ? "default" : "ghost"}
                size="sm"
                asChild
                className="w-full justify-start lg:w-auto"
              >
                <Link
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon data-icon="inline-start" />
                  {item.label}
                </Link>
              </Button>
            );
          })}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="outline"
                  aria-label={healthLabel}
                  className={cn(
                    "order-first mb-1 h-8 w-8 self-end justify-center rounded-full p-0 lg:order-last lg:mb-0 lg:self-auto",
                    health === "online" &&
                      "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                    health === "offline" &&
                      "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400",
                    health === "checking" &&
                      "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 animate-pulse",
                  )}
                >
                  <ActivityIcon className="size-4" />
                  <span className="sr-only">{healthLabel}</span>
                </Badge>
              </TooltipTrigger>
              <TooltipContent align="end" side="bottom" sideOffset={6}>
                {healthLabel}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </nav>
      </div>
      {health !== "online" && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/85 backdrop-blur-sm">
          <div className="flex min-w-64 items-center gap-3 rounded-xl border bg-card px-4 py-3 shadow-lg">
            <Spinner className="size-5" />
            <p className="text-sm font-medium text-foreground">{loadingMessage}</p>
          </div>
        </div>
      )}
    </header>
  );
}
