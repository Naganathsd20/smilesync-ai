"use client";

import { useState } from "react";
import { SignInButton, useUser } from "@clerk/nextjs";
import {
  UserIcon,
  StethoscopeIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function PortalSelectPage() {
  const { isSignedIn } = useUser();
  const [selectedPortal, setSelectedPortal] = useState<"PATIENT" | "STAFF">("PATIENT");

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* HEADER LOGO */}
      <div className="max-w-5xl mx-auto w-full flex items-center justify-between z-10">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 group-hover:border-primary/40 transition-colors">
            <Image
              src="/logosmileai.png"
              alt="SmileSync AI Logo"
              width={32}
              height={32}
              className="w-7 h-7 object-contain"
            />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-foreground">
            SmileSync<span className="text-primary ml-0.5">AI</span>
          </span>
        </Link>
        <Link
          href="/"
          className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to Main Site
        </Link>
      </div>

      {/* PORTAL SELECTION HERO CONTAINER */}
      <div className="max-w-4xl mx-auto w-full my-auto py-8 z-10 space-y-8 text-center">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
            <SparklesIcon className="w-3.5 h-3.5" />
            SmileSync AI Dual Portal Access
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground">
            Welcome to SmileSync AI
          </h1>
          <p className="text-base text-muted-foreground max-w-xl mx-auto">
            Choose your portal destination to access customized dental tools, AI care plans, or clinic operations.
          </p>
        </div>

        {/* 2-CARD SELECTION GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          
          {/* CARD 1 — PATIENT PORTAL */}
          <div
            onClick={() => setSelectedPortal("PATIENT")}
            className={`group cursor-pointer rounded-3xl border p-7 transition-all duration-300 flex flex-col justify-between relative overflow-hidden ${
              selectedPortal === "PATIENT"
                ? "bg-card/90 border-primary/50 ring-2 ring-primary/40 shadow-xl shadow-primary/10"
                : "bg-card/60 border-border/60 hover:border-primary/30 hover:bg-card/80"
            }`}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-500">
                  <UserIcon className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold text-blue-500 uppercase tracking-widest bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">
                  Patient Portal
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                  Patient Access
                </h3>
                <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                  Personalized AI dental care, risk assessments, Nova assistant, reminders, appointments & care plans.
                </p>
              </div>

              <ul className="space-y-2 text-xs text-muted-foreground pt-2">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  AI Oral Health Risk Assessment
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                  24/7 Educational AI Assistant (Nova)
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  Personal Care Plans & Booking
                </li>
              </ul>
            </div>

            <div className="pt-6">
              {isSignedIn ? (
                <Link
                  href="/dashboard"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm shadow-md hover:bg-primary/90 transition-colors"
                >
                  Enter Patient Portal
                  <ArrowRightIcon className="w-4 h-4" />
                </Link>
              ) : (
                <SignInButton
                  mode="modal"
                  forceRedirectUrl="/portal-redirect?portal=patient"
                >
                  <button className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm shadow-md hover:bg-primary/90 transition-colors">
                    Continue to Patient Portal
                    <ArrowRightIcon className="w-4 h-4" />
                  </button>
                </SignInButton>
              )}
            </div>
          </div>

          {/* CARD 2 — PROFESSIONAL / STAFF PORTAL */}
          <div
            onClick={() => setSelectedPortal("STAFF")}
            className={`group cursor-pointer rounded-3xl border p-7 transition-all duration-300 flex flex-col justify-between relative overflow-hidden ${
              selectedPortal === "STAFF"
                ? "bg-card/90 border-emerald-500/50 ring-2 ring-emerald-500/40 shadow-xl shadow-emerald-500/10"
                : "bg-card/60 border-border/60 hover:border-emerald-500/30 hover:bg-card/80"
            }`}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                  <StethoscopeIcon className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  Staff Portal
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-foreground group-hover:text-emerald-500 transition-colors">
                  Professional / Staff
                </h3>
                <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                  Clinic management operations — oversight of appointments, patient directory, dentists & scheduling.
                </p>
              </div>

              <ul className="space-y-2 text-xs text-muted-foreground pt-2">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Clinic Dashboard & Operations
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  Appointment Management & Scheduling
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  Staff Dentists Directory & Availability
                </li>
              </ul>
            </div>

            <div className="pt-6">
              {isSignedIn ? (
                <Link
                  href="/portal-redirect?portal=staff"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 text-white font-bold text-sm shadow-md hover:bg-emerald-700 transition-colors"
                >
                  Enter Staff Portal
                  <ArrowRightIcon className="w-4 h-4" />
                </Link>
              ) : (
                <SignInButton
                  mode="modal"
                  forceRedirectUrl="/portal-redirect?portal=staff"
                >
                  <button className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 text-white font-bold text-sm shadow-md hover:bg-emerald-700 transition-colors">
                    Continue to Staff Portal
                    <ArrowRightIcon className="w-4 h-4" />
                  </button>
                </SignInButton>
              )}
            </div>
          </div>
        </div>

        {/* SECURITY NOTICE */}
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground bg-muted/20 border border-border/40 rounded-full px-4 py-2 max-w-md mx-auto">
          <ShieldCheckIcon className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Server-side security enforces verified staff & admin permissions.</span>
        </div>
      </div>

      {/* FOOTER */}
      <div className="max-w-5xl mx-auto w-full text-center text-xs text-muted-foreground z-10">
        © {new Date().getFullYear()} SmileSync AI Dental Health Platform. All rights reserved.
      </div>
    </div>
  );
}
