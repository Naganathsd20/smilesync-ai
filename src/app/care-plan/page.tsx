import Navbar from "@/components/Navbar";
import CarePlanView from "@/components/care-plan/CarePlanView";
import { HeartPulseIcon, SparklesIcon } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Personalized AI Dental Care Plan - SmileSync AI",
  description:
    "View your personalized AI dental care plan featuring custom daily routines, priority goals, targeted risk factor mitigations, and dental visit timelines.",
};

export default function CarePlanPage() {
  return (
    <>
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 pt-24 min-h-screen space-y-8">
        {/* HEADER SECTION */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider">
            <SparklesIcon className="w-3.5 h-3.5" /> AI Oral Care Intelligence
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold font-mono tracking-tight text-foreground flex items-center justify-center gap-3">
            <HeartPulseIcon className="w-8 h-8 text-primary" /> AI Dental Care
            Plan
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Your customized daily oral hygiene routine, risk mitigation steps,
            and professional checkup schedule tailored to your health profile.
          </p>
        </div>

        {/* CARE PLAN VIEW */}
        <CarePlanView />
      </main>
    </>
  );
}
