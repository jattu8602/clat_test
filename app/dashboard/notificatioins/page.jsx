'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Bell, CheckCircle, AlertCircle, Info, X, Check } from 'lucide-react'

export default function NotificationsPage() {
  const notifications = [
    {
      id: 1,
      title: 'New Test Available',
      message: 'Advanced Legal Reasoning test is now available for purchase',
      type: 'info',
      date: '2024-01-15 10:30 AM',
      read: false,
      action: 'View Test',
    },
    {
      id: 2,
      title: 'Test Result Ready',
      message: 'Your CLAT Mock Test 1 results are now available',
      type: 'success',
      date: '2024-01-14 02:15 PM',
      read: true,
      action: 'View Results',
    },
    {
      id: 3,
      title: 'Payment Successful',
      message:
        'Payment of ₹299 for Advanced Legal Reasoning has been processed',
      type: 'success',
      date: '2024-01-13 11:45 AM',
      read: true,
      action: 'View Receipt',
    },
    {
      id: 4,
      title: 'Study Reminder',
      message:
        "You haven't taken a test in 3 days. Keep up with your preparation!",
      type: 'warning',
      date: '2024-01-12 09:00 AM',
      read: false,
      action: 'Take Test',
    },
    {
      id: 5,
      title: 'System Maintenance',
      message: 'Scheduled maintenance on Sunday, 2:00 AM - 4:00 AM',
      type: 'info',
      date: '2024-01-11 06:30 PM',
      read: true,
      action: 'Learn More',
    },
    {
      id: 6,
      title: 'Payment Failed',
      message: 'Payment for Full CLAT Mock Test failed. Please try again.',
      type: 'error',
      date: '2024-01-10 03:20 PM',
      read: false,
      action: 'Retry Payment',
    },
  ]

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const getNotificationColor = (type) => {
    switch (type) {
      case 'success':
        return 'border-green-200 bg-green-50'
      case 'warning':
        return 'border-yellow-200 bg-yellow-50'
      case 'error':
        return 'border-red-200 bg-red-50'
      default:
        return 'border-blue-200 bg-blue-50'
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
        <p className="text-gray-600 mt-2">
          Stay updated with your test progress and important updates
        </p>
      </div>

      {/* Notification Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Notifications
            </CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notifications.length}</div>
            <p className="text-xs text-muted-foreground">
              All time notifications
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {unreadCount}
            </div>
            <p className="text-xs text-muted-foreground">New notifications</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Read</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {notifications.length - unreadCount}
            </div>
            <p className="text-xs text-muted-foreground">Read notifications</p>
          </CardContent>
        </Card>
      </div>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Notifications</CardTitle>
              <CardDescription>
                Your latest updates and important messages
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                Mark All Read
              </Button>
              <Button variant="outline" size="sm">
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border rounded-lg transition-all duration-200 hover:shadow-md ${
                  notification.read ? 'opacity-75' : ''
                } ${getNotificationColor(notification.type)}`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4
                        className={`font-medium ${
                          notification.read ? 'text-gray-600' : 'text-gray-900'
                        }`}
                      >
                        {notification.title}
                      </h4>
                      <div className="flex items-center space-x-2">
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                        <span className="text-xs text-gray-500">
                          {notification.date}
                        </span>
                      </div>
                    </div>
                    <p
                      className={`text-sm mt-1 ${
                        notification.read ? 'text-gray-500' : 'text-gray-700'
                      }`}
                    >
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <Button variant="outline" size="sm">
                        {notification.action}
                      </Button>
                      <div className="flex items-center space-x-2">
                        {!notification.read && (
                          <Button variant="ghost" size="sm">
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
          <CardDescription>
            Customize your notification preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Test Results</h4>
                <p className="text-sm text-gray-600">
                  Get notified when your test results are ready
                </p>
              </div>
              <Button variant="outline" size="sm">
                Enabled
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">New Tests</h4>
                <p className="text-sm text-gray-600">
                  Notifications about new available tests
                </p>
              </div>
              <Button variant="outline" size="sm">
                Enabled
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Study Reminders</h4>
                <p className="text-sm text-gray-600">
                  Daily reminders to maintain study schedule
                </p>
              </div>
              <Button variant="outline" size="sm">
                Enabled
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Payment Updates</h4>
                <p className="text-sm text-gray-600">
                  Payment confirmations and receipts
                </p>
              </div>
              <Button variant="outline" size="sm">
                Enabled
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
