"use client";

import Link from "next/link";
import { Instagram, Linkedin, Mail } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useRef } from "react";
import { gsap } from "gsap";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Timeline", href: "/timeline" },
  { name: "Team", href: "/team" },
  { name: "Judges & Mentors", href: "/judges" },
  {
    name: "Register",
    href: "https://unstop.com/o/szmvO5g?lb=2CqWo19U&utm_medium=Share&utm_source=shortUrl",
  },
];

export default function Footer() {
  // Hover background colors for nav links
  const hoverBgColors = [
    "hover:bg-[#c5ffc9]",
    "hover:bg-[#f9ffa5]",
    "hover:bg-[#feaac0]",
    "hover:bg-[#dcd0fe]",
    "hover:bg-[#feaac0]",
  ];

  // For nav link refs
  const linkRefs = useRef([]);

  return (
    <div className="w-full min-h-screen flex flex-col justify-center items-center bg-[#141414] px-4 md:px-16 border-[#222] overflow-x-hidden">
      <div className="w-full min-h-screen max-w-6xl bg-[#fcf2e8] border border-[#e5e5e5] rounded-2xl flex flex-col justify-between p-4 md:p-8 my-8 shadow-xl">
        {/* Main Content: Centered Logo */}
        <div className="flex flex-col items-center justify-center w-full md:w-[55%] mx-auto mt-8 mb-8">
          <img
            src="/assets/hackwave-logo.svg"
            alt="Hackwave Logo"
            className="w-16 h-16 md:w-20 md:h-20 object-contain mx-auto"
          />
        </div>
        {/* Nav Links: Row on desktop, grid on mobile */}
        <div className="w-full mt-8">
          {/* Navigation Heading */}
          <h2 className="text-[#141414] font-bold uppercase text-base md:text-lg tracking-widest mb-2 md:mb-4 text-center">
            Navigation
          </h2>
          <div className="hidden md:flex flex-row justify-between items-center gap-4 w-full">
            {navLinks.map((link, i) => (
              <Link
                key={link.name}
                href={link.href}
                ref={(el) => {
                  linkRefs.current[i] = el;
                }}
                className={`text-[#141414] border-4 border-transparent transition-colors font-extrabold text-xl md:text-3xl uppercase px-2 md:px-4 py-3 md:py-4 rounded text-center w-full block ${
                  hoverBgColors[i % hoverBgColors.length]
                } hover:text-black hover:border-4 hover:border-[#141414]`}
                onMouseEnter={() => {
                  if (linkRefs.current[i]) {
                    gsap.to(linkRefs.current[i], {
                      borderRadius: "4rem",
                      duration: 0.5,
                      ease: "power2.out",
                    });
                  }
                }}
                onMouseLeave={() => {
                  if (linkRefs.current[i]) {
                    gsap.to(linkRefs.current[i], {
                      borderRadius: "0.5rem",
                      duration: 0.3,
                      ease: "power2.in",
                    });
                  }
                }}
              >
                {link.name}
              </Link>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4 w-full md:hidden mt-4 ">
            {navLinks.map((link, i) => (
              <Link
                key={link.name}
                href={link.href}
                ref={(el) => {
                  linkRefs.current[i] = el;
                }}
                className={`text-[#141414]  border-4 border-transparent transition-colors font-extrabold text-lg uppercase px-2 py-3 rounded text-center w-full block ${
                  hoverBgColors[i % hoverBgColors.length]
                } hover:text-black hover:border-4 hover:border-[#141414]`}
                onMouseEnter={() => {
                  if (linkRefs.current[i]) {
                    gsap.to(linkRefs.current[i], {
                      borderRadius: "4rem",
                      duration: 0.5,
                      ease: "power2.out",
                    });
                  }
                }}
                onMouseLeave={() => {
                  if (linkRefs.current[i]) {
                    gsap.to(linkRefs.current[i], {
                      borderRadius: "0.5rem",
                      duration: 0.3,
                      ease: "power2.in",
                    });
                  }
                }}
              >
                {link.name}
              </Link>
            ))}
          </div>
          {/* Socials Heading */}
          <h2 className="text-[#141414] font-bold uppercase text-base md:text-lg tracking-widest mt-8 mb-2 md:mb-4 text-center">
            Connect
          </h2>
          {/* Socials Row */}
          <div className="flex flex-row justify-center items-center gap-6 w-full mt-2">
            <a
              href="https://www.instagram.com/echelondevsociety"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-[#ffe4ec] flex items-center justify-center hover:bg-[#ffd6e6] transition-colors duration-200 group"
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5 text-[#c13584] group-hover:text-[#a14c7e] transition-colors duration-200" />
            </a>
            <a
              href="https://www.linkedin.com/company/echelondevsociety/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-[#e6f0ff] flex items-center justify-center hover:bg-[#d6eaff] transition-colors duration-200 group"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-5 h-5 text-[#0077b5] group-hover:text-[#4a90e2] transition-colors duration-200" />
            </a>
            <a
              href="https://mail.google.com/mail/?view=cm&fs=1&to=eds@cdgi.edu.in"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-[#ffeaea] flex items-center justify-center hover:bg-[#ffd6d6] transition-colors duration-200 group"
              aria-label="Mail"
            >
              <Mail className="w-5 h-5 text-[#ea4335] group-hover:text-[#e57373] transition-colors duration-200" />
            </a>
          </div>
        </div>
        {/* Copyright */}
        <div className="w-full text-center text-[#666] text-xs mt-8">
          &copy; 2025 Hackwave. All rights reserved.
        </div>
      </div>
    </div>
  );
}
