"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/shared/lib/utils";

type ThemeToggleProps = {
  className?: string;
  size?: "default" | "sm" | "icon" | "icon-sm";
};

export function ThemeToggle({ className, size = "icon-sm" }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      type="button"
      variant="ghost"
      size={size}
      className={cn("text-text-3 hover:text-text-1", className)}
      aria-label={isDark ? "Activar modo claro" : "Activar modo oscuro"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      disabled={!mounted}
    >
      {mounted && isDark ? (
        <Sun strokeWidth={1.75} className="size-4" />
      ) : (
        <Moon strokeWidth={1.75} className="size-4" />
      )}
    </Button>
  );
}
