import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { prisma } from '../../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    const { quizId, playerName, playerEmail } = req.body;

    if (!quizId) {
      return res.status(400).json({ message: 'Quiz ID is required' });
    }

    // Verify quiz exists
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: true,
        activity: true
      }
    });

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Get user if authenticated
    let user = null;
    if (session?.user?.email) {
      user = await prisma.user.findUnique({
        where: { email: session.user.email }
      });
    }

    // Calculate total points
    const totalPoints = quiz.questions.reduce((sum, question) => sum + question.points, 0);

    // Create quiz session
    const quizSession = await prisma.quizSession.create({
      data: {
        quizId,
        userId: user?.id,
        playerName: playerName || user?.name || 'Anonymous',
        playerEmail: playerEmail || user?.email,
        score: 0,
        totalPoints,
        startedAt: new Date()
      }
    });

    res.status(201).json({
      id: quizSession.id,
      quizId: quizSession.quizId,
      playerName: quizSession.playerName,
      score: quizSession.score,
      totalPoints: quizSession.totalPoints,
      startedAt: quizSession.startedAt,
      responses: []
    });

  } catch (error) {
    console.error('Error starting quiz session:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
