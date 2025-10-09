import { createClient } from "./client";
const supabase = createClient();

/* -------------------------------------------------------------------------- */
/* 🧩 AUTH FUNCTIONS */
/* -------------------------------------------------------------------------- */

/** Sign up a new user and create their profile row. */
export async function signup(
  email: string,
  password: string,
  username: string,
  profilePicture?: string
) {
  console.log("[signup] Creating new user...");
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });
  if (authError) throw authError;

  const userId = authData.user?.id;
  if (!userId) throw new Error("User ID not returned from auth.");

  console.log("[signup] Creating profile for user:", userId);
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .insert({
      id: userId,
      username,
      profile_picture: profilePicture ?? null,
    })
    .select()
    .single();
  if (profileError) throw profileError;

  return { user: authData.user, profile };
}

/** Login existing user */
export async function login(email: string, password: string) {
  console.log("[login] Logging in:", email);
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
}

/** Logout current user */
export async function logout() {
  console.log("[logout] Logging out current user");
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/** Get the currently authenticated user */
export const getCurrentUser = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  console.log("[getCurrentUser] session:", data.session);
  return data.session?.user ?? null;
};

/* -------------------------------------------------------------------------- */
/* 🧾 PROFILE FETCHING */
/* -------------------------------------------------------------------------- */

export const fetchProfile = async (userId: string) => {
  console.log("[fetchProfile] fetching profile for", userId);
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data;
};

/* -------------------------------------------------------------------------- */
/* 🖼️ PROFILE PICTURE UPLOAD */
/* -------------------------------------------------------------------------- */

export const uploadProfilePicture = async (userId: string, file: File) => {
  if (!file) return null;
  const fileName = `${userId}_pfp.jpeg`;

  // 🧹 Delete old file first to ensure overwrite
  await supabase.storage.from("user_avatar").remove([fileName]);

  // ✅ Upload new file
  const { error: uploadError } = await supabase.storage
    .from("user-avatars")
    .upload(fileName, file, { upsert: true });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from("user-avatars").getPublicUrl(fileName);
  return data.publicUrl;
};

/* -------------------------------------------------------------------------- */
/* ✏️ UPDATE HELPERS (ONE FIELD AT A TIME) */
/* -------------------------------------------------------------------------- */

/** Update username */
export const updateUsername = async (userId: string, newUsername: string) => {
  console.log("[updateUsername] Updating username for:", userId);
  const { data, error } = await supabase
    .from("profiles")
    .update({ username: newUsername })
    .eq("id", userId)
    .select()
    .single();
  if (error) throw error;
  return data;
};

/** Update password (Auth table) */
export const updatePassword = async (newPassword: string) => {
  console.log("[updatePassword] Updating password");
  const { data, error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
  return data.user;
};

/* -------------------------------------------------------------------------- */
/* ❌ DELETE PROFILE */
/* -------------------------------------------------------------------------- */

export const deleteProfile = async (userId: string) => {
  console.log("[deleteProfile] Deleting profile for:", userId);
  const { data, error } = await supabase.from("profiles").delete().eq("id", userId).single();
  if (error) throw error;
  return data;
};
