import Image from "next/image";

import { currentUser } from "@clerk/nextjs/server";

export default async function WelcomeSection() {
  const user = await currentUser();

  const hours = new Date().getHours();
  const greeting =
    hours < 12
      ? "Good morning"
      : hours < 17
        ? "Good afternoon"
        : "Good evening";

  return (
    <div className="relative z-10 flex items-center justify-between bg-gradient-to-br from-primary/10 via-primary/5 to-background rounded-3xl p-5 sm:p-8 border border-primary/20 mb-8 sm:mb-12 overflow-hidden">
      <div className="space-y-3 sm:space-y-4 flex-1 min-w-0">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
          <div className="size-2 bg-primary rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-primary">
            Online & Ready
          </span>
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 break-words">
            {greeting},{" "}
            {user?.firstName ||
              user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] ||
              "Valued Patient"}
            ! 👋
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Your personal AI dental assistant is ready to help you maintain
            perfect oral health.
          </p>
        </div>
      </div>

      <div className="lg:flex hidden items-center justify-center size-32 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full ">
        <Image
          src="/logo.png"
          alt="SmileSync AI"
          width={64}
          height={64}
          className="w-16 h-16"
        />
      </div>
    </div>
  );
}
