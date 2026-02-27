import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children, requiredRole }) {
  const token = localStorage.getItem("token"); 
  const user = JSON.parse(localStorage.getItem("user") || "null"); 
  const location = useLocation();

  if (!token) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
}