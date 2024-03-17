"use client";

import React, { createContext, useContext, useState } from 'react';

const AuthCtx = createContext();

export const useAuth = () => useContext(AuthCtx);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState<string | null>(null);

    const login = (username) => setUser(username);
    const logout = () => setUser(null);

    return (
      <AuthCtx.Provider value={{ user, login, logout }}>
        {children}
      </AuthCtx.Provider>
    );
};
