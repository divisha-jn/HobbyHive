import React from "react";
import { useRouter } from "next/navigation";
import { User } from "../models/UserModel";

interface ReviewUsersViewProps {
  users: User[];
  loading: boolean;
  searchUsername: string;
  showFlaggedOnly: boolean;
  showBannedOnly: boolean;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onFlaggedFilterChange: (checked: boolean) => void;
  onBannedFilterChange: (checked: boolean) => void;
  onBanUser: (userId: string, username: string) => void;
  onUnbanUser: (userId: string, username: string) => void;
  onUnflagUser: (userId: string, username: string) => void;
  onLogout: () => void;
  formatBanDuration: (bannedUntil: string | null) => string;
}

const ReviewUsersView: React.FC<ReviewUsersViewProps> = ({
  users,
  loading,
  searchUsername,
  showFlaggedOnly,
  showBannedOnly,
  onSearchChange,
  onSearchSubmit,
  onFlaggedFilterChange,
  onBannedFilterChange,
  onBanUser,
  onUnbanUser,
  onUnflagUser,
  onLogout,
  formatBanDuration,
}) => {
  const router = useRouter();

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#A8F0EB" }}>
      {/* Logout button */}
      <div className="absolute top-4 right-4">
        <button
          onClick={onLogout}
          className="px-4 py-2 bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Review Users</h1>
          <button
            onClick={() => router.push("/admin")}
            className="px-4 py-2 text-white rounded-lg shadow-md hover:opacity-80"
            style={{ backgroundColor: "#1DDACA" }}
          >
            ← Back to Dashboard
          </button>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex gap-4 mb-4">
            <input
              type="text"
              placeholder="Search by username..."
              value={searchUsername}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && onSearchSubmit()}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={onSearchSubmit}
              className="px-6 py-2 text-white rounded-lg shadow-md hover:opacity-80"
              style={{ backgroundColor: "#1DDACA" }}
            >
              Search
            </button>
          </div>

          <div className="flex gap-6">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showFlaggedOnly}
                onChange={(e) => onFlaggedFilterChange(e.target.checked)}
                className="mr-2 w-4 h-4"
              />
              <span className="text-gray-700">Show flagged users only</span>
            </label>

            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showBannedOnly}
                onChange={(e) => onBannedFilterChange(e.target.checked)}
                className="mr-2 w-4 h-4"
              />
              <span className="text-gray-700">Show banned users only</span>
            </label>
          </div>
        </div>

        {/* Users List */}
        {loading ? (
          <div className="text-center py-8 text-gray-700">Loading...</div>
        ) : users.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
            No users found
          </div>
        ) : (
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-semibold text-gray-800">
                        {user.username}
                      </h3>
                      {user.is_flagged && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full font-medium">
                          FLAGGED
                        </span>
                      )}
                      {user.is_banned && (
                        <span className="px-2 py-1 bg-gray-800 text-white text-xs rounded-full font-medium">
                          BANNED
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-3">{user.email}</p>
                    <p className="text-sm text-gray-500">
                      Joined: {new Date(user.created_at).toLocaleDateString()}
                    </p>

                    {/* Flag Reason */}
                    {user.is_flagged && user.flag_reason && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                        <p className="text-sm text-red-800">
                          <strong>Flag Reason:</strong> {user.flag_reason}
                        </p>
                      </div>
                    )}

                    {/* Ban Information */}
                    {user.is_banned && (
                      <div className="mt-3 p-3 bg-gray-50 border border-gray-300 rounded">
                        <div className="space-y-1">
                          <p className="text-sm text-gray-800">
                            <strong>Ban Reason:</strong>{" "}
                            {user.ban_reason || "No reason provided"}
                          </p>
                          <p className="text-sm text-gray-800">
                            <strong>Ban Duration:</strong>{" "}
                            {formatBanDuration(user.banned_until)}
                          </p>
                          {user.banned_until && (
                            <p className="text-sm text-gray-600">
                              <strong>Expires:</strong>{" "}
                              {new Date(user.banned_until).toLocaleDateString()} at{" "}
                              {new Date(user.banned_until).toLocaleTimeString()}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4 flex-wrap justify-end">
                    {/* Only show Unflag button if user is flagged */}
                    {user.is_flagged && (
                      <button
                        onClick={() => onUnflagUser(user.id, user.username)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-md"
                      >
                        Unflag
                      </button>
                    )}

                    {/* Ban/Unban buttons */}
                    {user.is_banned ? (
                      <button
                        onClick={() => onUnbanUser(user.id, user.username)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md"
                      >
                        Unban User
                      </button>
                    ) : (
                      <button
                        onClick={() => onBanUser(user.id, user.username)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-md"
                      >
                        Ban User
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewUsersView;
