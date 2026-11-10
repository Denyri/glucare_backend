import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = () => {
    const { isAuthenticated, isCompleted, hasAnalysis } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    // 1. First-time registration/login: Profile must be completed first
    if (!isCompleted && location.pathname !== "/input") {
        return <Navigate to="/input" replace />;
    }

    // 2. Profile complete, but no AI screening done yet: Enforce screening gateway
    const screeningRoutes = ["/analisis", "/kuesioner", "/modeLab", "/hasil"];
    if (isCompleted && !hasAnalysis && !screeningRoutes.includes(location.pathname)) {
        return <Navigate to="/analisis" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
