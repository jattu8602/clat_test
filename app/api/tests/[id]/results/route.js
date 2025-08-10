import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: testId } = await params
    const { searchParams } = new URL(request.url)
    const testAttemptId = searchParams.get('attemptId')

    if (!testAttemptId) {
      return NextResponse.json(
        { error: 'Test attempt ID required' },
        { status: 400 }
      )
    }

    // Fetch test attempt with user answers
    const testAttempt = await prisma.testAttempt.findFirst({
      where: {
        id: testAttemptId,
        userId: session.user.id,
        testId,
        completed: true,
      },
      include: {
        test: {
          select: {
            title: true,
            description: true,
            durationInMinutes: true,
            positiveMarks: true,
            negativeMarks: true,
          },
        },
        answers: {
          include: {
            question: {
              select: {
                id: true,
                questionNumber: true,
                questionText: true,
                imageUrls: true,
                isComprehension: true,
                comprehension: true,
                isTable: true,
                tableData: true,
                questionType: true,
                optionType: true,
                options: true,
                correctAnswers: true,
                positiveMarks: true,
                negativeMarks: true,
                section: true,
                explanation: true,
              },
            },
          },
          orderBy: {
            question: {
              questionNumber: 'asc',
            },
          },
        },
      },
    })

    if (!testAttempt) {
      return NextResponse.json(
        { error: 'Test attempt not found' },
        { status: 404 }
      )
    }

    // Transform data for frontend
    const results = {
      testAttempt: {
        id: testAttempt.id,
        score: testAttempt.score,
        totalQuestions: testAttempt.totalQuestions,
        correctAnswers: testAttempt.correctAnswers,
        wrongAnswers: testAttempt.wrongAnswers,
        unattempted: testAttempt.unattempted,
        totalTimeSec: testAttempt.totalTimeSec,
        startedAt: testAttempt.startedAt,
        completedAt: testAttempt.completedAt,
      },
      test: testAttempt.test,
      questions: testAttempt.answers.map((answer) => ({
        id: answer.question.id,
        questionNumber: answer.question.questionNumber,
        questionText: answer.question.questionText,
        imageUrls: answer.question.imageUrls,
        isComprehension: answer.question.isComprehension,
        comprehension: answer.question.comprehension,
        isTable: answer.question.isTable,
        tableData: answer.question.tableData,
        questionType: answer.question.questionType,
        optionType: answer.question.optionType,
        options: answer.question.options,
        correctAnswers: answer.question.correctAnswers,
        positiveMarks: answer.question.positiveMarks,
        negativeMarks: answer.question.negativeMarks,
        section: answer.question.section,
        explanation: answer.question.explanation,
        userAnswer: answer.selectedOption,
        isCorrect: answer.isCorrect,
        marksObtained: answer.marksObtained,
        timeTakenSec: answer.timeTakenSec,
      })),
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error('Error fetching test results:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
