'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import Link from 'next/link'

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

  const recentTests = [
    {
      id: 1,
      title: 'CLAT Mock Test 1',
      type: 'FREE',
      score: 85,
      date: '2024-01-15',
    },
    {
      id: 2,
      title: 'Legal Reasoning Test',
      type: 'PAID',
      score: 78,
      date: '2024-01-12',
    },
    {
      id: 3,
      title: 'English Language Test',
      type: 'FREE',
      score: 92,
      date: '2024-01-10',
    },
  ]

  const upcomingTests = [
    { id: 1, title: 'CLAT Mock Test 2', type: 'FREE', date: '2024-01-20' },
    {
      id: 2,
      title: 'Logical Reasoning Test',
      type: 'PAID',
      date: '2024-01-25',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-4 sm:p-6 text-white">
        <h1 className="text-xl sm:text-2xl font-bold mb-2">
          Welcome back, {session?.user?.name?.split(' ')[0] || 'Student'}! 👋
        </h1>
        <p className="text-indigo-100 text-sm sm:text-base">
          Ready to ace your CLAT preparation? Let's continue your journey to law
          school success.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">
                Total Tests
              </p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">
                {stats.totalTests}
              </p>
            </div>
            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-lg sm:text-2xl">📝</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">
                Completed
              </p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">
                {stats.completedTests}
              </p>
            </div>
            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-lg sm:text-2xl">✅</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">
                Avg Score
              </p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">
                {stats.averageScore}%
              </p>
            </div>
            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-lg sm:text-2xl">📊</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">
                Rank
              </p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">
                #{stats.rank}
              </p>
            </div>
            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-lg sm:text-2xl">🏆</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
            Quick Actions
          </h3>
          <div className="space-y-2 sm:space-y-3">
            <Link
              href="/dashboard/free-test"
              className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-2 sm:space-x-3">
                <span className="text-lg sm:text-xl">📝</span>
                <span className="font-medium text-sm sm:text-base">
                  Take Free Test
                </span>
              </div>
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>

            <Link
              href="/dashboard/paid-test"
              className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-2 sm:space-x-3">
                <span className="text-lg sm:text-xl">💎</span>
                <span className="font-medium text-sm sm:text-base">
                  Premium Tests
                </span>
              </div>
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>

            <Link
              href="/dashboard/payment-history"
              className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-2 sm:space-x-3">
                <span className="text-lg sm:text-xl">💰</span>
                <span className="font-medium text-sm sm:text-base">
                  Upgrade Plan
                </span>
              </div>
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
            Recent Activity
          </h3>
          <div className="space-y-2 sm:space-y-3">
            {recentTests.map((test) => (
              <div
                key={test.id}
                className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-gray-50"
              >
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      test.type === 'PAID'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {test.type}
                  </span>
                  <div>
                    <p className="font-medium text-xs sm:text-sm">
                      {test.title}
                    </p>
                    <p className="text-xs text-gray-500">{test.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-xs sm:text-sm">
                    {test.score}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming Tests */}
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">
            Upcoming Tests
          </h3>
          <Link
            href="/dashboard/free-test"
            className="text-xs sm:text-sm text-indigo-600 hover:text-indigo-700"
          >
            View All
          </Link>
        </div>
        <div className="space-y-2 sm:space-y-3">
          {upcomingTests.map((test) => (
            <div
              key={test.id}
              className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-gray-50"
            >
              <div className="flex items-center space-x-2 sm:space-x-3">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    test.type === 'PAID'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {test.type}
                </span>
                <div>
                  <p className="font-medium text-xs sm:text-sm">{test.title}</p>
                  <p className="text-xs text-gray-500">{test.date}</p>
                </div>
              </div>
              <button className="text-xs bg-indigo-600 text-white px-2 sm:px-3 py-1 rounded-full hover:bg-indigo-700 transition-colors">
                Start
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Study Tips */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 sm:p-6 border border-green-200">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">
          💡 Study Tip of the Day
        </h3>
        <p className="text-gray-700 text-sm sm:text-base">
          "Practice legal reasoning questions daily. Focus on understanding the
          logic behind each answer rather than memorizing. This will help you
          develop critical thinking skills essential for CLAT."
        </p>
      </div>
    </div>
  )
}
