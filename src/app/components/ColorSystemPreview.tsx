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

type ColorScale = {
  name: string;
  description: string;
  prefix: string;
  shades: number[];
  semantic: string;
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
    shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
    semantic: "primary",
  },
  {
    name: "Secondary",
    description: "Apoyo visual · Fondos sutiles, tarjetas y elementos de contraste.",
    prefix: "secondary",
    shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
    semantic: "secondary",
  },
  {
    name: "Positive",
    description: "Estados de éxito · Confirmaciones, KPIs favorables, badges positivos.",
    prefix: "positive",
    shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
    semantic: "positive",
  },
  {
    name: "Negative",
    description: "Alertas y errores · Mensajes críticos, indicadores de riesgo.",
    prefix: "negative",
    shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
    semantic: "negative",
  },
  {
    name: "Neutral",
    description: "Grises · Tipografía, bordes, fondos neutrales.",
    prefix: "neutral",
    shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
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

      <Card className="border-2" style={{ borderColor: "var(--color-primary-500)" }}>
        <CardHeader>
          <CardTitle>Paleta base</CardTitle>
          <CardDescription>
            Primary, Secondary, Positive y Negative forman la paleta base junto con Neutral.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {[
              {
                name: "Primary",
                description: "Acciones principales y enlaces",
                color: "var(--color-primary-500)",
              },
              {
                name: "Secondary",
                description: "Fondos de soporte y superficies",
                color: "var(--color-secondary-500)",
              },
              {
                name: "Positive",
                description: "Feedback positivo y KPIs",
                color: "var(--color-positive-500)",
              },
              {
                name: "Negative",
                description: "Alertas y estados críticos",
                color: "var(--color-negative-500)",
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
                      bg-[var(--color-primary-500)]
                </code>
              </div>
              <div>
                <p className="mb-1 text-sm text-muted-foreground">
                  Inline styles:
                </p>
                <code className="block rounded bg-muted p-2 text-sm">
                      style=&#123;&#123;color: &quot;var(--color-primary-600)&quot;&#125;&#125;
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
              <div className="grid gap-3 md:grid-cols-11">
                {scale.shades.map((shade) => {
                  const token = `var(--color-${scale.prefix}-${shade})`;

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
                          backgroundColor: `var(--color-${scale.prefix}-${shade})`,
                        }}
                      >
                        {isCopied ? (
                          <Check className="h-4 w-4 text-white drop-shadow" />
                        ) : (
                          <Copy className="h-4 w-4 text-white/0 transition group-hover:text-white" />
                        )}
                      </div>
                      <div className="text-center text-sm">
                        <p className="font-medium">{shade}</p>
                        <p className="text-xs text-muted-foreground">
                          --color-{scale.prefix}-{shade}
                        </p>
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
                      backgroundColor: `var(--color-${scale.prefix}-600)`,
                      color: "white",
                    }}
                  >
                    Botón Principal
                  </Button>
                  <Button
                    variant="outline"
                    style={{
                      borderColor: `var(--color-${scale.prefix}-500)`,
                      color: `var(--color-${scale.prefix}-700)`,
                    }}
                  >
                    Outline
                  </Button>
                  <Badge
                    style={{
                      backgroundColor: `var(--color-${scale.prefix}-100)`,
                      color: `var(--color-${scale.prefix}-800)`,
                    }}
                  >
                    Badge claro
                  </Badge>
                  <Badge
                    style={{
                      backgroundColor: `var(--color-${scale.prefix}-600)`,
                      color: "white",
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

