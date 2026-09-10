import { MicIcon, SparklesIcon, CrownIcon, ArrowRightIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";

export default function VoiceSection() {
  return (
    <section className="relative py-12 lg:py-16 px-4 sm:px-6 max-w-6xl mx-auto overflow-hidden">
      <div className="relative rounded-2xl border border-primary/30 bg-gradient-to-br from-card/80 via-card/50 to-primary/5 p-6 sm:p-8 lg:p-10 backdrop-blur-2xl shadow-lg overflow-hidden">
        
        {/* AMBIENT LIGHTING */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[350px] h-[350px] bg-primary/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="grid lg:grid-cols-12 gap-10 items-center relative z-10">
          
          {/* LEFT: TEXT & CTA */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-semibold">
              <CrownIcon className="w-3 h-3" />
              <span>Pro Subscriber Experience</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-foreground">
              Talk to your dental{" "}
              <span className="bg-gradient-to-r from-primary via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                AI assistant
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-lg">
              Get conversational dental guidance through the SmileSync AI voice experience. Speak naturally about your symptoms, care routines, and questions.
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-2">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card border border-border/50">
                <MicIcon className="w-3.5 h-3.5 text-primary" />
                Real-time voice response
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card border border-border/50">
                <SparklesIcon className="w-3.5 h-3.5 text-cyan-400" />
                Hands-free interaction
              </span>
            </div>

            <div className="pt-2">
              <Link href="/voice">
                <Button size="sm" className="px-5 py-4 rounded-xl font-bold text-xs bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20 gap-1.5">
                  <MicIcon className="w-3.5 h-3.5" />
                  Try Voice Assistant
                  <ArrowRightIcon className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* RIGHT: AUDIO / VOICE GRAPHIC */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative p-6 rounded-2xl bg-card/70 border border-primary/20 shadow-lg text-center space-y-4 w-full max-w-xs">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-cyan-500/20 border border-primary/30 flex items-center justify-center text-primary shadow-md animate-pulse">
                <Image src="/audio.png" alt="Voice Agent" width={36} height={36} className="w-9 h-9 object-contain" />
              </div>

              <div className="space-y-1">
                <p className="text-sm font-bold text-foreground">SmileSync AI Voice Mode</p>
                <p className="text-xs text-muted-foreground">Interactive voice consultation</p>
              </div>

              {/* SOUND WAVE ANIMATION BARS */}
              <div className="flex items-center justify-center gap-1.5 h-10 px-4 py-2 bg-muted/30 rounded-2xl border border-border/40">
                <span className="w-1.5 bg-primary rounded-full animate-sound-wave h-4" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 bg-primary rounded-full animate-sound-wave h-8" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 bg-cyan-400 rounded-full animate-sound-wave h-6" style={{ animationDelay: "300ms" }} />
                <span className="w-1.5 bg-primary rounded-full animate-sound-wave h-9" style={{ animationDelay: "450ms" }} />
                <span className="w-1.5 bg-blue-500 rounded-full animate-sound-wave h-5" style={{ animationDelay: "600ms" }} />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
