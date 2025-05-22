import { useState } from 'react';

interface EnrollmentFormProps {
  onEnroll: (enrollmentCode: string) => void;
}

const EnrollmentForm: React.FC<EnrollmentFormProps> = ({ onEnroll }) => {
  const [enrollmentCode, setEnrollmentCode] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!enrollmentCode.trim()) {
      return;
    }
    
    setIsSubmitting(true);
    
    // Call the onEnroll prop with the enrollment code
    onEnroll(enrollmentCode.trim());
    
    // Reset the form
    setEnrollmentCode('');
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-3">
      <div className="flex-grow">
        <input
          type="text"
          value={enrollmentCode}
          onChange={(e) => setEnrollmentCode(e.target.value)}
          placeholder="Enter enrollment code"
          className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          disabled={isSubmitting}
        />
      </div>
      <button
        type="submit"
        className="px-4 py-2 bg-primary-600 hover:bg-primary-700 rounded-md text-white font-medium transition duration-150 disabled:bg-gray-600 disabled:cursor-not-allowed"
        disabled={!enrollmentCode.trim() || isSubmitting}
      >
        {isSubmitting ? 'Enrolling...' : 'Enroll'}
      </button>
    </form>
  );
};

export default EnrollmentForm; 