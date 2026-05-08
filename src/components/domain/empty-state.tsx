// Reusable empty-state block for lists/tables/grids. Defaults to a generic
// FileQuestion icon; callers can swap in a topic-specific lucide icon.

import { FileQuestion } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="bg-card/50 flex flex-col items-center justify-center rounded-xl border border-dashed p-12 text-center">
      <div className="bg-muted text-muted-foreground mb-4 flex h-12 w-12 items-center justify-center rounded-full">
        {icon ?? <FileQuestion className="h-6 w-6" />}
      </div>
      <h3 className="mb-1 font-serif text-lg font-semibold">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-[250px] text-sm">{description}</p>
      {action && (
        <Button onClick={action.onClick} variant="secondary">
          {action.label}
        </Button>
      )}
    </div>
  );
}
