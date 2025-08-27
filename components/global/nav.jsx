'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import Copy from '@/components/ui/textAnimation/Copy'
import { PillMenu } from '@/components/ui/morphDropdown'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const closeMenu = () => {
    if (isMenuOpen) {
      setIsMenuOpen(false)
    }
  }

  return (
    <nav className="fixed top-0 left-0 w-screen px-4 md:px-[1.5em] py-4 md:py-[1.5em] flex justify-between z-20">
      <div className="flex justify-between items-start w-full z-10001">
        {/* Logo - Left side */}
        <Copy animateOnScroll={false} delay={0.2}>
          <Link
            href="/"
            className="text-[#fcf2e8] text-xl md:text-2xl font-bold justify-center
           px-4 items-center cursor-pointer h-12 flex  overflow-hidden rounded-2xl bg-[#141414] will-change-[height,border-radius]  border border-[#333]"
            onClick={closeMenu}
          >
            HACKWAVE
          </Link>
        </Copy>

        {/* Right Side - Join Now Button + Hamburger (Desktop & Mobile) */}
        <div className="flex items-center">
          {/* Join Now Button */}
          {/* <Link
            href="https://unstop.com/o/szmvO5g?lb=2CqWo19U&utm_medium=Share&utm_source=shortUrl"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold cursor-pointer px-4 md:px-6 py-1 md:py-1 bg-[#fcf2e8]/10 hover:bg-[#fcf2e8]/20 border border-[#fcf2e8]/20 text-[#fcf2e8] rounded-xl text-sm md:text-base transition-all duration-150 hover:scale-105 transform mix-blend-normal inline-block"
          >
            Join Now
          </Link> */}

          {/* Hamburger Menu with Dropdown */}
          <PillMenu />
        </div>
      </div>
    </nav>
  )
}

export default Navbar
