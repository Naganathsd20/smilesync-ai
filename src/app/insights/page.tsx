"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { getDentalHealthInsights, getInsightsAiHealthSummary } from "@/lib/actions/insights";
import RiskScoreTrendChart from "@/components/insights/RiskScoreTrendChart";
import AppointmentActivityChart from "@/components/insights/AppointmentActivityChart";
import ReminderProgressChart from "@/components/insights/ReminderProgressChart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

export default function InsightsPage() {
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(true);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await getDentalHealthInsights();
        if (res.success && res.data) {
          setInsights(res.data);
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

    async function loadAiSummary() {
      try {
        setAiLoading(true);
        setAiError(null);
        const res = await getInsightsAiHealthSummary();
        if (res.success && res.summary) {
          setAiSummary(res.summary);
        } else {
          setAiError(res.error || "AI Health Summary is currently unavailable.");
        }
      } catch (err) {
        console.error(err);
        setAiError("Failed to generate AI Health Summary. Your dashboard metrics are still available.");
      } finally {
        setAiLoading(false);
      }
    }

    loadData();
    loadAiSummary();
  }, []);

  const getRiskBadge = (level?: "LOW" | "MEDIUM" | "HIGH") => {
    if (!level) return <Badge variant="secondary">N/A</Badge>;
    switch (level) {
      case "LOW":
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Low Risk</Badge>;
      case "MEDIUM":
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">Medium Risk</Badge>;
      case "HIGH":
        return <Badge className="bg-rose-500/10 text-rose-600 border-rose-500/20">High Risk</Badge>;
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score <= 33) return "text-emerald-500";
    if (score <= 66) return "text-amber-500";
    return "text-rose-500";
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const reminderCompletionRate =
    insights && insights.reminderStats.totalCount > 0
      ? Math.round((insights.reminderStats.completedCount / insights.reminderStats.totalCount) * 100)
      : null;

  return (
    <>
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-8 pt-24 space-y-8 overflow-x-hidden">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                <TrendingUpIcon className="w-6 h-6" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Dental Health Insights
              </h1>
            </div>
            <p className="text-muted-foreground text-sm max-w-2xl pt-1">
              A comprehensive summary of your SmileSync oral health activity, risk profile history, care habits, and appointments.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-6 py-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="h-28 bg-muted/30 animate-pulse rounded-xl" />
              <div className="h-28 bg-muted/30 animate-pulse rounded-xl" />
              <div className="h-28 bg-muted/30 animate-pulse rounded-xl" />
              <div className="h-28 bg-muted/30 animate-pulse rounded-xl" />
            </div>
            <div className="h-48 bg-muted/30 animate-pulse rounded-xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-48 bg-muted/30 animate-pulse rounded-xl" />
              <div className="h-48 bg-muted/30 animate-pulse rounded-xl" />
            </div>
            <div className="h-56 bg-muted/30 animate-pulse rounded-xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-56 bg-muted/30 animate-pulse rounded-xl" />
              <div className="h-56 bg-muted/30 animate-pulse rounded-xl" />
            </div>
          </div>
        ) : !insights ? (
          <Card className="border-border">
            <CardContent className="p-8 text-center">
              <InfoIcon className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-base font-semibold text-foreground">No Insights Available</p>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                We could not aggregate your health insights. Please try refreshing the page.
              </p>
              <Button onClick={() => window.location.reload()}>Reload Page</Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* =====================================================
                SECTION 1: HEALTH OVERVIEW
            ===================================================== */}
            <div>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                <ShieldAlertIcon className="w-4 h-4" />
                Health Overview
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Current Risk Score */}
                <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card">
                  <CardHeader className="pb-2">
                    <CardDescription className="text-xs flex items-center justify-between">
                      <span>Current Risk Score</span>
                      <ShieldAlertIcon className="w-4 h-4 text-primary" />
                    </CardDescription>
                    <CardTitle className="text-2xl font-bold flex items-center gap-2 pt-1">
                      {insights.assessmentStats.latest ? (
                        <>
                          <span className={getRiskScoreColor(insights.assessmentStats.latest.riskScore)}>
                            {insights.assessmentStats.latest.riskScore}
                          </span>
                          <span className="text-xs text-muted-foreground font-normal">/ 100</span>
                        </>
                      ) : (
                        <span className="text-base text-muted-foreground font-medium">No Data</span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="mt-1 flex items-center gap-2 flex-wrap">
                      {insights.assessmentStats.latest ? (
                        <>
                          {getRiskBadge(insights.assessmentStats.latest.riskLevel)}
                          {/* Risk Score Change */}
                          {insights.assessmentStats.riskScoreChange !== null ? (
                            <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${
                              insights.assessmentStats.riskScoreChange > 0
                                ? "text-rose-500"
                                : insights.assessmentStats.riskScoreChange < 0
                                  ? "text-emerald-500"
                                  : "text-muted-foreground"
                            }`}>
                              {insights.assessmentStats.riskScoreChange > 0 ? (
                                <TrendingUpIcon className="w-3 h-3" />
                              ) : insights.assessmentStats.riskScoreChange < 0 ? (
                                <TrendingDownIcon className="w-3 h-3" />
                              ) : (
                                <MinusIcon className="w-3 h-3" />
                              )}
                              {insights.assessmentStats.riskScoreChange > 0 ? "+" : ""}
                              {insights.assessmentStats.riskScoreChange}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">No previous assessment</span>
                          )}
                        </>
                      ) : (
                        <Link href="/assessment">
                          <Button variant="link" className="p-0 text-xs text-primary h-auto">
                            Take Assessment &rarr;
                          </Button>
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Total Assessments */}
                <Card className="border-border bg-card">
                  <CardHeader className="pb-2">
                    <CardDescription className="text-xs flex items-center justify-between">
                      <span>Total Assessments</span>
                      <ActivityIcon className="w-4 h-4 text-emerald-500" />
                    </CardDescription>
                    <CardTitle className="text-2xl font-bold pt-1">
                      {insights.assessmentStats.totalCount}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-xs text-muted-foreground">
                      {insights.assessmentStats.latest
                        ? `Latest: ${formatDate(insights.assessmentStats.latest.createdAt)}`
                        : "No assessments completed yet"}
                    </p>
                  </CardContent>
                </Card>

                {/* Upcoming Confirmed Appointments */}
                <Card className="border-border bg-card">
                  <CardHeader className="pb-2">
                    <CardDescription className="text-xs flex items-center justify-between">
                      <span>Upcoming Confirmed</span>
                      <CalendarIcon className="w-4 h-4 text-blue-500" />
                    </CardDescription>
                    <CardTitle className="text-2xl font-bold pt-1">
                      {insights.appointmentStats.upcomingCount}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-xs text-muted-foreground">
                      {insights.appointmentStats.upcomingCount > 0
                        ? "Confirmed appointments ahead"
                        : "No upcoming appointments"}
                    </p>
                  </CardContent>
                </Card>

                {/* Pending Reminders */}
                <Card className="border-border bg-card">
                  <CardHeader className="pb-2">
                    <CardDescription className="text-xs flex items-center justify-between">
                      <span>Pending Reminders</span>
                      <BellIcon className="w-4 h-4 text-amber-500" />
                    </CardDescription>
                    <CardTitle className="text-2xl font-bold pt-1">
                      {insights.reminderStats.pendingCount}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-xs text-muted-foreground">
                      {insights.reminderStats.totalCount > 0
                        ? `${insights.reminderStats.completedCount} completed of ${insights.reminderStats.totalCount} total`
                        : "No reminders set yet"}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* =====================================================
                SECTION 1B: RISK SCORE TREND
            ===================================================== */}
            <Card className="border-border overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <TrendingUpIcon className="w-5 h-5 text-primary" />
                  Risk Score Trend
                </CardTitle>
                <CardDescription>
                  Educational risk score by assessment date, oldest to newest. Scores are shown as recorded — this is not a clinical diagnosis.
                </CardDescription>
              </CardHeader>
              <CardContent className="min-w-0">
                <RiskScoreTrendChart history={insights.assessmentStats.history} />
              </CardContent>
            </Card>

            {/* =====================================================
                SECTION 2: APPOINTMENT & REMINDER METRICS
            ===================================================== */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Appointment Metrics */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <CalendarCheckIcon className="w-5 h-5 text-blue-500" />
                    Appointment Metrics
                  </CardTitle>
                  <CardDescription>
                    Overview of your dental appointments.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {insights.appointmentStats.totalCount === 0 ? (
                    <div className="text-center py-6 border border-dashed rounded-xl bg-muted/10">
                      <CalendarIcon className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-foreground">No Appointments</p>
                      <p className="text-xs text-muted-foreground mt-1 mb-3">
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
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-muted/20">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <CalendarIcon className="w-4 h-4 text-blue-500" />
                          </div>
                          <span className="text-sm font-medium text-foreground">Upcoming Confirmed</span>
                        </div>
                        <span className="text-lg font-bold text-foreground">{insights.appointmentStats.upcomingCount}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-muted/20">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                            <CheckCircle2Icon className="w-4 h-4 text-emerald-500" />
                          </div>
                          <span className="text-sm font-medium text-foreground">Completed</span>
                        </div>
                        <span className="text-lg font-bold text-foreground">{insights.appointmentStats.completedCount}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-muted/20">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <ClipboardListIcon className="w-4 h-4 text-primary" />
                          </div>
                          <span className="text-sm font-medium text-foreground">Total Appointments</span>
                        </div>
                        <span className="text-lg font-bold text-foreground">{insights.appointmentStats.totalCount}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Smart Reminder Metrics */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <BellIcon className="w-5 h-5 text-amber-500" />
                    Smart Reminder Metrics
                  </CardTitle>
                  <CardDescription>
                    Your reminder tracking and completion rates.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {insights.reminderStats.totalCount === 0 ? (
                    <div className="text-center py-6 border border-dashed rounded-xl bg-muted/10">
                      <BellIcon className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-foreground">No Reminders</p>
                      <p className="text-xs text-muted-foreground mt-1 mb-3">
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
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-muted/20">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center">
                            <ClockIcon className="w-4 h-4 text-amber-500" />
                          </div>
                          <span className="text-sm font-medium text-foreground">Pending</span>
                        </div>
                        <span className="text-lg font-bold text-foreground">{insights.reminderStats.pendingCount}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-muted/20">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                            <CheckCircle2Icon className="w-4 h-4 text-emerald-500" />
                          </div>
                          <span className="text-sm font-medium text-foreground">Completed</span>
                        </div>
                        <span className="text-lg font-bold text-foreground">{insights.reminderStats.completedCount}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-muted/20">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <ClipboardListIcon className="w-4 h-4 text-primary" />
                          </div>
                          <span className="text-sm font-medium text-foreground">Total Reminders</span>
                        </div>
                        <span className="text-lg font-bold text-foreground">{insights.reminderStats.totalCount}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg border border-primary/20 bg-primary/5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <PercentIcon className="w-4 h-4 text-primary" />
                          </div>
                          <span className="text-sm font-medium text-foreground">Completion Rate</span>
                        </div>
                        <span className="text-lg font-bold text-primary">{reminderCompletionRate}%</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* =====================================================
                SECTION 2B: ACTIVITY VISUALIZATIONS
            ===================================================== */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-w-0">
              <Card className="border-border overflow-hidden min-w-0">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <CalendarCheckIcon className="w-5 h-5 text-blue-500" />
                    Appointment Activity
                  </CardTitle>
                  <CardDescription>
                    Upcoming confirmed, completed, and total appointments from your account.
                  </CardDescription>
                </CardHeader>
                <CardContent className="min-w-0">
                  <AppointmentActivityChart
                    upcomingCount={insights.appointmentStats.upcomingCount}
                    completedCount={insights.appointmentStats.completedCount}
                    totalCount={insights.appointmentStats.totalCount}
                  />
                </CardContent>
              </Card>

              <Card className="border-border overflow-hidden min-w-0">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <BellIcon className="w-5 h-5 text-amber-500" />
                    Reminder Progress
                  </CardTitle>
                  <CardDescription>
                    Completed versus pending reminders from your real reminder list.
                  </CardDescription>
                </CardHeader>
                <CardContent className="min-w-0">
                  <ReminderProgressChart
                    pendingCount={insights.reminderStats.pendingCount}
                    completedCount={insights.reminderStats.completedCount}
                    totalCount={insights.reminderStats.totalCount}
                  />
                </CardContent>
              </Card>
            </div>

            {/* =====================================================
                SECTION 3: ASSESSMENT HISTORY
            ===================================================== */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <TrendingUpIcon className="w-5 h-5 text-primary" />
                  Assessment History
                </CardTitle>
                <CardDescription>
                  Historical risk evaluations from your completed oral health assessments, newest first.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {insights.assessmentStats.history.length === 0 ? (
                  <div className="text-center py-8 border border-dashed rounded-xl bg-muted/10">
                    <ActivityIcon className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-foreground">No Assessment History</p>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 mb-3">
                      Complete your first AI Oral Health Assessment to start tracking your health trends over time.
                    </p>
                    <Link href="/assessment">
                      <Button size="sm" className="gap-1.5">
                        Start Assessment
                        <ArrowRightIcon className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {insights.assessmentStats.history.map((item, index) => (
                      <div
                        key={item.id}
                        className={`flex items-center justify-between p-3.5 rounded-lg border bg-muted/20 ${
                          index === 0 ? "border-primary/30 bg-primary/5" : "border-border/60"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                            index === 0
                              ? "bg-primary/10 text-primary"
                              : "bg-muted/40 text-muted-foreground"
                          }`}>
                            #{insights.assessmentStats.history.length - index}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                              {index === 0 && (
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-medium border-primary/30 text-primary">
                                  Latest
                                </Badge>
                              )}
                              {formatDate(item.createdAt)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Risk Score: <span className={`font-semibold ${getRiskScoreColor(item.riskScore)}`}>{item.riskScore}</span> / 100
                            </p>
                          </div>
                        </div>
                        <div>{getRiskBadge(item.riskLevel)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* =====================================================
                SECTION 4: CARE RECOMMENDATIONS & NOVA ACTIVITY
            ===================================================== */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Care Recommendations */}
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <HeartPulseIcon className="w-5 h-5 text-emerald-500" />
                    Care Recommendations
                  </CardTitle>
                  <CardDescription>
                    Key focus areas from your latest oral health assessment.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!insights.assessmentStats.latest ? (
                    <div className="text-center py-6 border border-dashed rounded-xl bg-muted/10">
                      <HeartPulseIcon className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-foreground">No Assessment Data</p>
                      <p className="text-xs text-muted-foreground mt-1 mb-3">
                        Take an assessment to generate personalized care recommendations.
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
                      {/* Risk Factors */}
                      {insights.assessmentStats.latest.riskFactors.length > 0 && (
                        <div>
                          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                            Risk Factors
                          </h3>
                          <ul className="space-y-1.5">
                            {insights.assessmentStats.latest.riskFactors.map((factor, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-xs text-foreground">
                                <ShieldAlertIcon className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                                <span>{factor}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Recommendations */}
                      {insights.assessmentStats.latest.recommendations.length > 0 && (
                        <div>
                          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                            Recommendations
                          </h3>
                          <ul className="space-y-1.5">
                            {insights.assessmentStats.latest.recommendations.map((rec, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-xs text-foreground">
                                <CheckCircle2Icon className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Warning Signs */}
                      {insights.assessmentStats.latest.warningSigns.length > 0 && (
                        <div>
                          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                            Warning Signs
                          </h3>
                          <ul className="space-y-1.5">
                            {insights.assessmentStats.latest.warningSigns.map((sign, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-xs text-foreground">
                                <AlertTriangleIcon className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                                <span>{sign}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Next Step */}
                      {insights.assessmentStats.latest.nextStep && (
                        <div className="p-3 rounded-lg border border-primary/20 bg-primary/5">
                          <h3 className="text-xs font-semibold text-primary mb-1 flex items-center gap-1.5">
                            <ArrowRightIcon className="w-3.5 h-3.5" />
                            Recommended Next Step
                          </h3>
                          <p className="text-xs text-foreground">{insights.assessmentStats.latest.nextStep}</p>
                        </div>
                      )}

                      {/* No risk factors or recommendations */}
                      {insights.assessmentStats.latest.riskFactors.length === 0 &&
                        insights.assessmentStats.latest.recommendations.length === 0 &&
                        insights.assessmentStats.latest.warningSigns.length === 0 && (
                          <p className="text-xs text-muted-foreground">No specific risk factors or recommendations noted.</p>
                        )}
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Nova Activity */}
              <Card className="border-border bg-gradient-to-br from-card via-card to-primary/5">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <BotIcon className="w-5 h-5 text-primary" />
                    Nova Activity
                  </CardTitle>
                  <CardDescription>
                    Your interactions with Nova, the SmileSync AI dental assistant.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {insights.novaStats.conversationCount === 0 ? (
                    <div className="text-center py-6 border border-dashed rounded-xl bg-muted/10">
                      <BotIcon className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-foreground">No Conversations Yet</p>
                      <p className="text-xs text-muted-foreground mt-1 mb-3">
                        Start a conversation with Nova to get AI-powered dental health guidance.
                      </p>
                      <Link href="/nova">
                        <Button size="sm" className="gap-1.5">
                          Chat with Nova
                          <ArrowRightIcon className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-muted/20">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <BotIcon className="w-4 h-4 text-primary" />
                          </div>
                          <span className="text-sm font-medium text-foreground">Conversations</span>
                        </div>
                        <span className="text-lg font-bold text-foreground">{insights.novaStats.conversationCount}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-muted/20">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <MessageSquareIcon className="w-4 h-4 text-primary" />
                          </div>
                          <span className="text-sm font-medium text-foreground">Messages</span>
                        </div>
                        <span className="text-lg font-bold text-foreground">{insights.novaStats.messageCount}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* =====================================================
                SECTION 5: AI HEALTH SUMMARY
            ===================================================== */}
            <Card className="border-border bg-gradient-to-br from-card via-card to-primary/5">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <SparklesIcon className="w-5 h-5 text-primary" />
                  AI Health Summary
                </CardTitle>
                <CardDescription>
                  Educational narrative based on your SmileSync activity. Generated separately so this dashboard still loads if the AI service is slow or unavailable.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {aiLoading ? (
                  <div className="space-y-2 py-2">
                    <div className="h-4 bg-muted/40 animate-pulse rounded w-full" />
                    <div className="h-4 bg-muted/40 animate-pulse rounded w-11/12" />
                    <div className="h-4 bg-muted/40 animate-pulse rounded w-4/5" />
                    <div className="h-4 bg-muted/40 animate-pulse rounded w-2/3" />
                  </div>
                ) : aiSummary ? (
                  <div className="p-4 rounded-xl border border-border/60 bg-background/50">
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                      {aiSummary}
                    </p>
                  </div>
                ) : (
                  <div className="p-5 border border-dashed rounded-xl bg-background/50 text-center space-y-2">
                    <BotIcon className="w-8 h-8 text-primary mx-auto opacity-70" />
                    <p className="text-sm font-semibold text-foreground">
                      Summary Unavailable
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed max-w-md mx-auto">
                      {aiError || "The AI Health Summary could not be generated right now. Your charts and metrics above are still accurate."}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Medical/Educational Disclaimer */}
            <div className="p-4 rounded-xl border border-border/40 bg-muted/10">
              <div className="flex items-start gap-2.5">
                <InfoIcon className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">Educational Disclaimer</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    The information displayed on this dashboard is for educational and informational purposes only. It is not intended as medical advice, diagnosis, or treatment. Always consult a qualified dental professional for clinical decisions about your oral health.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </>
  );
}
