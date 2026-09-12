import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MessageSquareIcon,
  CalendarIcon,
  ActivityIcon,
  SparklesIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import LatestAssessmentCard from "./LatestAssessmentCard";

export default function MainActions() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12">
      {/* AI Oral Health Risk Assessment */}
      <LatestAssessmentCard />

      {/* AI Voice Assistant */}
      <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/30">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        <CardContent className="relative p-5 sm:p-8 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center gap-3 sm:gap-4 mb-6">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shrink-0">
                <Image
                  src="/audio2.png"
                  alt="Voice AI"
                  width={32}
                  height={32}
                  className="w-8 sm:w-10"
                />
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">AI Voice Assistant</h3>
                <p className="text-muted-foreground text-xs sm:text-sm">
                  Get instant dental advice through voice calls
                </p>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full shrink-0"></div>
                <span className="text-xs sm:text-sm">24/7 availability</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full shrink-0"></div>
                <span className="text-xs sm:text-sm">Professional dental guidance</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full shrink-0"></div>
                <span className="text-xs sm:text-sm">Instant pain relief advice</span>
              </div>
            </div>
          </div>

          <Button
            asChild
            className="w-full mt-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-xs sm:text-sm"
          >
            <Link href="/voice">
              <MessageSquareIcon className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Start Voice Call
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Book Appointment */}
      <Card className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/30">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        <CardContent className="relative p-5 sm:p-8 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center gap-3 sm:gap-4 mb-6">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shrink-0">
                <Image
                  src="/calendar2.png"
                  alt="Calendar"
                  width={32}
                  height={32}
                  className="w-8 sm:w-10"
                />
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">Book Appointment</h3>
                <p className="text-muted-foreground text-xs sm:text-sm">
                  Schedule with verified dentists in your area
                </p>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full shrink-0"></div>
                <span className="text-xs sm:text-sm">Verified dental professionals</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full shrink-0"></div>
                <span className="text-xs sm:text-sm">Flexible scheduling</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full shrink-0"></div>
                <span className="text-xs sm:text-sm">Instant confirmations</span>
              </div>
            </div>
          </div>

          <Button
            asChild
            variant="outline"
            className="w-full mt-6 border-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 font-semibold py-3 rounded-xl transition-all duration-300 text-xs sm:text-sm"
          >
            <Link href="/appointments">
              <CalendarIcon className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Schedule Now
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
