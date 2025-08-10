'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
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
  History,
  Timer,
} from 'lucide-react'

export default function AttemptedTestsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState({
    totalAttemptedTests: 0,
    totalPaidAttempted: 0,
    totalFreeAttempted: 0,
    averageScore: 0,
    thisWeekTests: 0,
  })

  // Get user type from session - FREE, PAID, or ADMIN
  const userType = session?.user?.role || 'FREE'

  useEffect(() => {
    // Simulate API call
    setStats({
      totalAttemptedTests: 15,
      totalPaidAttempted: 8,
      totalFreeAttempted: 7,
      averageScore: 78,
      thisWeekTests: 3,
    })
  }, [])

  // Helper function to format time ago
  const getTimeAgo = (date) => {
    const now = new Date()
    const diffInMs = now - new Date(date)
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
    const diffInWeeks = Math.floor(diffInDays / 7)
    const diffInMonths = Math.floor(diffInDays / 30)
    const diffInYears = Math.floor(diffInDays / 365)

    if (diffInYears > 0)
      return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`
    if (diffInMonths > 0)
      return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`
    if (diffInWeeks > 0)
      return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`
    if (diffInDays > 0)
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
    if (diffInHours > 0)
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
    if (diffInMinutes > 0) return `${diffInMinutes} min ago`
    return 'Just now'
  }

  const handleTestAction = (test, action) => {
    if (action === 'reattempt') {
      console.log('Re-attempting test:', test)
      // Add your re-attempt logic here
      // For example: navigate to test page with re-attempt flag
    } else if (action === 'attempt') {
      console.log('Taking test:', test)
      // Add your attempt logic here
      // For example: navigate to test page
    } else if (action === 'evaluate') {
      console.log('Evaluating test:', test)
      // Navigate to evaluation page - we need the test attempt ID
      if (test.testAttemptId) {
        router.push(
          `/dashboard/test/${test.id}/evaluate?attemptId=${test.testAttemptId}`
        )
      } else {
        toast.error('Test attempt ID not found. Please try again.')
      }
    }
  }

  // This week's tests
  const thisWeekTests = [
    {
      id: 1,
      title: 'Advanced Legal Reasoning',
      description:
        'Complex case studies and legal analysis with detailed explanations',
      durationMinutes: 120,
      numberOfQuestions: 200,
      isPaid: true,
      lastScore: 85,
      testAttemptId: 'mock-attempt-1',
      attemptedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      highlights: [
        '200 advanced questions',
        'Detailed solutions',
        'Performance analytics',
        'Expert support',
      ],
    },
    {
      id: 2,
      title: 'Current Affairs Mock Test',
      description: 'Latest current affairs and general knowledge for CLAT 2024',
      durationMinutes: 45,
      numberOfQuestions: 50,
      isPaid: false,
      lastScore: 72,
      testAttemptId: 'mock-attempt-2',
      attemptedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      highlights: [
        '50 latest current affairs questions',
        'General knowledge focus',
        'Updated for 2024',
        'Quick practice session',
      ],
    },
    {
      id: 3,
      title: 'English Language Test',
      description: 'Vocabulary, grammar and reading comprehension focused test',
      durationMinutes: 60,
      numberOfQuestions: 100,
      isPaid: false,
      lastScore: 68,
      testAttemptId: 'mock-attempt-3',
      attemptedAt: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      highlights: [
        '100 curated questions',
        'Vocabulary & grammar focus',
        'Reading comprehension',
        'Instant score report',
      ],
    },
  ]

  // Paid tests attempted (only for paid users)
  const paidTestsAttempted = [
    {
      id: 4,
      title: 'Full CLAT Mock Test',
      description:
        'Complete exam simulation with real-time scoring and analysis',
      durationMinutes: 150,
      numberOfQuestions: 250,
      isPaid: true,
      lastScore: 79,
      testAttemptId: 'mock-attempt-4',
      attemptedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      highlights: [
        '250 comprehensive questions',
        'Real-time scoring',
        'Detailed analysis',
        'Performance tracking',
      ],
    },
    {
      id: 5,
      title: 'Legal Aptitude Mastery',
      description: 'Advanced legal concepts and reasoning patterns',
      durationMinutes: 90,
      numberOfQuestions: 180,
      isPaid: true,
      lastScore: 88,
      testAttemptId: 'mock-attempt-5',
      attemptedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
      highlights: [
        '180 mastery questions',
        'Concept videos',
        'Practice sets',
        'Progress tracking',
      ],
    },
    {
      id: 6,
      title: 'CLAT Success Package',
      description: 'Comprehensive test series with personalized study plan',
      durationMinutes: 180,
      numberOfQuestions: 300,
      isPaid: true,
      lastScore: 82,
      testAttemptId: 'mock-attempt-6',
      attemptedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
      highlights: [
        '300 comprehensive questions',
        'Personalized plan',
        'Expert guidance',
        '24/7 support',
      ],
    },
  ]

  // Free tests attempted
  const freeTestsAttempted = [
    {
      id: 7,
      title: 'CLAT Mock Test 1',
      description: 'Basic legal reasoning and English comprehension',
      durationMinutes: 90,
      numberOfQuestions: 150,
      isPaid: false,
      lastScore: 75,
      testAttemptId: 'mock-attempt-7',
      attemptedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      highlights: [
        '150 comprehensive questions',
        'Perfect for beginners',
        'All sections covered',
        'Performance tracking',
      ],
    },
    {
      id: 8,
      title: 'Legal Reasoning Basics',
      description: 'Fundamental concepts and case studies',
      durationMinutes: 75,
      numberOfQuestions: 125,
      isPaid: false,
      lastScore: 82,
      testAttemptId: 'mock-attempt-8',
      attemptedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      highlights: [
        '125 reasoning questions',
        'Concept building',
        'Case law practice',
        'Detailed solutions',
      ],
    },
    {
      id: 9,
      title: 'Logical Reasoning Test',
      description: 'Critical thinking and analytical reasoning',
      durationMinutes: 50,
      numberOfQuestions: 80,
      isPaid: false,
      lastScore: 65,
      testAttemptId: 'mock-attempt-9',
      attemptedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 1 month ago
      highlights: [
        '80 logical questions',
        'Analytical skills',
        'Problem solving',
        'Quick thinking',
      ],
    },
    {
      id: 10,
      title: 'Reading Comprehension',
      description: 'Advanced reading skills and comprehension practice',
      durationMinutes: 45,
      numberOfQuestions: 60,
      isPaid: false,
      lastScore: 70,
      attemptedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 3 months ago
      highlights: [
        '60 comprehension questions',
        'Various passage types',
        'Speed reading tips',
        'Accuracy improvement',
      ],
    },
  ]

  const statCards = [
    {
      title: 'Total Attempted',
      value: stats.totalAttemptedTests,
      icon: History,
      description: 'Tests',
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Paid Attempted',
      value: stats.totalPaidAttempted,
      icon: Crown,
      description: 'Premium',
      gradient: 'from-yellow-500 to-yellow-600',
    },
    {
      title: 'Free Attempted',
      value: stats.totalFreeAttempted,
      icon: Target,
      description: 'Practice',
      gradient: 'from-green-500 to-green-600',
    },
    {
      title: 'Avg Score',
      value: `${stats.averageScore}%`,
      icon: TrendingUp,
      description: 'Average',
      gradient: 'from-purple-500 to-purple-600',
    },
  ]

  // Premium Unlock UI for free users
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
            Unlock Premium Attempts
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base lg:text-lg text-center text-gray-600 dark:text-gray-300 mb-6 max-w-lg">
            Access your premium test attempts and detailed performance analytics
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
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                <History className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-xl lg:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                  Your Test History 📊
                </h1>
                <p className="text-xs sm:text-sm lg:text-lg text-gray-600 dark:text-gray-300 mt-1">
                  Review your attempted tests and track your progress over time
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

        {/* This Week's Tests */}
        <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 relative overflow-hidden">
          {/* Decorative element */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-200/20 to-purple-400/20 rounded-full -mr-10 -mt-10"></div>
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 dark:text-white">
                      This Week's Tests
                    </CardTitle>
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs"
                    >
                      Recent
                    </Badge>
                  </div>
                  <CardDescription className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 hidden sm:block">
                    Your recent test attempts from this week
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-4 sm:pb-6 px-4 sm:px-6">
            {/* Mobile Scrollable */}
            <div className="lg:hidden">
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                {thisWeekTests.map((test) => (
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
              {thisWeekTests.map((test) => (
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

        {/* Paid Tests Attempted - Only for paid users */}
        <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900 dark:to-yellow-800 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                  <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 dark:text-white truncate">
                    Premium Tests Attempted
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 hidden sm:block">
                    Your premium test attempts with detailed analytics
                  </CardDescription>
                </div>
              </div>
              <Badge
                variant="outline"
                className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
              >
                {paidTestsAttempted.length} Attempted
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pb-4 sm:pb-6 px-4 sm:px-6">
            {/* Mobile Scrollable */}
            <div className="lg:hidden">
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                {paidTestsAttempted.map((test) => (
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
              {paidTestsAttempted.map((test) => (
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

        {/* Free Tests Attempted */}
        <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                  <Target className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 dark:text-white truncate">
                    Free Tests Attempted
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 hidden sm:block">
                    Your free practice test attempts and performance
                  </CardDescription>
                </div>
              </div>
              <Badge
                variant="outline"
                className="text-xs text-gray-600 dark:text-gray-300"
              >
                {freeTestsAttempted.length} Attempted
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pb-4 sm:pb-6 px-4 sm:px-6">
            {/* Mobile Scrollable */}
            <div className="lg:hidden">
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                {freeTestsAttempted.map((test) => (
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
              {freeTestsAttempted.map((test) => (
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
