import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - Fetch all payment plans
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const plans = await prisma.paymentPlan.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(plans)
  } catch (error) {
    console.error('Error fetching payment plans:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new payment plan
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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

    const plan = await prisma.paymentPlan.create({
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

    return NextResponse.json(plan, { status: 201 })
  } catch (error) {
    console.error('Error creating payment plan:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
