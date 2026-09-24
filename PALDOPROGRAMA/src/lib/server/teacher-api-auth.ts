import {
  getAdminAuth,
  getAdminDb,
} from "@/lib/firebase/admin";

export class TeacherApiError extends Error {
  status: number;

  constructor(
    message: string,
    status = 400,
  ) {
    super(message);

    this.name = "TeacherApiError";
    this.status = status;
  }
}

function getBearerToken(
  request: Request,
) {
  const authorization =
    request.headers.get(
      "authorization",
    );

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

export async function requireActiveTeacher(
  request: Request,
) {
  const token = getBearerToken(request);

  if (!token) {
    throw new TeacherApiError(
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
    throw new TeacherApiError(
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
    throw new TeacherApiError(
      "No se encontró el perfil docente.",
      403,
    );
  }

  const profile =
    profileSnapshot.data();

  if (
    profile?.role !== "teacher" ||
    profile?.status !== "active"
  ) {
    throw new TeacherApiError(
      "Tu perfil no tiene acceso a esta función.",
      403,
    );
  }

  return {
    teacherId: decodedToken.uid,
    profile,
  };
}