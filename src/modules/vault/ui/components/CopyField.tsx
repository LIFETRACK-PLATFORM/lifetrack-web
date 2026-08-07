"use client";

import { useState } from "react";
import { Icon } from "@/shared/ui/Icon";

export function CopyField({
  label,
  value,
  mono = false,
  masked = false,
  visible = true,
}: {
  label: string;
  value: string;
  mono?: boolean;
  masked?: boolean;
  visible?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback silencioso si el navegador bloquea el portapapeles
    }
  };

  const displayValue =
    masked && !visible ? "••••••••••••" : value;

  return (
    <div className="flex items-center gap-2 rounded-lg border border-border/30 bg-surface-1 px-3 py-2">
      <div className="min-w-0 flex-1">
        <p className="font-label text-label-md text-text-3">{label}</p>
        <p
          className={`truncate text-body-md text-text-1 ${
            mono ? "font-mono" : ""
          }`}
        >
          {displayValue}
        </p>
      </div>
      <button
        type="button"
        onClick={handleCopy}
        className="shrink-0 rounded-lg p-2 text-text-3 transition-colors hover:bg-surface-3 hover:text-primary"
        title={copied ? "Copiado" : `Copiar ${label.toLowerCase()}`}
        aria-label={copied ? "Copiado" : `Copiar ${label.toLowerCase()}`}
      >
        <Icon
          name={copied ? "check" : "copy"}
          className={`text-[18px] ${copied ? "text-success" : ""}`}
        />
      </button>
    </div>
  );
}
