"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
  ReferenceLine,
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
    label: "Educational Risk Score",
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

export default function RiskScoreTrendChart({
  history,
}: {
  history: HistoryItem[];
}) {
  const chronological = [...history].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
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
      <div className="text-center py-10 border border-dashed border-border/50 rounded-2xl bg-muted/5">
        <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-3">
          <ActivityIcon className="w-6 h-6 text-muted-foreground/40" />
        </div>
        <p className="text-sm font-semibold text-foreground">
          No Risk Score Trend Yet
        </p>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 mb-4">
          Complete an oral health assessment to plot your educational risk score
          over time. No sample data is shown.
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
        <p className="text-xs text-muted-foreground bg-muted/20 border border-border/40 rounded-lg px-3 py-2">
          Only one assessment is on record — this shows a single data point, not
          a trend. Complete another assessment later to compare scores over
          time.
        </p>
      )}
      <ChartContainer
        config={chartConfig}
        className="aspect-[16/8] sm:aspect-[16/7] w-full min-h-[220px] max-h-[320px] min-w-0 max-w-full overflow-hidden"
      >
        <LineChart
          data={chartData}
          margin={{ left: 0, right: 12, top: 12, bottom: 8 }}
        >
          <CartesianGrid
            vertical={false}
            strokeDasharray="3 3"
            className="stroke-border/40"
          />
          {/* Visual zones: low/medium/high reference lines */}
          <ReferenceLine
            y={33}
            stroke="hsl(160 84% 39%)"
            strokeDasharray="4 3"
            strokeOpacity={0.35}
          />
          <ReferenceLine
            y={66}
            stroke="hsl(38 92% 50%)"
            strokeDasharray="4 3"
            strokeOpacity={0.35}
          />
          <XAxis
            dataKey="dateLabel"
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            className="text-[11px] fill-muted-foreground"
          />
          <YAxis
            domain={[0, 100]}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            width={30}
            className="text-[11px] fill-muted-foreground"
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                labelFormatter={(_, payload) => {
                  const point = payload?.[0]?.payload as
                    | { fullDate?: string }
                    | undefined;
                  return point?.fullDate ?? "Assessment";
                }}
              />
            }
          />
          <Line
            type="monotone"
            dataKey="riskScore"
            name="Educational Risk Score"
            stroke="var(--color-riskScore)"
            strokeWidth={2.5}
            dot={{
              r: chartData.length === 1 ? 7 : 4,
              fill: "var(--color-riskScore)",
              strokeWidth: 2,
              stroke: "var(--background)",
            }}
            activeDot={{ r: 6, strokeWidth: 2, stroke: "var(--background)" }}
            connectNulls
          />
        </LineChart>
      </ChartContainer>
      <p className="text-[11px] text-muted-foreground text-center">
        Dashed lines indicate Low (33) / Medium (66) educational risk zones. Not
        a clinical reference.
      </p>
    </div>
  );
}
