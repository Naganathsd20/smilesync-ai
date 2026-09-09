"use server";

import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "../prisma";
import { z } from "zod";

export async function getDentalHealthInsights() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized access", data: null };
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!dbUser) {
      return { success: false, error: "User profile not found", data: null };
    }

    // Concurrent database query scoped strictly to dbUser.id
    const [assessments, appointments, reminders, novaConversations] = await Promise.all([
      prisma.oralHealthAssessment.findMany({
        where: { userId: dbUser.id },
        orderBy: { createdAt: "desc" },
      }),
      prisma.appointment.findMany({
        where: { userId: dbUser.id },
        include: {
          doctor: {
            select: {
              name: true,
              speciality: true,
            },
          },
        },
        orderBy: { date: "desc" },
      }),
      prisma.smartReminder.findMany({
        where: { userId: dbUser.id },
        orderBy: { dueDate: "asc" },
      }),
      prisma.novaConversation.findMany({
        where: { userId: dbUser.id },
        include: {
          _count: {
            select: { messages: true },
          },
        },
        orderBy: { updatedAt: "desc" },
      }),
    ]);

    const latestAssessment = assessments[0] || null;
    const previousAssessment = assessments[1] || null;
    const now = new Date();

    // Risk score change: only compute when both latest and previous exist
    const riskScoreChange =
      latestAssessment && previousAssessment
        ? latestAssessment.riskScore - previousAssessment.riskScore
        : null;

    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const upcomingAppointmentsCount = appointments.filter(
      (a) => a.status === "CONFIRMED" && new Date(a.date) >= todayStart
    ).length;

    const completedAppointmentsCount = appointments.filter(
      (a) => a.status === "COMPLETED"
    ).length;

    const pendingRemindersCount = reminders.filter((r) => !r.isCompleted).length;
    const completedRemindersCount = reminders.filter((r) => r.isCompleted).length;
    const habitRemindersCount = reminders.filter((r) => r.type === "HABIT").length;

    const totalNovaMessages = novaConversations.reduce(
      (sum, conv) => sum + conv._count.messages,
      0
    );

    return {
      success: true,
      data: {
        userProfile: {
          firstName: dbUser.firstName || "Valued",
          lastName: dbUser.lastName || "Patient",
          email: dbUser.email,
          createdAt: dbUser.createdAt,
        },
        assessmentStats: {
          latest: latestAssessment
            ? {
                id: latestAssessment.id,
                riskLevel: latestAssessment.riskLevel,
                riskScore: latestAssessment.riskScore,
                riskFactors: latestAssessment.riskFactors,
                recommendations: latestAssessment.recommendations,
                warningSigns: latestAssessment.warningSigns,
                nextStep: latestAssessment.nextStep,
                disclaimer: latestAssessment.disclaimer,
                createdAt: latestAssessment.createdAt,
              }
            : null,
          riskScoreChange,
          totalCount: assessments.length,
          history: assessments.map((a) => ({
            id: a.id,
            riskScore: a.riskScore,
            riskLevel: a.riskLevel,
            createdAt: a.createdAt,
          })),
        },
        appointmentStats: {
          totalCount: appointments.length,
          upcomingCount: upcomingAppointmentsCount,
          completedCount: completedAppointmentsCount,
          recent: appointments.slice(0, 3),
        },
        reminderStats: {
          totalCount: reminders.length,
          pendingCount: pendingRemindersCount,
          completedCount: completedRemindersCount,
          habitCount: habitRemindersCount,
        },
        novaStats: {
          conversationCount: novaConversations.length,
          messageCount: totalNovaMessages,
        },
      },
    };
  } catch (error) {
    console.error("[GET_DENTAL_HEALTH_INSIGHTS_ERROR]", error);
    return {
      success: false,
      error: "Failed to aggregate dental health insights data.",
      data: null,
    };
  }
}

const INSIGHTS_EDUCATIONAL_DISCLAIMER =
  "This summary is for educational and informational purposes only. It is not medical or dental advice, a diagnosis, or a treatment plan. Always consult a qualified dental professional for clinical decisions about your oral health.";

const GEMINI_TIMEOUT_MS = 20_000;

type InsightsPayload = NonNullable<Awaited<ReturnType<typeof getDentalHealthInsights>>["data"]>;

function extractJsonText(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  }
  return cleaned;
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("GEMINI_TIMEOUT")), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}

function buildInsightsAiSnapshot(data: InsightsPayload) {
  const latest = data.assessmentStats.latest;
  const change = data.assessmentStats.riskScoreChange;
  const historyOldestFirst = [...data.assessmentStats.history].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  const historySummary = historyOldestFirst
    .map((item) => `${item.riskScore} (${item.riskLevel})`)
    .join(" → ");

  const previousRiskScore =
    latest && change !== null ? latest.riskScore - change : null;

  return {
    firstName: data.userProfile.firstName,
    latestRiskScore: latest?.riskScore ?? null,
    latestRiskLevel: latest?.riskLevel ?? null,
    previousRiskScore,
    riskScoreChange: change,
    assessmentCount: data.assessmentStats.totalCount,
    assessmentHistoryChronological: historySummary || "none",
    riskFactors: (latest?.riskFactors ?? []).slice(0, 5),
    recommendations: (latest?.recommendations ?? []).slice(0, 5),
    warningSigns: (latest?.warningSigns ?? []).slice(0, 5),
    nextStep: latest?.nextStep ?? null,
    upcomingAppointments: data.appointmentStats.upcomingCount,
    completedAppointments: data.appointmentStats.completedCount,
    totalAppointments: data.appointmentStats.totalCount,
    pendingReminders: data.reminderStats.pendingCount,
    completedReminders: data.reminderStats.completedCount,
    totalReminders: data.reminderStats.totalCount,
    habitReminders: data.reminderStats.habitCount,
    novaConversations: data.novaStats.conversationCount,
    novaMessages: data.novaStats.messageCount,
  };
}

const PersonalizedInsightItemSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().min(1).max(400),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
});

const PersonalizedActionSchema = z.object({
  title: z.string().min(1).max(80),
  description: z.string().min(1).max(240),
  href: z.enum(["/assessment", "/appointments", "/reminders", "/nova", "/care-plan"]),
});

const PersonalizedInsightsOutputSchema = z.object({
  headline: z.string().min(1).max(160),
  insights: z.array(PersonalizedInsightItemSchema).min(1).max(4),
  actions: z.array(PersonalizedActionSchema).min(1).max(4),
});

export type PersonalizedInsightsOutput = z.infer<typeof PersonalizedInsightsOutputSchema>;

export async function getInsightsAiHealthSummary() {
  try {
    const insightsResult = await getDentalHealthInsights();

    if (!insightsResult.success || !insightsResult.data) {
      return {
        success: false,
        error: insightsResult.error || "Unable to load insights data for summary.",
        summary: null,
        disclaimer: INSIGHTS_EDUCATIONAL_DISCLAIMER,
      };
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("[INSIGHTS_AI_SUMMARY_ERROR] GEMINI_API_KEY environment variable is not configured");
      return {
        success: false,
        error: "AI Health Summary is currently unavailable.",
        summary: null,
        disclaimer: INSIGHTS_EDUCATIONAL_DISCLAIMER,
      };
    }

    const snapshot = buildInsightsAiSnapshot(insightsResult.data);

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-3.6-flash",
      generationConfig: {
        temperature: 0.4,
      },
    });

    const prompt = `You are an educational oral-health insights assistant for SmileSync AI.
Write a concise AI Health Summary for the signed-in patient using ONLY the aggregated activity snapshot below.

PATIENT SNAPSHOT (JSON):
${JSON.stringify(snapshot)}

REQUIREMENTS:
- Address the user by first name when it is a real given name. If the name is a generic placeholder such as "Valued", do not force a greeting with that word.
- 2 to 4 short paragraphs, or a short intro plus a few bullet points. Keep the whole summary under 180 words.
- Be educational and informational. Describe patterns in their SmileSync activity (assessments, reminders, appointments, Nova chats).
- If they have 0 assessments, 0 appointments, or 0 reminders, say so honestly and suggest using those SmileSync features. Do not invent scores or visits.
- If they have exactly one assessment, do not claim a health trend over time.
- If riskScoreChange is a number: a negative change means the latest score is lower than the previous one; a positive change means the latest score is higher. Describe this as a change in an educational risk score, not as proof of improvement or worsening disease.
- NEVER diagnose a disease, condition, or oral pathology.
- NEVER prescribe treatment, medication, products, or dosages.
- NEVER claim certainty about medical or dental conditions.
- Use cautious language such as "educational risk score", "may be worth discussing with a dentist", and "this is not a diagnosis".
- Encourage routine professional dental care where appropriate, especially if the latest educational risk level is MEDIUM or HIGH, reminders are overdue, or they have no upcoming confirmed appointment.
- Do not mention database fields, JSON, APIs, Gemini, or internal IDs.
- Do not wrap the response in markdown code fences.
- End with this exact disclaimer on its own final line:
${INSIGHTS_EDUCATIONAL_DISCLAIMER}`;

    const result = await model.generateContent(prompt);
    const replyText = result.response.text();

    if (!replyText || replyText.trim() === "") {
      throw new Error("Empty response received from insights summary model");
    }

    let summary = replyText.trim();
    if (!summary.includes("educational and informational purposes")) {
      summary = `${summary}\n\n${INSIGHTS_EDUCATIONAL_DISCLAIMER}`;
    }

    return {
      success: true,
      error: null,
      summary,
      disclaimer: INSIGHTS_EDUCATIONAL_DISCLAIMER,
    };
  } catch (error) {
    console.error("[INSIGHTS_AI_SUMMARY_ERROR]", error);
    return {
      success: false,
      error: "Failed to generate AI Health Summary. Your dashboard metrics are still available.",
      summary: null,
      disclaimer: INSIGHTS_EDUCATIONAL_DISCLAIMER,
    };
  }
}

export async function getPersonalizedInsights() {
  try {
    const insightsResult = await getDentalHealthInsights();

    if (!insightsResult.success || !insightsResult.data) {
      return {
        success: false,
        error: insightsResult.error || "Unable to load insights data.",
        data: null,
        disclaimer: INSIGHTS_EDUCATIONAL_DISCLAIMER,
      };
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("[PERSONALIZED_INSIGHTS_ERROR] GEMINI_API_KEY environment variable is not configured");
      return {
        success: false,
        error: "Personalized AI insights are currently unavailable.",
        data: null,
        disclaimer: INSIGHTS_EDUCATIONAL_DISCLAIMER,
      };
    }

    const snapshot = buildInsightsAiSnapshot(insightsResult.data);

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-3.6-flash",
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    });

    const prompt = `You are an educational oral-health insights engine for SmileSync AI.
Return JSON only. Use ONLY the aggregated snapshot below. Do not invent assessments, scores, appointments, reminders, or Nova chats.

SNAPSHOT:
${JSON.stringify(snapshot)}

Return an object matching:
{
  "headline": string,
  "insights": [{ "title": string, "description": string, "priority": "LOW" | "MEDIUM" | "HIGH" }],
  "actions": [{ "title": string, "description": string, "href": "/assessment" | "/appointments" | "/reminders" | "/nova" | "/care-plan" }]
}

RULES:
- 1 to 4 insights. Keep them specific to values that are actually present (non-null / greater than zero) in the snapshot.
- If assessmentCount is 0, do not mention a risk score or risk factors. Suggest completing an assessment.
- If there is only one assessment, do not claim a trend over time.
- riskScoreChange: positive = latest educational score is higher than previous; negative = lower. Describe as educational score change, never as disease getting worse or better.
- priority is an activity/attention ranking, NOT a medical severity or diagnosis.
- HIGH only when supported (e.g. pending reminders, high educational risk level, warning signs listed, no assessment).
- 1 to 4 actions. href must be one of the allowed SmileSync routes. Title should match the destination (Take Assessment, View Appointments, View Reminders, Ask Nova, View Care Plan).
- NEVER diagnose, prescribe medication, or give clinical treatment instructions.
- Use educational language. Do not mention JSON, APIs, Gemini, or database fields.
- headline max 160 characters.`;

    const result = await withTimeout(model.generateContent(prompt), GEMINI_TIMEOUT_MS);
    const replyText = result.response.text();

    if (!replyText || replyText.trim() === "") {
      throw new Error("Empty personalized insights response");
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(extractJsonText(replyText));
    } catch {
      console.error("[PERSONALIZED_INSIGHTS_INVALID_JSON]", replyText.slice(0, 400));
      return {
        success: false,
        error: "Personalized AI insights could not be read. Your dashboard is still available.",
        data: null,
        disclaimer: INSIGHTS_EDUCATIONAL_DISCLAIMER,
      };
    }

    const validated = PersonalizedInsightsOutputSchema.safeParse(parsed);
    if (!validated.success) {
      console.error("[PERSONALIZED_INSIGHTS_VALIDATION_ERROR]", validated.error.flatten());
      return {
        success: false,
        error: "Personalized AI insights did not match the expected format. Your dashboard is still available.",
        data: null,
        disclaimer: INSIGHTS_EDUCATIONAL_DISCLAIMER,
      };
    }

    return {
      success: true,
      error: null,
      data: validated.data,
      disclaimer: INSIGHTS_EDUCATIONAL_DISCLAIMER,
    };
  } catch (error) {
    const timedOut = error instanceof Error && error.message === "GEMINI_TIMEOUT";
    console.error("[PERSONALIZED_INSIGHTS_ERROR]", error);
    return {
      success: false,
      error: timedOut
        ? "Personalized AI insights timed out. Your dashboard metrics are still available."
        : "Failed to generate personalized AI insights. Your dashboard metrics are still available.",
      data: null,
      disclaimer: INSIGHTS_EDUCATIONAL_DISCLAIMER,
    };
  }
}
