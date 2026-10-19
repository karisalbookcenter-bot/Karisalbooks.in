"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, Pause, Play } from "lucide-react";

import { StorefrontSearch } from "@/features/storefront/components/StorefrontSearch";
import type { Book } from "@/types/book.types";

interface StorefrontHeroProps {
  books: Book[];
  offer?: {
    id: string;
    title: string;
    discountPercentage: number;
    endDate: string;
    posterUrl: string;
  } | null;
  authorNamesById: Record<string, string>;
  loading: boolean;
}

export function StorefrontHero({
  books,
  offer,
  authorNamesById,
  loading,
}: StorefrontHeroProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const slideCount = books.length + (offer ? 1 : 0);

  useEffect(() => {
    setReducedMotion(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }, []);

  useEffect(() => {
    if (slideCount < 2 || paused || hovered || reducedMotion) return;

    const timer = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % slideCount);
    }, 6500);

    return () => window.clearInterval(timer);
  }, [slideCount, paused, hovered, reducedMotion]);

  useEffect(() => {
    if (activeIndex >= slideCount) setActiveIndex(0);
  }, [activeIndex, slideCount]);

  const offerIndex = books.length > 0 ? 1 : 0;
  const activeOffer = offer && activeIndex === offerIndex ? offer : null;
  const activeBookIndex =
    offer && activeIndex > offerIndex ? activeIndex - 1 : activeIndex;
  const activeBook = activeOffer ? null : books[activeBookIndex];

  function moveSlide(direction: -1 | 1) {
    setActiveIndex((index) => (index + direction + slideCount) % slideCount);
  }

  return (
    <section className="overflow-hidden bg-[#202044] text-white" aria-label="Welcome to Karisal Books">
      <div className="container relative grid min-h-[17rem] grid-cols-[minmax(0,1fr)_minmax(7rem,0.8fr)] items-center gap-2 py-5 sm:min-h-[25rem] sm:grid-cols-[1.1fr_0.9fr] sm:gap-10 sm:py-10 lg:min-h-[29rem] lg:py-12">
        <div className="relative z-10">
          <p className="mb-2 inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.16em] text-amber-300 sm:mb-3 sm:text-[11px] sm:tracking-[0.2em]">
            <span className="h-px w-5 bg-amber-300 sm:w-7" />
            Karisal Book Center
          </p>
          <h1 className="max-w-xl font-serif text-[1.65rem] font-semibold leading-[1.08] tracking-tight text-white sm:text-5xl sm:leading-[1.12] lg:text-[3.5rem]">
            Find your next book.
          </h1>
          <p className="mt-4 hidden max-w-lg text-sm leading-6 text-white/75 sm:block sm:text-base sm:leading-7">
            Explore our bookshelves or search for a title by name or author.
          </p>

          <div className="mt-3 max-w-xl sm:mt-5">
            <StorefrontSearch variant="field" />
          </div>
          <Link
            href="/books"
            className="mt-2 inline-flex min-h-9 items-center gap-1.5 text-xs font-bold text-amber-300 underline decoration-amber-300/50 underline-offset-4 transition-colors hover:text-amber-200 sm:mt-4 sm:min-h-11 sm:gap-2 sm:text-sm"
          >
            Shop all books <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>

        <div
          className="relative flex min-h-56 items-center justify-center sm:min-h-80"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onFocusCapture={() => setPaused(true)}
          aria-roledescription="carousel"
          aria-label="Featured books and current offers"
        >
          <span className="absolute h-40 w-40 rounded-full bg-amber-400/20 blur-2xl sm:h-72 sm:w-72" aria-hidden="true" />
          <span className="absolute right-[12%] top-[9%] h-3 w-3 rounded-full bg-amber-300" aria-hidden="true" />
          <span className="absolute bottom-[12%] left-[15%] h-2 w-2 rounded-full bg-indigo-300" aria-hidden="true" />

          <div
            key={activeOffer ? `offer-${activeOffer.id}` : activeBook?.id ?? (loading ? "loading" : "bookshop")}
            className="relative z-10"
            style={{ animation: reducedMotion ? undefined : "storefront-book-in 500ms ease-out" }}
          >
            {activeOffer ? (
              <Link
                href="/offer-zone"
                aria-label={`View offer: ${activeOffer.title}`}
                className="group relative block h-40 w-full max-w-[10rem] overflow-hidden rounded-xl border border-white/80 bg-white p-1 shadow-[0_24px_45px_rgba(8,8,30,0.35)] transition-transform duration-300 hover:-translate-y-1 sm:h-72 sm:w-[min(36vw,25rem)] sm:max-w-none"
              >
                <Image
                  src={activeOffer.posterUrl}
                  alt={`${activeOffer.title} offer`}
                  fill
                  priority
                  sizes="(max-width: 639px) 80vw, 400px"
                  className="object-contain"
                />
              </Link>
            ) : activeBook?.cover_image_url ? (
              <Link
                href={`/books/${activeBook.slug}`}
                aria-label={`View ${activeBook.title}`}
                className="group relative block h-40 w-28 -rotate-2 overflow-hidden rounded-md bg-white p-1 shadow-[0_24px_45px_rgba(8,8,30,0.35)] transition-transform duration-500 hover:rotate-0 hover:scale-[1.03] sm:h-72 sm:w-48"
              >
                <Image
                  src={activeBook.cover_image_url}
                  alt={`Cover of ${activeBook.title}`}
                  fill
                  priority
                  sizes="(max-width: 639px) 144px, 192px"
                  className="object-contain"
                />
              </Link>
            ) : loading ? (
              <div className="h-40 w-28 animate-pulse rounded-md bg-white/70 shadow-xl sm:h-72 sm:w-48" aria-hidden="true" />
            ) : (
              <div className="flex h-40 w-28 -rotate-2 flex-col items-center justify-center rounded-md border border-white/80 bg-gradient-to-br from-indigo-500 to-[#202044] p-3 text-center text-white shadow-[0_24px_45px_rgba(8,8,30,0.35)] sm:h-72 sm:w-48 sm:p-5">
                <BookOpen size={34} strokeWidth={1.4} aria-hidden="true" />
                <span className="mt-4 font-serif text-lg">Karisal Books</span>
                <span className="mt-2 text-xs text-white/75">Find your next read</span>
              </div>
            )}
          </div>

          {(activeBook || activeOffer) && (
            <div className="absolute bottom-0 left-1/2 z-20 w-[min(95%,11rem)] -translate-x-1/2 rounded-lg border border-white/70 bg-white/95 px-2 py-1.5 shadow-lg backdrop-blur sm:bottom-3 sm:w-[min(92%,20rem)] sm:rounded-xl sm:px-4 sm:py-2.5">
              {activeOffer && (
                <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-amber-800 sm:text-[10px] sm:tracking-[0.15em]">
                  {activeOffer.discountPercentage}% off · limited time
                </p>
              )}
              <p className="mt-0.5 line-clamp-1 text-xs font-semibold text-[#202044] sm:mt-1 sm:text-sm">
                {activeOffer?.title ?? activeBook?.title}
              </p>
              {activeBook && authorNamesById[activeBook.author_id] && (
                <p className="mt-0.5 hidden line-clamp-1 text-xs text-muted-foreground sm:block">
                  {authorNamesById[activeBook.author_id]}
                </p>
              )}
              {activeOffer && (
                <p className="mt-0.5 hidden text-xs text-primary sm:block">
                  Valid through {new Date(`${activeOffer.endDate}T00:00:00`).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                </p>
              )}
            </div>
          )}

          {slideCount > 1 && (
            <div className="absolute right-0 top-0 z-20 flex items-center gap-1 sm:right-2 sm:top-3 sm:gap-1.5">
              <button
                type="button"
                aria-label="Previous featured book"
                onClick={() => moveSlide(-1)}
                className="grid h-8 w-8 place-items-center rounded-full border border-white/80 bg-white/90 text-[#202044] shadow-sm transition-colors hover:bg-white sm:h-9 sm:w-9"
              >
                <ArrowLeft size={16} aria-hidden="true" />
              </button>
              {!reducedMotion && (
                <button
                  type="button"
                  aria-label={paused ? "Play book slideshow" : "Pause book slideshow"}
                  onClick={() => setPaused((value) => !value)}
                  className="grid h-8 w-8 place-items-center rounded-full border border-white/80 bg-white/90 text-[#202044] shadow-sm transition-colors hover:bg-white sm:h-9 sm:w-9"
                >
                  {paused ? <Play size={15} aria-hidden="true" /> : <Pause size={15} aria-hidden="true" />}
                </button>
              )}
              <button
                type="button"
                aria-label="Next featured book"
                onClick={() => moveSlide(1)}
                className="grid h-8 w-8 place-items-center rounded-full border border-white/80 bg-white/90 text-[#202044] shadow-sm transition-colors hover:bg-white sm:h-9 sm:w-9"
              >
                <ArrowRight size={16} aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
