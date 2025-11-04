import React, { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import api, { API_BASE } from "../api";
import { setAccessToken as setAccessTokenHelper } from "./tokenHelper";

type User = {
  _id?: string;
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
};

type AuthContextType = {
  user: User | null;
  signIn: (username: string, password: string) => Promise<void>;
  signUp: (payload: {
    username: string;
    password: string;
    email: string;
    firstName: string;
    lastName: string;
  }) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // on app start: try to restore from refresh token
  useEffect(() => {
    (async () => {
      try {
        const refreshToken = await SecureStore.getItemAsync("refreshToken");
        if (refreshToken) {
          // call refresh to get access token
          const r = await fetch(`${API_BASE}/api/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
          });
          if (r.ok) {
            const data = await r.json();
            const { accessToken } = data;
            await setAccessTokenHelper(accessToken);
            // fetch profile
            const me = await api.get("/users/me");
            setUser(me.data.user ?? null);
          } else {
            // refresh failed -> clear refresh token
            await SecureStore.deleteItemAsync("refreshToken");
            setUser(null);
            await setAccessTokenHelper(null);
          }
        }
      } catch (e) {
        console.warn("Restore session failed", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const signIn = async (username: string, password: string) => {
    const r = await fetch(`${API_BASE}/api/auth/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!r.ok) {
      const err = await r.json().catch(() => null);
      throw new Error((err && err.message) || "Login failed");
    }
    const data = await r.json();
    const { accessToken, refreshToken } = data;
    // save refresh token secure
    await SecureStore.setItemAsync("refreshToken", refreshToken);
    await setAccessTokenHelper(accessToken);
    // fetch profile
    const me = await api.get("/users/me");
    setUser(me.data.user ?? null);
  };

  const signUp = async (payload: {
    username: string;
    password: string;
    email: string;
    firstName: string;
    lastName: string;
  }) => {
    const r = await fetch(`${API_BASE}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!r.ok) {
      const err = await r.json().catch(() => null);
      throw new Error((err && err.message) || "Sign up failed");
    }
  
  };

  const signOut = async () => {
    try {
      const refreshToken = await SecureStore.getItemAsync("refreshToken");
      if (refreshToken) {
        await fetch(`${API_BASE}/api/auth/signout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });
      }
    } catch (e) {
      console.warn("signOut error", e);
    } finally {
      await SecureStore.deleteItemAsync("refreshToken");
      setUser(null);
      await setAccessTokenHelper(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signUp, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

