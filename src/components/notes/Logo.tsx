import { Feather } from "lucide-react";

import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  showText?: boolean;
};

export function Logo({ className, showText = true }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Feather className="h-6 w-6 text-brand" strokeWidth={2.25} />
      {showText ? (
        <span className="font-serif text-2xl font-bold tracking-tight text-foreground">
          Notes
        </span>
      ) : null}
    </div>
  );
}
