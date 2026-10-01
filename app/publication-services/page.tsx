import Link from "next/link";
import { BookOpenCheck, Boxes, Sparkles } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { PublicationQuoteForm } from "@/features/publication-services/components/PublicationQuoteForm";

const services = [
  { icon: BookOpenCheck, title: "Thoughtful preparation", text: "We review your manuscript and production needs before recommending the right next steps." },
  { icon: Sparkles, title: "A professional finish", text: "Plan a clear, readable interior and a cover presentation that does justice to your writing." },
  { icon: Boxes, title: "Print built around your goals", text: "Choose a book size, binding, and quantity that suits your readers and budget." },
];

export default function PublicationServicesPage() {
  return (
    <MainLayout>
      <section className="border-b border-border bg-secondary/50">
        <div className="container grid gap-8 py-12 sm:py-16 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-end">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-primary">Karisal Books · Publishing services</p>
            <h1 className="max-w-3xl text-3xl font-semibold leading-tight sm:text-5xl">உங்கள் எழுத்தை அழகான நூலாக மாற்றுவோம்.</h1>
            <p className="mt-4 max-w-2xl text-base font-medium">Your words deserve a thoughtful, professional print edition.</p>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">From manuscript review to print-ready production, we help independent writers take the next step with confidence. Tell us what you are creating; our team will review your files and prepare a quotation around your needs.</p>
            <Link href="#quotation" className="mt-6 inline-flex min-h-11 items-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground hover:opacity-90">Plan my book</Link>
          </div>
          <div className="border-l border-border pl-5 text-sm leading-6 text-muted-foreground">
            <p className="font-semibold text-foreground">For writers at every stage</p>
            <p className="mt-2">Bring a finished manuscript, a work in progress, or simply an idea for your first book. We’ll start with a conversation, not a commitment.</p>
          </div>
        </div>
      </section>

      <section className="container grid gap-6 py-10 sm:grid-cols-3 sm:py-12">
        {services.map(({ icon: Icon, title, text }) => (
          <article key={title} className="border-t-2 border-primary pt-4">
            <Icon size={21} className="text-primary" aria-hidden="true" />
            <h2 className="mt-3 text-base font-semibold">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
          </article>
        ))}
      </section>

      <PublicationQuoteForm />
    </MainLayout>
  );
}