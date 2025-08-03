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
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      })

      if (response.ok) {
        fetchUsers() // Refresh the list
      }
    } catch (error) {
      console.error('Error updating user role:', error)
    }
  }

  const toggleUserBlock = async (userId, isBlocked) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/block`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isBlocked: !isBlocked }),
      })

      if (response.ok) {
        fetchUsers() // Refresh the list
      }
    } catch (error) {
      console.error('Error toggling user block:', error)
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
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Users Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage all users, their roles, and account status
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users ({users.length})</CardTitle>
          <CardDescription>
            View and manage user accounts, roles, and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:shadow-sm transition-all"
              >
                <div className="flex items-center space-x-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.image} alt={user.name} />
                    <AvatarFallback>
                      {user.name?.charAt(0)?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-foreground">
                        {user.name || 'Anonymous'}
                      </h3>
                      {getRoleIcon(user.role)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {user.email}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      {getRoleBadge(user.role)}
                      {user.paidUntil && (
                        <Badge variant="outline" className="text-xs">
                          Paid until{' '}
                          {new Date(user.paidUntil).toLocaleDateString()}
                        </Badge>
                      )}
                      {user.isBlocked && (
                        <Badge variant="destructive" className="text-xs">
                          Blocked
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => updateUserRole(user.id, 'FREE')}
                        disabled={user.role === 'FREE'}
                      >
                        <User className="h-4 w-4 mr-2" />
                        Set as Free
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => updateUserRole(user.id, 'PAID')}
                        disabled={user.role === 'PAID'}
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        Set as Paid
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => updateUserRole(user.id, 'ADMIN')}
                        disabled={user.role === 'ADMIN'}
                      >
                        <Crown className="h-4 w-4 mr-2" />
                        Set as Admin
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => toggleUserBlock(user.id, user.isBlocked)}
                      >
                        {user.isBlocked ? (
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
  )
}
