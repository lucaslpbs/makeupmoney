import { cn } from "@/lib/utils";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string;
  description?: string;
  icon?: LucideIcon;
  trend?: number; // percentage
  highlight?: boolean;
  className?: string;
}

export function MetricCard({
  label,
  value,
  description,
  icon: Icon,
  trend,
  highlight,
  className,
}: MetricCardProps) {
  const trendPositive = trend !== undefined && trend >= 0;

  return (
    <div
      className={cn(
        "rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)] p-5 flex flex-col gap-3 transition-all duration-200 hover:border-[var(--border-light)]",
        highlight && "border-[rgba(212,212,212,0.3)] bg-[rgba(212,212,212,0.03)]",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[var(--muted)] uppercase tracking-wide">
          {label}
        </span>
        {Icon && (
          <div className="h-7 w-7 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] flex items-center justify-center">
            <Icon className="h-3.5 w-3.5 text-[var(--silver)]" />
          </div>
        )}
      </div>

      <div className="flex items-end justify-between gap-2">
        <span
          className={cn(
            "metric-value text-2xl font-medium leading-none",
            highlight && "shimmer text-3xl"
          )}
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          {value}
        </span>

        {trend !== undefined && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs pb-0.5",
              trendPositive ? "text-[#86efac]" : "text-[#fca5a5]"
            )}
          >
            {trendPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>

      {description && (
        <p className="text-xs text-[var(--muted)] leading-relaxed">{description}</p>
      )}
    </div>
  );
}
