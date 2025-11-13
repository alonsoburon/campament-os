"use client"; // <--- AÑADE ESTA LÍNEA AL INICIO DEL ARCHIVO

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// ... el resto de tu archivo de botón permanece exactamente igual ...

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-[color:var(--primary)] text-[color:var(--primary-foreground)] hover:bg-[color:var(--primary)] hover:brightness-110",
        positive:
          "bg-[color:var(--positive)] text-[color:var(--positive-foreground)] hover:bg-[color:var(--positive)] hover:brightness-110",
        destructive:
          "bg-[color:var(--destructive)] text-[color:var(--destructive-foreground)] hover:bg-[color:var(--destructive)] hover:brightness-110",
        outline:
          "bg-transparent text-[color:var(--text-secondary)] hover:bg-[color:var(--surface-hover)] hover:text-[color:var(--text-primary)] border border-[color:var(--border)]",
        secondary:
          "bg-[color:var(--secondary)] text-[color:var(--text-primary)] hover:bg-[color:var(--surface-hover)]",
        muted:
          "bg-[color:var(--muted)] text-[color:var(--text-secondary)] border border-[color:var(--border)]",
        ghost:
          "bg-transparent text-[color:var(--text-secondary)] hover:bg-[color:var(--surface-hover)] hover:text-[color:var(--text-primary)]",
        link:
          "text-[color:var(--primary)] underline underline-offset-4 hover:text-[color:var(--text-primary)]",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-9 px-3",
        lg: "h-11 px-6",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={twMerge(clsx(buttonVariants({ variant, size, className })))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };