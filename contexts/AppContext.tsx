import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import Cookies from 'js-cookie'; // 쿠키 라이브러리 추가

interface AppContextProps {
    isAuthenticated: boolean;
    checkAuth: () => void;
}

const AppContext = createContext<AppContextProps | null>(null);

export const AppProvider = ({ children }: { children: ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const checkAuth = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/auth/verify`, {
                method: 'GET',
                credentials: 'include', // 쿠키를 포함하여 서버에 인증 요청
            });

            if (response.ok) {
                setIsAuthenticated(true);
            } else {
                setIsAuthenticated(false);
            }
        } catch (error) {
            console.error('Authentication check failed:', error);
            setIsAuthenticated(false);
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
