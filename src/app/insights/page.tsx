"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import {
  getDentalHealthInsights,
  getInsightsAiHealthSummary,
  getPersonalizedInsights,
  type PersonalizedInsightsOutput,
} from "@/lib/actions/insights";
import {
  buildPatternInsights,
  type PatternInsight,
} from "@/lib/insights/pattern-insights";
import RiskScoreTrendChart from "@/components/insights/RiskScoreTrendChart";
import AppointmentActivityChart from "@/components/insights/AppointmentActivityChart";
import ReminderProgressChart from "@/components/insights/ReminderProgressChart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUpIcon,
  TrendingDownIcon,
  MinusIcon,
  ActivityIcon,
  CalendarIcon,
  CalendarCheckIcon,
  BellIcon,
  BotIcon,
  SparklesIcon,
  ShieldAlertIcon,
  CheckCircle2Icon,
  HeartPulseIcon,
  InfoIcon,
  ArrowRightIcon,
  AlertTriangleIcon,
  MessageSquareIcon,
  ClipboardListIcon,
  PercentIcon,
  ClockIcon,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface InsightsData {
  userProfile: {
    firstName: string;
    lastName: string;
    email: string;
    createdAt: string | Date;
  };
  assessmentStats: {
    latest: {
      id: string;
      riskLevel: "LOW" | "MEDIUM" | "HIGH";
      riskScore: number;
      riskFactors: string[];
      recommendations: string[];
      warningSigns: string[];
      nextStep: string;
      disclaimer: string;
      createdAt: string | Date;
    } | null;
    riskScoreChange: number | null;
    totalCount: number;
    history: Array<{
      id: string;
      riskScore: number;
      riskLevel: "LOW" | "MEDIUM" | "HIGH";
      createdAt: string | Date;
    }>;
  };
  appointmentStats: {
    totalCount: number;
    upcomingCount: number;
    completedCount: number;
    recent: Array<{
      id: string;
      date: string | Date;
      time: string;
      reason: string | null;
      doctor: {
        name: string;
        speciality: string;
      };
    }>;
  };
  reminderStats: {
    totalCount: number;
    pendingCount: number;
    completedCount: number;
    habitCount: number;
  };
  novaStats: {
    conversationCount: number;
    messageCount: number;
  };
}

/* ─────────────────────────────────────────────
   SECTION HEADING – unified style helper
───────────────────────────────────────────── */
function SectionHeading({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="p-1.5 rounded-md bg-muted/50 text-muted-foreground">
        {icon}
      </div>
      <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
        {label}
      </h2>
    </div>
  );
}

/* ─────────────────────────────────────────────
   METRIC ROW – used inside card bodies
───────────────────────────────────────────── */
function MetricRow({
  icon,
  iconBg,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between p-3 rounded-xl border transition-colors ${
        accent
          ? "border-primary/20 bg-primary/5"
          : "border-border/50 bg-muted/20 hover:bg-muted/30"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${iconBg}`}
        >
          {icon}
        </div>
        <span className="text-sm font-medium text-foreground">{label}</span>
      </div>
      <span
        className={`text-lg font-bold ${accent ? "text-primary" : "text-foreground"}`}
      >
        {value}
      </span>
    </div>
  );
}

export default function InsightsPage() {
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(true);
  const [aiError, setAiError] = useState<string | null>(null);

  const [personalizedInsights, setPersonalizedInsights] =
    useState<PersonalizedInsightsOutput | null>(null);
  const [personalizedLoading, setPersonalizedLoading] = useState(true);
  const [personalizedError, setPersonalizedError] = useState<string | null>(
    null,
  );
  const [patternInsights, setPatternInsights] = useState<PatternInsight[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await getDentalHealthInsights();
        if (res.success && res.data) {
          setInsights(res.data);
          setPatternInsights(buildPatternInsights(res.data));
        } else if (res.error) {
          toast.error(res.error);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load insights dashboard.");
      } finally {
        setLoading(false);
      }
    }

    async function loadPersonalized() {
      try {
        setPersonalizedLoading(true);
        setPersonalizedError(null);
        const res = await getPersonalizedInsights();
        if (res.success && res.data) {
          setPersonalizedInsights(res.data);
        } else {
          setPersonalizedError(
            res.error || "Personalized insights unavailable.",
          );
        }
      } catch (err) {
        console.error(err);
        setPersonalizedError("Failed to generate personalized insights.");
      } finally {
        setPersonalizedLoading(false);
      }
    }

    async function loadAiSummary() {
      try {
        setAiLoading(true);
        setAiError(null);
        const res = await getInsightsAiHealthSummary();
        if (res.success && res.summary) {
          setAiSummary(res.summary);
        } else {
          setAiError(
            res.error || "AI Health Summary is currently unavailable.",
          );
        }
      } catch (err) {
        console.error(err);
        setAiError(
          "Failed to generate AI Health Summary. Your dashboard metrics are still available.",
        );
      } finally {
        setAiLoading(false);
      }
    }

    loadData();
    loadAiSummary();
    loadPersonalized();
  }, []);

  /* ─── Badge helpers ─── */
  const getRiskBadge = (level?: "LOW" | "MEDIUM" | "HIGH") => {
    if (!level) return <Badge variant="secondary">N/A</Badge>;
    switch (level) {
      case "LOW":
        return (
          <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 font-semibold">
            Low Risk
          </Badge>
        );
      case "MEDIUM":
        return (
          <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30 font-semibold">
            Medium Risk
          </Badge>
        );
      case "HIGH":
        return (
          <Badge className="bg-rose-500/15 text-rose-600 border-rose-500/30 font-semibold">
            High Risk
          </Badge>
        );
    }
  };

  const getPriorityBadge = (priority: "LOW" | "MEDIUM" | "HIGH") => {
    switch (priority) {
      case "HIGH":
        return (
          <Badge className="bg-rose-500/15 text-rose-600 border-rose-500/30 whitespace-nowrap font-semibold text-[11px]">
            ● High
          </Badge>
        );
      case "MEDIUM":
        return (
          <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30 whitespace-nowrap font-semibold text-[11px]">
            ● Medium
          </Badge>
        );
      case "LOW":
        return (
          <Badge className="bg-blue-500/15 text-blue-600 border-blue-500/30 whitespace-nowrap font-semibold text-[11px]">
            ● Low
          </Badge>
        );
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score <= 33) return "text-emerald-500";
    if (score <= 66) return "text-amber-500";
    return "text-rose-500";
  };

  const getRiskScoreBg = (score: number) => {
    if (score <= 33) return "from-emerald-500/10";
    if (score <= 66) return "from-amber-500/10";
    return "from-rose-500/10";
  };

  const formatDate = (date: string | Date) =>
    new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const reminderCompletionRate =
    insights && insights.reminderStats.totalCount > 0
      ? Math.round(
          (insights.reminderStats.completedCount /
            insights.reminderStats.totalCount) *
            100,
        )
      : null;

  /* ─── Loading skeleton ─── */
  if (loading) {
    return (
      <>
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pt-24 space-y-10 overflow-x-hidden">
          <div className="space-y-2 border-b border-border/40 pb-6">
            <div className="h-8 w-72 bg-muted/40 animate-pulse rounded-lg" />
            <div className="h-4 w-96 bg-muted/30 animate-pulse rounded" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-32 bg-muted/30 animate-pulse rounded-2xl"
              />
            ))}
          </div>
          <div className="h-52 bg-muted/30 animate-pulse rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-52 bg-muted/30 animate-pulse rounded-2xl" />
            <div className="h-52 bg-muted/30 animate-pulse rounded-2xl" />
          </div>
          <div className="h-64 bg-muted/30 animate-pulse rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-64 bg-muted/30 animate-pulse rounded-2xl" />
            <div className="h-64 bg-muted/30 animate-pulse rounded-2xl" />
          </div>
        </main>
      </>
    );
  }

  /* ─── Fatal error ─── */
  if (!insights) {
    return (
      <>
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pt-24">
          <Card className="border-border/50">
            <CardContent className="p-10 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-muted/30 flex items-center justify-center mx-auto">
                <InfoIcon className="w-7 h-7 text-muted-foreground" />
              </div>
              <p className="text-base font-semibold text-foreground">
                No Insights Available
              </p>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                We could not aggregate your health insights. Please try
                refreshing the page.
              </p>
              <Button onClick={() => window.location.reload()} className="mt-2">
                Reload Page
              </Button>
            </CardContent>
          </Card>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pt-24 space-y-10 overflow-x-hidden">
        {/* ═══════════════════════════════════════════════
            PAGE HEADER
        ═══════════════════════════════════════════════ */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/40 pb-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 rounded-xl text-primary ring-1 ring-primary/20">
                <TrendingUpIcon className="w-5 h-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Dental Health Insights
              </h1>
            </div>
            <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
              A comprehensive view of your SmileSync oral health activity — risk
              profile, care habits, appointments, and AI analysis.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 border border-border/40 rounded-full px-3 py-1.5 shrink-0">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live data · {formatDate(new Date())}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════
            SECTION 1 — HEALTH OVERVIEW
        ═══════════════════════════════════════════════ */}
        <section aria-label="Health Overview">
          <SectionHeading
            icon={<ShieldAlertIcon className="w-3.5 h-3.5" />}
            label="Health Overview"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* ── Risk Score Hero ── */}
            <Card
              className={`border-primary/20 bg-gradient-to-br ${
                insights.assessmentStats.latest
                  ? getRiskScoreBg(insights.assessmentStats.latest.riskScore)
                  : "from-primary/5"
              } via-card to-card shadow-sm hover:shadow-md transition-shadow duration-300`}
            >
              <CardHeader className="pb-1.5 pt-5 px-5">
                <CardDescription className="text-xs flex items-center justify-between text-muted-foreground">
                  <span className="font-medium">Educational Risk Score</span>
                  <ShieldAlertIcon className="w-4 h-4 text-primary/70" />
                </CardDescription>
              </CardHeader>
              <CardContent className="px-5 pb-5 pt-1 space-y-2">
                {insights.assessmentStats.latest ? (
                  <>
                    <div className="flex items-end gap-1.5">
                      <span
                        className={`text-4xl font-black tabular-nums ${getRiskScoreColor(
                          insights.assessmentStats.latest.riskScore,
                        )}`}
                      >
                        {insights.assessmentStats.latest.riskScore}
                      </span>
                      <span className="text-sm text-muted-foreground mb-1 font-medium">
                        / 100
                      </span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {getRiskBadge(insights.assessmentStats.latest.riskLevel)}
                      {insights.assessmentStats.riskScoreChange !== null ? (
                        <span
                          className={`inline-flex items-center gap-0.5 text-xs font-semibold rounded-full px-2 py-0.5 ${
                            insights.assessmentStats.riskScoreChange > 0
                              ? "bg-rose-500/10 text-rose-600"
                              : insights.assessmentStats.riskScoreChange < 0
                                ? "bg-emerald-500/10 text-emerald-600"
                                : "bg-muted/40 text-muted-foreground"
                          }`}
                        >
                          {insights.assessmentStats.riskScoreChange > 0 ? (
                            <TrendingUpIcon className="w-3 h-3" />
                          ) : insights.assessmentStats.riskScoreChange < 0 ? (
                            <TrendingDownIcon className="w-3 h-3" />
                          ) : (
                            <MinusIcon className="w-3 h-3" />
                          )}
                          {insights.assessmentStats.riskScoreChange > 0
                            ? "+"
                            : ""}
                          {insights.assessmentStats.riskScoreChange}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          First assessment
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground pt-0.5">
                      As of{" "}
                      {formatDate(insights.assessmentStats.latest.createdAt)}
                    </p>
                  </>
                ) : (
                  <div className="space-y-2 pt-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      No assessment yet
                    </p>
                    <Link href="/assessment">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 text-xs h-7 px-3"
                      >
                        Take Assessment
                        <ArrowRightIcon className="w-3 h-3" />
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ── Total Assessments ── */}
            <Card className="border-border/50 bg-card hover:shadow-md transition-shadow duration-300">
              <CardHeader className="pb-1.5 pt-5 px-5">
                <CardDescription className="text-xs flex items-center justify-between text-muted-foreground">
                  <span className="font-medium">Total Assessments</span>
                  <div className="w-7 h-7 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <ActivityIcon className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent className="px-5 pb-5 pt-1 space-y-1">
                <p className="text-4xl font-black tabular-nums text-foreground">
                  {insights.assessmentStats.totalCount}
                </p>
                <p className="text-xs text-muted-foreground">
                  {insights.assessmentStats.latest
                    ? `Latest ${formatDate(insights.assessmentStats.latest.createdAt)}`
                    : "No assessments completed yet"}
                </p>
              </CardContent>
            </Card>

            {/* ── Upcoming Appointments ── */}
            <Card className="border-border/50 bg-card hover:shadow-md transition-shadow duration-300">
              <CardHeader className="pb-1.5 pt-5 px-5">
                <CardDescription className="text-xs flex items-center justify-between text-muted-foreground">
                  <span className="font-medium">Upcoming Confirmed</span>
                  <div className="w-7 h-7 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <CalendarIcon className="w-3.5 h-3.5 text-blue-500" />
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent className="px-5 pb-5 pt-1 space-y-1">
                <p className="text-4xl font-black tabular-nums text-foreground">
                  {insights.appointmentStats.upcomingCount}
                </p>
                <p className="text-xs text-muted-foreground">
                  {insights.appointmentStats.upcomingCount > 0
                    ? "Confirmed appointments ahead"
                    : "No upcoming appointments"}
                </p>
              </CardContent>
            </Card>

            {/* ── Pending Reminders ── */}
            <Card className="border-border/50 bg-card hover:shadow-md transition-shadow duration-300">
              <CardHeader className="pb-1.5 pt-5 px-5">
                <CardDescription className="text-xs flex items-center justify-between text-muted-foreground">
                  <span className="font-medium">Pending Reminders</span>
                  <div className="w-7 h-7 rounded-full bg-amber-500/10 flex items-center justify-center">
                    <BellIcon className="w-3.5 h-3.5 text-amber-500" />
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent className="px-5 pb-5 pt-1 space-y-1">
                <p className="text-4xl font-black tabular-nums text-foreground">
                  {insights.reminderStats.pendingCount}
                </p>
                <p className="text-xs text-muted-foreground">
                  {insights.reminderStats.totalCount > 0
                    ? `${insights.reminderStats.completedCount} completed of ${insights.reminderStats.totalCount} total`
                    : "No reminders set yet"}
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            SECTION 2 — SMART INSIGHTS & ACTIONS
        ═══════════════════════════════════════════════ */}
        <section aria-label="Smart Insights and Actions">
          <SectionHeading
            icon={<SparklesIcon className="w-3.5 h-3.5" />}
            label="Smart Insights & Actions"
          />

          {/* AI Headline */}
          <div className="mb-4 min-h-[28px]">
            {personalizedLoading ? (
              <div className="h-6 w-3/4 bg-muted/40 animate-pulse rounded-lg" />
            ) : personalizedInsights?.headline ? (
              <p className="text-lg font-semibold text-foreground leading-snug">
                {personalizedInsights.headline}
              </p>
            ) : (
              <p className="text-base text-muted-foreground italic">
                {personalizedError ||
                  "Your personalized dental health patterns."}
              </p>
            )}
          </div>

          {personalizedLoading && patternInsights.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-44 bg-muted/30 animate-pulse rounded-2xl"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Deterministic pattern insights */}
              {patternInsights.map((insight) => (
                <Card
                  key={insight.id}
                  className="border-border/50 flex flex-col bg-card hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
                >
                  <CardHeader className="pb-2 pt-5 px-5">
                    <div className="flex justify-between items-start gap-3">
                      <CardTitle className="text-sm font-bold leading-snug text-foreground">
                        {insight.title}
                      </CardTitle>
                      {getPriorityBadge(insight.priority)}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-between pt-0 px-5 pb-5 space-y-3">
                    <CardDescription className="text-sm leading-relaxed">
                      {insight.description}
                    </CardDescription>
                    <Link href={insight.action.href}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-2 justify-between h-8 text-xs font-medium"
                      >
                        {insight.action.label}
                        <ArrowRightIcon className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}

              {/* AI observational insights (fill remaining slots up to 6) */}
              {personalizedInsights?.insights
                ?.slice(0, Math.max(0, 6 - patternInsights.length))
                .map((insight, idx) => (
                  <Card
                    key={`ai-insight-${idx}`}
                    className="border-border/50 flex flex-col bg-card hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
                  >
                    <CardHeader className="pb-2 pt-5 px-5">
                      <div className="flex justify-between items-start gap-3">
                        <CardTitle className="text-sm font-bold leading-snug text-foreground flex items-center gap-1.5">
                          <SparklesIcon className="w-3.5 h-3.5 text-primary shrink-0" />
                          {insight.title}
                        </CardTitle>
                        {getPriorityBadge(insight.priority)}
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 pt-0 px-5 pb-5">
                      <CardDescription className="text-sm leading-relaxed">
                        {insight.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                ))}

              {/* AI smart action cards */}
              {personalizedInsights?.actions?.slice(0, 3).map((action, idx) => (
                <Card
                  key={`ai-action-${idx}`}
                  className="border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card flex flex-col hover:-translate-y-0.5 hover:shadow-md transition-all duration-200"
                >
                  <CardHeader className="pb-2 pt-5 px-5">
                    <CardTitle className="text-sm font-bold leading-snug text-foreground flex items-center gap-1.5">
                      <SparklesIcon className="w-3.5 h-3.5 text-primary shrink-0" />
                      {action.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-between pt-0 px-5 pb-5 space-y-3">
                    <CardDescription className="text-sm leading-relaxed text-foreground/75">
                      {action.description}
                    </CardDescription>
                    <Link href={action.href}>
                      <Button
                        size="sm"
                        className="w-full gap-2 justify-between h-8 text-xs font-medium"
                      >
                        Take Action
                        <ArrowRightIcon className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}

              {/* True empty state */}
              {patternInsights.length === 0 &&
                !personalizedInsights?.insights?.length &&
                !personalizedInsights?.actions?.length && (
                  <Card className="border-dashed border-border/50 md:col-span-2 lg:col-span-3 bg-muted/5">
                    <CardContent className="p-10 text-center space-y-2">
                      <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center mx-auto">
                        <InfoIcon className="w-6 h-6 text-muted-foreground/50" />
                      </div>
                      <p className="text-sm font-semibold text-foreground">
                        More Activity Needed
                      </p>
                      <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                        Continue using SmileSync to generate personalized
                        insights and recommended actions.
                      </p>
                    </CardContent>
                  </Card>
                )}
            </div>
          )}
        </section>

        {/* ═══════════════════════════════════════════════
            SECTION 3 — RISK SCORE TREND (Chart)
        ═══════════════════════════════════════════════ */}
        <section aria-label="Risk Score Trend">
          <Card className="border-border/50 overflow-hidden shadow-sm">
            <CardHeader className="px-6 pt-6 pb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                  <TrendingUpIcon className="w-4 h-4" />
                </div>
                <CardTitle className="text-lg font-bold">
                  Risk Score Trend
                </CardTitle>
              </div>
              <CardDescription className="mt-1">
                Educational risk score by assessment date, oldest to newest.
                Scores are shown as recorded — this is not a clinical diagnosis.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-6 min-w-0">
              <RiskScoreTrendChart history={insights.assessmentStats.history} />
            </CardContent>
          </Card>
        </section>

        {/* ═══════════════════════════════════════════════
            SECTION 4 — APPOINTMENT & REMINDER METRICS
        ═══════════════════════════════════════════════ */}
        <section aria-label="Appointment and Reminder Metrics">
          <SectionHeading
            icon={<CalendarCheckIcon className="w-3.5 h-3.5" />}
            label="Activity Metrics"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Appointment Metrics */}
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="px-6 pt-6 pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-blue-500/10">
                    <CalendarCheckIcon className="w-4 h-4 text-blue-500" />
                  </div>
                  <CardTitle className="text-base font-bold">
                    Appointment Metrics
                  </CardTitle>
                </div>
                <CardDescription className="mt-1">
                  Overview of your dental appointments.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                {insights.appointmentStats.totalCount === 0 ? (
                  <div className="text-center py-8 border border-dashed border-border/50 rounded-2xl bg-muted/5">
                    <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-3">
                      <CalendarIcon className="w-6 h-6 text-muted-foreground/40" />
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                      No Appointments
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 mb-4">
                      You haven&apos;t booked any appointments yet.
                    </p>
                    <Link href="/appointments">
                      <Button size="sm" className="gap-1.5">
                        Book Appointment
                        <ArrowRightIcon className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <MetricRow
                      icon={<CalendarIcon className="w-4 h-4 text-blue-500" />}
                      iconBg="bg-blue-500/10"
                      label="Upcoming Confirmed"
                      value={insights.appointmentStats.upcomingCount}
                    />
                    <MetricRow
                      icon={
                        <CheckCircle2Icon className="w-4 h-4 text-emerald-500" />
                      }
                      iconBg="bg-emerald-500/10"
                      label="Completed"
                      value={insights.appointmentStats.completedCount}
                    />
                    <MetricRow
                      icon={
                        <ClipboardListIcon className="w-4 h-4 text-primary" />
                      }
                      iconBg="bg-primary/10"
                      label="Total Appointments"
                      value={insights.appointmentStats.totalCount}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Reminder Metrics */}
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="px-6 pt-6 pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-amber-500/10">
                    <BellIcon className="w-4 h-4 text-amber-500" />
                  </div>
                  <CardTitle className="text-base font-bold">
                    Smart Reminder Metrics
                  </CardTitle>
                </div>
                <CardDescription className="mt-1">
                  Your reminder tracking and completion rates.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                {insights.reminderStats.totalCount === 0 ? (
                  <div className="text-center py-8 border border-dashed border-border/50 rounded-2xl bg-muted/5">
                    <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-3">
                      <BellIcon className="w-6 h-6 text-muted-foreground/40" />
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                      No Reminders
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 mb-4">
                      You don&apos;t have any reminders set up yet.
                    </p>
                    <Link href="/reminders">
                      <Button size="sm" className="gap-1.5">
                        View Reminders
                        <ArrowRightIcon className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <MetricRow
                      icon={<ClockIcon className="w-4 h-4 text-amber-500" />}
                      iconBg="bg-amber-500/10"
                      label="Pending"
                      value={insights.reminderStats.pendingCount}
                    />
                    <MetricRow
                      icon={
                        <CheckCircle2Icon className="w-4 h-4 text-emerald-500" />
                      }
                      iconBg="bg-emerald-500/10"
                      label="Completed"
                      value={insights.reminderStats.completedCount}
                    />
                    <MetricRow
                      icon={
                        <ClipboardListIcon className="w-4 h-4 text-primary" />
                      }
                      iconBg="bg-primary/10"
                      label="Total Reminders"
                      value={insights.reminderStats.totalCount}
                    />
                    <MetricRow
                      icon={<PercentIcon className="w-4 h-4 text-primary" />}
                      iconBg="bg-primary/10"
                      label="Completion Rate"
                      value={`${reminderCompletionRate}%`}
                      accent
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            SECTION 5 — ACTIVITY VISUALIZATION CHARTS
        ═══════════════════════════════════════════════ */}
        <section aria-label="Activity Charts">
          <SectionHeading
            icon={<ActivityIcon className="w-3.5 h-3.5" />}
            label="Activity Visualizations"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-w-0">
            <Card className="border-border/50 overflow-hidden min-w-0 shadow-sm">
              <CardHeader className="px-6 pt-6 pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-blue-500/10">
                    <CalendarCheckIcon className="w-4 h-4 text-blue-500" />
                  </div>
                  <CardTitle className="text-base font-bold">
                    Appointment Activity
                  </CardTitle>
                </div>
                <CardDescription className="mt-1">
                  Upcoming, completed, and total appointments from your account.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 pb-6 min-w-0">
                <AppointmentActivityChart
                  upcomingCount={insights.appointmentStats.upcomingCount}
                  completedCount={insights.appointmentStats.completedCount}
                  totalCount={insights.appointmentStats.totalCount}
                />
              </CardContent>
            </Card>

            <Card className="border-border/50 overflow-hidden min-w-0 shadow-sm">
              <CardHeader className="px-6 pt-6 pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-amber-500/10">
                    <BellIcon className="w-4 h-4 text-amber-500" />
                  </div>
                  <CardTitle className="text-base font-bold">
                    Reminder Progress
                  </CardTitle>
                </div>
                <CardDescription className="mt-1">
                  Completed versus pending reminders from your real reminder
                  list.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 pb-6 min-w-0">
                <ReminderProgressChart
                  pendingCount={insights.reminderStats.pendingCount}
                  completedCount={insights.reminderStats.completedCount}
                  totalCount={insights.reminderStats.totalCount}
                />
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            SECTION 6 — ASSESSMENT HISTORY
        ═══════════════════════════════════════════════ */}
        <section aria-label="Assessment History">
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="px-6 pt-6 pb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                  <TrendingUpIcon className="w-4 h-4" />
                </div>
                <CardTitle className="text-lg font-bold">
                  Assessment History
                </CardTitle>
              </div>
              <CardDescription className="mt-1">
                Historical risk evaluations from your completed oral health
                assessments, newest first.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              {insights.assessmentStats.history.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-border/50 rounded-2xl bg-muted/5">
                  <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-3">
                    <ActivityIcon className="w-6 h-6 text-muted-foreground/40" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    No Assessment History
                  </p>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 mb-4">
                    Complete your first AI Oral Health Assessment to start
                    tracking your health trends over time.
                  </p>
                  <Link href="/assessment">
                    <Button size="sm" className="gap-1.5">
                      Start Assessment
                      <ArrowRightIcon className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {insights.assessmentStats.history.map((item, index) => (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${
                        index === 0
                          ? "border-primary/25 bg-primary/5"
                          : "border-border/50 bg-muted/10 hover:bg-muted/20"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                            index === 0
                              ? "bg-primary/15 text-primary"
                              : "bg-muted/40 text-muted-foreground"
                          }`}
                        >
                          #{insights.assessmentStats.history.length - index}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground flex items-center gap-1.5 flex-wrap">
                            {index === 0 && (
                              <Badge
                                variant="outline"
                                className="text-[10px] px-1.5 py-0 font-semibold border-primary/30 text-primary"
                              >
                                Latest
                              </Badge>
                            )}
                            {formatDate(item.createdAt)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Score:{" "}
                            <span
                              className={`font-bold ${getRiskScoreColor(item.riskScore)}`}
                            >
                              {item.riskScore}
                            </span>{" "}
                            / 100
                          </p>
                        </div>
                      </div>
                      <div className="shrink-0">
                        {getRiskBadge(item.riskLevel)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* ═══════════════════════════════════════════════
            SECTION 7 — CARE RECOMMENDATIONS & NOVA
        ═══════════════════════════════════════════════ */}
        <section aria-label="Care Recommendations and Nova Activity">
          <SectionHeading
            icon={<HeartPulseIcon className="w-3.5 h-3.5" />}
            label="Care Recommendations & Nova Activity"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Care Recommendations */}
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="px-6 pt-6 pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-emerald-500/10">
                    <HeartPulseIcon className="w-4 h-4 text-emerald-500" />
                  </div>
                  <CardTitle className="text-base font-bold">
                    Care Recommendations
                  </CardTitle>
                </div>
                <CardDescription className="mt-1">
                  Key focus areas from your latest oral health assessment.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-6 pb-6 space-y-4">
                {!insights.assessmentStats.latest ? (
                  <div className="text-center py-8 border border-dashed border-border/50 rounded-2xl bg-muted/5">
                    <div className="w-12 h-12 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-3">
                      <HeartPulseIcon className="w-6 h-6 text-muted-foreground/40" />
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                      No Assessment Data
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 mb-4">
                      Take an assessment to generate personalized care
                      recommendations.
                    </p>
                    <Link href="/assessment">
                      <Button size="sm" className="gap-1.5">
                        Take Assessment
                        <ArrowRightIcon className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <>
                    {insights.assessmentStats.latest.riskFactors.length > 0 && (
                      <div>
                        <h3 className="text-[11px] font-bold text-amber-600 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                          <ShieldAlertIcon className="w-3 h-3" />
                          Risk Factors
                        </h3>
                        <ul className="space-y-2">
                          {insights.assessmentStats.latest.riskFactors.map(
                            (factor, idx) => (
                              <li
                                key={idx}
                                className="flex items-start gap-2 text-xs text-foreground leading-relaxed"
                              >
                                <ShieldAlertIcon className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                                {factor}
                              </li>
                            ),
                          )}
                        </ul>
                      </div>
                    )}

                    {insights.assessmentStats.latest.recommendations.length >
                      0 && (
                      <div>
                        <h3 className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                          <CheckCircle2Icon className="w-3 h-3" />
                          Recommendations
                        </h3>
                        <ul className="space-y-2">
                          {insights.assessmentStats.latest.recommendations.map(
                            (rec, idx) => (
                              <li
                                key={idx}
                                className="flex items-start gap-2 text-xs text-foreground leading-relaxed"
                              >
                                <CheckCircle2Icon className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                {rec}
                              </li>
                            ),
                          )}
                        </ul>
                      </div>
                    )}

                    {insights.assessmentStats.latest.warningSigns.length >
                      0 && (
                      <div>
                        <h3 className="text-[11px] font-bold text-rose-600 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                          <AlertTriangleIcon className="w-3 h-3" />
                          Warning Signs
                        </h3>
                        <ul className="space-y-2">
                          {insights.assessmentStats.latest.warningSigns.map(
                            (sign, idx) => (
                              <li
                                key={idx}
                                className="flex items-start gap-2 text-xs text-foreground leading-relaxed"
                              >
                                <AlertTriangleIcon className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                                {sign}
                              </li>
                            ),
                          )}
                        </ul>
                      </div>
                    )}

                    {insights.assessmentStats.latest.nextStep && (
                      <div className="p-3.5 rounded-xl border border-primary/20 bg-primary/5">
                        <h3 className="text-[11px] font-bold text-primary mb-1.5 flex items-center gap-1.5">
                          <ArrowRightIcon className="w-3 h-3" />
                          Recommended Next Step
                        </h3>
                        <p className="text-xs text-foreground leading-relaxed">
                          {insights.assessmentStats.latest.nextStep}
                        </p>
                      </div>
                    )}

                    {insights.assessmentStats.latest.riskFactors.length === 0 &&
                      insights.assessmentStats.latest.recommendations.length ===
                        0 &&
                      insights.assessmentStats.latest.warningSigns.length ===
                        0 && (
                        <p className="text-xs text-muted-foreground">
                          No specific risk factors or recommendations noted.
                        </p>
                      )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Nova Activity */}
            <Card className="border-border/50 bg-gradient-to-br from-primary/5 via-card to-card shadow-sm">
              <CardHeader className="px-6 pt-6 pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-primary/10">
                    <BotIcon className="w-4 h-4 text-primary" />
                  </div>
                  <CardTitle className="text-base font-bold">
                    Nova Activity
                  </CardTitle>
                </div>
                <CardDescription className="mt-1">
                  Your interactions with Nova, the SmileSync AI dental
                  assistant.
                </CardDescription>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                {insights.novaStats.conversationCount === 0 ? (
                  <div className="text-center py-8 border border-dashed border-border/50 rounded-2xl bg-muted/5">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <BotIcon className="w-6 h-6 text-primary/50" />
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                      No Conversations Yet
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 mb-4">
                      Start a conversation with Nova to get AI-powered dental
                      health guidance.
                    </p>
                    <Link href="/nova">
                      <Button size="sm" className="gap-1.5">
                        Chat with Nova
                        <ArrowRightIcon className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <MetricRow
                      icon={<BotIcon className="w-4 h-4 text-primary" />}
                      iconBg="bg-primary/10"
                      label="Conversations"
                      value={insights.novaStats.conversationCount}
                    />
                    <MetricRow
                      icon={
                        <MessageSquareIcon className="w-4 h-4 text-primary" />
                      }
                      iconBg="bg-primary/10"
                      label="Messages"
                      value={insights.novaStats.messageCount}
                    />
                    <div className="pt-2">
                      <Link href="/nova">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full gap-2 justify-between h-8 text-xs"
                        >
                          Continue with Nova
                          <ArrowRightIcon className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════
            SECTION 8 — AI HEALTH SUMMARY
        ═══════════════════════════════════════════════ */}
        <section aria-label="AI Health Summary">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card shadow-sm ring-1 ring-primary/10">
            <CardHeader className="px-6 pt-6 pb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-primary/15 ring-1 ring-primary/20">
                  <SparklesIcon className="w-4 h-4 text-primary" />
                </div>
                <CardTitle className="text-lg font-bold">
                  AI Health Summary
                </CardTitle>
                <Badge className="ml-auto bg-primary/10 text-primary border-primary/20 text-[10px] font-semibold">
                  Gemini AI
                </Badge>
              </div>
              <CardDescription className="mt-1">
                Educational narrative based on your SmileSync activity.
                Generated separately so this dashboard remains usable if AI is
                unavailable.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6 space-y-3">
              {aiLoading ? (
                <div className="space-y-2.5 py-2">
                  <div className="h-4 bg-muted/40 animate-pulse rounded w-full" />
                  <div className="h-4 bg-muted/40 animate-pulse rounded w-11/12" />
                  <div className="h-4 bg-muted/40 animate-pulse rounded w-4/5" />
                  <div className="h-4 bg-muted/40 animate-pulse rounded w-2/3" />
                  <div className="h-4 bg-muted/40 animate-pulse rounded w-1/2" />
                </div>
              ) : aiSummary ? (
                <div className="p-5 rounded-2xl border border-border/50 bg-background/60 backdrop-blur-sm">
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                    {aiSummary}
                  </p>
                </div>
              ) : (
                <div className="p-6 border border-dashed border-border/50 rounded-2xl bg-background/40 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-muted/30 flex items-center justify-center mx-auto">
                    <BotIcon className="w-5 h-5 text-muted-foreground/60" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">
                    Summary Unavailable
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed max-w-md mx-auto">
                    {aiError ||
                      "The AI Health Summary could not be generated right now. Your charts and metrics above are still accurate."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* ═══════════════════════════════════════════════
            FOOTER — EDUCATIONAL DISCLAIMER
        ═══════════════════════════════════════════════ */}
        <div className="p-4 rounded-2xl border border-border/30 bg-muted/10">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-muted/30 flex items-center justify-center shrink-0 mt-0.5">
              <InfoIcon className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
                Educational Disclaimer
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                The information displayed on this dashboard is for educational
                and informational purposes only. It is not intended as medical
                advice, diagnosis, or treatment. Always consult a qualified
                dental professional for clinical decisions about your oral
                health.
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
