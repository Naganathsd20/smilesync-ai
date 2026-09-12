import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import StaffNavbar from "@/components/StaffNavbar";
import { getAppointments } from "@/lib/actions/appointments";
import StaffAppointmentsClient from "./StaffAppointmentsClient";

export default async function StaffAppointmentsPage() {
  const user = await currentUser();

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

  if (!isAuthorized) {
    redirect("/dashboard");
  }

  let appointments: any[] = [];
  try {
    appointments = await getAppointments();
  } catch (err) {
    console.error("Failed to load appointments for staff:", err);
  }

  return (
    <>
      <StaffNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pt-20 sm:pt-24 space-y-6 overflow-x-hidden">
        <div className="border-b border-border/40 pb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Clinic Appointments
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            View, search, and update appointment statuses across all clinic
            patient bookings.
          </p>
        </div>

        <StaffAppointmentsClient initialAppointments={appointments} />
      </main>
    </>
  );
}
