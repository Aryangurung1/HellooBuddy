import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers";
import { cn, constructMetadata } from "@/lib/utils";
import { Inter } from "next/font/google";
import "./globals.css";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

import "react-loading-skeleton/dist/skeleton.css";
import "simplebar-react/dist/simplebar.min.css";
import { Toaster } from "react-hot-toast"; // Correct import

const inter = Inter({ subsets: ["latin"] });

export const metadata = constructMetadata();

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { getPermission } = getKindeServerSession();
  const adminPermission = await getPermission("admin:permission");
  const isAdmin = adminPermission?.isGranted;

  return (
    <html lang="en" className="light">
      <Providers>
        <body
          className={cn(
            "min-h-screen font-sans antialiased grainy",
            inter.className
          )}
          suppressHydrationWarning
        >
          {/* Render Navbar if the user is not an admin and not on the admin dashboard */}
          {!isAdmin && <Navbar />}

          {/* Render the children (main content of the page) */}
          {children}

          {/* ToastContainer to show toast notifications */}
          <Toaster />
        </body>
      </Providers>
    </html>
  );
}
