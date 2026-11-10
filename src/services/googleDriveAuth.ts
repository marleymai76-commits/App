import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../lib/firebaseClient';

/**
 * Scopes requested for Google Drive Backup integration.
 * In compliance with the least-privilege principle, drive.file allows the app
 * to create, view, and manage backup files created by this application.
 */
export const DRIVE_SCOPES = [
  'https://www.googleapis.com/auth/drive.file'
];

const driveProvider = new GoogleAuthProvider();
DRIVE_SCOPES.forEach(scope => driveProvider.addScope(scope));

// In-memory token cache (never persisted in localStorage/sessionStorage)
let cachedDriveAccessToken: string | null = null;
let isAuthenticating = false;

// Clear cached token when user signs out
if (typeof window !== 'undefined') {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      cachedDriveAccessToken = null;
    }
  });
}

/**
 * Obtains a valid Google Drive OAuth access token with in-memory caching.
 * Prompts user with Google Sign-In popup if no valid token exists.
 */
export async function getGoogleDriveAccessToken(forcePrompt = false): Promise<{ accessToken: string; user: User }> {
  if (cachedDriveAccessToken && !forcePrompt && auth.currentUser) {
    return { accessToken: cachedDriveAccessToken, user: auth.currentUser };
  }

  if (isAuthenticating) {
    throw new Error('Autenticação com Google Drive já em andamento. Aguarde...');
  }

  try {
    isAuthenticating = true;
    const result = await signInWithPopup(auth, driveProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);

    if (!credential?.accessToken) {
      throw new Error('Não foi possível obter o token de acesso do Google Drive.');
    }

    cachedDriveAccessToken = credential.accessToken;
    return { accessToken: cachedDriveAccessToken, user: result.user };
  } catch (error: any) {
    console.error('[GoogleDriveAuth] Erro ao autenticar no Google:', error);
    throw error;
  } finally {
    isAuthenticating = false;
  }
}

/**
 * Returns whether a Google Drive access token is currently cached in memory.
 */
export function hasGoogleDriveToken(): boolean {
  return !!cachedDriveAccessToken;
}

/**
 * Resets the in-memory cached token.
 */
export function clearGoogleDriveToken(): void {
  cachedDriveAccessToken = null;
}
