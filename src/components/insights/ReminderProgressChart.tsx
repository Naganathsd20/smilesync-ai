"use client";

import { Label, Pie, PieChart } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { BellIcon, ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const chartConfig = {
  completed: {
    label: "Completed",
    color: "hsl(160 84% 39%)",
  },
  pending: {
    label: "Pending",
    color: "hsl(38 92% 50%)",
  },
} satisfies ChartConfig;

export default function ReminderProgressChart({
  pendingCount,
  completedCount,
  totalCount,
}: {
  pendingCount: number;
  completedCount: number;
  totalCount: number;
}) {
  if (totalCount === 0) {
    return (
      <div className="text-center py-6 border border-dashed rounded-xl bg-muted/10">
        <BellIcon className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
        <p className="text-sm font-semibold text-foreground">No Reminder Progress Yet</p>
        <p className="text-xs text-muted-foreground mt-1 mb-3">
          Add or complete reminders to see completed vs pending here. No sample values are used.
        </p>
        <Link href="/reminders">
          <Button size="sm" className="gap-1.5">
            View Reminders
            <ArrowRightIcon className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>
    );
  }

  const chartData = [
    { key: "completed", status: "completed", count: completedCount, fill: "var(--color-completed)" },
    { key: "pending", status: "pending", count: pendingCount, fill: "var(--color-pending)" },
  ].filter((slice) => slice.count > 0);

  const completionRate = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="space-y-2 min-w-0">
      <ChartContainer config={chartConfig} className="aspect-square mx-auto w-full max-w-[280px] min-h-[220px] min-w-0">
        <PieChart>
          <ChartTooltip content={<ChartTooltipContent nameKey="status" hideLabel />} />
          <Pie
            data={chartData}
            dataKey="count"
            nameKey="status"
            innerRadius={56}
            strokeWidth={4}
          >
            <Label
              content={({ viewBox }) => {
                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                  return (
                    <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                      <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-2xl font-bold">
                        {completionRate}%
                      </tspan>
                      <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 18} className="fill-muted-foreground text-[10px]">
                        completed
                      </tspan>
                    </text>
                  );
                }
                return null;
              }}
            />
          </Pie>
          <ChartLegend content={<ChartLegendContent nameKey="status" />} />
        </PieChart>
      </ChartContainer>
      <p className="text-center text-xs text-muted-foreground">
        {completedCount} completed · {pendingCount} pending · {totalCount} total
      </p>
    </div>
  );
}
