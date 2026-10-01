"use client";

import { useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BookCard } from "./BookCard";
import type { Book } from "@/types/book.types";

interface BookCarouselProps {
  books: Book[];
  authorNamesById: Record<string, string>;
  publisherNamesById: Record<string, string>;
  intervalSeconds: number;
}

export function BookCarousel({ books, authorNamesById, publisherNamesById, intervalSeconds }: BookCarouselProps) {
  const track = useRef<HTMLDivElement>(null);

  function move(direction: -1 | 1) {
    const element = track.current;
    if (!element) return;
    const nearEnd = direction > 0 && element.scrollLeft + element.clientWidth >= element.scrollWidth - 8;
    const nearStart = direction < 0 && element.scrollLeft <= 8;
    if (nearEnd) element.scrollTo({ left: 0, behavior: "smooth" });
    else if (nearStart) element.scrollTo({ left: element.scrollWidth, behavior: "smooth" });
    else element.scrollBy({ left: direction * element.clientWidth * 0.78, behavior: "smooth" });
  }

  useEffect(() => {
    if (books.length < 2) return;
    const timer = window.setInterval(() => {
      const element = track.current;
      if (!element) return;
      const atEnd = element.scrollLeft + element.clientWidth >= element.scrollWidth - 8;
      element.scrollTo({ left: atEnd ? 0 : element.scrollLeft + element.clientWidth * 0.78, behavior: "smooth" });
    }, intervalSeconds * 1000);
    return () => window.clearInterval(timer);
  }, [books.length, intervalSeconds]);

  return (
    <div className="relative">
      {books.length > 1 && (
        <div className="mb-3 flex justify-end gap-2">
          <button type="button" aria-label="Previous arrivals" onClick={() => move(-1)} className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card hover:bg-secondary"><ChevronLeft size={17} /></button>
          <button type="button" aria-label="Next arrivals" onClick={() => move(1)} className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card hover:bg-secondary"><ChevronRight size={17} /></button>
        </div>
      )}
      <div ref={track} className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-3 sm:gap-4">
        {books.map((book) => (
          <div key={book.id} className="min-w-[46%] snap-start sm:min-w-[31%] lg:min-w-[23%]">
            <BookCard book={book} authorName={authorNamesById[book.author_id]} publisherName={book.publisher_id ? publisherNamesById[book.publisher_id] : undefined} />
          </div>
        ))}
      </div>
    </div>
  );
}