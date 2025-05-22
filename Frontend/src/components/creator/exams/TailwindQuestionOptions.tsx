import React from 'react';
import type { IQuestion } from './types';

interface QuestionOptionsProps {
  question: IQuestion;
  onOptionChange: (optionIndex: number, value: string) => void;
  onCorrectAnswerChange: (value: string | string[]) => void;
  onAddOption: () => void;
  onRemoveOption: (optionIndex: number) => void;
}

const TailwindQuestionOptions: React.FC<QuestionOptionsProps> = ({
  question,
  onOptionChange,
  onCorrectAnswerChange,
  onAddOption,
  onRemoveOption
}) => {
  if (question.type === 'MCQ') {
    return (
      <div>
        <h5 className="text-sm font-medium text-gray-300 mb-2">Options</h5>
        
        {question.options?.map((option, oIndex) => (
          <div key={oIndex} className="flex items-center mb-2">
            <input
              type="radio"
              id={`option-${oIndex}`}
              checked={question.correctAnswer === option}
              onChange={() => onCorrectAnswerChange(option)}
              disabled={!option.trim()}
              className="w-4 h-4 text-primary-600 bg-gray-700 border-gray-600 focus:ring-primary-500"
            />
            <label htmlFor={`option-${oIndex}`} className="ml-2 text-sm text-gray-300 w-20">
              Correct
            </label>
            
            <input
              type="text"
              placeholder={`Option ${oIndex + 1}`}
              value={option}
              onChange={(e) => onOptionChange(oIndex, e.target.value)}
              className="flex-1 bg-gray-600 border border-gray-500 rounded-md px-3 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 mx-2"
            />
            
            <button
              type="button"
              onClick={() => onRemoveOption(oIndex)}
              disabled={question.options!.length <= 2}
              className={`p-1 rounded-full ${question.options!.length <= 2 ? 'text-gray-500 cursor-not-allowed' : 'text-red-400 hover:bg-red-900/20'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
        
        <button
          type="button"
          onClick={onAddOption}
          className="mt-2 px-3 py-1 text-sm bg-gray-600 hover:bg-gray-500 rounded-md transition duration-150 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Option
        </button>
      </div>
    );
  }
  
  if (question.type === 'trueFalse') {
    return (
      <div>
        <h5 className="text-sm font-medium text-gray-300 mb-2">Correct Answer</h5>
        
        <div className="flex space-x-4">
          <div className="flex items-center">
            <input
              type="radio"
              id="true-option"
              checked={question.correctAnswer === 'true'}
              onChange={() => onCorrectAnswerChange('true')}
              className="w-4 h-4 text-primary-600 bg-gray-700 border-gray-600 focus:ring-primary-500"
            />
            <label htmlFor="true-option" className="ml-2 text-sm text-gray-300">
              True
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="radio"
              id="false-option"
              checked={question.correctAnswer === 'false'}
              onChange={() => onCorrectAnswerChange('false')}
              className="w-4 h-4 text-primary-600 bg-gray-700 border-gray-600 focus:ring-primary-500"
            />
            <label htmlFor="false-option" className="ml-2 text-sm text-gray-300">
              False
            </label>
          </div>
        </div>
      </div>
    );
  }
  
  if (question.type === 'shortAnswer' || question.type === 'longAnswer') {
    return (
      <div>
        <h5 className="text-sm font-medium text-gray-300 mb-2">Correct Answer</h5>
        
        <textarea
          className="w-full bg-gray-600 border border-gray-500 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Enter correct answer"
          rows={question.type === 'longAnswer' ? 3 : 1}
          value={question.correctAnswer as string}
          onChange={(e) => onCorrectAnswerChange(e.target.value)}
        />
      </div>
    );
  }
  
  return null;
};

export default TailwindQuestionOptions;
