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
  Zap,
  Gift,
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

      // Calculate stats
      const totalFreeTests = allData.tests?.length || 0
      const attemptedFreeTests = attemptedWithScores.length
      const averageScore =
        attemptedWithScores.length > 0
          ? Math.round(
              attemptedWithScores.reduce(
                (sum, t) => sum + (t.lastScore || 0),
                0
              ) / attemptedWithScores.length
            )
          : 0

      // Calculate time spent (rough estimate: 2 hours per test)
      const timeSpent = Math.round((attemptedFreeTests * 2 * 100) / 100)

      const newStats = {
        totalFreeTests,
        attemptedFreeTests,
        averageScore,
        timeSpent,
      }

      setStats(newStats)
      setNewTests(recentFreeTests)
      setAllFreeTests(allData.tests || [])
      setAttemptedTests(attemptedWithScores)

      // Update cache
      freeDataCache.newTests = recentFreeTests
      freeDataCache.allFreeTests = allData.tests || []
      freeDataCache.attemptedTests = attemptedWithScores
      freeDataCache.stats = newStats
      freeDataCache.lastFetchTime = Date.now()
    } catch (error) {
      console.error('Error fetching free tests:', error)
      toast.error('Failed to fetch free tests')
    } finally {
      setLoading(false)
    }
  }

  const handleTestAction = (test, action) => {
    if (action === 'attempt') {
      router.push(`/dashboard/test/${test.id}`)
    } else if (action === 'evaluate') {
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
      title: 'Free Tests',
      value: stats.totalFreeTests,
      icon: BookOpen,
      description: 'Available',
      gradient: 'from-green-500 to-green-600',
    },
    {
      title: 'Completed',
      value: stats.attemptedFreeTests,
      icon: CheckCircle,
      description: 'Tests Done',
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Score',
      value: `${stats.averageScore}%`,
      icon: TrendingUp,
      description: 'Average',
      gradient: 'from-purple-500 to-purple-600',
    },
    {
      title: 'Time',
      value: `${stats.timeSpent}h`,
      icon: Clock,
      description: 'Spent',
      gradient: 'from-amber-500 to-amber-600',
    },
  ]

  return (
    <div className="min-h-screen lg:min-h-0 bg-gray-50 dark:bg-gray-900 lg:bg-transparent lg:dark:bg-transparent">
      <div className="space-y-4 sm:space-y-6 lg:space-y-8 p-3 sm:p-4 lg:p-0">
        {/* Header Section */}
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-start sm:items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
              <Gift className="w-4 h-4 sm:w-5 sm:w-5 lg:w-6 lg:h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl lg:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                Free Practice Tests 🎁
              </h1>
              <p className="text-xs sm:text-sm lg:text-lg text-gray-600 dark:text-gray-300 mt-1">
                Access to high-quality practice tests at no cost
              </p>
            </div>
          </div>
        </div>

        {/* All Free Tests Section */}
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
                    Complete collection of free practice tests
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-4 sm:pb-6 px-4 sm:px-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-gray-500 dark:text-gray-400">
                  Loading tests...
                </div>
              </div>
            ) : allFreeTests.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No free tests available at the moment.
              </div>
            ) : (
              <div className="space-y-4">
                {allFreeTests.map((test) => (
                  <TestCard
                    key={test.id}
                    {...test}
                    onAction={(action) => handleTestAction(test, action)}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
