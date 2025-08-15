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
  RefreshCw,
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
  const [loading, setLoading] = useState(true)
  const [thisWeekTests, setThisWeekTests] = useState([])
  const [paidTestsAttempted, setPaidTestsAttempted] = useState([])
  const [freeTestsAttempted, setFreeTestsAttempted] = useState([])

  // Get user type from session - FREE, PAID, or ADMIN
  const userType = session?.user?.role || 'FREE'

  // Simple cache for attempted data
  const attemptedCache = globalThis.__attemptedCache || {
    paid: null,
    free: null,
    stats: null,
    week: null,
    lastFetch: null,
    expiryMs: 5 * 60 * 1000,
  }
  if (!globalThis.__attemptedCache) globalThis.__attemptedCache = attemptedCache

  const isCacheValid = () => {
    if (!attemptedCache.lastFetch) return false
    return Date.now() - attemptedCache.lastFetch < attemptedCache.expiryMs
  }

  useEffect(() => {
    const init = async () => {
      try {
        if (isCacheValid() && attemptedCache.paid && attemptedCache.free) {
          setPaidTestsAttempted(attemptedCache.paid)
          setFreeTestsAttempted(attemptedCache.free)
          setThisWeekTests(attemptedCache.week || [])
          setStats(attemptedCache.stats || stats)
          setLoading(false)
          return
        }

        setLoading(true)
        // Fetch all free and premium tests, then filter attempted
        const [freeRes, paidRes] = await Promise.all([
          fetch('/api/tests/free?type=all'),
          fetch('/api/tests/premium?type=all'),
        ])

        if (!freeRes.ok || !paidRes.ok) {
          toast.error('Failed to load attempted tests')
          setLoading(false)
          return
        }

        const [freeData, paidData] = await Promise.all([
          freeRes.json(),
          paidRes.json(),
        ])

        const freeAttemptedBase = (freeData.tests || []).filter(
          (t) => t.isAttempted
        )
        const paidAttemptedBase = (paidData.tests || []).filter(
          (t) => t.isAttempted
        )

        // Enrich attempted with marks-based latest score and attemptedAt from results route
        const enrichWithResults = async (tests) => {
          return Promise.all(
            tests.map(async (test) => {
              if (!test.testAttemptId) return { ...test, isAttempted: true }
              try {
                const res = await fetch(
                  `/api/tests/${test.id}/results?attemptId=${test.testAttemptId}`
                )
                if (!res.ok) return { ...test, isAttempted: true }
                const data = await res.json()
                return {
                  ...test,
                  lastScore: data.testAttempt?.score ?? test.lastScore ?? 0,
                  attemptedAt:
                    data.testAttempt?.completedAt ?? test.attemptedAt,
                  totalTimeSec: data.testAttempt?.totalTimeSec,
                }
              } catch (e) {
                return { ...test, isAttempted: true }
              }
            })
          )
        }

        const [freeAttempted, paidAttempted] = await Promise.all([
          enrichWithResults(freeAttemptedBase),
          enrichWithResults(paidAttemptedBase),
        ])

        // Compute stats
        const allAttempted = [...freeAttempted, ...paidAttempted]
        const avgScore =
          allAttempted.length > 0
            ? Math.round(
                allAttempted.reduce((s, t) => s + (t.lastScore || 0), 0) /
                  allAttempted.length
              )
            : 0

        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        const weekList = allAttempted
          .filter((t) =>
            t.attemptedAt ? new Date(t.attemptedAt) >= oneWeekAgo : false
          )
          .sort((a, b) => new Date(b.attemptedAt) - new Date(a.attemptedAt))

        const statsData = {
          totalAttemptedTests: allAttempted.length,
          totalPaidAttempted: paidAttempted.length,
          totalFreeAttempted: freeAttempted.length,
          averageScore: avgScore,
          thisWeekTests: weekList.length,
        }

        setPaidTestsAttempted(paidAttempted)
        setFreeTestsAttempted(freeAttempted)
        setThisWeekTests(weekList)
        setStats(statsData)

        attemptedCache.paid = paidAttempted
        attemptedCache.free = freeAttempted
        attemptedCache.week = weekList
        attemptedCache.stats = statsData
        attemptedCache.lastFetch = Date.now()
      } catch (err) {
        console.error('Error loading attempted tests', err)
        toast.error('Error loading attempted tests')
      } finally {
        setLoading(false)
      }
    }
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleTestAction = (test, action, specificAttempt = null) => {
    if (action === 'reattempt') {
      console.log('Re-attempting test:', test)
      // Navigate to test page for reattempt
      router.push(`/dashboard/test/${test.id}`)
    } else if (action === 'attempt') {
      console.log('Taking test:', test)
      // Navigate to test page
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

  const refreshData = async () => {
    try {
      attemptedCache.paid = null
      attemptedCache.free = null
      attemptedCache.week = null
      attemptedCache.stats = null
      attemptedCache.lastFetch = null
      setLoading(true)
      // Trigger useEffect re-run by calling init logic inline
      const [freeRes, paidRes] = await Promise.all([
        fetch('/api/tests/free?type=all'),
        fetch('/api/tests/premium?type=all'),
      ])
      if (!freeRes.ok || !paidRes.ok) {
        toast.error('Failed to refresh attempted tests')
        setLoading(false)
        return
      }
      const [freeData, paidData] = await Promise.all([
        freeRes.json(),
        paidRes.json(),
      ])
      const freeAttemptedBase = (freeData.tests || []).filter(
        (t) => t.isAttempted
      )
      const paidAttemptedBase = (paidData.tests || []).filter(
        (t) => t.isAttempted
      )

      const enrichWithResults = async (tests) => {
        return Promise.all(
          tests.map(async (test) => {
            if (!test.testAttemptId) return { ...test, isAttempted: true }

            try {
              // First get the latest attempt result
              const res = await fetch(
                `/api/tests/${test.id}/results?attemptId=${test.testAttemptId}`
              )
              if (!res.ok) return { ...test, isAttempted: true }
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
                totalTimeSec: data.testAttempt?.totalTimeSec,
                attemptHistory: attemptHistory,
                attemptCount: attemptHistory.length,
              }
            } catch (e) {
              console.error('Error enriching test with results:', e)
              return { ...test, isAttempted: true }
            }
          })
        )
      }

      const [freeAttempted, paidAttempted] = await Promise.all([
        enrichWithResults(freeAttemptedBase),
        enrichWithResults(paidAttemptedBase),
      ])

      const allAttempted = [...freeAttempted, ...paidAttempted]
      const avgScore =
        allAttempted.length > 0
          ? Math.round(
              allAttempted.reduce((s, t) => s + (t.lastScore || 0), 0) /
                allAttempted.length
            )
          : 0
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      const weekList = allAttempted
        .filter((t) =>
          t.attemptedAt ? new Date(t.attemptedAt) >= oneWeekAgo : false
        )
        .sort((a, b) => new Date(b.attemptedAt) - new Date(a.attemptedAt))

      const statsData = {
        totalAttemptedTests: allAttempted.length,
        totalPaidAttempted: paidAttempted.length,
        totalFreeAttempted: freeAttempted.length,
        averageScore: avgScore,
        thisWeekTests: weekList.length,
      }

      setPaidTestsAttempted(paidAttempted)
      setFreeTestsAttempted(freeAttempted)
      setThisWeekTests(weekList)
      setStats(statsData)

      attemptedCache.paid = paidAttempted
      attemptedCache.free = freeAttempted
      attemptedCache.week = weekList
      attemptedCache.stats = statsData
      attemptedCache.lastFetch = Date.now()
    } catch (err) {
      console.error('Error refreshing attempted tests', err)
      toast.error('Error refreshing attempted tests')
    } finally {
      setLoading(false)
    }
  }

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
            <div className="flex gap-2">
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
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-500 dark:text-gray-400">
                    Loading recent attempts...
                  </p>
                </div>
              </div>
            ) : thisWeekTests.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  No attempts in the last 7 days
                </p>
              </div>
            ) : (
              <>
                {/* Mobile Scrollable */}
                <div className="lg:hidden">
                  <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                    {thisWeekTests.map((test) => (
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
                  {thisWeekTests.map((test) => (
                    <TestCard
                      key={test.id}
                      {...test}
                      isAttempted={true}
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
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-yellow-200 border-t-yellow-500 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-500 dark:text-gray-400">
                    Loading premium attempts...
                  </p>
                </div>
              </div>
            ) : paidTestsAttempted.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  No premium tests attempted yet
                </p>
              </div>
            ) : (
              <>
                {/* Mobile Scrollable */}
                <div className="lg:hidden">
                  <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                    {paidTestsAttempted.map((test) => (
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
                  {paidTestsAttempted.map((test) => (
                    <TestCard
                      key={test.id}
                      {...test}
                      isAttempted={true}
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
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-green-200 border-t-green-500 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-500 dark:text-gray-400">
                    Loading free attempts...
                  </p>
                </div>
              </div>
            ) : freeTestsAttempted.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  No free tests attempted yet
                </p>
              </div>
            ) : (
              <>
                {/* Mobile Scrollable */}
                <div className="lg:hidden">
                  <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                    {freeTestsAttempted.map((test) => (
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
                  {freeTestsAttempted.map((test) => (
                    <TestCard
                      key={test.id}
                      {...test}
                      isAttempted={true}
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
      </div>
    </div>
  )
}
