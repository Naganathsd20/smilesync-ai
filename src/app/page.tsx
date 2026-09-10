import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";
import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import ValueStrip from "@/components/landing/ValueStrip";
import HowItWorks from "@/components/landing/HowItWorks";
import AICareSection from "@/components/landing/AICareSection";
import AppointmentSection from "@/components/landing/AppointmentSection";
import ProfessionalSection from "@/components/landing/ProfessionalSection";
import VoiceSection from "@/components/landing/VoiceSection";
import RemindersSection from "@/components/landing/RemindersSection";
import PricingSection from "@/components/landing/PricingSection";
import SecuritySection from "@/components/landing/SecuritySection";
import { syncUser } from "@/lib/actions/users";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await currentUser();

  // Sync user if authenticated
  await syncUser();

  // Redirect authenticated user to dashboard
  if (user) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary overflow-x-hidden">
      <Header />
      <main className="space-y-2">
        <Hero />
        <ValueStrip />
        <HowItWorks />
        <AICareSection />
        <AppointmentSection />
        <ProfessionalSection />
        <VoiceSection />
        <RemindersSection />
        <PricingSection />
        <SecuritySection />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}