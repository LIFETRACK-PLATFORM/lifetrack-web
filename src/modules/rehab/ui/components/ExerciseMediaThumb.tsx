"use client";

import { Icon } from "@/shared/ui/Icon";

function isVideoUrl(url: string): boolean {
  return (
    /\.(mp4|webm|ogg|mov|m4v)(\?|#|$)/i.test(url) ||
    /(?:youtube\.com|youtu\.be|vimeo\.com)\//i.test(url)
  );
}

export function ExerciseMediaThumb({
  mediaUrl,
  name,
}: Readonly<{
  mediaUrl: string | null;
  name: string;
}>) {
  const url = mediaUrl?.trim() || null;
  const isVideo = url ? isVideoUrl(url) : false;

  return (
    <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-xl border border-border bg-surface-3">
      {!url && (
        <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-text-3">
          <Icon name="fitness_center" className="text-[28px]" />
          <span className="px-2 text-center font-label text-[10px] uppercase tracking-wide">
            Sin media
          </span>
        </div>
      )}

      {url && isVideo && (
        <>
          <div className="flex h-full w-full items-center justify-center bg-surface-4">
            <Icon name="videocam" className="text-[32px] text-text-3" />
          </div>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute inset-0 flex items-center justify-center bg-primary/10 opacity-100 transition-opacity group-hover:bg-primary/20"
            aria-label={`Ver video de ${name}`}
          >
            <Icon name="play_circle" className="text-metric-xl text-primary" />
          </a>
        </>
      )}

      {url && !isVideo && (
        <>
          {/* URLs arbitrarias del API; evita romper next/image por remotePatterns */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={name}
            className="h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              const fallback = e.currentTarget.nextElementSibling;
              if (fallback instanceof HTMLElement) {
                fallback.hidden = false;
              }
            }}
          />
          <div
            hidden
            className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-surface-3 text-text-3"
          >
            <Icon name="broken_image" className="text-[28px]" />
            <span className="px-2 text-center font-label text-[10px] uppercase tracking-wide">
              Sin imagen
            </span>
          </div>
        </>
      )}
    </div>
  );
}
