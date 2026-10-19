import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { CompetitiveExamCategories } from "@/features/storefront/components/CompetitiveExamCategories";

export const metadata: Metadata = {
  title: "Competitive Exam Books",
  description:
    "Browse competitive exam and study book categories at Karisal Books, or search the full Tamil book catalogue.",
};

export default function CompetitiveExamsPage() {
  return (
    <MainLayout>
      <section className="container py-10 sm:py-14">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
          Study &amp; prepare
        </p>
        <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold sm:text-4xl">Competitive Exam Books</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Find exam preparation and study books by browsing our available
              categories, or search the full catalogue by title or author.
            </p>
          </div>
          <Link
            href="/books"
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            Search all books <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>

        <CompetitiveExamCategories />
      </section>
    </MainLayout>
  );
}
