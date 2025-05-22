import React from 'react';
import type { IExamData } from './types';

interface ExamBasicDetailsFormProps {
  examData: IExamData;
  onChange: (updatedData: Partial<IExamData>) => void;
}

const ExamBasicDetailsForm: React.FC<ExamBasicDetailsFormProps> = ({ examData, onChange }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
  };

  const handleSwitchChange = (name: keyof IExamData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ [name]: e.target.checked });
  };

  const handleDateChange = (name: keyof IExamData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const date = new Date(e.target.value);
      onChange({ [name]: date });
    } catch (err) {
      console.error('Invalid date format', err);
    }
  };

  const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <div className="col-span-2">
        <label className="block text-gray-300 mb-2">Exam Title</label>
        <input
          required
          className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Enter exam title"
          name="title"
          value={examData.title}
          onChange={handleInputChange}
        />
      </div>
      
      <div className="col-span-2">
        <label className="block text-gray-300 mb-2">Description</label>
        <textarea
          required
          className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Enter exam description"
          name="description"
          rows={3}
          value={examData.description}
          onChange={handleInputChange}
        />
      </div>
      
      <div>
        <label className="block text-gray-300 mb-2">Start Time</label>
        <input
          type="datetime-local"
          className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          value={formatDateForInput(examData.startTime)}
          onChange={handleDateChange('startTime')}
        />
      </div>
      
      <div>
        <label className="block text-gray-300 mb-2">End Time</label>
        <input
          type="datetime-local"
          className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          value={formatDateForInput(examData.endTime)}
          onChange={handleDateChange('endTime')}
        />
      </div>
      
      <div>
        <label className="block text-gray-300 mb-2">Duration (minutes)</label>
        <input
          required
          type="number"
          className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Enter duration in minutes"
          name="duration"
          min={1}
          value={examData.duration}
          onChange={handleInputChange}
        />
      </div>
      
      <div>
        <label className="block text-gray-300 mb-2">Access Password</label>
        <input
          required
          type="password"
          className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="Enter access password"
          name="password"
          value={examData.password}
          onChange={handleInputChange}
        />
      </div>
      
      <div className="col-span-2">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="allowInternet"
              className="w-4 h-4 text-primary-600 bg-gray-700 border-gray-600 rounded focus:ring-primary-500"
              checked={examData.allowInternet}
              onChange={handleSwitchChange('allowInternet')}
            />
            <label htmlFor="allowInternet" className="ml-2 text-sm text-gray-300">
              Allow Internet
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="autoSubmit"
              className="w-4 h-4 text-primary-600 bg-gray-700 border-gray-600 rounded focus:ring-primary-500"
              checked={examData.autoSubmit}
              onChange={handleSwitchChange('autoSubmit')}
            />
            <label htmlFor="autoSubmit" className="ml-2 text-sm text-gray-300">
              Auto-submit
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="shuffleQuestions"
              className="w-4 h-4 text-primary-600 bg-gray-700 border-gray-600 rounded focus:ring-primary-500"
              checked={examData.shuffleQuestions}
              onChange={handleSwitchChange('shuffleQuestions')}
            />
            <label htmlFor="shuffleQuestions" className="ml-2 text-sm text-gray-300">
              Shuffle Questions
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="showResults"
              className="w-4 h-4 text-primary-600 bg-gray-700 border-gray-600 rounded focus:ring-primary-500"
              checked={examData.showResults}
              onChange={handleSwitchChange('showResults')}
            />
            <label htmlFor="showResults" className="ml-2 text-sm text-gray-300">
              Show Results After
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamBasicDetailsForm;
