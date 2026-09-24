import {
  applicationDefault,
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

function appHostingProjectId() {
  try {
    const config = JSON.parse(process.env.FIREBASE_CONFIG || "{}");
    return typeof config.projectId === "string" ? config.projectId : undefined;
  } catch {
    return undefined;
  }
}

function getFirebaseAdminApp(): App {
  if (getApps().length > 0) {
    return getApp();
  }

  const projectId = process.env.FIREBASE_PROJECT_ID?.trim()
    || process.env.GOOGLE_CLOUD_PROJECT?.trim()
    || process.env.GCLOUD_PROJECT?.trim()
    || appHostingProjectId();
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.trim();
  if (clientEmail && privateKey && projectId) {
    return initializeApp({ credential: cert({
      projectId, clientEmail, privateKey: privateKey.replace(/\\n/g, "\n"),
    }), projectId });
  }
  if (!projectId) throw new Error("firebase-admin/missing-config:FIREBASE_PROJECT_ID");
  // Firebase App Hosting supplies Application Default Credentials to the server.
  return initializeApp({ credential: applicationDefault(), projectId });
}

export function getAdminAuth(): Auth {
  return getAuth(
    getFirebaseAdminApp(),
  );
}

export function getAdminDb(): Firestore {
  return getFirestore(
    getFirebaseAdminApp(),
    "smart-learn-db"
  );
}
