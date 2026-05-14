"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIcon,
  BarChart3Icon,
  CarIcon,
  HistoryIcon,
  InfoIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 6000);

    fetch(`${API_BASE_URL}/health`, { signal: controller.signal })
      .then((response) => {
        setHealth(response.ok ? "online" : "offline");
      })
      .catch(() => setHealth("offline"))
      .finally(() => window.clearTimeout(timer));

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, []);

  const healthLabel = useMemo(() => {
    if (health === "checking") return "Checking API";
    if (health === "online") return "API Online";
    return "API Offline";
  }, [health]);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="mx-auto flex min-h-16 w-full max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
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

        <nav className="flex flex-wrap items-center gap-2 cursor-pointer">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Button
                key={item.href}
                variant={active ? "default" : "ghost"}
                size="sm"
                asChild
              >
                <Link href={item.href}>
                  <Icon data-icon="inline-start" />
                  {item.label}
                </Link>
              </Button>
            );
          })}
          <Badge
            variant={
              health === "online"
                ? "default"
                : health === "offline"
                  ? "destructive"
                  : "secondary"
            }
            className={cn("h-9 px-3", health === "checking" && "animate-pulse")}
          >
            <ActivityIcon />
            {healthLabel}
          </Badge>
        </nav>
      </div>
    </header>
  );
}
