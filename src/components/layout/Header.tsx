import Link from "next/link";
import { BookMarked } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <BookMarked className="h-5 w-5 text-primary" />
          <span className="text-lg tracking-tight">Bookery</span>
        </Link>

        <nav className="flex items-center gap-6 text-sm text-muted-foreground">
          <span className="cursor-default">Browse</span>
          <span className="cursor-default">Categories</span>
          <span className="cursor-default">About</span>
        </nav>
      </div>
    </header>
  );
}
