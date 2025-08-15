import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Get user notifications
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all notifications for this user, including:
    // 1. User-specific notifications
    // 2. Broadcast notifications
    // 3. Test activation notifications
    // 4. Payment notifications
    // 5. Plan expiry notifications
    const notifications = await prisma.notification.findMany({
      where: {
        OR: [
          // User-specific notifications
          { userId: session.user.id },
          // Broadcast notifications
          { isBroadcast: true },
          // Test activation notifications for this user
          { type: 'TEST_ACTIVATION', userId: session.user.id },
          // Payment notifications for this user
          { type: 'PAYMENT_SUCCESS', userId: session.user.id },
          // Plan expiry notifications for this user
          { type: 'PLAN_EXPIRY', userId: session.user.id },
        ],
      },
      orderBy: { createdAt: 'desc' },
    })

    // Get which broadcast notifications this user has read
    const readBroadcastNotifications =
      await prisma.broadcastNotificationRead.findMany({
        where: {
          userId: session.user.id,
        },
        select: {
          notificationId: true,
        },
      })

    const readBroadcastIds = readBroadcastNotifications.map(
      (r) => r.notificationId
    )

    // Add read status to notifications
    const notificationsWithReadStatus = notifications.map((notification) => ({
      ...notification,
      isRead: notification.isBroadcast
        ? readBroadcastIds.includes(notification.id)
        : notification.isRead,
    }))

    return NextResponse.json({ notifications: notificationsWithReadStatus })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Mark notification as read
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { notificationId, markAllAsRead } = body

    if (markAllAsRead) {
      // Mark all notifications as read for this user
      // First, get all unread notifications for this user
      const unreadNotifications = await prisma.notification.findMany({
        where: {
          OR: [
            // User-specific notifications that are unread
            { userId: session.user.id, isRead: false },
            // Broadcast notifications that this user hasn't read
            {
              isBroadcast: true,
              NOT: {
                readByUsers: {
                  some: {
                    userId: session.user.id,
                  },
                },
              },
            },
          ],
        },
      })

      // Mark user-specific notifications as read
      await prisma.notification.updateMany({
        where: {
          userId: session.user.id,
          isRead: false,
        },
        data: { isRead: true },
      })

      // Mark broadcast notifications as read for this user
      for (const notification of unreadNotifications) {
        if (notification.isBroadcast) {
          await prisma.broadcastNotificationRead.upsert({
            where: {
              userId_notificationId: {
                userId: session.user.id,
                notificationId: notification.id,
              },
            },
            update: {
              readAt: new Date(),
            },
            create: {
              userId: session.user.id,
              notificationId: notification.id,
            },
          })
        }
      }

      return NextResponse.json({
        message: 'All notifications marked as read',
      })
    }

    if (!notificationId) {
      return NextResponse.json(
        { error: 'Notification ID is required' },
        { status: 400 }
      )
    }

    // Check if this is a broadcast notification
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    })

    if (!notification) {
      return NextResponse.json(
        { error: 'Notification not found' },
        { status: 404 }
      )
    }

    if (notification.isBroadcast) {
      // For broadcast notifications, mark as read for this specific user
      await prisma.broadcastNotificationRead.upsert({
        where: {
          userId_notificationId: {
            userId: session.user.id,
            notificationId: notificationId,
          },
        },
        update: {
          readAt: new Date(),
        },
        create: {
          userId: session.user.id,
          notificationId: notificationId,
        },
      })
    } else {
      // For user-specific notifications, mark as read
      await prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true },
      })
    }

    return NextResponse.json({
      message: 'Notification marked as read',
    })
  } catch (error) {
    console.error('Error marking notification as read:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
