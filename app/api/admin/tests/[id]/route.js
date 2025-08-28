import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: testId } = await params

    const test = await prisma.test.findUnique({
      where: { id: testId },
      include: {
        questions: {
          orderBy: { questionNumber: 'asc' },
        },
        testAttempts: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    })

    if (!test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 })
    }

    return NextResponse.json({ test })
  } catch (error) {
    console.error('Error fetching test:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: testId } = await params
    const updateData = await request.json()

    // Check if this is a status toggle request
    if (updateData.action === 'toggleStatus') {
      const test = await prisma.test.findUnique({
        where: { id: testId },
      })

      if (!test) {
        return NextResponse.json({ error: 'Test not found' }, { status: 404 })
      }

      const updatedTest = await prisma.test.update({
        where: { id: testId },
        data: {
          isActive: !test.isActive,
        },
      })

      // If test is being activated, create a notification for all users
      if (updatedTest.isActive) {
        const notificationTitle = `New ${
          test.type === 'FREE' ? 'Free' : 'Paid'
        } Test Available!`
        const notificationMessage = `${test.title} is now available for ${
          test.type === 'FREE' ? 'free' : 'paid'
        } users. Start practicing now!`

        // Create broadcast notification
        await prisma.notification.create({
          data: {
            title: notificationTitle,
            message: notificationMessage,
            type: 'TEST_ACTIVATION',
            buttonText:
              test.type === 'FREE' ? 'Take Free Test' : 'Take Paid Test',
            buttonLink:
              test.type === 'FREE'
                ? '/dashboard/free-test'
                : '/dashboard/paid-test',
            isBroadcast: true,
          },
        })
      }

      return NextResponse.json({
        success: true,
        test: updatedTest,
        message: `Test ${
          updatedTest.isActive ? 'activated' : 'deactivated'
        } successfully`,
      })
    }

    // Regular update
    // Validate required fields
    if (!updateData.title) {
      return NextResponse.json(
        { error: 'Test title is required' },
        { status: 400 }
      )
    }

    // Update the test
    const updatedTest = await prisma.test.update({
      where: { id: testId },
      data: {
        title: updateData.title,
        keyTopic: updateData.keyTopic,
        type: updateData.type,
        durationInMinutes: updateData.durationInMinutes,
      },
    })

    return NextResponse.json({
      success: true,
      test: updatedTest,
      message: 'Test updated successfully',
    })
  } catch (error) {
    console.error('Error updating test:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: testId } = await params

    // Delete the test and all related data (cascade)
    await prisma.test.delete({
      where: { id: testId },
    })

    return NextResponse.json({
      success: true,
      message: 'Test deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting test:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
