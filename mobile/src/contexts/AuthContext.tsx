import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import { authApi, AuthUser, getToken, setToken, ApiError } from '@/services/api';

type AuthContextType = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  needsPhoneVerification: boolean;
  /** A saved session exists but is waiting on a biometric prompt before it's usable. */
  locked: boolean;
  biometricsAvailable: boolean;
  loading: boolean;
  signInWithGoogle: (idToken: string) => Promise<void>;
  registerWithPassword: (name: string, email: string, phone: string | null, password: string) => Promise<void>;
  loginWithPassword: (identifier: string, password: string) => Promise<void>;
  sendOtp: (phone: string) => Promise<void>;
  verifyOtp: (phone: string, code: string) => Promise<void>;
  /** Re-prompt Face/Touch ID to resume a locked session. Returns whether it succeeded. */
  unlock: () => Promise<boolean>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function canUseBiometrics(): Promise<boolean> {
  try {
    const [hasHardware, isEnrolled] = await Promise.all([
      LocalAuthentication.hasHardwareAsync(),
      LocalAuthentication.isEnrolledAsync(),
    ]);
    return hasHardware && isEnrolled;
  } catch {
    return false;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [pendingUser, setPendingUser] = useState<AuthUser | null>(null);
  const [needsPhoneVerification, setNeedsPhoneVerification] = useState(false);
  const [locked, setLocked] = useState(false);
  const [biometricsAvailable, setBiometricsAvailable] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        if (!token) return;

        const me = await authApi.me();
        const canLock = await canUseBiometrics();
        setBiometricsAvailable(canLock);

        if (canLock) {
          setPendingUser(me);
          setLocked(true);
        } else {
          setUser(me);
          setNeedsPhoneVerification(!me.phone_verified_at);
        }
      } catch {
        await setToken(null).catch(() => {});
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const applySession = useCallback((nextUser: AuthUser, phoneVerificationRequired: boolean) => {
    setUser(nextUser);
    setNeedsPhoneVerification(phoneVerificationRequired);
    setLocked(false);
    setPendingUser(null);
  }, []);

  const signInWithGoogle = useCallback(
    async (idToken: string) => {
      const { token, user: nextUser, phone_verification_required } = await authApi.googleSignIn(idToken);
      await setToken(token);
      applySession(nextUser, phone_verification_required);
    },
    [applySession],
  );

  const registerWithPassword = useCallback(
    async (name: string, email: string, phone: string | null, password: string) => {
      const { token, user: nextUser, phone_verification_required } = await authApi.register(name, email, phone, password);
      await setToken(token);
      applySession(nextUser, phone_verification_required);
    },
    [applySession],
  );

  const loginWithPassword = useCallback(
    async (identifier: string, password: string) => {
      const { token, user: nextUser, phone_verification_required } = await authApi.login(identifier, password);
      await setToken(token);
      applySession(nextUser, phone_verification_required);
    },
    [applySession],
  );

  const sendOtp = useCallback(async (phone: string) => {
    await authApi.sendOtp(phone);
  }, []);

  const verifyOtp = useCallback(async (phone: string, code: string) => {
    const { user: nextUser } = await authApi.verifyOtp(phone, code);
    setUser(nextUser);
    setNeedsPhoneVerification(false);
  }, []);

  const unlock = useCallback(async (): Promise<boolean> => {
    if (!pendingUser) return false;
    const result = await LocalAuthentication.authenticateAsync({ promptMessage: 'Unlock VawaScents' });
    if (result.success) {
      applySession(pendingUser, !pendingUser.phone_verified_at);
      return true;
    }
    return false;
  }, [pendingUser, applySession]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (err) {
      if (!(err instanceof ApiError)) throw err;
    } finally {
      await setToken(null);
      setUser(null);
      setPendingUser(null);
      setLocked(false);
      setNeedsPhoneVerification(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      needsPhoneVerification,
      locked,
      biometricsAvailable,
      loading,
      signInWithGoogle,
      registerWithPassword,
      loginWithPassword,
      sendOtp,
      verifyOtp,
      unlock,
      logout,
    }),
    [
      user,
      needsPhoneVerification,
      locked,
      biometricsAvailable,
      loading,
      signInWithGoogle,
      registerWithPassword,
      loginWithPassword,
      sendOtp,
      verifyOtp,
      unlock,
      logout,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
