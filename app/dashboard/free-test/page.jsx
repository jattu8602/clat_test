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
  Filter,
  X,
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
  const [activeSubject, setActiveSubject] = useState('ALL')
  const [filteredTests, setFilteredTests] = useState([])

  const userType = session?.user?.role || 'FREE'

  // Available subjects based on schema
  const subjects = [
    { key: 'ALL', label: 'ALL' },
    { key: 'ENGLISH', label: 'ENGLISH' },
    { key: 'GK_CA', label: 'GK' },
    { key: 'LEGAL_REASONING', label: 'LEGAL' },
    { key: 'LOGICAL_REASONING', label: 'LOGICAL' },
    { key: 'QUANTITATIVE_TECHNIQUES', label: 'MATHS' },
  ]

  // Filter tests based on selected subject
  useEffect(() => {
    if (activeSubject === 'ALL') {
      setFilteredTests(allFreeTests)
    } else {
      const filtered = allFreeTests.filter((test) => {
        if (!test.questions || test.questions.length === 0) return false

        // Check if test has any questions from selected subject
        return test.questions.some(
          (question) => question.section === activeSubject
        )
      })
      setFilteredTests(filtered)
    }
  }, [activeSubject, allFreeTests])

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-2 md:p-4">
      <div className="mx-auto max-w-7xl">
        {/* Welcome Section */}
        <div className="mb-4 md:mb-6 space-y-2 sm:space-y-3">
          <div className="flex items-start sm:items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
              <Gift className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl lg:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                Free Practice Tests 🎁
              </h1>
              <p className="text-xs sm:text-sm lg:text-lg text-slate-600 dark:text-slate-300 mt-1">
                Access to high-quality practice tests at no cost
              </p>
            </div>
          </div>
        </div>

        {/* Subject Navigation */}
        <div className="mb-4 md:mb-6 flex flex-wrap gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 shadow-sm">
          {subjects.map((subject) => (
            <button
              key={subject.key}
              onClick={() => setActiveSubject(subject.key)}
              className={`rounded-lg px-3 md:px-6 py-2 md:py-3 text-xs md:text-sm font-semibold transition-all duration-200 ${
                activeSubject === subject.key
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-md'
                  : 'border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
              }`}
            >
              {subject.label}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden shadow-sm">
          <div className="hidden md:grid md:grid-cols-[2fr_1fr_1fr_1fr_1.5fr] border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700 px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
            <div>NAME</div>
            <div>TYPE</div>
            <div>STATUS</div>
            <div>SCORE</div>
            <div>TAKE ACTION</div>
          </div>

          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {loading ? (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-slate-300 dark:border-slate-600 border-t-slate-600 dark:border-t-slate-400 rounded-full animate-spin"></div>
                  Loading tests...
                </div>
              </div>
            ) : filteredTests.length === 0 ? (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                {activeSubject !== 'ALL'
                  ? `No tests found for ${
                      subjects.find((s) => s.key === activeSubject)?.label
                    }. Try selecting a different subject.`
                  : 'No free tests available at the moment.'}
              </div>
            ) : (
              filteredTests.map((test) => (
                <TestCard
                  key={test.id}
                  {...test}
                  userType={userType}
                  onAction={(action) => handleTestAction(test, action)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
