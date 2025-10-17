"use client";

import { useEffect, useState, ReactNode } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

interface AuthWrapperProps {
  allowedRoles: string[];
  children: ReactNode;
}

export default function AuthWrapper({ allowedRoles, children }: AuthWrapperProps) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const verifyUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        console.log("[AuthWrapper] No user, redirecting to login...");
        router.replace("/login");
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (error || !profile) {
        console.error("[AuthWrapper] Profile fetch error:", error);
        router.replace("/");
        return;
      }

      console.log("[AuthWrapper] User role:", profile.role);

      if (allowedRoles.includes(profile.role)) {
        setAuthorized(true);
      } else {
        console.warn("[AuthWrapper] Unauthorized role:", profile.role);
        router.replace("/");
      }

      setLoading(false);
    };

    verifyUser();
  }, [router, supabase, allowedRoles]);

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (!authorized) return null;

  return <>{children}</>;
}
