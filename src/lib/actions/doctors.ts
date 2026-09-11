"use server";

import { Gender } from "@prisma/client";
import { prisma } from "../prisma";
import { generateAvatar } from "../utils";
import { revalidatePath } from "next/cache";
import { currentUser } from "@clerk/nextjs/server";

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

export async function getDoctors() {
  try {
    const doctors = await prisma.doctor.findMany({
      include: {
        _count: { select: { appointments: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return doctors.map((doctor) => ({
      ...doctor,
      appointmentCount: doctor._count.appointments,
    }));
  } catch (error) {
    console.error("Error fetching doctors:", error);
    return [];
  }
}

interface CreateDoctorInput {
  name: string;
  email: string;
  phone: string;
  speciality: string;
  gender: Gender;
  isActive: boolean;
  bio?: string;
  imageUrl?: string;
}

export async function createDoctor(input: CreateDoctorInput) {
  try {
    await checkStaffOrAdminAuth();

    if (!input.name || !input.email || !input.speciality) {
      throw new Error("Name, email, and speciality are required");
    }

    const doctor = await prisma.doctor.create({
      data: {
        name: input.name,
        email: input.email,
        phone: input.phone || "",
        speciality: input.speciality,
        gender: input.gender || "MALE",
        isActive: input.isActive ?? true,
        bio: input.bio || null,
        imageUrl:
          input.imageUrl || generateAvatar(input.name, input.gender || "MALE"),
      },
    });

    revalidatePath("/admin");
    revalidatePath("/staff/doctors");
    revalidatePath("/appointments");

    return doctor;
  } catch (error: any) {
    console.error("Error creating doctor:", error);

    if (error?.code === "P2002") {
      throw new Error("A doctor with this email already exists");
    }

    throw new Error(error?.message || "Failed to create doctor");
  }
}

interface UpdateDoctorInput extends Partial<CreateDoctorInput> {
  id: string;
  imageUrl?: string;
}

export async function updateDoctor(input: UpdateDoctorInput) {
  try {
    await checkStaffOrAdminAuth();

    if (!input.name || !input.email) {
      throw new Error("Name and email are required");
    }

    const currentDoctor = await prisma.doctor.findUnique({
      where: { id: input.id },
      select: { email: true },
    });

    if (!currentDoctor) throw new Error("Doctor not found");

    if (input.email !== currentDoctor.email) {
      const existingDoctor = await prisma.doctor.findUnique({
        where: { email: input.email },
      });

      if (existingDoctor) {
        throw new Error("A doctor with this email already exists");
      }
    }

    const doctor = await prisma.doctor.update({
      where: { id: input.id },
      data: {
        name: input.name,
        email: input.email,
        phone: input.phone,
        speciality: input.speciality,
        gender: input.gender,
        isActive: input.isActive,
        bio: input.bio,
        ...(input.imageUrl !== undefined && { imageUrl: input.imageUrl }),
      },
    });

    revalidatePath("/admin");
    revalidatePath("/staff/doctors");
    revalidatePath("/appointments");

    return doctor;
  } catch (error: any) {
    console.error("Error updating doctor:", error);
    throw new Error(error?.message || "Failed to update doctor");
  }
}

export async function toggleDoctorStatus(doctorId: string, isActive: boolean) {
  try {
    await checkStaffOrAdminAuth();

    const doctor = await prisma.doctor.update({
      where: { id: doctorId },
      data: { isActive },
    });

    revalidatePath("/admin");
    revalidatePath("/staff/doctors");
    revalidatePath("/appointments");

    return doctor;
  } catch (error: any) {
    console.error("Error toggling doctor status:", error);
    throw new Error(error?.message || "Failed to toggle doctor status");
  }
}

export async function deleteDoctor(doctorId: string) {
  try {
    await checkStaffOrAdminAuth();

    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      include: {
        _count: { select: { appointments: true } },
      },
    });

    if (!doctor) throw new Error("Doctor not found");

    // Safety check: If doctor has existing appointments, deactivate instead of deleting
    if (doctor._count.appointments > 0) {
      const updated = await prisma.doctor.update({
        where: { id: doctorId },
        data: { isActive: false },
      });

      revalidatePath("/admin");
      revalidatePath("/staff/doctors");
      revalidatePath("/appointments");

      return {
        success: true,
        deactivated: true,
        message:
          "Doctor has existing appointments; safely deactivated to preserve historical records.",
        doctor: updated,
      };
    }

    // No existing appointments: hard delete safe
    await prisma.doctor.delete({
      where: { id: doctorId },
    });

    revalidatePath("/admin");
    revalidatePath("/staff/doctors");
    revalidatePath("/appointments");

    return {
      success: true,
      deactivated: false,
      message: "Doctor deleted successfully.",
    };
  } catch (error: any) {
    console.error("Error deleting doctor:", error);
    throw new Error(error?.message || "Failed to delete doctor");
  }
}

export async function getAvailableDoctors() {
  try {
    const doctors = await prisma.doctor.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { appointments: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return doctors.map((doctor) => ({
      ...doctor,
      appointmentCount: doctor._count.appointments,
    }));
  } catch (error) {
    console.error("Error fetching available doctors:", error);
    return [];
  }
}
