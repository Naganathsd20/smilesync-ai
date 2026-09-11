"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "../prisma";
import { ReminderType } from "@prisma/client";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import resend from "../resend";
import SmartReminderEmail from "@/components/emails/SmartReminderEmail";
import { render } from "@react-email/render";
import { generateContentWithRetry } from "../gemini-retry";

// Zod Schema for validating Gemini response
const GeminiReminderSchema = z.array(
  z.object({
    tempId: z.string(),
    title: z.string(),
    description: z.string(),
  }),
);

export async function getUserSmartReminders() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized access", reminders: [] };
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!dbUser) {
      return { success: false, error: "User profile not found", reminders: [] };
    }

    const reminders = await prisma.smartReminder.findMany({
      where: { userId: dbUser.id },
      orderBy: [{ isCompleted: "asc" }, { dueDate: "asc" }],
    });

    return { success: true, reminders };
  } catch (error) {
    console.error("[GET_SMART_REMINDERS_ERROR]", error);
    return {
      success: false,
      error: "Failed to load smart reminders",
      reminders: [],
    };
  }
}

export async function generateSmartRemindersForUser() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized access", count: 0 };
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!dbUser) {
      return { success: false, error: "User profile not found", count: 0 };
    }

    // Fetch existing user data for rule evaluation
    const [appointments, latestAssessment, existingReminders] =
      await Promise.all([
        prisma.appointment.findMany({
          where: { userId: dbUser.id },
          include: { doctor: true },
          orderBy: { date: "asc" },
        }),
        prisma.oralHealthAssessment.findFirst({
          where: { userId: dbUser.id },
          orderBy: { createdAt: "desc" },
        }),
        prisma.smartReminder.findMany({
          where: { userId: dbUser.id },
          select: { sourceKey: true },
        }),
      ]);

    const existingKeys = new Set(
      existingReminders
        .map((r) => r.sourceKey)
        .filter((k): k is string => Boolean(k)),
    );

    const now = new Date();
    const candidates: Array<{
      sourceKey: string;
      title: string;
      description: string;
      type: ReminderType;
      dueDate: Date;
    }> = [];

    // --- RULE A: UPCOMING APPOINTMENTS ---
    const upcomingAppointments = appointments.filter(
      (a) =>
        a.status === "CONFIRMED" &&
        new Date(a.date) >= new Date(now.setHours(0, 0, 0, 0)),
    );

    for (const appt of upcomingAppointments) {
      const sourceKey = `appt_reminder_${appt.id}`;
      if (!existingKeys.has(sourceKey)) {
        const apptDate = new Date(appt.date);
        // Set reminder 1 day before appointment, or on appointment day if today
        const reminderDueDate = new Date(apptDate);
        reminderDueDate.setDate(reminderDueDate.getDate() - 1);
        if (reminderDueDate < now) {
          reminderDueDate.setTime(now.getTime());
        }

        candidates.push({
          sourceKey,
          title: `Upcoming Appointment with Dr. ${appt.doctor.name}`,
          description: `Your appointment is scheduled for ${apptDate.toLocaleDateString(
            "en-US",
            {
              weekday: "long",
              month: "short",
              day: "numeric",
            },
          )} at ${appt.time}. ${appt.reason ? `Reason: ${appt.reason}.` : ""}`,
          type: ReminderType.APPOINTMENT,
          dueDate: reminderDueDate,
        });
      }
    }

    // --- RULE B: DENTAL CHECKUP FOLLOW-UP ---
    // Only treat appointments as checkups if existing appointment information clearly indicates it
    const checkupRegex = /checkup|check-up|cleaning|exam|routine|annual/i;
    const pastCheckups = appointments.filter(
      (a) => a.reason && checkupRegex.test(a.reason),
    );

    for (const appt of pastCheckups) {
      const sourceKey = `checkup_followup_${appt.id}`;
      if (!existingKeys.has(sourceKey)) {
        const checkupDate = new Date(appt.date);
        const nextCheckupDate = new Date(checkupDate);
        nextCheckupDate.setMonth(nextCheckupDate.getMonth() + 6);

        candidates.push({
          sourceKey,
          title: "6-Month Routine Dental Checkup Due",
          description: `It has been 6 months since your last routine checkup on ${checkupDate.toLocaleDateString(
            "en-US",
          )}. Regular cleanings maintain optimal oral health.`,
          type: ReminderType.CHECKUP,
          dueDate: nextCheckupDate,
        });
      }
    }

    // --- RULE C: ASSESSMENT FOLLOW-UP ---
    if (latestAssessment) {
      const sourceKey = `assessment_followup_${latestAssessment.id}`;
      if (!existingKeys.has(sourceKey)) {
        const assessmentDate = new Date(latestAssessment.createdAt);
        let followUpDays = 30;
        let defaultTitle = "Oral Health Assessment Follow-Up";
        let defaultDesc =
          "Review your risk factors and recommendations to track oral care progress.";

        if (latestAssessment.riskLevel === "HIGH") {
          followUpDays = 14;
          defaultTitle = "High Risk Oral Health Follow-Up";
          defaultDesc =
            "Your recent oral health assessment identified elevated risk factors. We recommend consulting a dental professional for a comprehensive evaluation.";
        } else if (latestAssessment.riskLevel === "MEDIUM") {
          followUpDays = 30;
          defaultTitle = "Oral Health Care Progress Check";
          defaultDesc =
            "It is time to re-evaluate your oral health risk factors and verify that your preventative care routine is on track.";
        } else {
          followUpDays = 90;
          defaultTitle = "Routine Oral Assessment Refresh";
          defaultDesc =
            "Your oral health assessment was low risk! Keep up your daily hygiene routine and consider taking a refreshed assessment periodically.";
        }

        const dueDate = new Date(assessmentDate);
        dueDate.setDate(dueDate.getDate() + followUpDays);

        candidates.push({
          sourceKey,
          title: defaultTitle,
          description: defaultDesc,
          type: ReminderType.ASSESSMENT_FOLLOWUP,
          dueDate,
        });
      }

      // --- RULE D: CARE PLAN HABITS ---
      const habitKey1 = `habit_${latestAssessment.id}_flossing`;
      if (!existingKeys.has(habitKey1)) {
        const habitDueDate = new Date();
        habitDueDate.setDate(habitDueDate.getDate() + 1);

        candidates.push({
          sourceKey: habitKey1,
          title: "Daily Interdental Cleaning (Flossing)",
          description:
            "Clean between your teeth daily with dental floss or an interdental cleaner to prevent plaque accumulation and protect gum health.",
          type: ReminderType.HABIT,
          dueDate: habitDueDate,
        });
      }

      const habitKey2 = `habit_${latestAssessment.id}_brushing`;
      if (!existingKeys.has(habitKey2)) {
        const habitDueDate = new Date();
        habitDueDate.setDate(habitDueDate.getDate() + 2);

        candidates.push({
          sourceKey: habitKey2,
          title: "Twice-Daily Toothbrushing Routine",
          description:
            "Brush your teeth twice daily for 2 minutes using a soft-bristled toothbrush to effectively remove plaque and protect enamel.",
          type: ReminderType.HABIT,
          dueDate: habitDueDate,
        });
      }
    }

    if (candidates.length === 0) {
      return {
        success: true,
        count: 0,
        message: "No new smart reminders are needed at this time.",
      };
    }

    // --- GEMINI PERSONALIZATION ---
    // Safely attempt Gemini copy enhancement if GEMINI_API_KEY is available
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: "gemini-3.6-flash",
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.3,
          },
        });

        const systemPrompt = `You are an educational AI oral health reminder assistant for SmileSync AI.
Your purpose is to refine and personalize warm, encouraging copy for pre-scheduled dental reminders.

STRICT MEDICAL SAFETY RULES:
1. DO NOT diagnose specific diseases or medical conditions.
2. DO NOT prescribe medication or medical treatment.
3. Keep phrasing educational, encouraging, and supportive.
4. Keep the title concise (under 8 words) and description clear (1-2 sentences).

You will be given a list of candidate reminders in JSON format:
[
  { "tempId": "string", "type": "string", "baseTitle": "string", "baseDescription": "string" }
]

Output ONLY a JSON array with updated warm titles and descriptions:
[
  { "tempId": "string", "title": "string", "description": "string" }
]`;

        const payload = candidates.map((c) => ({
          tempId: c.sourceKey,
          type: c.type,
          baseTitle: c.title,
          baseDescription: c.description,
        }));

        const result = await generateContentWithRetry(
          model,
          [
            systemPrompt,
            `Candidates to personalize: ${JSON.stringify(payload)}`,
          ],
          2,
          1000,
        );

        const responseText = result.response.text();
        const parsedJson = JSON.parse(responseText);
        const validated = GeminiReminderSchema.safeParse(parsedJson);

        if (validated.success) {
          const map = new Map(
            validated.data.map((item) => [item.tempId, item]),
          );
          for (const cand of candidates) {
            const geminiVersion = map.get(cand.sourceKey);
            if (geminiVersion) {
              cand.title = geminiVersion.title || cand.title;
              cand.description = geminiVersion.description || cand.description;
            }
          }
        }
      } catch (geminiErr) {
        console.warn(
          "[GEMINI_REMINDER_PERSONALIZATION_FALLBACK] Using deterministic copy",
          geminiErr,
        );
      }
    }

    // Persist new reminders to database
    await prisma.smartReminder.createMany({
      data: candidates.map((c) => ({
        userId: dbUser.id,
        title: c.title,
        description: c.description,
        type: c.type,
        dueDate: c.dueDate,
        sourceKey: c.sourceKey,
      })),
      skipDuplicates: true,
    });

    return {
      success: true,
      count: candidates.length,
      message: `Generated ${candidates.length} smart reminder(s).`,
    };
  } catch (error) {
    console.error("[GENERATE_SMART_REMINDERS_ERROR]", error);
    return {
      success: false,
      error: "Failed to generate smart reminders",
      count: 0,
    };
  }
}

export async function toggleReminderCompletion(reminderId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized" };
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!dbUser) {
      return { success: false, error: "User profile not found" };
    }

    const existingReminder = await prisma.smartReminder.findFirst({
      where: { id: reminderId, userId: dbUser.id },
    });

    if (!existingReminder) {
      return { success: false, error: "Reminder not found or access denied" };
    }

    const updated = await prisma.smartReminder.update({
      where: { id: existingReminder.id },
      data: { isCompleted: !existingReminder.isCompleted },
    });

    return { success: true, reminder: updated };
  } catch (error) {
    console.error("[TOGGLE_REMINDER_COMPLETION_ERROR]", error);
    return { success: false, error: "Failed to update reminder state" };
  }
}

export async function sendReminderEmail(reminderId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: "Unauthorized access" };
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!dbUser) {
      return { success: false, error: "User profile not found" };
    }

    const reminder = await prisma.smartReminder.findFirst({
      where: { id: reminderId, userId: dbUser.id },
    });

    if (!reminder) {
      return { success: false, error: "Reminder not found or access denied" };
    }

    if (!process.env.RESEND_API_KEY) {
      return {
        success: false,
        error: "Email delivery service is currently unconfigured.",
      };
    }

    const userName =
      `${dbUser.firstName || "Valued"} ${dbUser.lastName || "Patient"}`.trim();
    const formattedDueDate = new Date(reminder.dueDate).toLocaleDateString(
      "en-US",
      {
        weekday: "long",
        year: "numeric",
        month: "short",
        day: "numeric",
      },
    );

    const emailHtml = await render(
      SmartReminderEmail({
        userName,
        title: reminder.title,
        description: reminder.description,
        type: reminder.type,
        dueDate: formattedDueDate,
      }),
    );

    const { data, error } = await resend.emails.send({
      from: "SmileSync AI <no-reply@resend.dev>",
      to: [dbUser.email],
      subject: `SmileSync Care Reminder: ${reminder.title}`,
      html: emailHtml,
    });

    if (error) {
      console.error("[RESEND_SEND_ERROR]", error);
      return {
        success: false,
        error: error.message || "Failed to send email notification",
      };
    }

    await prisma.smartReminder.update({
      where: { id: reminder.id },
      data: { sentEmail: true },
    });

    return { success: true, data };
  } catch (error) {
    console.error("[SEND_REMINDER_EMAIL_ERROR]", error);
    return { success: false, error: "Failed to deliver reminder email" };
  }
}
