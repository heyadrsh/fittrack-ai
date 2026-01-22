import { cookies } from 'next/headers';

const AUTH_COOKIE_NAME = 'fittrack_auth';
const AUTH_PIN = process.env.AUTH_PIN || '0007';
const DEFAULT_USER_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

/**
 * Verify if the provided PIN is correct
 */
export function verifyPin(pin: string): boolean {
  return pin === AUTH_PIN;
}

/**
 * Set authentication cookie after successful login
 */
export async function setAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, DEFAULT_USER_ID, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  });
}

/**
 * Get the authenticated user ID from cookie
 */
export async function getAuthCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(AUTH_COOKIE_NAME);
  return cookie?.value || null;
}

/**
 * Clear authentication cookie (logout)
 */
export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const userId = await getAuthCookie();
  return userId !== null;
}

/**
 * Get the current user ID (for single-user app, always returns default)
 */
export async function getCurrentUserId(): Promise<string | null> {
  return await getAuthCookie();
}

export const DEFAULT_USER = {
  id: DEFAULT_USER_ID,
};
