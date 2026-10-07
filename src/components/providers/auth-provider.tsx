"use client";

import type { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ensureUserProfile,
  signOutUser,
} from "@/lib/firebase/auth-service";
import { auth } from "@/lib/firebase/client";
import type { AppUser } from "@/types/auth";

interface AuthContextValue {
  user: User | null;
  profile: AppUser | null;
  loading: boolean;
  error: string | null;
  refreshProfile: () => Promise<AppUser | null>;
  signOut: () => Promise<void>;
}

export const AuthContext =
  createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [user, setUser] =
    useState<User | null>(null);

  const [profile, setProfile] =
    useState<AppUser | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    let generation = 0;
    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        const ticket = ++generation;
        setLoading(true);
        setError(null);

        if (!currentUser) {
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }

        try {
          const currentProfile =
            await ensureUserProfile(currentUser);

          if (ticket !== generation) return;
          setUser(currentUser);
          setProfile(currentProfile);
        } catch (currentError) {
          if (ticket !== generation) return;
          console.error(
            "No fue posible cargar el perfil:",
            currentError,
          );

          setUser(currentUser);
          setProfile(null);
          setError(
            "No fue posible cargar el perfil del usuario.",
          );
        } finally {
          if (ticket === generation) setLoading(false);
        }
      },
    );

    return () => { generation++; unsubscribe(); };
  }, []);

  const refreshProfile =
    useCallback(async () => {
      if (!user) {
        setProfile(null);
        return null;
      }

      const updatedProfile =
        await ensureUserProfile(user);

      if (auth.currentUser?.uid !== user.uid) return null;
      setProfile(updatedProfile);

      return updatedProfile;
    }, [user]);

  const handleSignOut =
    useCallback(async () => {
      await signOutUser();
      setUser(null);
      setProfile(null);
    }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      loading,
      error,
      refreshProfile,
      signOut: handleSignOut,
    }),
    [
      user,
      profile,
      loading,
      error,
      refreshProfile,
      handleSignOut,
    ],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}