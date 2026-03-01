'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface User {
    id: string;
    email: string;
    role: 'USER' | 'ADMIN';
}

interface AuthContextType {
    user: User | null;
    login: (token: string, user: User) => void;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [authState, setAuthState] = useState<{ user: User | null; loading: boolean }>({
        user: null,
        loading: true,
    });
    const router = useRouter();

    useEffect(() => {
        // Use queueMicrotask to avoid synchronous setState during mount/effect
        // This prevents the "cascading renders" warning in React 19+
        queueMicrotask(() => {
            try {
                const storedUser = localStorage.getItem('user');
                const token = localStorage.getItem('token');

                if (storedUser && token) {
                    setAuthState({
                        user: JSON.parse(storedUser),
                        loading: false
                    });
                } else {
                    setAuthState(prev => ({ ...prev, loading: false }));
                }
            } catch (error) {
                console.error('Failed to restore auth state:', error);
                setAuthState({ user: null, loading: false });
            }
        });
    }, []);

    const login = (token: string, user: User) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setAuthState({ user, loading: false });

        if (user.role === 'ADMIN') {
            router.push('/admin');
        } else {
            router.push('/dashboard');
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setAuthState({ user: null, loading: false });
        toast.info('Logged out successfully');
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{
            user: authState.user,
            login,
            logout,
            loading: authState.loading
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
