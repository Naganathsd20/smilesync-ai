import {
  BellRingIcon,
  CalendarCheckIcon,
  StethoscopeIcon,
  ActivityIcon,
  SparklesIcon,
  ArrowRightIcon,
} from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";

const REMINDER_EXAMPLES = [
  {
    title: "Appointment Reminders",
    desc: "Timely notifications before your scheduled clinic visits with doctor and location details.",
    icon: CalendarCheckIcon,
    tag: "Upcoming Visit",
    color: "border-blue-500/30 text-blue-400 bg-blue-500/10",
  },
  {
    title: "Dental Checkup Follow-ups",
    desc: "Automated alerts when it's time for routine 6-month cleaning and preventive exams.",
    icon: StethoscopeIcon,
    tag: "Preventive Care",
    color: "border-emerald-500/30 text-emerald-400 bg-emerald-500/10",
  },
  {
    title: "Assessment Follow-ups",
    desc: "Reminders to retake oral risk assessments after completing treatments or symptom resolution.",
    icon: ActivityIcon,
    tag: "Risk Re-Evaluation",
    color: "border-cyan-500/30 text-cyan-400 bg-cyan-500/10",
  },
  {
    title: "Daily Dental Habits",
    desc: "Personalized notifications for brushing, flossing, mouthwash, or specific post-care steps.",
    icon: SparklesIcon,
    tag: "Daily Routine",
    color: "border-purple-500/30 text-purple-400 bg-purple-500/10",
  },
];

export default function RemindersSection() {
  return (
    <section className="relative py-12 lg:py-16 px-4 sm:px-6 max-w-6xl mx-auto overflow-hidden">
      {/* HEADER */}
      <div className="text-center mb-10 space-y-2 relative z-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 rounded-full border border-primary/20 text-primary text-[11px] font-semibold backdrop-blur-sm">
          <BellRingIcon className="w-3.5 h-3.5" />
          <span>Intelligent Follow-Ups</span>
        </div>

        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-foreground">
          Stay on track with{" "}
          <span className="bg-gradient-to-r from-primary via-cyan-400 to-blue-500 bg-clip-text text-transparent">
            smarter follow-ups
          </span>
        </h2>

        <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Maintain consistent dental hygiene and never miss critical appointments with automated, intelligent reminders tailored to your care plan.
        </p>
      </div>

      {/* 4 EXAMPLES GRID */}
      <div className="grid md:grid-cols-2 gap-4 relative z-10 mb-8">
        {REMINDER_EXAMPLES.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-card/60 backdrop-blur-xl border border-border/60 hover:border-primary/40 transition-all duration-300 hover:shadow-lg flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary group-hover:scale-105 transition-transform">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`text-[11px] font-semibold px-3 py-1 rounded-full border ${item.color}`}>
                    {item.tag}
                  </span>
                </div>

                <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                  {item.title}
                </h3>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <div className="text-center relative z-10">
        <Link href="/reminders">
          <Button size="sm" variant="outline" className="px-6 py-4 rounded-xl font-bold text-xs border-primary/20 hover:border-primary/40 hover:bg-primary/5 gap-1.5">
            <BellRingIcon className="w-4 h-4 text-primary" />
            View Smart Reminders
            <ArrowRightIcon className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </section>
  );
}
