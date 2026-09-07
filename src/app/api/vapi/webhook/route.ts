import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import resend from "@/lib/resend";
import AppointmentConfirmationEmail from "@/components/emails/AppointmentConfirmationEmail";
import { verifyVapiVoiceToken } from "@/lib/actions/vapi-session";
import { getAvailableTimeSlots } from "@/lib/utils";
import { format } from "date-fns";

export async function GET() {
  return NextResponse.json({ status: "ok", message: "SmileSync AI Vapi Webhook Endpoint Active" });
}

export async function POST(request: Request) {
  try {
    // 1. Optional Webhook Secret Header Check
    const webhookSecret = process.env.VAPI_WEBHOOK_SECRET;
    if (webhookSecret) {
      const headerSecret = request.headers.get("x-vapi-secret");
      if (headerSecret !== webhookSecret) {
        return NextResponse.json({ error: "Unauthorized webhook caller" }, { status: 401 });
      }
    }

    const body = await request.json();
    const message = body?.message;

    if (!message) {
      return NextResponse.json({ error: "Invalid webhook payload format" }, { status: 400 });
    }

    // Extract Vapi session token from all potential call variable locations
    const sessionToken =
      sanitizeToken(message.call?.assistantOverrides?.variableValues?.sessionToken) ||
      sanitizeToken(message.call?.artifact?.variableValues?.sessionToken) ||
      sanitizeToken(message.call?.variableValues?.sessionToken) ||
      sanitizeToken(message.call?.customer?.variableValues?.sessionToken) ||
      sanitizeToken(body.sessionToken);

    // Handle tool-calls format vs function-call format
    const isToolCallsFormat = message.type === "tool-calls";

    // Extract tool calls array across standard, list, and wrapped Vapi payload structures
    const rawToolCalls = isToolCallsFormat
      ? message.toolCalls ||
        message.toolCallList ||
        (message.toolWithToolCallList
          ? message.toolWithToolCallList.map((item: any) => item.toolCall || item)
          : []) ||
        []
      : [];

    const functionCall = message.type === "function-call" ? message.functionCall : null;

    if (!isToolCallsFormat && !functionCall) {
      // If it's another Vapi status message (like call-start, end-of-call-report), return 200 OK
      return NextResponse.json({ status: "ignored", messageType: message.type }, { status: 200 });
    }

    // Process tool calls
    if (isToolCallsFormat) {
      const results = [];

      for (const toolCall of rawToolCalls) {
        const functionName = toolCall.function?.name || toolCall.name;
        const toolCallId = toolCall.id || toolCall.toolCallId || toolCall.function?.id || "";

        let rawArgs = toolCall.function?.arguments || toolCall.arguments || toolCall.parameters;

        let args: any = {};
        if (typeof rawArgs === "string") {
          try {
            args = JSON.parse(rawArgs);
          } catch {
            args = {};
          }
        } else if (typeof rawArgs === "object" && rawArgs !== null) {
          args = rawArgs;
        }

        const result = await handleToolExecution(functionName, args, sessionToken);
        const stringResult = typeof result === "string" ? result : JSON.stringify(result);

        results.push({
          toolCallId: toolCallId,
          result: stringResult,
        });
      }

      console.log(`[VOICE_BOOKING] Returning Vapi response with ${results.length} result(s)`);
      return NextResponse.json({ results }, { status: 200 });
    } else if (functionCall) {
      const functionName = functionCall.name;
      const args = functionCall.parameters || {};
      const result = await handleToolExecution(functionName, args, sessionToken);
      const stringResult = typeof result === "string" ? result : JSON.stringify(result);

      return NextResponse.json({ result: stringResult }, { status: 200 });
    }

    return NextResponse.json({ error: "Unhandled tool format" }, { status: 400 });
  } catch (error: any) {
    console.error("[VOICE_BOOKING_ERROR] Unhandled webhook error:", error?.message, error?.stack);
    return NextResponse.json(
      {
        results: [
          {
            toolCallId: "error",
            result: `Error processing request: ${error?.message || "Internal server error"}`,
          },
        ],
      },
      { status: 200 }
    );
  }
}

function sanitizeToken(token?: string): string | undefined {
  if (!token || typeof token !== "string") return undefined;

  const trimmed = token.trim();

  // Reject obvious Vapi template/unresolved placeholders.
  if (
    trimmed.startsWith("{{") ||
    trimmed.endsWith("}}") ||
    trimmed.includes("undefined") ||
    trimmed.includes("null")
  ) {
    return undefined;
  }

  return trimmed;
}

async function handleToolExecution(
  functionName: string,
  args: any,
  sessionToken?: string
): Promise<string> {
  try {
    const effectiveSessionToken =
      sanitizeToken(sessionToken) ||
      sanitizeToken(args?.sessionToken) ||
      sanitizeToken(args?.session_token);

    switch (functionName) {
      case "getAvailableDoctors": {
        console.log("[VOICE_BOOKING] Executing tool: getAvailableDoctors");
        const doctors = await prisma.doctor.findMany({
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            speciality: true,
            gender: true,
          },
          orderBy: { name: "asc" },
        });

        if (doctors.length === 0) {
          return "No active doctors are currently available in the clinic.";
        }

        const doctorList = doctors
          .map((d) => `• ${d.name} (${d.speciality}) [ID: ${d.id}]`)
          .join("\n");
        return `Available Doctors at SmileSync Dental:\n${doctorList}`;
      }

      case "checkAvailability": {
        console.log("[VOICE_BOOKING] Executing tool: checkAvailability");
        if (!effectiveSessionToken) {
          return "UNAUTHORIZED: Missing session token. User must be logged in to check appointment availability.";
        }

        const tokenPayload = await verifyVapiVoiceToken(effectiveSessionToken);
        if (!tokenPayload) {
          return "UNAUTHORIZED: Invalid or expired voice session token. Please re-authenticate.";
        }

        const rawDate = args.date || args.appointmentDate || args.requestedDate;
        const rawTime = args.time || args.appointmentTime || args.slot;
        const doctorId = args.doctorId || args.doctor_id;
        const doctorName = args.doctorName || args.doctor_name || args.doctor;

        if (!rawDate) {
          return "Please specify the date for the appointment (format: YYYY-MM-DD).";
        }

        const doctor = await resolveDoctor(doctorId, doctorName);
        if (!doctor) {
          return "Doctor not found. Please pick an active doctor.";
        }

        const requestedDate = parseAppointmentDate(rawDate);
        if (!requestedDate) {
          return "Invalid date format. Please provide date in YYYY-MM-DD format.";
        }

        const formattedDateStr = format(requestedDate, "yyyy-MM-dd");

        // Get booked slots for doctor on date
        const bookedAppointments = await prisma.appointment.findMany({
          where: {
            doctorId: doctor.id,
            date: requestedDate,
            status: { in: ["CONFIRMED", "COMPLETED"] },
          },
          select: { time: true },
        });

        const bookedSlots = bookedAppointments.map((a) => a.time);
        const allSlots = getAvailableTimeSlots();
        const openSlots = allSlots.filter((slot) => !bookedSlots.includes(slot));

        if (rawTime) {
          const normalizedTime = normalizeTimeSlot(rawTime);

          if (bookedSlots.includes(normalizedTime)) {
            return `Slot ${normalizedTime} on ${formattedDateStr} for ${doctor.name} is UNAVAILABLE (already booked). Available open time slots for this date are: ${
              openSlots.length > 0 ? openSlots.join(", ") : "None"
            }. Please offer these available slots to the user.`;
          }

          if (!allSlots.includes(normalizedTime)) {
            return `Slot ${rawTime} is outside clinic hours. Available time slots are: ${openSlots.join(", ")}.`;
          }

          return `Slot ${normalizedTime} on ${formattedDateStr} for ${doctor.name} is AVAILABLE. Summarize the appointment details to the user and ask for explicit confirmation before booking.`;
        }

        return `Available time slots for ${doctor.name} on ${formattedDateStr} are: ${
          openSlots.length > 0 ? openSlots.join(", ") : "No slots available"
        }.`;
      }

      case "bookAppointment": {
        console.log("[VOICE_BOOKING] tool call received");

        if (!effectiveSessionToken) {
          console.warn("[VOICE_BOOKING_ERROR] Missing session token");
          return "UNAUTHORIZED: Missing session token. User must be logged in to book an appointment.";
        }

        const tokenPayload = await verifyVapiVoiceToken(effectiveSessionToken);
        if (!tokenPayload) {
          console.warn("[VOICE_BOOKING_ERROR] Invalid or expired session token");
          return "UNAUTHORIZED: Invalid or expired voice session token. Cannot complete booking.";
        }
        console.log("[VOICE_BOOKING] session token verified");

        // CRITICAL SECURITY: Identity is extracted directly from verified tokenPayload, NEVER from client arguments
        const user = await prisma.user.findUnique({
          where: { id: tokenPayload.userId },
        });

        if (!user) {
          console.warn("[VOICE_BOOKING_ERROR] User not found in database for ID:", tokenPayload.userId);
          return "UNAUTHORIZED: Verified user account not found in database.";
        }
        console.log("[VOICE_BOOKING] user resolved");

        const rawDate = args.date || args.appointmentDate || args.requestedDate;
        const rawTime = args.time || args.appointmentTime || args.slot;
        const doctorId = args.doctorId || args.doctor_id;
        const doctorName = args.doctorName || args.doctor_name || args.doctor;
        const reason = args.reason || args.appointmentType || args.type || args.notes;

        if (!rawDate || !rawTime) {
          console.warn("[VOICE_BOOKING_ERROR] Missing date or time parameter", { rawDate, rawTime });
          return "Date and time are required to book an appointment.";
        }

        const doctor = await resolveDoctor(doctorId, doctorName);
        if (!doctor) {
          console.warn("[VOICE_BOOKING_ERROR] Doctor resolution failed for:", { doctorId, doctorName });
          return "Doctor not found. Please select a valid doctor.";
        }
        console.log("[VOICE_BOOKING] doctor resolved:", doctor.name);

        const appointmentDate = parseAppointmentDate(rawDate);
        if (!appointmentDate) {
          console.warn("[VOICE_BOOKING_ERROR] Invalid date format:", rawDate);
          return "Invalid date format.";
        }

        const normalizedTime = normalizeTimeSlot(rawTime);

        // Double booking conflict check
        const existingBooking = await prisma.appointment.findFirst({
          where: {
            doctorId: doctor.id,
            date: appointmentDate,
            time: normalizedTime,
            status: { in: ["CONFIRMED", "COMPLETED"] },
          },
        });

        if (existingBooking) {
          console.warn("[VOICE_BOOKING_ERROR] Conflict detected for slot:", normalizedTime);
          return `Booking failed: Slot ${normalizedTime} on ${rawDate} for ${doctor.name} was just taken by another patient. Please choose an alternative slot.`;
        }
        console.log("[VOICE_BOOKING] conflict check completed");

        console.log("[VOICE_BOOKING] creating appointment");
        // Create appointment in database for verified user
        const appointment = await prisma.appointment.create({
          data: {
            userId: user.id,
            doctorId: doctor.id,
            date: appointmentDate,
            time: normalizedTime,
            reason: reason || "Voice AI Consultation",
            status: "CONFIRMED",
          },
          include: {
            user: true,
            doctor: true,
          },
        });
        console.log("[VOICE_BOOKING] appointment created:", appointment.id);

        // Send confirmation email asynchronously without blocking the Vapi webhook response
        const formattedDateStr = format(appointmentDate, "EEEE, MMMM d, yyyy");
        resend.emails
          .send({
            from: "SmileSync AI <no-reply@resend.dev>",
            to: [user.email],
            subject: "Appointment Confirmation - SmileSync AI",
            react: AppointmentConfirmationEmail({
              doctorName: doctor.name,
              appointmentDate: formattedDateStr,
              appointmentTime: normalizedTime,
              appointmentType: reason || "Voice AI Consultation",
              duration: "30 min",
              price: "$90",
            }),
          })
          .catch((emailErr) => {
            console.error("[VOICE_BOOKING_ERROR] Error sending confirmation email:", emailErr?.message);
          });

        console.log("[VOICE_BOOKING] returning Vapi result");
        return `SUCCESS: Your appointment has been successfully booked for ${formattedDateStr} at ${normalizedTime} with ${doctor.name}. A confirmation email has been sent to ${user.email}.`;
      }

      default:
        return `Unknown tool function: ${functionName}`;
    }
  } catch (err: any) {
    console.error(`[VOICE_BOOKING_ERROR] Error executing tool ${functionName}:`, err?.message, err?.stack);
    return `Error processing request: ${err?.message || "Internal error"}`;
  }
}

async function resolveDoctor(doctorId?: string, doctorName?: string) {
  if (doctorId) {
    const doc = await prisma.doctor.findUnique({ where: { id: doctorId } });
    if (doc) return doc;
  }

  if (doctorName) {
    let doc = await prisma.doctor.findFirst({
      where: {
        name: { contains: doctorName, mode: "insensitive" },
        isActive: true,
      },
    });
    if (doc) return doc;

    const cleanedName = doctorName.replace(/^(dr\.?|doctor)\s+/i, "").trim();
    if (cleanedName) {
      doc = await prisma.doctor.findFirst({
        where: {
          name: { contains: cleanedName, mode: "insensitive" },
          isActive: true,
        },
      });
      if (doc) return doc;
    }
  }

  // Default to first active doctor
  return prisma.doctor.findFirst({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });
}

function parseAppointmentDate(dateInput: any): Date | null {
  if (!dateInput) return null;
  if (dateInput instanceof Date) {
    return isNaN(dateInput.getTime()) ? null : dateInput;
  }
  if (typeof dateInput !== "string") return null;

  const trimmed = dateInput.trim();

  // If already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const d = new Date(`${trimmed}T00:00:00.000Z`);
    return isNaN(d.getTime()) ? null : d;
  }

  // Parse generic date strings (e.g. "September 4, 2026") in UTC
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    const year = parsed.getUTCFullYear();
    const month = String(parsed.getUTCMonth() + 1).padStart(2, "0");
    const day = String(parsed.getUTCDate()).padStart(2, "0");
    return new Date(`${year}-${month}-${day}T00:00:00.000Z`);
  }

  return null;
}

function normalizeTimeSlot(timeInput: any): string {
  if (!timeInput || typeof timeInput !== "string") return timeInput || "";
  const trimmed = timeInput.trim();

  // If HH:mm format (e.g. "16:00" or "09:30")
  if (/^\d{2}:\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  // If H:mm format (e.g. "9:30")
  if (/^\d{1}:\d{2}$/.test(trimmed)) {
    return `0${trimmed}`;
  }

  // Handle 12-hour format like "4:00 PM", "4:00pm", "4 PM", "9:00 AM"
  const match = trimmed.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM|am|pm)?$/i);
  if (match) {
    let hours = parseInt(match[1], 10);
    const minutes = match[2] || "00";
    const modifier = match[3]?.toUpperCase();

    if (modifier === "PM" && hours < 12) {
      hours += 12;
    } else if (modifier === "AM" && hours === 12) {
      hours = 0;
    }

    const formattedHours = String(hours).padStart(2, "0");
    return `${formattedHours}:${minutes}`;
  }

  return trimmed;
}

