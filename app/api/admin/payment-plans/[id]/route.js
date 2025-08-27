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
    if (!name || !price) {
      return NextResponse.json(
        { error: 'Name and price are required' },
        { status: 400 }
      )
    }

    // Validate duration based on duration type
    if (durationType === 'until_date') {
      if (!untilDate) {
        return NextResponse.json(
          {
            error:
              'Until date is required when duration type is "until specific date"',
          },
          { status: 400 }
        )
      }
    } else if (!duration || duration <= 0) {
      return NextResponse.json(
        { error: 'Duration is required and must be greater than 0' },
        { status: 400 }
      )
    }

    // Calculate duration in days based on type
    let durationInDays = 0
    // Temporarily simplify duration calculation to test basic functionality
    if (durationType === 'months') {
      durationInDays = parseInt(duration) * 30
    } else if (durationType === 'years') {
      durationInDays = parseInt(duration) * 365
    } else if (durationType === 'until_date' && untilDate) {
      const now = new Date()
      const targetDate = new Date(untilDate)
      durationInDays = Math.ceil((targetDate - now) / (1000 * 60 * 60 * 24))
    } else {
      durationInDays = parseInt(duration) || 0
    }

    // Create plan data object
    const planData = {
      name,
      price: parseFloat(price),
      duration: durationInDays,
      durationType: durationType || 'days',
      isActive: isActive !== undefined ? isActive : true,
    }

    // Add optional fields only if they exist
    if (untilDate) planData.untilDate = new Date(untilDate)
    if (thumbnailUrl) planData.thumbnailUrl = thumbnailUrl
    if (description) planData.description = description
    if (discount) planData.discount = parseFloat(discount)

    console.log('Updating plan with data:', planData)

    const plan = await prisma.paymentPlan.update({
      where: { id },
      data: planData,
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
