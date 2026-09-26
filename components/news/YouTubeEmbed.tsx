"use client";
import Image from "next/image";
import { useState } from "react";
import { PlayIcon } from "../site/Icons";

/** Lightweight YouTube player: loads the real iframe only when the reader presses play. */
export function YouTubeEmbed({ id, title, priority = false }: { id: string; title: string; priority?: boolean }) {
  const [play, setPlay] = useState(false);
  return (
    <div className="relative aspect-video overflow-hidden bg-navy-950">
      {play ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      ) : (
        <button type="button" onClick={() => setPlay(true)} className="group absolute inset-0 h-full w-full" aria-label={`Play video: ${title}`}>
          <Image src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" fill sizes="(min-width: 1024px) 60vw, 100vw" priority={priority} className="object-cover opacity-90 transition group-hover:opacity-100" />
          <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-gold-500 text-navy-950 shadow-lg transition group-hover:scale-105">
            <PlayIcon className="ml-1 h-7 w-7" />
          </span>
        </button>
      )}
    </div>
  );
}
