'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  Filter,
  X,
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
  const [allTests, setAllTests] = useState([])
  const [filteredTests, setFilteredTests] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeSubject, setActiveSubject] = useState('ALL')

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
      setFilteredTests(allTests)
    } else {
      const filtered = allTests.filter((test) => {
        if (!test.questions || test.questions.length === 0) return false

        // Check if test has any questions from selected subject
        return test.questions.some(
          (question) => question.section === activeSubject
        )
      })
      setFilteredTests(filtered)
    }
  }, [activeSubject, allTests])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch all tests (both free and premium)
        const [freeRes, paidRes] = await Promise.all([
          fetch('/api/tests/free?type=all'),
          fetch('/api/tests/premium?type=all'),
        ])

        const [freeData, paidData] = await Promise.all([
          freeRes.ok ? freeRes.json() : { tests: [] },
          paidRes.ok ? paidRes.json() : { tests: [] },
        ])

        let combinedTests = [
          ...(freeData.tests || []),
          ...(paidData.tests || []),
        ]

        // For free users, mark paid tests as locked
        if (userType === 'FREE') {
          combinedTests = combinedTests.map((test) => ({
            ...test,
            locked: test.isPaid,
          }))
        }

        // Enrich tests with attempt data and scores
        const enrichedTests = await Promise.all(
          combinedTests.map(async (test) => {
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

        // Sort tests: attempted tests first (by completion date), then unattempted
        const sortedTests = enrichedTests.sort((a, b) => {
          if (a.isAttempted && !b.isAttempted) return -1
          if (!a.isAttempted && b.isAttempted) return 1
          if (a.isAttempted && b.isAttempted) {
            return new Date(b.attemptedAt) - new Date(a.attemptedAt)
          }
          return 0
        })

        setAllTests(sortedTests)
        setFilteredTests(sortedTests)

        // Update stats
        setStats({
          totalTests: combinedTests.length,
          completedTests: combinedTests.filter((t) => t.isAttempted).length,
          averageScore:
            enrichedTests.filter((t) => t.isAttempted && t.lastScore).length > 0
              ? Math.round(
                  enrichedTests
                    .filter((t) => t.isAttempted && t.lastScore)
                    .reduce((sum, t) => sum + (t.lastScore || 0), 0) /
                    enrichedTests.filter((t) => t.isAttempted && t.lastScore)
                      .length
                )
              : 0,
          rank: 0,
        })
      } catch (err) {
        console.error('Error fetching tests:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [userType])

  const handleTestAction = (test, action, specificAttempt = null) => {
    if (action === 'upgrade') {
      router.push('/dashboard/payment-history')
    } else if (action === 'reattempt') {
      router.push(`/dashboard/test/${test.id}`)
    } else if (action === 'attempt') {
      router.push(`/dashboard/test/${test.id}`)
    } else if (action === 'evaluate') {
      console.log('Evaluating latest attempt for test:', test)
      if (test.testAttemptId) {
        router.push(
          `/dashboard/test/${test.id}/evaluate?attemptId=${test.testAttemptId}`
        )
      } else {
        toast.error('Test attempt ID not found. Please try again.')
      }
    } else if (action === 'evaluateSpecific') {
      console.log('Evaluating specific attempt:', specificAttempt)
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
    <div className="min-h-screen bg-gray-50 p-2 md:p-4">
      <div className="mx-auto max-w-7xl">
        {/* Welcome Section */}
        <div className="mb-4 md:mb-6 space-y-2 sm:space-y-3">
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
                  : 'No tests available at the moment.'}
              </div>
            ) : (
              filteredTests.map((test) => (
                <TestCard
                  key={test.id}
                  {...test}
                  locked={test.locked}
                  lockLabel="Upgrade to Premium"
                  onAction={(action, specificAttempt) =>
                    handleTestAction(test, action, specificAttempt)
                  }
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
