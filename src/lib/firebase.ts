import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  type User
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize or reuse Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Configure Google Auth Provider with Google Workspace Scopes
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/forms.body');
provider.addScope('https://www.googleapis.com/auth/forms.responses.readonly');
provider.addScope('https://www.googleapis.com/auth/spreadsheets');
provider.addScope('https://www.googleapis.com/auth/gmail.send');

// Ensure prompt is shown for incremental consent or account selection if needed
provider.setCustomParameters({
  prompt: 'consent select_account'
});

// In-memory token cache (NEVER persist to localStorage or sessionStorage per Workspace skill guidelines)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        onAuthSuccess?.(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // User is logged in to Firebase but we need OAuth access token from interactive popup
        onAuthSuccess?.(user, null);
      }
    } else {
      cachedAccessToken = null;
      onAuthFailure?.();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('No access token received from Google authentication.');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    // If the user deliberately closed or dismissed the popup window, handle gracefully
    if (
      error?.code === 'auth/popup-closed-by-user' ||
      error?.code === 'auth/cancelled-popup-request'
    ) {
      return null;
    }
    console.error('Google Sign In Error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const setAccessTokenInMemory = (token: string | null) => {
  cachedAccessToken = token;
};

export const logout = async (): Promise<void> => {
  await signOut(auth);
  cachedAccessToken = null;
};

export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};
