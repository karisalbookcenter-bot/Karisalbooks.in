import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  Crown,
  Heart,
  PackageCheck,
} from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";

const accountActions = [
  {
    href: "/account/orders",
    title: "My orders",
    description: "Review your order history and order details.",
    action: "View orders",
    icon: ClipboardList,
    tone: "bg-primary/10 text-primary",
  },
  {
    href: "/track-order",
    title: "Track an order",
    description: "Check an order's progress and shipping details.",
    action: "Track order",
    icon: PackageCheck,
    tone: "bg-sky-100 text-sky-800",
  },
  {
    href: "/wishlist",
    title: "Wishlist",
    description: "Find the books you have saved for later.",
    action: "View wishlist",
    icon: Heart,
    tone: "bg-rose-100 text-rose-800",
  },
  {
    href: "/membership/apply",
    title: "Membership",
    description: "Explore available plans and member benefits.",
    action: "Explore plans",
    icon: Crown,
    tone: "bg-amber-100 text-amber-800",
  },
];

export default function AccountPage() {
  return (
    <MainLayout>
      <section className="container max-w-5xl py-10 sm:py-14">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
          Your Karisal Books
        </p>
        <h1 className="mt-1 text-3xl font-bold sm:text-4xl">My account</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          Orders, delivery updates and saved books — choose what you need.
        </p>

        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          {accountActions.map(({ href, title, description, action, icon: Icon, tone }) => (
            <Link
              key={href}
              href={href}
              className="group rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-md sm:p-6"
            >
              <span className={`grid h-12 w-12 place-items-center rounded-2xl ${tone}`}>
                <Icon size={22} aria-hidden="true" />
              </span>
              <h2 className="mt-4 text-lg font-semibold">{title}</h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                {action}
                <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </MainLayout>
  );
}
