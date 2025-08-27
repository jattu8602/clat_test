'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
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
import TestCard from '@/components/test-card'
import {
  BookOpen,
  CheckCircle,
  BarChart3,
  Trophy,
  ArrowRight,
  TrendingUp,
  Users,
  Target,
  ChevronRight,
  GraduationCap,
} from 'lucide-react'

export default function DashboardHome() {
  const { data: session } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState({
    totalTests: 0,
    completedTests: 0,
    averageScore: 0,
    rank: 0,
  })
  const [freeTests, setFreeTests] = useState([])
  const [paidTests, setPaidTests] = useState([])
  const [attemptedTests, setAttemptedTests] = useState([])
  const [loading, setLoading] = useState(true)

  const userType = session?.user?.role || 'FREE'

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // Recent tests for display sections
        const [freeRecentRes, paidRecentRes] = await Promise.all([
          fetch('/api/tests/free?type=recent'),
          fetch('/api/tests/premium?type=recent'),
        ])
        const [freeRecent, paidRecent] = await Promise.all([
          freeRecentRes.ok ? freeRecentRes.json() : { tests: [] },
          paidRecentRes.ok ? paidRecentRes.json() : { tests: [] },
        ])
        setFreeTests(freeRecent.tests || [])
        setPaidTests(paidRecent.tests || [])

        // Build recent results from attempted across all tests
        const [freeAllRes, paidAllRes] = await Promise.all([
          fetch('/api/tests/free?type=all'),
          fetch('/api/tests/premium?type=all'),
        ])
        const [freeAll, paidAll] = await Promise.all([
          freeAllRes.ok ? freeAllRes.json() : { tests: [] },
          paidAllRes.ok ? paidAllRes.json() : { tests: [] },
        ])

        const attemptedFreeBase = (freeAll.tests || []).filter(
          (t) => t.isAttempted
        )
        const attemptedPaidBase = (paidAll.tests || []).filter(
          (t) => t.isAttempted
        )
        let combined = [...attemptedFreeBase, ...attemptedPaidBase]

        // For free users, only show free results
        if (userType === 'FREE') {
          combined = combined.filter((t) => t.isPaid === false)
        }

        // Enrich attempted with marks-based score and attemptedAt
        const enriched = await Promise.all(
          combined.map(async (test) => {
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

        const sortedRecent = enriched
          .filter((t) => !!t.attemptedAt)
          .sort((a, b) => new Date(b.attemptedAt) - new Date(a.attemptedAt))
          .slice(0, 6)
        setAttemptedTests(sortedRecent)

        // Basic stats (optional)
        setStats((prev) => ({
          ...prev,
          totalTests:
            (freeRecent.tests?.length || 0) + (paidRecent.tests?.length || 0),
          completedTests: sortedRecent.length,
          averageScore:
            sortedRecent.length > 0
              ? Math.round(
                  sortedRecent.reduce((s, t) => s + (t.lastScore || 0), 0) /
                    sortedRecent.length
                )
              : 0,
        }))
      } catch (err) {
        // Fail silently on dashboard
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleTestAction = (test, action, specificAttempt = null) => {
    if (action === 'upgrade') {
      router.push('/dashboard/payment-history')
    } else if (action === 'reattempt') {
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
        console.error('No attempt ID not found in:', specificAttempt)
        toast.error('Attempt ID not found. Please try again.')
      }
    }
  }

  const statCards = [
    {
      title: 'Tests',
      value: stats.totalTests,
      icon: BookOpen,
      description: 'Available',
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Done',
      value: stats.completedTests,
      icon: CheckCircle,
      description: 'Completed',
      gradient: 'from-green-500 to-green-600',
    },
    {
      title: 'Score',
      value: `${stats.averageScore}%`,
      icon: TrendingUp,
      description: 'Average',
      gradient: 'from-purple-500 to-purple-600',
    },
    {
      title: 'Rank',
      value: `#${stats.rank}`,
      icon: Trophy,
      description: 'Current',
      gradient: 'from-amber-500 to-amber-600',
    },
  ]

  return (
    <div className="min-h-screen lg:min-h-0 bg-gray-50 dark:bg-gray-900 lg:bg-transparent lg:dark:bg-transparent">
      <div className="space-y-4 sm:space-y-6 lg:space-y-8 p-3 sm:p-4 lg:p-0">
        {/* Welcome Section */}
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-start sm:items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl lg:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                Welcome back, {session?.user?.name?.split(' ')[0] || 'Student'}!
                👋
              </h1>
              <p className="text-xs sm:text-sm lg:text-lg text-gray-600 dark:text-gray-300 mt-1">
                Ready to ace your CLAT preparation?
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

        {/* Free Tests Section */}
        <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                  <Target className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 dark:text-white truncate">
                    Free Practice Tests
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 hidden sm:block">
                    Start with these free practice tests to build your
                    foundation
                  </CardDescription>
                </div>
              </div>
              <Link href="/dashboard/free-test">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1 text-gray-600 dark:text-gray-300 flex-shrink-0 px-2 sm:px-3"
                >
                  <span className="hidden sm:inline">View All</span>
                  <span className="sm:hidden text-xs">All</span>
                  <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pb-4 sm:pb-6 px-4 sm:px-6">
            <div className="flex gap-4 sm:gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
              {freeTests.map((test) => (
                <div key={test.id} className="flex-shrink-0 w-80 sm:w-80">
                  <TestCard
                    {...test}
                    onAction={(action) => handleTestAction(test, action)}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Premium Tests Section */}
        <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900 dark:to-amber-800 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                  <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 dark:text-white truncate">
                    Premium Tests
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 hidden sm:block">
                    Advanced tests with detailed analytics and expert
                    explanations
                  </CardDescription>
                </div>
              </div>
              <Link href="/dashboard/paid-test">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1 text-gray-600 dark:text-gray-300 flex-shrink-0 px-2 sm:px-3"
                >
                  <span className="hidden sm:inline">View All</span>
                  <span className="sm:hidden text-xs">All</span>
                  <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pb-4 sm:pb-6 px-4 sm:px-6">
            <div className="flex gap-4 sm:gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
              {paidTests.map((test) => (
                <div key={test.id} className="flex-shrink-0 w-80 sm:w-80">
                  <TestCard
                    {...test}
                    locked={userType === 'FREE'}
                    lockLabel="Upgrade to Premium"
                    onAction={(action) => handleTestAction(test, action)}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Test Results */}
        <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 dark:text-white truncate">
                    Recent Results
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 hidden sm:block">
                    Your latest test performances and progress tracking
                  </CardDescription>
                </div>
              </div>
              <Link href="/dashboard/attempted">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1 text-gray-600 dark:text-gray-300 flex-shrink-0 px-2 sm:px-3"
                >
                  <span className="hidden sm:inline dark:text-gray-300">
                    View All
                  </span>
                  <span className="sm:hidden text-xs dark:text-gray-300">
                    All
                  </span>
                  <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pb-4 sm:pb-6 px-4 sm:px-6">
            <div className="flex gap-4 sm:gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
              {attemptedTests.map((test) => (
                <div key={test.id} className="flex-shrink-0 w-80 sm:w-80">
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
