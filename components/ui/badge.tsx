import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "active" | "inactive" | "silver" | "destructive";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-[rgba(212,212,212,0.08)] text-[var(--silver)] border border-[rgba(212,212,212,0.2)]",
    active: "bg-[rgba(20,83,45,0.4)] text-[#86efac] border border-[rgba(134,239,172,0.2)]",
    inactive: "bg-[rgba(31,31,31,0.8)] text-[var(--muted)] border border-[var(--border)]",
    silver: "bg-[rgba(212,212,212,0.08)] text-[var(--silver)] border border-[rgba(212,212,212,0.2)]",
    destructive: "bg-[rgba(127,29,29,0.4)] text-[#fca5a5] border border-[rgba(252,165,165,0.2)]",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.7rem] font-medium tracking-wide",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
