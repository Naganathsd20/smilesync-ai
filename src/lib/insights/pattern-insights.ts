export type InsightPriority = "LOW" | "MEDIUM" | "HIGH";

export type InsightActionHref =
  | "/assessment"
  | "/appointments"
  | "/reminders"
  | "/nova"
  | "/care-plan";

export type PatternInsight = {
  id: string;
  title: string;
  description: string;
  priority: InsightPriority;
  action: {
    label: string;
    href: InsightActionHref;
  };
};

type PatternInput = {
  assessmentStats: {
    latest: {
      riskLevel: InsightPriority;
      riskScore: number;
      riskFactors: string[];
      recommendations: string[];
      warningSigns: string[];
      nextStep: string;
      createdAt: string | Date;
    } | null;
    riskScoreChange: number | null;
    totalCount: number;
  };
  appointmentStats: {
    upcomingCount: number;
    completedCount: number;
    totalCount: number;
  };
  reminderStats: {
    totalCount: number;
    pendingCount: number;
    completedCount: number;
  };
  novaStats: {
    conversationCount: number;
    messageCount: number;
  };
};

const PRIORITY_ORDER: Record<InsightPriority, number> = {
  HIGH: 0,
  MEDIUM: 1,
  LOW: 2,
};

const STALE_ASSESSMENT_DAYS = 90;
const STRONG_COMPLETION_RATE = 0.7;
const MAX_CARDS = 6;

function daysSince(date: string | Date) {
  return Math.floor((Date.now() - new Date(date).getTime()) / 86_400_000);
}

export function buildPatternInsights(data: PatternInput): PatternInsight[] {
  const cards: PatternInsight[] = [];
  const latest = data.assessmentStats.latest;
  const change = data.assessmentStats.riskScoreChange;

  if (!latest) {
    cards.push({
      id: "no-assessment",
      title: "No oral health assessment yet",
      description:
        "Complete an educational assessment to unlock a personalized risk score and care recommendations. This is not a diagnosis.",
      priority: "HIGH",
      action: { label: "Take Assessment", href: "/assessment" },
    });
  } else {
    const ageDays = daysSince(latest.createdAt);
    if (ageDays >= STALE_ASSESSMENT_DAYS) {
      cards.push({
        id: "stale-assessment",
        title: "No recent assessment",
        description: `Your last educational assessment was ${ageDays} days ago. Completing a new one can refresh your SmileSync risk profile. This is not a diagnosis.`,
        priority: "MEDIUM",
        action: { label: "Take Assessment", href: "/assessment" },
      });
    }

    if (change !== null && change > 0) {
      cards.push({
        id: "score-increased",
        title: "Educational risk score increased",
        description: `Your latest educational risk score is ${change} point${change === 1 ? "" : "s"} higher than the previous assessment (${latest.riskScore}/100, ${latest.riskLevel}). Score changes are questionnaire results only, not a medical diagnosis.`,
        priority: latest.riskLevel === "HIGH" || change >= 10 ? "HIGH" : "MEDIUM",
        action: { label: "View Care Plan", href: "/care-plan" },
      });
    } else if (change !== null && change < 0) {
      const drop = Math.abs(change);
      cards.push({
        id: "score-improved",
        title: "Educational risk score decreased",
        description: `Your latest educational risk score is ${drop} point${drop === 1 ? "" : "s"} lower than the previous assessment (${latest.riskScore}/100). This is not proof of clinical improvement.`,
        priority: "LOW",
        action: { label: "View Care Plan", href: "/care-plan" },
      });
    }

    if (latest.riskLevel === "HIGH") {
      cards.push({
        id: "high-risk-level",
        title: "Latest educational risk level is high",
        description:
          "Your most recent assessment recorded a high educational risk level. This is not a diagnosis. Considering a professional dental visit is a reasonable next step.",
        priority: "HIGH",
        action: { label: "View Appointments", href: "/appointments" },
      });
    }

    if (latest.warningSigns.length > 0) {
      cards.push({
        id: "warning-signs",
        title: "Warning signs on your latest assessment",
        description: `Your latest educational assessment noted: ${latest.warningSigns.slice(0, 2).join("; ")}. If these persist or worsen, discuss them with a qualified dentist.`,
        priority: "HIGH",
        action: { label: "View Appointments", href: "/appointments" },
      });
    }

    if (latest.riskFactors.length > 0) {
      cards.push({
        id: "risk-factors",
        title: "Risk factors on your latest assessment",
        description: `Recorded educational risk factors include: ${latest.riskFactors.slice(0, 2).join("; ")}. Review suggested routines in your care plan.`,
        priority: "MEDIUM",
        action: { label: "View Care Plan", href: "/care-plan" },
      });
    }

    if (latest.recommendations.length > 0) {
      cards.push({
        id: "recommendations",
        title: "Recommendations from your latest assessment",
        description: latest.recommendations[0],
        priority: "LOW",
        action: { label: "View Care Plan", href: "/care-plan" },
      });
    }
  }

  const { pendingCount, completedCount, totalCount } = data.reminderStats;
  if (pendingCount > 0) {
    cards.push({
      id: "pending-reminders",
      title: `${pendingCount} pending reminder${pendingCount === 1 ? "" : "s"}`,
      description:
        "You have incomplete SmileSync reminders. Completing them can help you stay consistent with your care habits.",
      priority: pendingCount >= 3 ? "HIGH" : "MEDIUM",
      action: { label: "View Reminders", href: "/reminders" },
    });
  }

  if (totalCount > 0 && completedCount / totalCount >= STRONG_COMPLETION_RATE) {
    cards.push({
      id: "strong-reminder-completion",
      title: "Strong reminder completion",
      description: `You have completed ${Math.round((completedCount / totalCount) * 100)}% of your reminders (${completedCount} of ${totalCount}).`,
      priority: "LOW",
      action: { label: "View Reminders", href: "/reminders" },
    });
  }

  if (data.appointmentStats.upcomingCount > 0) {
    const n = data.appointmentStats.upcomingCount;
    cards.push({
      id: "upcoming-appointments",
      title: `${n} upcoming confirmed appointment${n === 1 ? "" : "s"}`,
      description:
        "You have confirmed dental visits ahead. Bring any oral-health questions for your dentist.",
      priority: "LOW",
      action: { label: "View Appointments", href: "/appointments" },
    });
  }

  if (data.appointmentStats.completedCount > 0) {
    const n = data.appointmentStats.completedCount;
    cards.push({
      id: "completed-appointments",
      title: "Completed appointments on file",
      description: `SmileSync has ${n} completed appointment${n === 1 ? "" : "s"} recorded for you.`,
      priority: "LOW",
      action: { label: "View Appointments", href: "/appointments" },
    });
  }

  if (latest && data.appointmentStats.upcomingCount === 0) {
    cards.push({
      id: "no-upcoming-appointment",
      title: "No upcoming confirmed appointment",
      description:
        "You do not currently have a confirmed upcoming visit in SmileSync. Regular professional dental care is still recommended.",
      priority: latest.riskLevel === "HIGH" ? "HIGH" : "MEDIUM",
      action: { label: "View Appointments", href: "/appointments" },
    });
  }

  if (data.novaStats.conversationCount > 0) {
    cards.push({
      id: "nova-activity",
      title: "You have chatted with Nova",
      description: `${data.novaStats.conversationCount} conversation${data.novaStats.conversationCount === 1 ? "" : "s"} and ${data.novaStats.messageCount} message${data.novaStats.messageCount === 1 ? "" : "s"} are on file. Ask Nova educational follow-up questions anytime.`,
      priority: "LOW",
      action: { label: "Ask Nova", href: "/nova" },
    });
  }

  return cards
    .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])
    .slice(0, MAX_CARDS);
}
