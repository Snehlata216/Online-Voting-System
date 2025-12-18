// src/context/AuthContext.jsx
// Stores the logged-in user in sessionStorage with role-based expiry.
// Exposes { user, setAuth, logout, refreshUser } via context.

import React, { createContext, useEffect, useState, useCallback } from "react";

export const AuthContext = createContext(null);

const ROLE_EXPIRY = {
  admin: 2 * 60 * 60 * 1000, // 2 hours
  voter: 30 * 60 * 1000,     // 30 minutes
};

function computeExpiry(role) {
  return Date.now() + (ROLE_EXPIRY[role] ?? ROLE_EXPIRY.voter);
}

function normalizeUser(u) {
  const role = u?.role || (u?.voterId ? "voter" : "admin");
  return {
    ...u,
    role,
    expiresAt: computeExpiry(role),
  };
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = sessionStorage.getItem("user");
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (parsed.expiresAt && parsed.expiresAt < Date.now()) {
        sessionStorage.removeItem("user");
        return null;
      }
      return parsed;
    } catch {
      sessionStorage.removeItem("user");
      return null;
    }
  });

  const refreshUser = useCallback(async (opts = { forceNoCache: true }) => {
    try {
      const cachedRaw = sessionStorage.getItem("user");
      const cached = cachedRaw ? JSON.parse(cachedRaw) : null;
      const voterId = cached?.voterId;
      if (!voterId) return null;

      const fetchOptions = {
        method: "GET",
        headers: { Accept: "application/json" },
      };

      if (opts.forceNoCache) {
        fetchOptions.cache = "no-store";
      }

      const res = await fetch(`/api/voters/${voterId}`, fetchOptions);

      if (!res.ok) {
        return null;
      }

      const data = await res.json();
      const normalized = normalizeUser(data);
      sessionStorage.setItem("user", JSON.stringify(normalized));
      setUser(normalized);
      return normalized;
    } catch (err) {
      console.error("refreshUser error:", err);
      return null;
    }
  }, []);

  const setAuth = useCallback(
    (auth) => {
      if (!auth) {
        sessionStorage.removeItem("user");
        setUser(null);
        return;
      }

      const u = auth.user || auth;
      const normalized = normalizeUser(u);
      sessionStorage.setItem("user", JSON.stringify(normalized));
      setUser(normalized);

      (async () => {
        try {
          await refreshUser({ forceNoCache: true });
        } catch {
          // ignore refresh errors here
        }
      })();
    },
    [refreshUser]
  );

  const logout = useCallback(() => {
    sessionStorage.removeItem("user");
    setUser(null);
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const raw = sessionStorage.getItem("user");
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (!parsed) return;

        if (parsed.expiresAt && parsed.expiresAt < Date.now()) {
          sessionStorage.removeItem("user");
          if (mounted) setUser(null);
          return;
        }

        if (parsed.voterId) {
          const refreshed = await refreshUser({ forceNoCache: true });
          if (!refreshed && mounted) {
            const extended = { ...parsed, expiresAt: computeExpiry(parsed.role) };
            sessionStorage.setItem("user", JSON.stringify(extended));
            setUser(extended);
          }
        }
      } catch {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
  }, [refreshUser]);

  return (
    <AuthContext.Provider value={{ user, setAuth, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
