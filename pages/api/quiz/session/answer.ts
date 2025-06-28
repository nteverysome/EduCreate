import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { sessionId, questionId, answerId, timeSpent } = req.body;

    if (!sessionId || !questionId || !answerId) {
      return res.status(400).json({ message: 'Session ID, question ID, and answer ID are required' });
    }

    // Verify session exists
    const session = await prisma.quizSession.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      return res.status(404).json({ message: 'Quiz session not found' });
    }

    // Get question and answer details
    const question = await prisma.quizQuestion.findUnique({
      where: { id: questionId },
      include: {
        answers: true
      }
    });

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const selectedAnswer = question.answers.find(a => a.id === answerId);
    if (!selectedAnswer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    // Check if response already exists for this question
    const existingResponse = await prisma.quizResponse.findFirst({
      where: {
        sessionId,
        questionId
      }
    });

    if (existingResponse) {
      return res.status(400).json({ message: 'Question already answered' });
    }

    // Create response
    const response = await prisma.quizResponse.create({
      data: {
        sessionId,
        questionId,
        answerId,
        isCorrect: selectedAnswer.isCorrect,
        timeSpent: timeSpent || null
      }
    });

    // Update session score if answer is correct
    if (selectedAnswer.isCorrect) {
      await prisma.quizSession.update({
        where: { id: sessionId },
        data: {
          score: {
            increment: question.points
          }
        }
      });
    }

    res.status(201).json({
      id: response.id,
      questionId: response.questionId,
      answerId: response.answerId,
      isCorrect: response.isCorrect,
      timeSpent: response.timeSpent,
      points: selectedAnswer.isCorrect ? question.points : 0
    });

  } catch (error) {
    console.error('Error submitting answer:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
