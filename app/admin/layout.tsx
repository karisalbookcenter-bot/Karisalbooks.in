import { redirect } from "next/navigation";

import { authConfig } from "@/config/auth";
import { AdminShell } from "@/features/admin/components/layout";
import { AuthProvider } from "@/features/auth/context";
import { getServerAuthUser } from "@/features/auth/services/session.service";
import { isAtLeastRole } from "@/constants/roles.constants";

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getServerAuthUser();

  if (!user) {
    redirect(`${authConfig.routes.login}?redirectTo=/admin`);
  }

  if (!isAtLeastRole(user.role, authConfig.minimumAdminRole)) {
    redirect(authConfig.routes.unauthorized);
  }

  return (
    <AuthProvider>
      <AdminShell>{children}</AdminShell>
    </AuthProvider>
  );
}