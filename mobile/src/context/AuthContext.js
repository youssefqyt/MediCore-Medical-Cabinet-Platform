import React, {
  createContext,
  useContext,
  useState,
} from "react";
import { loginRequest, registerRequest, setAccessToken } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(false);

  async function login(email, password) {
    setLoading(true);
    try { const result = await loginRequest({ email, password }); setAccessToken(result.token); setUser(result.user); return result.user; }
    finally { setLoading(false); }
  }
  async function register(name, email, password) {
    setLoading(true);
    try { const result = await registerRequest({ name, email, password }); setAccessToken(result.token); setUser(result.user); return result.user; }
    finally { setLoading(false); }
  }

  function logout() {
    setAccessToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}
