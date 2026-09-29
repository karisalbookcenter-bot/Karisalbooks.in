import Link from "next/link";

export default function AccountPage() {
  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="mb-6 text-3xl font-bold">
        My Account
      </h1>

      <div className="grid gap-5 md:grid-cols-2">

        <Link
          href="/account/orders"
          className="rounded-lg border p-6 hover:bg-gray-50"
        >
          <h2 className="text-xl font-semibold">
            My Orders
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            View all your orders
          </p>
        </Link>

        <Link
          href="/track-order"
          className="rounded-lg border p-6 hover:bg-gray-50"
        >
          <h2 className="text-xl font-semibold">
            Track Order
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Check courier status
          </p>
        </Link>

      </div>
    </div>
  );
}