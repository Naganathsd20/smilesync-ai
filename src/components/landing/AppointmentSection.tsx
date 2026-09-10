import {
  CalendarIcon,
  UserCheckIcon,
  ClockIcon,
  CheckCircle2Icon,
  ArrowRightIcon,
} from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";

const FLOW_STEPS = [
  {
    step: "01",
    title: "Select Dentist",
    desc: "Browse verified dentists by specialization and clinic branch.",
    icon: UserCheckIcon,
  },
  {
    step: "02",
    title: "Select Service & Time",
    desc: "Choose treatment, preferred duration, and real-time open slots.",
    icon: ClockIcon,
  },
  {
    step: "03",
    title: "Confirm Appointment",
    desc: "Review and receive immediate confirmation with email receipt.",
    icon: CheckCircle2Icon,
  },
];

const FEATURES = [
  "Verified dental specialists",
  "Tailored service selection",
  "Real-time slot availability",
  "Automated conflict checking",
  "Instant confirmation",
  "Email notifications",
];

export default function AppointmentSection() {
  return (
    <section id="appointments" className="relative py-12 lg:py-16 px-4 sm:px-6 max-w-6xl mx-auto overflow-hidden">
      <div className="bg-card/40 backdrop-blur-2xl border border-border/60 rounded-2xl p-6 sm:p-8 lg:p-10 relative overflow-hidden shadow-lg">
        {/* AMBIENT GLOW */}
        <div className="absolute top-0 right-0 w-[280px] h-[280px] bg-primary/8 rounded-full blur-[80px] pointer-events-none" />

        <div className="grid lg:grid-cols-12 gap-8 items-start relative z-10">
          {/* LEFT: CONTENT & CTA */}
          <div className="lg:col-span-5 space-y-5">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-semibold">
                <CalendarIcon className="w-3 h-3" />
                <span>Seamless Clinic Booking</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                Find the right dentist.{" "}
                <span className="bg-gradient-to-r from-primary via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  Book with confidence.
                </span>
              </h2>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Connect with qualified dental professionals. SmileSync AI simplifies scheduling with conflict-free availability and automated notifications.
              </p>
            </div>

            {/* FEATURE BULLETS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {FEATURES.map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2 text-[11px] font-medium text-foreground">
                  <CheckCircle2Icon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            <Link href="/appointments">
              <Button size="sm" className="px-5 py-4 rounded-xl font-bold text-xs bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20 gap-1.5">
                Book an Appointment
                <ArrowRightIcon className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          {/* RIGHT: 3-STEP FLOW */}
          <div className="lg:col-span-7 space-y-3">
            {FLOW_STEPS.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-card/80 border border-border/50 hover:border-primary/30 transition-all duration-200 flex items-start gap-3"
                >
                  <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-primary shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h3 className="text-sm font-bold text-foreground">{item.title}</h3>
                      <span className="text-[10px] font-bold text-primary/50">STEP {item.step}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
