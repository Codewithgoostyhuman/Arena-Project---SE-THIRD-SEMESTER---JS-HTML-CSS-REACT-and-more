import { createContext, useContext, useState, useEffect } from "react";
import { apiService } from "../APIs/apiService";
export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const user = await apiService.auth.getMe();
            setCurrentUser(user);
        } catch (error) {
            console.log('Not authenticated');
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const response = await apiService.auth.login(email, password);
        setCurrentUser(response.user);
        return response;
    };

    const register = async (userData) => {
        const response = await apiService.auth.register(userData);
        if (response.user?.status === 'active') {
            setCurrentUser(response.user);
        }
        return response;
    };

    const logout = async () => {
        await apiService.auth.logout();
        setCurrentUser(null);
    };

    return (
        <AuthContext.Provider value={{ currentUser, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
