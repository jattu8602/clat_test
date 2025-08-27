// components/ui/PillMenu.tsx

"use client";

import { useState, useEffect, useRef, FC } from "react";
import * as Collapsible from "@radix-ui/react-collapsible";
import gsap from "gsap";
import { Instagram, Linkedin, Mail } from "lucide-react";
import { Button } from "./button";
import Link from "next/link";
import { useSession, signIn, signOut } from 'next-auth/react'
export const PillMenu= () => {
  const [isOpen, setIsOpen] = useState(false)
  const [progress, setProgress] = useState(0)
  const timelineRef = useRef(null)
  const containerRef = useRef(null)
  const hamburgerRef = useRef(null)
  const menuRef = useRef(null)
  const { data: session, status } = useSession() // check login status

  // if status === "loading", you can show skeleton or nothing
  const isLoggedIn = !!session

  // useEffect to set up the animation timeline
  useEffect(() => {
    if (!containerRef.current) return

    const items = gsap.utils.toArray < HTMLElement > '.menu-item'

    // Create a paused timeline with improved easing
    timelineRef.current = gsap.timeline({
      paused: true,
      onUpdate: function () {
        // Track progress (0 to 1)
        setProgress(this.progress())
      },
    })

    // Enhanced animation sequence with pulling down effect
    timelineRef.current
      .to(containerRef.current, {
        height: '520px', // Dynamic height based on content
        width: '14rem', // w-56 equivalent
        duration: 0.6,
        ease: 'power3.out',
      })
      .to(
        items,
        {
          opacity: 1,
          y: 0,
          stagger: 0.08, // Slower stagger for fewer items
          duration: 0.5,
          ease: 'power2.out',
        },
        '-=0.3'
      )

    return () => {
      timelineRef.current?.kill()
    }
  }, [])

  // useEffect to control the animation based on the `isOpen` state
  useEffect(() => {
    if (isOpen) {
      timelineRef.current?.play()
    } else {
      timelineRef.current?.reverse()
    }
  }, [isOpen])

  // Click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Calculate opacity based on progress
  const getItemOpacity = (index) => {
    const baseProgress = progress
    const itemDelay = index * 0.08 // Same as stagger timing
    const itemProgress = Math.max(
      0,
      Math.min(1, (baseProgress - itemDelay) / 0.3)
    )

    // For reverse animation (closing), all items fade out together in sync
    if (!isOpen && progress < 1) {
      // Use the same progress for all items during closing
      return Math.max(0, Math.min(1, progress))
    }

    return itemProgress
  }

  return (
    <div className="relative z-50" ref={menuRef}>
      <Collapsible.Root open={isOpen} onOpenChange={setIsOpen}>
        {/* Container with consistent design system */}
        <div
          ref={containerRef}
          className="h-14 w-12 md:w-40 rounded-2xl bg-[#141414] will-change-[height,border-radius] border border-[#333]"
        >
          <div className="px-2 py-1">
            {/* Enhanced trigger with Join Now button and hamburger menu */}
            <div className="flex items-center h-full justify-between">
              <div className="flex items-center justify-center">
                {/* Desktop Button */}
                {isLoggedIn ? (
                  <Link
                    href="/dashboard"
                    className="hidden md:flex items-center justify-center px-3 py-3 text-[#e6d9cf] rounded-lg font-black text-sm hover:bg-[#feaac0] hover:text-[#141414] transition-colors duration-200"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <button
                    onClick={() => signIn()} // next-auth login popup
                    className="hidden md:flex items-center justify-center px-3 py-3 text-[#e6d9cf] rounded-lg font-black text-sm hover:bg-[#feaac0] hover:text-[#141414] transition-colors duration-200"
                  >
                    Login
                  </button>
                )}
              </div>

              {/* Hamburger Menu Icon */}
              <Collapsible.Trigger asChild>
                <Button className="flex items-center justify-center w-8 h-12 text-[#fcf2e8]  hover:bg-[#222] rounded-2xl transition-colors duration-200 md:px-2 md:pb-3 md:pt-2 md:pl-2 md:pr-4 p-2">
                  <div
                    ref={hamburgerRef}
                    className="flex flex-col justify-center items-center w-5 h-5 relative"
                  >
                    {/* Hamburger lines that transform to X */}
                    <div
                      className={`w-5 h-0.5 bg-current transition-all duration-300 ease-in-out ${
                        isOpen ? 'rotate-45 translate-y-1' : ''
                      }`}
                    ></div>
                    <div
                      className={`w-5 h-0.5 bg-current mt-1 transition-all duration-300 ease-in-out ${
                        isOpen ? 'opacity-0' : ''
                      }`}
                    ></div>
                    <div
                      className={`w-5 h-0.5 bg-current mt-1 transition-all duration-300 ease-in-out ${
                        isOpen ? '-rotate-45 -translate-y-1' : ''
                      }`}
                    ></div>
                  </div>
                </Button>
              </Collapsible.Trigger>
            </div>

            {/* Enhanced content with pulling down effect */}
            <Collapsible.Content>
              <div className="md:mt-6 flex flex-col  gap-2 px-3">
                {/* Join Now Button - Mobile Only */}
                <Link
                  href="https://unstop.com/o/szmvO5g?lb=2CqWo19U&utm_medium=Share&utm_source=shortUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="md:hidden menu-item translate-y-4 flex items-center justify-center px-4 py-3 bg-[#fcf2e8] text-[#141414] rounded-xl font-black text-base hover:bg-[#e6d9cf] transition-colors duration-200"
                  style={{
                    opacity: getItemOpacity(0),
                    transform: isOpen ? 'translateY(0)' : 'translateY(16px)',
                  }}
                >
                  Login
                </Link>

                <a
                  href="/"
                  className="menu-item translate-y-4 text-[#fcf2e8] flex items-center gap-3 p-3 rounded-xl hover:bg-[#222] transition-colors duration-200 group"
                  style={{
                    opacity: getItemOpacity(0),
                    transform: isOpen ? 'translateY(0)' : 'translateY(16px)',
                  }}
                >
                  <div className="flex flex-col">
                    <span className="font-black text-base">Home</span>
                    <span className="font-medium text-sm text-[#ccc]">
                      Back to main page
                    </span>
                  </div>
                </a>
                <a
                  href="/timeline"
                  className="menu-item translate-y-4 text-[#fcf2e8] flex items-center gap-3 p-3 rounded-xl hover:bg-[#222] transition-colors duration-200 group"
                  style={{
                    opacity: getItemOpacity(1),
                    transform: isOpen ? 'translateY(0)' : 'translateY(16px)',
                  }}
                >
                  <div className="flex flex-col">
                    <span className="font-black text-base">Timeline</span>
                    <span className="font-medium text-sm text-[#ccc]">
                      Event schedule
                    </span>
                  </div>
                </a>
                {/* <a
                  href="/hackwave-info"
                  className="menu-item translate-y-4 text-[#fcf2e8] flex items-center gap-3 p-3 rounded-xl hover:bg-[#222] transition-colors duration-200 group"
                  style={{
                    opacity: getItemOpacity(2),
                    transform: isOpen ? "translateY(0)" : "translateY(16px)",
                  }}
                >
                  <div className="flex flex-col">
                    <span className="font-black text-base">Hackwave Info</span>
                    <span className="font-medium text-sm text-[#ccc]">
                      Rules, prizes, and details
                    </span>
                  </div>
                </a> */}
                <a
                  href="/team"
                  className="menu-item translate-y-4 text-[#fcf2e8] flex items-center gap-3 p-3 rounded-xl hover:bg-[#222] transition-colors duration-200 group"
                  style={{
                    opacity: getItemOpacity(3),
                    transform: isOpen ? 'translateY(0)' : 'translateY(16px)',
                  }}
                >
                  <div className="flex flex-col">
                    <span className="font-black text-base">Team</span>
                    <span className="font-medium text-sm text-[#ccc]">
                      Meet the organizers
                    </span>
                  </div>
                </a>
                <a
                  href="/info"
                  className="menu-item translate-y-4 text-[#fcf2e8] flex items-center gap-3 p-3 rounded-xl hover:bg-[#222] transition-colors duration-200 group"
                  style={{
                    opacity: getItemOpacity(2),
                    transform: isOpen ? 'translateY(0)' : 'translateY(16px)',
                  }}
                >
                  <div className="flex flex-col">
                    <span className="font-black text-base">Information</span>
                    <span className="font-medium text-sm text-[#ccc]">
                      All Info About The Event
                    </span>
                  </div>
                </a>
                <a
                  href="#"
                  className="menu-item translate-y-4 text-[#fcf2e8] flex items-center gap-3 p-3 rounded-xl hover:bg-[#222] transition-colors duration-200 group"
                  style={{
                    opacity: getItemOpacity(3),
                    transform: isOpen ? 'translateY(0)' : 'translateY(16px)',
                  }}
                >
                  {/* <div className="flex flex-col">
                    <span className="font-black text-base">Sponsors</span>
                    <span className="font-medium text-sm text-[#ccc]">
                      Our partners
                    </span>
                  </div> */}
                </a>

                {/* Separator */}
                <div className="my-3 border border-[#333]"></div>

                {/* Social Media Icons Row */}
                <div className="flex justify-center gap-1">
                  {/* <a
                    href="https://x.com/devsociety_CDGI"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-[#333] flex items-center justify-center hover:bg-[#444] transition-colors duration-200 group"
                  >
                    <Twitter className="w-5 h-5 text-[#fcf2e8] group-hover:text-[#1DA1F2] transition-colors duration-200" />
                  </a> */}
                  <a
                    href="https://www.instagram.com/echelondevsociety"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-15 h-10 rounded-full bg-[#333] flex items-center justify-center hover:bg-[#444] transition-colors duration-200 group"
                  >
                    <Instagram className="w-5 h-5 text-[#fcf2e8] group-hover:text-[#E4405F] transition-colors duration-200" />
                  </a>
                  <a
                    href="https://www.linkedin.com/company/echelondevsociety/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-15 h-10 rounded-full bg-[#333] flex items-center justify-center hover:bg-[#444] transition-colors duration-200 group"
                  >
                    <Linkedin className="w-5 h-5 text-[#fcf2e8] group-hover:text-[#0A66C2] transition-colors duration-200" />
                  </a>
                  <a
                    href="https://mail.google.com/mail/?view=cm&fs=1&to=eds@cdgi.edu.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-15 h-10 rounded-full bg-[#333] flex items-center justify-center hover:bg-[#444] transition-colors duration-200 group"
                  >
                    <Mail className="w-5 h-5 text-[#fcf2e8] group-hover:text-[#EA4335] transition-colors duration-200" />
                  </a>
                </div>
              </div>
            </Collapsible.Content>
          </div>
        </div>
      </Collapsible.Root>
    </div>
  )
};
