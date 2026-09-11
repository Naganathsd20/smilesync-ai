"use client";

import { useState } from "react";
import { UserButton } from "@clerk/nextjs";
import {
  CalendarIcon,
  CrownIcon,
  HomeIcon,
  MicIcon,
  ActivityIcon,
  BotIcon,
  HeartPulseIcon,
  BellIcon,
  TrendingUpIcon,
  MenuIcon,
  XIcon,
  SparklesIcon,
  UserCircleIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: HomeIcon,
      iconColor: "text-blue-500",
    },
    {
      href: "/insights",
      label: "Insights",
      icon: TrendingUpIcon,
      iconColor: "text-cyan-500",
    },
    {
      href: "/nova",
      label: "Nova",
      icon: BotIcon,
      iconColor: "text-primary",
    },
    {
      href: "/care-plan",
      label: "Care Plan",
      icon: HeartPulseIcon,
      iconColor: "text-emerald-500",
    },
    {
      href: "/assessment",
      label: "Assessment",
      icon: ActivityIcon,
      iconColor: "text-indigo-500",
    },
    {
      href: "/reminders",
      label: "Reminders",
      icon: BellIcon,
      iconColor: "text-amber-500",
    },
    {
      href: "/appointments",
      label: "Appointments",
      icon: CalendarIcon,
      iconColor: "text-blue-400",
    },
    {
      href: "/voice",
      label: "Voice",
      icon: MicIcon,
      iconColor: "text-rose-500",
    },
  ];

  return (
    <nav className="fixed top-3 left-1/2 -translate-x-1/2 w-[calc(100%-1.5rem)] max-w-7xl z-50 transition-all duration-300">
      {/* Floating Glass Container */}
      <div className="bg-card/75 dark:bg-card/65 backdrop-blur-xl border border-white/10 dark:border-white/10 border-border/60 shadow-xl shadow-black/10 rounded-2xl md:rounded-full px-3.5 sm:px-5 py-2 transition-all duration-300">
        <div className="flex items-center justify-between h-11">
          {/* LOGO */}
          <div className="flex items-center gap-3 lg:gap-6 shrink-0">
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 group focus:outline-none focus:ring-2 focus:ring-primary/40 rounded-xl px-1.5 py-1"
            >
              <div className="relative w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl bg-primary/10 border border-primary/20 group-hover:border-primary/40 transition-colors">
                <Image
                  src="/logosmileai.png"
                  alt="SmileSync AI Logo"
                  width={32}
                  height={32}
                  className="w-7 h-7 sm:w-8 sm:h-8 object-contain"
                />
              </div>
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-foreground hidden sm:inline-block">
                SmileSync<span className="text-primary ml-0.5">AI</span>
              </span>
            </Link>

            {/* DESKTOP NAVIGATION LINKS */}
            <div className="hidden xl:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                      isActive
                        ? "bg-primary/15 text-primary border border-primary/25 shadow-sm font-semibold"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/40 border border-transparent"
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${item.iconColor}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              {/* MY PROFILE LINK */}
              <Link
                href="/profile"
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                  pathname === "/profile"
                    ? "bg-primary/15 text-primary border border-primary/25 shadow-sm font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40 border border-transparent"
                }`}
              >
                <UserCircleIcon className="w-3.5 h-3.5 text-violet-400" />
                <span>Profile</span>
              </Link>

              {/* PRO ITEM (VISUALLY SPECIAL) */}
              <Link
                href="/pro"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition-all duration-200 ${
                  pathname === "/pro"
                    ? "bg-gradient-to-r from-amber-500/25 via-purple-500/25 to-primary/25 text-amber-500 dark:text-amber-300 border border-amber-500/60 shadow-md font-bold"
                    : "bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-primary/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:border-amber-500/50 shadow-sm font-semibold"
                }`}
              >
                <CrownIcon className="w-3.5 h-3.5 text-amber-500" />
                <span>Pro</span>
                <SparklesIcon className="w-2.5 h-2.5 text-amber-400 animate-pulse" />
              </Link>
            </div>
          </div>

          {/* RIGHT SECTION: USER PROFILE + MOBILE TOGGLE */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* DIVIDER FOR DESKTOP */}
            <div className="h-5 w-[1px] bg-border/60 hidden xl:block" />

            {/* USER PROFILE */}
            <div className="flex items-center gap-2.5">
              <div className="p-0.5 rounded-full ring-1 ring-border/50 hover:ring-primary/40 transition-all">
                <UserButton
                  appearance={{
                    elements: {
                      userPreview: "hidden",
                    },
                  }}
                />
              </div>
            </div>

            {/* MOBILE MENU TOGGLE BUTTON (Screens < xl) */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-border/40 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? (
                <XIcon className="w-5 h-5" />
              ) : (
                <MenuIcon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* MOBILE / TABLET DROPDOWN MENU (Screens < xl) */}
        {mobileMenuOpen && (
          <div className="xl:hidden mt-3 pt-3 border-t border-border/50 grid grid-cols-2 sm:grid-cols-3 gap-1.5 pb-1 animate-in fade-in slide-in-from-top-2 duration-200">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-primary/15 text-primary border border-primary/25 font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40 border border-transparent"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${item.iconColor}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* MY PROFILE IN MOBILE MENU */}
            <Link
              href="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                pathname === "/profile"
                  ? "bg-primary/15 text-primary border border-primary/25 font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40 border border-transparent"
              }`}
            >
              <UserCircleIcon className="w-4 h-4 text-violet-400" />
              <span>My Profile</span>
            </Link>

            {/* PRO ITEM IN MOBILE MENU */}
            <Link
              href="/pro"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs whitespace-nowrap col-span-2 sm:col-span-1 transition-all ${
                pathname === "/pro"
                  ? "bg-gradient-to-r from-amber-500/25 via-purple-500/25 to-primary/25 text-amber-400 border border-amber-500/60 font-bold"
                  : "bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-primary/10 text-amber-500 dark:text-amber-400 border border-amber-500/30 font-semibold"
              }`}
            >
              <div className="flex items-center gap-2">
                <CrownIcon className="w-4 h-4 text-amber-500" />
                <span>Pro Upgrade</span>
              </div>
              <SparklesIcon className="w-3 h-3 text-amber-400" />
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
