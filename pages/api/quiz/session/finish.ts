import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ message: 'Session ID is required' });
    }

    // Get session with responses
    const session = await prisma.quizSession.findUnique({
      where: { id: sessionId },
      include: {
        responses: {
          include: {
            question: true,
            answer: true
          }
        }
      }
    });

    if (!session) {
      return res.status(404).json({ message: 'Quiz session not found' });
    }

    if (session.completedAt) {
      return res.status(400).json({ message: 'Quiz session already completed' });
    }

    // Calculate total time spent
    const totalTimeSpent = session.responses.reduce((total, response) => {
      return total + (response.timeSpent || 0);
    }, 0);

    // Update session as completed
    const updatedSession = await prisma.quizSession.update({
      where: { id: sessionId },
      data: {
        completedAt: new Date(),
        timeSpent: totalTimeSpent
      },
      include: {
        responses: {
          include: {
            question: {
              include: {
                answers: true
              }
            },
            answer: true
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });

    // Format response data
    const formattedResponses = updatedSession.responses.map(response => ({
      questionId: response.questionId,
      question: response.question.question,
      selectedAnswer: response.answer?.text,
      correctAnswer: response.question.answers.find(a => a.isCorrect)?.text,
      isCorrect: response.isCorrect,
      timeSpent: response.timeSpent,
      points: response.isCorrect ? response.question.points : 0
    }));

    res.status(200).json({
      id: updatedSession.id,
      score: updatedSession.score,
      totalPoints: updatedSession.totalPoints,
      percentage: Math.round((updatedSession.score / updatedSession.totalPoints) * 100),
      timeSpent: updatedSession.timeSpent,
      startedAt: updatedSession.startedAt,
      completedAt: updatedSession.completedAt,
      responses: formattedResponses
    });

  } catch (error) {
    console.error('Error finishing quiz session:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
