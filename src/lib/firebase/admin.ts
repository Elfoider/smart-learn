import {
  cert,
  getApp,
  getApps,
  initializeApp,
  type App,
} from "firebase-admin/app";
import {
  getAuth,
  type Auth,
} from "firebase-admin/auth";
import {
  getFirestore,
  type Firestore,
} from "firebase-admin/firestore";

function getRequiredEnvironmentValue(
  name: string,
) {
  const value =
    process.env[name]?.trim();

  if (!value) {
    throw new Error(
      `firebase-admin/missing-config:${name}`,
    );
  }

  return value;
}

function getFirebaseAdminApp(): App {
  if (getApps().length > 0) {
    return getApp();
  }

  const projectId =
    getRequiredEnvironmentValue(
      "FIREBASE_PROJECT_ID",
    );

  const clientEmail =
    getRequiredEnvironmentValue(
      "FIREBASE_CLIENT_EMAIL",
    );

  const privateKey =
    getRequiredEnvironmentValue(
      "FIREBASE_PRIVATE_KEY",
    ).replace(/\\n/g, "\n");

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

export function getAdminAuth(): Auth {
  return getAuth(
    getFirebaseAdminApp(),
  );
}

export function getAdminDb(): Firestore {
  return getFirestore(
    getFirebaseAdminApp(),
  );
}