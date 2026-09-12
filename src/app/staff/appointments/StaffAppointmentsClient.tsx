"use client";

import { useState } from "react";
import { updateAppointmentStatus } from "@/lib/actions/appointments";
import {
  CalendarCheckIcon,
  CalendarIcon,
  CheckCircle2Icon,
  ClockIcon,
  MailIcon,
  PhoneIcon,
  SearchIcon,
  StethoscopeIcon,
  UserIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Image from "next/image";

interface AppointmentItem {
  id: string;
  date: string;
  time: string;
  reason: string | null;
  status: "CONFIRMED" | "COMPLETED";
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  doctorName: string;
  doctorSpeciality: string;
  doctorImageUrl: string;
  createdAt: string;
}

export default function StaffAppointmentsClient({
  initialAppointments,
}: {
  initialAppointments: AppointmentItem[];
}) {
  const [appointments, setAppointments] =
    useState<AppointmentItem[]>(initialAppointments);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "CONFIRMED" | "COMPLETED"
  >("ALL");

  const handleUpdateStatus = async (
    id: string,
    newStatus: "CONFIRMED" | "COMPLETED",
  ) => {
    try {
      await updateAppointmentStatus({ id, status: newStatus });
      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === id ? { ...apt, status: newStatus } : apt,
        ),
      );
      toast.success(`Appointment status updated to ${newStatus}.`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to update appointment status.");
    }
  };

  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch =
      apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.patientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.doctorName.toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter === "CONFIRMED")
      return matchesSearch && apt.status === "CONFIRMED";
    if (statusFilter === "COMPLETED")
      return matchesSearch && apt.status === "COMPLETED";
    return matchesSearch;
  });

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <CalendarCheckIcon className="w-5 h-5 text-emerald-500" />
            Clinic Appointment Records
          </CardTitle>
          <CardDescription className="mt-1">
            Real database records of all patient appointments.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* SEARCH & FILTER CONTROLS */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-80">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by patient, email, or dentist..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-center flex-wrap">
            <Button
              variant={statusFilter === "ALL" ? "default" : "outline"}
              size="sm"
              className="h-8 text-xs px-3"
              onClick={() => setStatusFilter("ALL")}
            >
              All ({appointments.length})
            </Button>
            <Button
              variant={statusFilter === "CONFIRMED" ? "default" : "outline"}
              size="sm"
              className="h-8 text-xs px-3"
              onClick={() => setStatusFilter("CONFIRMED")}
            >
              Confirmed (
              {appointments.filter((a) => a.status === "CONFIRMED").length})
            </Button>
            <Button
              variant={statusFilter === "COMPLETED" ? "default" : "outline"}
              size="sm"
              className="h-8 text-xs px-3"
              onClick={() => setStatusFilter("COMPLETED")}
            >
              Completed (
              {appointments.filter((a) => a.status === "COMPLETED").length})
            </Button>
          </div>
        </div>

        {/* APPOINTMENTS LIST */}
        {filteredAppointments.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border/50 rounded-2xl bg-muted/5">
            <CalendarIcon className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm font-semibold text-foreground">
              No Appointments Found
            </p>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              {searchTerm || statusFilter !== "ALL"
                ? "No appointment records match your search or filter."
                : "No clinic appointments have been booked yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAppointments.map((apt) => (
              <div
                key={apt.id}
                className="flex flex-col lg:flex-row lg:items-center justify-between p-4.5 rounded-2xl border border-border/50 bg-card hover:border-emerald-500/30 transition-all gap-4"
              >
                <div className="flex items-start gap-4">
                  {apt.doctorImageUrl ? (
                    <Image
                      src={apt.doctorImageUrl}
                      alt={apt.doctorName}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-500/20 shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
                      <StethoscopeIcon className="w-6 h-6" />
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-base text-foreground flex items-center gap-1.5">
                        <UserIcon className="w-4 h-4 text-blue-500 inline" />
                        {apt.patientName}
                      </span>
                      <Badge
                        variant="outline"
                        className="text-[11px] font-medium border-border/60"
                      >
                        {apt.reason || "General Consultation"}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 flex-wrap text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MailIcon className="w-3.5 h-3.5" />
                        {apt.patientEmail}
                      </div>
                      {apt.patientPhone && (
                        <div className="flex items-center gap-1">
                          <PhoneIcon className="w-3.5 h-3.5" />
                          {apt.patientPhone}
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground pt-0.5">
                      Dentist:{" "}
                      <span className="text-foreground font-semibold">
                        {apt.doctorName}
                      </span>{" "}
                      ({apt.doctorSpeciality})
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between lg:justify-end gap-4 pt-3 lg:pt-0 border-t lg:border-t-0 border-border/40">
                  <div className="text-left lg:text-right shrink-0">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                      <CalendarIcon className="w-3.5 h-3.5 text-emerald-500" />
                      {apt.date} at {apt.time}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                      <ClockIcon className="w-3 h-3" />
                      30 mins duration
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {apt.status === "COMPLETED" ? (
                      <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 font-semibold text-xs">
                        ● Completed
                      </Badge>
                    ) : (
                      <Badge className="bg-blue-500/15 text-blue-600 border-blue-500/30 font-semibold text-xs">
                        ● Confirmed
                      </Badge>
                    )}

                    {apt.status === "CONFIRMED" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateStatus(apt.id, "COMPLETED")}
                        className="h-8 text-xs gap-1 text-emerald-600 hover:bg-emerald-500/10 border-emerald-500/30"
                      >
                        <CheckCircle2Icon className="w-3.5 h-3.5" />
                        Mark Complete
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateStatus(apt.id, "CONFIRMED")}
                        className="h-8 text-xs gap-1 text-blue-600 hover:bg-blue-500/10 border-blue-500/30"
                      >
                        Mark Confirmed
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
