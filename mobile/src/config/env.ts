/**
 * Public env vars (EXPO_PUBLIC_*) are inlined at build time.
 * Google OAuth client IDs come from Google Cloud Console; the backend
 * validates the same set via GOOGLE_CLIENT_IDS (see backend/.env.example).
 */
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://127.0.0.1:8000/api';

export const GOOGLE_CLIENT_IDS = {
  ios: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '',
  android: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? '',
  web: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '',
};
