"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Header from "../components/header";
import AuthWrapper from "../components/AuthWrapper";
import AdminDashboardView from "./views/AdminDashboardView";

const AdminDashboard: React.FC = () => {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <AuthWrapper allowedRoles={["admin"]}>
      <Header />
      <AdminDashboardView onLogout={handleLogout} />
    </AuthWrapper>
  );
};

export default AdminDashboard;
