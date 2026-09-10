"use client";

import { useState } from "react";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { LayoutGridIcon, MenuIcon, XIcon } from "lucide-react";

function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 right-0 left-0 z-50 px-4 sm:px-6 py-2 border-b border-border/50 bg-background/80 backdrop-blur-xl h-16 transition-all duration-300">
      <div className="max-w-6xl mx-auto flex justify-between items-center h-full">
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="p-1.5 rounded-xl bg-primary/10 border border-primary/20 group-hover:border-primary/40 transition-colors">
            <Image
              src="/logosmileai.png"
              alt="SmileSync AI Logo"
              width={32}
              height={32}
              className="w-7 h-7 object-contain"
            />
          </div>
          <span className="font-extrabold text-base tracking-tight text-foreground">
            SmileSync<span className="text-primary ml-0.5">AI</span>
          </span>
        </Link>

        {/* DESKTOP NAVIGATION LINKS */}
        <nav className="hidden lg:flex items-center gap-7 text-xs font-medium text-muted-foreground">
          <a
            href="#ai-care"
            className="hover:text-primary transition-colors py-1"
          >
            AI Care
          </a>
          <a
            href="#appointments"
            className="hover:text-primary transition-colors py-1"
          >
            Appointments
          </a>
          <a
            href="#professionals"
            className="hover:text-primary transition-colors py-1"
          >
            For Professionals
          </a>
          <a
            href="#how-it-works"
            className="hover:text-primary transition-colors py-1"
          >
            How It Works
          </a>
          <a
            href="#pricing"
            className="hover:text-primary transition-colors py-1"
          >
            Pricing
          </a>
        </nav>

        {/* RIGHT ACTIONS */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/portal-select">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold rounded-xl border-primary/20 hover:border-primary/40 hover:bg-primary/5">
              <LayoutGridIcon className="w-3.5 h-3.5 text-primary" />
              Choose Portal
            </Button>
          </Link>

          <SignInButton mode="modal" forceRedirectUrl="/portal-redirect">
            <Button variant="ghost" size="sm" className="text-xs font-semibold rounded-xl">
              Login
            </Button>
          </SignInButton>

          <SignUpButton mode="modal" forceRedirectUrl="/portal-redirect">
            <Button size="sm" className="text-xs font-semibold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20">
              Sign Up
            </Button>
          </SignUpButton>
        </div>

        {/* MOBILE MENU TOGGLE */}
        <div className="flex md:hidden items-center gap-2">
          <Link href="/portal-select">
            <Button variant="outline" size="sm" className="gap-1 text-xs px-2.5 py-1 rounded-lg">
              <LayoutGridIcon className="w-3 h-3 text-primary" />
              Portal
            </Button>
          </Link>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl border border-border/60 bg-muted/20 text-muted-foreground hover:text-foreground"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <XIcon className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* MOBILE DROPDOWN MENU */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-background/95 backdrop-blur-2xl border-b border-border/60 p-6 space-y-4 shadow-2xl animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-3 text-sm font-medium text-muted-foreground">
            <a
              href="#ai-care"
              onClick={() => setIsMobileMenuOpen(false)}
              className="hover:text-primary transition-colors py-1 border-b border-border/30 pb-2"
            >
              AI Care Companion
            </a>
            <a
              href="#appointments"
              onClick={() => setIsMobileMenuOpen(false)}
              className="hover:text-primary transition-colors py-1 border-b border-border/30 pb-2"
            >
              Appointment Booking
            </a>
            <a
              href="#professionals"
              onClick={() => setIsMobileMenuOpen(false)}
              className="hover:text-primary transition-colors py-1 border-b border-border/30 pb-2"
            >
              For Professionals
            </a>
            <a
              href="#how-it-works"
              onClick={() => setIsMobileMenuOpen(false)}
              className="hover:text-primary transition-colors py-1 border-b border-border/30 pb-2"
            >
              How It Works
            </a>
            <a
              href="#pricing"
              onClick={() => setIsMobileMenuOpen(false)}
              className="hover:text-primary transition-colors py-1 border-b border-border/30 pb-2"
            >
              Pricing
            </a>
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <SignInButton mode="modal" forceRedirectUrl="/portal-redirect">
              <Button variant="outline" className="w-full text-xs font-semibold rounded-xl">
                Login
              </Button>
            </SignInButton>

            <SignUpButton mode="modal" forceRedirectUrl="/portal-redirect">
              <Button className="w-full text-xs font-semibold rounded-xl bg-primary text-primary-foreground">
                Sign Up
              </Button>
            </SignUpButton>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;