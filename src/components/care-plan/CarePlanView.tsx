"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  SparklesIcon,
  ShieldAlertIcon,
  SunIcon,
  MoonIcon,
  CoffeeIcon,
  CheckCircle2Icon,
  AlertCircleIcon,
  PrinterIcon,
  BotIcon,
  ArrowRightIcon,
  CalendarIcon,
  HeartPulseIcon,
  CheckSquareIcon,
  TargetIcon,
  ActivityIcon,
  RefreshCwIcon,
} from "lucide-react";
import { getPersonalizedCarePlan, CarePlanOutput } from "@/lib/actions/care-plan";
import Link from "next/link";
import { toast } from "sonner";

export default function CarePlanView() {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hasAssessment, setHasAssessment] = useState<boolean>(true);
  const [carePlan, setCarePlan] = useState<CarePlanOutput | null>(null);
  const [assessmentDate, setAssessmentDate] = useState<string | null>(null);

  // Interactive UI-only checklist state
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});

  const fetchCarePlan = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getPersonalizedCarePlan();
      if (!res.success) {
        setError(res.error || "Failed to load care plan.");
        toast.error(res.error || "Failed to load care plan.");
      } else {
        setHasAssessment(res.hasAssessment);
        setCarePlan(res.carePlan);
        if (res.assessmentDate) {
          setAssessmentDate(res.assessmentDate);
        }
      }
    } catch (err: any) {
      const msg = err?.message || "An unexpected error occurred.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarePlan();
  }, []);

  const toggleCheckItem = (id: string) => {
    setCompletedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-16 flex flex-col items-center justify-center space-y-4">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <SparklesIcon className="w-5 h-5 text-primary absolute inset-0 m-auto animate-pulse" />
        </div>
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          Analyzing your assessment & generating your personalized AI dental care plan...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="pt-6 text-center space-y-4">
            <AlertCircleIcon className="w-10 h-10 text-destructive mx-auto" />
            <div className="space-y-1">
              <h3 className="font-bold text-lg text-foreground">Unable to Load Care Plan</h3>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
            <Button onClick={fetchCarePlan} variant="outline" className="rounded-xl">
              <RefreshCwIcon className="w-4 h-4 mr-2" /> Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hasAssessment || !carePlan) {
    return (
      <div className="max-w-3xl mx-auto py-12">
        <Card className="border border-border/80 bg-card/95 backdrop-blur-md shadow-xl overflow-hidden text-center p-8 space-y-6">
          <div className="size-16 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto">
            <HeartPulseIcon className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-lg mx-auto">
            <h2 className="text-2xl font-extrabold text-foreground">Oral Health Assessment Required</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              To generate your personalized AI Dental Care Plan, you first need to complete our quick 2-minute Oral Health Assessment questionnaire.
            </p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/assessment">
              <Button size="lg" className="rounded-xl font-semibold bg-primary hover:bg-primary/90 text-white shadow-lg w-full sm:w-auto">
                <SparklesIcon className="w-4 h-4 mr-2" /> Start Oral Health Assessment
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const getRiskBadgeColor = (level: string) => {
    switch (level) {
      case "LOW":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
      case "MEDIUM":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30";
      case "HIGH":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 print:p-0 print:space-y-4">
      {/* MEDICAL DISCLAIMER */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3 text-amber-700 dark:text-amber-300 text-xs md:text-sm print:hidden">
        <ShieldAlertIcon className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold block mb-0.5">Educational Care Plan Disclaimer</span>
          This AI-generated care plan is based on your self-reported oral health assessment for educational guidance only. It is <strong>NOT</strong> a clinical diagnosis or dental prescription. Always consult a qualified dental professional for personal clinical evaluations.
        </div>
      </div>

      {/* HEADER BAR ACTIONS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/60 pb-6 print:hidden">
        <div>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs font-semibold px-2.5 py-0.5 mb-2">
            <SparklesIcon className="w-3 h-3 mr-1" /> AI Generated Care Plan
          </Badge>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Personalized Dental Care Plan</h1>
          {assessmentDate && (
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5" />
              Generated from assessment on {new Date(assessmentDate).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handlePrint} className="rounded-xl text-xs font-medium">
            <PrinterIcon className="w-4 h-4 mr-1.5" /> Export / Print Plan
          </Button>
          <Link href="/nova">
            <Button className="rounded-xl text-xs font-semibold bg-gradient-to-r from-primary to-cyan-600 hover:from-primary/90 hover:to-cyan-700 text-white shadow-md">
              <BotIcon className="w-4 h-4 mr-1.5" /> Ask Nova About This Plan
            </Button>
          </Link>
        </div>
      </div>

      {/* EXECUTIVE SUMMARY & RISK OVERVIEW CARD */}
      <Card className="border border-border/80 bg-card/95 backdrop-blur-md shadow-lg overflow-hidden">
        <CardHeader className="bg-muted/30 border-b border-border/50">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div className="space-y-1">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <ActivityIcon className="w-5 h-5 text-primary" /> Executive Oral Health Profile
              </CardTitle>
              <CardDescription>Tailored summary based on your risk indicators</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs text-muted-foreground font-medium">Risk Score</div>
                <div className="text-2xl font-extrabold text-foreground">{carePlan.riskScore}<span className="text-xs font-normal text-muted-foreground">/100</span></div>
              </div>
              <Badge variant="outline" className={`text-xs font-bold px-3 py-1 border ${getRiskBadgeColor(carePlan.riskLevel)}`}>
                {carePlan.riskLevel} RISK
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <p className="text-sm md:text-base text-foreground/90 leading-relaxed font-normal">
            {carePlan.summary}
          </p>
          <div className="pt-2">
            <div className="flex justify-between text-xs text-muted-foreground mb-1 font-medium">
              <span>Low Risk (0-33)</span>
              <span>Medium Risk (34-66)</span>
              <span>High Risk (67-100)</span>
            </div>
            <Progress value={carePlan.riskScore} className="h-2.5 rounded-full" />
          </div>
        </CardContent>
      </Card>

      {/* PRIORITY GOALS */}
      <Card className="border border-border/80 bg-card/95 backdrop-blur-md shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <TargetIcon className="w-5 h-5 text-primary" /> Key Health Goals
          </CardTitle>
          <CardDescription>Targeted milestone objectives for your oral care journey</CardDescription>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-3">
          {carePlan.priorityGoals.map((goal, idx) => (
            <div key={idx} className="p-3.5 rounded-xl border border-border/60 bg-muted/20 flex items-start gap-3">
              <div className="size-6 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </div>
              <span className="text-sm font-medium text-foreground">{goal}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* DAILY ROUTINES (MORNING, AFTERNOON, EVENING) */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
          <CheckSquareIcon className="w-5 h-5 text-primary" /> Your Customized Daily Oral Care Routine
        </h3>

        <div className="grid md:grid-cols-3 gap-6">
          {/* MORNING ROUTINE */}
          <Card className="border border-border/80 bg-card shadow-md flex flex-col justify-between">
            <div>
              <CardHeader className="bg-amber-500/10 border-b border-amber-500/20 py-3.5">
                <CardTitle className="text-base font-bold text-amber-700 dark:text-amber-300 flex items-center gap-2">
                  <SunIcon className="w-5 h-5 text-amber-500" /> Morning Routine
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {carePlan.morningRoutine.map((item, idx) => {
                  const itemId = `morning-${idx}`;
                  const isChecked = !!completedItems[itemId];
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleCheckItem(itemId)}
                      className={`w-full p-3 rounded-xl border text-left text-xs md:text-sm transition-all flex items-start gap-3 ${
                        isChecked
                          ? "border-emerald-500/40 bg-emerald-500/10 text-muted-foreground line-through"
                          : "border-border/60 bg-background hover:bg-muted/30 text-foreground"
                      }`}
                    >
                      <div className={`size-4 rounded border flex items-center justify-center shrink-0 mt-0.5 ${isChecked ? "bg-emerald-500 border-emerald-500 text-white" : "border-muted-foreground/40"}`}>
                        {isChecked && <CheckCircle2Icon className="w-3 h-3" />}
                      </div>
                      <span>{item}</span>
                    </button>
                  );
                })}
              </CardContent>
            </div>
          </Card>

          {/* AFTERNOON ROUTINE */}
          <Card className="border border-border/80 bg-card shadow-md flex flex-col justify-between">
            <div>
              <CardHeader className="bg-sky-500/10 border-b border-sky-500/20 py-3.5">
                <CardTitle className="text-base font-bold text-sky-700 dark:text-sky-300 flex items-center gap-2">
                  <CoffeeIcon className="w-5 h-5 text-sky-500" /> Midday / Post-Meal
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {carePlan.afternoonRoutine.map((item, idx) => {
                  const itemId = `afternoon-${idx}`;
                  const isChecked = !!completedItems[itemId];
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleCheckItem(itemId)}
                      className={`w-full p-3 rounded-xl border text-left text-xs md:text-sm transition-all flex items-start gap-3 ${
                        isChecked
                          ? "border-emerald-500/40 bg-emerald-500/10 text-muted-foreground line-through"
                          : "border-border/60 bg-background hover:bg-muted/30 text-foreground"
                      }`}
                    >
                      <div className={`size-4 rounded border flex items-center justify-center shrink-0 mt-0.5 ${isChecked ? "bg-emerald-500 border-emerald-500 text-white" : "border-muted-foreground/40"}`}>
                        {isChecked && <CheckCircle2Icon className="w-3 h-3" />}
                      </div>
                      <span>{item}</span>
                    </button>
                  );
                })}
              </CardContent>
            </div>
          </Card>

          {/* EVENING ROUTINE */}
          <Card className="border border-border/80 bg-card shadow-md flex flex-col justify-between">
            <div>
              <CardHeader className="bg-indigo-500/10 border-b border-indigo-500/20 py-3.5">
                <CardTitle className="text-base font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                  <MoonIcon className="w-5 h-5 text-indigo-500" /> Evening Routine
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {carePlan.eveningRoutine.map((item, idx) => {
                  const itemId = `evening-${idx}`;
                  const isChecked = !!completedItems[itemId];
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleCheckItem(itemId)}
                      className={`w-full p-3 rounded-xl border text-left text-xs md:text-sm transition-all flex items-start gap-3 ${
                        isChecked
                          ? "border-emerald-500/40 bg-emerald-500/10 text-muted-foreground line-through"
                          : "border-border/60 bg-background hover:bg-muted/30 text-foreground"
                      }`}
                    >
                      <div className={`size-4 rounded border flex items-center justify-center shrink-0 mt-0.5 ${isChecked ? "bg-emerald-500 border-emerald-500 text-white" : "border-muted-foreground/40"}`}>
                        {isChecked && <CheckCircle2Icon className="w-3 h-3" />}
                      </div>
                      <span>{item}</span>
                    </button>
                  );
                })}
              </CardContent>
            </div>
          </Card>
        </div>
      </div>

      {/* TARGETED ACTIONS FOR RISK FACTORS */}
      <Card className="border border-border/80 bg-card shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <HeartPulseIcon className="w-5 h-5 text-primary" /> Targeted Actions for Identified Risk Factors
          </CardTitle>
          <CardDescription>Specific steps to address your individual health context</CardDescription>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4">
          {carePlan.targetedActions.map((item, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-border/60 bg-muted/20 space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[11px] font-semibold">
                  Risk Indicator
                </Badge>
                <span className="font-semibold text-sm text-foreground">{item.riskFactor}</span>
              </div>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed pl-1">
                {item.action}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* WARNING SIGNS & PROFESSIONAL TIMELINE */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* WARNING SIGNS */}
        <Card className="border border-border/80 bg-card shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-rose-600 dark:text-rose-400">
              <AlertCircleIcon className="w-5 h-5 text-rose-500" /> Symptoms & Warning Signs to Monitor
            </CardTitle>
            <CardDescription>Watch out for these indicators warranting a dental checkup</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {carePlan.warningSignsToMonitor.map((sign, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/15 flex items-start gap-2.5 text-xs md:text-sm text-foreground">
                <AlertCircleIcon className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{sign}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* PROFESSIONAL CARE TIMELINE */}
        <Card className="border border-border/80 bg-card shadow-md flex flex-col justify-between">
          <div>
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-primary" /> Professional Dental Visit Timeline
              </CardTitle>
              <CardDescription>Recommended timeline for in-person clinical examinations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 text-foreground text-sm leading-relaxed font-medium">
                {carePlan.professionalCareTimeline}
              </div>
              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                  Lifestyle & Habit Guidance
                </span>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  {carePlan.lifestyleGuidance.map((guide, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2Icon className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                      <span>{guide}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </div>

          <div className="p-4 bg-muted/40 border-t border-border/50 flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Need to discuss this timeline?</span>
            <Link href="/nova">
              <Button size="sm" className="rounded-xl text-xs font-semibold bg-primary hover:bg-primary/90 text-white">
                Chat with Nova <ArrowRightIcon className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* FINAL DISCLAIMER CARD */}
      <div className="p-4 rounded-xl border border-border/60 bg-muted/30 text-center text-xs text-muted-foreground space-y-1">
        <p className="font-semibold text-foreground">{carePlan.disclaimer}</p>
        <p>🔒 SmileSync AI Educational Care Planning • Server-side Protected</p>
      </div>
    </div>
  );
}
