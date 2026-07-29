import { FirebaseError } from "firebase/app";

const firebaseMessages: Record<string, string> = {
  "auth/invalid-credential":
    "El correo o la contraseña no son correctos.",
  "auth/invalid-email":
    "El correo electrónico no tiene un formato válido.",
  "auth/user-disabled":
    "Esta cuenta fue deshabilitada.",
  "auth/user-not-found":
    "No se encontró una cuenta con estos datos.",
  "auth/wrong-password":
    "El correo o la contraseña no son correctos.",
  "auth/too-many-requests":
    "Se realizaron demasiados intentos. Espera unos minutos e inténtalo nuevamente.",
  "auth/network-request-failed":
    "No fue posible conectar con Firebase. Revisa tu conexión a internet.",
  "auth/popup-closed-by-user":
    "La ventana de acceso fue cerrada antes de completar el proceso.",
  "auth/popup-blocked":
    "El navegador bloqueó la ventana de acceso. Permite ventanas emergentes y vuelve a intentarlo.",
  "auth/cancelled-popup-request":
    "La solicitud de acceso anterior fue cancelada.",
  "auth/operation-not-allowed":
    "Este método de acceso todavía no está habilitado en Firebase.",
  "auth/account-exists-with-different-credential":
    "Ya existe una cuenta con este correo utilizando otro método de acceso.",
  "auth/unauthorized-domain":
    "Este dominio no está autorizado en Firebase Authentication.",
  "auth/email-already-in-use":
    "Este correo ya se encuentra registrado.",
  "auth/weak-password":
    "La contraseña utilizada no cumple los requisitos de seguridad.",
  "permission-denied":
    "No tienes permisos para realizar esta operación.",
};

export function getAuthErrorMessage(
  error: unknown,
): string {
  if (
    error instanceof Error &&
    error.message === "firebase/missing-config"
  ) {
    return "La configuración de Firebase está incompleta. Revisa el archivo .env.local.";
  }

  if (
    error instanceof Error &&
    error.message === "profile/invalid"
  ) {
    return "El perfil de esta cuenta está incompleto o contiene un rol no válido.";
  }

  if (
    error instanceof Error &&
    error.message === "profile/inactive"
  ) {
    return "Esta cuenta no se encuentra activa. Comunícate con el administrador.";
  }

  if (error instanceof FirebaseError) {
    return (
      firebaseMessages[error.code] ??
      "Firebase no pudo completar la operación solicitada."
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Ocurrió un error inesperado durante la autenticación.";
}