import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface AppContextProps {
    isAuthenticated: boolean;
    checkAuth: () => void;
}

const AppContext = createContext<AppContextProps | null>(null);

export const AppProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const checkAuth = async () => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('adminToken');
            if (token) {
                try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/auth/verify`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    if (response.ok && !isAuthenticated) {
                        setIsAuthenticated(true);
                    } else if (!response.ok && isAuthenticated) {
                        localStorage.removeItem('adminToken');
                        setIsAuthenticated(false);
                    }
                } catch (error) {
                    console.error('Invalid token', error);
                    localStorage.removeItem('adminToken');
                    setIsAuthenticated(false);
                }
            } else if (isAuthenticated) {
                setIsAuthenticated(false);
            }
        }
    };



    useEffect(() => {
        checkAuth();
    }, []);

    return <AppContext.Provider value={{ isAuthenticated, checkAuth }}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === null) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};
