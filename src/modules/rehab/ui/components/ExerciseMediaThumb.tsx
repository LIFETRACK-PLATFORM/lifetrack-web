"use client";

import { useState } from "react";
import { Icon } from "@/shared/ui/Icon";
import { cn } from "@/shared/lib/utils";

function isVideoUrl(url: string): boolean {
  return (
    /\.(mp4|webm|ogg|mov|m4v)(\?|#|$)/i.test(url) ||
    /(?:youtube\.com|youtu\.be|vimeo\.com)\//i.test(url)
  );
}

function MediaPlaceholder({
  label,
  icon = "fitness_center",
}: {
  label: string;
  icon?: string;
}) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-surface-3 text-text-3">
      <Icon name={icon} className="text-[28px]" />
      <span className="px-2 text-center font-label text-[10px] uppercase tracking-wide">
        {label}
      </span>
    </div>
  );
}

export function ExerciseMediaThumb({
  mediaUrl,
  name,
  className,
}: Readonly<{
  mediaUrl: string | null | undefined;
  name: string;
  className?: string;
}>) {
  const url = mediaUrl?.trim() || null;
  const isVideo = url ? isVideoUrl(url) : false;
  const [failed, setFailed] = useState(false);

  const showPlaceholder = !url || failed;

  return (
    <div
      className={cn(
        "relative h-32 w-32 shrink-0 overflow-hidden rounded-xl border border-border bg-surface-3",
        className,
      )}
    >
      {showPlaceholder && (
        <MediaPlaceholder
          label={failed ? "Sin imagen" : "Sin media"}
          icon={failed ? "broken_image" : "fitness_center"}
        />
      )}

      {url && isVideo && !failed && (
        <>
          <div className="flex h-full w-full items-center justify-center bg-surface-4">
            <Icon name="videocam" className="text-[32px] text-text-3" />
          </div>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute inset-0 flex items-center justify-center bg-primary/10 transition-opacity group-hover:bg-primary/20"
            aria-label={`Ver video de ${name}`}
          >
            <Icon name="play_circle" className="text-metric-xl text-primary" />
          </a>
        </>
      )}

      {url && !isVideo && !failed && (
        // URLs arbitrarias del API; evita romper next/image por remotePatterns
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt=""
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
