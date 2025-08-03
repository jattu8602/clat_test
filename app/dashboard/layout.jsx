'use client'

import MainLayout from '@/components/layout/main-layout'

export default function DashboardLayout({ children }) {
  return <MainLayout isAdmin={false}>{children}</MainLayout>
}
