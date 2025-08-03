import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: testId } = params
    const questionData = await request.json()

    // Validate required fields
    if (!questionData.questionText) {
      return NextResponse.json(
        { error: 'Question text is required' },
        { status: 400 }
      )
    }

    // Get the next question number for this test
    const lastQuestion = await prisma.question.findFirst({
      where: { testId },
      orderBy: { questionNumber: 'desc' },
      select: { questionNumber: true },
    })

    const nextQuestionNumber = (lastQuestion?.questionNumber || 0) + 1

    // Create the question
    const question = await prisma.question.create({
      data: {
        testId,
        questionNumber: nextQuestionNumber,
        questionText: questionData.questionText,
        imageUrls: questionData.imageUrls || [],
        isComprehension: questionData.isComprehension || false,
        comprehension: questionData.comprehension || null,
        isTable: questionData.isTable || false,
        tableData: questionData.tableData || null,
        questionType: questionData.questionType,
        optionType:
          questionData.questionType === 'OPTIONS'
            ? questionData.optionType
            : null,
        options:
          questionData.questionType === 'OPTIONS'
            ? questionData.options.filter((opt) => opt.trim() !== '')
            : [],
        inputAnswer:
          questionData.questionType === 'INPUT'
            ? questionData.inputAnswer
            : null,
        correctAnswers: questionData.correctAnswers || [],
        positiveMarks: questionData.positiveMarks || 1.0,
        negativeMarks: questionData.negativeMarks || -0.25,
        section: questionData.section,
        explanation: questionData.explanation || null,
      },
    })

    return NextResponse.json({
      success: true,
      question,
      message: 'Question added successfully',
    })
  } catch (error) {
    console.error('Error adding question:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: testId } = params

    const questions = await prisma.question.findMany({
      where: { testId },
      orderBy: { questionNumber: 'asc' },
      include: {
        test: {
          select: {
            title: true,
            type: true,
          },
        },
      },
    })

    return NextResponse.json({ questions })
  } catch (error) {
    console.error('Error fetching questions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
