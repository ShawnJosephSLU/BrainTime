import React from 'react';
import type { IQuestion } from './types';
import TailwindQuestionOptions from './TailwindQuestionOptions';
import TailwindMediaUploader from './TailwindMediaUploader';
import TailwindMediaPreviews from './TailwindMediaPreviews';

interface QuestionFormProps {
  question: IQuestion;
  index: number;
  onQuestionChange: (index: number, field: string, value: any) => void;
  onOptionChange: (questionIndex: number, optionIndex: number, value: string) => void;
  onCorrectAnswerChange: (questionIndex: number, value: string | string[]) => void;
  onAddOption: (questionIndex: number) => void;
  onRemoveOption: (questionIndex: number, optionIndex: number) => void;
  onRemoveQuestion: (index: number) => void;
  onMediaUploaded: (questionIndex: number, mediaType: string, url: string) => void;
  canRemove: boolean;
}

const QuestionForm: React.FC<QuestionFormProps> = ({
  question,
  index,
  onQuestionChange,
  onOptionChange,
  onCorrectAnswerChange,
  onAddOption,
  onRemoveOption,
  onRemoveQuestion,
  onMediaUploaded,
  canRemove
}) => {
  const handleQuestionTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onQuestionChange(index, 'text', e.target.value);
  };

  const handleQuestionTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onQuestionChange(index, 'type', e.target.value);
  };

  const handlePointsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onQuestionChange(index, 'points', parseInt(e.target.value) || 1);
  };

  const handleOptionChangeLocal = (optionIndex: number, value: string) => {
    onOptionChange(index, optionIndex, value);
  };

  const handleCorrectAnswerChangeLocal = (value: string | string[]) => {
    onCorrectAnswerChange(index, value);
  };

  const handleAddOptionLocal = () => {
    onAddOption(index);
  };

  const handleRemoveOptionLocal = (optionIndex: number) => {
    onRemoveOption(index, optionIndex);
  };

  const handleMediaUploadedLocal = (questionIndex: number, mediaType: string, url: string) => {
    onMediaUploaded(questionIndex, mediaType, url);
  };

  return (
    <div className="bg-gray-700 rounded-lg p-4 mb-4">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-medium">Question {index + 1}</h4>
        <button
          type="button"
          onClick={() => onRemoveQuestion(index)}
          disabled={!canRemove}
          className={`p-1 rounded-full ${!canRemove ? 'text-gray-500 cursor-not-allowed' : 'text-red-400 hover:bg-red-900/20'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="md:col-span-2">
          <label className="block text-gray-300 mb-2">Question Text</label>
          <textarea
            required
            className="w-full bg-gray-600 border border-gray-500 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Enter question text"
            value={question.text}
            onChange={handleQuestionTextChange}
            rows={2}
          />
        </div>
        
        <div>
          <label className="block text-gray-300 mb-2">Question Type</label>
          <select
            className="w-full bg-gray-600 border border-gray-500 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            value={question.type}
            onChange={handleQuestionTypeChange}
          >
            <option value="MCQ">Multiple Choice</option>
            <option value="shortAnswer">Short Answer</option>
            <option value="longAnswer">Long Answer</option>
            <option value="trueFalse">True/False</option>
          </select>
        </div>
        
        <div>
          <label className="block text-gray-300 mb-2">Points</label>
          <input
            type="number"
            className="w-full bg-gray-600 border border-gray-500 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            min={1}
            value={question.points}
            onChange={handlePointsChange}
          />
        </div>
      </div>
      
      <TailwindMediaUploader 
        questionIndex={index} 
        onMediaUploaded={handleMediaUploadedLocal} 
      />
      
      <TailwindMediaPreviews question={question} />
      
      <TailwindQuestionOptions
        question={question}
        onOptionChange={handleOptionChangeLocal}
        onCorrectAnswerChange={handleCorrectAnswerChangeLocal}
        onAddOption={handleAddOptionLocal}
        onRemoveOption={handleRemoveOptionLocal}
      />
    </div>
  );
};

export default QuestionForm;
