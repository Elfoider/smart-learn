import type {
  User,
  UserCredential,
} from "firebase/auth";
import {
  browserLocalPersistence,
  browserSessionPersistence,
  GoogleAuthProvider,
  OAuthProvider,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import type {
  AppUser,
  UserRole,
  UserStatus,
} from "@/types/auth";

import {
  assertFirebaseConfigured,
  auth,
  db,
} from "./client";

const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: "select_account",
});

const microsoftProvider = new OAuthProvider(
  "microsoft.com",
);

microsoftProvider.setCustomParameters({
  prompt: "select_account",
});

function isUserRole(
  value: unknown,
): value is UserRole {
  return (
    value === "admin" ||
    value === "teacher" ||
    value === "student"
  );
}

function isUserStatus(
  value: unknown,
): value is UserStatus {
  return (
    value === "active" ||
    value === "inactive" ||
    value === "suspended"
  );
}

function timestampToISOString(
  value: unknown,
): string | undefined {
  if (
    value &&
    typeof value === "object" &&
    "toDate" in value &&
    typeof value.toDate === "function"
  ) {
    return value.toDate().toISOString();
  }

  if (typeof value === "string") {
    return value;
  }

  return undefined;
}

function getDefaultUserName(user: User) {
  if (user.displayName?.trim()) {
    return user.displayName.trim();
  }

  if (user.email) {
    return user.email.split("@")[0];
  }

  return "Usuario Smart Learn";
}

async function configurePersistence(
  remember: boolean,
) {
  assertFirebaseConfigured();

  await setPersistence(
    auth,
    remember
      ? browserLocalPersistence
      : browserSessionPersistence,
  );
}

export async function signInWithCredentials(
  email: string,
  password: string,
  remember: boolean,
): Promise<UserCredential> {
  await configurePersistence(remember);

  return signInWithEmailAndPassword(
    auth,
    email.trim(),
    password,
  );
}

export async function signInWithGoogle(
  remember: boolean,
): Promise<UserCredential> {
  await configurePersistence(remember);

  return signInWithPopup(
    auth,
    googleProvider,
  );
}

export async function signInWithMicrosoft(
  remember: boolean,
): Promise<UserCredential> {
  await configurePersistence(remember);

  return signInWithPopup(
    auth,
    microsoftProvider,
  );
}

export async function requestPasswordReset(
  email: string,
) {
  assertFirebaseConfigured();

  auth.languageCode = "es";

  await sendPasswordResetEmail(
    auth,
    email.trim(),
  );
}

export async function signOutUser() {
  await signOut(auth);
}

export async function ensureUserProfile(
  user: User,
): Promise<AppUser> {
  assertFirebaseConfigured();

  const userReference = doc(
    db,
    "users",
    user.uid,
  );

  const snapshot = await getDoc(userReference);

  if (snapshot.exists()) {
    const data = snapshot.data();

    if (
      !isUserRole(data.role) ||
      !isUserStatus(data.status)
    ) {
      throw new Error("profile/invalid");
    }

    return {
      uid: user.uid,
      name:
        typeof data.name === "string" &&
        data.name.trim()
          ? data.name
          : getDefaultUserName(user),
      email:
        typeof data.email === "string"
          ? data.email
          : user.email ?? "",
      role: data.role,
      status: data.status,
      photoURL:
        typeof data.photoURL === "string"
          ? data.photoURL
          : user.photoURL ?? null,
      createdAt: timestampToISOString(
        data.createdAt,
      ),
      updatedAt: timestampToISOString(
        data.updatedAt,
      ),
    };
  }

  const newProfile: AppUser = {
    uid: user.uid,
    name: getDefaultUserName(user),
    email: user.email ?? "",
    role: "student",
    status: "active",
    photoURL: user.photoURL ?? null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await setDoc(userReference, {
    uid: newProfile.uid,
    name: newProfile.name,
    email: newProfile.email,
    role: newProfile.role,
    status: newProfile.status,
    photoURL: newProfile.photoURL,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return newProfile;
}