import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

// Validate required environment variables
if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY environment variable is required')
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (user.role === 'FREE') {
      return NextResponse.json({ error: 'Test generator is available for paid users only' }, { status: 403 })
    }

    const {
      title,
      sections,
      difficulty,
      totalQuestions,
      duration,
      sectionConfigs,
      customTopics
    } = await request.json()

    if (!title || !sections || sections.length === 0) {
      return NextResponse.json({ error: 'Title and at least one section are required' }, { status: 400 })
    }

    // Create the test first
    const test = await prisma.test.create({
      data: {
        title,
        keyTopic: sections.join(', '),
        type: 'PAID',
        durationInMinutes: duration || 60,
        positiveMarks: 1.0,
        negativeMarks: -0.25,
        isActive: true,
        createdBy: session.user.id,
        thumbnailUrl: null,
        highlightPoints: [],
      }
    })

    // Generate questions using Gemini AI
    const questions = await generateQuestionsWithAI({
      sections,
      difficulty,
      totalQuestions,
      sectionConfigs,
      customTopics
    })

    // Create questions in database
    const createdQuestions = await Promise.all(
      questions.map(async (question, index) => {
        return await prisma.question.create({
          data: {
            testId: test.id,
            questionNumber: index + 1,
            questionText: question.questionText,
            questionType: 'OPTIONS',
            optionType: 'SINGLE',
            options: question.options,
            correctAnswers: question.correctAnswers,
            positiveMarks: 1.0,
            negativeMarks: -0.25,
            section: question.section,
            explanation: question.explanation,
            isComprehension: question.isComprehension || false,
            comprehension: question.comprehension || null,
          }
        })
      })
    )

    // Update test with question count
    await prisma.test.update({
      where: { id: test.id },
      data: {
        questionCount: createdQuestions.length
      }
    })

    return NextResponse.json({
      success: true,
      test: {
        ...test,
        questions: createdQuestions,
        questionCount: createdQuestions.length
      }
    })

  } catch (error) {
    console.error('Error generating test:', error)
    
    // More detailed error logging
    if (error.message) {
      console.error('Error message:', error.message)
    }
    if (error.stack) {
      console.error('Error stack:', error.stack)
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to generate test',
        details: error.message || 'Unknown error'
      },
      { status: 500 }
    )
  }
}

async function generateQuestionsWithAI(config) {
  const {
    sections,
    difficulty,
    totalQuestions,
    sectionConfigs,
    customTopics
  } = config

  const prompt = `
You are an expert CLAT (Common Law Admission Test) question generator. Create high-quality, accurate questions that match the CLAT exam pattern.

Requirements:
- Total questions: ${totalQuestions}
- Difficulty level: ${difficulty}
- Sections: ${sections.join(', ')}
${customTopics ? `- Specific topics: ${customTopics}` : ''}

${sectionConfigs.length > 0 ? `
Advanced configuration:
${sectionConfigs.map(config => 
  `- ${config.section}: ${config.questionCount} questions, ${config.difficulty} difficulty${config.topics ? `, topics: ${config.topics}` : ''}`
).join('\n')}
` : ''}

Question format for each section:

1. ENGLISH:
   - Grammar, vocabulary, comprehension passages
   - Focus on legal terminology and formal language
   - Reading comprehension with legal context

2. GK_CA (General Knowledge & Current Affairs):
   - Recent legal developments, Supreme Court judgments
   - Constitutional amendments, government policies
   - International legal developments

3. LEGAL_REASONING:
   - Legal principles, case law analysis
   - Constitutional law, criminal law, civil law
   - Legal reasoning and argumentation

4. LOGICAL_REASONING:
   - Critical thinking, logical analysis
   - Legal argument evaluation
   - Pattern recognition and deduction

5. QUANTITATIVE_TECHNIQUES:
   - Legal mathematics, statistics in law
   - Data interpretation with legal context
   - Numerical reasoning for legal scenarios

For each question, provide:
- Question text (clear and unambiguous)
- 4 options (A, B, C, D)
- Correct answer
- Brief explanation
- Section classification

Return the response as a JSON array of question objects with this structure:
[
  {
    "questionText": "Question text here",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswers": ["Correct option"],
    "section": "SECTION_NAME",
    "explanation": "Brief explanation of the correct answer",
    "isComprehension": false
  }
]

Ensure questions are:
- Accurate and factually correct
- Appropriate difficulty level
- Well-structured and clear
- Relevant to CLAT preparation
- Varied in topics and approaches
`

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 4096,
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gemini API error:', response.status, errorText)
      throw new Error(`Failed to generate questions with AI: ${response.status} - ${errorText}`)
    }

    const data = await response.json()

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response from Gemini API')
    }

    const aiResponse = data.candidates[0].content.parts[0].text

    // Extract JSON from response
    let questions = []
    try {
      const jsonMatch = aiResponse.match(/\[.*\]/s)
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found in response')
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError)
      console.error('AI Response was:', aiResponse)
      // Fallback: generate basic questions
      questions = generateFallbackQuestions(sections, totalQuestions)
    }

    // Validate and clean questions
    questions = questions.filter(q => 
      q.questionText && 
      q.options && 
      q.options.length === 4 && 
      q.correctAnswers && 
      q.section
    )

    // Ensure we have the right number of questions
    if (questions.length < totalQuestions) {
      const additionalQuestions = generateFallbackQuestions(
        sections, 
        totalQuestions - questions.length
      )
      questions = [...questions, ...additionalQuestions]
    }

    return questions.slice(0, totalQuestions)

  } catch (error) {
    console.error('Error in AI generation:', error)
    console.error('AI Error details:', error.message)
    // Fallback to basic question generation
    return generateFallbackQuestions(sections, totalQuestions)
  }
}

function generateFallbackQuestions(sections, count) {
  const questions = []
  const questionsPerSection = Math.ceil(count / sections.length)

  sections.forEach((section, sectionIndex) => {
    const sectionQuestions = Math.min(questionsPerSection, count - questions.length)
    
    for (let i = 0; i < sectionQuestions; i++) {
      const questionNumber = questions.length + 1
      
      let questionData = {
        questionText: `Sample question ${questionNumber} for ${section}`,
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswers: ['Option A'],
        section: section,
        explanation: 'This is a sample explanation for the correct answer.',
        isComprehension: false
      }

      // Section-specific question templates
      switch (section) {
        case 'ENGLISH':
          questionData.questionText = `Choose the correct synonym for "Ubiquitous" in the context of legal proceedings.`
          questionData.options = ['Rare', 'Common', 'Everywhere', 'Hidden']
          questionData.correctAnswers = ['Everywhere']
          questionData.explanation = 'Ubiquitous means present, appearing, or found everywhere, which is relevant in legal contexts.'
          break
        case 'GK_CA':
          questionData.questionText = `Which constitutional amendment introduced the Right to Education as a fundamental right?`
          questionData.options = ['86th Amendment', '87th Amendment', '88th Amendment', '89th Amendment']
          questionData.correctAnswers = ['86th Amendment']
          questionData.explanation = 'The 86th Constitutional Amendment Act, 2002 introduced Article 21A making Right to Education a fundamental right.'
          break
        case 'LEGAL_REASONING':
          questionData.questionText = `In a contract, what is the principle of "caveat emptor" most closely related to?`
          questionData.options = ['Buyer beware', 'Seller beware', 'Mutual consent', 'Consideration']
          questionData.correctAnswers = ['Buyer beware']
          questionData.explanation = 'Caveat emptor means "let the buyer beware" and is a fundamental principle in contract law.'
          break
        case 'LOGICAL_REASONING':
          questionData.questionText = `If all lawyers are professionals, and some professionals are teachers, then which statement is necessarily true?`
          questionData.options = ['All lawyers are teachers', 'Some lawyers are teachers', 'No lawyers are teachers', 'Cannot be determined']
          questionData.correctAnswers = ['Cannot be determined']
          questionData.explanation = 'The given statements do not provide enough information to determine the relationship between lawyers and teachers.'
          break
        case 'QUANTITATIVE_TECHNIQUES':
          questionData.questionText = `If a legal firm has 15 lawyers and 5 paralegals, what percentage of the total staff are lawyers?`
          questionData.options = ['60%', '75%', '80%', '85%']
          questionData.correctAnswers = ['75%']
          questionData.explanation = 'Total staff = 15 + 5 = 20. Percentage of lawyers = (15/20) × 100 = 75%.'
          break
      }

      questions.push(questionData)
    }
  })

  return questions
}
