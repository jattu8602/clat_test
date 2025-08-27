'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
  RefreshCw,
} from 'lucide-react'

// Cache data outside component to persist across navigations
const dataCache = {
  premiumTests: null,
  allPaidTests: null,
  attemptedTests: null,
  stats: null,
  lastFetchTime: null,
  cacheExpiry: 5 * 60 * 1000, // 5 minutes cache
}

export default function PaidTestsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState(
    dataCache.stats || {
      totalPaidTests: 0,
      purchasedTests: 0,
      averageScore: 0,
      totalSpent: 0, // in rupees
    }
  )
  const [premiumTests, setPremiumTests] = useState(dataCache.premiumTests || [])
  const [allPaidTests, setAllPaidTests] = useState(dataCache.allPaidTests || [])
  const [attemptedTests, setAttemptedTests] = useState(
    dataCache.attemptedTests || []
  )
  const [loading, setLoading] = useState(!dataCache.premiumTests) // Only show loading if no cached data

  // Get user type from session - FREE, PAID, or ADMIN
  const userType = session?.user?.role || 'FREE'

  // Check if cache is still valid
  const isCacheValid = () => {
    if (!dataCache.lastFetchTime) return false
    return Date.now() - dataCache.lastFetchTime < dataCache.cacheExpiry
  }

  useEffect(() => {
    if (session && userType !== 'FREE') {
      // Only fetch if we don't have cached data or cache is expired
      if (!dataCache.premiumTests || !isCacheValid()) {
        fetchPremiumTests()
      } else {
        // Use cached data
        setLoading(false)
      }
    }
  }, [session, userType])

  // inside PaidTestsPage (client component) - ensure "use client" at top of file
  const fetchPremiumTests = async () => {
    try {
      setLoading(true)

      // Fetch recent premium tests (this month)
      const recentResponse = await fetch('/api/tests/premium?type=recent')
      const recentData = await recentResponse.json()

      // Fetch all premium tests
      const allResponse = await fetch('/api/tests/premium?type=all')
      const allData = await allResponse.json()

      if (!recentResponse.ok || !allResponse.ok) {
        toast.error('Failed to fetch premium tests')
        return
      }

      const premiumTestsData = recentData.tests || []
      const attempted = allData.tests.filter((test) => test.isAttempted)
      const nonAttempted = allData.tests.filter((test) => !test.isAttempted)

      // For each attempted test, fetch detailed evaluation route to get marks-based score
      const attemptedWithScores = await Promise.all(
        attempted.map(async (test) => {
          // if test has a stored testAttemptId, call the route
          if (!test.testAttemptId) return test

          try {
            const res = await fetch(
              `/api/tests/${test.id}/results?attemptId=${test.testAttemptId}`
            )
            if (!res.ok) return test
            const data = await res.json()
            // Attach score returned by route (marks-based)
            return {
              ...test,
              lastScore: data.testAttempt?.score ?? test.lastScore ?? 0,
              lastMarksObtained: data.testAttempt?.totalMarksObtained,
              lastPossibleMarks: data.testAttempt?.totalPossibleMarks,
              attemptedAt: data.testAttempt?.completedAt ?? test.attemptedAt,
            }
          } catch (err) {
            console.error(
              'Failed to fetch attempt result for test',
              test.id,
              err
            )
            return test
          }
        })
      )

      // Calculate average score from lastScore (marks-based)
      const averageScore =
        attemptedWithScores.length > 0
          ? Math.round(
              attemptedWithScores.reduce(
                (sum, t) => sum + (t.lastScore || 0),
                0
              ) / attemptedWithScores.length
            )
          : 0

      const statsData = {
        totalPaidTests: allData.tests.length,
        purchasedTests: attemptedWithScores.length,
        averageScore,
        totalSpent: 2495,
      }

      // Update state & cache
      setPremiumTests(premiumTestsData.filter((t) => !t.isAttempted))
      setAttemptedTests(attemptedWithScores)
      setAllPaidTests(nonAttempted)
      setStats(statsData)

      dataCache.premiumTests = premiumTestsData.filter((t) => !t.isAttempted)
      dataCache.allPaidTests = nonAttempted
      dataCache.attemptedTests = attemptedWithScores
      dataCache.stats = statsData
      dataCache.lastFetchTime = Date.now()
    } catch (error) {
      console.error('Error fetching premium tests:', error)
      toast.error('Error loading premium tests')
    } finally {
      setLoading(false)
    }
  }

  // Function to clear cache and refresh data
  const refreshData = () => {
    dataCache.premiumTests = null
    dataCache.allPaidTests = null
    dataCache.attemptedTests = null
    dataCache.stats = null
    dataCache.lastFetchTime = null
    fetchPremiumTests()
  }

  const handleTestAction = (test, action, specificAttempt = null) => {
    if (action === 'reattempt') {
      console.log('Re-attempting test:', test)
      // Navigate to test taking page for re-attempt
      router.push(`/dashboard/test/${test.id}`)
    } else if (action === 'attempt') {
      console.log('Taking test:', test)
      // Navigate to test taking page
      router.push(`/dashboard/test/${test.id}`)
    } else if (action === 'evaluate') {
      console.log('Evaluating latest attempt for test:', test)
      // Navigate to evaluation page with the latest attempt ID
      if (test.testAttemptId) {
        router.push(
          `/dashboard/test/${test.id}/evaluate?attemptId=${test.testAttemptId}`
        )
      } else {
        toast.error('Test attempt ID not found. Please try again.')
      }
    } else if (action === 'evaluateSpecific') {
      console.log('Evaluating specific attempt:', specificAttempt)
      console.log(
        'Attempt object structure:',
        JSON.stringify(specificAttempt, null, 2)
      )
      // Navigate to evaluation page with the specific attempt ID
      const attemptId = specificAttempt?.id || specificAttempt?._id
      if (attemptId) {
        console.log('Using attempt ID:', attemptId)
        router.push(
          `/dashboard/test/${test.id}/evaluate?attemptId=${attemptId}`
        )
      } else {
        console.error('No attempt ID found in:', specificAttempt)
        toast.error('Attempt ID not found. Please try again.')
      }
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
      description: 'Percentage',
      gradient: 'from-purple-500 to-purple-600',
    },
    {
      title: 'Time Spent',
      value: `${stats.timeSpent}`,
      icon: ShoppingCart,
      description: 'Practice Time',
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

          {/* CTA Buttons */}
          <div className="w-full max-w-sm mx-auto space-y-3">
            <Button
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white text-base sm:text-lg font-semibold py-3 sm:py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              size="lg"
              onClick={() => {
                router.push('/dashboard/payment-history')
              }}
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
            <div className="flex gap-2">
              {/* Refresh button */}
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 flex-shrink-0 border-2 border-gray-200 dark:border-gray-700"
                onClick={refreshData}
                disabled={loading}
                title="Refresh data"
              >
                <RefreshCw
                  className={`w-4 h-4 dark:text-white ${
                    loading ? 'animate-spin' : ''
                  }`}
                />
                <span className="hidden sm:inline dark:text-white">
                  Refresh
                </span>
              </Button>
              <Link href="/dashboard">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1 flex-shrink-0"
                >
                  <ArrowLeft className="w-4 h-4 dark:text-white" />
                  <span className="hidden sm:inline dark:text-white">Back</span>
                </Button>
              </Link>
            </div>
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
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-yellow-200 border-t-yellow-500 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-500 dark:text-gray-400">
                    Loading premium tests...
                  </p>
                </div>
              </div>
            ) : premiumTests.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  No premium tests available this month
                </p>
              </div>
            ) : (
              <>
                {/* Mobile Scrollable */}
                <div className="lg:hidden">
                  <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                    {premiumTests.map((test) => (
                      <div key={test.id} className="flex-shrink-0 w-80">
                        <TestCard
                          {...test}
                          attemptHistory={test.attemptHistory || []}
                          onAction={(action, specificAttempt) =>
                            handleTestAction(test, action, specificAttempt)
                          }
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
                      attemptHistory={test.attemptHistory || []}
                      onAction={(action, specificAttempt) =>
                        handleTestAction(test, action, specificAttempt)
                      }
                    />
                  ))}
                </div>
              </>
            )}
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
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-500 dark:text-gray-400">
                    Loading premium tests...
                  </p>
                </div>
              </div>
            ) : allPaidTests.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  No premium tests available
                </p>
              </div>
            ) : (
              <>
                {/* Mobile Scrollable */}
                <div className="lg:hidden">
                  <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                    {allPaidTests.map((test) => (
                      <div key={test.id} className="flex-shrink-0 w-80">
                        <TestCard
                          {...test}
                          attemptHistory={test.attemptHistory || []}
                          onAction={(action, specificAttempt) =>
                            handleTestAction(test, action, specificAttempt)
                          }
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
                      attemptHistory={test.attemptHistory || []}
                      onAction={(action, specificAttempt) =>
                        handleTestAction(test, action, specificAttempt)
                      }
                    />
                  ))}
                </div>
              </>
            )}
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
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-green-200 border-t-green-500 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-500 dark:text-gray-400">
                    Loading attempted tests...
                  </p>
                </div>
              </div>
            ) : attemptedTests.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  No tests attempted yet
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  Start with a premium test to see your progress here
                </p>
              </div>
            ) : (
              <>
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
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
