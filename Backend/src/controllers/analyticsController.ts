import { Response } from 'express';
import Analytics from '../models/Analytics';
import Quiz from '../models/Quiz';
import Group from '../models/Group';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

/**
 * Get analytics overview for a creator
 * @route GET /api/analytics/overview
 * @access Private - Creator, Admin
 */
export const getAnalyticsOverview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const creatorId = req.user.id;
    
    // Get all quizzes created by this user
    const creatorQuizzes = await Quiz.find({ creatorId }).select('_id');
    const quizIds = creatorQuizzes.map(quiz => quiz._id);
    
    if (quizIds.length === 0) {
      res.status(200).json({
        totalAttempts: 0,
        averageScore: 0,
        totalStudents: 0,
        completionRate: 0,
        recentActivity: [],
        topPerformingQuizzes: [],
        performanceTrends: []
      });
      return;
    }
    
    // Get analytics for all creator's quizzes
    const analytics = await Analytics.find({ quizId: { $in: quizIds } })
      .populate('quizId', 'title')
      .populate('studentId', 'email firstName lastName')
      .sort({ completedAt: -1 });
    
    // Calculate overview metrics
    const totalAttempts = analytics.length;
    const averageScore = analytics.length > 0 
      ? analytics.reduce((sum, a) => sum + a.percentage, 0) / analytics.length 
      : 0;
    
    const uniqueStudents = new Set(analytics.map(a => a.studentId.toString()));
    const totalStudents = uniqueStudents.size;
    
    // Calculate completion rate (assuming all analytics entries are completed)
    const completionRate = 100; // Since we only store completed attempts
    
    // Recent activity (last 10 attempts)
    const recentActivity = analytics.slice(0, 10).map(a => ({
      studentName: `${a.studentId.firstName || ''} ${a.studentId.lastName || ''}`.trim() || a.studentId.email,
      quizTitle: a.quizId.title,
      score: a.percentage,
      completedAt: a.completedAt,
      timeSpent: a.timeSpent
    }));
    
    // Top performing quizzes
    const quizPerformance = new Map();
    analytics.forEach(a => {
      const quizId = a.quizId._id.toString();
      if (!quizPerformance.has(quizId)) {
        quizPerformance.set(quizId, {
          title: a.quizId.title,
          attempts: 0,
          totalScore: 0,
          averageScore: 0
        });
      }
      const quiz = quizPerformance.get(quizId);
      quiz.attempts++;
      quiz.totalScore += a.percentage;
      quiz.averageScore = quiz.totalScore / quiz.attempts;
    });
    
    const topPerformingQuizzes = Array.from(quizPerformance.values())
      .sort((a, b) => b.averageScore - a.averageScore)
      .slice(0, 5);
    
    // Performance trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentAnalytics = analytics.filter(a => a.completedAt >= thirtyDaysAgo);
    const performanceTrends = [];
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));
      
      const dayAnalytics = recentAnalytics.filter(a => 
        a.completedAt >= dayStart && a.completedAt <= dayEnd
      );
      
      const dayAverage = dayAnalytics.length > 0
        ? dayAnalytics.reduce((sum, a) => sum + a.percentage, 0) / dayAnalytics.length
        : 0;
      
      performanceTrends.push({
        date: dayStart.toISOString().split('T')[0],
        averageScore: Math.round(dayAverage * 100) / 100,
        attempts: dayAnalytics.length
      });
    }
    
    res.status(200).json({
      totalAttempts,
      averageScore: Math.round(averageScore * 100) / 100,
      totalStudents,
      completionRate,
      recentActivity,
      topPerformingQuizzes,
      performanceTrends
    });
    
  } catch (error) {
    console.error('Error fetching analytics overview:', error);
    res.status(500).json({ message: 'Failed to fetch analytics overview' });
  }
};

/**
 * Get detailed analytics for a specific quiz
 * @route GET /api/analytics/quiz/:quizId
 * @access Private - Creator, Admin
 */
export const getQuizAnalytics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { quizId } = req.params;
    const creatorId = req.user.id;
    
    // Verify quiz ownership
    const quiz = await Quiz.findOne({ _id: quizId, creatorId });
    if (!quiz) {
      res.status(404).json({ message: 'Quiz not found or access denied' });
      return;
    }
    
    // Get all analytics for this quiz
    const analytics = await Analytics.find({ quizId })
      .populate('studentId', 'email firstName lastName')
      .populate('groupId', 'name')
      .sort({ completedAt: -1 });
    
    if (analytics.length === 0) {
      res.status(200).json({
        quiz: {
          title: quiz.title,
          totalQuestions: quiz.questions.length,
          totalPoints: quiz.questions.reduce((sum, q) => sum + q.points, 0)
        },
        summary: {
          totalAttempts: 0,
          averageScore: 0,
          highestScore: 0,
          lowestScore: 0,
          averageTimeSpent: 0,
          completionRate: 100
        },
        questionAnalytics: [],
        studentPerformance: [],
        timeDistribution: [],
        scoreDistribution: []
      });
      return;
    }
    
    // Calculate summary statistics
    const scores = analytics.map(a => a.percentage);
    const timeSpents = analytics.map(a => a.timeSpent);
    
    const summary = {
      totalAttempts: analytics.length,
      averageScore: scores.reduce((sum, score) => sum + score, 0) / scores.length,
      highestScore: Math.max(...scores),
      lowestScore: Math.min(...scores),
      averageTimeSpent: timeSpents.reduce((sum, time) => sum + time, 0) / timeSpents.length,
      completionRate: 100 // All entries in analytics are completed
    };
    
    // Question-level analytics
    const questionStats = new Map();
    
    analytics.forEach(attempt => {
      attempt.questionAnalytics.forEach(qa => {
        if (!questionStats.has(qa.questionId)) {
          questionStats.set(qa.questionId, {
            questionId: qa.questionId,
            totalAttempts: 0,
            correctAttempts: 0,
            averageTimeSpent: 0,
            totalTimeSpent: 0
          });
        }
        
        const stats = questionStats.get(qa.questionId);
        stats.totalAttempts++;
        if (qa.isCorrect) stats.correctAttempts++;
        stats.totalTimeSpent += qa.timeSpent;
        stats.averageTimeSpent = stats.totalTimeSpent / stats.totalAttempts;
      });
    });
    
    const questionAnalytics = Array.from(questionStats.values()).map(stats => ({
      ...stats,
      correctPercentage: (stats.correctAttempts / stats.totalAttempts) * 100,
      averageTimeSpent: Math.round(stats.averageTimeSpent)
    }));
    
    // Student performance
    const studentPerformance = analytics.map(a => ({
      studentId: a.studentId._id,
      studentName: `${a.studentId.firstName || ''} ${a.studentId.lastName || ''}`.trim() || a.studentId.email,
      studentEmail: a.studentId.email,
      groupName: a.groupId?.name || 'No Group',
      score: a.score,
      percentage: a.percentage,
      timeSpent: a.timeSpent,
      completedAt: a.completedAt,
      behaviorMetrics: a.behaviorMetrics
    }));
    
    // Time distribution (in minutes)
    const timeDistribution = [
      { range: '0-5 min', count: analytics.filter(a => a.timeSpent <= 300).length },
      { range: '5-10 min', count: analytics.filter(a => a.timeSpent > 300 && a.timeSpent <= 600).length },
      { range: '10-20 min', count: analytics.filter(a => a.timeSpent > 600 && a.timeSpent <= 1200).length },
      { range: '20-30 min', count: analytics.filter(a => a.timeSpent > 1200 && a.timeSpent <= 1800).length },
      { range: '30+ min', count: analytics.filter(a => a.timeSpent > 1800).length }
    ];
    
    // Score distribution
    const scoreDistribution = [
      { range: '0-20%', count: analytics.filter(a => a.percentage <= 20).length },
      { range: '21-40%', count: analytics.filter(a => a.percentage > 20 && a.percentage <= 40).length },
      { range: '41-60%', count: analytics.filter(a => a.percentage > 40 && a.percentage <= 60).length },
      { range: '61-80%', count: analytics.filter(a => a.percentage > 60 && a.percentage <= 80).length },
      { range: '81-100%', count: analytics.filter(a => a.percentage > 80).length }
    ];
    
    res.status(200).json({
      quiz: {
        title: quiz.title,
        description: quiz.description,
        totalQuestions: quiz.questions.length,
        totalPoints: quiz.questions.reduce((sum, q) => sum + q.points, 0),
        duration: quiz.duration
      },
      summary: {
        ...summary,
        averageScore: Math.round(summary.averageScore * 100) / 100,
        averageTimeSpent: Math.round(summary.averageTimeSpent)
      },
      questionAnalytics,
      studentPerformance,
      timeDistribution,
      scoreDistribution
    });
    
  } catch (error) {
    console.error('Error fetching quiz analytics:', error);
    res.status(500).json({ message: 'Failed to fetch quiz analytics' });
  }
};

/**
 * Get analytics for a specific group
 * @route GET /api/analytics/group/:groupId
 * @access Private - Creator, Admin
 */
export const getGroupAnalytics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { groupId } = req.params;
    const creatorId = req.user.id;
    
    // Verify group ownership
    const group = await Group.findOne({ _id: groupId, creatorId })
      .populate('students', 'email firstName lastName')
      .populate('exams', 'title');
    
    if (!group) {
      res.status(404).json({ message: 'Group not found or access denied' });
      return;
    }
    
    // Get analytics for all group exams
    const analytics = await Analytics.find({ groupId })
      .populate('quizId', 'title')
      .populate('studentId', 'email firstName lastName')
      .sort({ completedAt: -1 });
    
    // Calculate group statistics
    const totalStudents = group.students.length;
    const activeStudents = new Set(analytics.map(a => a.studentId._id.toString())).size;
    const totalAttempts = analytics.length;
    const averageScore = analytics.length > 0
      ? analytics.reduce((sum, a) => sum + a.percentage, 0) / analytics.length
      : 0;
    
    // Student engagement
    const studentEngagement = group.students.map(student => {
      const studentAnalytics = analytics.filter(a => a.studentId._id.toString() === student._id.toString());
      const averageStudentScore = studentAnalytics.length > 0
        ? studentAnalytics.reduce((sum, a) => sum + a.percentage, 0) / studentAnalytics.length
        : 0;
      
      return {
        studentId: student._id,
        studentName: `${student.firstName || ''} ${student.lastName || ''}`.trim() || student.email,
        studentEmail: student.email,
        attemptsCount: studentAnalytics.length,
        averageScore: Math.round(averageStudentScore * 100) / 100,
        lastActivity: studentAnalytics.length > 0 ? studentAnalytics[0].completedAt : null
      };
    });
    
    // Quiz performance within group
    const quizPerformance = new Map();
    analytics.forEach(a => {
      const quizId = a.quizId._id.toString();
      if (!quizPerformance.has(quizId)) {
        quizPerformance.set(quizId, {
          quizId,
          title: a.quizId.title,
          attempts: 0,
          totalScore: 0,
          averageScore: 0,
          participationRate: 0
        });
      }
      const quiz = quizPerformance.get(quizId);
      quiz.attempts++;
      quiz.totalScore += a.percentage;
      quiz.averageScore = quiz.totalScore / quiz.attempts;
      quiz.participationRate = (new Set(analytics.filter(an => an.quizId._id.toString() === quizId).map(an => an.studentId._id.toString())).size / totalStudents) * 100;
    });
    
    const quizPerformanceArray = Array.from(quizPerformance.values());
    
    res.status(200).json({
      group: {
        name: group.name,
        description: group.description,
        enrollmentCode: group.enrollmentCode,
        totalStudents,
        totalExams: group.exams.length
      },
      summary: {
        totalStudents,
        activeStudents,
        totalAttempts,
        averageScore: Math.round(averageScore * 100) / 100,
        engagementRate: totalStudents > 0 ? (activeStudents / totalStudents) * 100 : 0
      },
      studentEngagement: studentEngagement.sort((a, b) => b.averageScore - a.averageScore),
      quizPerformance: quizPerformanceArray.sort((a, b) => b.averageScore - a.averageScore),
      recentActivity: analytics.slice(0, 20).map(a => ({
        studentName: `${a.studentId.firstName || ''} ${a.studentId.lastName || ''}`.trim() || a.studentId.email,
        quizTitle: a.quizId.title,
        score: a.percentage,
        completedAt: a.completedAt
      }))
    });
    
  } catch (error) {
    console.error('Error fetching group analytics:', error);
    res.status(500).json({ message: 'Failed to fetch group analytics' });
  }
};

/**
 * Export analytics data
 * @route GET /api/analytics/export/:type/:id
 * @access Private - Creator, Admin
 */
export const exportAnalytics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { type, id } = req.params; // type: 'quiz' or 'group'
    const { format = 'csv' } = req.query; // format: 'csv' or 'json'
    const creatorId = req.user.id;
    
    let analytics: any[] = [];
    let filename = '';
    
    if (type === 'quiz') {
      // Verify quiz ownership
      const quiz = await Quiz.findOne({ _id: id, creatorId });
      if (!quiz) {
        res.status(404).json({ message: 'Quiz not found or access denied' });
        return;
      }
      
      analytics = await Analytics.find({ quizId: id })
        .populate('studentId', 'email firstName lastName')
        .populate('groupId', 'name')
        .lean();
      
      filename = `quiz-${quiz.title.replace(/[^a-zA-Z0-9]/g, '-')}-analytics`;
      
    } else if (type === 'group') {
      // Verify group ownership
      const group = await Group.findOne({ _id: id, creatorId });
      if (!group) {
        res.status(404).json({ message: 'Group not found or access denied' });
        return;
      }
      
      analytics = await Analytics.find({ groupId: id })
        .populate('quizId', 'title')
        .populate('studentId', 'email firstName lastName')
        .lean();
      
      filename = `group-${group.name.replace(/[^a-zA-Z0-9]/g, '-')}-analytics`;
      
    } else {
      res.status(400).json({ message: 'Invalid export type. Use "quiz" or "group".' });
      return;
    }
    
    if (format === 'csv') {
      // Generate CSV
      const csvHeaders = [
        'Student Email',
        'Student Name',
        'Quiz Title',
        'Score',
        'Percentage',
        'Time Spent (seconds)',
        'Completed At',
        'Questions Revisited',
        'Average Time Per Question',
        'Questions Skipped'
      ];
      
      const csvRows = analytics.map(a => [
        a.studentId.email,
        `${a.studentId.firstName || ''} ${a.studentId.lastName || ''}`.trim() || 'N/A',
        type === 'quiz' ? (a.groupId?.name || 'No Group') : a.quizId.title,
        a.score,
        a.percentage,
        a.timeSpent,
        a.completedAt.toISOString(),
        a.behaviorMetrics.questionsRevisited,
        a.behaviorMetrics.averageTimePerQuestion,
        a.behaviorMetrics.questionsSkipped
      ]);
      
      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
      res.send(csvContent);
      
    } else {
      // Return JSON
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`);
      res.json(analytics);
    }
    
  } catch (error) {
    console.error('Error exporting analytics:', error);
    res.status(500).json({ message: 'Failed to export analytics' });
  }
}; 