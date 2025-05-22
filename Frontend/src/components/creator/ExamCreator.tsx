import React, { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../config/api';
import { useNavigate } from 'react-router-dom';
import { formatISO } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import ExamBasicDetailsForm from './exams/ExamBasicDetailsForm';
import QuestionForm from './exams/QuestionForm';
import { emptyQuestion } from './exams/types';
import type { IExamData, IQuestion } from './exams/types';

const ExamCreator: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
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
  });

  const handleExamDataChange = (updatedData: Partial<IExamData>) => {
    setExamData({ ...examData, ...updatedData });
  };

  const handleQuestionChange = (index: number, field: string, value: any) => {
    const updatedQuestions = [...examData.questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value,
    };
    setExamData({ ...examData, questions: updatedQuestions });
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validate form data
      if (!examData.title || !examData.description || !examData.password) {
        setError('Please fill in all required fields');
        setIsLoading(false);
        return;
      }

      if (examData.questions.length === 0) {
        setError('Please add at least one question');
        setIsLoading(false);
        return;
      }

      // Validate each question
      for (let i = 0; i < examData.questions.length; i++) {
        const q = examData.questions[i];
        if (!q.text) {
          setError(`Question ${i + 1} is missing text`);
          setIsLoading(false);
          return;
        }

        if (q.type === 'MCQ' && (!q.options || q.options.length < 2)) {
          setError(`Question ${i + 1} must have at least two options`);
          setIsLoading(false);
          return;
        }

        if (!q.correctAnswer || (Array.isArray(q.correctAnswer) && q.correctAnswer.length === 0)) {
          setError(`Question ${i + 1} is missing a correct answer`);
          setIsLoading(false);
          return;
        }
      }

      await axios.post(`${API_URL}/api/quizzes/create`, {
        ...examData,
        startTime: formatISO(examData.startTime),
        endTime: formatISO(examData.endTime),
      });

      setSuccess('Exam created successfully!');
      
      // Navigate to quiz list
      setTimeout(() => {
        navigate('/creator/exams');
      }, 2000);
    } catch (err: any) {
      console.error('Error creating quiz:', err);
      setError(err.response?.data?.message || 'Failed to create exam');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-primary-500">BrainTime</h1>
            <span className="ml-2 px-2 py-1 bg-secondary-900 text-secondary-300 text-xs rounded-md">Creator</span>
          </div>
          <div className="flex items-center">
            <span className="mr-4">{user?.email}</span>
            <button 
              onClick={() => navigate('/creator/dashboard')}
              className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded-md transition duration-150"
            >
              Dashboard
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Create New Examination</h2>
            <button 
              onClick={() => navigate('/creator/exams')}
              className="px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded-md transition duration-150"
            >
              Back to Exams
            </button>
          </div>
          
          {error && (
            <div className="bg-red-900/50 border border-red-800 text-red-200 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-900/50 border border-green-800 text-green-200 px-4 py-3 rounded mb-6">
              {success}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg shadow-lg p-6">
            <ExamBasicDetailsForm 
              examData={examData} 
              onChange={handleExamDataChange} 
            />
            
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Questions</h3>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="px-3 py-1 bg-primary-600 hover:bg-primary-700 rounded-md transition duration-150 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Question
                </button>
              </div>
              
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
            </div>
            
            <div className="flex justify-between mt-6">
              <button
                type="button"
                onClick={() => navigate('/creator/exams')}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition duration-150"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                className={`px-4 py-2 rounded-md transition duration-150 ${isLoading ? 'bg-gray-600 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700'}`}
                disabled={isLoading}
              >
                {isLoading ? 'Creating...' : 'Create Exam'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ExamCreator;
