import { SignInButton, SignUpButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

function Footer() {
  return (
    <footer className="border-t border-border/50 bg-card/40 backdrop-blur-xl pt-10 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* BRAND COLUMN */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-xl bg-primary/10 border border-primary/20">
                <Image
                  src="/logosmileai2.png"
                  alt="SmileSync AI Logo"
                  width={32}
                  height={32}
                  className="w-7 h-7 object-contain"
                />
              </div>
              <span className="font-extrabold text-base text-foreground">
                SmileSync<span className="text-primary ml-0.5">AI</span>
              </span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed">
              AI-powered dental care and clinic management platform. Guiding
              patients, powering clinic operations, and connecting care.
            </p>
          </div>

          {/* PLATFORM LINKS */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Platform
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <a
                  href="#ai-care"
                  className="hover:text-primary transition-colors"
                >
                  AI Care
                </a>
              </li>
              <li>
                <Link
                  href="/assessment"
                  className="hover:text-primary transition-colors"
                >
                  Assessment
                </Link>
              </li>
              <li>
                <Link
                  href="/care-plan"
                  className="hover:text-primary transition-colors"
                >
                  Care Plans
                </Link>
              </li>
              <li>
                <Link
                  href="/appointments"
                  className="hover:text-primary transition-colors"
                >
                  Appointments
                </Link>
              </li>
              <li>
                <Link
                  href="/reminders"
                  className="hover:text-primary transition-colors"
                >
                  Reminders
                </Link>
              </li>
              <li>
                <Link
                  href="/voice"
                  className="hover:text-primary transition-colors"
                >
                  Voice Assistant
                </Link>
              </li>
            </ul>
          </div>

          {/* FOR PROFESSIONALS */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              For Professionals
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <Link
                  href="/portal-select"
                  className="hover:text-primary transition-colors"
                >
                  Professional Portal
                </Link>
              </li>
              <li>
                <Link
                  href="/appointments"
                  className="hover:text-primary transition-colors"
                >
                  Appointments
                </Link>
              </li>
              <li>
                <Link
                  href="/portal-select"
                  className="hover:text-primary transition-colors"
                >
                  Patients
                </Link>
              </li>
              <li>
                <Link
                  href="/portal-select"
                  className="hover:text-primary transition-colors"
                >
                  Dentists
                </Link>
              </li>
              <li>
                <Link
                  href="/portal-select"
                  className="hover:text-primary transition-colors"
                >
                  Availability
                </Link>
              </li>
            </ul>
          </div>

          {/* ACCOUNT & PORTALS */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Account
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <SignInButton mode="modal" forceRedirectUrl="/portal-redirect">
                  <button className="hover:text-primary transition-colors">
                    Login
                  </button>
                </SignInButton>
              </li>
              <li>
                <SignUpButton mode="modal" forceRedirectUrl="/portal-redirect">
                  <button className="hover:text-primary transition-colors">
                    Sign Up
                  </button>
                </SignUpButton>
              </li>
              <li>
                <Link
                  href="/portal-select"
                  className="hover:text-primary transition-colors"
                >
                  Choose Portal
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* COPYRIGHT BOTTOM BAR */}
        <div className="border-t border-border/40 mt-8 pt-5 text-center text-xs text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            &copy; {new Date().getFullYear()} SmileSync AI — AI-Powered Dental
            Care & Clinic Management Platform.
          </p>
          <p className="text-[11px] text-muted-foreground/70">
            Educational & clinic management tool.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
