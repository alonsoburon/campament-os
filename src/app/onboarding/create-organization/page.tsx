"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/app/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/app/components/ui/form";
import { Input } from "~/app/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/app/components/ui/select";
import { Button } from "~/app/components/ui/button";
import { Loader2 } from "lucide-react";
import { api } from "~/trpc/react";

const createOrganizationSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres."),
  type_id: z.number({ required_error: "Debes seleccionar un tipo de organización." }),
});

type CreateOrganizationInputs = z.infer<typeof createOrganizationSchema>;

export default function CreateOrganizationPage() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  const form = useForm<CreateOrganizationInputs>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: { name: "" },
  });

  const { data: orgTypes } = api.organization.listTypes.useQuery();
  const createOrg = api.organization.create.useMutation();

  const onSubmit = async (values: CreateOrganizationInputs) => {
    setIsPending(true);
    form.clearErrors();

    try {
      await createOrg.mutateAsync(values);
      window.location.href = "/";
    } catch (error: any) {
      form.setError("root", { message: error.message || "Error al crear la organización" });
      setIsPending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-16">
      <Card className="w-full max-w-md border border-border/60 bg-card shadow-lg">
        <CardHeader className="space-y-3">
          <CardTitle className="text-3xl font-semibold text-foreground">
            Paso 2: Crea tu organización
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            Este será el espacio de trabajo para tu equipo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de la Organización</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Grupo Scout Aurora" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Organización</FormLabel>
                    <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {orgTypes?.map((type) => (
                          <SelectItem key={type.id} value={type.id.toString()}>
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
               {form.formState.errors.root && (
                <p className="text-sm font-medium text-destructive">{form.formState.errors.root.message}</p>
              )}
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creando...</>
                ) : "Finalizar y entrar a CampamentOS"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}