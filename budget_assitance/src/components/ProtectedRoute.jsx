import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";

const ProtectedRoute = ({ children }) => {
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (currentUser !== undefined) {
            setLoading(false);
        }
    }, [currentUser]);

    if (loading) return null; // Prevent flickering effect

    return currentUser ? children : <Navigate to="/signup" replace />;
};

export default ProtectedRoute;
