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
} from 'lucide-react'

export default function DashboardHome() {
  const { data: session } = useSession()
  const [stats, setStats] = useState({
    totalTests: 0,
    completedTests: 0,
    averageScore: 0,
    rank: 0,
  })

  // Mock data - replace with actual API calls
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
      description: 'Basic legal reasoning and English comprehension',
      duration: '90 min',
      questions: 150,
    },
    {
      id: 2,
      title: 'English Language Test',
      description: 'Vocabulary, grammar and reading comprehension',
      duration: '60 min',
      questions: 100,
    },
    {
      id: 3,
      title: 'Legal Reasoning Basics',
      description: 'Fundamental concepts and case studies',
      duration: '75 min',
      questions: 125,
    },
  ]

  const paidTests = [
    {
      id: 1,
      title: 'Advanced Legal Reasoning',
      description: 'Complex case studies and constitutional law',
      duration: '120 min',
      questions: 200,
      price: '₹299',
    },
    {
      id: 2,
      title: 'Full CLAT Mock Test',
      description: 'Complete exam simulation with detailed analysis',
      duration: '150 min',
      questions: 250,
      price: '₹499',
    },
  ]

  const attemptedTests = [
    {
      id: 1,
      title: 'CLAT Mock Test 1',
      score: 85,
      date: '2024-01-15',
      status: 'completed',
    },
    {
      id: 2,
      title: 'English Language Test',
      score: 92,
      date: '2024-01-10',
      status: 'completed',
    },
    {
      id: 3,
      title: 'Legal Reasoning Basics',
      score: 68,
      date: '2024-01-08',
      status: 'completed',
    },
  ]

  const handleTestAction = (test, action) => {
    console.log(`${action} test:`, test)
    // Handle test actions here
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {session?.user?.name || 'Student'}! 👋
        </h1>
        <p className="text-muted-foreground text-lg">
          Ready to ace your CLAT preparation? Let's continue your journey to
          success.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-muted hover:shadow-md transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Tests
            </CardTitle>
            <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTests}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Available for practice
            </p>
          </CardContent>
        </Card>

        <Card className="border-muted hover:shadow-md transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
            <div className="h-8 w-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedTests}</div>
            <p className="text-xs text-muted-foreground mt-1">Tests finished</p>
          </CardContent>
        </Card>

        <Card className="border-muted hover:shadow-md transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Score
            </CardTitle>
            <div className="h-8 w-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageScore}%</div>
            <div className="flex items-center space-x-1 mt-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <p className="text-xs text-muted-foreground">
                +5% from last week
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-muted hover:shadow-md transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Rank
            </CardTitle>
            <div className="h-8 w-8 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center">
              <Trophy className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">#{stats.rank}</div>
            <div className="flex items-center space-x-1 mt-1">
              <Users className="h-3 w-3 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                Among 2,450 students
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Free Tests Section */}
      <Card className="border-muted">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-3">
                <div className="h-8 w-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <Target className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                Free Practice Tests
              </CardTitle>
              <CardDescription>
                Start with these free practice tests to build your foundation
              </CardDescription>
            </div>
            <Link href="/dashboard/free-test">
              <Button variant="outline" size="sm">
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {freeTests.map((test) => (
              <TestCard
                key={test.id}
                test={test}
                type="free"
                onAction={(test) => handleTestAction(test, 'start')}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Paid Tests Section */}
      <Card className="border-muted">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-3">
                <div className="h-8 w-8 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center">
                  <Trophy className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                Premium Tests
              </CardTitle>
              <CardDescription>
                Advanced tests with detailed analytics and expert explanations
              </CardDescription>
            </div>
            <Link href="/dashboard/paid-test">
              <Button variant="outline" size="sm">
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paidTests.map((test) => (
              <TestCard
                key={test.id}
                test={test}
                type="paid"
                onAction={(test) => handleTestAction(test, 'buy')}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Attempts */}
      <Card className="border-muted">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-3">
                <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                Recent Test Results
              </CardTitle>
              <CardDescription>
                Your latest test performances and progress
              </CardDescription>
            </div>
            <Link href="/dashboard/progress">
              <Button variant="outline" size="sm">
                View All Results
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {attemptedTests.map((test) => (
              <TestCard
                key={test.id}
                test={test}
                type="attempted"
                onAction={(test) => handleTestAction(test, 'view')}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
        <Link href="/dashboard/free-test">
          <Button size="lg" className="w-full sm:w-auto">
            <Target className="h-5 w-5 mr-2" />
            Start Free Test
          </Button>
        </Link>
        <Link href="/dashboard/paid-test">
          <Button variant="outline" size="lg" className="w-full sm:w-auto">
            <Trophy className="h-5 w-5 mr-2" />
            Explore Premium
          </Button>
        </Link>
        <Link href="/dashboard/progress">
          <Button variant="outline" size="lg" className="w-full sm:w-auto">
            <BarChart3 className="h-5 w-5 mr-2" />
            View Progress
          </Button>
        </Link>
      </div>
    </div>
  )
}
