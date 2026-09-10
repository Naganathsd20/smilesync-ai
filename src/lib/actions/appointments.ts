"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "../prisma";
import { AppointmentStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function checkStaffOrAdminAuth() {
  const user = await currentUser();
  if (!user) {
    throw new Error("Unauthorized access. Please log in.");
  }

  const userEmail = user.emailAddresses[0]?.emailAddress?.toLowerCase();
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
  const staffEmails = (process.env.STAFF_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const role =
    (user.publicMetadata?.role as string) ||
    (user.unsafeMetadata?.role as string);

  const isAuthorized =
    (adminEmail && userEmail === adminEmail) ||
    (userEmail && staffEmails.includes(userEmail)) ||
    role === "admin" ||
    role === "staff" ||
    role === "doctor";

  if (!isAuthorized) {
    throw new Error("Forbidden. Staff or Admin authorization required.");
  }

  return user;
}

function transformAppointment(appointment: any) {
  return {
    ...appointment,
    patientName: `${appointment.user.firstName || ""} ${appointment.user.lastName || ""}`.trim() || "Patient",
    patientEmail: appointment.user.email,
    patientPhone: appointment.user.phone || "N/A",
    doctorName: appointment.doctor.name,
    doctorSpeciality: appointment.doctor.speciality,
    doctorImageUrl: appointment.doctor.imageUrl || "",
    date: appointment.date.toISOString().split("T")[0],
  };
}

export async function getAppointments() {
  try {
    await checkStaffOrAdminAuth();

    const appointments = await prisma.appointment.findMany({
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        doctor: { select: { name: true, speciality: true, imageUrl: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return appointments.map(transformAppointment);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    throw new Error("Failed to fetch appointments");
  }
}

export async function getUserAppointments() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("You must be logged in to view appointments");

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) throw new Error("User not found. Please ensure your account is properly set up.");

    const appointments = await prisma.appointment.findMany({
      where: { userId: user.id },
      include: {
        user: { select: { firstName: true, lastName: true, email: true, phone: true } },
        doctor: { select: { name: true, speciality: true, imageUrl: true } },
      },
      orderBy: [{ date: "asc" }, { time: "asc" }],
    });

    return appointments.map(transformAppointment);
  } catch (error) {
    console.error("Error fetching user appointments:", error);
    throw new Error("Failed to fetch user appointments");
  }
}

export async function getUserAppointmentStats() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("You must be authenticated");

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) throw new Error("User not found");

    const [totalCount, completedCount] = await Promise.all([
      prisma.appointment.count({
        where: { userId: user.id },
      }),
      prisma.appointment.count({
        where: {
          userId: user.id,
          status: "COMPLETED",
        },
      }),
    ]);

    return {
      totalAppointments: totalCount,
      completedAppointments: completedCount,
    };
  } catch (error) {
    console.error("Error fetching user appointment stats:", error);
    return { totalAppointments: 0, completedAppointments: 0 };
  }
}

export async function getBookedTimeSlots(doctorId: string, date: string) {
  try {
    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId,
        date: new Date(date),
        status: {
          in: ["CONFIRMED", "COMPLETED"],
        },
      },
      select: { time: true },
    });

    return appointments.map((appointment) => appointment.time);
  } catch (error) {
    console.error("Error fetching booked time slots:", error);
    return [];
  }
}

interface BookAppointmentInput {
  doctorId: string;
  date: string;
  time: string;
  reason?: string;
}

export async function bookAppointment(input: BookAppointmentInput) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("You must be logged in to book an appointment");

    if (!input.doctorId || !input.date || !input.time) {
      throw new Error("Doctor, date, and time are required");
    }

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) throw new Error("User not found. Please ensure your account is properly set up.");

    const appointment = await prisma.appointment.create({
      data: {
        userId: user.id,
        doctorId: input.doctorId,
        date: new Date(input.date),
        time: input.time,
        reason: input.reason || "General consultation",
        status: "CONFIRMED",
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        doctor: { select: { name: true, speciality: true, imageUrl: true } },
      },
    });

    revalidatePath("/staff");
    revalidatePath("/staff/appointments");
    revalidatePath("/appointments");

    return transformAppointment(appointment);
  } catch (error) {
    console.error("Error booking appointment:", error);
    throw new Error("Failed to book appointment. Please try again later.");
  }
}

export async function updateAppointmentStatus(input: { id: string; status: AppointmentStatus }) {
  try {
    await checkStaffOrAdminAuth();

    const appointment = await prisma.appointment.update({
      where: { id: input.id },
      data: { status: input.status },
    });

    revalidatePath("/staff");
    revalidatePath("/staff/appointments");
    revalidatePath("/appointments");

    return appointment;
  } catch (error: any) {
    console.error("Error updating appointment:", error);
    throw new Error(error?.message || "Failed to update appointment");
  }
}

export async function getStaffDashboardMetrics() {
  try {
    await checkStaffOrAdminAuth();

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const [todaysCount, upcomingCount, totalPatientsCount, activeDentistsCount, todaysAppointments] =
      await Promise.all([
        prisma.appointment.count({
          where: {
            date: {
              gte: todayStart,
              lte: todayEnd,
            },
          },
        }),
        prisma.appointment.count({
          where: {
            date: {
              gte: todayStart,
            },
            status: "CONFIRMED",
          },
        }),
        prisma.user.count(),
        prisma.doctor.count({
          where: { isActive: true },
        }),
        prisma.appointment.findMany({
          where: {
            date: {
              gte: todayStart,
              lte: todayEnd,
            },
          },
          include: {
            user: { select: { firstName: true, lastName: true, email: true, phone: true } },
            doctor: { select: { name: true, speciality: true, imageUrl: true } },
          },
          orderBy: { time: "asc" },
        }),
      ]);

    return {
      todaysAppointmentsCount: todaysCount,
      upcomingAppointmentsCount: upcomingCount,
      totalPatientsCount,
      activeDentistsCount,
      todaysAppointments: todaysAppointments.map(transformAppointment),
    };
  } catch (error: any) {
    console.error("Error fetching staff dashboard metrics:", error);
    throw new Error(error?.message || "Failed to fetch staff metrics");
  }
}

export async function getStaffPatients() {
  try {
    await checkStaffOrAdminAuth();

    const users = await prisma.user.findMany({
      include: {
        appointments: {
          orderBy: { date: "desc" },
          take: 5,
          include: {
            doctor: { select: { name: true } },
          },
        },
        _count: { select: { appointments: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return users.map((user) => {
      const appointments = user.appointments || [];
      const upcoming = appointments.find(
        (a) => a.status === "CONFIRMED" && new Date(a.date) >= todayStart
      );
      const last = appointments.find((a) => new Date(a.date) < todayStart || a.status === "COMPLETED");

      return {
        id: user.id,
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Valued Patient",
        email: user.email,
        phone: user.phone || "Not provided",
        appointmentCount: user._count.appointments,
        createdAt: user.createdAt,
        lastAppointment: last
          ? {
              date: last.date.toISOString().split("T")[0],
              doctorName: last.doctor.name,
              status: last.status,
            }
          : null,
        upcomingAppointment: upcoming
          ? {
              date: upcoming.date.toISOString().split("T")[0],
              time: upcoming.time,
              doctorName: upcoming.doctor.name,
            }
          : null,
      };
    });
  } catch (error: any) {
    console.error("Error fetching staff patients:", error);
    throw new Error(error?.message || "Failed to fetch clinic patients");
  }
}