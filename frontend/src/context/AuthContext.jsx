// src/context/AuthContext.jsx
// Stores the logged-in user in sessionStorage with role-based expiry.
// Forces fresh fetches (cache: "no-store") to avoid 304 No Body during development.
// Exposes setAuth, logout, and refreshUser utilities.

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

  // Refresh user data from server.
  // Dev-safe: always use cache: "no-store" when forceNoCache is true (default here).
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
        // Keep existing cached user on error
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

  // Persist normalized auth into sessionStorage and state
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

      // Immediately refresh from server after login to ensure we have freshest fields
      // and to align any server-side changes (roles, badges, etc.)
      (async () => {
        try {
          await refreshUser({ forceNoCache: true });
        } catch {
          // ignore refresh errors here; we already set the normalized user
        }
      })();
    },
    [refreshUser]
  );

  // Clear auth
  const logout = useCallback(() => {
    sessionStorage.removeItem("user");
    setUser(null);
  }, []);

  // On mount: if we have a cached user, refresh with no-store to avoid 304
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const raw = sessionStorage.getItem("user");
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (!parsed) return;

        // If cached session expired, clear it immediately
        if (parsed.expiresAt && parsed.expiresAt < Date.now()) {
          sessionStorage.removeItem("user");
          if (mounted) setUser(null);
          return;
        }

        // Only attempt refresh if we have a voterId (preserves original behavior)
        if (parsed.voterId) {
          const refreshed = await refreshUser({ forceNoCache: true });
          if (!refreshed && mounted) {
            // Extend expiry to keep user logged in if refresh fails
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
