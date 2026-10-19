import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import { ROUTES } from "@/constants/routes.constants";
import { SocialLinks } from "./SocialLinks";

export function Footer() {
  return (
    <footer className="mt-10 border-t border-border bg-secondary/30">
      <div className="container grid gap-8 py-9 sm:grid-cols-2 lg:grid-cols-4 lg:py-12">
        <div>
          <Link href={ROUTES.HOME} className="text-lg font-semibold text-foreground hover:text-primary">
            Karisal Books
          </Link>
          <p className="mt-2 max-w-xs text-sm leading-6 text-muted-foreground">
            தமிழ் நூல்கள் · இந்தியா முழுவதும்
          </p>
          <address className="mt-4 text-sm not-italic leading-6 text-muted-foreground">
            Karisal Book Center
            <br />
            1-337, East Street, Kalingapatti
            <br />
            Tenkasi District - 627719
          </address>
          <a
            href="https://www.google.com/maps/search/?api=1&query=Karisal+Book+Center%2C+1-337+East+Street%2C+Kalingapatti%2C+Tenkasi+District+627719"
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-full border border-primary/20 bg-card px-3 text-xs font-semibold text-primary transition-colors hover:border-primary/40 hover:bg-primary/5"
          >
            <MapPin size={15} aria-hidden="true" />
            Get directions
            <ArrowUpRight size={13} aria-hidden="true" />
          </a>
        </div>

        <nav aria-label="Shop" className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Shop</h2>
          <Link href={ROUTES.BOOKS} className="block text-sm text-muted-foreground hover:text-primary">All books &amp; categories</Link>
          <Link href={ROUTES.RECOMMENDATIONS} className="block text-sm text-muted-foreground hover:text-primary">Recommendations</Link>
          <Link href={ROUTES.OFFER_ZONE} className="block text-sm text-muted-foreground hover:text-primary">Offers</Link>
          <Link href={ROUTES.WISHLIST} className="block text-sm text-muted-foreground hover:text-primary">Wishlist</Link>
        </nav>

        <nav aria-label="Services and orders" className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Services &amp; orders</h2>
          <Link href={ROUTES.MEMBERSHIP_APPLY} className="block text-sm text-muted-foreground hover:text-primary">Membership</Link>
          <Link href={ROUTES.PRE_BOOKING} className="block text-sm text-muted-foreground hover:text-primary">Pre-booking</Link>
          <Link href={`${ROUTES.PRE_BOOKING}?mode=bulk`} className="block text-sm text-muted-foreground hover:text-primary">Bulk book orders</Link>
          <Link href={ROUTES.PUBLICATION_SERVICES} className="block text-sm text-muted-foreground hover:text-primary">Publish a book</Link>
          <Link href={ROUTES.TRACK_ORDER} className="block text-sm text-muted-foreground hover:text-primary">Track an order</Link>
        </nav>

        <nav aria-label="Help and policies" className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Help &amp; policies</h2>
          <Link href={ROUTES.ABOUT} className="block text-sm text-muted-foreground hover:text-primary">About &amp; location</Link>
          <Link href={ROUTES.CONTACT} className="block text-sm text-muted-foreground hover:text-primary">Contact us</Link>
          <Link href={ROUTES.ACCOUNT} className="block text-sm text-muted-foreground hover:text-primary">My account &amp; orders</Link>
          <Link href={ROUTES.TERMS} className="block text-sm text-muted-foreground hover:text-primary">Terms &amp; Conditions</Link>
          <Link href={ROUTES.REFUND_POLICY} className="block text-sm text-muted-foreground hover:text-primary">Refund Policy</Link>
          <Link href={ROUTES.PRIVACY_POLICY} className="block text-sm text-muted-foreground hover:text-primary">Privacy Policy</Link>
        </nav>
      </div>

      <div className="border-t border-border">
        <div className="container flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Karisal Books. All rights reserved.
          </p>
          <SocialLinks />
        </div>
      </div>
    </footer>
  );
}
