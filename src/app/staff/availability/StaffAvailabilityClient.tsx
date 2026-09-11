"use client";

import { useState } from "react";
import { useToggleDoctorStatus } from "@/hooks/use-doctors";
import {
  ClockIcon,
  StethoscopeIcon,
  UserCheckIcon,
  UserXIcon,
  CalendarIcon,
  CheckCircle2Icon,
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
import { toast } from "sonner";
import Image from "next/image";

interface DoctorItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  speciality: string;
  bio: string | null;
  imageUrl: string;
  gender: "MALE" | "FEMALE";
  isActive: boolean;
  appointmentCount?: number;
}

const DEFAULT_WEEKLY_SCHEDULE = [
  { day: "Monday", hours: "09:00 AM - 05:00 PM" },
  { day: "Tuesday", hours: "09:00 AM - 05:00 PM" },
  { day: "Wednesday", hours: "09:00 AM - 01:00 PM" },
  { day: "Thursday", hours: "09:00 AM - 05:00 PM" },
  { day: "Friday", hours: "09:00 AM - 03:00 PM" },
];

export default function StaffAvailabilityClient({
  initialDoctors,
}: {
  initialDoctors: DoctorItem[];
}) {
  const [doctors, setDoctors] = useState<DoctorItem[]>(initialDoctors);
  const toggleStatusMutation = useToggleDoctorStatus();

  const handleToggleActive = (doctor: DoctorItem) => {
    const newStatus = !doctor.isActive;
    toggleStatusMutation.mutate(
      { doctorId: doctor.id, isActive: newStatus },
      {
        onSuccess: () => {
          setDoctors((prev) =>
            prev.map((d) =>
              d.id === doctor.id ? { ...d, isActive: newStatus } : d,
            ),
          );
          toast.success(
            `Dr. ${doctor.name} status updated to ${newStatus ? "Active / Available" : "Inactive / Off-duty"}.`,
          );
        },
        onError: (err: any) => {
          toast.error(err?.message || "Failed to update availability status.");
        },
      },
    );
  };

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <ClockIcon className="w-5 h-5 text-amber-500" />
            Clinic Dentist Working Schedules ({doctors.length})
          </CardTitle>
          <CardDescription className="mt-1">
            Toggle dentist active availability status. Inactive dentists are
            hidden from new patient booking options.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {doctors.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border/50 rounded-2xl bg-muted/5">
            <StethoscopeIcon className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm font-semibold text-foreground">
              No Dentists Found
            </p>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              No dentist records exist in the database yet. Add dentists to
              manage their availability.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {doctors.map((doctor) => (
              <Card
                key={doctor.id}
                className={`border transition-all flex flex-col justify-between ${
                  doctor.isActive
                    ? "border-border/60 bg-card hover:border-amber-500/30"
                    : "border-border/40 bg-muted/20 opacity-75"
                }`}
              >
                <CardHeader className="pb-3 pt-5 px-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <Image
                        src={doctor.imageUrl}
                        alt={doctor.name}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-amber-500/20 shrink-0"
                      />
                      <div>
                        <h3 className="font-bold text-base text-foreground leading-tight">
                          {doctor.name}
                        </h3>
                        <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                          {doctor.speciality}
                        </p>
                      </div>
                    </div>

                    {doctor.isActive ? (
                      <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 font-semibold text-xs shrink-0">
                        ● Available
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs shrink-0">
                        ● Off-Duty
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="px-5 pb-5 space-y-4 text-xs">
                  {/* WORK SCHEDULE SUMMARY */}
                  <div className="space-y-2 p-3 rounded-xl bg-muted/30 border border-border/40">
                    <p className="font-semibold text-foreground flex items-center justify-between">
                      <span>Standard Weekly Hours</span>
                      <span className="text-[11px] text-muted-foreground font-normal">
                        {doctor.appointmentCount ?? 0} booked
                      </span>
                    </p>
                    <div className="space-y-1 pt-1 text-[11px] text-muted-foreground">
                      {DEFAULT_WEEKLY_SCHEDULE.map((s) => (
                        <div key={s.day} className="flex justify-between">
                          <span>{s.day}</span>
                          <span className="font-mono text-foreground/80">
                            {s.hours}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* TOGGLE ACTIVE STATUS BUTTON */}
                  <Button
                    onClick={() => handleToggleActive(doctor)}
                    disabled={toggleStatusMutation.isPending}
                    variant={doctor.isActive ? "outline" : "default"}
                    className={`w-full gap-2 h-9 text-xs font-semibold ${
                      doctor.isActive
                        ? "border-amber-500/30 text-amber-600 hover:bg-amber-500/10"
                        : "bg-emerald-600 hover:bg-emerald-700 text-white"
                    }`}
                  >
                    {doctor.isActive ? (
                      <>
                        <UserXIcon className="w-4 h-4 text-amber-500" />
                        Set Off-Duty (Deactivate Booking)
                      </>
                    ) : (
                      <>
                        <UserCheckIcon className="w-4 h-4" />
                        Set Active (Enable Booking)
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
