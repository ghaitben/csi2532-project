"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from "next/navigation";

const AuthCtx = createContext();
const ErrCtx = createContext();
export const useAuth = () => useContext(AuthCtx);
export const useError = () => useContext(ErrCtx);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState<string | null>(null);
    const [userId, setUserId] = useState<int | null>(null);
    const [userType, setUserType] = useState<string | null>(null);
    const [error, setError] = useState<string[] | null>(null);
    const router = useRouter();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setUser(localStorage.getItem('user'));
            setUserType(localStorage.getItem('userType'));
            setUserId(localStorage.getItem('userId'));
        }
    }, []);

    const login = (username, userType, user_id) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('user', username);
            localStorage.setItem('userType', userType);
            localStorage.setItem('userId', user_id);
            setUser(username);
            setUserType(userType);
            setUserId(user_id);
        }
    };

    const logout = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('user');
            localStorage.removeItem('userType');
            localStorage.removeItem('userId');
            setUser(null);
            setUserType(null);
            router.push("/");
        }
    };

    return (
      <AuthCtx.Provider value={{ user, userType, userId, login, logout }}>
      <ErrCtx.Provider value={{ error, setError }}>
        {children}
      </ErrCtx.Provider>
      </AuthCtx.Provider>
    );
};
