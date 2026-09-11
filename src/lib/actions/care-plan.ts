"use server";

import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "../prisma";
import { z } from "zod";
import {
  generateContentWithRetry,
  getCleanGeminiErrorMessage,
} from "../gemini-retry";

function extractJsonText(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  }
  return cleaned;
}

// Validation schema for structured AI Care Plan output
const TargetedActionSchema = z.object({
  riskFactor: z.string().min(1),
  action: z.string().min(1),
});

const CarePlanOutputSchema = z.object({
  summary: z.string().min(1),
  riskLevel: z.enum(["LOW", "MEDIUM", "HIGH"]),
  riskScore: z.number().int().min(0).max(100),
  morningRoutine: z.array(z.string().min(1)).min(1),
  afternoonRoutine: z.array(z.string().min(1)).min(1),
  eveningRoutine: z.array(z.string().min(1)).min(1),
  priorityGoals: z.array(z.string().min(1)).min(1),
  targetedActions: z.array(TargetedActionSchema).min(1),
  warningSignsToMonitor: z.array(z.string().min(1)).min(1),
  professionalCareTimeline: z.string().min(1),
  lifestyleGuidance: z.array(z.string().min(1)).min(1),
  disclaimer: z.string().min(1),
});

export type CarePlanOutput = z.infer<typeof CarePlanOutputSchema>;

export async function getPersonalizedCarePlan() {
  try {
    // 1. Authenticate server session via Clerk
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        error: "UNAUTHORIZED: You must be logged in to view your care plan.",
        hasAssessment: false,
        carePlan: null,
      };
    }

    // 2. Resolve database user profile
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!dbUser) {
      return {
        success: false,
        error: "UNAUTHORIZED: User account profile not found.",
        hasAssessment: false,
        carePlan: null,
      };
    }

    // 3. Query ONLY the authenticated user's LATEST stored OralHealthAssessment
    const latestAssessment = await prisma.oralHealthAssessment.findFirst({
      where: { userId: dbUser.id },
      orderBy: { createdAt: "desc" },
    });

    if (!latestAssessment) {
      return {
        success: true,
        hasAssessment: false,
        carePlan: null,
      };
    }

    // 4. Verify Gemini API Key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error(
        "[CARE_PLAN_ERROR] GEMINI_API_KEY environment variable is not configured",
      );
      return {
        success: false,
        error:
          "Care Plan service is currently unavailable. Please check system configuration.",
        hasAssessment: true,
        carePlan: null,
      };
    }

    // 5. Initialize Gemini Client (gemini-3.6-flash)
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-3.6-flash",
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    });

    // 6. Build System & User Prompts for Care Plan Generation
    const systemPrompt = `You are an educational AI oral health care planning engine for SmileSync AI.
Your purpose is to take a user's recent oral health risk assessment profile and generate a structured, highly personalized educational dental care plan.

STRICT MEDICAL SAFETY & DISCLAIMER RULES:
1. DO NOT diagnose specific diseases or medical conditions.
2. DO NOT prescribe medication or medical treatment protocols.
3. Use educational phrasing (e.g. "risk indicator", "consider consulting a dentist", "suggested routine").
4. For acute or severe symptoms (throbbing pain, facial swelling, uncontrolled bleeding, high fever with dental pain, trauma), clearly direct the user to prompt emergency or professional dental care.
5. Always include an explicit educational disclaimer stating that this care plan is for educational guidance only and is not a clinical diagnosis or treatment.

You MUST return a JSON object strictly matching this schema:
{
  "summary": string,
  "riskLevel": "LOW" | "MEDIUM" | "HIGH",
  "riskScore": number (0-100),
  "morningRoutine": string[],
  "afternoonRoutine": string[],
  "eveningRoutine": string[],
  "priorityGoals": string[],
  "targetedActions": [{ "riskFactor": string, "action": string }],
  "warningSignsToMonitor": string[],
  "professionalCareTimeline": string,
  "lifestyleGuidance": string[],
  "disclaimer": string
}`;

    const userPrompt = `Generate a personalized AI dental care plan based on the user's latest oral health assessment data:

- Assessment Risk Level: ${latestAssessment.riskLevel}
- Assessment Risk Score: ${latestAssessment.riskScore}/100
- Identified Risk Factors: ${latestAssessment.riskFactors.join("; ")}
- Assessment Recommendations: ${latestAssessment.recommendations.join("; ")}
- Warning Signs to Monitor: ${latestAssessment.warningSigns.join("; ")}
- Recommended Next Step: ${latestAssessment.nextStep}
- Questionnaire Answers: ${JSON.stringify(latestAssessment.answers)}

Generate a practical, tailored, multi-part daily routine, priority goals, targeted risk factor mitigations, warning signs to watch, and professional dental visit timeline.`;

    // 7. Execute Structured Gemini Request with retry for transient 503 errors
    const prompt = `${systemPrompt}\n\n${userPrompt}`;
    const result = await generateContentWithRetry(model, prompt, 2, 1000);
    const rawContent = result.response.text();

    if (!rawContent) {
      throw new Error("Empty response received from AI care plan engine");
    }

    const cleanedContent = extractJsonText(rawContent);
    const parsedJson = JSON.parse(cleanedContent);

    // 8. Validate AI Output against Zod Schema
    const validation = CarePlanOutputSchema.safeParse(parsedJson);
    if (!validation.success) {
      console.error(
        "[CARE_PLAN_ERROR] Malformed AI Care Plan Output:",
        validation.error,
      );
      throw new Error("AI generated an invalid care plan output structure.");
    }

    return {
      success: true,
      hasAssessment: true,
      carePlan: validation.data,
      assessmentDate: latestAssessment.createdAt.toISOString(),
    };
  } catch (error: any) {
    console.error(
      "[CARE_PLAN_ERROR] Server action failure:",
      error?.message || error,
    );
    const userFacingError = getCleanGeminiErrorMessage(
      error,
      "An unexpected error occurred while generating your care plan.",
    );
    return {
      success: false,
      error: userFacingError,
      hasAssessment: true,
      carePlan: null,
    };
  }
}
