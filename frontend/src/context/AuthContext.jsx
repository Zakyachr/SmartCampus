import React, { createContext, useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Vérifie la session au montage de l'application
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await apiClient.get('/auth.php?action=me');
                setUser(response.data.user);
            } catch (error) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, []);

    const login = async (email, password) => {
        const response = await apiClient.post('/auth.php?action=login', { email, password });
        setUser(response.data.user);
        return response.data;
    };

    const logout = async () => {
        await apiClient.post('/auth.php?action=logout');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};