import { ChevronLeft } from "lucide-react";

import { cn } from "@/lib/utils";

type GoBackButtonProps = {
  onClick: () => void;
  label?: string;
  className?: string;
};

export function GoBackButton({
  onClick,
  label = "Go Back",
  className,
}: GoBackButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-1 text-sm font-medium text-muted transition-colors hover:text-foreground",
        className,
      )}
    >
      <ChevronLeft className="h-4 w-4" />
      {label}
    </button>
  );
}
