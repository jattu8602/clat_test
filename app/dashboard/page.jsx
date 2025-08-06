'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
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
  const [stats, setStats] = useState({
    totalTests: 0,
    completedTests: 0,
    averageScore: 0,
    rank: 0,
  })

  useEffect(() => {
    setStats({
      totalTests: 12,
      completedTests: 8,
      averageScore: 75,
      rank: 156,
    })
  }, [])

  const freeTests = [
    {
      id: 1,
      title: 'CLAT Mock Test 1',
      description:
        'Basic legal reasoning and English comprehension test for CLAT preparation',
      durationMinutes: 90,
      numberOfQuestions: 150,
      isPaid: false,
      attemptCount: 1,
      highlights: [
        '150 comprehensive questions',
        'Perfect for beginners',
        'Covers all CLAT sections',
        'Detailed performance analysis',
      ],
    },
    {
      id: 2,
      title: 'English Language Test',
      description: 'Vocabulary, grammar and reading comprehension focused test',
      durationMinutes: 60,
      numberOfQuestions: 100,
      isPaid: false,
      highlights: [
        '100 curated questions',
        'Vocabulary & grammar focus',
        'Reading comprehension',
        'Instant score report',
      ],
    },
    {
      id: 3,
      title: 'Legal Reasoning Basics',
      description:
        'Fundamental legal concepts and case studies for CLAT aspirants',
      durationMinutes: 75,
      numberOfQuestions: 125,
      isPaid: false,
      highlights: [
        '125 reasoning questions',
        'Case study based',
        'Constitutional law focus',
        'Expert explanations',
      ],
    },
  ]

  const paidTests = [
    {
      id: 1,
      title: 'Advanced Legal Reasoning',
      description:
        'Complex case studies and constitutional law for advanced preparation',
      durationMinutes: 120,
      numberOfQuestions: 200,
      isPaid: true,
      highlights: [
        '200 advanced questions',
        'Complex case studies',
        'Constitutional law deep dive',
        'AI-powered analysis',
      ],
    },
    {
      id: 2,
      title: 'Full CLAT Mock Test',
      description:
        'Complete exam simulation with detailed performance analytics',
      durationMinutes: 150,
      numberOfQuestions: 250,
      isPaid: true,
      highlights: [
        '250 comprehensive questions',
        'Full exam simulation',
        'Detailed analytics',
        'Rank prediction',
      ],
    },
    {
      id: 3,
      title: 'CLAT Sectional Test',
      description: 'Section-wise practice with focused improvement strategies',
      durationMinutes: 90,
      numberOfQuestions: 180,
      isPaid: true,
      highlights: [
        '180 sectional questions',
        'Weakness identification',
        'Improvement roadmap',
        'Expert feedback',
      ],
    },
  ]

  const attemptedTests = [
    {
      id: 1,
      title: 'CLAT Mock Test 1',
      description: 'Basic legal reasoning and English comprehension',
      durationMinutes: 90,
      numberOfQuestions: 150,
      isPaid: false,
      attemptCount: 2,
      highlights: [
        '150 comprehensive questions',
        'Perfect for beginners',
        'All sections covered',
        'Performance tracking',
      ],
    },
    {
      id: 2,
      title: 'English Language Test',
      description: 'Vocabulary, grammar and reading comprehension',
      durationMinutes: 60,
      numberOfQuestions: 100,
      isPaid: false,
      attemptCount: 1,
      highlights: [
        '100 curated questions',
        'Language skills focus',
        'Comprehension practice',
        'Score improvement tips',
      ],
    },
    {
      id: 3,
      title: 'Legal Reasoning Basics',
      description: 'Fundamental concepts and case studies',
      durationMinutes: 75,
      numberOfQuestions: 125,
      isPaid: false,
      attemptCount: 3,
      highlights: [
        '125 reasoning questions',
        'Concept building',
        'Case law practice',
        'Detailed solutions',
      ],
    },
  ]

  const handleTestAction = (test, action) => {
    if (action === 'reattempt') {
      console.log('Re-attempting test:', test)
      // Add your re-attempt logic here
      // For example: navigate to test page with re-attempt flag
    } else if (action === 'attempt') {
      console.log('Taking test:', test)
      // Add your attempt logic here
      // For example: navigate to test page
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
                    onAction={(action) => handleTestAction(test, action)}
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
