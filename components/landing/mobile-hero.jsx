import React from 'react'
import TextReveal from '@/components/landing/about'

const MobileHero = () => {
  return (
    <>
      <section className="hero host-grotesk relative w-screen min-h-screen p-6 flex items-center justify-center text-[#141414] overflow-hidden border-24 border-[#141414]">
        {/* HERO HEADER - Logo and Tagline */}
        <div
          className="hero-header absolute left-1/2 top-1/2 flex items-center justify-between w-full"
          style={{ transform: 'translate(-50%, -30%)' }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-8xl px-4 md:px-8 gap-8 md:gap-0">
            {/* Center - Logo and Tagline */}
            <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-8xl px-4 md:px-8 gap-8 md:gap-0">
              {/* Center - Logo and Tagline */}
              <div className="flex flex-col items-center justify-center gap-4 md:gap-8 order-1 md:order-2">
                <img
                  className="hackwave-img w-48 md:w-auto"
                  src="/assets/hackwave-logo.svg"
                  alt="Hackwave Logo"
                />
                <img
                  className="hackwave-img w-48 md:w-auto"
                  src="/assets/bella-kawaii-edition.png"
                  alt="Hackwave Logo"
                />
              </div>
              <div className="flex items-center w-full justify-between gap-4 md:gap-8 order-1 md:order-2 ">
                {/* Left - Dates */}
                <div className="flex flex-col items-start text-left mt-8 md:mt-46 order-2 md:order-1">
                  <p className="text-lg md:text-2xl font-normal">
                    36 Hours Hackathon
                  </p>
                  <p className="text-base md:text-xl font-normal text-gray-600">
                    from
                  </p>
                  <p className="text-2xl md:text-3xl font-bold">
                    March 15-17, 2025
                  </p>
                </div>
                {/* Right - Info */}
                <div className="flex flex-col items-end text-right mt-8 md:mt-46 order-3 md:order-3">
                  <p className="text-lg md:text-2xl font-normal">Join 500+</p>
                  <p className="text-base md:text-xl font-normal text-gray-600">
                    developers
                  </p>
                  <p className="text-2xl md:text-3xl font-bold">$50K+ Prizes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <TextReveal />
    </>
  )
}

export default MobileHero
