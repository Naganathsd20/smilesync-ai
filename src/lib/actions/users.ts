"use server";

import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "../prisma";
import { PatientGender } from "@prisma/client";

export async function syncUser() {
  try {
    const user = await currentUser();
    if (!user) return;

    const existingUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });
    if (existingUser) return existingUser;

    const dbUser = await prisma.user.create({
      data: {
        clerkId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.emailAddresses[0].emailAddress,
        phone: user.phoneNumbers[0]?.phoneNumber,
      },
    });

    return dbUser;
  } catch (error) {
    console.log("Error in syncUser server action", error);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PATIENT PROFILE — always resolved server-side via Clerk clerkId
// ─────────────────────────────────────────────────────────────────────────────

export async function getMyProfile() {
  const clerkUser = await currentUser();
  if (!clerkUser) throw new Error("Unauthenticated. Please sign in.");

  try {
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        age: true,
        gender: true,
        address: true,
        city: true,
        state: true,
        pincode: true,
        createdAt: true,
      },
    });

    if (!dbUser)
      throw new Error(
        "User record not found. Please try signing out and back in.",
      );

    return {
      ...dbUser,
      clerkEmail: clerkUser.emailAddresses[0]?.emailAddress ?? dbUser.email,
    };
  } catch (error: any) {
    console.error("Error in getMyProfile:", error);
    throw new Error(
      error?.message || "Database connection error. Please try again.",
    );
  }
}

export interface UpdateProfileData {
  firstName: string;
  lastName: string;
  phone: string;
  age: number | null;
  gender: PatientGender | null;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

export async function updateMyProfile(data: UpdateProfileData) {
  // 1. Authenticate via Clerk — NEVER trust a userId from the client
  const clerkUser = await currentUser();
  if (!clerkUser) throw new Error("Unauthenticated. Please sign in.");

  // 2. Resolve the authenticated user in our DB by clerkId
  const dbUser = await prisma.user.findUnique({
    where: { clerkId: clerkUser.id },
    select: { id: true },
  });
  if (!dbUser) throw new Error("User record not found.");

  // 3. Server-side field validation
  const errors: string[] = [];

  if (!data.firstName?.trim()) errors.push("First name is required.");
  if (data.firstName && data.firstName.trim().length > 100)
    errors.push("First name is too long.");
  if (data.lastName && data.lastName.trim().length > 100)
    errors.push("Last name is too long.");

  // Phone: must be blank OR a valid Indian +91 10-digit number
  if (data.phone) {
    const phoneDigits = data.phone.replace(/\D/g, "");
    const isValid10 = phoneDigits.length === 10;
    const isValid12 = phoneDigits.length === 12 && phoneDigits.startsWith("91");
    if (!isValid10 && !isValid12) {
      errors.push(
        "Phone must be a valid 10-digit Indian mobile number (e.g. +91 98765 43210).",
      );
    }
  }

  // Age: must be a whole number in a reasonable range if provided
  if (data.age !== null && data.age !== undefined) {
    if (
      !Number.isInteger(Number(data.age)) ||
      Number(data.age) < 1 ||
      Number(data.age) > 120
    ) {
      errors.push("Age must be a whole number between 1 and 120.");
    }
  }

  // Pincode: must be exactly 6 digits if provided
  if (data.pincode) {
    if (!/^\d{6}$/.test(data.pincode.trim())) {
      errors.push("Pincode must be exactly 6 digits (e.g. 400001).");
    }
  }

  if (errors.length > 0) throw new Error(errors.join(" "));

  // 4. Normalise phone: always store as +91XXXXXXXXXX
  let storedPhone: string | null = null;
  if (data.phone) {
    const digits = data.phone.replace(/\D/g, "");
    const core =
      digits.length === 12 && digits.startsWith("91")
        ? digits.slice(2)
        : digits;
    storedPhone = `+91${core}`;
  }

  // 5. Update ONLY the authenticated user's own record
  await prisma.user.update({
    where: { id: dbUser.id },
    data: {
      firstName: data.firstName?.trim() || null,
      lastName: data.lastName?.trim() || null,
      phone: storedPhone,
      age:
        data.age !== null && data.age !== undefined ? Number(data.age) : null,
      gender: data.gender ?? null,
      address: data.address?.trim() || null,
      city: data.city?.trim() || null,
      state: data.state?.trim() || null,
      pincode: data.pincode?.trim() || null,
    },
  });

  return { success: true };
}
