import { checkStaffOrAdminAuth } from "@/lib/actions/doctors";
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(req: Request) {
  try {
    // Server-side authorization check (Staff/Admin only)
    await checkStaffOrAdminAuth();

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No image file provided." },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
      return NextResponse.json(
        {
          error:
            "Invalid file format. Please upload a JPG, JPEG, PNG, or WebP image.",
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Image file size exceeds the 5 MB limit." },
        { status: 400 }
      );
    }

    // Prepare destination directory: public/uploads/doctors
    const uploadDir = path.join(process.cwd(), "public", "uploads", "doctors");
    await fs.mkdir(uploadDir, { recursive: true });

    // Generate safe unique filename
    const ext = file.name.split(".").pop()?.toLowerCase() || "png";
    const filename = `doc-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const filePath = path.join(uploadDir, filename);

    // Save file buffer to local disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await fs.writeFile(filePath, buffer);

    const imageUrl = `/uploads/doctors/${filename}`;

    return NextResponse.json({
      success: true,
      imageUrl,
    });
  } catch (error: any) {
    console.error("Doctor image upload error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to upload dentist image." },
      { status: error?.message?.includes("Unauthorized") || error?.message?.includes("Forbidden") ? 403 : 500 }
    );
  }
}
