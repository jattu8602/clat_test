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

        // Filter attempted tests
        const freeAttempted = (freeData.tests || []).filter(
          (t) => t.isAttempted
        )
        const paidAttempted = (paidData.tests || []).filter(
          (t) => t.isAttempted
        )

        // Enrich tests with scores and attempt data
        const enrichedFreeAttempted = await Promise.all(
          freeAttempted.map(async (test) => {
            if (!test.testAttemptId) return test

            try {
              const res = await fetch(
                `/api/tests/${test.id}/results?attemptId=${test.testAttemptId}`
              )
              if (!res.ok) return test
              const data = await res.json()
              return {
                ...test,
                lastScore: data.testAttempt?.score ?? test.lastScore ?? 0,
                attemptedAt: data.testAttempt?.completedAt ?? test.attemptedAt,
              }
            } catch (e) {
              return test
            }
          })
        )

        const enrichedPaidAttempted = await Promise.all(
          paidAttempted.map(async (test) => {
            if (!test.testAttemptId) return test

            try {
              const res = await fetch(
                `/api/tests/${test.id}/results?attemptId=${test.testAttemptId}`
              )
              if (!res.ok) return test
              const data = await res.json()
              return {
                ...test,
                lastScore: data.testAttempt?.score ?? test.lastScore ?? 0,
                attemptedAt: data.testAttempt?.completedAt ?? test.attemptedAt,
              }
            } catch (e) {
              return test
            }
          })
        )

        // Get this week's tests
        const oneWeekAgo = new Date()
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
        const thisWeek = [
          ...enrichedFreeAttempted,
          ...enrichedPaidAttempted,
        ].filter((test) => new Date(test.attemptedAt) >= oneWeekAgo)

        // Calculate stats
        const totalAttemptedTests =
          enrichedFreeAttempted.length + enrichedPaidAttempted.length
        const totalPaidAttempted = enrichedPaidAttempted.length
        const totalFreeAttempted = enrichedFreeAttempted.length
        const thisWeekTests = thisWeek.length

        const allAttempted = [
          ...enrichedFreeAttempted,
          ...enrichedPaidAttempted,
        ]
        const averageScore =
          allAttempted.length > 0
            ? Math.round(
                allAttempted.reduce((sum, t) => sum + (t.lastScore || 0), 0) /
                  allAttempted.length
              )
            : 0

        const newStats = {
          totalAttemptedTests,
          totalPaidAttempted,
          totalFreeAttempted,
          averageScore,
          thisWeekTests,
        }

        setStats(newStats)
        setPaidTestsAttempted(enrichedPaidAttempted)
        setFreeTestsAttempted(enrichedFreeAttempted)
        setThisWeekTests(thisWeek)

        // Update cache
        attemptedCache.paid = enrichedPaidAttempted
        attemptedCache.free = enrichedFreeAttempted
        attemptedCache.stats = newStats
        attemptedCache.week = thisWeek
        attemptedCache.lastFetch = Date.now()
      } catch (error) {
        console.error('Error loading attempted tests:', error)
        toast.error('Failed to load attempted tests')
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [])

  const handleTestAction = (test, action) => {
    if (action === 'evaluate') {
      if (test.testAttemptId) {
        router.push(
          `/dashboard/test/${test.id}/evaluate?attemptId=${test.testAttemptId}`
        )
      } else {
        toast.error('Test attempt ID not found. Please try again.')
      }
    } else if (action === 'reattempt') {
      router.push(`/dashboard/test/${test.id}`)
    }
  }

  const statCards = [
    {
      title: 'Total Attempted',
      value: stats.totalAttemptedTests,
      icon: CheckCircle,
      description: 'Tests Done',
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Free Tests',
      value: stats.totalFreeAttempted,
      icon: Gift,
      description: 'Completed',
      gradient: 'from-green-500 to-green-600',
    },
    {
      title: 'Premium Tests',
      value: stats.totalPaidAttempted,
      icon: Crown,
      description: 'Completed',
      gradient: 'from-amber-500 to-orange-600',
    },
    {
      title: 'This Week',
      value: stats.thisWeekTests,
      icon: Calendar,
      description: 'Recent Tests',
      gradient: 'from-purple-500 to-purple-600',
    },
  ]

  return (
    <div className="min-h-screen lg:min-h-0 bg-gray-50 dark:bg-gray-900 lg:bg-transparent lg:dark:bg-transparent">
      <div className="space-y-4 sm:space-y-6 lg:space-y-8 p-3 sm:p-4 lg:p-0">
        {/* Header Section */}
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-start sm:items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
              <History className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl lg:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                Test History 📚
              </h1>
              <p className="text-xs sm:text-sm lg:text-lg text-gray-600 dark:text-gray-300 mt-1">
                Track your progress and review completed tests
              </p>
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

        {/* This Week's Tests Section */}
        {thisWeekTests.length > 0 && (
          <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <CardHeader className="pb-3 sm:pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 dark:text-white truncate">
                      This Week's Tests
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 hidden sm:block">
                      Tests completed in the last 7 days
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-4 sm:pb-6 px-4 sm:px-6">
              <div className="space-y-4">
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
        )}

        {/* Free Tests Attempted Section */}
        {freeTestsAttempted.length > 0 && (
          <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <CardHeader className="pb-3 sm:pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                    <Gift className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 dark:text-white truncate">
                      Free Tests Completed
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 hidden sm:block">
                      Your completed free practice tests
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-4 sm:pb-6 px-4 sm:px-6">
              <div className="space-y-4">
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
        )}

        {/* Premium Tests Attempted Section */}
        {paidTestsAttempted.length > 0 && (
          <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <CardHeader className="pb-3 sm:pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-amber-100 to-orange-200 dark:from-amber-900 dark:to-orange-800 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                    <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 dark:text-white truncate">
                      Premium Tests Completed
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 hidden sm:block">
                      Your completed premium practice tests
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-4 sm:pb-6 px-4 sm:px-6">
              <div className="space-y-4">
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
        )}

        {/* No Tests Attempted Message */}
        {!loading && stats.totalAttemptedTests === 0 && (
          <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
                <BookOpen className="w-10 h-10 text-gray-600 dark:text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                No Tests Attempted Yet
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
                Start your CLAT preparation journey by attempting your first
                practice test. Track your progress and improve your scores over
                time.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/dashboard/free-test">
                  <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white">
                    <Gift className="w-4 h-4 mr-2" />
                    Try Free Tests
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="outline">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
