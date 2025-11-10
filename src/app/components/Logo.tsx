"use client";

import { cn } from "./ui/utils";

type LogoVariant = "monochrome" | "inverse";

type LogoProps = {
  className?: string;
  variant?: LogoVariant;
  label?: string;
};

export function Logo({
  className,
  variant = "monochrome",
  label = "CampamentOS",
}: LogoProps) {
  return (
    <span
      role="img"
      aria-label={label}
      className={cn(
        "logo-campamentos",
        variant === "inverse"
          ? "logo-campamentos--inverse"
          : "logo-campamentos--monochrome",
        className,
      )}
    />
  );
}

