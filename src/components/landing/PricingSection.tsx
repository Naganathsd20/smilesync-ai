import { Button } from "@/components/ui/button";
import {
  CheckCircleIcon,
  SparklesIcon,
  CrownIcon,
  ArrowRightIcon,
} from "lucide-react";
import Link from "next/link";

function PricingSection() {
  return (
    <section
      id="pricing"
      className="relative py-8 lg:py-10 px-4 sm:px-6 max-w-6xl mx-auto overflow-hidden"
    >
      {/* BACKGROUND DECORATION */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />

      {/* HEADER */}
      <div className="text-center mb-6 space-y-1.5 relative z-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 rounded-full border border-primary/20 text-primary text-[11px] font-semibold backdrop-blur-sm">
          <SparklesIcon className="w-3.5 h-3.5" />
          <span>Flexible Plans</span>
        </div>

        <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-foreground">
          Unlock the full{" "}
          <span className="bg-gradient-to-r from-primary via-cyan-400 to-blue-500 bg-clip-text text-transparent">
            SmileSync experience
          </span>
        </h2>

        <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Book appointments for free and upgrade to Pro for unlimited AI
          consultations and conversational voice assistance.
        </p>
      </div>

      {/* PRICING TIERS GRID */}
      <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto relative z-10">
        {/* FREE PLAN */}
        <div className="p-4 sm:p-5 rounded-xl bg-card/60 backdrop-blur-xl border border-border/60 hover:border-primary/30 transition-all duration-300 flex flex-col justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted/40 px-2.5 py-0.5 rounded-full border border-border/40">
              Free Access
            </span>
            <h3 className="text-base font-black text-foreground pt-1">
              Standard Plan
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Essential dental appointment booking and basic features.
            </p>
          </div>

          <div className="space-y-2 pt-3 border-t border-border/40 text-xs">
            <div className="flex items-start gap-3">
              <CheckCircleIcon className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <span className="text-muted-foreground">
                Unlimited dentist appointment booking
              </span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircleIcon className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <span className="text-muted-foreground">
                Access verified dentist profiles
              </span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircleIcon className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <span className="text-muted-foreground">
                Oral health risk assessment
              </span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircleIcon className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <span className="text-muted-foreground">
                Smart appointment reminders
              </span>
            </div>
          </div>

          <div className="pt-3">
            <Link href="/pro">
              <Button
                size="sm"
                variant="outline"
                className="w-full py-2 rounded-xl font-bold text-xs border-border/60 hover:bg-card"
              >
                Explore Free Features
              </Button>
            </Link>
          </div>
        </div>

        {/* PRO PLAN */}
        <div className="relative group">
          {/* FEATURED BADGE */}
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20">
            <span className="bg-gradient-to-r from-primary to-cyan-500 text-white text-[11px] font-extrabold px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
              <CrownIcon className="w-3.5 h-3.5" />
              RECOMMENDED PRO
            </span>
          </div>

          <div className="p-4 sm:p-5 rounded-xl bg-card/90 backdrop-blur-xl border-2 border-primary/40 shadow-xl shadow-primary/10 flex flex-col justify-between h-full">
            <div className="space-y-4">
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
                  SmileSync Pro Tier
                </span>
                <h3 className="text-base font-black text-foreground pt-1">
                  Pro Plan
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Complete AI dental companion & voice assistance suite.
                </p>
              </div>

              <div className="space-y-2 pt-3 border-t border-border/40 text-xs">
                <div className="flex items-start gap-3">
                  <CheckCircleIcon className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                  <span className="text-foreground font-semibold">
                    Everything in Standard Plan
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircleIcon className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                  <span className="text-foreground font-semibold">
                    AI Voice Assistant (Vapi conversational audio)
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircleIcon className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                  <span className="text-foreground">
                    Unlimited Nova AI chat consultations
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircleIcon className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                  <span className="text-foreground">
                    Personalized long-term care plans
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircleIcon className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                  <span className="text-foreground">
                    Priority AI response & call recordings
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3">
              <Link href="/pro">
                <Button
                  size="sm"
                  className="w-full py-2 rounded-xl font-bold text-xs bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20 gap-1.5"
                >
                  View Plans & Upgrade
                  <ArrowRightIcon className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PricingSection;
