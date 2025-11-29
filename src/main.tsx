// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import AppRoutes from "./routes/index";
import "./styles/_global.sass";
import { AuthProvider } from "./components/AuthProvider";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </React.StrictMode>
);
