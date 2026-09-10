import { redirect } from "next/navigation";
import { getServerAuthUser, hasMinimumRole } from "@/features/auth/services/session.service";
import { AuthProvider } from "@/features/auth/context";
import { AdminShell } from "@/features/admin/components/layout";
import { authConfig } from "@/config/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Defense-in-depth server check, per AUTH_ARCHITECTURE.md §7-8 —
  // middleware is the first line of defense, this is the second.
  const user = await getServerAuthUser();

  if (!user) {
    redirect(`${authConfig.routes.login}?redirectTo=/admin`);
  }

  const authorized = await hasMinimumRole(authConfig.minimumAdminRole);

  if (!authorized) {
    redirect(authConfig.routes.unauthorized);
  }

  return (
    <AuthProvider>
      <AdminShell>{children}</AdminShell>
    </AuthProvider>
  );
}
