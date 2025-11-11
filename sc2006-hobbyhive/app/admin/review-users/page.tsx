"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Header from "@/app/components/header";
import AuthWrapper from "@/app/components/AuthWrapper";
import UserController from "../controllers/UserController";
import ReviewUsersView from "../views/ReviewUsersView";
import { User } from "../models/UserModel";

const ReviewUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchUsername, setSearchUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [showFlaggedOnly, setShowFlaggedOnly] = useState(false);
  const [showBannedOnly, setShowBannedOnly] = useState(false);
  const userController = new UserController();
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    fetchUsers();
  }, [showFlaggedOnly, showBannedOnly]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await userController.loadUsers({
        showFlaggedOnly,
        showBannedOnly,
      });
      setUsers(data);
    } catch (error) {
      alert("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const searchUser = async () => {
    setLoading(true);
    try {
      const data = await userController.searchUsers(searchUsername);
      setUsers(data);
    } catch (error) {
      alert("Failed to search user");
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async (userId: string, username: string) => {
    const duration = prompt("Ban duration in days (leave empty for permanent):");
    const reason = prompt("Reason for ban:");

    if (reason === null) return;

    const confirmBan = confirm(`Ban user "${username}"?`);
    if (!confirmBan) return;

    try {
      const durationDays = duration ? parseInt(duration) : undefined;
      await userController.banUser(userId, reason, durationDays);
      alert("✅ User banned successfully");
      fetchUsers();
    } catch (error) {
      console.error("Failed to ban user:", error);
      alert("❌ Failed to ban user");
    }
  };

  const handleUnbanUser = async (userId: string, username: string) => {
    const confirmUnban = confirm(`Unban user "${username}"?`);
    if (!confirmUnban) return;

    try {
      await userController.unbanUser(userId);
      alert("✅ User unbanned successfully");
      fetchUsers();
    } catch (error) {
      console.error("Failed to unban user:", error);
      alert("❌ Failed to unban user");
    }
  };

  const handleUnflagUser = async (userId: string, username: string) => {
    const confirmUnflag = confirm(`Remove flag from user "${username}"?`);
    if (!confirmUnflag) return;

    try {
      await userController.unflagUser(userId);
      alert("✅ User unflagged successfully");
      fetchUsers();
    } catch (error) {
      console.error("Failed to unflag user:", error);
      alert("❌ Failed to unflag user");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <AuthWrapper allowedRoles={["admin"]}>
      <Header />
      <ReviewUsersView
        users={users}
        loading={loading}
        searchUsername={searchUsername}
        showFlaggedOnly={showFlaggedOnly}
        showBannedOnly={showBannedOnly}
        onSearchChange={setSearchUsername}
        onSearchSubmit={searchUser}
        onFlaggedFilterChange={setShowFlaggedOnly}
        onBannedFilterChange={setShowBannedOnly}
        onBanUser={handleBanUser}
        onUnbanUser={handleUnbanUser}
        onUnflagUser={handleUnflagUser}
        onLogout={handleLogout}
        formatBanDuration={userController.formatBanDuration}
      />
    </AuthWrapper>
  );
};

export default ReviewUsersPage;
