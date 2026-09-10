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
      <div className="text-center py-10 border border-dashed border-border/50 rounded-2xl bg-muted/5">
        <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-3">
          <BellIcon className="w-6 h-6 text-muted-foreground/40" />
        </div>
        <p className="text-sm font-semibold text-foreground">
          No Reminder Progress Yet
        </p>
        <p className="text-xs text-muted-foreground mt-1 mb-4">
          Add or complete reminders to see completed vs pending here. No sample
          values are used.
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
    {
      key: "completed",
      status: "completed",
      count: completedCount,
      fill: "var(--color-completed)",
    },
    {
      key: "pending",
      status: "pending",
      count: pendingCount,
      fill: "var(--color-pending)",
    },
  ].filter((slice) => slice.count > 0);

  const completionRate = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="space-y-1 min-w-0">
      <ChartContainer
        config={chartConfig}
        className="aspect-square mx-auto w-full max-w-[260px] min-h-[200px] min-w-0"
      >
        <PieChart>
          <ChartTooltip
            content={<ChartTooltipContent nameKey="status" hideLabel />}
          />
          <Pie
            data={chartData}
            dataKey="count"
            nameKey="status"
            innerRadius={60}
            outerRadius={90}
            strokeWidth={3}
            stroke="var(--background)"
          >
            <Label
              content={({ viewBox }) => {
                if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                  return (
                    <text
                      x={viewBox.cx}
                      y={viewBox.cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      <tspan
                        x={viewBox.cx}
                        y={viewBox.cy}
                        className="fill-foreground text-3xl font-black"
                      >
                        {completionRate}%
                      </tspan>
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) + 22}
                        className="fill-muted-foreground text-[11px]"
                      >
                        done
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
      <p className="text-center text-[11px] text-muted-foreground pt-1">
        {completedCount} completed · {pendingCount} pending · {totalCount} total
      </p>
    </div>
  );
}
