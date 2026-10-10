import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@/config/env';

const TOKEN_KEY = 'vawascents_auth_token';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// expo-secure-store has no web implementation — fall back to AsyncStorage there.
export async function getToken(): Promise<string | null> {
  return Platform.OS === 'web' ? AsyncStorage.getItem(TOKEN_KEY) : SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setToken(token: string | null): Promise<void> {
  if (Platform.OS === 'web') {
    if (token) {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    } else {
      await AsyncStorage.removeItem(TOKEN_KEY);
    }
    return;
  }

  if (token) {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } else {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const body = isJson ? await response.json() : null;

  if (!response.ok) {
    throw new ApiError(response.status, body?.message ?? 'Something went wrong. Please try again.');
  }

  return body as T;
}

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  phone_verified_at: string | null;
};

type AuthResponse = { token: string; user: AuthUser; phone_verification_required: boolean };

export const authApi = {
  googleSignIn: (idToken: string) =>
    request<AuthResponse>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ id_token: idToken }),
    }),

  register: (name: string, email: string, phone: string | null, password: string) =>
    request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, phone, password, password_confirmation: password }),
    }),

  login: (identifier: string, password: string) =>
    request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    }),

  sendOtp: (phone: string) =>
    request<{ message: string }>('/auth/otp/send', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    }),

  verifyOtp: (phone: string, code: string) =>
    request<{ user: AuthUser }>('/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ phone, code }),
    }),

  me: () => request<AuthUser>('/auth/user'),

  logout: () => request<void>('/auth/logout', { method: 'POST' }),
};
