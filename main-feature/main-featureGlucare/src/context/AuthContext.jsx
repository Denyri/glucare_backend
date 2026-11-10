import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext(null);

const STORAGE_KEYS = {
    USER: "currentUser",
    TOKEN: "token",
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const rawUser = localStorage.getItem(STORAGE_KEYS.USER) || sessionStorage.getItem(STORAGE_KEYS.USER);
            return rawUser ? JSON.parse(rawUser) : null;
        } catch {
            return null;
        }
    });

    const [token, setToken] = useState(() => {
        return localStorage.getItem(STORAGE_KEYS.TOKEN) || sessionStorage.getItem(STORAGE_KEYS.TOKEN) || null;
    });

    const [isLoading, setIsLoading] = useState(false);

    // Sync state on localStorage changes across tabs/windows
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === STORAGE_KEYS.USER) {
                try {
                    setUser(e.newValue ? JSON.parse(e.newValue) : null);
                } catch {
                    setUser(null);
                }
            } else if (e.key === STORAGE_KEYS.TOKEN) {
                setToken(e.newValue || null);
            }
        };

        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, []);

    const login = useCallback((userData, tokenData, remember = true) => {
        const storage = remember ? localStorage : sessionStorage;
        const otherStorage = remember ? sessionStorage : localStorage;

        // Clear any conflict in the other storage
        otherStorage.removeItem(STORAGE_KEYS.USER);
        otherStorage.removeItem(STORAGE_KEYS.TOKEN);

        storage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
        if (tokenData) {
            storage.setItem(STORAGE_KEYS.TOKEN, tokenData);
        }

        setUser(userData);
        if (tokenData) setToken(tokenData);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem(STORAGE_KEYS.USER);
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        sessionStorage.removeItem(STORAGE_KEYS.USER);
        sessionStorage.removeItem(STORAGE_KEYS.TOKEN);
        setUser(null);
        setToken(null);
    }, []);

    const updateUser = useCallback((updatedFields) => {
        setUser((prev) => {
            if (!prev) return null;
            const updated = { ...prev, ...updatedFields };
            if (localStorage.getItem(STORAGE_KEYS.USER)) {
                localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
            } else if (sessionStorage.getItem(STORAGE_KEYS.USER)) {
                sessionStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
            } else {
                localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
            }
            return updated;
        });
    }, []);

    const isAuthenticated = Boolean(user && token);
    const isCompleted = Boolean(user && Number(user.is_completed) === 1);
    const hasAnalysis = Boolean(user && Number(user.has_analysis) === 1);

    const value = {
        user,
        token,
        isLoading,
        isAuthenticated,
        isCompleted,
        hasAnalysis,
        login,
        logout,
        updateUser,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export default AuthContext;
