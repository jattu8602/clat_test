import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, keyTopic, type, durationInMinutes, questions } = await request.json()

    if (!title || !type || !durationInMinutes || !questions || questions.length === 0) {
      return NextResponse.json(
        {
          error: 'Title, type, duration, and questions are required',
        },
        { status: 400 }
      )
    }

    // Create the test
    const test = await prisma.test.create({
      data: {
        title,
        keyTopic,
        type,
        durationInMinutes,
        isActive: false, // New tests are created as drafts
        questionCount: questions.length,
        questions: {
          create: questions.map((question, index) => ({
            questionNumber: question.questionNumber || index + 1,
            questionText: question.questionText,
            section: question.section,
            questionType: question.questionType || 'OPTIONS',
            optionType: question.optionType || 'SINGLE',
            options: question.options || [],
            correctAnswers: question.correctAnswers || [],
            positiveMarks: question.positiveMarks || 1.0,
            negativeMarks: question.negativeMarks || -0.25,
            isComprehension: question.isComprehension || false,
            isTable: question.isTable || false,
            imageUrls: question.imageUrls || [],
            explanation: question.explanation || null,
          }))
        }
      },
      include: {
        questions: true
      }
    })

    return NextResponse.json({
      message: 'Test created successfully from PDF',
      testId: test.id,
      test: {
        id: test.id,
        title: test.title,
        keyTopic: test.keyTopic,
        type: test.type,
        durationInMinutes: test.durationInMinutes,
        isActive: test.isActive,
        questionCount: test.questionCount,
        questions: test.questions
      }
    })
  } catch (error) {
    console.error('Error creating test from PDF:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
