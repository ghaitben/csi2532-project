"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthCtx = createContext();
const ErrCtx = createContext();
export const useAuth = () => useContext(AuthCtx);
export const useError = () => useContext(ErrCtx);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState<string | null>(null);
    const [error, setError] = useState<string[] | null>(null);
    const [userType, setUserType] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setUser(localStorage.getItem('user'));
            setUserType(localStorage.getItem('userType'));
        }
    }, []);

    const login = (username, userType) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('user', username);
            localStorage.setItem('userType', userType);
            setUser(username);
            setUserType(userType);
        }
    };

    const logout = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('user');
            localStorage.removeItem('userType');
            setUser(null);
            setUserType(null);
        }
    };

    return (
      <AuthCtx.Provider value={{ user, userType, login, logout }}>
      <ErrCtx.Provider value={{ error, setError }}>
        {children}
      </ErrCtx.Provider>
      </AuthCtx.Provider>
    );
};
