// src/components/ProtectedRoute.js
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    // Belum login, redirect ke halaman login
    return <Navigate to="/" replace />;
  }

  return children; // Lanjut ke halaman yang dilindungi
};

export default ProtectedRoute;
