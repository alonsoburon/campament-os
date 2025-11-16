"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "~/trpc/react";
import { Button } from "~/app/components/ui/button";
import { Input } from "~/app/components/ui/input";
import { useSession, signIn } from "~/lib/auth-client";
import { PhoneNumberInput } from "~/app/components/ui/phone-input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/app/components/ui/form";

const schema = z.object({
  fullName: z.string().min(2, "Tu nombre completo es requerido"),
  phone: z.string().optional().or(z.literal("")),
  emergencyContact: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function CreatePersonPage() {
  const router = useRouter();
  const params = useSearchParams();
  const redirectTo = params.get("redirectTo") ?? "/";
  const { data: session } = useSession();
  // const { signIn } = api.auth.useContext().signIn; // Eliminado

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: "", phone: "", emergencyContact: "" },
  });

  const mutation = api.person.createOrUpdatePerson.useMutation({
    onSuccess: () => {
      // Ya no esperamos la actualización, forzamos la recarga directamente.
      // La base de datos ya está actualizada, la nueva carga de página
      // hará que el middleware lea la sesión fresca.
      window.location.href = "/";
    },
  });

  // Autollenar con datos de Google (editable)
  useEffect(() => {
    const name = session?.user?.name ?? "";
    if (name && !form.getValues("fullName")) {
      form.setValue("fullName", name);
    }
  }, [session?.user?.name, form]);

  return (
    <div className="mx-auto max-w-md px-6 py-10">
      <div className="space-y-6 rounded-2xl border border-(--border) bg-(--card) p-6 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-lg font-semibold">Completa tu perfil</h1>
          <p className="text-sm text-muted-foreground">
            Necesitamos algunos datos para personalizar tu experiencia.
          </p>
        </div>

        <Form {...form}>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
          >
            {session?.user?.email && (
              <div className="text-xs text-muted-foreground">
                Sesión con: <span className="font-medium">{session.user.email}</span>
              </div>
            )}
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej. Ana Martínez" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <PhoneNumberInput
                  label="Teléfono (opcional)"
                  placeholder="+34 600 000 000"
                  form={form}
                  {...field}
                />
              )}
            />

            <FormField
              control={form.control}
              name="emergencyContact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contacto de emergencia (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre y teléfono" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={mutation.isPending}
              className="w-full"
            >
              {mutation.isPending ? "Guardando..." : "Guardar y continuar"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}


