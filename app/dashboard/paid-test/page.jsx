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
  Filter,
  X,
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
  const [activeSubject, setActiveSubject] = useState('ALL')
  const [filteredTests, setFilteredTests] = useState([])

  // Get user type from session - FREE, PAID, or ADMIN
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
      setFilteredTests(allPaidTests)
    } else {
      const filtered = allPaidTests.filter((test) => {
        if (!test.questions || test.questions.length === 0) return false

        // Check if test has any questions from selected subject
        return test.questions.some(
          (question) => question.section === activeSubject
        )
      })
      setFilteredTests(filtered)
    }
  }, [activeSubject, allPaidTests])

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

      const recentPremiumTests = recentData.tests || []
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
      const totalPaidTests = allData.tests?.length || 0
      const purchasedTests = allData.tests?.length || 0
      const averageScore =
        attemptedWithScores.length > 0
          ? Math.round(
              attemptedWithScores.reduce(
                (sum, t) => sum + (t.lastScore || 0),
                0
              ) / attemptedWithScores.length
            )
          : 0

      // Calculate total spent (rough estimate: ₹500 per test)
      const totalSpent = Math.round((purchasedTests * 500 * 100) / 100)

      const newStats = {
        totalPaidTests,
        purchasedTests,
        averageScore,
        totalSpent,
      }

      setStats(newStats)
      setPremiumTests(recentPremiumTests)
      setAllPaidTests(allData.tests || [])
      setAttemptedTests(attemptedWithScores)

      // Update cache
      dataCache.premiumTests = recentPremiumTests
      dataCache.allPaidTests = allData.tests || []
      dataCache.attemptedTests = attemptedWithScores
      dataCache.stats = newStats
      dataCache.lastFetchTime = Date.now()
    } catch (error) {
      console.error('Error fetching premium tests:', error)
      toast.error('Failed to fetch premium tests')
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
      title: 'Premium Tests',
      value: stats.totalPaidTests,
      icon: Crown,
      description: 'Available',
      gradient: 'from-amber-500 to-orange-600',
    },
    {
      title: 'Purchased',
      value: stats.purchasedTests,
      icon: ShoppingCart,
      description: 'Tests Owned',
      gradient: 'from-purple-500 to-purple-600',
    },
    {
      title: 'Score',
      value: `${stats.averageScore}%`,
      icon: TrendingUp,
      description: 'Average',
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Investment',
      value: `₹${stats.totalSpent}`,
      icon: Award,
      description: 'Total Spent',
      gradient: 'from-green-500 to-green-600',
    },
  ]

  // If user is FREE, show upgrade message
  if (userType === 'FREE') {
    return (
      <div className="min-h-screen bg-gray-50 p-2 md:p-4">
        <div className="mx-auto max-w-7xl">
          {/* Welcome Section */}
          <div className="mb-4 md:mb-6 space-y-2 sm:space-y-3">
            <div className="flex items-start sm:items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0">
                <Crown className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-xl lg:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                  Premium Tests 👑
                </h1>
                <p className="text-xs sm:text-sm lg:text-lg text-gray-600 dark:text-gray-300 mt-1">
                  Unlock exclusive premium content and advanced features
                </p>
              </div>
            </div>
          </div>

          {/* Upgrade Card */}
          <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-100 to-orange-200 dark:from-amber-900 dark:to-orange-800 flex items-center justify-center">
                <Lock className="w-10 h-10 text-amber-600 dark:text-amber-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Upgrade to Premium
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
                Get access to our exclusive premium test collection, detailed
                analytics, and personalized study recommendations.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={() => router.push('/dashboard/payment-history')}
                  className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  View Plans
                </Button>
                <Link href="/dashboard">
                  <Button variant="outline">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-2 md:p-4">
      <div className="mx-auto max-w-7xl">
        {/* Welcome Section */}
        <div className="mb-4 md:mb-6 space-y-2 sm:space-y-3">
          <div className="flex items-start sm:items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0">
              <Crown className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl lg:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                Premium Tests 👑
              </h1>
              <p className="text-xs sm:text-sm lg:text-lg text-gray-600 dark:text-gray-300 mt-1">
                Access exclusive premium content and advanced features
              </p>
            </div>
          </div>
        </div>

        {/* Subject Navigation */}
        <div className="mb-4 md:mb-6 flex flex-wrap gap-2 rounded-lg border border-gray-300 bg-white p-2">
          {subjects.map((subject) => (
            <button
              key={subject.key}
              onClick={() => setActiveSubject(subject.key)}
              className={`rounded-lg px-3 md:px-6 py-2 md:py-3 text-xs md:text-sm font-semibold transition-colors ${
                activeSubject === subject.key
                  ? 'bg-black text-white'
                  : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {subject.label}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="rounded-lg border border-gray-300 bg-white overflow-hidden">
          <div className="hidden md:grid md:grid-cols-[2fr_1fr_1fr_1fr_1.5fr] border-b border-gray-300 bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-700">
            <div>NAME</div>
            <div>TYPE</div>
            <div>STATUS</div>
            <div>SCORE</div>
            <div>TAKE ACTION</div>
          </div>

          <div className="divide-y divide-gray-200">
            {loading ? (
              <div className="p-8 text-center text-gray-500">
                Loading tests...
              </div>
            ) : filteredTests.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                {activeSubject !== 'ALL'
                  ? `No tests found for ${
                      subjects.find((s) => s.key === activeSubject)?.label
                    }. Try selecting a different subject.`
                  : 'No premium tests available at the moment.'}
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
