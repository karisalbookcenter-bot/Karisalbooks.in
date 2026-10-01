import Link from "next/link";
import { SocialLinks } from "./SocialLinks";

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="container flex min-h-16 flex-col justify-center gap-1 py-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:text-sm">
        <p>&copy; {new Date().getFullYear()} Karisal Books. All rights reserved.</p>
        <div className="flex flex-col items-start gap-3 sm:items-end">
          <SocialLinks />
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-foreground">Terms &amp; Conditions</Link>
            <p>தமிழ் நூல்கள் · இந்தியா முழுவதும்</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
