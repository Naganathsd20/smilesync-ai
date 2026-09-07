"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  HistoryIcon,
  CalendarIcon,
  ChevronRightIcon,
  ShieldCheckIcon,
  AlertTriangleIcon,
  AlertCircleIcon,
  SparklesIcon,
} from "lucide-react";
import AssessmentResult from "./AssessmentResult";

export interface HistoricalAssessment {
  id: string;
  userId: string;
  answers: any;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | string;
  riskScore: number;
  riskFactors: string[];
  recommendations: string[];
  warningSigns: string[];
  nextStep: string;
  disclaimer: string;
  createdAt: string;
  updatedAt?: string;
}

interface AssessmentHistoryProps {
  assessments: HistoricalAssessment[];
}

export default function AssessmentHistory({ assessments = [] }: AssessmentHistoryProps) {
  const [selectedAssessment, setSelectedAssessment] = useState<HistoricalAssessment | null>(null);

  if (selectedAssessment) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center max-w-4xl mx-auto">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setSelectedAssessment(null)}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to Assessment History
          </Button>
          <span className="text-xs text-muted-foreground">
            Assessment Date: {format(new Date(selectedAssessment.createdAt), "MMMM d, yyyy · h:mm a")}
          </span>
        </div>

        <AssessmentResult
          result={selectedAssessment}
          onReset={() => setSelectedAssessment(null)}
        />
      </div>
    );
  }

  const getBadgeVariant = (level: string) => {
    switch (level.toUpperCase()) {
      case "LOW":
        return "default" as const;
      case "MEDIUM":
        return "secondary" as const;
      case "HIGH":
        return "destructive" as const;
      default:
        return "outline" as const;
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level.toUpperCase()) {
      case "LOW":
        return <ShieldCheckIcon className="w-4 h-4 text-emerald-500" />;
      case "MEDIUM":
        return <AlertTriangleIcon className="w-4 h-4 text-amber-500" />;
      case "HIGH":
        return <AlertCircleIcon className="w-4 h-4 text-destructive" />;
      default:
        return <SparklesIcon className="w-4 h-4 text-primary" />;
    }
  };

  return (
    <Card className="border border-border/80 bg-card/90 backdrop-blur-sm shadow-md mt-10">
      <CardHeader>
        <div className="flex items-center gap-2">
          <HistoryIcon className="w-5 h-5 text-primary" />
          <CardTitle className="text-xl font-bold">Assessment History</CardTitle>
        </div>
        <CardDescription>
          View your past educational oral health risk assessments stored in your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {assessments.length === 0 ? (
          <div className="text-center py-8 px-4 border border-dashed border-border rounded-xl bg-muted/20">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 text-primary">
              <HistoryIcon className="w-6 h-6" />
            </div>
            <p className="font-semibold text-foreground text-sm">No previous assessments yet</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              Complete the questionnaire above to record your first AI oral health risk assessment.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {assessments.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-border/60 bg-muted/20 hover:bg-muted/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={getBadgeVariant(item.riskLevel)} className="text-xs font-bold uppercase">
                      {item.riskLevel} RISK
                    </Badge>
                    <span className="text-xs font-semibold text-foreground">
                      Score: {item.riskScore}/100
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <CalendarIcon className="w-3.5 h-3.5" />
                      {format(new Date(item.createdAt), "MMM d, yyyy · h:mm a")}
                    </span>
                  </div>

                  <p className="text-xs md:text-sm text-muted-foreground line-clamp-1">
                    {item.nextStep || "Routine oral health assessment"}
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedAssessment(item)}
                  className="rounded-xl text-xs font-medium shrink-0"
                >
                  {getLevelIcon(item.riskLevel)}
                  <span className="ml-1.5">View Details</span>
                  <ChevronRightIcon className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
