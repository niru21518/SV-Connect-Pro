import { 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged, 
  User 
} from "firebase/auth";
import { auth } from "./firebase";

const ADMIN_SESSION_KEY = "sv_connect_pro_admin_logged_in";

export async function loginAdmin(email: string, pass: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Attempt Firebase Auth
    await signInWithEmailAndPassword(auth, email, pass);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(ADMIN_SESSION_KEY, "true");
    }
    return { success: true };
  } catch (err: any) {
    // Fallback for demo/admin credential check if Firebase Auth fails or project isn't provisioned yet
    if (email === "admin@svconnectpro.com" && (pass === "admin123" || pass === "admin@2025")) {
      if (typeof window !== "undefined") {
        sessionStorage.setItem(ADMIN_SESSION_KEY, "true");
      }
      return { success: true };
    }
    return { 
      success: false, 
      error: err.message || "Invalid Email or Password. Default Admin: admin@svconnectpro.com / admin123" 
    };
  }
}

export async function logoutAdmin(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (e) {
    console.warn("Firebase signout error:", e);
  }
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
  }
}

export function isAdminLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  const session = sessionStorage.getItem(ADMIN_SESSION_KEY);
  return session === "true" || !!auth.currentUser;
}

export function subscribeToAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}
