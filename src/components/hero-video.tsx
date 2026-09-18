"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { MEDIA_ASSETS, HERO_BREAKPOINT_PX } from "@/data/media-assets";
import { cn } from "@/lib/utils";

type Variant = "desktop" | "mobile";

function preferReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function pickVariant(): Variant {
  if (typeof window === "undefined") return "desktop";
  return window.matchMedia(`(min-width: ${HERO_BREAKPOINT_PX}px)`).matches
    ? "desktop"
    : "mobile";
}

export function HeroVideo({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const desktop = MEDIA_ASSETS.heroDesktop;
  const mobile = MEDIA_ASSETS.heroMobile;
  const [variant, setVariant] = useState<Variant>("desktop");
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [failed, setFailed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const labelId = useId();

  useEffect(() => {
    const apply = () => setVariant(pickVariant());
    apply();
    const mq = window.matchMedia(`(min-width: ${HERO_BREAKPOINT_PX}px)`);
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const active = variant === "desktop" ? desktop : mobile;
  const inactive = variant === "desktop" ? mobile : desktop;

  const tryPlay = useCallback(async () => {
    const el = videoRef.current;
    if (!el || userPaused || preferReducedMotion()) return;
    try {
      el.muted = true;
      await el.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  }, [userPaused]);

  useEffect(() => {
    setFailed(false);
    setReady(false);
    setPlaying(false);
    const el = videoRef.current;
    if (!el) return;
    el.load();
    if (!preferReducedMotion() && !userPaused) {
      void tryPlay();
    }
  }, [variant, tryPlay, userPaused]);

  useEffect(() => {
    const section = sectionRef.current;
    const el = videoRef.current;
    if (!section || !el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          el.pause();
          setPlaying(false);
        } else if (!userPaused && !preferReducedMotion()) {
          void tryPlay();
        }
      },
      { threshold: 0.25 }
    );
    io.observe(section);

    const onVis = () => {
      if (document.hidden) {
        el.pause();
        setPlaying(false);
      } else if (!userPaused && !preferReducedMotion()) {
        void tryPlay();
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [tryPlay, userPaused, variant]);

  function togglePlay() {
    const el = videoRef.current;
    if (!el) return;
    if (playing) {
      el.pause();
      setPlaying(false);
      setUserPaused(true);
    } else {
      setUserPaused(false);
      void el.play().then(
        () => setPlaying(true),
        () => setPlaying(false)
      );
    }
  }

  return (
    <section
      ref={sectionRef}
      className={cn("relative overflow-hidden bg-neutral-900", className)}
      aria-labelledby={labelId}
    >
      {/* Reserve layout space — different aspect per viewport */}
      <div className="relative min-h-[78vh] md:min-h-[78vh]">
        {/* Poster always painted first */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={active.posterPath}
          alt=""
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-500",
            ready && playing && !failed ? "opacity-0" : "opacity-100"
          )}
          aria-hidden
        />

        {!failed ? (
          <video
            key={active.localPath}
            ref={videoRef}
            className={cn(
              "absolute inset-0 h-full w-full object-cover transition-opacity duration-500",
              ready ? "opacity-100" : "opacity-0"
            )}
            src={active.localPath}
            muted
            playsInline
            loop
            preload="metadata"
            poster={active.posterPath}
            onLoadedData={() => setReady(true)}
            onCanPlay={() => {
              setReady(true);
              if (!preferReducedMotion() && !userPaused) void tryPlay();
            }}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onError={() => setFailed(true)}
            aria-hidden
          />
        ) : null}

        {/* Do not preload the inactive variant */}
        <link rel="preload" as="image" href={active.posterPath} />
        <span className="sr-only" data-inactive-hero={inactive.localPath} />

        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/25 to-black/20" />

        <div className="relative z-10 mx-auto flex min-h-[78vh] max-w-6xl flex-col justify-end px-4 pb-16 sm:px-6 sm:pb-24">
          <p id={labelId} className="sr-only">
            Veltrano
          </p>
          {children}
        </div>

        <button
          type="button"
          onClick={togglePlay}
          className="absolute bottom-4 end-4 z-20 rounded-full border border-white/40 bg-black/40 px-3 py-2 text-xs text-white backdrop-blur-sm hover:bg-black/55 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          aria-pressed={playing}
        >
          {playing ? "Pause" : "Lecture"}
        </button>
      </div>
    </section>
  );
}
