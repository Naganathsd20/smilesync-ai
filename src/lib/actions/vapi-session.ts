"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "../prisma";
import crypto from "crypto";

const SECRET_KEY =
  process.env.CLERK_SECRET_KEY || "smilesync-fallback-secret-key";

export interface VapiSessionPayload {
  userId: string; // Prisma user ID
  clerkId: string; // Clerk user ID
  exp: number; // Expiration timestamp in seconds
}

export async function getVapiVoiceToken() {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("User must be logged in to start a voice session");
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!dbUser) {
      throw new Error("User profile not found in database");
    }

    const payload: VapiSessionPayload = {
      userId: dbUser.id,
      clerkId: userId,
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiration
    };

    const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString(
      "base64url",
    );
    const signature = crypto
      .createHmac("sha256", SECRET_KEY)
      .update(payloadBase64)
      .digest("base64url");

    const token = `${payloadBase64}.${signature}`;

    return {
      token,
      userName: dbUser.firstName || "Patient",
      userEmail: dbUser.email,
    };
  } catch (error: any) {
    console.error("Error generating Vapi voice token:", error);
    return null;
  }
}

export async function verifyVapiVoiceToken(
  token: string,
): Promise<VapiSessionPayload | null> {
  try {
    if (!token || typeof token !== "string") return null;

    const parts = token.split(".");
    if (parts.length !== 2) return null;

    const [payloadBase64, providedSignature] = parts;

    // Verify signature
    const expectedSignature = crypto
      .createHmac("sha256", SECRET_KEY)
      .update(payloadBase64)
      .digest("base64url");

    const providedBuffer = Buffer.from(providedSignature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (providedBuffer.length !== expectedBuffer.length) {
      return null;
    }

    if (!crypto.timingSafeEqual(providedBuffer, expectedBuffer)) {
      return null;
    }

    // Decode payload
    const payloadJson = Buffer.from(payloadBase64, "base64url").toString(
      "utf8",
    );
    const payload: VapiSessionPayload = JSON.parse(payloadJson);

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      console.warn("Vapi voice session token has expired");
      return null;
    }

    return payload;
  } catch (error) {
    console.error("Error verifying Vapi voice token:", error);
    return null;
  }
}
