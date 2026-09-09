"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { CalendarIcon, ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const chartConfig = {
  upcoming: {
    label: "Upcoming confirmed",
    color: "hsl(217 91% 60%)",
  },
  completed: {
    label: "Completed",
    color: "hsl(160 84% 39%)",
  },
  total: {
    label: "Total",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

export default function AppointmentActivityChart({
  upcomingCount,
  completedCount,
  totalCount,
}: {
  upcomingCount: number;
  completedCount: number;
  totalCount: number;
}) {
  if (totalCount === 0) {
    return (
      <div className="text-center py-6 border border-dashed rounded-xl bg-muted/10">
        <CalendarIcon className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
        <p className="text-sm font-semibold text-foreground">No Appointment Activity</p>
        <p className="text-xs text-muted-foreground mt-1 mb-3">
          Book an appointment to see activity here. Charts use your real booking counts only.
        </p>
        <Link href="/appointments">
          <Button size="sm" className="gap-1.5">
            Book Appointment
            <ArrowRightIcon className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>
    );
  }

  const chartData = [
    { key: "upcoming", label: "Upcoming", count: upcomingCount, fill: "var(--color-upcoming)" },
    { key: "completed", label: "Completed", count: completedCount, fill: "var(--color-completed)" },
    { key: "total", label: "Total", count: totalCount, fill: "var(--color-total)" },
  ];

  return (
    <ChartContainer config={chartConfig} className="aspect-[16/9] w-full min-h-[200px] min-w-0 max-w-full">
      <BarChart data={chartData} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis
          allowDecimals={false}
          tickLine={false}
          axisLine={false}
          width={28}
          domain={[0, "auto"]}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel nameKey="key" />}
        />
        <Bar dataKey="count" radius={6} maxBarSize={56} name="Appointments">
          {chartData.map((entry) => (
            <Cell key={entry.key} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
