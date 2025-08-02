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
      {/* Top Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tests</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalTests}
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">📝</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.completedTests}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">✅</span>
            </div>
          </div>
        </div>
      </div>

      {/* Free Tests Section */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          free tests :-
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {freeTests.map((test) => (
            <div
              key={test.id}
              className="border border-gray-200 rounded-lg p-4 relative"
            >
              <div className="mb-3">
                <h4 className="font-medium text-gray-900">{test.title}</h4>
                <p className="text-sm text-gray-600">{test.description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Duration: {test.duration}
                </p>
              </div>
              <button className="absolute bottom-3 right-3 bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700 transition-colors">
                start test
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Paid Tests Section */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          paid test :-
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paidTests.map((test) => (
            <div
              key={test.id}
              className="border border-gray-200 rounded-lg p-4 relative"
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
              <button className="absolute bottom-3 right-3 bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 transition-colors">
                buy now
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Attempted Tests Section */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          attempted :-
        </h3>
        <div className="space-y-3">
          {attemptedTests.map((test) => (
            <div
              key={test.id}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
            >
              <div>
                <h4 className="font-medium text-gray-900">{test.title}</h4>
                <p className="text-sm text-gray-600">
                  Completed on {test.date}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-green-600">{test.score}%</p>
                <p className="text-xs text-gray-500">{test.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* More Link */}
      <div className="text-right">
        <Link
          href="/dashboard/free-test"
          className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
        >
          more
        </Link>
      </div>
    </div>
  )
}
