'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import TestCard from '@/components/test-card'
import {
  BookOpen,
  CheckCircle,
  BarChart3,
  Trophy,
  Target,
  ChevronRight,
  GraduationCap,
  TrendingUp,
  Calendar,
  Sparkles,
  Clock,
  Award,
  ArrowLeft,
  Crown,
  Star,
  ShoppingCart,
  Users,
  Lock,
  Zap,
  Gift,
  CheckCircle2,
} from 'lucide-react'

export default function PaidTestsPage() {
  const { data: session } = useSession()
  const [stats, setStats] = useState({
    totalPaidTests: 0,
    purchasedTests: 0,
    averageScore: 0,
    totalSpent: 0, // in rupees
  })

  // Get user type from session - FREE, PAID, or ADMIN
  const userType = session?.user?.role || 'FREE'

  useEffect(() => {
    // Simulate API call
    setStats({
      totalPaidTests: 12,
      purchasedTests: 5,
      averageScore: 78,
      totalSpent: 2495,
    })
  }, [])

  // Premium tests with pricing
  const premiumTests = [
    {
      id: 1,
      title: 'Advanced Legal Reasoning',
      description:
        'Complex case studies and legal analysis with detailed explanations',
      durationMinutes: 120,
      numberOfQuestions: 200,
      isPaid: true,
      price: 299,
      originalPrice: 499,
      rating: 4.8,
      attempts: 450,
      difficulty: 'Hard',
      highlights: [
        '200 advanced questions',
        'Detailed solutions',
        'Performance analytics',
        'Expert support',
      ],
      isNew: true,
    },
    {
      id: 2,
      title: 'Full CLAT Mock Test',
      description:
        'Complete exam simulation with real-time scoring and analysis',
      durationMinutes: 150,
      numberOfQuestions: 250,
      isPaid: true,
      price: 499,
      originalPrice: 799,
      rating: 4.9,
      attempts: 320,
      difficulty: 'Hard',
      highlights: [
        '250 comprehensive questions',
        'Real-time scoring',
        'Detailed analysis',
        'Performance tracking',
      ],
      isNew: true,
    },
    {
      id: 3,
      title: 'Legal Aptitude Mastery',
      description: 'Advanced legal concepts and reasoning patterns',
      durationMinutes: 90,
      numberOfQuestions: 180,
      isPaid: true,
      price: 199,
      originalPrice: 399,
      rating: 4.6,
      attempts: 280,
      difficulty: 'Medium',
      highlights: [
        '180 mastery questions',
        'Concept videos',
        'Practice sets',
        'Progress tracking',
      ],
      isNew: true,
    },
  ]

  // All paid tests
  const allPaidTests = [
    {
      id: 4,
      title: 'CLAT Success Package',
      description: 'Comprehensive test series with personalized study plan',
      durationMinutes: 180,
      numberOfQuestions: 300,
      isPaid: true,
      price: 799,
      originalPrice: 1299,
      rating: 4.7,
      attempts: 180,
      difficulty: 'Hard',
      highlights: [
        '300 comprehensive questions',
        'Personalized plan',
        'Expert guidance',
        '24/7 support',
      ],
    },
    {
      id: 5,
      title: 'Legal Reasoning Pro',
      description: 'Advanced legal concepts with expert commentary',
      durationMinutes: 120,
      numberOfQuestions: 200,
      isPaid: true,
      price: 399,
      originalPrice: 599,
      rating: 4.5,
      attempts: 220,
      difficulty: 'Hard',
      highlights: [
        '200 pro questions',
        'Expert commentary',
        'Case law analysis',
        'Detailed solutions',
      ],
    },
    {
      id: 6,
      title: 'English Mastery Test',
      description: 'Advanced vocabulary and comprehension practice',
      durationMinutes: 90,
      numberOfQuestions: 150,
      isPaid: true,
      price: 299,
      originalPrice: 499,
      rating: 4.4,
      attempts: 190,
      difficulty: 'Medium',
      highlights: [
        '150 mastery questions',
        'Advanced vocabulary',
        'Comprehension focus',
        'Score improvement',
      ],
    },
    {
      id: 7,
      title: 'Quantitative Excellence',
      description: 'Advanced mathematics and data interpretation',
      durationMinutes: 100,
      numberOfQuestions: 180,
      isPaid: true,
      price: 349,
      originalPrice: 549,
      rating: 4.3,
      attempts: 160,
      difficulty: 'Hard',
      highlights: [
        '180 quantitative questions',
        'Advanced concepts',
        'Data interpretation',
        'Step solutions',
      ],
    },
    {
      id: 8,
      title: 'Logical Reasoning Pro',
      description: 'Advanced critical thinking and analytical skills',
      durationMinutes: 75,
      numberOfQuestions: 120,
      isPaid: true,
      price: 249,
      originalPrice: 399,
      rating: 4.2,
      attempts: 140,
      difficulty: 'Medium',
      highlights: [
        '120 logical questions',
        'Critical thinking',
        'Analytical skills',
        'Pattern recognition',
      ],
    },
  ]

  // Attempted tests - cleaned up with only necessary fields
  const attemptedTests = [
    {
      id: 9,
      title: 'Advanced Legal Reasoning',
      description: 'Complex case studies and legal analysis',
      durationMinutes: 120,
      numberOfQuestions: 200,
      isPaid: true,
      lastScore: 82,
      highlights: [
        '200 advanced questions',
        'Detailed solutions',
        'Performance analytics',
        'Expert support',
      ],
    },
    {
      id: 10,
      title: 'Full CLAT Mock Test',
      description: 'Complete exam simulation with real-time scoring',
      durationMinutes: 150,
      numberOfQuestions: 250,
      isPaid: true,
      lastScore: 75,
      highlights: [
        '250 comprehensive questions',
        'Real-time scoring',
        'Detailed analysis',
        'Performance tracking',
      ],
    },
    {
      id: 11,
      title: 'Legal Aptitude Mastery',
      description: 'Advanced legal concepts and reasoning patterns',
      durationMinutes: 90,
      numberOfQuestions: 180,
      isPaid: true,
      lastScore: 88,
      highlights: [
        '180 mastery questions',
        'Concept videos',
        'Practice sets',
        'Progress tracking',
      ],
    },
    {
      id: 12,
      title: 'CLAT Success Package',
      description: 'Comprehensive test series with personalized plan',
      durationMinutes: 180,
      numberOfQuestions: 300,
      isPaid: true,
      lastScore: 79,
      highlights: [
        '300 comprehensive questions',
        'Personalized plan',
        'Expert guidance',
        '24/7 support',
      ],
    },
  ]

  const handleTestAction = (test, action) => {
    if (action === 'reattempt') {
      console.log('Re-attempting test:', test)
      // Add your re-attempt logic here
      // For example: navigate to test page with re-attempt flag
    } else if (action === 'attempt') {
      console.log('Taking test:', test)
      // Add your attempt logic here
      // For example: navigate to test page
    }
  }

  const statCards = [
    {
      title: 'Premium Tests',
      value: stats.totalPaidTests,
      icon: Crown,
      description: 'Available',
      gradient: 'from-yellow-500 to-yellow-600',
    },
    {
      title: 'Attempted',
      value: stats.purchasedTests,
      icon: CheckCircle,
      description: 'Completed',
      gradient: 'from-green-500 to-green-600',
    },
    {
      title: 'Avg Score',
      value: `${stats.averageScore}%`,
      icon: TrendingUp,
      description: 'Average',
      gradient: 'from-purple-500 to-purple-600',
    },
    {
      title: 'Total Spent',
      value: `₹${stats.totalSpent}`,
      icon: ShoppingCart,
      description: 'Investment',
      gradient: 'from-orange-500 to-orange-600',
    },
  ]

  // Premium Unlock UI for free users - Shorter and more aesthetic
  if (userType === 'FREE') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 relative overflow-hidden">
        {/* Blurred background effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-200/20 to-orange-200/20 dark:from-yellow-900/20 dark:to-orange-900/20 backdrop-blur-sm"></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8">
          {/* Lock Icon */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center mb-6">
            <Lock className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white" />
          </div>

          {/* Main Heading */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-gray-900 dark:text-white mb-3">
            Unlock Premium Tests
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base lg:text-lg text-center text-gray-600 dark:text-gray-300 mb-6 max-w-lg">
            Access advanced CLAT preparation tests with detailed analytics and
            expert support
          </p>

          {/* Price Card - Compact */}
          <Card className="w-full max-w-sm mx-auto mb-6 border-2 border-yellow-200 dark:border-yellow-700 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
            <CardContent className="p-4 sm:p-6">
              <div className="text-center space-y-3">
                {/* Original Price */}
                <div className="flex items-center justify-center gap-2">
                  <span className="text-sm sm:text-base text-gray-500 line-through">
                    ₹7999
                  </span>
                  <Badge className="bg-red-500 text-white text-xs">
                    -50% OFF
                  </Badge>
                </div>

                {/* Current Price */}
                <div className="space-y-1">
                  <span className="text-3xl sm:text-4xl lg:text-5xl font-bold text-yellow-600 dark:text-yellow-400">
                    ₹3999
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA Buttons */}
          <div className="w-full max-w-sm mx-auto space-y-3">
            <Button
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white text-base sm:text-lg font-semibold py-3 sm:py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              size="lg"
            >
              <Crown className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Unlock Premium Access
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Regular UI for paid/admin users
  return (
    <div className="min-h-screen lg:min-h-0 bg-gray-50 dark:bg-gray-900 lg:bg-transparent lg:dark:bg-transparent">
      <div className="space-y-4 sm:space-y-6 lg:space-y-8 p-3 sm:p-4 lg:p-0">
        {/* Header Section */}
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-start sm:items-center justify-between">
            <div className="flex items-start sm:items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center flex-shrink-0">
                <Crown className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-xl lg:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                  Premium Practice Tests 👑
                </h1>
                <p className="text-xs sm:text-sm lg:text-lg text-gray-600 dark:text-gray-300 mt-1">
                  Advanced tests with detailed analytics and expert support
                </p>
              </div>
            </div>
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="gap-1 flex-shrink-0">
                <ArrowLeft className="w-4 h-4 dark:text-white" />
                <span className="hidden sm:inline dark:text-white">Back</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
          {statCards.map((stat, index) => {
            const IconComponent = stat.icon
            return (
              <Card
                key={index}
                className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-lg transition-all duration-300"
              >
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5 sm:space-y-1 flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        {stat.title}
                      </p>
                      <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                        {stat.value}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {stat.description}
                      </p>
                    </div>
                    <div
                      className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center flex-shrink-0 ml-2`}
                    >
                      <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Premium Tests This Month */}
        <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 relative overflow-hidden">
          {/* Decorative element */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-yellow-200/20 to-orange-400/20 rounded-full -mr-10 -mt-10"></div>
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900 dark:to-yellow-800 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                  <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 dark:text-white">
                      Premium This Month
                    </CardTitle>
                    <Badge
                      variant="secondary"
                      className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 text-xs"
                    >
                      Premium
                    </Badge>
                  </div>
                  <CardDescription className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 hidden sm:block">
                    Latest premium tests with advanced features and expert
                    support
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-4 sm:pb-6 px-4 sm:px-6">
            {/* Mobile Scrollable */}
            <div className="lg:hidden">
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                {premiumTests.map((test) => (
                  <div key={test.id} className="flex-shrink-0 w-80">
                    <TestCard
                      {...test}
                      onAction={(action) => handleTestAction(test, action)}
                    />
                  </div>
                ))}
              </div>
            </div>
            {/* Desktop Grid */}
            <div className="hidden lg:grid lg:grid-cols-3 gap-4">
              {premiumTests.map((test) => (
                <TestCard
                  key={test.id}
                  {...test}
                  onAction={(action) => handleTestAction(test, action)}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* All Paid Tests */}
        <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                  <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 dark:text-white truncate">
                    All Premium Tests
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 hidden sm:block">
                    Complete collection of premium practice tests with advanced
                    features
                  </CardDescription>
                </div>
              </div>
              <Badge
                variant="outline"
                className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
              >
                {allPaidTests.length} Tests
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pb-4 sm:pb-6 px-4 sm:px-6">
            {/* Mobile Scrollable */}
            <div className="lg:hidden">
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                {allPaidTests.map((test) => (
                  <div key={test.id} className="flex-shrink-0 w-80">
                    <TestCard
                      {...test}
                      onAction={(action) => handleTestAction(test, action)}
                    />
                  </div>
                ))}
              </div>
            </div>
            {/* Desktop Grid */}
            <div className="hidden lg:grid lg:grid-cols-3 gap-4">
              {allPaidTests.map((test) => (
                <TestCard
                  key={test.id}
                  {...test}
                  onAction={(action) => handleTestAction(test, action)}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Attempted Tests */}
        <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                  <Award className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 dark:text-white truncate">
                    Your Attempted Tests
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 hidden sm:block">
                    Review your attempted tests and track your premium
                    performance
                  </CardDescription>
                </div>
              </div>
              <Badge
                variant="outline"
                className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
              >
                {attemptedTests.length} Attempted
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pb-4 sm:pb-6 px-4 sm:px-6">
            {/* Mobile Scrollable */}
            <div className="lg:hidden">
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                {attemptedTests.map((test) => (
                  <div key={test.id} className="flex-shrink-0 w-80">
                    <TestCard
                      {...test}
                      isAttempted={true}
                      onAction={(action) => handleTestAction(test, action)}
                    />
                  </div>
                ))}
              </div>
            </div>
            {/* Desktop Grid */}
            <div className="hidden lg:grid lg:grid-cols-3 gap-4">
              {attemptedTests.map((test) => (
                <TestCard
                  key={test.id}
                  {...test}
                  isAttempted={true}
                  onAction={(action) => handleTestAction(test, action)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
