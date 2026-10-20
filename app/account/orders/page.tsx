import Link from "next/link";
import { ArrowRight, ClipboardList } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { createClient } from "@/lib/supabase/server";
import { getServerAuthUser } from "@/features/auth/services/session.service";

export default async function AccountOrdersPage() {
  const user = await getServerAuthUser();

  if (!user) {
    return (
      <MainLayout>
        <section className="container max-w-4xl py-12 text-center sm:py-16">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
            <ClipboardList size={25} aria-hidden="true" />
          </span>
          <h1 className="mt-4 text-2xl font-bold">Sign in to view your orders</h1>
          <p className="mt-2 text-sm text-muted-foreground">Your order history is available after you sign in.</p>
          <Link href="/login" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground hover:opacity-90">
            Sign in <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </section>
      </MainLayout>
    );
  }

  const supabase = await createClient();

  let { data: orders, error } = await supabase
    .from("orders")
    .select(`
      id,
      purchase_type,
      prebooking_id,
      total_amount,
      status,
      created_at
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error?.code === "42703" && /purchase_type|prebooking_id/.test(error.message)) {
    const fallback = await supabase
      .from("orders")
      .select("id, total_amount, status, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    orders = fallback.data as typeof orders;
  }

  return (
    <MainLayout>
    <section className="container max-w-5xl space-y-6 py-10 sm:py-14">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Your account</p>
        <h1 className="mt-1 text-3xl font-bold">My orders</h1>
      </div>

      {!orders?.length ? (
        <div className="rounded-2xl border border-dashed border-border bg-card px-5 py-12 text-center">
          <ClipboardList size={28} className="mx-auto text-muted-foreground" aria-hidden="true" />
          <p className="mt-3 font-semibold">No orders yet</p>
          <p className="mt-1 text-sm text-muted-foreground">When you place an order, it will appear here.</p>
          <Link href="/books" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground hover:opacity-90">
            Browse books <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.id}`}
              className="group block rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/35 hover:shadow-md"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">

                <div>
                  <p className="font-semibold">
                    {order.purchase_type === "prebooking"
                      ? `Pre-booking ${order.prebooking_id ?? ""}`
                      : order.purchase_type === "mixed"
                        ? `Mixed order ${order.prebooking_id ?? `#${order.id.slice(0, 8)}`}`
                        : order.purchase_type === "combo"
                          ? `Combo offer #${order.id.slice(0, 8)}`
                        : `Order #${order.id.slice(0, 8)}`}
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString("en-IN")}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-bold tabular-nums">
                    ₹{order.total_amount}
                  </p>

                  <p className="mt-1 inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold capitalize text-primary">
                    {order.status}
                  </p>
                </div>
                <ArrowRight size={18} className="text-primary transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
    </MainLayout>
  );
}