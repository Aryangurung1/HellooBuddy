import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import { Sidebar } from "./components/sidebar";
import { Header } from "./components/header";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, getPermission } = getKindeServerSession();

  const isLoggedIn = await isAuthenticated();
  if (!isLoggedIn) {
    redirect("/sign-in");
  }

  const requiredPermission = await getPermission("admin:permission");

  if (!requiredPermission?.isGranted) {
    redirect("/dashboard");
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4">{children}</main>
      </div>
    </div>
  );
}
