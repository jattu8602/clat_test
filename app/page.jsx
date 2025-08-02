'use client'
import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import {
  GraduationCap,
  PlayCircle,
  Star,
  BrainCircuit,
  LayoutDashboard,
  ScrollText,
  Bot,
  Library,
  TrendingUp,
  Users,
  Rocket,
  CheckCircle,
  CreditCard,
  Zap,
  Play,
  Menu,
  X,
  ArrowRight,
} from 'lucide-react'

const CLATPrepLanding = () => {
  const { data: session, status } = useSession()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const startFreeTest = () => {
    window.location.href = '/login'
  }

  const purchaseNow = () => {
    window.location.href = '/login'
  }

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
    setIsMobileMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 overflow-x-hidden">
      {/* Floating Background Shapes */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div
          className="absolute top-1/4 left-1/4 w-16 sm:w-20 h-16 sm:h-20 bg-white/10 rounded-full animate-bounce"
          style={{ animationDelay: '0s', animationDuration: '6s' }}
        ></div>
        <div
          className="absolute top-3/4 right-1/4 w-12 sm:w-16 h-12 sm:h-16 bg-white/10 rounded-full animate-bounce"
          style={{ animationDelay: '2s', animationDuration: '8s' }}
        ></div>
        <div
          className="absolute bottom-1/4 left-1/3 w-20 sm:w-24 h-20 sm:h-24 bg-white/10 rounded-full animate-bounce"
          style={{ animationDelay: '4s', animationDuration: '10s' }}
        ></div>
      </div>

      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-lg shadow-lg'
            : 'bg-white/90 backdrop-blur-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 cursor-pointer hover:scale-105 transition-transform">
              <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600" />
              <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                CLATPrep
              </span>
            </div>

            {/* Desktop Action Button */}
            {session ? (
              <button
                onClick={() => (window.location.href = '/dashboard')}
                className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2 rounded-full font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={() => (window.location.href = '/login')}
                className="hidden sm:block bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-2 rounded-full font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
              >
                Login
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="sm:hidden p-2"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="sm:hidden bg-white/95 backdrop-blur-lg rounded-lg mt-2 p-4 shadow-lg">
              {session ? (
                <button
                  onClick={() => (window.location.href = '/dashboard')}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2 rounded-full font-semibold"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={() => (window.location.href = '/login')}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-2 rounded-full font-semibold"
                >
                  Login
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12 pt-16">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-16 xl:gap-20 items-center">
          {/* Hero Text */}
          <div className="text-center lg:text-left space-y-4 sm:space-y-6 lg:space-y-8 xl:space-y-10 animate-fade-in order-2 lg:order-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold text-white leading-tight">
              Master CLAT with{' '}
              <span className="bg-gradient-to-r from-pink-300 to-yellow-300 bg-clip-text text-transparent">
                AI-Powered
              </span>{' '}
              Mock Tests
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-white/90 max-w-2xl mx-auto lg:mx-0">
              Transform your CLAT preparation with our comprehensive mock test
              series, interactive dashboard, and personalized AI feedback.
              Experience real exam conditions and boost your confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 lg:gap-6 justify-center lg:justify-start">
              <button
                onClick={() => scrollToSection('try-free')}
                className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-2 sm:py-3 md:py-4 lg:py-5 xl:py-6 rounded-full font-semibold text-sm sm:text-base md:text-lg lg:text-xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 lg:gap-3"
              >
                <PlayCircle className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7" />
                Try Free Test
              </button>
              <button
                onClick={() => scrollToSection('pricing')}
                className="bg-white/20 backdrop-blur-sm text-white border-2 border-white/30 px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-2 sm:py-3 md:py-4 lg:py-5 xl:py-6 rounded-full font-semibold text-sm sm:text-base md:text-lg lg:text-xl hover:bg-white/30 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 lg:gap-3"
              >
                <Star className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7" />
                Get Pro Access
              </button>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="flex justify-center lg:justify-end order-1 lg:order-2">
            <div className="relative">
              <div className="bg-white/15 backdrop-blur-xl border border-white/20 rounded-3xl p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 w-64 sm:w-72 md:w-80 lg:w-96 xl:w-[28rem] h-64 sm:h-72 md:h-80 lg:h-96 xl:h-[28rem] flex flex-col items-center justify-center text-center text-white shadow-2xl hover:scale-105 transition-transform duration-500">
                {/* Shimmer Effect */}
                <div className="absolute inset-0 -rotate-45 bg-gradient-to-r from-transparent via-white/20 to-transparent w-full h-full animate-pulse"></div>

                <div className="relative z-10">
                  <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-full p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 mb-3 sm:mb-4 md:mb-6 lg:mb-8 xl:mb-10 shadow-lg">
                    <BrainCircuit className="h-6 w-6 sm:h-8 sm:w-8 md:h-12 md:w-12 lg:h-16 lg:w-16 xl:h-20 xl:w-20 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold mb-2 sm:mb-3 md:mb-4 lg:mb-6 xl:mb-8">
                    AI-Powered Analysis
                  </h3>
                  <p className="text-white/90 leading-relaxed text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl">
                    Get personalized insights and recommendations based on your
                    performance patterns. Our AI analyzes your strengths and
                    weaknesses to create a tailored study plan.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32 bg-gradient-to-br from-orange-100 to-pink-100">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12">
          <div className="text-center mb-8 sm:mb-12 md:mb-16 lg:mb-20 xl:mb-24">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3 sm:mb-4 lg:mb-6 xl:mb-8">
              Why Choose CLATPrep?
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-gray-600 max-w-4xl mx-auto px-2 sm:px-4 lg:px-8">
              Experience the most comprehensive and interactive CLAT preparation
              platform designed to maximize your success.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 lg:gap-10 xl:gap-12">
            {[
              {
                icon: LayoutDashboard,
                title: 'Interactive Dashboard',
                description:
                  'Track your progress with detailed analytics, performance insights, and personalized recommendations to optimize your study strategy.',
              },
              {
                icon: ScrollText,
                title: 'Realistic Test Experience',
                description:
                  'Experience the exact exam environment with our meticulously designed test interface, complete with instructions and timing mechanisms.',
              },
              {
                icon: Bot,
                title: 'AI-Powered Feedback',
                description:
                  'Receive instant, personalized feedback and study recommendations powered by advanced AI algorithms that understand your learning patterns.',
              },
              {
                icon: Library,
                title: 'Comprehensive Test Library',
                description:
                  'Access hundreds of practice tests covering all CLAT sections with varying difficulty levels to ensure thorough preparation.',
              },
              {
                icon: TrendingUp,
                title: 'Performance Analytics',
                description:
                  'Get detailed insights into your performance trends, time management, and areas requiring improvement with visual charts and reports.',
              },
              {
                icon: Users,
                title: 'Community & Support',
                description:
                  'Join a community of CLAT aspirants, participate in discussions, and get expert guidance from our experienced mentors.',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 text-center hover:scale-105 hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
              >
                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <div className="relative z-10">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full p-2 sm:p-3 md:p-4 lg:p-6 xl:p-8 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 xl:w-24 xl:h-24 mx-auto mb-3 sm:mb-4 md:mb-6 lg:mb-8 xl:mb-10 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 lg:h-10 lg:w-10 xl:h-12 xl:w-12 text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 mb-2 sm:mb-3 md:mb-4 lg:mb-6 xl:mb-8">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Free Trial Section */}
      <section
        id="try-free"
        className="py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32 bg-gradient-to-br from-cyan-100 to-pink-100"
      >
        <div className="max-w-5xl mx-auto text-center px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3 sm:mb-4 md:mb-6 lg:mb-8 xl:mb-10">
            Try Before You Commit
          </h2>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-gray-600 mb-6 sm:mb-8 md:mb-10 lg:mb-12 xl:mb-16 max-w-3xl mx-auto px-2 sm:px-4 lg:px-8">
            Experience the quality of our mock tests with completely free
            practice tests. No registration required, no hidden costs!
          </p>
          <button
            onClick={startFreeTest}
            className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 sm:px-8 md:px-10 lg:px-12 xl:px-16 py-2 sm:py-3 md:py-4 lg:py-5 xl:py-6 rounded-full font-semibold text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center gap-2 sm:gap-3 lg:gap-4 mx-auto animate-pulse"
          >
            <Rocket className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 lg:h-7 lg:w-7 xl:h-8 xl:w-8" />
            Start Free Test Now
          </button>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        id="pricing"
        className="py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32 bg-gradient-to-br from-purple-100 to-pink-100"
      >
        <div className="max-w-3xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12">
          <div className="text-center mb-6 sm:mb-8 md:mb-12 lg:mb-16 xl:mb-20">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3 sm:mb-4 lg:mb-6 xl:mb-8">
              Complete Dashboard Access
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-gray-600 px-2 sm:px-4 lg:px-8">
              Unlock the full potential of your CLAT preparation with our
              comprehensive pro test series.
            </p>
          </div>

          <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 shadow-2xl relative overflow-hidden">
            {/* Top Gradient Bar */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-500 to-purple-600"></div>

            <div className="text-center mb-4 sm:mb-6 md:mb-8 lg:mb-10 xl:mb-12">
              <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 py-2 lg:py-3 xl:py-4 rounded-full text-xs sm:text-sm lg:text-base xl:text-lg font-semibold inline-block mb-3 sm:mb-4 lg:mb-6 xl:mb-8 shadow-lg">
                Pro Test Series
              </div>
              <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2 lg:mb-4 xl:mb-6">
                ₹3,200
              </div>
              <p className="text-gray-600 text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl">
                for one complete year
              </p>
            </div>

            <ul className="space-y-2 sm:space-y-3 md:space-y-4 lg:space-y-5 xl:space-y-6 mb-4 sm:mb-6 md:mb-8 lg:mb-10 xl:mb-12">
              {[
                'Complete access to all mock tests',
                'Interactive user dashboard with analytics',
                'Personalized AI feedback and insights',
                'Detailed performance tracking',
                'Real examination experience simulation',
                'Priority customer support',
                'Regular content updates and new tests',
              ].map((feature, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 sm:gap-3 lg:gap-4 xl:gap-5"
                >
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 font-medium text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            <button
              onClick={purchaseNow}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-2 sm:py-3 md:py-4 lg:py-5 xl:py-6 rounded-full font-semibold text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 lg:gap-3 xl:gap-4"
            >
              <CreditCard className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7" />
              Purchase Now
            </button>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32 bg-gradient-to-br from-indigo-600 to-purple-700 text-white">
        <div className="max-w-5xl mx-auto text-center px-3 sm:px-4 md:px-6 lg:px-8 xl:px-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold mb-3 sm:mb-4 md:mb-6 lg:mb-8 xl:mb-10">
            Ready to Ace Your CLAT Exam?
          </h2>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl mb-6 sm:mb-8 md:mb-10 lg:mb-12 xl:mb-16 max-w-3xl mx-auto opacity-90 px-2 sm:px-4 lg:px-8">
            Join thousands of successful students who chose CLATPrep for their
            journey to top law schools. Start your preparation today and
            transform your dreams into reality.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 lg:gap-6 xl:gap-8 justify-center">
            <button
              onClick={() => scrollToSection('pricing')}
              className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-2 sm:py-3 md:py-4 lg:py-5 xl:py-6 rounded-full font-semibold text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 lg:gap-3 xl:gap-4"
            >
              <Zap className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7" />
              Get Started Today
            </button>
            <button
              onClick={() => scrollToSection('try-free')}
              className="bg-white/20 backdrop-blur-sm text-white border-2 border-white/30 px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 py-2 sm:py-3 md:py-4 lg:py-5 xl:py-6 rounded-full font-semibold text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl hover:bg-white/30 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 lg:gap-3 xl:gap-4"
            >
              <Play className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7" />
              Try Free Test
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
            <p className="text-gray-400 text-sm sm:text-base">
              &copy; 2025 CLATPrep. All rights reserved.
            </p>
            <div className="flex flex-wrap gap-3 sm:gap-4 md:gap-6 justify-center sm:justify-end">
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base"
              >
                Terms of Service
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors text-sm sm:text-base"
              >
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }

        @keyframes bounce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        .animate-bounce {
          animation: bounce 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

export default CLATPrepLanding
