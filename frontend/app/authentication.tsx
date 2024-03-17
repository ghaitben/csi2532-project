"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthCtx = createContext();

export const useAuth = () => useContext(AuthCtx);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setUser(localStorage.getItem('user'));
        }
    }, []);

    const login = (username) => setUser(username);
    const logout = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('user');
            setUser(null);
        }
    };

    return (
      <AuthCtx.Provider value={{ user, login, logout }}>
        {children}
      </AuthCtx.Provider>
    );
};
