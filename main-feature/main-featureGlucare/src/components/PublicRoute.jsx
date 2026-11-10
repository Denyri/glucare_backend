import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PublicRoute = () => {
    const { isAuthenticated, isCompleted, hasAnalysis } = useAuth();

    if (isAuthenticated) {
        if (!isCompleted) {
            return <Navigate to="/input" replace />;
        }
        if (!hasAnalysis) {
            return <Navigate to="/analisis" replace />;
        }
        return <Navigate to="/beranda" replace />;
    }

    return <Outlet />;
};

export default PublicRoute;
