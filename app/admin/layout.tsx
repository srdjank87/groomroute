import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if user is authenticated (skip for login page)
  const isAuthenticated = await isAdminAuthenticated();

  // Get current path from headers (workaround for server components)
  // The login page will handle its own rendering

  return (
    <AdminLayoutContent isAuthenticated={isAuthenticated}>
      {children}
    </AdminLayoutContent>
  );
}

function AdminLayoutContent({
  children,
  isAuthenticated,
}: {
  children: React.ReactNode;
  isAuthenticated: boolean;
}) {
  // For the login page, we don't redirect - just render it
  // The page component itself will handle the auth check

  return <>{children}</>;
}
