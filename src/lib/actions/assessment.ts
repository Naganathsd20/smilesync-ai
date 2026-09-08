"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "../prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

function extractJsonText(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  }
  return cleaned;
}

// Input Validation Schema for Questionnaire Answers
const SYMPTOM_OPTIONS = [
  "sensitivity",
  "bleeding_gums",
  "toothache",
  "bad_breath",
  "dry_mouth",
  "jaw_pain",
  "none",
] as const;

const HYGIENE_OPTIONS = [
  "twice_plus_floss",
  "twice_no_floss",
  "once_daily",
  "irregular",
] as const;

const CHECKUP_OPTIONS = [
  "under_6_months",
  "6_12_months",
  "1_2_years",
  "over_2_years",
] as const;

const LIFESTYLE_OPTIONS = [
  "sugar_acid",
  "tobacco",
  "coffee_tea_soda",
  "bruxism",
  "none",
] as const;

const MEDICAL_OPTIONS = [
  "diabetes_high_bp",
  "braces_aligners_dentures",
  "pregnancy",
  "high_stress",
  "none",
] as const;

const AssessmentInputSchema = z.object({
  symptoms: z.array(z.enum(SYMPTOM_OPTIONS)).min(1, "Please select at least one symptom option"),
  hygiene: z.enum(HYGIENE_OPTIONS),
  lastCheckup: z.enum(CHECKUP_OPTIONS),
  lifestyle: z.array(z.enum(LIFESTYLE_OPTIONS)).min(1, "Please select at least one lifestyle option"),
  medical: z.array(z.enum(MEDICAL_OPTIONS)).min(1, "Please select at least one health option"),
  notes: z.string().max(500, "Notes cannot exceed 500 characters").optional(),
});

export type AssessmentInput = z.infer<typeof AssessmentInputSchema>;

// AI Output Validation Schema
const AIOutputSchema = z.object({
  riskLevel: z.enum(["LOW", "MEDIUM", "HIGH"]),
  riskScore: z.number().int().min(0).max(100),
  riskFactors: z.array(z.string().min(1)).min(1),
  recommendations: z.array(z.string().min(1)).min(1),
  warningSigns: z.array(z.string().min(1)).min(1),
  nextStep: z.string().min(1),
  disclaimer: z.string().min(1),
});

export type AIOutput = z.infer<typeof AIOutputSchema>;

export async function createOralHealthAssessment(rawAnswers: unknown) {
  try {
    // 1. Verify Clerk Server Session
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "UNAUTHORIZED: You must be logged in to complete an assessment." };
    }

    // 2. Resolve Authenticated Database User
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!dbUser) {
      return { success: false, error: "UNAUTHORIZED: User account profile not found in database." };
    }

    // 3. Validate Questionnaire Answers Input
    const inputValidation = AssessmentInputSchema.safeParse(rawAnswers);
    if (!inputValidation.success) {
      const issueMessage = inputValidation.error.issues.map((i) => i.message).join(", ");
      return { success: false, error: `Invalid assessment input: ${issueMessage}` };
    }

    const validatedAnswers = inputValidation.data;

    // 4. Verify Gemini API Key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("[ORAL_HEALTH_ASSESSMENT_ERROR] GEMINI_API_KEY environment variable is not configured");
      return {
        success: false,
        error: "AI Assessment Service is currently unavailable. Please ensure GEMINI_API_KEY is configured.",
      };
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-3.6-flash",
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2,
      },
    });

    // 5. Construct System & User Prompts with Safety Constraints
    const systemPrompt = `You are an educational AI oral health risk assessment engine for SmileSync AI.
Your purpose is to analyze user-reported dental symptoms, daily hygiene habits, lifestyle factors, and medical context to generate an educational risk summary.

STRICT MEDICAL SAFETY & DISCLAIMER RULES:
1. DO NOT diagnose specific diseases or conditions (e.g. NEVER state "You have periodontitis", "You have a cavity", or "You have oral cancer").
2. DO NOT prescribe medication or medical treatment protocols.
3. Use educational phrasing such as "risk indicator", "potential concern", "consider consulting a dentist".
4. Identify warning signs that warrant timely professional dental evaluation.
5. Always include an explicit educational safety disclaimer stating this is not a medical or dental diagnosis.

RISK SCORE GUIDELINES:
- 0 to 33: LOW risk (healthy habits, routine checkups, minimal/no symptoms).
- 34 to 66: MEDIUM risk (moderate symptoms, missing flossing, irregular checkups 1-2 yrs, dietary risks).
- 67 to 100: HIGH risk (multiple/severe symptoms like throbbing toothache + bleeding gums, >2 years since last checkup, tobacco use, systemic risk factors).

Ensure the riskLevel ("LOW", "MEDIUM", "HIGH") strictly aligns with the riskScore (0-33 -> LOW, 34-66 -> MEDIUM, 67-100 -> HIGH).

Your output MUST be a valid JSON object matching this schema:
{
  "riskLevel": "LOW" | "MEDIUM" | "HIGH",
  "riskScore": number (0-100),
  "riskFactors": string[],
  "recommendations": string[],
  "warningSigns": string[],
  "nextStep": string,
  "disclaimer": string
}`;

    const userPrompt = `Analyze the following oral health assessment questionnaire responses:

- Current Symptoms: ${validatedAnswers.symptoms.join(", ")}
- Daily Hygiene: ${validatedAnswers.hygiene}
- Time Since Last Dental Checkup: ${validatedAnswers.lastCheckup}
- Dietary & Lifestyle Factors: ${validatedAnswers.lifestyle.join(", ")}
- Medical / Health Factors: ${validatedAnswers.medical.join(", ")}
${validatedAnswers.notes ? `- Additional User Notes: ${validatedAnswers.notes}` : ""}

Generate the structured JSON oral health risk assessment.`;

    // 6. Execute Structured Gemini API Request
    const prompt = `${systemPrompt}\n\n${userPrompt}`;
    const result = await model.generateContent(prompt);
    const rawContent = result.response.text();
    if (!rawContent) {
      throw new Error("Empty response received from AI model");
    }

    let parsedJson: unknown;
    try {
      const cleanedContent = extractJsonText(rawContent);
      parsedJson = JSON.parse(cleanedContent);
    } catch {
      throw new Error("Failed to parse JSON response from AI model");
    }

    // 7. Validate AI Output against Zod Schema
    const aiValidation = AIOutputSchema.safeParse(parsedJson);
    if (!aiValidation.success) {
      console.error("[ORAL_HEALTH_ASSESSMENT_ERROR] Malformed AI Output:", aiValidation.error);
      throw new Error("AI generated an invalid assessment output structure");
    }

    const aiOutput = aiValidation.data;

    // 8. Persist Assessment in Database for Authenticated User
    const assessment = await prisma.oralHealthAssessment.create({
      data: {
        userId: dbUser.id,
        answers: validatedAnswers,
        riskLevel: aiOutput.riskLevel,
        riskScore: aiOutput.riskScore,
        riskFactors: aiOutput.riskFactors,
        recommendations: aiOutput.recommendations,
        warningSigns: aiOutput.warningSigns,
        nextStep: aiOutput.nextStep,
        disclaimer: aiOutput.disclaimer,
      },
    });

    return {
      success: true,
      assessment: {
        id: assessment.id,
        riskLevel: assessment.riskLevel,
        riskScore: assessment.riskScore,
        riskFactors: assessment.riskFactors,
        recommendations: assessment.recommendations,
        warningSigns: assessment.warningSigns,
        nextStep: assessment.nextStep,
        disclaimer: assessment.disclaimer,
        createdAt: assessment.createdAt.toISOString(),
      },
    };
  } catch (error: any) {
    console.error("[ORAL_HEALTH_ASSESSMENT_ERROR] Server action failure:", error?.message);
    return {
      success: false,
      error: error?.message || "An unexpected error occurred while processing your assessment.",
    };
  }
}

export async function getUserOralHealthAssessments() {
  try {
    const { userId } = await auth();
    if (!userId) return [];

    const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!dbUser) return [];

    const assessments = await prisma.oralHealthAssessment.findMany({
      where: { userId: dbUser.id },
      orderBy: { createdAt: "desc" },
    });

    return assessments.map((a) => ({
      ...a,
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
    }));
  } catch (error) {
    console.error("Error fetching user oral health assessments:", error);
    return [];
  }
}

export async function getLatestOralHealthAssessment() {
  try {
    const { userId } = await auth();
    if (!userId) return null;

    const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!dbUser) return null;

    const assessment = await prisma.oralHealthAssessment.findFirst({
      where: { userId: dbUser.id },
      orderBy: { createdAt: "desc" },
    });

    if (!assessment) return null;

    return {
      ...assessment,
      createdAt: assessment.createdAt.toISOString(),
      updatedAt: assessment.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error("Error fetching latest oral health assessment:", error);
    return null;
  }
}
