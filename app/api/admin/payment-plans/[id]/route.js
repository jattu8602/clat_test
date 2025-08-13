import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// PUT - Update payment plan
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()
    const {
      name,
      price,
      duration,
      durationType,
      untilDate,
      thumbnailUrl,
      description,
      discount,
      isActive,
    } = body

    // Validate required fields
    if (!name || !price || !duration) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Calculate duration in days based on type
    let durationInDays = duration
    if (durationType === 'months') {
      durationInDays = duration * 30
    } else if (durationType === 'years') {
      durationInDays = duration * 365
    } else if (durationType === 'until_date' && untilDate) {
      const now = new Date()
      const targetDate = new Date(untilDate)
      durationInDays = Math.ceil((targetDate - now) / (1000 * 60 * 60 * 24))
    }

    const plan = await prisma.paymentPlan.update({
      where: { id },
      data: {
        name,
        price: parseFloat(price),
        duration: durationInDays,
        durationType,
        untilDate: untilDate ? new Date(untilDate) : null,
        thumbnailUrl,
        description,
        discount: discount ? parseFloat(discount) : null,
        isActive,
      },
    })

    return NextResponse.json(plan)
  } catch (error) {
    console.error('Error updating payment plan:', error)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Payment plan not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete payment plan
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params

    // Check if plan has any payments
    const existingPayments = await prisma.payment.findFirst({
      where: { planId: id },
    })

    if (existingPayments) {
      return NextResponse.json(
        {
          error: 'Cannot delete plan with existing payments',
        },
        { status: 400 }
      )
    }

    await prisma.paymentPlan.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Payment plan deleted successfully' })
  } catch (error) {
    console.error('Error deleting payment plan:', error)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Payment plan not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
