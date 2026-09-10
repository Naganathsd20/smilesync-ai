import {
  StethoscopeIcon,
  LayoutDashboardIcon,
  CalendarDaysIcon,
  UsersIcon,
  UserCogIcon,
  ClockIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
} from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";

const PROF_FEATURES = [
  {
    title: "Clinic Dashboard",
    desc: "Real-time metrics on scheduled appointments, patients, and operational performance.",
    icon: LayoutDashboardIcon,
    badge: "Operations Hub",
  },
  {
    title: "Appointment Management",
    desc: "Manage status transitions, view schedules, and handle patient booking requests.",
    icon: CalendarDaysIcon,
    badge: "Schedule Control",
  },
  {
    title: "Patient Directory",
    desc: "Centralized record system storing patient histories, contact info, and care status.",
    icon: UsersIcon,
    badge: "Patient Management",
  },
  {
    title: "Dentist Management",
    desc: "Directory of clinic doctors, specializations, contact details, and clinic assignments.",
    icon: UserCogIcon,
    badge: "Staff Directory",
  },
  {
    title: "Dentist Availability",
    desc: "Configure working hours, break times, and active schedules to avoid overbooking.",
    icon: ClockIcon,
    badge: "Slot Rules",
  },
];

export default function ProfessionalSection() {
  return (
    <section id="professionals" className="relative py-12 lg:py-16 px-4 sm:px-6 max-w-6xl mx-auto overflow-hidden">
      {/* BACKGROUND ACCENTS */}
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[300px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* HEADER */}
      <div className="text-center mb-10 space-y-2 relative z-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold backdrop-blur-sm">
          <StethoscopeIcon className="w-3.5 h-3.5" />
          <span>Dental Clinic Operations</span>
        </div>

        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-foreground">
          Powerful tools for{" "}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-500 bg-clip-text text-transparent">
            dental professionals
          </span>
        </h2>

        <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Give clinic teams a dedicated operational workspace to manage appointments, patients, dentists, and availability.
        </p>
      </div>

      {/* 5-CARD GRID */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10 mb-8">
        {PROF_FEATURES.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-card/60 backdrop-blur-xl border border-border/60 hover:border-emerald-500/40 transition-all duration-300 hover:shadow-lg flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 group-hover:scale-105 transition-transform">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-400 px-2.5 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                    {item.badge}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-foreground mb-1.5 group-hover:text-emerald-400 transition-colors">
                  {item.title}
                </h3>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          );
        })}

        {/* 6th REASSURANCE CARD */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/30 via-card/60 to-card/60 backdrop-blur-xl border border-emerald-500/30 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 w-fit">
              <ShieldCheckIcon className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-foreground">Role-Based Protection</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Professional & staff operational features are strictly protected with server-side authorization and RBAC checks.
            </p>
          </div>
        </div>
      </div>

      {/* ACTION CTA */}
      <div className="text-center relative z-10">
        <Link href="/portal-select">
          <Button size="sm" className="px-6 py-4 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 gap-1.5">
            Explore Professional Portal
            <ArrowRightIcon className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </section>
  );
}
