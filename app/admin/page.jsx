'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'

export default function Admin() {
  const { data: session } = useSession()

  const adminSections = [
    {
      title: 'Free Tests',
      description: 'Manage free test content and questions',
      href: '/admin/free-test',
      icon: '📝',
    },
    {
      title: 'Paid Tests',
      description: 'Manage paid test content and questions',
      href: '/admin/paid-test',
      icon: '💰',
    },
    {
      title: 'Notifications',
      description: 'Send notifications to users',
      href: '/admin/notificatioins',
      icon: '🔔',
    },
    {
      title: 'Payment History',
      description: 'View payment transactions and history',
      href: '/admin/payment-history',
      icon: '💳',
    },
    {
      title: 'Profile',
      description: 'Manage admin profile settings',
      href: '/admin/profile',
      icon: '👤',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Welcome to Admin Dashboard
        </h2>
        <p className="text-gray-600">
          Manage your CLAT preparation platform from here. Select a section
          below to get started.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminSections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200 p-6 block"
          >
            <div className="flex items-center space-x-4">
              <div className="text-3xl">{section.icon}</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {section.title}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {section.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Stats
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">0</div>
            <div className="text-sm text-blue-600">Total Users</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">0</div>
            <div className="text-sm text-green-600">Active Tests</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-600">0</div>
            <div className="text-sm text-purple-600">Total Revenue</div>
          </div>
        </div>
      </div>
    </div>
  )
}
