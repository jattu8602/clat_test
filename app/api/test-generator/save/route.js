import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { testId } = await request.json()

    if (!testId) {
      return NextResponse.json({ error: 'Test ID is required' }, { status: 400 })
    }

    // Check if test exists and belongs to the user
    const test = await prisma.test.findFirst({
      where: {
        id: testId,
        createdBy: session.user.id
      }
    })

    if (!test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 })
    }

    // Update test to mark it as saved
    await prisma.test.update({
      where: { id: testId },
      data: {
        isActive: true,
        // You could add a savedAt field or other metadata here
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Test saved successfully'
    })

  } catch (error) {
    console.error('Error saving test:', error)
    return NextResponse.json(
      { error: 'Failed to save test' },
      { status: 500 }
    )
  }
}
