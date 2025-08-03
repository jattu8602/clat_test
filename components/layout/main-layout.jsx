'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Sidebar from './sidebar'
import Header from './header'

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 dark:border-slate-700 mx-auto"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent mx-auto absolute top-0"></div>
          </div>
          <div className="mt-6 space-y-2">
            <p className="text-lg font-medium text-slate-900 dark:text-slate-100">
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

        {/* Page Content - Scrollable */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 transition-all duration-300">
          <div className="p-4 lg:p-8 max-w-7xl mx-auto">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 lg:p-8 transition-all duration-300">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
