import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!user) {
        // Non connecté, redirection vers le login
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Connecté mais n'a pas le bon rôle (ex: étudiant essaie d'aller sur /admin)
        // Redirection vers son propre dashboard
        return <Navigate to={`/${user.role}/dashboard`} replace />;
    }

    // Tout est OK, on affiche le composant enfant
    return children;
};

export default ProtectedRoute;