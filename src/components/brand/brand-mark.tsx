import { Sparkles } from "lucide-react";

import { cn } from "@/lib/utils/cn";

interface BrandMarkProps {
  compact?: boolean;
  className?: string;
}

export function BrandMark({
  compact = false,
  className,
}: BrandMarkProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-3",
        className,
      )}
    >
      <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent"
        />

        <Sparkles
          aria-hidden="true"
          className="relative h-5 w-5"
        />
      </div>

      {!compact && (
        <div>
          <p className="text-sm font-semibold tracking-tight text-foreground">
            Smart Learn
          </p>

          <p className="text-xs text-muted-foreground">
            Academic Intelligence
          </p>
        </div>
      )}
    </div>
  );
}