import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Stack,
  Divider,
  Avatar,
  IconButton,
  Tooltip,
  CircularProgress,
  Paper
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import axios from 'axios';


interface Question {
  _id: string;
  type: string;
  text: string;
  options?: string[];
  correctAnswer: any;
  points: number;
  explanation?: string;
  imageUrl?: string;
  audioUrl?: string;
  gifUrl?: string;
}

interface ExamResult {
  _id: string;
  examId: string;
  examTitle: string;
  studentId: string;
  answers: Record<string, any>;
  score: number;
  totalPoints: number;
  percentage: number;
  timeSpent: number;
  submittedAt: string;
  gradedAt?: string;
  feedback?: string;
  questions: Question[];
  isGraded: boolean;
  status: 'submitted' | 'graded' | 'pending';
}

const ExamResults: React.FC = () => {
  const { resultId } = useParams<{ resultId: string }>();
  const navigate = useNavigate();
  const [result, setResult] = useState<ExamResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedQuestion, setExpandedQuestion] = useState<string | false>(false);

  useEffect(() => {
    const fetchResult = async () => {
      if (!resultId) return;
      
      try {
        setIsLoading(true);
        const response = await axios.get(`/api/results/${resultId}`);
        setResult(response.data);
      } catch (error: any) {
        console.error('Error fetching result:', error);
        setError(error.response?.data?.message || 'Failed to load exam result');
      } finally {
        setIsLoading(false);
      }
    };

    fetchResult();
  }, [resultId]);

  const handleAccordionChange = (panel: string) => (
    _event: React.SyntheticEvent,
    isExpanded: boolean
  ) => {
    setExpandedQuestion(isExpanded ? panel : false);
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 90) return 'success';
    if (percentage >= 70) return 'warning';
    return 'error';
  };

  const getScoreIcon = (percentage: number) => {
    if (percentage >= 70) return <CheckCircleIcon color="success" />;
    return <CancelIcon color="error" />;
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    }
    return `${minutes}m ${remainingSeconds}s`;
  };

  const isAnswerCorrect = (questionId: string, question: Question) => {
    const userAnswer = result?.answers[questionId];
    const correctAnswer = question.correctAnswer;
    
    if (question.type === 'MCQ' || question.type === 'trueFalse') {
      return userAnswer === correctAnswer;
    }
    
    if (question.type === 'multipleSelect') {
      if (!Array.isArray(userAnswer) || !Array.isArray(correctAnswer)) return false;
      return userAnswer.length === correctAnswer.length &&
             userAnswer.every(answer => correctAnswer.includes(answer));
    }
    
    return false;
  };

  const downloadCertificate = async () => {
    try {
      const response = await axios.get(`/api/results/${resultId}/certificate`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificate-${result?.examTitle}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading certificate:', error);
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !result) {
    return (
      <Box p={3}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Result not found'}
        </Alert>
        <Button variant="outlined" onClick={() => navigate('/student/dashboard')}>
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, bgcolor: 'primary.50', borderRadius: 3 }}>
        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3} alignItems="center">
          <Box flex={1}>
            <Typography variant="h4" gutterBottom fontWeight={700}>
              {result.examTitle}
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              Submitted on {new Date(result.submittedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Typography>
            <Stack direction="row" spacing={1} mt={2}>
              <Chip
                icon={getScoreIcon(result.percentage)}
                label={result.status === 'graded' ? 'Graded' : 'Pending Review'}
                color={result.status === 'graded' ? 'success' : 'warning'}
                variant="filled"
              />
              <Chip
                icon={<ScheduleIcon />}
                label={`Time: ${formatTime(result.timeSpent)}`}
                variant="outlined"
              />
            </Stack>
          </Box>
          
          <Box textAlign="center">
            <Box position="relative" display="inline-flex" mb={2}>
              <CircularProgress
                variant="determinate"
                value={result.percentage}
                size={120}
                thickness={4}
                color={getScoreColor(result.percentage)}
              />
              <Box
                position="absolute"
                top={0}
                left={0}
                bottom={0}
                right={0}
                display="flex"
                alignItems="center"
                justifyContent="center"
                flexDirection="column"
              >
                <Typography variant="h4" fontWeight={700} color={`${getScoreColor(result.percentage)}.main`}>
                  {Math.round(result.percentage)}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {result.score}/{result.totalPoints}
                </Typography>
              </Box>
            </Box>
            
            <Stack direction="row" spacing={1} justifyContent="center">
              {result.percentage >= 70 && (
                <Tooltip title="Download Certificate">
                  <IconButton onClick={downloadCertificate} color="primary">
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title="Share Result">
                <IconButton color="primary">
                  <ShareIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Retake Exam">
                <IconButton color="primary">
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Box>
        </Box>
      </Paper>

      {/* Performance Summary */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Performance Summary
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={3}>
            <Box textAlign="center" flex={1} minWidth={150}>
              <Typography variant="h4" color="primary.main" fontWeight={700}>
                {result.questions.filter(q => isAnswerCorrect(q._id, q)).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Correct Answers
              </Typography>
            </Box>
            <Box textAlign="center" flex={1} minWidth={150}>
              <Typography variant="h4" color="error.main" fontWeight={700}>
                {result.questions.length - result.questions.filter(q => isAnswerCorrect(q._id, q)).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Incorrect Answers
              </Typography>
            </Box>
            <Box textAlign="center" flex={1} minWidth={150}>
              <Typography variant="h4" color="warning.main" fontWeight={700}>
                {formatTime(result.timeSpent)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Time Spent
              </Typography>
            </Box>
            <Box textAlign="center" flex={1} minWidth={150}>
              <Typography variant="h4" color="info.main" fontWeight={700}>
                {result.questions.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Questions
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Feedback */}
      {result.feedback && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Instructor Feedback:
          </Typography>
          {result.feedback}
        </Alert>
      )}

      {/* Question Review */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Question Review
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Review your answers and see explanations for each question.
          </Typography>
          
          {result.questions.map((question, index) => {
            const isCorrect = isAnswerCorrect(question._id, question);
            const userAnswer = result.answers[question._id];
            
            return (
              <Accordion
                key={question._id}
                expanded={expandedQuestion === question._id}
                onChange={handleAccordionChange(question._id)}
                sx={{ mb: 1 }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box display="flex" alignItems="center" width="100%">
                    <Avatar
                      sx={{
                        bgcolor: isCorrect ? 'success.main' : 'error.main',
                        width: 32,
                        height: 32,
                        mr: 2
                      }}
                    >
                      {isCorrect ? <CheckCircleIcon /> : <CancelIcon />}
                    </Avatar>
                    <Box flexGrow={1}>
                      <Typography variant="subtitle1">
                        Question {index + 1}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {question.points} point{question.points !== 1 ? 's' : ''}
                      </Typography>
                    </Box>
                    <Chip
                      label={isCorrect ? 'Correct' : 'Incorrect'}
                      color={isCorrect ? 'success' : 'error'}
                      size="small"
                    />
                  </Box>
                </AccordionSummary>
                
                <AccordionDetails>
                  <Box>
                    <Typography variant="body1" gutterBottom>
                      {question.text}
                    </Typography>
                    
                    {question.imageUrl && (
                      <Box mb={2}>
                        <img
                          src={question.imageUrl}
                          alt="Question"
                          style={{ maxWidth: '100%', height: 'auto', borderRadius: 8 }}
                        />
                      </Box>
                    )}
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={2}>
                      <Box flex={1}>
                        <Typography variant="subtitle2" gutterBottom>
                          Your Answer:
                        </Typography>
                        <Typography
                          variant="body2"
                          color={isCorrect ? 'success.main' : 'error.main'}
                          sx={{ p: 1, bgcolor: isCorrect ? 'success.50' : 'error.50', borderRadius: 1 }}
                        >
                          {Array.isArray(userAnswer) ? userAnswer.join(', ') : userAnswer || 'No answer provided'}
                        </Typography>
                      </Box>
                      
                      <Box flex={1}>
                        <Typography variant="subtitle2" gutterBottom>
                          Correct Answer:
                        </Typography>
                        <Typography
                          variant="body2"
                          color="success.main"
                          sx={{ p: 1, bgcolor: 'success.50', borderRadius: 1 }}
                        >
                          {Array.isArray(question.correctAnswer) 
                            ? question.correctAnswer.join(', ') 
                            : question.correctAnswer}
                        </Typography>
                      </Box>
                    </Box>
                    
                    {question.explanation && (
                      <Box mt={2}>
                        <Typography variant="subtitle2" gutterBottom>
                          Explanation:
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {question.explanation}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </CardContent>
      </Card>

      {/* Actions */}
      <Box mt={3} display="flex" gap={2} justifyContent="center">
        <Button
          variant="outlined"
          onClick={() => navigate('/student/dashboard')}
        >
          Back to Dashboard
        </Button>
        <Button
          variant="contained"
          onClick={() => navigate('/student/exams')}
          startIcon={<TrendingUpIcon />}
        >
          Take More Exams
        </Button>
      </Box>
    </Box>
  );
};

export default ExamResults; 