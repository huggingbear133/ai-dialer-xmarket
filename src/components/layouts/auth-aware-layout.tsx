"use client";

import { DashboardLayout } from "./dashboard-layout";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Spinner } from "@/components/ui/spinner";
import FooterBase from "../base-footer";

function LoadingScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-2">
      <Spinner className="h-8 w-8" />
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  );
}

export function AuthAwareLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    // Only handle auth state changes for UI updates
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!session) {
        if (pathname !== "/login" && pathname !== "/register") {
          router.push("/login"); // Redirect to login if not authenticated and not on login/register page
        }
      } else {
        // If the user is authenticated and trying to access login/register, redirect to home
        if (pathname === "/login" || pathname === "/register") {
          router.push("/"); // Redirect authenticated user to home
        }
      }
      setLoading(false);
    });

    // Initial loading state update
    setLoading(false);

    return () => {
      subscription.unsubscribe();
    };
  }, [pathname, router, supabase.auth]);

  if (loading) {
    return <LoadingScreen />;
  }

  // Login or Register page doesn't need the dashboard layout
  if (pathname === "/login" || pathname === "/register") {
    return children;
  }

  // For all other routes, use dashboard layout
  return (
    <>
      <DashboardLayout>{children}</DashboardLayout>
      <div className="text-center items-center justify-center">
        <FooterBase />
      </div>
    </>
  );
}
