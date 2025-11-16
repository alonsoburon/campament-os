"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "~/trpc/react";
import { Button } from "~/app/components/ui/button";
import { Input } from "~/app/components/ui/input";
import { useSession } from "~/lib/auth-client";
import { PhoneNumberInput } from "~/app/components/ui/phone-input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/app/components/ui/form";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

const schema = z.object({
  fullName: z.string().min(2, "Tu nombre completo es requerido"),
  phone: z.string().optional().or(z.literal("")),
  emergencyContact: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function CreatePersonPage() {
  const { data: session, isPending: isSessionLoading } = useSession();
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: "", phone: "", emergencyContact: "" },
  });

  const mutation = api.person.createOrUpdatePerson.useMutation({
    onSuccess: () => {
      // Forzar recarga completa para refrescar la sesión
      window.location.href = "/onboarding/create-organization";
    },
    onError: (error) => {
      form.setError("root", { message: `Error al guardar: ${error.message}` });
    }
  });

  useEffect(() => {
    const nameFromSession = session?.user?.name ?? "";
    if (nameFromSession && !form.getValues("fullName")) {
      form.setValue("fullName", nameFromSession);
    }
  }, [session?.user?.name, form]);

  if (isSessionLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="mx-auto w-full max-w-md">
        <div className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <div className="space-y-1 text-center">
            <h1 className="text-xl font-semibold sm:text-2xl">Completa tu perfil</h1>
            <p className="text-sm text-muted-foreground">
              Necesitamos algunos datos para personalizar tu experiencia en CampamentOS.
            </p>
          </div>
          <Form {...form}>
            <form
              className="space-y-4"
              onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
            >
              {session?.user?.email && (
                <div className="text-center text-xs text-muted-foreground">
                  Sesión iniciada como: <span className="font-medium">{session.user.email}</span>
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
              <PhoneNumberInput
                name="phone"
                label="Teléfono (opcional)"
                placeholder="+34 600 000 000"
                form={form}
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
              {form.formState.errors.root && (
                <p className="text-sm font-medium text-destructive">{form.formState.errors.root.message}</p>
              )}
              <Button
                type="submit"
                disabled={mutation.isPending}
                className="w-full"
              >
                {mutation.isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Guardando...</>
                ) : (
                  "Guardar y continuar"
                )}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}