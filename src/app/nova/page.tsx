import Navbar from "@/components/Navbar";
import NovaChat from "@/components/nova/NovaChat";
import { BotIcon, SparklesIcon } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Nova AI Dental Assistant - SmileSync AI",
  description:
    "Chat with Nova, your intelligent educational AI assistant for oral hygiene, symptom guidance, and dental care questions.",
};

export default function NovaPage() {
  return (
    <>
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pt-20 sm:pt-24 min-h-screen space-y-6 sm:space-y-8 overflow-x-hidden">
        {/* HEADER SECTION */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider">
            <SparklesIcon className="w-3.5 h-3.5" /> AI Dental Conversation
            Engine
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold font-mono tracking-tight text-foreground flex items-center justify-center gap-3">
            <BotIcon className="w-8 h-8 text-primary" /> Meet Nova
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Your 24/7 intelligent dental assistant. Ask questions about brushing
            techniques, tooth sensitivity, gum care, or common oral symptoms.
          </p>
        </div>

        {/* NOVA CHAT INTERFACE */}
        <NovaChat />
      </main>
    </>
  );
}
