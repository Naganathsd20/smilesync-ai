import { getLatestOralHealthAssessment } from "@/lib/actions/assessment";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ActivityIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  AlertTriangleIcon,
  AlertCircleIcon,
  SparklesIcon,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default async function LatestAssessmentCard() {
  const latest = await getLatestOralHealthAssessment();

  const getBadgeVariant = (level?: string) => {
    switch ((level || "").toUpperCase()) {
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

  const getLevelIcon = (level?: string) => {
    switch ((level || "").toUpperCase()) {
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
    <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/30">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
            <ActivityIcon className="w-5 h-5 text-primary" />
            AI Oral Health Assessment
          </CardTitle>
          {latest && (
            <Badge variant={getBadgeVariant(latest.riskLevel)} className="text-xs font-bold uppercase">
              {latest.riskLevel} RISK
            </Badge>
          )}
        </div>
        <CardDescription className="text-xs">
          Educational AI diagnostic evaluation of your habits and symptoms
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {latest ? (
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground font-medium">Risk Score Indicator</div>
                <div className="text-2xl font-black text-foreground mt-0.5">
                  {latest.riskScore} <span className="text-xs font-normal text-muted-foreground">/ 100</span>
                </div>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                <div>Assessed Date</div>
                <div className="font-semibold text-foreground mt-0.5">
                  {format(new Date(latest.createdAt), "MMM d, yyyy")}
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {latest.nextStep || "Regular oral health maintenance recommended."}
            </p>

            <Button
              asChild
              className="w-full mt-2 rounded-xl font-semibold bg-primary hover:bg-primary/90 text-white shadow-md text-sm"
            >
              <Link href="/assessment">
                {getLevelIcon(latest.riskLevel)}
                <span className="ml-1.5">View Full Assessment</span>
                <ArrowRightIcon className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4 text-center py-2">
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 space-y-1 text-left">
              <div className="font-semibold text-sm text-foreground flex items-center gap-1.5">
                <SparklesIcon className="w-4 h-4 text-primary" /> Evaluate Your Risk Factors
              </div>
              <p className="text-xs text-muted-foreground">
                Take our 2-minute structured questionnaire to receive personalized oral health guidance and risk score.
              </p>
            </div>

            <Button
              asChild
              className="w-full rounded-xl font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-md text-sm"
            >
              <Link href="/assessment">
                Start Free Assessment <ArrowRightIcon className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
