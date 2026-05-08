// Dashboard KPI tile. Takes any lucide-react icon (or other ReactNode) on
// the right and an optional trend tag below the value.

import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    label: string;
  };
}

export function StatCard({ title, value, icon, trend }: StatCardProps) {
  return (
    <Card className="hover-elevate transition-all">
      <CardContent className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-muted-foreground text-sm font-medium">{title}</h3>
          <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-xl">{icon}</div>
        </div>
        <div className="space-y-1">
          <p className="font-serif text-3xl font-bold">{value}</p>
          {trend && (
            <p className="text-muted-foreground text-xs font-medium">
              <span className={trend.value > 0 ? "text-green-500" : "text-red-500"}>
                {trend.value > 0 ? "+" : ""}
                {trend.value}%
              </span>{" "}
              {trend.label}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
