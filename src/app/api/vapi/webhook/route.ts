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

    // Extract Vapi session token from call variables
    const sessionToken =
      message.call?.assistantOverrides?.variableValues?.sessionToken ||
      message.call?.artifact?.variableValues?.sessionToken ||
      body.sessionToken;

    // Handle tool-calls format vs function-call format
    const isToolCallsFormat = message.type === "tool-calls";
    const toolCalls = isToolCallsFormat ? message.toolCalls || [] : [];
    const functionCall = message.type === "function-call" ? message.functionCall : null;

    if (!isToolCallsFormat && !functionCall) {
      // If it's another Vapi status message (like call-start, end-of-call-report), return 200 OK
      return NextResponse.json({ status: "ignored", messageType: message.type }, { status: 200 });
    }

    // Process tool calls
    if (isToolCallsFormat) {
      const results = [];

      for (const toolCall of toolCalls) {
        const functionName = toolCall.function?.name;
        let rawArgs = toolCall.function?.arguments;
        
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
        results.push({
          toolCallId: toolCall.id,
          result: result,
        });
      }

      return NextResponse.json({ results }, { status: 200 });
    } else if (functionCall) {
      const functionName = functionCall.name;
      const args = functionCall.parameters || {};
      const result = await handleToolExecution(functionName, args, sessionToken);

      return NextResponse.json({ result }, { status: 200 });
    }

    return NextResponse.json({ error: "Unhandled tool format" }, { status: 400 });
  } catch (error: any) {
    console.error("Vapi webhook handler error:", error);
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}

async function handleToolExecution(
  functionName: string,
  args: any,
  sessionToken?: string
): Promise<string> {
  try {
    switch (functionName) {
      case "getAvailableDoctors": {
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
        if (!sessionToken) {
          return "UNAUTHORIZED: Missing session token. User must be logged in to check appointment availability.";
        }

        const tokenPayload = await verifyVapiVoiceToken(sessionToken);
        if (!tokenPayload) {
          return "UNAUTHORIZED: Invalid or expired voice session token. Please re-authenticate.";
        }

        const { date, time, doctorId, doctorName } = args;

        if (!date) {
          return "Please specify the date for the appointment (format: YYYY-MM-DD).";
        }

        // Resolve doctor
        const doctor = await resolveDoctor(doctorId, doctorName);
        if (!doctor) {
          return "Doctor not found. Please pick an active doctor.";
        }

        const requestedDate = new Date(date);
        if (isNaN(requestedDate.getTime())) {
          return "Invalid date format. Please provide date in YYYY-MM-DD format.";
        }

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

        if (time) {
          if (bookedSlots.includes(time)) {
            return `Slot ${time} on ${date} for ${doctor.name} is UNAVAILABLE (already booked). Available open time slots for this date are: ${
              openSlots.length > 0 ? openSlots.join(", ") : "None"
            }. Please offer these available slots to the user.`;
          }

          if (!allSlots.includes(time)) {
            return `Slot ${time} is outside clinic hours. Available time slots are: ${openSlots.join(", ")}.`;
          }

          return `Slot ${time} on ${date} for ${doctor.name} is AVAILABLE. Summarize the appointment details to the user and ask for explicit confirmation before booking.`;
        }

        return `Available time slots for ${doctor.name} on ${date} are: ${
          openSlots.length > 0 ? openSlots.join(", ") : "No slots available"
        }.`;
      }

      case "bookAppointment": {
        if (!sessionToken) {
          return "UNAUTHORIZED: Missing session token. User must be logged in to book an appointment.";
        }

        const tokenPayload = await verifyVapiVoiceToken(sessionToken);
        if (!tokenPayload) {
          return "UNAUTHORIZED: Invalid or expired voice session token. Cannot complete booking.";
        }

        // CRITICAL SECURITY: Identity is extracted directly from verified tokenPayload, NEVER from client arguments
        const user = await prisma.user.findUnique({
          where: { id: tokenPayload.userId },
        });

        if (!user) {
          return "UNAUTHORIZED: Verified user account not found in database.";
        }

        const { date, time, doctorId, doctorName, reason } = args;

        if (!date || !time) {
          return "Date and time are required to book an appointment.";
        }

        const doctor = await resolveDoctor(doctorId, doctorName);
        if (!doctor) {
          return "Doctor not found. Please select a valid doctor.";
        }

        const appointmentDate = new Date(date);
        if (isNaN(appointmentDate.getTime())) {
          return "Invalid date format.";
        }

        // Double booking conflict check
        const existingBooking = await prisma.appointment.findFirst({
          where: {
            doctorId: doctor.id,
            date: appointmentDate,
            time: time,
            status: { in: ["CONFIRMED", "COMPLETED"] },
          },
        });

        if (existingBooking) {
          return `Booking failed: Slot ${time} on ${date} for ${doctor.name} was just taken by another patient. Please choose an alternative slot.`;
        }

        // Create appointment in database for verified user
        const appointment = await prisma.appointment.create({
          data: {
            userId: user.id,
            doctorId: doctor.id,
            date: appointmentDate,
            time: time,
            reason: reason || "Voice AI Consultation",
            status: "CONFIRMED",
          },
          include: {
            user: true,
            doctor: true,
          },
        });

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
              appointmentTime: time,
              appointmentType: reason || "Voice AI Consultation",
              duration: "30 min",
              price: "$90",
            }),
          })
          .catch((emailErr) => {
            console.error("Error sending voice booking confirmation email:", emailErr);
          });

        return `SUCCESS: Your appointment has been successfully booked for ${formattedDateStr} at ${time} with ${doctor.name}. A confirmation email has been sent to ${user.email}.`;
      }

      default:
        return `Unknown tool function: ${functionName}`;
    }
  } catch (err: any) {
    console.error(`Error executing tool ${functionName}:`, err);
    return `Error processing request: ${err?.message || "Internal error"}`;
  }
}

async function resolveDoctor(doctorId?: string, doctorName?: string) {
  if (doctorId) {
    const doc = await prisma.doctor.findUnique({ where: { id: doctorId } });
    if (doc) return doc;
  }

  if (doctorName) {
    const doc = await prisma.doctor.findFirst({
      where: {
        name: { contains: doctorName, mode: "insensitive" },
        isActive: true,
      },
    });
    if (doc) return doc;
  }

  // Default to first active doctor
  return prisma.doctor.findFirst({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });
}
