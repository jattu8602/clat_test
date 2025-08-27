'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Bell,
  Eye,
  Megaphone,
  CheckCircle,
  AlertCircle,
  Calendar,
  Users,
  ArrowRight,
  Play,
  Trophy,
  RefreshCcw,
} from 'lucide-react'
import toast from 'react-hot-toast'

// Cache data outside component to persist across navigations
const notificationsCache = {
  notifications: null,
  lastFetchTime: null,
  cacheExpiry: 5 * 60 * 1000, // 5 minutes cache
}

export default function UserNotificationsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [notifications, setNotifications] = useState(
    notificationsCache.notifications || []
  )
  const [loading, setLoading] = useState(!notificationsCache.notifications)

  // Check if cache is still valid
  const isCacheValid = () => {
    if (!notificationsCache.lastFetchTime) return false
    return (
      Date.now() - notificationsCache.lastFetchTime <
      notificationsCache.cacheExpiry
    )
  }

  useEffect(() => {
    if (session) {
      if (!notificationsCache.notifications || !isCacheValid()) {
        fetchNotifications()
      } else {
        setLoading(false)
      }
    }
  }, [session])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/user/notifications')
      if (response.ok) {
        const data = await response.json()
        const newNotifications = data.notifications || []

        // Check if there are new notifications
        const currentIds = new Set(notifications.map((n) => n.id))
        const newNotificationIds = newNotifications.filter(
          (n) => !currentIds.has(n.id)
        )

        // If there are new notifications, increment the header count
        if (
          newNotificationIds.length > 0 &&
          window.incrementHeaderNotificationCount
        ) {
          // Only increment for unread notifications
          const newUnreadCount = newNotificationIds.filter(
            (n) => !n.isRead
          ).length
          for (let i = 0; i < newUnreadCount; i++) {
            window.incrementHeaderNotificationCount()
          }
        }

        setNotifications(newNotifications)

        // Update cache
        notificationsCache.notifications = newNotifications
        notificationsCache.lastFetchTime = Date.now()

        // Refresh header notifications to ensure count is accurate
        if (window.refreshHeaderNotifications) {
          window.refreshHeaderNotifications()
        }
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
      toast.error('Failed to fetch notifications')
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch('/api/user/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationId }),
      })

      if (response.ok) {
        // Update local state
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === notificationId
              ? { ...notification, isRead: true }
              : notification
          )
        )

        // Update cache
        notificationsCache.notifications = notifications.map((notification) =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )

        // Immediately decrement header notification count for better UX
        if (window.decrementHeaderNotificationCount) {
          window.decrementHeaderNotificationCount()
        }

        // Also refresh the actual count from server to ensure accuracy
        if (window.refreshHeaderNotifications) {
          window.refreshHeaderNotifications()
        }

        // Also update sidebar stats if available
        if (window.refreshSidebarStats) {
          window.refreshSidebarStats()
        }

        toast.success('Notification marked as read')
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
      toast.error('Failed to mark notification as read')
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch('/api/user/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ markAllAsRead: true }),
      })

      if (response.ok) {
        // Update local state
        setNotifications((prev) =>
          prev.map((notification) => ({ ...notification, isRead: true }))
        )

        // Update cache
        notificationsCache.notifications = notifications.map(
          (notification) => ({
            ...notification,
            isRead: true,
          })
        )

        // Reset header notification count to 0
        if (window.refreshHeaderNotifications) {
          window.refreshHeaderNotifications()
        }

        // Also update sidebar stats if available
        if (window.refreshSidebarStats) {
          window.refreshSidebarStats()
        }

        toast.success('All notifications marked as read')
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
      toast.error('Failed to mark all notifications as read')
    }
  }

  const handleNotificationClick = async (notification) => {
    // First mark as read if unread, regardless of type
    if (!notification.isRead) {
      // Immediately decrement the count for better UX
      if (window.decrementHeaderNotificationCount) {
        window.decrementHeaderNotificationCount()
      }

      await markAsRead(notification.id)
    }

    // Handle different notification types
    switch (notification.type) {
      case 'TEST_ACTIVATION':
        // Check if it's a free or paid test notification
        if (notification.message.toLowerCase().includes('free')) {
          router.push('/dashboard/free-test')
        } else if (notification.message.toLowerCase().includes('paid')) {
          router.push('/dashboard/paid-test')
        } else {
          // Default to free test if can't determine
          router.push('/dashboard/free-test')
        }
        break

      case 'ADMIN_BROADCAST':
        // If there's a button link, navigate to it
        if (notification.buttonLink) {
          router.push(notification.buttonLink)
        }
        break

      case 'PAYMENT_SUCCESS':
        router.push('/dashboard/payment-history')
        break

      case 'PLAN_EXPIRY':
        router.push('/dashboard/payment-history')
        break

      default:
        // Do nothing for other types
        break
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'TEST_ACTIVATION':
        return <Eye className="w-5 h-5 text-blue-500" />
      case 'ADMIN_BROADCAST':
        return <Megaphone className="w-5 h-5 text-purple-500" />
      case 'PAYMENT_SUCCESS':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'PLAN_EXPIRY':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      default:
        return <Bell className="w-5 h-5 text-gray-500" />
    }
  }

  const getNotificationTypeLabel = (type) => {
    switch (type) {
      case 'TEST_ACTIVATION':
        return 'Test Activation'
      case 'ADMIN_BROADCAST':
        return 'Admin Message'
      case 'PAYMENT_SUCCESS':
        return 'Payment Success'
      case 'PLAN_EXPIRY':
        return 'Plan Expiry'
      default:
        return 'Notification'
    }
  }

  const getActionButton = (notification) => {
    switch (notification.type) {
      case 'TEST_ACTIVATION':
        const isFreeTest = notification.message.toLowerCase().includes('free')
        return (
          <Button
            onClick={() => handleNotificationClick(notification)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isFreeTest ? (
              <>
                <Play className="w-4 h-4" />
                Take Free Test
              </>
            ) : (
              <>
                <Trophy className="w-4 h-4" />
                Take Paid Test
              </>
            )}
            <ArrowRight className="w-4 h-4" />
          </Button>
        )

      case 'ADMIN_BROADCAST':
        if (notification.buttonText && notification.buttonLink) {
          return (
            <Button
              onClick={() => handleNotificationClick(notification)}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white"
            >
              {notification.buttonText}
              <ArrowRight className="w-4 h-4" />
            </Button>
          )
        }
        return null

      case 'PAYMENT_SUCCESS':
        return (
          <Button
            onClick={() => handleNotificationClick(notification)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
          >
            View Payment
            <ArrowRight className="w-4 h-4" />
          </Button>
        )

      case 'PLAN_EXPIRY':
        return (
          <Button
            onClick={() => handleNotificationClick(notification)}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white"
          >
            Renew Plan
            <ArrowRight className="w-4 h-4" />
          </Button>
        )

      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center h-64">
          <div className="flex items-center gap-2">
            <RefreshCcw className="h-6 w-6 animate-spin text-blue-600" />
            <span className="text-lg">Loading notifications...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Notifications</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Stay updated with the latest news and test activations
        </p>
      </div>

      {notifications.length > 0 && (
        <div className="mb-6 flex justify-between items-center">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {notifications.filter((n) => !n.isRead).length} unread notification
            {notifications.filter((n) => !n.isRead).length !== 1 ? 's' : ''}
          </div>
          <div className="flex gap-2">
            <Button
              onClick={fetchNotifications}
              variant="outline"
              size="sm"
              className="text-gray-600 border-gray-200 hover:bg-gray-50 dark:text-gray-400 dark:border-gray-700 dark:hover:bg-gray-900/20"
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            {notifications.some((n) => !n.isRead) && (
              <Button
                onClick={markAllAsRead}
                variant="outline"
                className="text-blue-600 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-700 dark:hover:bg-blue-900/20"
              >
                Mark All as Read
              </Button>
            )}
          </div>
        </div>
      )}

      {notifications.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="text-6xl mb-4">🔔</div>
            <h3 className="text-xl font-semibold mb-2">No notifications yet</h3>
            <p className="text-gray-600 dark:text-gray-400">
              You're all caught up! Check back later for new updates.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`transition-all duration-200 hover:shadow-md ${
                !notification.isRead
                  ? 'border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-l-4 border-l-gray-200 dark:border-l-gray-700'
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                            {notification.title}
                          </h3>
                          <Badge variant="secondary" className="text-xs">
                            {getNotificationTypeLabel(notification.type)}
                          </Badge>
                          {notification.isBroadcast && (
                            <Badge
                              variant="outline"
                              className="text-xs border-purple-200 text-purple-700 dark:border-purple-700 dark:text-purple-300"
                            >
                              Broadcast
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 mb-3">
                          {notification.message}
                        </p>
                      </div>

                      {/* Thumbnail */}
                      {notification.thumbnailUrl && (
                        <div className="flex-shrink-0">
                          <img
                            src={notification.thumbnailUrl}
                            alt="Notification thumbnail"
                            className="w-20 h-20 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                          />
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(
                            notification.createdAt
                          ).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {notification.isBroadcast ? 'All Users' : 'You'}
                        </span>
                      </div>

                      {/* Action Button */}
                      <div className="flex items-center gap-2">
                        {getActionButton(notification)}

                        {!notification.isRead && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                            className="text-blue-600 border-blue-200 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-700 dark:hover:bg-blue-900/20"
                          >
                            Mark as Read
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
