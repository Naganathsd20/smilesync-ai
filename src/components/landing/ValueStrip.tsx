import {
  BotIcon,
  HeartPulseIcon,
  StethoscopeIcon,
  CalendarCheckIcon,
  BellRingIcon,
  ShieldCheckIcon,
} from "lucide-react";

const VALUES = [
  {
    icon: BotIcon,
    title: "AI Guidance",
    desc: "24/7 educational advice",
  },
  {
    icon: HeartPulseIcon,
    title: "Personal Care",
    desc: "Custom care routines",
  },
  {
    icon: StethoscopeIcon,
    title: "Verified Dentists",
    desc: "Qualified practitioners",
  },
  {
    icon: CalendarCheckIcon,
    title: "Smart Booking",
    desc: "Real-time slot confirmation",
  },
  {
    icon: BellRingIcon,
    title: "Reminders",
    desc: "Habit & checkup alerts",
  },
  {
    icon: ShieldCheckIcon,
    title: "Secure Portal",
    desc: "Role-based security",
  },
];

export default function ValueStrip() {
  return (
    <section className="relative py-6 border-y border-border/50 bg-card/30 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <p className="text-center text-[10px] font-bold uppercase tracking-widest text-primary mb-4">
          One platform for your complete dental journey
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {VALUES.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-3 rounded-xl bg-card/60 border border-border/40 hover:border-primary/30 transition-all duration-200 flex items-center gap-2.5 group"
              >
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary shrink-0 group-hover:scale-105 transition-transform">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 text-left">
                  <h3 className="text-xs font-bold text-foreground truncate">
                    {item.title}
                  </h3>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
