'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Menu,
  X,
  Home,
  FileText,
  Crown,
  CreditCard,
  History,
  Trophy,
  Bell,
  User,
  LogOut,
  Settings,
  Users,
  Plus,
} from 'lucide-react'

export default function Sidebar({ isAdmin = false }) {
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigation = isAdmin
    ? [
        { name: 'Dashboard', href: '/admin', icon: Home },
        { name: 'Users Management', href: '/admin/users', icon: Users },
        { name: 'Create Test', href: '/admin/create-test', icon: Plus },
        { name: 'Free Tests', href: '/admin/free-test', icon: FileText },
        { name: 'Paid Tests', href: '/admin/paid-test', icon: Crown },
        { name: 'Payments', href: '/admin/payment-history', icon: CreditCard },
        { name: 'Notifications', href: '/admin/notificatioins', icon: Bell },
        { name: 'Profile', href: '/admin/profile', icon: User },
      ]
    : [
        { name: 'Home', href: '/dashboard', icon: Home },
        { name: 'Free Test', href: '/dashboard/free-test', icon: FileText },
        { name: 'Paid Test', href: '/dashboard/paid-test', icon: Crown },
        {
          name: 'Payment History',
          href: '/dashboard/payment-history',
          icon: CreditCard,
        },
        {
          name: 'Notifications',
          href: '/dashboard/notificatioins',
          icon: Bell,
        },
        { name: 'Profile', href: '/dashboard/profile', icon: User },
      ]

  const isActive = (href) => pathname === href

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card shadow-xl transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-border">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">
                  CL
                </span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">
                  {isAdmin ? 'Admin Panel' : 'CLAT Prep'}
                </h1>
                <p className="text-xs text-muted-foreground">
                  {isAdmin ? 'Management Dashboard' : 'Study Platform'}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-primary/10 text-primary border-r-2 border-primary'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon
                    className={`h-4 w-4 ${
                      isActive(item.href)
                        ? 'text-primary'
                        : 'text-muted-foreground'
                    }`}
                  />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Bottom Section */}
          <div className="px-4 py-6 border-t border-border space-y-3">
            {/* User Profile */}
            <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {session?.user?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {session?.user?.name || 'User'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {session?.user?.email || 'user@example.com'}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              {!isAdmin && session?.user?.role === 'ADMIN' && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => router.push('/admin')}
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Admin Dashboard
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel>Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Bell className="h-4 w-4 mr-2" />
                    Notifications
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setSidebarOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>
    </>
  )
}
