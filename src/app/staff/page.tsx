import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import StaffNavbar from "@/components/StaffNavbar";
import {
  getStaffDashboardMetrics,
  updateAppointmentStatus,
} from "@/lib/actions/appointments";
import {
  CalendarCheckIcon,
  CalendarIcon,
  ClockIcon,
  StethoscopeIcon,
  UsersIcon,
  ArrowRightIcon,
  CheckCircle2Icon,
} from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function StaffDashboardPage() {
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

  // Security guard: Normal patients strictly redirected
  if (!isAuthorized) {
    redirect("/dashboard");
  }

  let metrics;
  try {
    metrics = await getStaffDashboardMetrics();
  } catch (err) {
    console.error("Failed to load staff metrics:", err);
    metrics = {
      todaysAppointmentsCount: 0,
      upcomingAppointmentsCount: 0,
      totalPatientsCount: 0,
      activeDentistsCount: 0,
      todaysAppointments: [],
    };
  }

  return (
    <>
      <StaffNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pt-24 space-y-8">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border/40 pb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 ring-1 ring-emerald-500/20">
                <StethoscopeIcon className="w-5 h-5" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                Staff Dashboard
              </h1>
            </div>
            <p className="text-sm text-muted-foreground mt-1.5 max-w-2xl leading-relaxed">
              Manage clinic appointments, patients, dentists and availability.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1.5 shrink-0 font-medium">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Clinic Operations Data
          </div>
        </div>

        {/* OVERVIEW METRICS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* TODAY'S APPOINTMENTS */}
          <Card className="border-border/50 bg-card hover:shadow-md transition-shadow">
            <CardHeader className="pb-2 pt-5 px-5">
              <CardDescription className="text-xs flex items-center justify-between text-muted-foreground font-medium">
                <span>Today&apos;s Appointments</span>
                <div className="w-7 h-7 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <CalendarCheckIcon className="w-3.5 h-3.5 text-emerald-500" />
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent className="px-5 pb-5 pt-1 space-y-1">
              <p className="text-3xl font-black tabular-nums text-foreground">
                {metrics.todaysAppointmentsCount}
              </p>
              <p className="text-xs text-muted-foreground">
                Scheduled for today
              </p>
            </CardContent>
          </Card>

          {/* UPCOMING APPOINTMENTS */}
          <Card className="border-border/50 bg-card hover:shadow-md transition-shadow">
            <CardHeader className="pb-2 pt-5 px-5">
              <CardDescription className="text-xs flex items-center justify-between text-muted-foreground font-medium">
                <span>Upcoming Confirmed</span>
                <div className="w-7 h-7 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <CalendarIcon className="w-3.5 h-3.5 text-blue-500" />
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent className="px-5 pb-5 pt-1 space-y-1">
              <p className="text-3xl font-black tabular-nums text-foreground">
                {metrics.upcomingAppointmentsCount}
              </p>
              <p className="text-xs text-muted-foreground">
                Future confirmed visits
              </p>
            </CardContent>
          </Card>

          {/* TOTAL PATIENTS */}
          <Card className="border-border/50 bg-card hover:shadow-md transition-shadow">
            <CardHeader className="pb-2 pt-5 px-5">
              <CardDescription className="text-xs flex items-center justify-between text-muted-foreground font-medium">
                <span>Total Patients</span>
                <div className="w-7 h-7 rounded-full bg-cyan-500/10 flex items-center justify-center">
                  <UsersIcon className="w-3.5 h-3.5 text-cyan-500" />
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent className="px-5 pb-5 pt-1 space-y-1">
              <p className="text-3xl font-black tabular-nums text-foreground">
                {metrics.totalPatientsCount}
              </p>
              <p className="text-xs text-muted-foreground">
                Registered clinic accounts
              </p>
            </CardContent>
          </Card>

          {/* ACTIVE DENTISTS */}
          <Card className="border-border/50 bg-card hover:shadow-md transition-shadow">
            <CardHeader className="pb-2 pt-5 px-5">
              <CardDescription className="text-xs flex items-center justify-between text-muted-foreground font-medium">
                <span>Active Dentists</span>
                <div className="w-7 h-7 rounded-full bg-indigo-500/10 flex items-center justify-center">
                  <StethoscopeIcon className="w-3.5 h-3.5 text-indigo-500" />
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent className="px-5 pb-5 pt-1 space-y-1">
              <p className="text-3xl font-black tabular-nums text-foreground">
                {metrics.activeDentistsCount}
              </p>
              <p className="text-xs text-muted-foreground">
                Available for booking
              </p>
            </CardContent>
          </Card>
        </div>

        {/* QUICK ACTIONS ROW */}
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            Quick Clinic Operations
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link href="/staff/appointments">
              <Button
                variant="outline"
                className="w-full justify-between h-11 text-xs font-semibold gap-2 border-border/60 hover:border-emerald-500/40"
              >
                <span className="flex items-center gap-2">
                  <CalendarCheckIcon className="w-4 h-4 text-emerald-500" />
                  View Appointments
                </span>
                <ArrowRightIcon className="w-3.5 h-3.5 text-muted-foreground" />
              </Button>
            </Link>

            <Link href="/staff/patients">
              <Button
                variant="outline"
                className="w-full justify-between h-11 text-xs font-semibold gap-2 border-border/60 hover:border-cyan-500/40"
              >
                <span className="flex items-center gap-2">
                  <UsersIcon className="w-4 h-4 text-cyan-500" />
                  Manage Patients
                </span>
                <ArrowRightIcon className="w-3.5 h-3.5 text-muted-foreground" />
              </Button>
            </Link>

            <Link href="/staff/doctors">
              <Button
                variant="outline"
                className="w-full justify-between h-11 text-xs font-semibold gap-2 border-border/60 hover:border-indigo-500/40"
              >
                <span className="flex items-center gap-2">
                  <StethoscopeIcon className="w-4 h-4 text-indigo-500" />
                  Manage Dentists
                </span>
                <ArrowRightIcon className="w-3.5 h-3.5 text-muted-foreground" />
              </Button>
            </Link>

            <Link href="/staff/availability">
              <Button
                variant="outline"
                className="w-full justify-between h-11 text-xs font-semibold gap-2 border-border/60 hover:border-amber-500/40"
              >
                <span className="flex items-center gap-2">
                  <ClockIcon className="w-4 h-4 text-amber-500" />
                  Manage Availability
                </span>
                <ArrowRightIcon className="w-3.5 h-3.5 text-muted-foreground" />
              </Button>
            </Link>
          </div>
        </div>

        {/* TODAY'S APPOINTMENTS LIST */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between px-6 pt-6 pb-2">
            <div>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <CalendarCheckIcon className="w-4 h-4 text-emerald-500" />
                Today&apos;s Appointments
              </CardTitle>
              <CardDescription className="mt-1">
                Patients scheduled for visits today.
              </CardDescription>
            </div>
            <Link href="/staff/appointments">
              <Button
                variant="outline"
                size="sm"
                className="text-xs gap-1.5 h-8"
              >
                View All Appointments
                <ArrowRightIcon className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </CardHeader>

          <CardContent className="px-6 pb-6">
            {metrics.todaysAppointments.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-border/50 rounded-2xl bg-muted/5">
                <CalendarIcon className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm font-semibold text-foreground">
                  No Appointments Today
                </p>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
                  There are no patient appointments scheduled for today.
                </p>
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                {metrics.todaysAppointments.map((apt: any) => (
                  <div
                    key={apt.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-border/50 bg-muted/10 gap-3"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col items-center justify-center shrink-0">
                        <ClockIcon className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-xs font-bold text-foreground mt-0.5">
                          {apt.time}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">
                          {apt.patientName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Dentist:{" "}
                          <span className="text-foreground font-medium">
                            {apt.doctorName}
                          </span>{" "}
                          ({apt.doctorSpeciality})
                        </p>
                        {apt.reason && (
                          <p className="text-[11px] text-muted-foreground/80 mt-0.5">
                            Reason: {apt.reason}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      {apt.status === "COMPLETED" ? (
                        <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 font-semibold text-xs">
                          ● Completed
                        </Badge>
                      ) : (
                        <Badge className="bg-blue-500/15 text-blue-600 border-blue-500/30 font-semibold text-xs">
                          ● Confirmed
                        </Badge>
                      )}

                      {apt.status !== "COMPLETED" && (
                        <form
                          action={async () => {
                            "use server";
                            await updateAppointmentStatus({
                              id: apt.id,
                              status: "COMPLETED",
                            });
                          }}
                        >
                          <Button
                            type="submit"
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs gap-1 text-emerald-600 hover:bg-emerald-500/10 border-emerald-500/30"
                          >
                            <CheckCircle2Icon className="w-3.5 h-3.5" />
                            Mark Complete
                          </Button>
                        </form>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
