import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Fetch all active payment plans
export async function GET() {
  try {
    const plans = await prisma.paymentPlan.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' }
    });

    return NextResponse.json(plans);
  } catch (error) {
    console.error('Error fetching payment plans:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
