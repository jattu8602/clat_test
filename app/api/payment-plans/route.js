import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Cache for payment plans
let plansCache = {
  data: null,
  timestamp: null,
  expiry: 10 * 60 * 1000, // 10 minutes
}

// GET - Fetch all active payment plans
export async function GET() {
  try {
    // Check if cache is valid
    const now = Date.now()
    if (
      plansCache.data &&
      plansCache.timestamp &&
      now - plansCache.timestamp < plansCache.expiry
    ) {
      return NextResponse.json(plansCache.data, {
        headers: {
          'Cache-Control': 'public, max-age=600', // 10 minutes browser cache
          ETag: `"${plansCache.timestamp}"`,
        },
      })
    }

    const plans = await prisma.paymentPlan.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' },
      select: {
        id: true,
        name: true,
        price: true,
        duration: true,
        durationType: true,
        untilDate: true,
        description: true,
        discount: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    // Update cache
    plansCache.data = plans
    plansCache.timestamp = now

    return NextResponse.json(plans, {
      headers: {
        'Cache-Control': 'public, max-age=600', // 10 minutes browser cache
        ETag: `"${now}"`,
      },
    })
  } catch (error) {
    console.error('Error fetching payment plans:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
