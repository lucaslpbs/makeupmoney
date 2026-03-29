"use client";
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius)] text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--silver)] disabled:pointer-events-none disabled:opacity-40 cursor-pointer font-[family-name:var(--font-body,_'DM_Sans')]",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--foreground)] text-[var(--background)] hover:bg-[var(--accent)] shadow-sm",
        outline:
          "border border-[var(--border)] bg-transparent text-[var(--foreground)] hover:border-[var(--silver)] hover:bg-[var(--surface-hover)]",
        ghost:
          "bg-transparent text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface)]",
        destructive:
          "bg-[var(--destructive)] text-[var(--destructive-foreground)] hover:opacity-80",
        silver:
          "border border-[var(--border)] bg-[var(--surface)] text-[var(--silver)] hover:border-[var(--silver)] hover:text-[var(--foreground)]",
        link: "text-[var(--silver)] underline-offset-4 hover:underline hover:text-[var(--foreground)] p-0 h-auto",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-11 px-6 text-base",
        icon: "h-9 w-9",
        "icon-sm": "h-7 w-7 text-xs",
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
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
