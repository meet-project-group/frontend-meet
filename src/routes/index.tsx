import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/login";
import RessetPasword from "../pages/ressetpassword";
import Forgot from "../pages/forgot";
import Room from "../pages/room";
import Register from "../pages/register";
import Home from "../pages/home";
import About from "../pages/about";
import ProtectedRoute from "../components/ProtectedRoute";
import EditProfile from "../pages/editprofile";
import DeleteAccount from "../pages/deleteaccount";
import Sitemap from "../pages/sitemap";

/**
 * AppRoutes Component
 * --------------------
 * This component defines all the routes of the application using React Router.
 * It includes:
 *  - Public routes (login, register, etc.)
 *  - Protected routes (home, room, profile settings), wrapped inside <ProtectedRoute>
 *  - Redirect from root ("/") to the login page
 *
 * ProtectedRoute ensures that only authenticated users can access protected pages.
 */
export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ⭐ Root route -> always redirect user to the login page */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/resetpassword" element={<RessetPasword />} />
        <Route path="/forgot" element={<Forgot />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about" element={<About />} />
        <Route path="/sitemap" element={<Sitemap />} />

        {/* Protected routes: only accessible if the user is authenticated */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path="/room/:id"
          element={
            <ProtectedRoute>
              <Room />
            </ProtectedRoute>
          }
        />

        <Route
          path="/editprofile"
          element={
            <ProtectedRoute>
              <EditProfile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/deleteaccount"
          element={
            <ProtectedRoute>
              <DeleteAccount />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}
