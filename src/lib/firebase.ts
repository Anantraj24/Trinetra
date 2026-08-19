import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Fail fast with clear development message when config is missing
if (
  typeof window !== 'undefined' &&
  (!firebaseConfig.apiKey || !firebaseConfig.projectId)
) {
  throw new Error(
    'Firebase configuration is missing! Please ensure that your .env.local file is correctly populated with the required NEXT_PUBLIC_FIREBASE variables.'
  );
}

let app: FirebaseApp | undefined;

// Ensure Firebase is only initialized once
if (firebaseConfig.apiKey && firebaseConfig.projectId) {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
}

// Export mock objects if initialization failed so the build doesn't crash
export const auth = (app ? getAuth(app) : null) as unknown as Auth;
export const db = (app ? getFirestore(app) : null) as unknown as Firestore;
export { app };

