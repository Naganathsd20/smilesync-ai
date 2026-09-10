"use client";

import { useState } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import {
  CalendarCheckIcon,
  HomeIcon,
  StethoscopeIcon,
  UsersIcon,
  ClockIcon,
  MenuIcon,
  XIcon,
  UserCheckIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

function StaffNavbar() {
  const { user } = useUser();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const staffNavItems = [
    {
      href: "/staff",
      label: "Dashboard",
      icon: HomeIcon,
      iconColor: "text-blue-500",
    },
    {
      href: "/staff/appointments",
      label: "Appointments",
      icon: CalendarCheckIcon,
      iconColor: "text-emerald-500",
    },
    {
      href: "/staff/patients",
      label: "Patients",
      icon: UsersIcon,
      iconColor: "text-cyan-500",
    },
    {
      href: "/staff/doctors",
      label: "Dentists",
      icon: StethoscopeIcon,
      iconColor: "text-indigo-500",
    },
    {
      href: "/staff/availability",
      label: "Availability",
      icon: ClockIcon,
      iconColor: "text-amber-500",
    },
  ];

  return (
    <nav className="fixed top-3 left-1/2 -translate-x-1/2 w-[calc(100%-1.5rem)] max-w-7xl z-50 transition-all duration-300">
      {/* Floating Glass Container */}
      <div className="bg-card/80 dark:bg-card/70 backdrop-blur-xl border border-emerald-500/20 shadow-xl shadow-emerald-500/5 rounded-2xl md:rounded-full px-3.5 sm:px-5 py-2 transition-all duration-300">
        <div className="flex items-center justify-between h-11">
          {/* LOGO & STAFF PORTAL BADGE */}
          <div className="flex items-center gap-3 lg:gap-6 shrink-0">
            <Link
              href="/staff"
              className="flex items-center gap-2.5 group focus:outline-none focus:ring-2 focus:ring-emerald-500/40 rounded-xl px-1.5 py-1"
            >
              <div className="relative w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/30 group-hover:border-emerald-500/50 transition-colors">
                <Image
                  src="/logosmileai.png"
                  alt="SmileSync AI Logo"
                  width={32}
                  height={32}
                  className="w-7 h-7 sm:w-8 sm:h-8 object-contain"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-foreground hidden sm:inline-block">
                  SmileSync<span className="text-emerald-500 ml-0.5">Staff</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  Clinic Portal
                </span>
              </div>
            </Link>

            {/* DESKTOP STAFF NAVIGATION LINKS */}
            <div className="hidden lg:flex items-center gap-1">
              {staffNavItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                      isActive
                        ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 shadow-sm font-bold"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/40 border border-transparent"
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${item.iconColor}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* RIGHT SECTION: PATIENT PORTAL SWITCH + USER PROFILE */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* SWITCH TO PATIENT PORTAL */}
            <Link
              href="/dashboard"
              className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground bg-muted/30 border border-border/50 hover:border-border px-2.5 py-1 rounded-full transition-all"
              title="Switch to Patient Portal View"
            >
              <UserCheckIcon className="w-3.5 h-3.5 text-blue-400" />
              <span>Patient View</span>
            </Link>

            {/* DIVIDER FOR DESKTOP */}
            <div className="h-5 w-[1px] bg-border/60 hidden lg:block" />

            {/* USER PROFILE */}
            <div className="flex items-center gap-2.5">
              <div className="hidden md:flex flex-col items-end text-right">
                <span className="text-xs font-semibold text-foreground leading-tight">
                  {user?.firstName} {user?.lastName}
                </span>
                <span className="text-[10px] text-emerald-500 font-medium leading-tight">
                  Staff / Clinic Admin
                </span>
              </div>

              <div className="p-0.5 rounded-full ring-1 ring-emerald-500/30 hover:ring-emerald-500/60 transition-all">
                <UserButton />
              </div>
            </div>

            {/* MOBILE MENU TOGGLE BUTTON (Screens < lg) */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-border/40 transition-colors"
              aria-label="Toggle Staff Navigation Menu"
            >
              {mobileMenuOpen ? (
                <XIcon className="w-5 h-5" />
              ) : (
                <MenuIcon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* MOBILE / TABLET DROPDOWN MENU (Screens < lg) */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-3 pt-3 border-t border-border/50 grid grid-cols-2 sm:grid-cols-3 gap-1.5 pb-1 animate-in fade-in slide-in-from-top-2 duration-200">
            {staffNavItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 font-bold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40 border border-transparent"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${item.iconColor}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 col-span-2 sm:col-span-1"
            >
              <div className="flex items-center gap-2">
                <UserCheckIcon className="w-4 h-4 text-blue-400" />
                <span>Patient Portal</span>
              </div>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

export default StaffNavbar;
