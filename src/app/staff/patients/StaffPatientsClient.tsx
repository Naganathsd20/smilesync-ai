"use client";

import { useState } from "react";
import {
  CalendarIcon,
  ClockIcon,
  MailIcon,
  PhoneIcon,
  SearchIcon,
  UserCheckIcon,
  UsersIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface PatientItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  appointmentCount: number;
  createdAt: string | Date;
  lastAppointment: {
    date: string;
    doctorName: string;
    status: string;
  } | null;
  upcomingAppointment: {
    date: string;
    time: string;
    doctorName: string;
  } | null;
}

export default function StaffPatientsClient({
  initialPatients,
}: {
  initialPatients: PatientItem[];
}) {
  const [patients] = useState<PatientItem[]>(initialPatients);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const formatDate = (date: string | Date) =>
    new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <UsersIcon className="w-5 h-5 text-cyan-500" />
            Registered Clinic Patients ({patients.length})
          </CardTitle>
          <CardDescription className="mt-1">
            Clinic operational patient directory. Privacy protected: no private
            AI chat histories are exposed.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* SEARCH BAR */}
        <div className="relative w-full sm:w-80">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search patient by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>

        {/* PATIENTS LIST */}
        {filteredPatients.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border/50 rounded-2xl bg-muted/5">
            <UsersIcon className="w-10 h-10 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm font-semibold text-foreground">
              No Patients Found
            </p>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              {searchTerm
                ? "No patient records match your current search query."
                : "No registered patient records exist in the clinic database yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPatients.map((patient) => (
              <div
                key={patient.id}
                className="flex flex-col lg:flex-row lg:items-center justify-between p-4.5 rounded-2xl border border-border/50 bg-card hover:border-cyan-500/30 transition-all gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-500 font-bold text-base shrink-0">
                    {patient.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-base text-foreground">
                        {patient.name}
                      </span>
                      <Badge variant="secondary" className="text-[11px]">
                        {patient.appointmentCount} appointment
                        {patient.appointmentCount === 1 ? "" : "s"}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 flex-wrap text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MailIcon className="w-3.5 h-3.5" />
                        {patient.email}
                      </div>
                      <div className="flex items-center gap-1">
                        <PhoneIcon className="w-3.5 h-3.5" />
                        {patient.phone}
                      </div>
                    </div>

                    <p className="text-[11px] text-muted-foreground/80 pt-0.5">
                      Member since: {formatDate(patient.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between lg:justify-end gap-6 pt-3 lg:pt-0 border-t lg:border-t-0 border-border/40">
                  <div className="text-left lg:text-right shrink-0">
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Appointment History
                    </p>
                    {patient.upcomingAppointment ? (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-500 mt-0.5">
                        <CalendarIcon className="w-3.5 h-3.5" />
                        Upcoming: {patient.upcomingAppointment.date} (
                        {patient.upcomingAppointment.time})
                      </div>
                    ) : patient.lastAppointment ? (
                      <div className="flex items-center gap-1.5 text-xs font-medium text-foreground mt-0.5">
                        <ClockIcon className="w-3.5 h-3.5 text-muted-foreground" />
                        Last Visit: {patient.lastAppointment.date} (Dr.{" "}
                        {patient.lastAppointment.doctorName})
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">
                        No visits recorded
                      </span>
                    )}
                  </div>

                  <Badge className="bg-cyan-500/10 text-cyan-600 border-cyan-500/20 text-xs font-semibold shrink-0">
                    <UserCheckIcon className="w-3 h-3 mr-1" />
                    Active Patient
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
