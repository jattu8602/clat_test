'use client'

import { useState, useEffect } from 'react'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  MoreVertical,
  User,
  Crown,
  Shield,
  Ban,
  CheckCircle,
} from 'lucide-react'

export default function UsersPage() {
  const { data: session } = useSession()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingUser, setUpdatingUser] = useState(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      const data = await response.json()
      setUsers(data.users || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateUserRole = async (userId, newRole) => {
    if (updatingUser === userId) return // Prevent double clicks

    setUpdatingUser(userId)
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      })

      if (response.ok) {
        // Show success feedback
        const user = users.find((u) => u.id === userId)
        alert(
          `Successfully updated ${user?.name || 'User'}'s role to ${newRole}`
        )
        fetchUsers() // Refresh the list
      } else {
        const errorData = await response.json()
        alert(`Error updating role: ${errorData.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error updating user role:', error)
      alert('Error updating user role. Please try again.')
    } finally {
      setUpdatingUser(null)
    }
  }

  const toggleUserBlock = async (userId, isBlocked) => {
    if (updatingUser === userId) return // Prevent double clicks

    setUpdatingUser(userId)
    try {
      const response = await fetch(`/api/admin/users/${userId}/block`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isBlocked: !isBlocked }),
      })

      if (response.ok) {
        // Show success feedback
        const user = users.find((u) => u.id === userId)
        const action = isBlocked ? 'unblocked' : 'blocked'
        alert(`Successfully ${action} ${user?.name || 'User'}`)
        fetchUsers() // Refresh the list
      } else {
        const errorData = await response.json()
        alert(
          `Error updating user status: ${errorData.message || 'Unknown error'}`
        )
      }
    } catch (error) {
      console.error('Error toggling user block:', error)
      alert('Error updating user status. Please try again.')
    } finally {
      setUpdatingUser(null)
    }
  }

  const getRoleIcon = (role) => {
    switch (role) {
      case 'ADMIN':
        return (
          <Crown className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
        )
      case 'PAID':
        return <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
      case 'FREE':
        return <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      default:
        return <User className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getRoleBadge = (role) => {
    const variants = {
      ADMIN:
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      PAID: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      FREE: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    }
    return (
      <Badge className={variants[role] || 'bg-muted text-muted-foreground'}>
        {role}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-muted-foreground">Loading users...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 lg:bg-transparent lg:dark:bg-transparent">
      <div className="space-y-4 sm:space-y-6 lg:space-y-8 p-3 sm:p-4 lg:p-0">
        {/* Header Section */}
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-start sm:items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl lg:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                Users Management
              </h1>
              <p className="text-xs sm:text-sm lg:text-lg text-gray-600 dark:text-gray-300 mt-1">
                Manage all users, their roles, and account status
              </p>
            </div>
          </div>
        </div>

        <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 dark:text-white truncate">
                    All Users ({users.length})
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 hidden sm:block">
                    View and manage user accounts, roles, and permissions
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-4 sm:pb-6 px-4 sm:px-6">
            <div className="space-y-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-sm transition-all bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750"
                >
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.image} alt={user.name} />
                      <AvatarFallback className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {user.name || 'Anonymous'}
                        </h3>
                        {getRoleIcon(user.role)}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {user.email}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        {getRoleBadge(user.role)}
                        {user.paidUntil && (
                          <Badge
                            variant="outline"
                            className="text-xs border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                          >
                            Paid until{' '}
                            {new Date(user.paidUntil).toLocaleDateString()}
                          </Badge>
                        )}
                        {user.isBlocked && (
                          <Badge className="text-xs text-red-800 bg-red-100 dark:text-white dark:bg-red-500">
                            Blocked
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                      >
                        <DropdownMenuItem
                          onClick={() => updateUserRole(user.id, 'FREE')}
                          disabled={
                            user.role === 'FREE' || updatingUser === user.id
                          }
                          className="text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <User className="h-4 w-4 mr-2" />
                          {updatingUser === user.id
                            ? 'Updating...'
                            : 'Set as Free'}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => updateUserRole(user.id, 'PAID')}
                          disabled={
                            user.role === 'PAID' || updatingUser === user.id
                          }
                          className="text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          {updatingUser === user.id
                            ? 'Updating...'
                            : 'Set as Paid'}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => updateUserRole(user.id, 'ADMIN')}
                          disabled={
                            user.role === 'ADMIN' || updatingUser === user.id
                          }
                          className="text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <Crown className="h-4 w-4 mr-2" />
                          {updatingUser === user.id
                            ? 'Updating...'
                            : 'Set as Admin'}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            toggleUserBlock(user.id, user.isBlocked)
                          }
                          disabled={updatingUser === user.id}
                          className="text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          {updatingUser === user.id ? (
                            <>
                              <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
                              Updating...
                            </>
                          ) : user.isBlocked ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Unblock User
                            </>
                          ) : (
                            <>
                              <Ban className="h-4 w-4 mr-2" />
                              Block User
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
