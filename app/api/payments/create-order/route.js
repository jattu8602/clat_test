import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'
import Razorpay from 'razorpay'

const prisma = new PrismaClient()

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

// POST - Create Razorpay order
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { planId, amount } = body

    if (!planId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify plan exists and is active
    const plan = await prisma.paymentPlan.findUnique({
      where: { id: planId, isActive: true },
    })

    if (!plan) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'INR',
      receipt: `plan_${planId}_${Date.now()}`,
      notes: {
        planId: planId,
        userId: session.user.id,
        planName: plan.name,
      },
    })

    // Create payment record in database
    const payment = await prisma.payment.create({
      data: {
        userId: session.user.id,
        planId: planId,
        amount: amount,
        status: 'PENDING',
        razorpayPaymentId: null,
      },
    })

    return NextResponse.json({
      orderId: order.id,
      amount: amount,
      currency: 'INR',
      paymentId: payment.id,
    })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
