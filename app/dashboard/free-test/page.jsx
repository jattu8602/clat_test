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
} from 'lucide-react'

export default function FreeTestsPage() {
  const { data: session } = useSession()
  const [stats, setStats] = useState({
    totalFreeTests: 0,
    attemptedFreeTests: 0,
    averageScore: 0,
    timeSpent: 0, // in hours
  })

  useEffect(() => {
    // Simulate API call
    setStats({
      totalFreeTests: 15,
      attemptedFreeTests: 8,
      averageScore: 72,
      timeSpent: 24,
    })
  }, [])

  // New tests uploaded this month
  const newTests = [
    {
      id: 1,
      title: 'Current Affairs Mock Test',
      description: 'Latest current affairs and general knowledge for CLAT 2024',
      durationMinutes: 45,
      numberOfQuestions: 50,
      isPaid: false,
      attemptCount: 0,
      highlights: [
        '50 latest current affairs questions',
        'General knowledge focus',
        'Updated for 2024',
        'Quick practice session',
      ],
      isNew: true,
    },
    {
      id: 2,
      title: 'Quantitative Techniques Test',
      description: 'Mathematics and data interpretation practice test',
      durationMinutes: 60,
      numberOfQuestions: 75,
      isPaid: false,
      attemptCount: 0,
      highlights: [
        '75 quantitative questions',
        'Data interpretation included',
        'Step-by-step solutions',
        'Difficulty progression',
      ],
      isNew: true,
    },
    {
      id: 3,
      title: 'Legal Reasoning Advanced',
      description: 'Advanced legal concepts with case studies',
      durationMinutes: 90,
      numberOfQuestions: 100,
      isPaid: false,
      attemptCount: 0,
      highlights: [
        '100 advanced questions',
        'Recent case studies',
        'Constitutional law focus',
        'Expert commentary',
      ],
      isNew: true,
    },
  ]

  // All free tests
  const allFreeTests = [
    {
      id: 4,
      title: 'CLAT Mock Test 1',
      description:
        'Basic legal reasoning and English comprehension test for CLAT preparation',
      durationMinutes: 90,
      numberOfQuestions: 150,
      isPaid: false,
      attemptCount: 0,
      highlights: [
        '150 comprehensive questions',
        'Perfect for beginners',
        'Covers all CLAT sections',
        'Detailed performance analysis',
      ],
    },
    {
      id: 5,
      title: 'English Language Test',
      description: 'Vocabulary, grammar and reading comprehension focused test',
      durationMinutes: 60,
      numberOfQuestions: 100,
      isPaid: false,
      attemptCount: 0,
      highlights: [
        '100 curated questions',
        'Vocabulary & grammar focus',
        'Reading comprehension',
        'Instant score report',
      ],
    },
    {
      id: 6,
      title: 'Legal Reasoning Basics',
      description:
        'Fundamental legal concepts and case studies for CLAT aspirants',
      durationMinutes: 75,
      numberOfQuestions: 125,
      isPaid: false,
      attemptCount: 0,
      highlights: [
        '125 reasoning questions',
        'Case study based',
        'Constitutional law focus',
        'Expert explanations',
      ],
    },
    {
      id: 7,
      title: 'Logical Reasoning Test',
      description: 'Critical thinking and analytical reasoning practice',
      durationMinutes: 50,
      numberOfQuestions: 80,
      isPaid: false,
      attemptCount: 0,
      highlights: [
        '80 logical questions',
        'Critical thinking focus',
        'Pattern recognition',
        'Analytical skills',
      ],
    },
    {
      id: 8,
      title: 'Reading Comprehension',
      description: 'Advanced reading skills and comprehension practice',
      durationMinutes: 45,
      numberOfQuestions: 60,
      isPaid: false,
      attemptCount: 0,
      highlights: [
        '60 comprehension questions',
        'Various passage types',
        'Speed reading tips',
        'Accuracy improvement',
      ],
    },
  ]

  // Attempted free tests
  const attemptedTests = [
    {
      id: 9,
      title: 'CLAT Mock Test 1',
      description: 'Basic legal reasoning and English comprehension',
      durationMinutes: 90,
      numberOfQuestions: 150,
      isPaid: false,
      attemptCount: 2,
      lastScore: 75,
      highlights: [
        '150 comprehensive questions',
        'Perfect for beginners',
        'All sections covered',
        'Performance tracking',
      ],
    },
    {
      id: 10,
      title: 'English Language Test',
      description: 'Vocabulary, grammar and reading comprehension',
      durationMinutes: 60,
      numberOfQuestions: 100,
      isPaid: false,
      attemptCount: 1,
      lastScore: 68,
      highlights: [
        '100 curated questions',
        'Language skills focus',
        'Comprehension practice',
        'Score improvement tips',
      ],
    },
    {
      id: 11,
      title: 'Legal Reasoning Basics',
      description: 'Fundamental concepts and case studies',
      durationMinutes: 75,
      numberOfQuestions: 125,
      isPaid: false,
      attemptCount: 3,
      lastScore: 82,
      highlights: [
        '125 reasoning questions',
        'Concept building',
        'Case law practice',
        'Detailed solutions',
      ],
    },
    {
      id: 12,
      title: 'Logical Reasoning Test',
      description: 'Critical thinking and analytical reasoning',
      durationMinutes: 50,
      numberOfQuestions: 80,
      isPaid: false,
      attemptCount: 1,
      lastScore: 65,
      highlights: [
        '80 logical questions',
        'Analytical skills',
        'Problem solving',
        'Quick thinking',
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
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="gap-1 flex-shrink-0">
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </Button>
            </Link>
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
