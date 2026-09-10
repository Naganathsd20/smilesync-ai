import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { LayoutGridIcon } from "lucide-react";

function Header() {
  return (
    <nav className="fixed top-0 right-0 left-0 z-50 px-6 py-2 border-b border-border/50 bg-background/80 backdrop-blur-md h-16">
      <div className="max-w-6xl mx-auto flex justify-between items-center h-full">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logosmileai.png"
            alt="SmileSync AI Logo"
            width={32}
            height={32}
            className="w-9 h-9 object-contain"
          />
          <span className="font-bold text-base tracking-tight text-foreground">
            SmileSync<span className="text-primary ml-0.5">AI</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm">
          <a
            href="#"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            How it Works
          </a>
          <a
            href="#"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Pricing
          </a>
          <a
            href="#"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            About Us
          </a>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/portal-select">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold">
              <LayoutGridIcon className="w-3.5 h-3.5 text-primary" />
              Choose Portal
            </Button>
          </Link>

          <SignInButton mode="modal" forceRedirectUrl="/portal-redirect">
            <Button variant="ghost" size="sm" className="text-xs">
              Login
            </Button>
          </SignInButton>

          <SignUpButton mode="modal" forceRedirectUrl="/portal-redirect">
            <Button size="sm" className="text-xs font-semibold">
              Sign Up
            </Button>
          </SignUpButton>
        </div>
      </div>
    </nav>
  );
}

export default Header;