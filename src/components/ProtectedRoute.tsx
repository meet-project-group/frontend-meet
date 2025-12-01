import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import React from "react"; 

interface ProtectedProps {
  children: React.ReactNode;
}

// ProtectedRoute component: restricts access to authenticated users only
export default function ProtectedRoute({ children }: ProtectedProps) {
  const { user } = useAuth();

  // If no authenticated user exists, redirect to login page
  if (!user) return <Navigate to="/login" replace />;

  // Render protected content
  return <>{children}</>;
}
