import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import StaffNavbar from "@/components/StaffNavbar";
import DoctorsManagement from "@/components/admin/DoctorsManagement";

export default async function StaffDoctorsPage() {
  const user = await currentUser();

  // Redirect unauthenticated users to home/login
  if (!user) redirect("/");

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

  // Security guard: Normal patients are strictly prohibited from accessing Staff Dentist Management
  if (!isAuthorized) {
    redirect("/dashboard");
  }

  return (
    <>
      <StaffNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pt-20 sm:pt-24 space-y-6 overflow-x-hidden">
        <div className="border-b border-border/40 pb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Staff Dentist Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Add, update, and manage dental professionals available for patient
            booking. Updates take effect immediately on the appointment booking
            page.
          </p>
        </div>

        <DoctorsManagement />
      </main>
    </>
  );
}
