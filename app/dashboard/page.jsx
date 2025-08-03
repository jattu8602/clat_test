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
      description: 'Basic legal reasoning and English',
      duration: '90 min',
    },
    {
      id: 2,
      title: 'English Language Test',
      description: 'Vocabulary and comprehension',
      duration: '60 min',
    },
  ]

  const paidTests = [
    {
      id: 1,
      title: 'Advanced Legal Reasoning',
      description: 'Complex case studies and analysis',
      duration: '120 min',
      price: '₹299',
    },
    {
      id: 2,
      title: 'Full CLAT Mock Test',
      description: 'Complete exam simulation',
      duration: '150 min',
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
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {session?.user?.name || 'Student'}!
        </h1>
        <p className="text-gray-600 mt-2">
          Ready to ace your CLAT preparation? Let's get started.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
            <span className="text-2xl">📝</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTests}</div>
            <p className="text-xs text-muted-foreground">
              Available for practice
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <span className="text-2xl">✅</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedTests}</div>
            <p className="text-xs text-muted-foreground">Tests finished</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <span className="text-2xl">📊</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageScore}%</div>
            <p className="text-xs text-muted-foreground">Your performance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rank</CardTitle>
            <span className="text-2xl">🏆</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">#{stats.rank}</div>
            <p className="text-xs text-muted-foreground">Among students</p>
          </CardContent>
        </Card>
      </div>

      {/* Free Tests Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">📝</span>
            Free Tests
          </CardTitle>
          <CardDescription>
            Start with these free practice tests to improve your skills
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {freeTests.map((test) => (
              <div
                key={test.id}
                className="border border-gray-200 rounded-lg p-4 relative hover:shadow-md transition-shadow"
              >
                <div className="mb-3">
                  <h4 className="font-medium text-gray-900">{test.title}</h4>
                  <p className="text-sm text-gray-600">{test.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Duration: {test.duration}
                  </p>
                </div>
                <Button className="absolute bottom-3 right-3" size="sm">
                  Start Test
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Paid Tests Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">💎</span>
            Premium Tests
          </CardTitle>
          <CardDescription>
            Advanced tests with detailed analytics and explanations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paidTests.map((test) => (
              <div
                key={test.id}
                className="border border-gray-200 rounded-lg p-4 relative hover:shadow-md transition-shadow"
              >
                <div className="mb-3">
                  <h4 className="font-medium text-gray-900">{test.title}</h4>
                  <p className="text-sm text-gray-600">{test.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Duration: {test.duration}
                  </p>
                  <p className="text-sm font-medium text-purple-600 mt-1">
                    {test.price}
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="absolute bottom-3 right-3"
                  size="sm"
                >
                  Buy Now
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Attempts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">✅</span>
            Recent Attempts
          </CardTitle>
          <CardDescription>Your latest test performances</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {attemptedTests.map((test) => (
              <div
                key={test.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div>
                  <h4 className="font-medium text-gray-900">{test.title}</h4>
                  <p className="text-sm text-gray-600">
                    Completed on {test.date}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">{test.score}%</p>
                  <p className="text-xs text-gray-500 capitalize">
                    {test.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="flex justify-end">
        <Link href="/dashboard/free-test">
          <Button variant="outline">View All Tests</Button>
        </Link>
      </div>
    </div>
  )
}
