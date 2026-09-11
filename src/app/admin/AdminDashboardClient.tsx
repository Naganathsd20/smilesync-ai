"use client";

import AdminStats from "@/components/admin/AdminStats";
import DoctorsManagement from "@/components/admin/DoctorsManagement";
import RecentAppointments from "@/components/admin/RecentAppointments";
import Navbar from "@/components/Navbar";
import { useGetAppointments } from "@/hooks/use-appointment";
import { useGetDoctors } from "@/hooks/use-doctors";
import { useUser } from "@clerk/nextjs";
import { SettingsIcon } from "lucide-react";

function AdminDashboardClient() {
  const { user } = useUser();

  const { data: doctors = [], isLoading: doctorsLoading } = useGetDoctors();

  const { data: appointments = [], isLoading: appointmentsLoading } =
    useGetAppointments();

  // Calculate stats from real data
  const stats = {
    totalDoctors: doctors.length,
    activeDoctors: doctors.filter((doc: any) => doc.isActive).length,
    totalAppointments: appointments.length,
    completedAppointments: appointments.filter(
      (app: any) => app.status === "COMPLETED",
    ).length,
  };

  if (doctorsLoading || appointmentsLoading) {
    return <LoadingUI />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-8 pt-24">
        {/* ADMIN WELCOME SECTION */}
        <div className="mb-12 flex items-center justify-between rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-background p-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1">
              <div className="h-2 w-2 animate-pulse rounded-full bg-primary"></div>
              <span className="text-sm font-medium text-primary">
                Admin Dashboard
              </span>
            </div>

            <div>
              <h1 className="mb-2 text-4xl font-bold">
                Welcome back, {user?.firstName || "Admin"}!
              </h1>

              <p className="text-muted-foreground">
                Manage doctors, oversee appointments, and monitor your dental
                practice performance.
              </p>
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10">
              <SettingsIcon className="h-16 w-16 text-primary" />
            </div>
          </div>
        </div>

        <AdminStats
          totalDoctors={stats.totalDoctors}
          activeDoctors={stats.activeDoctors}
          totalAppointments={stats.totalAppointments}
          completedAppointments={stats.completedAppointments}
        />

        <DoctorsManagement />

        <RecentAppointments />
      </div>
    </div>
  );
}

export default AdminDashboardClient;

function LoadingUI() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-8 pt-24">
        <div className="flex h-96 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
