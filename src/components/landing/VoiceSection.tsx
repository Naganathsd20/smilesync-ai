import { MicIcon, SparklesIcon, CrownIcon, ArrowRightIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";

export default function VoiceSection() {
  return (
    <section className="relative py-8 lg:py-10 px-4 sm:px-6 max-w-6xl mx-auto overflow-hidden">
      <div className="relative rounded-xl border border-primary/30 bg-gradient-to-br from-card/80 via-card/50 to-primary/5 p-4 sm:p-5 lg:p-6 backdrop-blur-2xl shadow-md overflow-hidden">
        
        {/* AMBIENT LIGHTING */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[280px] h-[280px] bg-primary/15 rounded-full blur-[80px] pointer-events-none" />

        <div className="grid lg:grid-cols-12 gap-6 items-center relative z-10">
          
          {/* LEFT: TEXT & CTA */}
          <div className="lg:col-span-7 space-y-4 text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-semibold">
              <CrownIcon className="w-3 h-3" />
              <span>Pro Subscriber Experience</span>
            </div>

            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-foreground">
              Talk to your dental{" "}
              <span className="bg-gradient-to-r from-primary via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                AI assistant
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-lg">
              Get conversational dental guidance through the SmileSync AI voice experience. Speak naturally about your symptoms, care routines, and questions.
            </p>

            <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground pt-1">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-card border border-border/50">
                <MicIcon className="w-3.5 h-3.5 text-primary" />
                Real-time voice response
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-card border border-border/50">
                <SparklesIcon className="w-3.5 h-3.5 text-cyan-400" />
                Hands-free interaction
              </span>
            </div>

            <div className="pt-1">
              <Link href="/voice">
                <Button size="sm" className="px-4 py-3 rounded-xl font-bold text-xs bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm shadow-primary/20 gap-1.5">
                  <MicIcon className="w-3.5 h-3.5" />
                  Try Voice Assistant
                  <ArrowRightIcon className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* RIGHT: AUDIO / VOICE GRAPHIC */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative p-3.5 rounded-xl bg-card/70 border border-primary/20 shadow-md text-center space-y-2 w-full max-w-[200px]">
              <div className="w-14 h-14 mx-auto rounded-xl bg-gradient-to-br from-primary/20 to-cyan-500/20 border border-primary/30 flex items-center justify-center text-primary shadow-sm animate-pulse">
                <Image src="/audio.png" alt="Voice Agent" width={32} height={32} className="w-8 h-8 object-contain" />
              </div>

              <div className="space-y-0.5">
                <p className="text-xs font-bold text-foreground">SmileSync AI Voice Mode</p>
                <p className="text-[10px] text-muted-foreground">Interactive voice consultation</p>
              </div>

              {/* SOUND WAVE ANIMATION BARS */}
              <div className="flex items-center justify-center gap-1.5 h-8 px-3 py-1 bg-muted/30 rounded-xl border border-border/40">
                <span className="w-1 bg-primary rounded-full animate-sound-wave h-3" style={{ animationDelay: "0ms" }} />
                <span className="w-1 bg-primary rounded-full animate-sound-wave h-6" style={{ animationDelay: "150ms" }} />
                <span className="w-1 bg-cyan-400 rounded-full animate-sound-wave h-4" style={{ animationDelay: "300ms" }} />
                <span className="w-1 bg-primary rounded-full animate-sound-wave h-7" style={{ animationDelay: "450ms" }} />
                <span className="w-1 bg-blue-500 rounded-full animate-sound-wave h-4" style={{ animationDelay: "600ms" }} />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

