'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Sidebar from '@/components/layout/sidebar'
import Header from '@/components/layout/header'

export default function MainLayout({ children, isAdmin = false }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/login')
      return
    }

    if (isAdmin && session.user.role !== 'ADMIN') {
      router.push('/dashboard')
      return
    }
  }, [session, status, router, isAdmin])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 px-4">
        <div className="text-center space-y-6">
          {/* Spinner Container */}
          <div className="relative w-20 h-20 mx-auto">
            {/* Outer muted spinner */}
            <div className="animate-spin rounded-full h-full w-full border-4 border-slate-200 dark:border-slate-700"></div>
            {/* Inner colored spinner */}
            <div className="absolute top-0 left-0 animate-spin rounded-full h-full w-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent"></div>
          </div>

          {/* Text Section */}
          <div className="space-y-1">
            <p className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              Loading...
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Please wait while we prepare your workspace
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!session || (isAdmin && session.user.role !== 'ADMIN')) {
    return null
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Sidebar - Fixed and full height */}
      <Sidebar
        isAdmin={isAdmin}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header - Sticky */}
        <Header
          isAdmin={isAdmin}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        {/* Page Content - Scrollable with responsive padding */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 transition-all duration-300">
          {/* Mobile: No padding, Direct content */}
          <div className="lg:p-8 lg:max-w-7xl lg:mx-auto">
            <div className="">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
