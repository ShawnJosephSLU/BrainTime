import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_URL } from '../../config/api';
import { useNavigate, useParams } from 'react-router-dom';
import { formatISO } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress,
  Chip,
  Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PreviewIcon from '@mui/icons-material/Preview';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import ExamBasicDetailsForm from './exams/ExamBasicDetailsForm';
import QuestionForm from './exams/QuestionForm';
import AssessmentPreview from './exams/AssessmentPreview';
import { emptyQuestion } from './exams/types';
import type { IExamData, IQuestion } from './exams/types';

const steps = ['Basic Details', 'Questions', 'Review & Publish'];

interface AutosaveIndicatorProps {
  isAutosaving: boolean;
  lastSaved: Date | null;
  isDirty: boolean;
}

const AutosaveIndicator: React.FC<AutosaveIndicatorProps> = ({ isAutosaving, lastSaved, isDirty }) => {
  if (isAutosaving) {
    return (
      <Chip
        size="small"
        color="warning"
        label="Saving..."
        icon={<CircularProgress size={12} color="inherit" />}
      />
    );
  }
  
  if (lastSaved) {
    return (
      <Chip
        size="small"
        color="success"
        label={`Saved ${lastSaved.toLocaleTimeString()}`}
      />
    );
  }
  
  if (isDirty) {
    return (
      <Chip
        size="small"
        color="warning"
        label="Unsaved changes"
      />
    );
  }
  
  return (
    <Chip
      size="small"
      color="default"
      label="Ready"
    />
  );
};

const ExamCreator: React.FC = () => {
  const navigate = useNavigate();
  const { user, setAuthHeaders, refreshAuth } = useAuth();
  const { examId } = useParams<{ examId: string }>();
  const isEditMode = Boolean(examId);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingExam, setIsLoadingExam] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [isAutosaving, setIsAutosaving] = useState<boolean>(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isDirty, setIsDirty] = useState<boolean>(false);
  
  const [examData, setExamData] = useState<IExamData>({
    title: '',
    description: '',
    questions: [{ ...emptyQuestion }],
    startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Default to tomorrow
    endTime: new Date(Date.now() + 25 * 60 * 60 * 1000), // Default to day after tomorrow
    duration: 60, // 1 hour in minutes
    allowInternet: false,
    password: '',
    autoSubmit: true,
    shuffleQuestions: false,
    showResults: false,
    isPublic: false, // Default to private for security
    selectedGroups: [],
  });

  const handleExamDataChange = (updatedData: Partial<IExamData>) => {
    setExamData({ ...examData, ...updatedData });
    setIsDirty(true);
  };

  // Load existing exam data for editing
  const loadExamData = useCallback(async () => {
    if (!examId) return;

    try {
      setIsLoadingExam(true);
      setError(null);
      
      // Ensure auth headers are set
      if (!setAuthHeaders()) {
        if (!refreshAuth()) {
          setError('Authentication failed. Please log in again.');
          setIsLoadingExam(false);
          return;
        }
      }
      
      const response = await axios.get(`${API_URL}/api/quizzes/${examId}`);
      
      const exam = response.data;
      
      // Transform the exam data to match IExamData interface
      const transformedExamData: IExamData = {
        title: exam.title || '',
        description: exam.description || '',
        questions: exam.questions && exam.questions.length > 0 ? exam.questions : [{ ...emptyQuestion }],
        startTime: exam.startTime ? new Date(exam.startTime) : new Date(Date.now() + 24 * 60 * 60 * 1000),
        endTime: exam.endTime ? new Date(exam.endTime) : new Date(Date.now() + 25 * 60 * 60 * 1000),
        duration: exam.duration || 60,
        allowInternet: exam.allowInternet || false,
        password: exam.password || '',
        autoSubmit: exam.autoSubmit !== undefined ? exam.autoSubmit : true,
        shuffleQuestions: exam.shuffleQuestions || false,
        showResults: exam.showResults || false,
        isPublic: exam.isPublic || false,
        selectedGroups: exam.selectedGroups || [],
      };
      
      setExamData(transformedExamData);
      setIsDirty(false); // Reset dirty state since we're loading existing data
      
    } catch (error: any) {
      console.error('Error loading exam:', error);
      setError(error.response?.data?.message || 'Failed to load exam data');
    } finally {
      setIsLoadingExam(false);
    }
  }, [examId, setAuthHeaders, refreshAuth]);

  // Load exam data when in edit mode and check auth
  useEffect(() => {
    // Always refresh auth and set headers on component mount
    console.log('ExamCreator: Checking authentication...');
    const authRefreshed = refreshAuth();
    const headersSet = setAuthHeaders();
    
    console.log('ExamCreator: Auth refreshed:', authRefreshed);
    console.log('ExamCreator: Headers set:', headersSet);
    console.log('ExamCreator: User:', user);
    console.log('ExamCreator: Is edit mode:', isEditMode);
    
    if (isEditMode) {
      loadExamData();
    }
  }, [isEditMode, loadExamData, refreshAuth, setAuthHeaders, user]);

  // Autosave functionality (only for create mode)
  const autosave = useCallback(async () => {
    if (!isDirty || !examData.title || isEditMode) return;

    try {
      setIsAutosaving(true);
      const autosaveKey = `braintime_exam_autosave_${user?.id || 'anonymous'}`;
      const autosaveData = {
        ...examData,
        startTime: examData.startTime.toISOString(),
        endTime: examData.endTime.toISOString(),
        selectedGroups: examData.selectedGroups,
        lastSaved: new Date().toISOString()
      };
      
      localStorage.setItem(autosaveKey, JSON.stringify(autosaveData));
      setLastSaved(new Date());
      setIsDirty(false);
    } catch (error) {
      console.error('Autosave failed:', error);
    } finally {
      setIsAutosaving(false);
    }
  }, [examData, isDirty, user?.id, isEditMode]);

  // Load from autosave on component mount (only for create mode)
  useEffect(() => {
    if (isEditMode) return; // Skip autosave loading in edit mode

    const autosaveKey = `braintime_exam_autosave_${user?.id || 'anonymous'}`;
    const saved = localStorage.getItem(autosaveKey);
    
    if (saved) {
      try {
        const parsedData = JSON.parse(saved);
        if (parsedData.title) {
          const shouldRestore = window.confirm(
            `Found an unsaved exam "${parsedData.title}" from ${new Date(parsedData.lastSaved).toLocaleString()}. Would you like to restore it?`
          );
          
          if (shouldRestore) {
            setExamData({
              ...parsedData,
              startTime: new Date(parsedData.startTime),
              endTime: new Date(parsedData.endTime),
              selectedGroups: parsedData.selectedGroups || []
            });
            setLastSaved(new Date(parsedData.lastSaved));
          }
        }
      } catch (error) {
        console.error('Failed to load autosave:', error);
      }
    }
  }, [user?.id, isEditMode]);

  // Autosave every 30 seconds
  useEffect(() => {
    const interval = setInterval(autosave, 30000);
    return () => clearInterval(interval);
  }, [autosave]);

  // Clear autosave on successful submission
  const clearAutosave = () => {
    const autosaveKey = `braintime_exam_autosave_${user?.id || 'anonymous'}`;
    localStorage.removeItem(autosaveKey);
  };

  const handleQuestionChange = (index: number, field: string, value: any) => {
    const updatedQuestions = [...examData.questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value,
    };
    setExamData({ ...examData, questions: updatedQuestions });
    setIsDirty(true);
  };

  const handleOptionChange = (questionIndex: number, optionIndex: number, value: string) => {
    const updatedQuestions = [...examData.questions];
    if (!updatedQuestions[questionIndex].options) {
      updatedQuestions[questionIndex].options = [];
    }
    updatedQuestions[questionIndex].options![optionIndex] = value;
    setExamData({ ...examData, questions: updatedQuestions });
  };

  const handleCorrectAnswerChange = (questionIndex: number, value: string | string[]) => {
    const updatedQuestions = [...examData.questions];
    updatedQuestions[questionIndex].correctAnswer = value;
    setExamData({ ...examData, questions: updatedQuestions });
  };

  const addQuestion = () => {
    setExamData({
      ...examData,
      questions: [...examData.questions, { ...emptyQuestion }],
    });
  };

  const removeQuestion = (index: number) => {
    if (examData.questions.length > 1) {
      const updatedQuestions = [...examData.questions];
      updatedQuestions.splice(index, 1);
      setExamData({ ...examData, questions: updatedQuestions });
    }
  };

  const addOption = (questionIndex: number) => {
    const updatedQuestions = [...examData.questions];
    if (!updatedQuestions[questionIndex].options) {
      updatedQuestions[questionIndex].options = [''];
    } else {
      updatedQuestions[questionIndex].options!.push('');
    }
    setExamData({ ...examData, questions: updatedQuestions });
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const updatedQuestions = [...examData.questions];
    if (updatedQuestions[questionIndex].options!.length > 2) {
      updatedQuestions[questionIndex].options!.splice(optionIndex, 1);
      
      // If the correct answer was this option, reset it
      if (updatedQuestions[questionIndex].correctAnswer === updatedQuestions[questionIndex].options![optionIndex]) {
        updatedQuestions[questionIndex].correctAnswer = '';
      }
      
      setExamData({ ...examData, questions: updatedQuestions });
    }
  };

  const handleMediaUploaded = (questionIndex: number, mediaType: string, url: string) => {
    const updatedQuestions = [...examData.questions];
    const mediaUrlField = `${mediaType}Url` as keyof IQuestion;
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      [mediaUrlField]: url,
    };

    setExamData({ ...examData, questions: updatedQuestions });
    setSuccess(`${mediaType} uploaded successfully`);
  };

  const validateBasicDetails = (): boolean => {
    if (!examData.title || !examData.description || !examData.password) {
      setError('Please fill in all required fields');
      return false;
    }
    if (examData.startTime >= examData.endTime) {
      setError('End time must be after start time');
      return false;
    }
    if (examData.duration <= 0) {
      setError('Duration must be greater than 0');
      return false;
    }
    return true;
  };

  const validateQuestions = (): boolean => {
    if (examData.questions.length === 0) {
      setError('Please add at least one question');
      return false;
    }

    for (let i = 0; i < examData.questions.length; i++) {
      const q = examData.questions[i];
      if (!q.text) {
        setError(`Question ${i + 1} is missing text`);
        return false;
      }

      if (q.type === 'MCQ' && (!q.options || q.options.length < 2)) {
        setError(`Question ${i + 1} must have at least two options`);
        return false;
      }

      if (!q.correctAnswer || (Array.isArray(q.correctAnswer) && q.correctAnswer.length === 0)) {
        setError(`Question ${i + 1} is missing a correct answer`);
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    setError(null);
    
    if (activeStep === 0 && !validateBasicDetails()) {
      return;
    }
    
    if (activeStep === 1 && !validateQuestions()) {
      return;
    }
    
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (!validateBasicDetails() || !validateQuestions()) {
        setIsLoading(false);
        return;
      }

      const examPayload = {
        ...examData,
        startTime: formatISO(examData.startTime),
        endTime: formatISO(examData.endTime),
        // Don't send selectedGroups to the quiz creation/update endpoint
        selectedGroups: undefined,
      };

      // Ensure auth headers are set
      if (!setAuthHeaders()) {
        if (!refreshAuth()) {
          setError('Authentication failed. Please log in again.');
          setIsLoading(false);
          return;
        }
      }

      let quizId: string;

      if (isEditMode && examId) {
        // Update existing exam
        await axios.put(`${API_URL}/api/quizzes/${examId}`, examPayload);
        quizId = examId;
        setSuccess('Exam updated successfully!');
      } else {
        // Create new exam
        const createResponse = await axios.post(`${API_URL}/api/quizzes/create`, examPayload);
        quizId = createResponse.data.quizId;
        setSuccess('Exam created successfully!');
      }

      // Step 2: Handle group assignments (both create and update modes)
      if (examData.selectedGroups.length > 0) {
        const assignmentPromises = examData.selectedGroups.map(groupId =>
          axios.post(`${API_URL}/api/groups/${groupId}/assign-exam/${quizId}`, {})
        );

        try {
          await Promise.all(assignmentPromises);
          const action = isEditMode ? 'updated' : 'created';
          setSuccess(`Exam ${action} and assigned to ${examData.selectedGroups.length} group(s) successfully!`);
        } catch (assignError: any) {
          console.error('Error assigning to groups:', assignError);
          const action = isEditMode ? 'updated' : 'created';
          setSuccess(`Exam ${action} successfully, but some group assignments failed. You can assign groups later.`);
        }
      }

      clearAutosave(); // Clear autosave on successful submission
      
      // Navigate to exam detail page or exam list
      setTimeout(() => {
        if (isEditMode) {
          navigate(`/creator/exams/${quizId}`);
        } else {
          navigate('/creator/exams');
        }
      }, 2000);
    } catch (err: any) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} exam:`, err);
      setError(err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} exam`);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <ExamBasicDetailsForm 
            examData={examData} 
            onChange={handleExamDataChange} 
          />
        );
      case 1:
        return (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">Questions</Typography>
              <Button
                startIcon={<AddIcon />}
                variant="contained"
                onClick={addQuestion}
                sx={{ borderRadius: '8px' }}
              >
                Add Question
              </Button>
            </Box>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {examData.questions.map((question, qIndex) => (
                <QuestionForm
                  key={qIndex}
                  question={question}
                  index={qIndex}
                  onQuestionChange={handleQuestionChange}
                  onOptionChange={handleOptionChange}
                  onCorrectAnswerChange={handleCorrectAnswerChange}
                  onAddOption={addOption}
                  onRemoveOption={removeOption}
                  onRemoveQuestion={removeQuestion}
                  onMediaUploaded={handleMediaUploaded}
                  canRemove={examData.questions.length > 1}
                />
              ))}
            </Box>
          </Box>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review & Publish Assessment
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Review your assessment details before publishing. Once published, students will be able to access it according to your schedule.
            </Typography>
            
            <Paper sx={{ p: 3, mb: 3, borderRadius: '10px', border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Assessment Summary
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">Title</Typography>
                  <Typography variant="body1">{examData.title}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Visibility</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body1">
                      {examData.isPublic ? 'Public' : 'Private'}
                    </Typography>
                    <Chip 
                      label={examData.isPublic ? 'Public' : 'Private'} 
                      color={examData.isPublic ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Questions</Typography>
                  <Typography variant="body1">{examData.questions.length}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Duration</Typography>
                  <Typography variant="body1">{examData.duration} minutes</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Start Time</Typography>
                  <Typography variant="body1">{examData.startTime.toLocaleString()}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">End Time</Typography>
                  <Typography variant="body1">{examData.endTime.toLocaleString()}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Assigned Groups</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                    {examData.selectedGroups.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        No groups selected
                      </Typography>
                    ) : (
                      examData.selectedGroups.map((groupId, index) => (
                        <Chip
                          key={groupId}
                          label={`Group ${index + 1}`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      ))
                    )}
                  </Box>
                </Box>
              </Box>
            </Paper>

            <Button
              variant="outlined"
              startIcon={<PreviewIcon />}
              onClick={() => setShowPreview(true)}
              sx={{ borderRadius: '8px' }}
              fullWidth
            >
              Preview Assessment
            </Button>
          </Box>
        );
      default:
        return null;
    }
  };

  // Show loading spinner while loading exam data in edit mode
  if (isEditMode && isLoadingExam) {
    return (
      <Box sx={{ height: '100%', overflow: 'auto', px: 3, py: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={40} sx={{ mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              Loading exam data...
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', overflow: 'auto', px: 3, py: 3 }}>
      <Box sx={{ maxWidth: '1200px', mx: 'auto' }}>
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/creator/exams')}
                sx={{ minWidth: 'auto' }}
              >
                Back
              </Button>
              <Typography variant="h4" component="h1" fontWeight="bold">
                {isEditMode ? 'Edit Assessment' : 'Create New Assessment'}
              </Typography>
            </Box>
            
            <AutosaveIndicator
              isAutosaving={isAutosaving}
              lastSaved={lastSaved}
              isDirty={isDirty}
            />
          </Box>
          
          <Typography variant="body2" color="text.secondary">
            {isEditMode 
              ? 'Edit your assessment with timed options, multiple question types, and advanced settings.'
              : 'Create comprehensive assessments with timed options, multiple question types, and advanced settings.'
            }
          </Typography>
        </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '8px' }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: '8px' }}>
          {success}
        </Alert>
      )}

      <Paper sx={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ p: { xs: 2, sm: 3 }, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
          {renderStepContent()}
        </Box>

        <Divider />

        <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            onClick={handleBack}
            disabled={activeStep === 0}
            sx={{ borderRadius: '8px' }}
          >
            Back
          </Button>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={isLoading || isLoadingExam}
                startIcon={isLoading ? <CircularProgress size={16} /> : <SaveIcon />}
                sx={{ borderRadius: '8px', minWidth: '140px' }}
              >
                {isLoading 
                  ? (isEditMode ? 'Updating...' : 'Creating...') 
                  : (isEditMode ? 'Update Assessment' : 'Publish Assessment')
                }
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                sx={{ borderRadius: '8px' }}
              >
                Next
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

        {/* Assessment Preview Modal */}
        {showPreview && (
          <AssessmentPreview
            examData={examData}
            onClose={() => setShowPreview(false)}
            onEdit={() => setShowPreview(false)}
          />
        )}
      </Box>
    </Box>
  );
};

export default ExamCreator;
