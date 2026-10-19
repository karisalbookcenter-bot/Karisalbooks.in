"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, BookOpen } from "lucide-react";
import { listPublicCategories } from "@/features/storefront/services/category.storefront";
import type { Category } from "@/types/category.types";

export function CompetitiveExamCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    listPublicCategories()
      .then((items) => {
        if (active) setCategories(items);
      })
      .catch(() => {
        if (active) setError("Exam and study categories could not be loaded. Please try again.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="mt-8" aria-labelledby="exam-categories">
      <h2 id="exam-categories" className="text-xl font-semibold">Browse categories</h2>
      {loading ? (
        <p role="status" className="mt-4 text-sm text-muted-foreground">
          Loading categories…
        </p>
      ) : error ? (
        <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>
      ) : categories.length ? (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <li key={category.id}>
              <Link
                href={`/categories/${encodeURIComponent(category.slug)}`}
                className="group flex min-h-16 items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:border-primary/40 hover:bg-secondary"
              >
                <span className="flex items-center gap-3">
                  <BookOpen size={18} className="shrink-0 text-primary" aria-hidden="true" />
                  <span>
                    <span className="block font-medium">{category.name}</span>
                    {category.description && (
                      <span className="mt-1 line-clamp-2 block text-xs text-muted-foreground">
                        {category.description}
                      </span>
                    )}
                  </span>
                </span>
                <ArrowRight size={16} className="shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          No categories are available right now. Browse the full catalogue to find books.
        </p>
      )}
    </section>
  );
}
