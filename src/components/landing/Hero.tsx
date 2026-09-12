import { Button } from "../ui/button";
import {
  CalendarIcon,
  SparklesIcon,
  ShieldCheckIcon,
  ClockIcon,
  ArrowRightIcon,
  StethoscopeIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

function Hero() {
  return (
    <section className="relative overflow-hidden pt-20 pb-8 lg:pt-16 lg:pb-10">
      {/* BACKGROUND GRID & GRADIENT ORBS */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/10 pointer-events-none" />

      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] bg-primary/10 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[240px] h-[240px] bg-cyan-500/10 rounded-full blur-[70px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[240px] h-[240px] bg-blue-600/10 rounded-full blur-[70px] pointer-events-none" />

      <div className="relative z-10 w-full px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            {/* LEFT COLUMN: TEXT CONTENT */}
            <div className="lg:col-span-7 space-y-4 text-left">
              {/* STATUS & AUDIENCE BADGES */}
              <div className="flex flex-wrap items-center gap-1.5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-semibold backdrop-blur-md">
                  <SparklesIcon className="w-3 h-3 animate-pulse" />
                  <span>AI Healthcare Platform</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-medium backdrop-blur-md">
                  <StethoscopeIcon className="w-3 h-3" />
                  <span>Patients & Clinic Staff</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-medium backdrop-blur-md">
                  <ShieldCheckIcon className="w-3 h-3" />
                  <span>Secure RBAC</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-medium backdrop-blur-md">
                  <ClockIcon className="w-3 h-3" />
                  <span>24/7 Available</span>
                </div>
              </div>

              {/* MAIN HEADING */}
              <div className="space-y-2">
                <h1 className="text-3xl sm:text-4xl lg:text-[2.65rem] font-black tracking-tight leading-[1.12] text-foreground">
                  AI-Powered Dental Care,{" "}
                  <span className="bg-gradient-to-r from-primary via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    Made Simple.
                  </span>
                </h1>

                {/* SUPPORTING TEXT */}
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-lg font-normal">
                  Get personalized oral-health guidance, understand your dental
                  risk, create care routines, book appointments, and streamline
                  clinic operations from one intelligent workspace.
                </p>
              </div>

              {/* ACTION CTAS */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <a href="#ai-care">
                  <Button
                    size="sm"
                    className="px-4 py-2.5 text-xs font-bold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm shadow-primary/20 gap-1.5 group"
                  >
                    Explore AI Care
                    <ArrowRightIcon className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Button>
                </a>

                <Link href="/appointments">
                  <Button
                    size="sm"
                    variant="outline"
                    className="px-4 py-2.5 text-xs font-semibold rounded-xl border-primary/20 hover:border-primary/40 hover:bg-primary/5 gap-1.5"
                  >
                    <CalendarIcon className="w-3.5 h-3.5 text-primary" />
                    Book Appointment
                  </Button>
                </Link>

                <Link href="/portal-select">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="px-3.5 py-2.5 text-xs font-semibold rounded-xl text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 gap-1.5"
                  >
                    <StethoscopeIcon className="w-3.5 h-3.5" />
                    Clinic Portal
                  </Button>
                </Link>
              </div>

              {/* METRICS & DUAL PORTAL REASSURANCE */}
              <div className="pt-3 border-t border-border/40 grid grid-cols-3 gap-2.5 max-w-sm">
                <div>
                  <p className="text-lg font-bold text-foreground">24/7</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    AI Care Assistant
                  </p>
                </div>
                <div>
                  <p className="text-lg font-bold text-primary">Dual Portal</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Patient & Staff
                  </p>
                </div>
                <div>
                  <p className="text-lg font-bold text-foreground">Smart</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Booking & Reminders
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: ROBOT AI COMPOSITION */}
            <div className="lg:col-span-5 flex justify-center items-center">
              <div className="relative w-full max-w-xs sm:max-w-sm">
                {/* BACKDROP GLOW CARDS */}
                <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 via-cyan-500/10 to-blue-600/15 rounded-2xl blur-lg opacity-70 pointer-events-none" />

                {/* IMAGE CONTAINER */}
                <div className="relative rounded-2xl border border-primary/20 bg-card/40 backdrop-blur-xl p-3 shadow-lg overflow-hidden">
                  <Image
                    src="/hero.png"
                    alt="SmileSync AI Dental Care Platform"
                    width={380}
                    height={380}
                    priority
                    className="w-full h-auto object-contain hover:scale-[1.01] transition-transform duration-500"
                  />

                  {/* OVERLAY BADGE: Integrated Platform */}
                  <div className="absolute bottom-3 left-3 right-3 bg-background/90 backdrop-blur-md border border-border/60 p-2 rounded-xl shadow-md flex items-center gap-2">
                    <div className="p-1 rounded-lg bg-primary/10 text-primary shrink-0">
                      <SparklesIcon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-[11px] font-bold text-foreground truncate">
                        Complete Dental Platform
                      </p>
                      <p className="text-[9px] text-muted-foreground truncate">
                        AI Care • Clinic Operations • Appointments
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
