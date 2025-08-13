'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Users,
  FileText,
  Crown,
  Bell,
  CreditCard,
  User,
  TrendingUp,
  Activity,
} from 'lucide-react'

export default function Admin() {
  const { data: session } = useSession()

  const adminSections = [
    {
      title: 'Users Management',
      description: 'View and manage all users, roles, and permissions',
      href: '/admin/users',
      icon: Users,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900',
    },
    {
      title: 'Create Test',
      description: 'Create new tests with questions and settings',
      href: '/admin/create-test',
      icon: FileText,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900',
    },
    {
      title: 'Notifications',
      description: 'Send notifications to users',
      href: '/admin/notifications',
      icon: Bell,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900',
    },
    {
      title: 'Payment History',
      description: 'View payment transactions and history',
      href: '/admin/payment-history',
      icon: CreditCard,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900',
    },
  ]

  const stats = [
    {
      title: 'Total Users',
      value: '1,234',
      change: '+12%',
      icon: Users,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900',
    },
    {
      title: 'Active Tests',
      value: '24',
      change: '+3',
      icon: FileText,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900',
    },
    {
      title: 'Total Revenue',
      value: '₹45,678',
      change: '+8%',
      icon: TrendingUp,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900',
    },
    {
      title: 'Active Sessions',
      value: '89',
      change: '+5%',
      icon: Activity,
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-900',
    },
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-[#10172A] text-gray-800 dark:text-gray-200 p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground dark:text-muted-foreground-dark mt-2">
          Welcome back, {session?.user?.name || 'Admin'}. Manage your CLAT
          preparation platform.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card
              key={index}
              className="border dark:border-white dark:bg-[#10172A]"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs mt-1">
                  <span className="text-green-600 dark:text-green-400">
                    {stat.change}
                  </span>{' '}
                  from last month
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Admin Sections */}
      <Card className="border dark:border-white dark:bg-[#10172A]">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Manage different aspects of your platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {adminSections.map((section) => {
              const Icon = section.icon
              return (
                <Link key={section.href} href={section.href} className="block">
                  <div className="p-4 border dark:border-white rounded-lg hover:shadow-md dark:hover:shadow-black transition-all duration-200 hover:border-primary/50 dark:bg-[#10172A]">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${section.bgColor}`}>
                        <Icon className={`h-5 w-5 ${section.color}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{section.title}</h3>
                        <p className="text-sm mt-1">{section.description}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
