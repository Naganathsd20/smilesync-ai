import {
  SparklesIcon,
  BotIcon,
  ActivityIcon,
  ClipboardListIcon,
  BellRingIcon,
  ArrowUpRightIcon,
} from "lucide-react";
import Link from "next/link";

const CARDS = [
  {
    id: "nova",
    title: "Nova AI Assistant",
    desc: "Ask dental questions and receive educational, personalized guidance based on your available health context.",
    icon: BotIcon,
    badge: "24/7 Educational Assistant",
    link: "/nova",
    gradient: "from-blue-500/15 via-primary/10 to-transparent",
    borderColor: "hover:border-primary/40",
    badgeColor: "bg-primary/10 text-primary border-primary/20",
  },
  {
    id: "assessment",
    title: "AI Oral Health Assessment",
    desc: "Complete a structured assessment to understand your oral-health risk factors and receive personalized next steps.",
    icon: ActivityIcon,
    badge: "Risk Analysis & Triage",
    link: "/assessment",
    gradient: "from-cyan-500/15 via-teal-500/10 to-transparent",
    borderColor: "hover:border-cyan-500/40",
    badgeColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  },
  {
    id: "care-plan",
    title: "Personalized Care Plan",
    desc: "Turn your dental insights into a personalized daily and long-term care routine.",
    icon: ClipboardListIcon,
    badge: "Tailored Routines",
    link: "/care-plan",
    gradient: "from-purple-500/15 via-indigo-500/10 to-transparent",
    borderColor: "hover:border-purple-500/40",
    badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  },
  {
    id: "reminders",
    title: "Smart Follow-Ups",
    desc: "Receive intelligent reminders for assessments, checkups, appointments, and dental habits.",
    icon: BellRingIcon,
    badge: "Automated Notifications",
    link: "/reminders",
    gradient: "from-emerald-500/15 via-teal-500/10 to-transparent",
    borderColor: "hover:border-emerald-500/40",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
];

export default function AICareSection() {
  return (
    <section
      id="ai-care"
      className="relative py-8 lg:py-10 px-4 sm:px-6 max-w-6xl mx-auto overflow-hidden"
    >
      {/* HEADER */}
      <div className="text-center mb-6 space-y-1.5 relative z-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 rounded-full border border-primary/20 backdrop-blur-sm">
          <SparklesIcon className="w-3.5 h-3.5 text-primary" />
          <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">
            AI Healthcare Suite
          </span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
          Your AI Dental Care{" "}
          <span className="bg-gradient-to-r from-primary via-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Companion
          </span>
        </h2>

        <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
          SmileSync AI combines multiple specialized AI-powered experiences to
          support your oral health before, during, and between clinic visits.
        </p>
      </div>

      {/* 2x2 CARDS GRID */}
      <div className="grid md:grid-cols-2 gap-3.5 relative z-10">
        {CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.id} href={card.link} className="group">
              <div
                className={`h-full p-4 sm:p-4.5 rounded-xl bg-card/60 backdrop-blur-xl border border-border/60 ${card.borderColor} transition-all duration-300 hover:shadow-md flex flex-col justify-between relative overflow-hidden`}
              >
                {/* AMBIENT CORNER GLOW */}
                <div
                  className={`absolute -top-10 -right-10 w-28 h-28 bg-gradient-to-br ${card.gradient} rounded-full blur-lg opacity-50 group-hover:opacity-100 transition-opacity pointer-events-none`}
                />

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-primary group-hover:scale-105 transition-transform">
                      <Icon className="w-4 h-4" />
                    </div>

                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${card.badgeColor}`}
                    >
                      {card.badge}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-foreground mb-1 group-hover:text-primary transition-colors flex items-center gap-1">
                    {card.title}
                    <ArrowUpRightIcon className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                  </h3>

                  <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed mb-2.5">
                    {card.desc}
                  </p>
                </div>

                <div className="pt-2.5 border-t border-border/40 flex items-center justify-between text-[11px] font-semibold text-primary">
                  <span>Explore Feature</span>
                  <span className="group-hover:translate-x-0.5 transition-transform">
                    →
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
