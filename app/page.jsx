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
  Clock,
  FileText,
  Trophy,
  BarChart3,
  Target,
  Shield,
  ChevronRight,
  Gavel,
  BookOpen,
  PieChart,
  Award,
  RefreshCcw,
  Bell,
  Settings,
  MessageCircle,
  Phone,
  Mail,
  Quote,
  Sparkles,
  Gauge,
  TrendingDown,
} from 'lucide-react'
import Image from 'next/image'

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
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-lg shadow-lg'
            : 'bg-white/90 backdrop-blur-sm'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3 cursor-pointer hover:scale-105 transition-transform">
              <div className="relative">
                <Image
                  src="/outlawed.png"
                  alt="OUTLAWED Gavel"
                  width={40}
                  height={40}
                  className="drop-shadow-lg"
                />
              </div>
              <span className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                OUTLAWED
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              <button
                onClick={() => scrollToSection('features')}
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('dashboard-preview')}
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                Dashboard
              </button>
              <button
                onClick={() => scrollToSection('testimonials')}
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                Reviews
              </button>
              <button
                onClick={() => scrollToSection('pricing')}
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                Pricing
              </button>
            </div>

            {/* Desktop Action Button */}
            {session ? (
              <button
                onClick={() => (window.location.href = '/dashboard')}
                className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-full font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={() => (window.location.href = '/login')}
                className="hidden sm:block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-full font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
              >
                Get Started
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="sm:hidden p-2 text-gray-700"
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
            <div className="sm:hidden bg-white/95 backdrop-blur-lg rounded-lg mt-2 p-4 shadow-lg border">
              <div className="space-y-4">
                <button
                  onClick={() => scrollToSection('features')}
                  className="block text-gray-700 hover:text-gray-900 font-medium"
                >
                  Features
                </button>
                <button
                  onClick={() => scrollToSection('dashboard-preview')}
                  className="block text-gray-700 hover:text-gray-900 font-medium"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => scrollToSection('testimonials')}
                  className="block text-gray-700 hover:text-gray-900 font-medium"
                >
                  Reviews
                </button>
                <button
                  onClick={() => scrollToSection('pricing')}
                  className="block text-gray-700 hover:text-gray-900 font-medium"
                >
                  Pricing
                </button>
                <div className="pt-4 border-t border-gray-200">
                  {session ? (
                    <button
                      onClick={() => (window.location.href = '/dashboard')}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-full font-semibold"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Dashboard
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => (window.location.href = '/login')}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-full font-semibold"
                    >
                      Get Started
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section - Full Page Hammer/Gavel */}
      <section className="relative min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black overflow-hidden pt-16">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]"></div>
        </div>

        <div className="relative z-10 min-h-screen flex items-center justify-center px-4 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            {/* Giant Hammer/Gavel */}
            <div className="mb-12 lg:mb-16">
              <div className="relative inline-block">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
                <Image
                  src="/outlawed.png"
                  alt="OUTLAWED Justice Gavel"
                  width={200}
                  height={200}
                  className="relative mx-auto drop-shadow-2xl hover:scale-105 transition-transform duration-700 lg:w-64 lg:h-64"
                />
              </div>
            </div>

            {/* OUTLAWED Branding */}
            <div className="space-y-6 lg:space-y-8">
              <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[10rem] font-black text-white leading-none tracking-tighter">
                <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                  OUTLAWED
                </span>
              </h1>

              <div className="space-y-4 lg:space-y-6">
                <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-300">
                  Master CLAT with India's Premier Legal Test Platform
                </p>
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-400 max-w-4xl mx-auto px-4">
                  Join thousands of law aspirants who trust OUTLAWED for
                  comprehensive mock tests, AI-powered analytics, and the most
                  realistic CLAT exam experience.
                </p>
              </div>

              {/* Hero CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 lg:gap-6 justify-center pt-8 lg:pt-12">
                <button
                  onClick={startFreeTest}
                  className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 sm:px-10 lg:px-12 py-4 lg:py-5 rounded-full font-bold text-lg lg:text-xl hover:shadow-2xl hover:shadow-blue-500/25 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3"
                >
                  <PlayCircle className="h-6 w-6 lg:h-7 lg:w-7 group-hover:scale-110 transition-transform" />
                  Start Free Test
                  <ArrowRight className="h-5 w-5 lg:h-6 lg:w-6 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => scrollToSection('dashboard-preview')}
                  className="group border-2 border-white/30 text-white hover:bg-white/10 px-8 sm:px-10 lg:px-12 py-4 lg:py-5 rounded-full font-bold text-lg lg:text-xl backdrop-blur-sm hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3"
                >
                  <LayoutDashboard className="h-6 w-6 lg:h-7 lg:w-7 group-hover:scale-110 transition-transform" />
                  View Dashboard
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-12 lg:pt-16">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-4xl mx-auto">
                  <div className="text-center">
                    <div className="text-2xl lg:text-3xl font-bold text-white mb-2">
                      50,000+
                    </div>
                    <div className="text-sm lg:text-base text-gray-400">
                      Students Trust Us
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl lg:text-3xl font-bold text-white mb-2">
                      1,000+
                    </div>
                    <div className="text-sm lg:text-base text-gray-400">
                      Practice Tests
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl lg:text-3xl font-bold text-white mb-2">
                      95%
                    </div>
                    <div className="text-sm lg:text-base text-gray-400">
                      Success Rate
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl lg:text-3xl font-bold text-white mb-2">
                      24/7
                    </div>
                    <div className="text-sm lg:text-base text-gray-400">
                      Expert Support
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-16 lg:mb-24">
            <h2 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto">
              From free practice tests to advanced analytics, OUTLAWED provides
              the complete CLAT preparation ecosystem.
            </p>
          </div>

          {/* Main Features Grid */}
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12 mb-20">
            {/* Free Tests */}
            <div className="group bg-white rounded-3xl p-8 lg:p-10 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl w-16 h-16 lg:w-20 lg:h-20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Target className="h-8 w-8 lg:h-10 lg:w-10 text-white" />
              </div>
              <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                Free Practice Tests
              </h3>
              <p className="text-gray-600 text-lg mb-6">
                Start your CLAT journey with our comprehensive free test series.
                No registration required.
              </p>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>50+ Free Mock Tests</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Instant Score & Analysis</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Section-wise Breakdown</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>No Time Limits</span>
                </li>
              </ul>
            </div>

            {/* Premium Tests */}
            <div className="group bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-8 lg:p-10 text-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl w-16 h-16 lg:w-20 lg:h-20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Trophy className="h-8 w-8 lg:h-10 lg:w-10 text-white" />
              </div>
              <h3 className="text-2xl lg:text-3xl font-bold mb-4">
                Premium Test Series
              </h3>
              <p className="text-white/90 text-lg mb-6">
                Advanced mock tests with detailed explanations and AI-powered
                insights for serious aspirants.
              </p>
              <ul className="space-y-3 text-white/90">
                <li className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-yellow-300" />
                  <span>1000+ Premium Tests</span>
                </li>
                <li className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-yellow-300" />
                  <span>AI Performance Analysis</span>
                </li>
                <li className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-yellow-300" />
                  <span>Detailed Solutions</span>
                </li>
                <li className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-yellow-300" />
                  <span>Rank Predictions</span>
                </li>
              </ul>
            </div>

            {/* Dashboard & Analytics */}
            <div className="group bg-white rounded-3xl p-8 lg:p-10 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl w-16 h-16 lg:w-20 lg:h-20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BarChart3 className="h-8 w-8 lg:h-10 lg:w-10 text-white" />
              </div>
              <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                Smart Dashboard
              </h3>
              <p className="text-gray-600 text-lg mb-6">
                Track your progress with advanced analytics and personalized
                insights.
              </p>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-purple-500" />
                  <span>Performance Tracking</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-purple-500" />
                  <span>Weakness Identification</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-purple-500" />
                  <span>Progress Visualization</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-purple-500" />
                  <span>Study Recommendations</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Additional Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            <div className="bg-white rounded-xl p-6 shadow-lg text-center hover:shadow-xl transition-shadow">
              <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <Award className="h-6 w-6 text-white" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Leaderboard</h4>
              <p className="text-gray-600 text-sm">
                Compete with peers and track your ranking
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg text-center hover:shadow-xl transition-shadow">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">
                Solution Analysis
              </h4>
              <p className="text-gray-600 text-sm">
                Detailed explanations for every question
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg text-center hover:shadow-xl transition-shadow">
              <div className="bg-gradient-to-r from-pink-500 to-rose-600 rounded-lg w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <Bell className="h-6 w-6 text-white" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">
                Smart Notifications
              </h4>
              <p className="text-gray-600 text-sm">
                Stay updated with test reminders
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg text-center hover:shadow-xl transition-shadow">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <h4 className="font-bold text-gray-900 mb-2">
                Profile Customization
              </h4>
              <p className="text-gray-600 text-sm">
                Personalize your learning experience
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section id="dashboard-preview" className="py-20 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-16 lg:mb-24">
            <h2 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              Your Complete Study Command Center
            </h2>
            <p className="text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto">
              Get an inside look at the powerful dashboard that thousands of
              CLAT aspirants use daily to track their progress.
            </p>
          </div>

          {/* Dashboard UI Preview */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-6 lg:p-12 mb-16">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Mock Dashboard Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                      <GraduationCap className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">
                        Welcome back, Rajesh!
                      </h3>
                      <p className="text-blue-100">
                        Ready to ace your CLAT preparation?
                      </p>
                    </div>
                  </div>
                  <div className="hidden lg:flex items-center gap-4">
                    <Bell className="h-6 w-6 text-blue-200" />
                    <Settings className="h-6 w-6 text-blue-200" />
                  </div>
                </div>
              </div>

              {/* Mock Stats Cards */}
              <div className="p-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-600 font-medium">
                          Tests
                        </p>
                        <p className="text-2xl font-bold text-blue-900">47</p>
                        <p className="text-xs text-blue-500">Available</p>
                      </div>
                      <BookOpen className="h-8 w-8 text-blue-500" />
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-600 font-medium">
                          Done
                        </p>
                        <p className="text-2xl font-bold text-green-900">23</p>
                        <p className="text-xs text-green-500">Completed</p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-purple-600 font-medium">
                          Score
                        </p>
                        <p className="text-2xl font-bold text-purple-900">
                          87%
                        </p>
                        <p className="text-xs text-purple-500">Average</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-purple-500" />
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-amber-600 font-medium">
                          Rank
                        </p>
                        <p className="text-2xl font-bold text-amber-900">
                          #127
                        </p>
                        <p className="text-xs text-amber-500">Current</p>
                      </div>
                      <Trophy className="h-8 w-8 text-amber-500" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Free Trial Section */}
      <section
        id="try-free"
        className="py-20 lg:py-32 bg-gradient-to-br from-gray-900 to-black text-white"
      >
        <div className="max-w-5xl mx-auto text-center px-4 lg:px-8">
          <h2 className="text-4xl lg:text-6xl font-bold mb-6">
            Try Before You Commit
          </h2>
          <p className="text-xl lg:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Experience the quality of our mock tests with completely free
            practice tests. No registration required, no hidden costs!
          </p>
          <button
            onClick={startFreeTest}
            className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-12 py-5 rounded-full font-bold text-xl hover:shadow-2xl hover:shadow-blue-500/25 hover:-translate-y-1 transition-all duration-300 flex items-center gap-4 mx-auto"
          >
            <Rocket className="h-7 w-7 group-hover:scale-110 transition-transform" />
            Start Free Test Now
            <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 lg:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-16 lg:mb-24">
            <h2 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              Success Stories from Top Law Schools
            </h2>
            <p className="text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto">
              Hear from students who achieved their CLAT dreams with OUTLAWED
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-16">
            {/* Testimonial 1 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  A
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">
                    Anisha Sharma
                  </h4>
                  <p className="text-gray-600">NLSIU Bangalore • AIR 47</p>
                </div>
              </div>
              <div className="mb-6">
                <Quote className="h-8 w-8 text-blue-500 mb-4" />
                <p className="text-gray-700 text-lg leading-relaxed">
                  "OUTLAWED's mock tests were incredibly close to the actual
                  CLAT. The detailed analysis helped me identify my weak areas
                  and improve systematically. The AI recommendations were
                  spot-on!"
                </p>
              </div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  R
                </div>
                <div>
                  <h4 className="font-bold text-white text-lg">Rajesh Kumar</h4>
                  <p className="text-blue-100">NALSAR Hyderabad • AIR 89</p>
                </div>
              </div>
              <div className="mb-6">
                <Quote className="h-8 w-8 text-blue-200 mb-4" />
                <p className="text-white/90 text-lg leading-relaxed">
                  "The dashboard is amazing! I could track my progress across
                  all subjects and see exactly where I needed to improve. The
                  leaderboard motivated me to push harder."
                </p>
              </div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 fill-yellow-300 text-yellow-300"
                  />
                ))}
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  P
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-lg">
                    Priya Patel
                  </h4>
                  <p className="text-gray-600">ILS Pune • AIR 156</p>
                </div>
              </div>
              <div className="mb-6">
                <Quote className="h-8 w-8 text-green-500 mb-4" />
                <p className="text-gray-700 text-lg leading-relaxed">
                  "Started with free tests and loved the experience so much that
                  I upgraded to premium. The solutions are incredibly detailed
                  and helped me understand concepts deeply."
                </p>
              </div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Additional Success Stats */}
          <div className="bg-white rounded-2xl p-8 lg:p-12 shadow-lg">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl lg:text-5xl font-bold text-blue-600 mb-2">
                  95%
                </div>
                <div className="text-gray-600 font-medium">
                  Students improve scores
                </div>
              </div>
              <div>
                <div className="text-4xl lg:text-5xl font-bold text-green-600 mb-2">
                  2,847
                </div>
                <div className="text-gray-600 font-medium">
                  Students cleared CLAT
                </div>
              </div>
              <div>
                <div className="text-4xl lg:text-5xl font-bold text-purple-600 mb-2">
                  4.9★
                </div>
                <div className="text-gray-600 font-medium">Average rating</div>
              </div>
              <div>
                <div className="text-4xl lg:text-5xl font-bold text-orange-600 mb-2">
                  50k+
                </div>
                <div className="text-gray-600 font-medium">Active users</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        id="pricing"
        className="py-20 lg:py-32 bg-gradient-to-br from-blue-50 to-purple-100"
      >
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-16 lg:mb-24">
            <h2 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              Choose Your Success Plan
            </h2>
            <p className="text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto">
              Start free or unlock the complete CLAT preparation experience with
              our comprehensive pro plan.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white rounded-3xl p-8 lg:p-10 shadow-lg border-2 border-gray-200 hover:shadow-xl transition-shadow">
              <div className="text-center mb-8">
                <div className="bg-gray-100 text-gray-700 px-6 py-3 rounded-full text-lg font-semibold inline-block mb-6">
                  Free Forever
                </div>
                <div className="text-5xl font-bold text-gray-900 mb-2">₹0</div>
                <p className="text-gray-600 text-lg">Perfect to get started</p>
              </div>

              <ul className="space-y-4 mb-8">
                {[
                  '50+ Free mock tests',
                  'Basic performance analytics',
                  'Instant score calculation',
                  'Section-wise breakdown',
                  'Community access',
                ].map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={startFreeTest}
                className="w-full bg-gray-100 text-gray-700 py-4 rounded-full font-bold text-lg hover:bg-gray-200 transition-colors"
              >
                Start Free Tests
              </button>
            </div>

            {/* Pro Plan */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-8 lg:p-10 text-white shadow-lg hover:shadow-xl transition-shadow relative overflow-hidden">
              {/* Recommended Badge */}
              <div className="absolute top-4 right-4 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-sm font-bold">
                Recommended
              </div>

              <div className="text-center mb-8">
                <div className="bg-white/20 text-white px-6 py-3 rounded-full text-lg font-semibold inline-block mb-6">
                  Pro Test Series
                </div>
                <div className="text-5xl font-bold text-white mb-2">₹3,200</div>
                <p className="text-blue-100 text-lg">Complete 1-year access</p>
              </div>

              <ul className="space-y-4 mb-8">
                {[
                  '1000+ Premium mock tests',
                  'AI-powered performance analysis',
                  'Detailed solutions & explanations',
                  'Advanced analytics dashboard',
                  'Leaderboard & ranking system',
                  'Profile customization',
                  'Smart notifications',
                  'Priority 24/7 support',
                  'Payment history tracking',
                  'Unlimited re-attempts',
                ].map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <Sparkles className="h-5 w-5 text-yellow-300" />
                    <span className="text-white">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={purchaseNow}
                className="w-full bg-white text-blue-600 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-3"
              >
                <CreditCard className="h-5 w-5" />
                Get Pro Access
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Money Back Guarantee */}
          <div className="text-center mt-16 lg:mt-24">
            <div className="bg-white rounded-2xl p-8 shadow-lg max-w-3xl mx-auto">
              <div className="flex items-center justify-center gap-4 mb-6">
                <Shield className="h-12 w-12 text-green-500" />
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    30-Day Money Back Guarantee
                  </h3>
                  <p className="text-gray-600">
                    Not satisfied? Get a full refund within 30 days, no
                    questions asked.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-gray-900 to-black text-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-16 lg:mb-24">
            <h2 className="text-4xl lg:text-6xl font-bold mb-6">
              Ready to Ace Your CLAT Exam?
            </h2>
            <p className="text-xl lg:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto">
              Join thousands of successful students who chose OUTLAWED for their
              journey to top law schools. Start your preparation today and
              transform your dreams into reality.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button
                onClick={purchaseNow}
                className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-12 py-5 rounded-full font-bold text-xl hover:shadow-2xl hover:shadow-blue-500/25 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-4"
              >
                <Zap className="h-7 w-7 group-hover:scale-110 transition-transform" />
                Get Pro Access Now
                <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={startFreeTest}
                className="group border-2 border-white/30 text-white hover:bg-white/10 px-12 py-5 rounded-full font-bold text-xl backdrop-blur-sm hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-4"
              >
                <Play className="h-7 w-7 group-hover:scale-110 transition-transform" />
                Try Free Test
              </button>
            </div>
          </div>

          {/* Contact & Support Section */}
          <div className="bg-gray-800 rounded-3xl p-8 lg:p-12">
            <div className="text-center mb-12">
              <h3 className="text-3xl lg:text-4xl font-bold mb-6">
                Need Help? We're Here for You
              </h3>
              <p className="text-xl text-gray-300">
                Our expert support team is available 24/7 to assist you
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Email Support */}
              <div className="text-center group">
                <div className="bg-blue-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Mail className="h-8 w-8 text-white" />
                </div>
                <h4 className="text-xl font-bold mb-2">Email Support</h4>
                <p className="text-gray-300 mb-4">
                  Get detailed answers to your questions
                </p>
                <a
                  href="mailto:support@outlawed.in"
                  className="text-blue-400 hover:text-blue-300 font-medium"
                >
                  support@outlawed.in
                </a>
              </div>

              {/* Phone Support */}
              <div className="text-center group">
                <div className="bg-green-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Phone className="h-8 w-8 text-white" />
                </div>
                <h4 className="text-xl font-bold mb-2">Phone Support</h4>
                <p className="text-gray-300 mb-4">
                  Speak directly with our experts
                </p>
                <a
                  href="tel:+911234567890"
                  className="text-green-400 hover:text-green-300 font-medium"
                >
                  +91 12345 67890
                </a>
              </div>

              {/* Live Chat */}
              <div className="text-center group">
                <div className="bg-purple-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <MessageCircle className="h-8 w-8 text-white" />
                </div>
                <h4 className="text-xl font-bold mb-2">Live Chat</h4>
                <p className="text-gray-300 mb-4">
                  Instant help when you need it
                </p>
                <button className="text-purple-400 hover:text-purple-300 font-medium">
                  Start Chat
                </button>
              </div>
            </div>

            {/* FAQ Link */}
            <div className="text-center mt-12 pt-8 border-t border-gray-700">
              <p className="text-gray-300 mb-4">
                Have questions? Check out our comprehensive FAQ section
              </p>
              <button className="text-blue-400 hover:text-blue-300 font-medium inline-flex items-center gap-2">
                View Frequently Asked Questions
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-16">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-4 mb-8">
              <Image
                src="/outlawed.png"
                alt="OUTLAWED Gavel"
                width={60}
                height={60}
                className="drop-shadow-lg"
              />
              <h2 className="text-6xl md:text-8xl font-black tracking-tighter">
                OUTLAWED
              </h2>
            </div>
            <p className="text-xl text-white/80 mb-8">
              India's Premier CLAT Preparation Platform
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Target className="h-5 w-5" />
                Platform
              </h3>
              <ul className="space-y-2 text-white/80">
                <li>
                  <button
                    onClick={startFreeTest}
                    className="hover:text-white transition-colors"
                  >
                    Free Tests
                  </button>
                </li>
                <li>
                  <button
                    onClick={purchaseNow}
                    className="hover:text-white transition-colors"
                  >
                    Premium Tests
                  </button>
                </li>
                <li>
                  <button
                    onClick={() =>
                      (window.location.href = '/dashboard/leaderboard')
                    }
                    className="hover:text-white transition-colors"
                  >
                    Leaderboard
                  </button>
                </li>
                <li>
                  <button
                    onClick={() =>
                      (window.location.href = '/dashboard/profile')
                    }
                    className="hover:text-white transition-colors"
                  >
                    Profile
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Subjects
              </h3>
              <ul className="space-y-2 text-white/80">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    English Language
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    General Knowledge
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Legal Reasoning
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Logical Reasoning
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Quantitative Techniques
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Support
              </h3>
              <ul className="space-y-2 text-white/80">
                <li>
                  <a
                    href="mailto:help@outlawed.in"
                    className="hover:text-white transition-colors"
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:support@outlawed.in"
                    className="hover:text-white transition-colors"
                  >
                    Contact Us
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:payments@outlawed.in"
                    className="hover:text-white transition-colors"
                  >
                    Payment Issues
                  </a>
                </li>
                <li>
                  <a
                    href="tel:+911234567890"
                    className="hover:text-white transition-colors"
                  >
                    Technical Support
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Legal
              </h3>
              <ul className="space-y-2 text-white/80">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Refund Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Student Guidelines
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/20 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-white/60">
                © 2024 OUTLAWED. All rights reserved. Empowering law aspirants
                to achieve their dreams.
              </p>
              <div className="flex items-center gap-6">
                <span className="text-white/60 text-sm">
                  Made with ⚖️ for future lawyers
                </span>
              </div>
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
