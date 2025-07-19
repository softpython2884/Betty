"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";
import CountUp from "../ui/count-up";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  footer?: React.ReactNode;
}

export function StatsCard({ title, value, icon: Icon, footer }: StatsCardProps) {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">
          {typeof value === 'number' ? (
            <CountUp to={value} duration={1.5} />
          ) : (
            value
          )}
        </div>
        {footer && <div className="text-xs text-muted-foreground pt-1">{footer}</div>}
      </CardContent>
    </Card>
  );
}
