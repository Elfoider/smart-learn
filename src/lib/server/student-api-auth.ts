import { getAdminAuth, getAdminDb } from "@/lib/firebase/admin";

export class StudentApiError extends Error {
  status: number;

  constructor(
    message: string,
    status = 400,
  ) {
    super(message);

    this.name = "StudentApiError";
    this.status = status;
  }
}

function getBearerToken(
  request: Request,
) {
  const authorization =
    request.headers.get("authorization");

  if (
    !authorization?.startsWith(
      "Bearer ",
    )
  ) {
    return null;
  }

  const token = authorization
    .slice("Bearer ".length)
    .trim();

  return token || null;
}

export async function requireActiveStudent(
  request: Request,
) {
  const token = getBearerToken(request);

  if (!token) {
    throw new StudentApiError(
      "Debes iniciar sesión para continuar.",
      401,
    );
  }

  let decodedToken;

  try {
    decodedToken =
      await getAdminAuth().verifyIdToken(
        token,
      );
  } catch {
    throw new StudentApiError(
      "La sesión no es válida o expiró.",
      401,
    );
  }

  const profileSnapshot =
    await getAdminDb()
      .collection("users")
      .doc(decodedToken.uid)
      .get();

  if (!profileSnapshot.exists) {
    throw new StudentApiError(
      "No se encontró el perfil académico.",
      403,
    );
  }

  const profile =
    profileSnapshot.data();

  if (
    profile?.role !== "student" ||
    profile?.status !== "active"
  ) {
    throw new StudentApiError(
      "Tu perfil no tiene acceso a esta evaluación.",
      403,
    );
  }

  return {
    userId: decodedToken.uid,
    profile,
  };
}