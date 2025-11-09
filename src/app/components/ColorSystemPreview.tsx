"use client";

import * as React from "react";
import { Check, Copy, Palette, X } from "lucide-react";

import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

const COLOR_VALUES = {
  primary: {
    50: "oklch(0.96 0.02 45)",
    100: "oklch(0.9 0.04 45)",
    200: "oklch(0.82 0.06 45)",
    300: "oklch(0.72 0.08 45)",
    400: "oklch(0.62 0.09 45)",
    500: "oklch(0.52 0.09 45)",
    600: "oklch(0.42 0.08 45)",
    700: "oklch(0.32 0.07 45)",
    800: "oklch(0.24 0.06 45)",
    900: "oklch(0.18 0.05 45)",
    950: "oklch(0.14 0.04 45)",
  },
  secondary: {
    50: "oklch(0.96 0.01 45)",
    100: "oklch(0.92 0.02 45)",
    200: "oklch(0.84 0.04 45)",
    300: "oklch(0.72 0.06 45)",
    400: "oklch(0.6 0.08 45)",
    500: "oklch(0.5 0.09 45)",
    600: "oklch(0.42 0.08 45)",
    700: "oklch(0.35 0.07 45)",
    800: "oklch(0.28 0.06 45)",
    900: "oklch(0.22 0.05 45)",
    950: "oklch(0.17 0.04 45)",
  },
  positive: {
    50: "oklch(0.97 0.02 142)",
    100: "oklch(0.94 0.04 142)",
    200: "oklch(0.88 0.08 142)",
    300: "oklch(0.78 0.12 142)",
    400: "oklch(0.68 0.14 142)",
    500: "oklch(0.58 0.15 142)",
    600: "oklch(0.48 0.14 142)",
    700: "oklch(0.4 0.12 142)",
    800: "oklch(0.32 0.1 142)",
    900: "oklch(0.26 0.08 142)",
    950: "oklch(0.2 0.06 142)",
  },
  negative: {
    50: "oklch(0.97 0.02 27)",
    100: "oklch(0.94 0.05 27)",
    200: "oklch(0.88 0.1 27)",
    300: "oklch(0.78 0.16 27)",
    400: "oklch(0.68 0.2 27)",
    500: "oklch(0.58 0.22 27)",
    600: "oklch(0.5 0.21 27)",
    700: "oklch(0.42 0.18 27)",
    800: "oklch(0.34 0.15 27)",
    900: "oklch(0.28 0.12 27)",
    950: "oklch(0.22 0.09 27)",
  },
  neutral: {
    50: "oklch(0.985 0 0)",
    100: "oklch(0.97 0 0)",
    200: "oklch(0.922 0 0)",
    300: "oklch(0.832 0 0)",
    400: "oklch(0.708 0 0)",
    500: "oklch(0.571 0 0)",
    600: "oklch(0.439 0 0)",
    700: "oklch(0.336 0 0)",
    800: "oklch(0.235 0 0)",
    900: "oklch(0.175 0 0)",
    950: "oklch(0.125 0 0)",
  },
} as const;

type Shade = keyof typeof COLOR_VALUES.primary;

const SHADES = [
  50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950,
] as Shade[];

type ColorScale = {
  name: string;
  description: string;
  prefix: string;
  shades: Shade[];
  semantic: keyof typeof COLOR_VALUES;
};

type SemanticToken = {
  name: string;
  bg: string;
  fg: string;
};

const COLOR_SCALES: ColorScale[] = [
  {
    name: "Primary",
    description:
      "Brand principal · Acciones destacadas, enlaces y estados activos.",
    prefix: "primary",
    shades: SHADES,
    semantic: "primary",
  },
  {
    name: "Positive",
    description: "Estados de éxito · Confirmaciones, KPIs favorables, badges positivos.",
    prefix: "positive",
    shades: SHADES,
    semantic: "positive",
  },
  {
    name: "Negative",
    description: "Alertas y errores · Mensajes críticos, indicadores de riesgo.",
    prefix: "negative",
    shades: SHADES,
    semantic: "negative",
  },
  {
    name: "Neutral",
    description: "Grises · Tipografía, bordes, fondos neutrales.",
    prefix: "neutral",
    shades: SHADES,
    semantic: "neutral",
  },
];

const SEMANTIC_TOKENS: SemanticToken[] = [
  { name: "primary", bg: "var(--primary)", fg: "var(--primary-foreground)" },
  {
    name: "secondary",
    bg: "var(--secondary)",
    fg: "var(--secondary-foreground)",
  },
  {
    name: "destructive",
    bg: "var(--destructive)",
    fg: "var(--destructive-foreground)",
  },
  { name: "muted", bg: "var(--muted)", fg: "var(--muted-foreground)" },
  { name: "accent", bg: "var(--accent)", fg: "var(--accent-foreground)" },
  { name: "card", bg: "var(--card)", fg: "var(--card-foreground)" },
];

type ColorSystemPreviewProps = {
  onClose: () => void;
};

export function ColorSystemPreview({ onClose }: ColorSystemPreviewProps) {
  const [copiedVariable, setCopiedVariable] = React.useState<string | null>(
    null,
  );

  const copyToClipboard = React.useCallback((token: string) => {
    if (typeof navigator === "undefined" || !navigator.clipboard) {
      return;
    }

    void navigator.clipboard.writeText(token).then(() => {
      setCopiedVariable(token);
      window.setTimeout(() => setCopiedVariable(null), 2000);
    });
  }, []);

  return (
    <section className="flex flex-col gap-8 p-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Sistema de Colores
          </h1>
          <p className="text-muted-foreground">
            Paleta reducida y escalable basada en el logo scout.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={onClose}>
            <X className="h-4 w-4" />
            Cerrar vista
          </Button>
          <Button className="gap-2">
            <Palette className="h-4 w-4" />
            Exportar tokens
          </Button>
        </div>
      </header>

      <Card className="border-2" style={{ borderColor: COLOR_VALUES.primary[500] }}>
        <CardHeader>
          <CardTitle>Paleta base</CardTitle>
          <CardDescription>
            Primary, Positive, Negative y Neutral componen la paleta base adaptable.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {[
              {
                name: "Primary",
                description: "Acciones principales y enlaces",
                color: COLOR_VALUES.primary[500],
              },
              {
                name: "Negative",
                description: "Alertas y estados críticos",
                color: COLOR_VALUES.negative[500],
              },
              {
                name: "Positive",
                description: "Feedback positivo y KPIs",
                color: COLOR_VALUES.positive[500],
              },
              {
                name: "Neutral",
                description: "Tipografía, bordes y fondos neutrales",
                color: COLOR_VALUES.neutral[500],
              },
            ].map((item) => (
              <div key={item.name} className="flex items-center gap-3">
                <div
                  className="h-12 w-12 rounded-lg border border-border"
                  style={{ backgroundColor: item.color }}
                />
                <div>
                  <p className="font-medium leading-tight">{item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cómo usar la paleta</CardTitle>
          <CardDescription>
            Cada color tiene 11 tonos (50-950) para máxima flexibilidad.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-semibold">Convención de nombres</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>
                  • <strong>50-100:</strong> Fondos muy sutiles, estados hover
                </li>
                <li>
                  • <strong>200-300:</strong> Bordes y divisores
                </li>
                <li>
                  • <strong>400-600:</strong> Botones y elementos principales
                </li>
                <li>
                  • <strong>700-900:</strong> Texto y elementos oscuros
                </li>
                <li>
                  • <strong>950:</strong> Texto de alta jerarquía
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold">Uso en código</h4>
              <div>
                <p className="mb-1 text-sm text-muted-foreground">
                  Tailwind CSS:
                </p>
                <code className="block rounded bg-muted p-2 text-sm">
                      bg-primary-600
                </code>
              </div>
              <div>
                <p className="mb-1 text-sm text-muted-foreground">
                  Inline styles:
                </p>
                <code className="block rounded bg-muted p-2 text-sm">
                      style=&#123;&#123;color: &quot;oklch(0.42 0.08 45)&quot;&#125;&#125;
                </code>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        {COLOR_SCALES.map((scale) => (
          <Card key={scale.name}>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle>{scale.name}</CardTitle>
                  <CardDescription>{scale.description}</CardDescription>
                </div>
                <Badge variant="outline">{scale.semantic}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-11">
                {scale.shades.map((shade) => {
                  const colorValue = COLOR_VALUES[scale.semantic][shade];
                  const token = colorValue;
                  const isCopied = copiedVariable === token;

                  return (
                    <button
                      key={shade}
                      type="button"
                      onClick={() => copyToClipboard(token)}
                      className="group flex flex-col items-center gap-3 rounded-lg border border-border p-2 transition hover:border-foreground/40"
                    >
                      <div
                        className="flex h-24 w-full items-end justify-center rounded-md border border-border pb-2 transition group-hover:scale-[1.02]"
                        style={{
                          backgroundColor: colorValue,
                        }}
                      >
                        {isCopied ? (
                          <Check className="h-4 w-4 text-white drop-shadow" />
                        ) : (
                          <Copy className="h-4 w-4 text-white/0 transition group-hover:text-white" />
                        )}
                      </div>
                      <div className="flex w-full flex-col items-center gap-1 text-center text-xs leading-tight">
                        <p className="text-sm font-semibold text-foreground">
                          {shade}
                        </p>
                        <code className="rounded bg-muted px-2 py-1 text-[11px] font-mono text-muted-foreground">
                          {scale.semantic}.{shade}
                        </code>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="space-y-3 border-t border-border pt-6">
                <h4 className="font-semibold">Ejemplos</h4>
                <div className="flex flex-wrap gap-3">
                  <Button
                    style={{
                      backgroundColor: COLOR_VALUES[scale.semantic][600],
                      color:
                        scale.semantic === "neutral"
                          ? "var(--foreground)"
                          : "white",
                    }}
                  >
                    Botón Principal
                  </Button>
                  <Button
                    variant="outline"
                    style={{
                      borderColor: COLOR_VALUES[scale.semantic][500],
                      color: COLOR_VALUES[scale.semantic][700],
                    }}
                  >
                    Outline
                  </Button>
                  <Badge
                    variant="secondary"
                    style={{
                      backgroundColor: COLOR_VALUES[scale.semantic][100],
                      color: COLOR_VALUES[scale.semantic][800],
                    }}
                  >
                    Badge claro
                  </Badge>
                  <Badge
                    style={{
                      backgroundColor: COLOR_VALUES[scale.semantic][600],
                      color:
                        scale.semantic === "neutral"
                          ? "var(--foreground)"
                          : "white",
                    }}
                  >
                    Badge sólido
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tokens semánticos</CardTitle>
          <CardDescription>
            Variables que cambian automáticamente según el contexto.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {SEMANTIC_TOKENS.map((token) => (
              <div
                key={token.name}
                className="flex items-center justify-between rounded-lg border border-border p-4"
                style={{ backgroundColor: token.bg, color: token.fg }}
              >
                <span className="capitalize">{token.name}</span>
                <code className="text-sm opacity-70">--{token.name}</code>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

