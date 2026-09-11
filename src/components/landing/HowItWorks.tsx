import { SignUpButton } from "@clerk/nextjs";
import { ArrowRightIcon, SparklesIcon, FileTextIcon, CalendarCheckIcon } from "lucide-react";
import Image from "next/image";
import { Button } from "../ui/button";

function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-8 lg:py-10 px-4 sm:px-6 max-w-6xl mx-auto overflow-hidden">
      {/* SECTION HEADER */}
      <div className="text-center mb-6 space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 rounded-full border border-primary/20 backdrop-blur-sm">
          <SparklesIcon className="w-3.5 h-3.5 text-primary" />
          <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">Streamlined Process</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
          Your complete dental journey in{" "}
          <span className="bg-gradient-to-r from-primary via-cyan-400 to-blue-500 bg-clip-text text-transparent">
            3 simple steps
          </span>
        </h2>

        <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
          From early risk assessment to active treatment and long-term care management, SmileSync AI guides every step.
        </p>
      </div>

      {/* STEPS GRID */}
      <div className="relative">
        {/* DESKTOP CONNECTING LINE */}
        <div className="absolute top-1/2 left-10 right-10 h-0.5 bg-gradient-to-r from-primary/10 via-primary/30 to-primary/10 transform -translate-y-1/2 hidden lg:block pointer-events-none" />

        <div className="grid lg:grid-cols-3 gap-4 relative z-10">
          {/* STEP 1 */}
          <div className="relative group">
            <div className="h-full bg-card/60 backdrop-blur-xl rounded-xl p-4 sm:p-4.5 border border-border/60 hover:border-primary/40 transition-all duration-300 hover:shadow-md flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-6 h-6 bg-primary/10 border border-primary/20 rounded-md flex items-center justify-center text-primary font-bold text-[11px]">
                    01
                  </div>
                  <span className="text-[10px] font-semibold text-primary px-2 py-0.5 bg-primary/10 rounded-full border border-primary/20">
                    Assessment & AI
                  </span>
                </div>

                <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-cyan-500/10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <Image src="/brain2.png" alt="Oral Health AI" width={22} height={22} className="w-5 h-5 object-contain" />
                </div>

                <h3 className="text-sm font-bold mb-1.5 text-foreground">
                  Understand Your Oral Health
                </h3>

                <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                  Use the AI Oral Health Assessment and Nova AI to understand your habits, symptoms, risk factors, and next steps.
                </p>
              </div>

              <div className="flex flex-wrap gap-1 pt-2.5 border-t border-border/40">
                <span className="px-2 py-0.5 bg-muted/40 text-muted-foreground text-[10px] rounded-md font-medium">
                  Symptom Analysis
                </span>
                <span className="px-2 py-0.5 bg-muted/40 text-muted-foreground text-[10px] rounded-md font-medium">
                  24/7 Nova Assistant
                </span>
              </div>
            </div>
          </div>

          {/* STEP 2 */}
          <div className="relative group">
            <div className="h-full bg-card/60 backdrop-blur-xl rounded-xl p-4 sm:p-4.5 border border-border/60 hover:border-cyan-500/40 transition-all duration-300 hover:shadow-md flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-6 h-6 bg-cyan-500/10 border border-cyan-500/20 rounded-md flex items-center justify-center text-cyan-400 font-bold text-[11px]">
                    02
                  </div>
                  <span className="text-[10px] font-semibold text-cyan-400 px-2 py-0.5 bg-cyan-500/10 rounded-full border border-cyan-500/20">
                    Personalization
                  </span>
                </div>

                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-blue-500/10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <FileTextIcon className="w-5 h-5 text-cyan-400" />
                </div>

                <h3 className="text-sm font-bold mb-1.5 text-foreground">
                  Get Personalized Care
                </h3>

                <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                  Receive personalized recommendations, care plans, and intelligent follow-up guidance.
                </p>
              </div>

              <div className="flex flex-wrap gap-1 pt-2.5 border-t border-border/40">
                <span className="px-2 py-0.5 bg-muted/40 text-muted-foreground text-[10px] rounded-md font-medium">
                  Custom Routines
                </span>
                <span className="px-2 py-0.5 bg-muted/40 text-muted-foreground text-[10px] rounded-md font-medium">
                  Actionable Steps
                </span>
              </div>
            </div>
          </div>

          {/* STEP 3 */}
          <div className="relative group">
            <div className="h-full bg-card/60 backdrop-blur-xl rounded-xl p-4 sm:p-4.5 border border-border/60 hover:border-emerald-500/40 transition-all duration-300 hover:shadow-md flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-6 h-6 bg-emerald-500/10 border border-emerald-500/20 rounded-md flex items-center justify-center text-emerald-400 font-bold text-[11px]">
                    03
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-400 px-2 py-0.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                    Booking & Reminders
                  </span>
                </div>

                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500/20 to-teal-500/10 rounded-lg flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <CalendarCheckIcon className="w-5 h-5 text-emerald-400" />
                </div>

                <h3 className="text-sm font-bold mb-1.5 text-foreground">
                  Book & Stay on Track
                </h3>

                <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                  Choose a dentist, select a service and available time, confirm your appointment, and receive automated reminders.
                </p>
              </div>

              <div className="flex flex-wrap gap-1 pt-2.5 border-t border-border/40">
                <span className="px-2 py-0.5 bg-muted/40 text-muted-foreground text-[10px] rounded-md font-medium">
                  Instant Confirmation
                </span>
                <span className="px-2 py-0.5 bg-muted/40 text-muted-foreground text-[10px] rounded-md font-medium">
                  Automated Alerts
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER CTA */}
      <div className="text-center mt-5">
        <SignUpButton mode="modal">
          <Button size="sm" className="px-5 py-3.5 rounded-xl font-bold text-xs bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm shadow-primary/20 gap-1.5">
            Get started now
            <ArrowRightIcon className="w-3.5 h-3.5" />
          </Button>
        </SignUpButton>
      </div>
    </section>
  );
}

export default HowItWorks;
