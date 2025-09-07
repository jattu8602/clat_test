// app/api/tests/[id]/results/route.js
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

    // Fetch test attempt with user answers (same include as before)
    const testAttempt = await prisma.testAttempt.findUnique({
      where: {
        id: testAttemptId,
      },
      include: {
        test: {
          select: {
            title: true,
            durationInMinutes: true,
            keyTopic: true,
            type: true,
            passages: {
              orderBy: { passageNumber: 'asc' },
            },
          },
        },
        answers: {
          include: {
            question: {
              select: {
                id: true,
                questionNumber: true,
                questionText: true,
                questionTextFormat: true,
                imageUrls: true,
                  passageId: true,
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
                explanationFormat: true,
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

    // Security and data integrity checks
    if (testAttempt.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (testAttempt.testId !== testId) {
      return NextResponse.json(
        { error: 'Attempt does not belong to this test' },
        { status: 400 }
      )
    }

    // === NEW: marks-based score calculation ===
    // total possible marks = sum of positive marks of questions in the attempt
    const totalPossibleMarks = testAttempt.answers.reduce((sum, ans) => {
      if (!ans.question) return sum // Defensively skip if question is missing
      const qPositive = ans.question.positiveMarks ?? 1
      return sum + (qPositive || 0)
    }, 0)

    // total marks obtained = sum of marksObtained (if stored) otherwise infer from correctness/negative marks
    const totalMarksObtained = testAttempt.answers.reduce((sum, ans) => {
      if (!ans.question) return sum // Defensively skip if question is missing

      if (typeof ans.marksObtained === 'number') {
        return sum + ans.marksObtained
      }

      // fallback if marksObtained not saved
      if (ans.isCorrect) {
        return sum + (ans.question.positiveMarks ?? 1)
      } else if (ans.selectedOption && ans.selectedOption.length > 0) {
        // wrong answer -> negative marks if configured
        const neg = ans.question.negativeMarks ?? 0
        return sum + (neg || 0) // Add the negative value
      } else {
        // unattempted -> 0
        return sum
      }
    }, 0)

    const percentageScore =
      totalPossibleMarks > 0
        ? (totalMarksObtained / totalPossibleMarks) * 100
        : 0

    const roundedScore = Math.round(percentageScore * 100) / 100

    // Transform data for frontend, include marks info
    const results = {
      testAttempt: {
        id: testAttempt.id,
        score: roundedScore,
        totalQuestions: testAttempt.totalQuestions,
        correctAnswers: testAttempt.correctAnswers,
        wrongAnswers: testAttempt.wrongAnswers,
        unattempted: testAttempt.unattempted,
        totalTimeSec: testAttempt.totalTimeSec,
        startedAt: testAttempt.startedAt,
        completedAt: testAttempt.completedAt,
        attemptNumber: testAttempt.attemptNumber,
        totalMarksObtained,
        totalPossibleMarks,
      },
      test: testAttempt.test,
      passages: testAttempt.test.passages,
      questions: testAttempt.answers.map((answer) => ({
        id: answer.question.id,
        questionNumber: answer.question.questionNumber,
        questionText: answer.question.questionText,
        imageUrls: answer.question.imageUrls,
        passageId: answer.question.passageId,
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
