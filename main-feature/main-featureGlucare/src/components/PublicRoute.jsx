import { Navigate, Outlet } from 'react-router-dom';

const PublicRoute = () => {
  const user = localStorage.getItem("currentUser") || sessionStorage.getItem("currentUser");
  return user ? <Navigate to="/beranda" replace /> : <Outlet />;
};

export default PublicRoute;
