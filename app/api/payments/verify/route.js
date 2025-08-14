import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()

// POST - Verify Razorpay payment
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      planId,
    } = body

    if (
      !razorpay_payment_id ||
      !razorpay_order_id ||
      !razorpay_signature ||
      !planId
    ) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Verify signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`
    const signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex')

    if (signature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Get plan details
    const plan = await prisma.paymentPlan.findUnique({
      where: { id: planId },
    })

    if (!plan) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    // Update payment status
    const payment = await prisma.payment.updateMany({
      where: {
        userId: session.user.id,
        planId: planId,
        status: 'PENDING',
      },
      data: {
        status: 'SUCCESS',
        razorpayPaymentId: razorpay_payment_id,
      },
    })

    if (payment.count === 0) {
      return NextResponse.json(
        { error: 'No pending payment found' },
        { status: 400 }
      )
    }

    // Calculate paid until date based on plan duration type
    let paidUntil
    if (plan.durationType === 'until_date' && plan.untilDate) {
      // If plan has a specific end date, use that
      paidUntil = new Date(plan.untilDate)
    } else {
      // Calculate based on duration
      paidUntil = new Date()
      if (plan.durationType === 'days') {
        paidUntil.setDate(paidUntil.getDate() + plan.duration)
      } else if (plan.durationType === 'months') {
        paidUntil.setMonth(paidUntil.getMonth() + plan.duration)
      } else if (plan.durationType === 'years') {
        paidUntil.setFullYear(paidUntil.getFullYear() + plan.duration)
      } else {
        // Default to days
        paidUntil.setDate(paidUntil.getDate() + plan.duration)
      }
    }

    // Update user role and paid until date
    // If user already has a paidUntil date that's in the future, extend it
    const existingUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    let finalPaidUntil = paidUntil
    if (existingUser.paidUntil && existingUser.paidUntil > new Date()) {
      // User already has an active plan, extend from the current paidUntil date
      const baseDate = existingUser.paidUntil
      if (plan.durationType === 'days') {
        baseDate.setDate(baseDate.getDate() + plan.duration)
      } else if (plan.durationType === 'months') {
        baseDate.setMonth(baseDate.getMonth() + plan.duration)
      } else if (plan.durationType === 'years') {
        baseDate.setFullYear(baseDate.getFullYear() + plan.duration)
      }
      finalPaidUntil = baseDate
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        role: 'PAID',
        paidUntil: finalPaidUntil,
      },
    })

    return NextResponse.json({
      message: 'Payment verified successfully',
      paidUntil: finalPaidUntil,
      refreshStats: true, // Signal to refresh sidebar stats
    })
  } catch (error) {
    console.error('Error verifying payment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
