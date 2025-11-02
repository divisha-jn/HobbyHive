"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import Header from "@/app/components/header";
import Navbar from "@/app/components/Navbar";
import FollowersList from "@/app/components/FollowersList";
import { ChevronLeft, UserPlus, UserMinus, Flag } from "lucide-react";

interface UserProfile {
  id: string;
  username: string;
  profile_picture: string;
  address: string;
  eventsHosted: number;
  eventsParticipated: number;
}

export default function PublicProfilePage() {
  const { id } = useParams();
  const userId = id as string;
  const router = useRouter();
  const supabase = createClient();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  useEffect(() => {
    fetchUserProfile();
    checkCurrentUser();
  }, [userId]);

  const checkCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUserId(user.id);
      checkIfFollowing(user.id);
    }
  };

  const checkIfFollowing = async (currentUserId: string) => {
    try {
      const { data, error } = await supabase
        .from("follows")
        .select("*")
        .eq("follower_id", currentUserId)
        .eq("followed_id", userId)
        .single();

      if (!error && data) {
        setIsFollowing(true);
      }
    } catch (err) {
      console.error("Error checking follow status:", err);
    }
  };

  const fetchUserProfile = async () => {
    try {
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, username, profile_picture, address")
        .eq("id", userId)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        return;
      }

      // Count hosted events
      const { data: hostedEvents, error: hostedError } = await supabase
        .from("events")
        .select("id", { count: "exact" })
        .eq("host_id", userId)
        .eq("status", "approved");

      // Count participated events
      const { data: participatedEvents, error: participatedError } = await supabase
        .from("event_participants")
        .select("event_id", { count: "exact" })
        .eq("user_id", userId);

      // Count followers
      const { data: followers, error: followersError } = await supabase
        .from("follows")
        .select("follower_id", { count: "exact" })
        .eq("followed_id", userId);

      // Count following
      const { data: following, error: followingError } = await supabase
        .from("follows")
        .select("followed_id", { count: "exact" })
        .eq("follower_id", userId);

      setProfile({
        ...profileData,
        eventsHosted: hostedEvents?.length || 0,
        eventsParticipated: participatedEvents?.length || 0,
      });

      setFollowersCount(followers?.length || 0);
      setFollowingCount(following?.length || 0);
    } catch (err) {
      console.error("Error loading profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!currentUserId) {
      alert("Please log in to follow users");
      router.push("/login");
      return;
    }

    if (currentUserId === userId) {
      alert("You cannot follow yourself");
      return;
    }

    setIsProcessing(true);

    try {
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from("follows")
          .delete()
          .eq("follower_id", currentUserId)
          .eq("followed_id", userId);

        if (error) throw error;

        setIsFollowing(false);
        setFollowersCount(prev => prev - 1);
      } else {
        // Follow
        const { error } = await supabase
          .from("follows")
          .insert([{
            follower_id: currentUserId,
            followed_id: userId,
          }]);

        if (error) throw error;

        setIsFollowing(true);
        setFollowersCount(prev => prev + 1);
      }
    } catch (err) {
      console.error("Error toggling follow:", err);
      alert("Failed to update follow status");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFlagProfile = async () => {
    if (!currentUserId) {
      alert("Please log in to flag a profile");
      router.push("/login");
      return;
    }

    if (currentUserId === userId) {
      alert("You cannot flag your own profile");
      return;
    }

    const reason = prompt("Reason for flagging this profile:");
    if (reason === null) return;

    if (!reason.trim()) {
      alert("Please provide a reason for flagging");
      return;
    }

    setIsProcessing(true);
    try {
      console.log("[Flag] Attempting to flag user:", userId);
      console.log("[Flag] Current user:", currentUserId);
      console.log("[Flag] Reason:", reason);

      const {error } = await supabase
        .from("profiles")
        .update({
          is_flagged: true,
          flag_reason: reason,
        })
        .eq("id", userId)

      if (error) {
        console.error("[Flag] Database error:", error.message);
        throw error;
      }

      alert("✅ Profile flagged successfully for admin review");
      setProfile(prev => prev ? { ...prev } : null);
    } catch (err: any) {
      console.error("[Flag] Error flagging profile:", err);
      alert(`❌ Failed to flag profile: ${err.message || err}`);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-teal-400 to-cyan-500 flex items-center justify-center">
        <p className="text-white text-xl">Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-r from-teal-400 to-cyan-500 flex items-center justify-center">
        <p className="text-white text-xl">Profile not found</p>
      </div>
    );
  }

  // If viewing own profile, redirect to profile page
  if (currentUserId === userId) {
    router.push("/profile");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-teal-400 to-cyan-500">
      {/* Navbar */}
      <div className="absolute top-2 left-4 z-50">
        <Navbar />
      </div>

      <Header />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center text-white hover:opacity-80 transition"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back
        </button>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            {/* Profile Picture */}
            <div className="flex flex-col items-center">
              <div className="w-40 h-40 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                {profile.profile_picture ? (
                  <img
                    src={profile.profile_picture}
                    alt={profile.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg
                    className="w-24 h-24 text-gray-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>

              {/* Follow Button */}
              <button
                onClick={handleFollowToggle}
                disabled={isProcessing}
                className={`mt-4 px-6 py-2 rounded-lg transition shadow-md flex items-center gap-2 ${
                  isFollowing
                    ? "bg-gray-300 text-gray-700 hover:bg-gray-400"
                    : "bg-teal-500 text-white hover:bg-teal-600"
                } disabled:opacity-50`}
              >
                {isFollowing ? (
                  <>
                    <UserMinus className="w-4 h-4" />
                    Unfollow
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Follow
                  </>
                )}
              </button>

              {/* Flag Profile Button */}
              <button
                onClick={handleFlagProfile}
                disabled={isProcessing}
                className="mt-3 px-4 py-2 rounded-lg transition shadow-md flex items-center gap-2 bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
              >
                <Flag className="w-4 h-4" />
                Flag Profile
              </button>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {profile.username}
              </h1>

              {/* Stats */}
              <div className="flex gap-8 justify-center md:justify-start mb-6 mt-4 flex-wrap">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-800">
                    {profile.eventsParticipated}
                  </div>
                  <div className="text-sm text-gray-600">Events Participated</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-800">
                    {profile.eventsHosted}
                  </div>
                  <div className="text-sm text-gray-600">Events Hosted</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-800">
                    {followersCount}
                  </div>
                  <div className="text-sm text-gray-600">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-800">
                    {followingCount}
                  </div>
                  <div className="text-sm text-gray-600">Following</div>
                </div>
              </div>

              {/* Address */}
              {profile.address && (
                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">
                    Location
                  </h3>
                  <p className="text-gray-600 whitespace-pre-line">
                    {profile.address}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Followers and Following Lists */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FollowersList userId={userId} type="followers" title={`${profile.username}'s Followers`} />
          <FollowersList userId={userId} type="following" title={`${profile.username} is Following`} />
        </div>
      </div>
    </div>
  );
}
