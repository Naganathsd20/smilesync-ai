import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { syncUser } from "@/lib/actions/users";

interface PageProps {
  searchParams: Promise<{ portal?: string }>;
}

export default async function PortalRedirectPage({ searchParams }: PageProps) {
  const user = await currentUser();

  // Ensure Clerk user is synchronized with local database
  await syncUser();

  if (!user) {
    redirect("/portal-select");
  }

  const { portal } = await searchParams;

  const userEmail = user.emailAddresses[0]?.emailAddress?.toLowerCase();
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
  const staffEmails = (process.env.STAFF_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const role =
    (user.publicMetadata?.role as string) ||
    (user.unsafeMetadata?.role as string);

  const isAuthorizedStaff =
    (adminEmail && userEmail === adminEmail) ||
    (userEmail && staffEmails.includes(userEmail)) ||
    role === "admin" ||
    role === "staff" ||
    role === "doctor";

  // If user requested Staff portal access
  if (portal === "staff") {
    if (isAuthorizedStaff) {
      redirect("/staff");
    } else {
      // Security enforcement: Unauthorized patient trying to enter staff portal gets safely sent to patient dashboard
      redirect("/dashboard?error=unauthorized_staff_attempt");
    }
  }

  // Default / Patient choice
  redirect("/dashboard");
}
