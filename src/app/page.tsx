import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

export default function HomePage() {
  return (
    <MainLayout>
      <section className="container flex min-h-[70vh] flex-col items-center justify-center gap-6 py-24 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent">
          <BookOpen className="h-8 w-8 text-primary" />
        </div>

        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Bookery
        </h1>

        <p className="max-w-md text-muted-foreground">
          The project scaffold is ready. Catalog, cart, and checkout will
          arrive in upcoming milestones.
        </p>

        <Button disabled>Coming soon</Button>
      </section>
    </MainLayout>
  );
}
