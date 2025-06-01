import React, { useState } from 'react';
import type { IExamData, IQuestion } from './types';
import MarkdownPreview from './MarkdownPreview';
import { formatDistanceToNow } from 'date-fns';

interface AssessmentPreviewProps {
  examData: IExamData;
  onClose: () => void;
  onEdit: () => void;
}

const AssessmentPreview: React.FC<AssessmentPreviewProps> = ({
  examData,
  onClose,
  onEdit
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [studentAnswers, setStudentAnswers] = useState<{ [key: number]: string | string[] }>({});

  const handleAnswerChange = (questionIndex: number, answer: string | string[]) => {
    setStudentAnswers({
      ...studentAnswers,
      [questionIndex]: answer
    });
  };

  const renderQuestion = (question: IQuestion, index: number) => {
    const isActive = index === currentQuestionIndex;
    
    if (!isActive) return null;

    return (
      <div key={index} className="bg-gray-700 rounded-lg p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2">
              Question {index + 1} of {examData.questions.length}
            </h3>
            <div className="text-sm text-gray-400 mb-4">
              Points: {question.points}
            </div>
          </div>
          <div className="text-sm text-gray-400">
            {index + 1} / {examData.questions.length}
          </div>
        </div>

        {/* Question Text */}
        <div className="mb-6">
          <MarkdownPreview content={question.text} />
        </div>

        {/* Media Display */}
        {(question.imageUrl || question.audioUrl || question.videoUrl || question.gifUrl) && (
          <div className="mb-6 space-y-3">
            {question.imageUrl && (
              <img 
                src={question.imageUrl} 
                alt="Question media"
                className="max-w-full h-auto rounded-md"
              />
            )}
            {question.audioUrl && (
              <audio controls className="w-full">
                <source src={question.audioUrl} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            )}
            {question.videoUrl && (
              <video controls className="w-full max-h-96 rounded-md">
                <source src={question.videoUrl} type="video/mp4" />
                Your browser does not support the video element.
              </video>
            )}
            {question.gifUrl && (
              <img 
                src={question.gifUrl} 
                alt="Question GIF"
                className="max-w-full h-auto rounded-md"
              />
            )}
          </div>
        )}

        {/* Answer Options */}
        <div className="space-y-3">
          {question.type === 'MCQ' && question.options && (
            <div className="space-y-2">
              {question.options.map((option, optIndex) => (
                <label 
                  key={optIndex}
                  className="flex items-center space-x-3 p-3 bg-gray-600 rounded-md cursor-pointer hover:bg-gray-500 transition-colors"
                >
                  <input
                    type="radio"
                    name={`question-${index}`}
                    value={option}
                    checked={studentAnswers[index] === option}
                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                    className="w-4 h-4 text-primary-600 bg-gray-700 border-gray-600 focus:ring-primary-500"
                  />
                  <span className="text-white">{option}</span>
                </label>
              ))}
            </div>
          )}

          {question.type === 'trueFalse' && (
            <div className="space-y-2">
              {['True', 'False'].map((option) => (
                <label 
                  key={option}
                  className="flex items-center space-x-3 p-3 bg-gray-600 rounded-md cursor-pointer hover:bg-gray-500 transition-colors"
                >
                  <input
                    type="radio"
                    name={`question-${index}`}
                    value={option}
                    checked={studentAnswers[index] === option}
                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                    className="w-4 h-4 text-primary-600 bg-gray-700 border-gray-600 focus:ring-primary-500"
                  />
                  <span className="text-white">{option}</span>
                </label>
              ))}
            </div>
          )}

          {question.type === 'shortAnswer' && (
            <input
              type="text"
              placeholder="Enter your answer..."
              value={studentAnswers[index] as string || ''}
              onChange={(e) => handleAnswerChange(index, e.target.value)}
              className="w-full bg-gray-600 border border-gray-500 rounded-md px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          )}

          {question.type === 'longAnswer' && (
            <textarea
              placeholder="Enter your detailed answer..."
              rows={5}
              value={studentAnswers[index] as string || ''}
              onChange={(e) => handleAnswerChange(index, e.target.value)}
              className="w-full bg-gray-600 border border-gray-500 rounded-md px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-600">
          <button
            onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
            disabled={currentQuestionIndex === 0}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <div className="text-sm text-gray-400">
            Question {currentQuestionIndex + 1} of {examData.questions.length}
          </div>
          
          {currentQuestionIndex < examData.questions.length - 1 ? (
            <button
              onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Next
            </button>
          ) : (
            <button
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              onClick={() => alert('This would submit the exam in the actual assessment')}
            >
              Submit Exam
            </button>
          )}
        </div>
      </div>
    );
  };

  const totalPoints = examData.questions.reduce((sum, q) => sum + q.points, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-screen overflow-hidden">
        {/* Header */}
        <div className="bg-gray-700 px-6 py-4 border-b border-gray-600">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white mb-2">{examData.title}</h2>
              <p className="text-gray-300 text-sm mb-2">{examData.description}</p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                <span>Duration: {examData.duration} minutes</span>
                <span>Questions: {examData.questions.length}</span>
                <span>Total Points: {totalPoints}</span>
                <span>Starts: {formatDistanceToNow(examData.startTime, { addSuffix: true })}</span>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={onEdit}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Edit Exam
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>

        {/* Timer */}
        <div className="bg-gray-600 px-6 py-3 border-b border-gray-500">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-300">
              <span className="font-medium">Time Remaining:</span>
              <span className="ml-2 text-green-400 font-mono">
                {Math.floor(examData.duration / 60)}:{String(examData.duration % 60).padStart(2, '0')}:00
              </span>
            </div>
            <div className="text-sm text-gray-300">
              Auto-submit: {examData.autoSubmit ? 'Enabled' : 'Disabled'}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="mb-6">
            {/* Question Navigation */}
            <div className="flex flex-wrap gap-2 mb-6">
              {examData.questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`w-10 h-10 rounded-md text-sm font-medium ${
                    index === currentQuestionIndex
                      ? 'bg-primary-600 text-white'
                      : studentAnswers[index]
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            {/* Current Question */}
            {renderQuestion(examData.questions[currentQuestionIndex], currentQuestionIndex)}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-700 px-6 py-4 border-t border-gray-600">
          <div className="flex justify-between items-center text-sm text-gray-400">
            <div>
              Questions Answered: {Object.keys(studentAnswers).length} of {examData.questions.length}
            </div>
            <div className="flex space-x-4">
              <span>Shuffle: {examData.shuffleQuestions ? 'Yes' : 'No'}</span>
              <span>Internet: {examData.allowInternet ? 'Allowed' : 'Blocked'}</span>
              <span>Results: {examData.showResults ? 'Visible' : 'Hidden'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentPreview; 