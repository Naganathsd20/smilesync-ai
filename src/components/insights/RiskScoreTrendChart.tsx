"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { ActivityIcon, ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type HistoryItem = {
  id: string;
  riskScore: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  createdAt: string | Date;
};

const chartConfig = {
  riskScore: {
    label: "Risk Score",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

function formatAxisDate(date: string | Date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatFullDate(date: string | Date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function RiskScoreTrendChart({ history }: { history: HistoryItem[] }) {
  const chronological = [...history].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const chartData = chronological.map((item) => ({
    id: item.id,
    riskScore: item.riskScore,
    riskLevel: item.riskLevel,
    dateLabel: formatAxisDate(item.createdAt),
    fullDate: formatFullDate(item.createdAt),
  }));

  if (chartData.length === 0) {
    return (
      <div className="text-center py-8 border border-dashed rounded-xl bg-muted/10">
        <ActivityIcon className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
        <p className="text-sm font-semibold text-foreground">No Risk Score Trend Yet</p>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 mb-3">
          Complete an oral health assessment to plot your educational risk score over time. No sample data is shown.
        </p>
        <Link href="/assessment">
          <Button size="sm" className="gap-1.5">
            Start Assessment
            <ArrowRightIcon className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3 min-w-0">
      {chartData.length === 1 && (
        <p className="text-xs text-muted-foreground">
          Only one assessment is on record, so this is a single data point rather than a trend. Complete another assessment later to compare scores over time.
        </p>
      )}
      <ChartContainer config={chartConfig} className="aspect-[16/9] w-full min-h-[220px] min-w-0 max-w-full">
        <LineChart data={chartData} margin={{ left: 8, right: 12, top: 8, bottom: 8 }}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="dateLabel"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
          />
          <YAxis
            domain={[0, 100]}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            width={32}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={(_, payload) => {
                  const point = payload?.[0]?.payload as { fullDate?: string } | undefined;
                  return point?.fullDate ?? "Assessment";
                }}
              />
            }
          />
          <Line
            type="monotone"
            dataKey="riskScore"
            name="Risk Score"
            stroke="var(--color-riskScore)"
            strokeWidth={2}
            dot={{ r: chartData.length === 1 ? 6 : 4, fill: "var(--color-riskScore)" }}
            activeDot={{ r: 6 }}
            connectNulls
          />
        </LineChart>
      </ChartContainer>
    </div>
  );
}
