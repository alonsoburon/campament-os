"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { api } from "~/trpc/react";
import { Logo } from "~/app/components/Logo";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "~/app/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/app/components/ui/form";
import { Input } from "~/app/components/ui/input";
import { Button } from "~/app/components/ui/button";

const registerSchema = z.object({
  invitationToken: z
    .string()
    .min(1, "El token de invitación es requerido"),
  fullName: z.string().min(1, "El nombre completo es requerido"),
});

type RegisterFormInputs = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const backgroundVideoRef = useRef<HTMLVideoElement>(null);
  const { resolvedTheme } = useTheme();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    if (!resolvedTheme) return;
    setIsDarkMode(resolvedTheme === "dark");
  }, [resolvedTheme]);

  useEffect(() => {
    const video = backgroundVideoRef.current;
    if (!video) return;

    const handleEnded = () => {
      video.currentTime = 0;
      void video.play();
    };

    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("ended", handleEnded);
    };
  }, []);
  const form = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    defaultValues: {
      invitationToken: "",
      fullName: "",
    },
  });

  const acceptInvitation = api.user.acceptInvitation.useMutation({
    onSuccess: () => {
      console.log("Invitación aceptada!");
      router.push("/api/auth/signin");
    },
    onError: (error) => {
      // El acceso a `error.message` es seguro.
      form.setError("invitationToken", { message: error.message });
    },
  });

  const watchedValues = form.watch();
  const isFormValid =
    watchedValues.invitationToken.trim().length > 0 &&
    watchedValues.fullName.trim().length > 0 &&
    form.formState.isValid;

  const onSubmit = (data: RegisterFormInputs) => {
    acceptInvitation.mutate(data);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[--background] px-6 py-12">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <video
          ref={backgroundVideoRef}
          className="h-full w-full scale-110 object-cover blur-2xl"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
        >
          <source
            src="https://cdn.coverr.co/videos/coverr-flowers-and-bees-4545/1080p.mp4"
            type="video/mp4"
          />
        </video>
        <div
          className={`absolute inset-0 ${
            isDarkMode
              ? "bg-linear-to-br from-black/70 via-black/55 to-black/75"
              : "bg-linear-to-br from-white/70 via-white/55 to-white/75"
          }`}
        />
      </div>
      <div className="grid w-full max-w-6xl gap-12 lg:grid-cols-[1.45fr_0.9fr]">
        <section
          className={`relative hidden overflow-hidden rounded-4xl p-12 lg:flex lg:flex-col lg:justify-between ${
            isDarkMode
              ? "bg-linear-to-br from-[--primary-700] via-[--primary-600] to-[--primary-900] text-white shadow-[0_35px_80px_rgba(15,15,15,0.5)]"
              : "bg-linear-to-br from-[--primary-100] via-[--primary-50] to-[--primary-200] text-[--foreground] shadow-[0_28px_70px_rgba(15,15,15,0.12)]"
          }`}
        >
          <div className="space-y-6">
            <h2 className="text-4xl font-semibold leading-tight">
              <span className="inline-flex items-center gap-2">
                Orquesta tus
                <Logo
                  variant={isDarkMode ? "inverse" : "monochrome"}
                  className="inline-block [--logo-campamentos-width:7.2em] -translate-y-[0.12em]"
                  label="CampamentOS"
                />
              </span>
              <span className="block">desde un solo lugar</span>
            </h2>
            <p
              className={`text-lg ${
                isDarkMode ? "text-white/80" : "text-[--muted-foreground]"
              }`}
            >
              Conecta personas, logística y presupuesto en minutos. Únete a tu organización con el token que recibiste.
            </p>
          </div>
          <ul
            className={`space-y-3 text-sm ${
              isDarkMode ? "text-white/70" : "text-[--muted-foreground]"
            }`}
          >
            <li
              className={`relative pl-6 leading-relaxed before:absolute before:left-0 before:top-2 before:inline-flex before:h-2 before:w-2 before:rounded-full before:content-[''] ${
                isDarkMode ? "before:bg-white" : "before:bg-[--primary-500]"
              }`}
            >
              Gestiona perfiles, salud y roles de cada participante sin salir de CampamentOS.
            </li>
            <li
              className={`relative pl-6 leading-relaxed before:absolute before:left-0 before:top-2 before:inline-flex before:h-2 before:w-2 before:rounded-full before:content-[''] ${
                isDarkMode ? "before:bg-white" : "before:bg-[--primary-500]"
              }`}
            >
              Comparte agendas, actividades y tareas críticas con todo el equipo.
            </li>
            <li
              className={`relative pl-6 leading-relaxed before:absolute before:left-0 before:top-2 before:inline-flex before:h-2 before:w-2 before:rounded-full before:content-[''] ${
                isDarkMode ? "before:bg-white" : "before:bg-[--primary-500]"
              }`}
            >
              Administra logística y presupuesto con tableros visuales y reportes listos.
            </li>
          </ul>
          <div
            className={`absolute -bottom-28 -right-24 h-60 w-60 rounded-full blur-3xl ${
              isDarkMode ? "bg-white/15" : "bg-[--primary-300]/35"
            }`}
          />
          <div
            className={`absolute -top-24 -left-28 h-72 w-72 rounded-full blur-3xl ${
              isDarkMode ? "bg-white/10" : "bg-[--primary-200]/30"
            }`}
          />
        </section>

        <Card
          className={`rounded-4xl border bg-[--card] backdrop-blur-xl ${
            isDarkMode
              ? "border-white/8 shadow-[0_35px_100px_rgba(0,0,0,0.45)]"
              : "border-black/10 bg-white/85 shadow-[0_28px_80px_rgba(15,15,15,0.12)]"
          }`}
        >
          <CardHeader className="px-10 pt-10">
            <CardTitle className="text-3xl font-semibold text-[--foreground]">
              Aceptar invitación
            </CardTitle>
            <CardDescription className="text-base text-[--muted-foreground]">
              Ingresa el token compartido por tu organización y completa tu perfil para comenzar.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-10 pb-12">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="invitationToken"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Token de invitación</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          inputMode="text"
                          placeholder="Ej: CAMP-1234-INVITE"
                          className={`text-[--foreground] shadow-s transition focus-visible:border-[--positive] focus-visible:ring-[--positive]/40 ${
                            isDarkMode
                              ? "border border-white/15 bg-[--input-background]/90"
                              : "border border-black/10 bg-white/75"
                          }`}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre completo</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Tu nombre y apellido"
                          className={`text-[--foreground] shadow-s transition focus-visible:border-[--positive] focus-visible:ring-[--positive]/40 ${
                            isDarkMode
                              ? "border border-white/15 bg-[--input-background]/90"
                              : "border border-black/10 bg-white/75"
                          }`}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={!isFormValid || acceptInvitation.isPending}
                  variant={isFormValid ? "positive" : "muted"}
                  className={`w-full ${
                    isDarkMode
                      ? "shadow-[0_16px_36px_rgba(0,0,0,0.38)]"
                      : "shadow-[0_16px_32px_rgba(15,15,15,0.12)]"
                  }`}
                >
                  {acceptInvitation.isPending ? "Aceptando invitación..." : "Aceptar invitación"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
