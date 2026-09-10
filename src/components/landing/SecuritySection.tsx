import {
  ShieldCheckIcon,
  LockIcon,
  DatabaseIcon,
  UserCheckIcon,
  KeyIcon,
} from "lucide-react";

const SECURITY_ITEMS = [
  {
    title: "Secure Auth with Clerk",
    desc: "Industry-standard identity authentication and session security.",
    icon: KeyIcon,
  },
  {
    title: "Role-Based Access Control",
    desc: "Strict distinction between Patient, Staff, and Admin privileges.",
    icon: UserCheckIcon,
  },
  {
    title: "Server-Side Authorization",
    desc: "Protected API actions & clinic endpoints verified on backend.",
    icon: LockIcon,
  },
  {
    title: "PostgreSQL Data Persistence",
    desc: "Reliable database persistence powered by Prisma ORM.",
    icon: DatabaseIcon,
  },
];

export default function SecuritySection() {
  return (
    <section className="relative py-8 lg:py-10 px-4 sm:px-6 max-w-6xl mx-auto overflow-hidden">
      <div className="rounded-xl bg-card/40 border border-border/60 p-5 sm:p-6 backdrop-blur-xl relative overflow-hidden">
        <div className="max-w-2xl mx-auto text-center space-y-1.5 mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold">
            <ShieldCheckIcon className="w-3.5 h-3.5" />
            <span>Platform Security</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
            Built with{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              security in mind
            </span>
          </h2>

          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            SmileSync AI enforces multi-layer security patterns across authentication, data management, and operational workflows.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {SECURITY_ITEMS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-3 rounded-lg bg-card/60 border border-border/40 hover:border-emerald-500/30 transition-all duration-300 space-y-1.5"
              >
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 w-fit">
                  <Icon className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-foreground">{item.title}</h3>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

