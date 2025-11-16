/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { api } from "~/trpc/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/app/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/app/components/ui/form";
import { Input } from "~/app/components/ui/input";
import { Button } from "~/app/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/app/components/ui/select";
import { Checkbox } from "~/app/components/ui/checkbox";

const createOrganizationSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres."),
  typeId: z.string().min(1, "Selecciona un tipo de organización."),
  number: z
    .string()
    .optional()
    .or(z.literal("")),
  district: z.string().optional(),
  zone: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  groupEmail: z
    .string()
    .email("Correo electrónico inválido.")
    .optional()
    .or(z.literal("")),
  isMixed: z.boolean().default(false),
});

type CreateOrganizationInputs = z.infer<typeof createOrganizationSchema>;

export default function CreateOrganizationPage() {
  const router = useRouter();
  const { status, data: session } = useSession();

  const { data: organizationTypes, isLoading: loadingTypes, error: typesError } =
    api.organization.listTypes.useQuery();

  const createOrganization = api.organization.create.useMutation({
    onSuccess: () => {
      router.push("/");
    },
  });

  useEffect(() => {
    if (status === "loading") {
      return <div>Cargando sesión...</div>;
    }

    if (status === "unauthenticated") {
      router.replace("/api/auth/signin");
      return;
    }

    if (status === "authenticated" && session?.user.organization_id) {
      router.replace("/");
    }
  }, [status, session, router]);

  const form = useForm<CreateOrganizationInputs>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: {
      name: "",
      typeId: "",
      number: "",
      district: "",
      zone: "",
      address: "",
      phone: "",
      groupEmail: "",
      isMixed: false,
    },
  });

  const watchedTypeId = form.watch("typeId");

  const isScoutType = useMemo(() => {
    if (loadingTypes || !organizationTypes) return false;
    const selectedType = organizationTypes.find(
      (type) => type.id.toString() === watchedTypeId,
    );

    if (!selectedType) return false;

    const normalizedName = selectedType.name.toLowerCase();
    return (
      normalizedName.includes("scout") ||
      normalizedName.includes("manada") ||
      normalizedName.includes("tropa")
    );
  }, [organizationTypes, watchedTypeId, loadingTypes]);

  const onSubmit = (values: CreateOrganizationInputs) => {
    const payload = {
      name: values.name.trim(),
      type_id: parseInt(values.typeId, 10),
      number:
        isScoutType && values.number && values.number.trim() !== ""
          ? Number(values.number)
          : undefined,
      district:
        isScoutType && values.district && values.district.trim() !== ""
          ? values.district.trim()
          : undefined,
      zone:
        isScoutType && values.zone && values.zone.trim() !== ""
          ? values.zone.trim()
          : undefined,
      address:
        values.address && values.address.trim() !== ""
          ? values.address.trim()
          : undefined,
      phone:
        values.phone && values.phone.trim() !== ""
          ? values.phone.trim()
          : undefined,
      group_email:
        values.groupEmail && values.groupEmail.trim() !== ""
          ? values.groupEmail.trim()
          : undefined,
      is_mixed: values.isMixed,
    };

    createOrganization.mutate(payload);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[--background] px-6 py-16">
      <Card className="w-full max-w-2xl border border-border/60 bg-[--card] shadow-[0_35px_80px_rgba(15,15,15,0.25)]">
        <CardHeader className="space-y-3">
          <CardTitle className="text-3xl font-semibold text-[--foreground]">
            Crear mi organización
          </CardTitle>
          <CardDescription className="text-base text-[--muted-foreground]">
            Configura los datos iniciales de tu organización para comenzar a usar CampamentOS.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                      <FormLabel>Nombre de la organización</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: CampamentOS S.A."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="typeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de organización</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={loadingTypes}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Elige el tipo de organización" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {loadingTypes ? (
                          <SelectItem value="loading" disabled>Cargando tipos...</SelectItem>
                        ) : typesError ? (
                          <SelectItem value="error" disabled>Error al cargar</SelectItem>
                        ) : !organizationTypes || organizationTypes.length === 0 ? (
                          <SelectItem value="not-found" disabled>No hay tipos disponibles</SelectItem>
                        ) : (
                          organizationTypes.map((type) => (
                            <SelectItem
                              key={type.id}
                              value={type.id.toString()}
                            >
                              {type.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 md:grid-cols-2">
                {isScoutType ? (
                  <>
                    <FormField
                      control={form.control}
                      name="number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número oficial</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ej: 123"
                              inputMode="numeric"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Teléfono de contacto</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej: +34 600 123 456" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                ) : (
                  <>
                    <div className="md:col-span-2">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Teléfono de contacto</FormLabel>
                            <FormControl>
                              <Input placeholder="Ej: +34 600 123 456" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </>
                )}
              </div>

              {isScoutType && (
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="district"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Distrito</FormLabel>
                        <FormControl>
                          <Input placeholder="Distrito o área" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="zone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Zona</FormLabel>
                        <FormControl>
                          <Input placeholder="Zona o región" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dirección</FormLabel>
                    <FormControl>
                      <Input placeholder="Dirección principal" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="groupEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo electrónico del grupo</FormLabel>
                    <FormControl>
                      <Input placeholder="contacto@mi-grupo.org" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isMixed"
                render={({ field }) => (
                  <FormItem className="flex items-start gap-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) =>
                          field.onChange(checked === true)
                        }
                      />
                    </FormControl>
                    <div className="space-y-1 leading-tight">
                      <FormLabel className="text-base">Grupo mixto</FormLabel>
                      <p className="text-sm text-[--muted-foreground]">
                        Marca esta opción si tu grupo incluye secciones mixtas.
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={
                  createOrganization.isPending || loadingTypes
                }
              >
                {createOrganization.isPending
                  ? "Creando organización..."
                  : "Crear organización"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

