import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <main className="container flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-2xl font-semibold">Admin access required</h1>
      <p className="text-sm text-muted-foreground">
        You are signed in, but this account is not configured as an admin. Add its email to the server-only ADMIN_EMAILS setting or assign an admin role in Supabase Auth.
      </p>
      <Link href="/login?redirectTo=/admin" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
        Admin sign in
      </Link>
      <Link href="/" className="text-sm text-muted-foreground underline underline-offset-4">Return to store</Link>
    </main>
  );
}