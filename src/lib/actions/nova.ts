"use server";

import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "../prisma";
import { z } from "zod";

const NovaInputSchema = z.object({
  message: z.string().min(1, "Message cannot be empty").max(2000, "Message is too long"),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "model"]),
        content: z.string(),
      })
    )
    .optional()
    .default([]),
});

export type NovaInput = z.infer<typeof NovaInputSchema>;

export async function getNovaPersonalizationStatus() {
  try {
    const { userId } = await auth();
    if (!userId) return { hasAssessment: false };

    const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!dbUser) return { hasAssessment: false };

    const count = await prisma.oralHealthAssessment.count({
      where: { userId: dbUser.id },
    });

    return { hasAssessment: count > 0 };
  } catch {
    return { hasAssessment: false };
  }
}

export async function sendNovaChatMessage(rawInput: unknown) {
  try {
    // 1. Authenticate user via Clerk
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        error: "UNAUTHORIZED: You must be logged in to chat with Nova.",
      };
    }

    // 2. Resolve database user profile
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!dbUser) {
      return {
        success: false,
        error: "UNAUTHORIZED: Database user profile not found.",
      };
    }

    // 3. Validate input schema
    const validation = NovaInputSchema.safeParse(rawInput);
    if (!validation.success) {
      const issueMessage = validation.error.issues.map((i) => i.message).join(", ");
      return { success: false, error: `Invalid input: ${issueMessage}` };
    }

    const { message, history } = validation.data;

    // 4. Retrieve user's LATEST stored OralHealthAssessment safely on server
    const latestAssessment = await prisma.oralHealthAssessment.findFirst({
      where: { userId: dbUser.id },
      orderBy: { createdAt: "desc" },
    });

    // 5. Build safe personalization context if assessment exists
    let assessmentContextString = "";
    if (latestAssessment) {
      assessmentContextString = `USER'S LATEST ORAL HEALTH ASSESSMENT (EDUCATIONAL CONTEXT):
- Overall Risk Level: ${latestAssessment.riskLevel} (Score: ${latestAssessment.riskScore}/100)
- Risk Factors: ${latestAssessment.riskFactors.join("; ")}
- Recommendations: ${latestAssessment.recommendations.join("; ")}
- Warning Signs to Monitor: ${latestAssessment.warningSigns.join("; ")}
- Recommended Next Step: ${latestAssessment.nextStep}`;
    }

    // 6. Verify Gemini API Key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("[NOVA_CHAT_ERROR] GEMINI_API_KEY environment variable is not configured");
      return {
        success: false,
        error: "Nova AI service is currently unavailable. Please ensure GEMINI_API_KEY is configured.",
      };
    }

    // 7. Initialize Gemini Model (gemini-3.6-flash)
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-3.6-flash",
      generationConfig: {
        temperature: 0.4,
      },
    });

    // 8. Construct Nova System Prompt with Personalization & Safety Directives
    const systemPrompt = `You are Nova, an AI Dental & Oral Health Educational Assistant for SmileSync AI.
Your purpose is to provide friendly, clear, empathetic, and scientifically sound educational guidance on oral hygiene, dental care, symptoms, and habits.

${
  assessmentContextString
    ? `${assessmentContextString}

PERSONALIZATION GUIDELINES:
- The user has a stored educational oral-health assessment summary shown above.
- Use this assessment context to personalize your response ONLY when it is relevant to the user's question or when they ask for recommendations/guidance on improving their oral health.
- Use natural, conversational phrasing such as "Based on your recent oral-health assessment..."
- Do NOT force or dump assessment details if the user is asking a simple, generic concept question (e.g., "What is a cavity?" or "How does fluoride work?").
- Do NOT expose raw database fields, JSON strings, or internal IDs.
- NEVER state that the assessment constitutes a clinical medical diagnosis or proof of disease.`
    : "NOTE: The user has not completed an oral-health assessment yet. Provide general educational guidance and gently mention they can complete an assessment on SmileSync AI to get personalized insights when relevant."
}

STRICT SAFETY & SCOPE DIRECTIVES:
1. IDENTIFICATION: You are Nova, an AI assistant for educational oral health guidance. You are NOT a licensed dentist, physician, or dental surgeon.
2. NO DIAGNOSIS: You must NEVER claim to provide a clinical diagnosis or definitive medical opinion. Always use educational language (e.g., "this can be a risk indicator", "common causes include", "consider discussing with a dentist").
3. NO PRESCRIPTIONS: Never prescribe medication, dosage recommendations, or unverified chemical/home remedies.
4. URGENT SYMPTOMS: If the user describes severe, acute, or alarming symptoms (e.g., severe throbbing pain, facial/jaw swelling, difficulty breathing or swallowing, trauma/knocked-out tooth, heavy uncontrolled bleeding, high fever), IMMEDIATELY advise them to seek emergency or prompt professional dental/medical care.
5. DENTAL CARE ADVOCACY: Always encourage regular dental checkups and consulting a qualified dental professional for personalized clinical evaluations.
6. FORMATTING: Use clean, easy-to-read markdown formatting (bullet points, clear paragraphs, bold text for key terms). Keep responses helpful, concise, and conversational.`;

    // 9. Build conversation prompt flow
    let promptContext = `${systemPrompt}\n\n`;

    if (history && history.length > 0) {
      promptContext += "CONVERSATION HISTORY:\n";
      const recentHistory = history.slice(-10);
      for (const item of recentHistory) {
        const speaker = item.role === "user" ? "User" : "Nova";
        promptContext += `${speaker}: ${item.content}\n`;
      }
      promptContext += "\n";
    }

    promptContext += `User: ${message}\nNova:`;

    // 10. Generate Content via Gemini API
    const result = await model.generateContent(promptContext);
    const replyText = result.response.text();

    if (!replyText || replyText.trim() === "") {
      throw new Error("Empty response received from Nova AI model");
    }

    return {
      success: true,
      reply: replyText.trim(),
    };
  } catch (error: any) {
    console.error("[NOVA_CHAT_ERROR] Server action failure:", error?.message || error);
    return {
      success: false,
      error: error?.message || "An unexpected error occurred while communicating with Nova.",
    };
  }
}
