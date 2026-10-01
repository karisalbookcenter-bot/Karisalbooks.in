import Link from "next/link";
import Image from "next/image";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Image
            src="/karisalbooks-mark.svg"
            alt=""
            width={32}
            height={32}
            priority
            className="h-8 w-8 shrink-0"
          />
          <span className="text-base sm:text-lg">Karisal Books</span>
        </Link>

        <nav aria-label="Main navigation" className="flex items-center gap-3 text-xs text-muted-foreground sm:gap-6 sm:text-sm">
          <Link href="/books" className="transition-colors hover:text-foreground">Books</Link>
          <Link href="/membership/apply" className="transition-colors hover:text-foreground">
            Membership
          </Link>
          <Link href="/cart" className="transition-colors hover:text-foreground">Cart</Link>
        </nav>
      </div>
    </header>
  );
}
