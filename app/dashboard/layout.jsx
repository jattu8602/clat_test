'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function DashboardLayout({ children }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!session) {
    router.push('/login')
    return null
  }

  const navigation = [
    { name: 'home', href: '/dashboard', icon: '🏠' },
    { name: 'free test', href: '/dashboard/free-test', icon: '📝' },
    { name: 'paid test', href: '/dashboard/paid-test', icon: '💎' },
    { name: 'payment', href: '/dashboard/payment-history', icon: '💰' },
    { name: 'attempted', href: '/dashboard/attempted', icon: '✅' },
    { name: 'leaderboard', href: '/dashboard/leaderboard', icon: '🏆' },
  ]

  const isActive = (href) => pathname === href

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Profile Circle */}
          <div className="flex items-center justify-center h-20 px-4 bg-indigo-600">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <span className="text-indigo-600 font-bold text-lg">CL</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="capitalize">{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Bottom Buttons */}
          <div className="px-4 py-6 space-y-2">
            {session?.user?.role === 'ADMIN' && (
              <Link
                href="/admin"
                className="w-full px-3 py-2 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors border border-indigo-600 flex items-center justify-center space-x-2"
              >
                <span>👑</span>
                <span>Admin Dashboard</span>
              </Link>
            )}
            <button className="w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors border border-gray-300">
              website
            </button>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors border border-gray-300"
            >
              logout
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Mobile Hamburger */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            {/* Header Content */}
            <div className="flex items-center space-x-4">
              {/* Admin Badge */}
              {session?.user?.role === 'ADMIN' && (
                <div className="flex items-center space-x-2 bg-purple-100 px-3 py-1 rounded-full">
                  <span className="text-purple-600 text-sm">👑</span>
                  <span className="text-purple-600 text-sm font-medium">
                    Admin
                  </span>
                </div>
              )}

              {/* Notification */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">d</span>
                </div>
                <span className="text-sm text-gray-600">notification</span>
              </div>

              {/* Profile */}
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-600 font-bold text-sm">p</span>
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 p-4">{children}</main>
      </div>
    </div>
  )
}
