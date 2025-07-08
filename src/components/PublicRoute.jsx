import { Navigate, Outlet } from "react-router-dom";

const PublicRoute = () => {
  const token = localStorage.getItem("token");
  return !token ? <Outlet /> : <Navigate to="/tasks" replace />;
};

export default PublicRoute;
