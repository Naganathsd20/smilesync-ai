import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SignUpButton } from "@clerk/nextjs";
import { LayoutGridIcon, SparklesIcon, ArrowRightIcon } from "lucide-react";

function CTA() {
  return (
    <section className="relative py-8 lg:py-10 px-4 sm:px-6 max-w-6xl mx-auto overflow-hidden">
      <div className="relative rounded-xl bg-gradient-to-br from-card/90 via-card/60 to-primary/10 border border-primary/30 p-5 sm:p-6 lg:p-8 backdrop-blur-2xl shadow-xl overflow-hidden">
        {/* AMBIENT GLOW */}
        <div className="absolute top-1/2 right-10 -translate-y-1/2 w-[400px] h-[400px] bg-primary/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="grid lg:grid-cols-12 gap-6 items-center relative z-10">
          {/* LEFT CONTENT */}
          <div className="lg:col-span-7 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-semibold">
              <SparklesIcon className="w-3.5 h-3.5" />
              <span>Ready When You Are</span>
            </div>

            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-foreground leading-tight">
              Your smarter dental{" "}
              <span className="bg-gradient-to-r from-primary via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                journey starts here.
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-lg font-normal">
              Explore personalized AI dental care, connect with dental
              professionals, and manage your appointments from one platform.
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              <SignUpButton mode="modal" forceRedirectUrl="/portal-redirect">
                <Button
                  size="sm"
                  className="px-5 py-2 rounded-xl font-bold text-xs bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20 gap-1.5"
                >
                  Get Started
                  <ArrowRightIcon className="w-3.5 h-3.5" />
                </Button>
              </SignUpButton>

              <Link href="/portal-select">
                <Button
                  size="sm"
                  variant="outline"
                  className="px-5 py-2 rounded-xl font-bold text-xs border-primary/20 hover:border-primary/40 hover:bg-primary/5 gap-1.5"
                >
                  <LayoutGridIcon className="w-3.5 h-3.5 text-primary" />
                  Choose Portal
                </Button>
              </Link>
            </div>
          </div>

          {/* RIGHT CONTENT - CTA IMAGE */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative">
              <div className="absolute -top-3 left-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg z-20 flex items-center gap-1.5">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                Available 24/7
              </div>

              <div className="relative rounded-3xl border border-primary/20 bg-card/40 p-4 shadow-xl overflow-hidden">
                <Image
                  src="/cta3.png"
                  alt="SmileSync AI Dental Care Platform"
                  width={320}
                  height={320}
                  className="w-52 sm:w-64 h-auto object-contain hover:scale-105 transition-transform duration-500"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CTA;
