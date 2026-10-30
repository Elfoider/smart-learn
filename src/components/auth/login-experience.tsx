"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  Check,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useState,
} from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { BrandMark } from "@/components/brand/brand-mark";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/hooks/use-auth";
import { getAuthErrorMessage } from "@/lib/firebase/auth-errors";
import {
  ensureUserProfile,
  requestPasswordReset,
  signInWithCredentials,
  signInWithGoogle,
  signInWithMicrosoft,
  signOutUser,
} from "@/lib/firebase/auth-service";
import { cn } from "@/lib/utils/cn";
import {
  USER_ROLE_ROUTES,
  type AppUser,
} from "@/types/auth";

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Ingresa tu correo electrónico.")
    .email("Ingresa un correo electrónico válido."),
  password: z
    .string()
    .min(1, "Ingresa tu contraseña.")
    .min(
      6,
      "La contraseña debe tener al menos 6 caracteres.",
    ),
  remember: z.boolean(),
});

type LoginValues = z.infer<typeof loginSchema>;

type ExternalProvider =
  | "google"
  | "microsoft";

const learningItems = [
  { title: "Estudiante", description: "Entra a tus materias, consulta las clases y practica sus temas con el asistente académico.", icon: BookOpen },
  { title: "Docente", description: "Prepara y publica clases, comparte materiales y gestiona evaluaciones y estudiantes.", icon: BrainCircuit },
  { title: "Administrador", description: "Organiza usuarios, materias, secciones y matrículas desde el panel de gestión.", icon: Users },
];

export function LoginExperience() {
  const router = useRouter();

  const {
    profile,
    loading: authLoading,
  } = useAuth();

  const [showPassword, setShowPassword] =
    useState(false);

  const [
    externalLoading,
    setExternalLoading,
  ] = useState<ExternalProvider | null>(
    null,
  );

  const [
    resettingPassword,
    setResettingPassword,
  ] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    trigger,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: true,
    },
  });

  useEffect(() => {
    if (
      !authLoading &&
      profile?.status === "active"
    ) {
      router.replace(
        USER_ROLE_ROUTES[profile.role],
      );
    }
  }, [
    authLoading,
    profile,
    router,
  ]);

  async function completeAccess(
    currentProfile: AppUser,
  ) {
    if (currentProfile.status !== "active") {
      await signOutUser();
      throw new Error("profile/inactive");
    }

    toast.success("Acceso verificado", {
      description: `Bienvenido, ${currentProfile.name}.`,
    });

    router.replace(
      USER_ROLE_ROUTES[currentProfile.role],
    );

    router.refresh();
  }

  async function onSubmit(
    values: LoginValues,
  ) {
    try {
      const credential =
        await signInWithCredentials(
          values.email,
          values.password,
          values.remember,
        );

      const currentProfile =
        await ensureUserProfile(
          credential.user,
        );

      await completeAccess(currentProfile);
    } catch (error) {
      toast.error(
        "No fue posible iniciar sesión",
        {
          description:
            getAuthErrorMessage(error),
        },
      );
    }
  }

  async function handleExternalLogin(
    provider: ExternalProvider,
  ) {
    setExternalLoading(provider);

    try {
      const remember =
        getValues("remember");

      const credential =
        provider === "google"
          ? await signInWithGoogle(remember)
          : await signInWithMicrosoft(
              remember,
            );

      const currentProfile =
        await ensureUserProfile(
          credential.user,
        );

      await completeAccess(currentProfile);
    } catch (error) {
      toast.error(
        "No fue posible completar el acceso",
        {
          description:
            getAuthErrorMessage(error),
        },
      );
    } finally {
      setExternalLoading(null);
    }
  }

  async function handleForgotPassword() {
    const validEmail = await trigger(
      "email",
      {
        shouldFocus: true,
      },
    );

    if (!validEmail) {
      toast.info(
        "Ingresa primero tu correo",
        {
          description:
            "Utilizaremos ese correo para enviar las instrucciones.",
        },
      );

      return;
    }

    setResettingPassword(true);

    try {
      await requestPasswordReset(
        getValues("email"),
      );

      toast.success(
        "Solicitud procesada",
        {
          description:
            "Revisa tu correo electrónico para continuar con la recuperación de contraseña.",
        },
      );
    } catch (error) {
      toast.error(
        "No fue posible enviar el correo",
        {
          description:
            getAuthErrorMessage(error),
        },
      );
    } finally {
      setResettingPassword(false);
    }
  }

  const authenticationBusy =
    isSubmitting ||
    externalLoading !== null;

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div
        aria-hidden="true"
        className="ambient-grid absolute inset-0 opacity-70"
      />

      <div
        aria-hidden="true"
        className="ambient-orb ambient-orb-primary"
      />

      <div
        aria-hidden="true"
        className="ambient-orb ambient-orb-secondary"
      />

      <div className="absolute right-5 top-5 z-30 sm:right-8 sm:top-8">
        <ThemeToggle />
      </div>

      <div className="relative z-10 grid min-h-screen lg:grid-cols-[0.88fr_1.12fr]">
        <section className="flex min-h-screen items-center justify-center px-5 py-20 sm:px-10 lg:px-14 xl:px-20">
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.65,
              ease: "easeOut",
            }}
            className="w-full max-w-[31rem]"
          >
            <BrandMark />

            <div className="mt-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur-xl">
                <ShieldCheck
                  aria-hidden="true"
                  className="h-3.5 w-3.5 text-primary"
                />

                Acceso seguro al entorno académico
              </div>

              <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-[-0.045em] sm:text-5xl">
                Bienvenido a tu{" "}
                <span className="text-gradient">
                  espacio de aprendizaje.
                </span>
              </h1>

              <p className="mt-5 max-w-lg text-sm leading-7 text-muted-foreground sm:text-base">
                Ingresa para acceder a tus clases,
                materiales y
                herramientas académicas.
              </p>
            </div>

            <form
              className="mt-9 space-y-5"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
            >
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium"
                >
                  Correo electrónico
                </label>

                <div className="relative">
                  <Mail
                    aria-hidden="true"
                    className={cn(
                      "pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2",
                      errors.email
                        ? "text-danger"
                        : "text-muted-foreground",
                    )}
                  />

                  <input
                    id="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="nombre@universidad.edu"
                    aria-invalid={Boolean(
                      errors.email,
                    )}
                    className={cn(
                      "h-14 w-full rounded-2xl border bg-card/70 pl-12 pr-4 text-sm shadow-sm backdrop-blur-xl outline-none transition-all",
                      "placeholder:text-muted-foreground/70",
                      "focus:border-primary/60 focus:ring-4 focus:ring-primary/10",
                      errors.email
                        ? "border-danger/70 focus:border-danger focus:ring-danger/10"
                        : "border-border hover:border-primary/30",
                    )}
                    {...register("email")}
                  />
                </div>

                {errors.email && (
                  <p className="mt-2 text-xs font-medium text-danger">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-4">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium"
                  >
                    Contraseña
                  </label>

                  <button
                    type="button"
                    disabled={
                      resettingPassword
                    }
                    onClick={
                      handleForgotPassword
                    }
                    className="inline-flex items-center gap-2 text-xs font-semibold text-primary transition-opacity hover:opacity-75 disabled:pointer-events-none disabled:opacity-60"
                  >
                    {resettingPassword && (
                      <LoaderCircle
                        aria-hidden="true"
                        className="h-3.5 w-3.5 animate-spin"
                      />
                    )}

                    ¿Olvidaste tu contraseña?
                  </button>
                </div>

                <div className="relative">
                  <LockKeyhole
                    aria-hidden="true"
                    className={cn(
                      "pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2",
                      errors.password
                        ? "text-danger"
                        : "text-muted-foreground",
                    )}
                  />

                  <input
                    id="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    autoComplete="current-password"
                    placeholder="Ingresa tu contraseña"
                    aria-invalid={Boolean(
                      errors.password,
                    )}
                    className={cn(
                      "h-14 w-full rounded-2xl border bg-card/70 pl-12 pr-14 text-sm shadow-sm backdrop-blur-xl outline-none transition-all",
                      "placeholder:text-muted-foreground/70",
                      "focus:border-primary/60 focus:ring-4 focus:ring-primary/10",
                      errors.password
                        ? "border-danger/70 focus:border-danger focus:ring-danger/10"
                        : "border-border hover:border-primary/30",
                    )}
                    {...register("password")}
                  />

                  <button
                    type="button"
                    onClick={() => {
                      setShowPassword(
                        (current) => !current,
                      );
                    }}
                    aria-label={
                      showPassword
                        ? "Ocultar contraseña"
                        : "Mostrar contraseña"
                    }
                    className="absolute right-4 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff
                        aria-hidden="true"
                        className="h-5 w-5"
                      />
                    ) : (
                      <Eye
                        aria-hidden="true"
                        className="h-5 w-5"
                      />
                    )}
                  </button>
                </div>

                {errors.password && (
                  <p className="mt-2 text-xs font-medium text-danger">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <label className="flex w-fit cursor-pointer items-center gap-3 text-sm text-muted-foreground">
                <span className="relative flex h-5 w-5 items-center justify-center">
                  <input
                    type="checkbox"
                    className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-border bg-card transition-all checked:border-primary checked:bg-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/15"
                    {...register("remember")}
                  />

                  <Check
                    aria-hidden="true"
                    className="pointer-events-none absolute h-3.5 w-3.5 scale-0 text-primary-foreground transition-transform peer-checked:scale-100"
                  />
                </span>

                Mantener mi sesión iniciada
              </label>

              <button
                type="submit"
                disabled={authenticationBusy}
                className={cn(
                  "group flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 text-sm font-semibold text-primary-foreground",
                  "shadow-xl shadow-primary/20 transition-all duration-300",
                  "hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-primary/25",
                  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20",
                  "disabled:pointer-events-none disabled:opacity-70",
                )}
              >
                {isSubmitting ? (
                  <>
                    <LoaderCircle
                      aria-hidden="true"
                      className="h-5 w-5 animate-spin"
                    />

                    Verificando acceso
                  </>
                ) : (
                  <>
                    Iniciar sesión

                    <ArrowRight
                      aria-hidden="true"
                      className="h-4 w-4 transition-transform group-hover:translate-x-1"
                    />
                  </>
                )}
              </button>
            </form>

            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-border" />

              <span className="text-xs font-medium text-muted-foreground">
                O continúa con
              </span>

              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                disabled={authenticationBusy}
                onClick={() => {
                  void handleExternalLogin(
                    "google",
                  );
                }}
                className="flex h-12 items-center justify-center gap-3 rounded-2xl border border-border bg-card/60 text-sm font-semibold shadow-sm backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-card hover:shadow-lg disabled:pointer-events-none disabled:opacity-60"
              >
                {externalLoading ===
                "google" ? (
                  <LoaderCircle
                    aria-hidden="true"
                    className="h-5 w-5 animate-spin"
                  />
                ) : (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-[0.7rem] font-bold text-[#4285f4] shadow-sm">
                    G
                  </span>
                )}

                Google
              </button>

              <button
                type="button"
                disabled={authenticationBusy}
                onClick={() => {
                  void handleExternalLogin(
                    "microsoft",
                  );
                }}
                className="flex h-12 items-center justify-center gap-3 rounded-2xl border border-border bg-card/60 text-sm font-semibold shadow-sm backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-card hover:shadow-lg disabled:pointer-events-none disabled:opacity-60"
              >
                {externalLoading ===
                "microsoft" ? (
                  <LoaderCircle
                    aria-hidden="true"
                    className="h-5 w-5 animate-spin"
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className="grid h-5 w-5 grid-cols-2 gap-[2px]"
                  >
                    <span className="bg-[#f25022]" />
                    <span className="bg-[#7fba00]" />
                    <span className="bg-[#00a4ef]" />
                    <span className="bg-[#ffb900]" />
                  </span>
                )}

                Microsoft
              </button>
            </div>

            <p className="mt-8 text-center text-xs leading-6 text-muted-foreground">
              Al ingresar, aceptas las políticas
              institucionales de uso y protección de
              la información académica.
            </p>

            <div className="mt-7 flex justify-center">
              <Link
                href="/"
                className="text-xs font-semibold text-muted-foreground transition-colors hover:text-primary"
              >
                Regresar a la página principal
              </Link>
            </div>
          </motion.div>
        </section>

        <section className="login-system-panel relative hidden min-h-screen border-l border-border lg:flex lg:items-center" aria-labelledby="system-title">
          <div className="relative z-10 mx-auto w-full max-w-2xl px-12 py-16 xl:px-16">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Smart Learn · Gestión académica</p>
            <h2 id="system-title" className="mt-5 text-4xl font-semibold leading-tight tracking-tight xl:text-5xl">Tu aula.<br />Tus herramientas.<br /><span className="text-primary">Un mismo lugar.</span></h2>
            <p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground">Clases, materiales, evaluaciones y asistencia académica para cada integrante de la institución.</p>
            <div className="mt-9 space-y-3">
              {learningItems.map(item => <article key={item.title} className="rounded-2xl border border-border bg-card/80 p-5">
                <div className="flex items-start gap-4"><item.icon aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-primary" /><div><h3 className="font-semibold">{item.title}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{item.description}</p></div></div>
              </article>)}
            </div>
            <div className="mt-7 border-t border-border pt-5 text-sm leading-6 text-muted-foreground"><p className="font-semibold text-foreground">¿Cómo accedo?</p><p className="mt-1">Usa la cuenta vinculada a tu institución. Smart Learn abrirá el portal correspondiente a tu rol. Si no tienes acceso, consulta con tu docente o administrador.</p></div>
          </div>
        </section>
      </div>
    </main>
  );
}