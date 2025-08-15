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
  History,
  ChevronRight,
  GraduationCap,
  TrendingUp,
  Calendar,
  Sparkles,
  Clock,
  Award,
  ArrowLeft,
} from 'lucide-react'

// Simple cache for free tests
const freeDataCache = {
  newTests: null,
  allFreeTests: null,
  attemptedTests: null,
  stats: null,
  lastFetchTime: null,
  cacheExpiry: 5 * 60 * 1000,
}

export default function FreeTestsPage() {
  const { data: session } = useSession()
  const router = useRouter()

  const [stats, setStats] = useState(
    freeDataCache.stats || {
      totalFreeTests: 0,
      attemptedFreeTests: 0,
      averageScore: 0,
      timeSpent: 0, // in hours
    }
  )
  const [newTests, setNewTests] = useState(freeDataCache.newTests || [])
  const [allFreeTests, setAllFreeTests] = useState(
    freeDataCache.allFreeTests || []
  )
  const [attemptedTests, setAttemptedTests] = useState(
    freeDataCache.attemptedTests || []
  )
  const [loading, setLoading] = useState(!freeDataCache.newTests)

  const isCacheValid = () => {
    if (!freeDataCache.lastFetchTime) return false
    return Date.now() - freeDataCache.lastFetchTime < freeDataCache.cacheExpiry
  }

  useEffect(() => {
    if (!freeDataCache.newTests || !isCacheValid()) {
      fetchFreeTests()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchFreeTests = async () => {
    try {
      setLoading(true)

      const recentResponse = await fetch('/api/tests/free?type=recent')
      const recentData = await recentResponse.json()

      const allResponse = await fetch('/api/tests/free?type=all')
      const allData = await allResponse.json()

      if (!recentResponse.ok || !allResponse.ok) {
        toast.error('Failed to fetch free tests')
        return
      }

      const recentFreeTests = recentData.tests || []
      const attempted = (allData.tests || []).filter((t) => t.isAttempted)
      const nonAttempted = (allData.tests || []).filter((t) => !t.isAttempted)

      const attemptedWithScores = await Promise.all(
        attempted.map(async (test) => {
          if (!test.testAttemptId) return test

          try {
            // First get the latest attempt result
            const res = await fetch(
              `/api/tests/${test.id}/results?attemptId=${test.testAttemptId}`
            )
            if (!res.ok) return test
            const data = await res.json()

            // Now fetch attempt history to show multiple attempts
            const attemptsRes = await fetch(
              `/api/tests/${test.id}/attempts?userId=${session?.user?.id}`
            )
            let attemptHistory = []
            if (attemptsRes.ok) {
              attemptHistory = await attemptsRes.json()
            }

            return {
              ...test,
              lastScore: data.testAttempt?.score ?? test.lastScore ?? 0,
              attemptedAt: data.testAttempt?.completedAt ?? test.attemptedAt,
              attemptHistory: attemptHistory,
              attemptCount: attemptHistory.length,
            }
          } catch (e) {
            console.error('Error enriching test with results:', e)
            return test
          }
        })
      )

      const averageScore =
        attemptedWithScores.length > 0
          ? Math.round(
              attemptedWithScores.reduce(
                (sum, t) => sum + (t.lastScore || 0),
                0
              ) / attemptedWithScores.length
            )
          : 0

      const totalTimeSec = attemptedWithScores.reduce(
        (sum, t) => sum + (t.totalTimeSec || 0),
        0
      )
      const timeSpentHours = Math.round((totalTimeSec / 3600) * 10) / 10

      const statsData = {
        totalFreeTests: (allData.tests || []).length,
        attemptedFreeTests: attemptedWithScores.length,
        averageScore,
        timeSpent: timeSpentHours,
      }

      setNewTests(recentFreeTests)
      setAllFreeTests(nonAttempted)
      setAttemptedTests(attemptedWithScores)
      setStats(statsData)

      freeDataCache.newTests = recentFreeTests
      freeDataCache.allFreeTests = nonAttempted
      freeDataCache.attemptedTests = attemptedWithScores
      freeDataCache.stats = statsData
      freeDataCache.lastFetchTime = Date.now()
    } catch (error) {
      console.error('Error fetching free tests:', error)
      toast.error('Error loading free tests')
    } finally {
      setLoading(false)
    }
  }

  const refreshData = () => {
    freeDataCache.newTests = null
    freeDataCache.allFreeTests = null
    freeDataCache.attemptedTests = null
    freeDataCache.stats = null
    freeDataCache.lastFetchTime = null
    fetchFreeTests()
  }

  const handleTestAction = (test, action, specificAttempt = null) => {
    if (action === 'reattempt') {
      router.push(`/dashboard/test/${test.id}`)
    } else if (action === 'attempt') {
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
      title: 'Free Tests',
      value: stats.totalFreeTests,
      icon: BookOpen,
      description: 'Available',
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Attempted',
      value: stats.attemptedFreeTests,
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
      title: 'Time Spent',
      value: `${stats.timeSpent}h`,
      icon: Clock,
      description: 'Practice time',
      gradient: 'from-orange-500 to-orange-600',
    },
  ]

  return (
    <div className="min-h-screen lg:min-h-0 bg-gray-50 dark:bg-gray-900 lg:bg-transparent lg:dark:bg-transparent">
      <div className="space-y-4 sm:space-y-6 lg:space-y-8 p-3 sm:p-4 lg:p-0">
        {/* Header Section */}
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-start sm:items-center justify-between">
            <div className="flex items-start sm:items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                <Target className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-xl lg:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                  Free Practice Tests 🎯
                </h1>
                <p className="text-xs sm:text-sm lg:text-lg text-gray-600 dark:text-gray-300 mt-1">
                  Build your foundation with our comprehensive free test
                  collection
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 flex-shrink-0 border-2 border-gray-200 dark:border-gray-700"
                onClick={refreshData}
                disabled={loading}
                title="Refresh data"
              >
                <ChevronRight
                  className={`w-4 h-4 rotate-90 dark:text-white ${
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

        {/* New Tests This Month */}
        <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 relative overflow-hidden">
          {/* Decorative element */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-yellow-200/20 to-yellow-400/20 rounded-full -mr-10 -mt-10"></div>
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900 dark:to-yellow-800 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 dark:text-white">
                      New This Month
                    </CardTitle>
                    <Badge
                      variant="secondary"
                      className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 text-xs"
                    >
                      Fresh
                    </Badge>
                  </div>
                  <CardDescription className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 hidden sm:block">
                    Latest test uploads - Get ahead with the newest content
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
                    Loading free tests...
                  </p>
                </div>
              </div>
            ) : newTests.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  No new free tests this month
                </p>
              </div>
            ) : (
              <>
                {/* Mobile Scrollable */}
                <div className="lg:hidden">
                  <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                    {newTests.map((test) => (
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
                  {newTests.map((test) => (
                    <TestCard
                      key={test.id}
                      {...test}
                      onAction={(action) => handleTestAction(test, action)}
                    />
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* All Free Tests */}
        <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 dark:text-white truncate">
                    All Free Tests
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 hidden sm:block">
                    Complete collection of free practice tests for CLAT
                    preparation
                  </CardDescription>
                </div>
              </div>
              <Badge
                variant="outline"
                className="text-xs text-gray-600 dark:text-gray-300"
              >
                {allFreeTests.length} Tests
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pb-4 sm:pb-6 px-4 sm:px-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-500 dark:text-gray-400">
                    Loading free tests...
                  </p>
                </div>
              </div>
            ) : allFreeTests.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  No free tests available
                </p>
              </div>
            ) : (
              <>
                {/* Mobile Scrollable */}
                <div className="lg:hidden">
                  <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                    {allFreeTests.map((test) => (
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
                  {allFreeTests.map((test) => (
                    <TestCard
                      key={test.id}
                      {...test}
                      onAction={(action) => handleTestAction(test, action)}
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
                    Review your performance and reattempt tests for better
                    scores
                  </CardDescription>
                </div>
              </div>
              <Badge
                variant="outline"
                className="text-xs text-gray-600 dark:text-gray-300"
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
                  Start with a free test to see your progress here
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
