import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  EmailAuthProvider,
  reauthenticateWithCredential,
  deleteUser
} from "firebase/auth";

import { doc, deleteDoc } from "firebase/firestore";
import { loginRequest, registerRequest } from "../services/auth.service";

// Represents the shape of the authenticated user
type User = { 
  uid: string; 
  email: string; 
  firstName?: string; 
  lastName?: string; 
  age?: number 
};

// Defines the structure of the authentication context
type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: any) => Promise<void>;
  logout: () => void;
  deleteAccount: (password: string) => Promise<void>;
  setUser: (u: User | null) => void;
  setToken: (t: string | null) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  // Loads the stored user from localStorage at initialization
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem("uv_user");
    return raw ? JSON.parse(raw) : null;
  });

  // Loads the stored token from localStorage at initialization
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("uv_token")
  );

  // Syncs user state with localStorage
  useEffect(() => {
    if (user) localStorage.setItem("uv_user", JSON.stringify(user));
    else localStorage.removeItem("uv_user");
  }, [user]);

  // Syncs token state with localStorage
  useEffect(() => {
    if (token) localStorage.setItem("uv_token", token);
    else localStorage.removeItem("uv_token");
  }, [token]);


  // --------------------------------------
  // LOGIN: Authenticates user using Firebase + backend
  // --------------------------------------
  async function login(email: string, password: string) {
    // Firebase authentication request
    const fbUser = await signInWithEmailAndPassword(auth, email, password);
    const firebaseToken = await fbUser.user.getIdToken();

    // Backend login with Firebase token
    const res: any = await loginRequest({
      firebaseToken,
      email: fbUser.user.email!,
    });

    if (!res) throw new Error("Invalid credentials");

    // Store session data
    setToken(res.token);
    setUser(res.user);
  }


  // --------------------------------------
  // REGISTER: Creates a Firebase user and registers it in backend
  // --------------------------------------
  async function register(payload: any) {
    const { email, password } = payload;

    // Create user in Firebase authentication
    const fbUser = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseToken = await fbUser.user.getIdToken();

    // Create user in backend database
    await registerRequest({
      firstName: payload.firstName,
      lastName: payload.lastName,
      age: payload.age,
      email: fbUser.user.email ?? payload.email,
      password,
      firebaseToken,
    });
  }


  // --------------------------------------
  // LOGOUT: Clears Firebase session and localStorage
  // --------------------------------------
  function logout() {
    // Firebase logout
    signOut(auth);

    // Clear local state and stored session
    setToken(null);
    setUser(null);
    localStorage.removeItem("uv_token");
    localStorage.removeItem("uv_user");
  }


  // --------------------------------------
  // DELETE ACCOUNT: Requires re-authentication, deletes Firestore + Auth user
  // --------------------------------------
  async function deleteAccount(password: string) {
    const current = auth.currentUser;
    if (!current) throw new Error("No authenticated user");

    try {
      // Step 1: Reauthenticate the user (required for sensitive operations)
      const credential = EmailAuthProvider.credential(current.email!, password);
      await reauthenticateWithCredential(current, credential);

      // Step 2: Delete user document from Firestore
      const userRef = doc(db, "users", current.uid);
      await deleteDoc(userRef);

      // Step 3: Delete user from Firebase Authentication
      await deleteUser(current);

      // Step 4: Clear local session data
      setUser(null);
      setToken(null);
      localStorage.removeItem("uv_user");
      localStorage.removeItem("uv_token");

    } catch (err) {
      console.error("Error deleting account:", err);
      throw err;
    }
  }

  // Expose context values
  return (
    <AuthContext.Provider 
      value={{ user, token, login, register, logout, deleteAccount, setUser, setToken }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to access the Auth context
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
