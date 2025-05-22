import React, { useState } from 'react';
import axios from 'axios';

interface MediaUploaderProps {
  questionIndex: number;
  onMediaUploaded: (questionIndex: number, mediaType: string, url: string) => void;
}

const TailwindMediaUploader: React.FC<MediaUploaderProps> = ({ questionIndex, onMediaUploaded }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingMediaType, setUploadingMediaType] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setError(null);
    }
  };

  const uploadMedia = async (mediaType: string) => {
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    setUploadingMediaType(mediaType);
    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('questionId', questionIndex.toString());
      formData.append('mediaType', mediaType);

      const response = await axios.post('/api/quizzes/upload-media', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      onMediaUploaded(questionIndex, mediaType, response.data.url);
      setSelectedFile(null);
      setSuccess(`${mediaType} uploaded successfully`);
    } catch (err) {
      console.error('Error uploading media:', err);
      setError('Failed to upload media');
    } finally {
      setIsUploading(false);
      setUploadingMediaType('');
    }
  };

  return (
    <div className="mb-4">
      <h5 className="text-sm font-medium text-gray-300 mb-2">Media Attachments</h5>
      
      {error && (
        <div className="text-red-400 text-sm mb-2">
          {error}
        </div>
      )}
      
      {success && (
        <div className="text-green-400 text-sm mb-2">
          {success}
        </div>
      )}
      
      <div className="flex flex-wrap gap-2 mb-3">
        <label className="inline-flex items-center px-3 py-1 bg-gray-600 hover:bg-gray-500 rounded-md transition duration-150 cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          <span>Select File</span>
          <input
            type="file"
            accept="image/*,audio/*,video/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
        
        {selectedFile && (
          <span className="inline-flex items-center px-3 py-1 bg-gray-600 rounded-md text-sm">
            {selectedFile.name}
          </span>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2 mb-3">
        <button
          type="button"
          onClick={() => uploadMedia('image')}
          disabled={!selectedFile || isUploading}
          className={`px-3 py-1 text-sm rounded-md transition duration-150 ${!selectedFile || isUploading ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-secondary-600 hover:bg-secondary-700'}`}
        >
          {isUploading && uploadingMediaType === 'image' ? 'Uploading...' : 'Upload Image'}
        </button>
        
        <button
          type="button"
          onClick={() => uploadMedia('audio')}
          disabled={!selectedFile || isUploading}
          className={`px-3 py-1 text-sm rounded-md transition duration-150 ${!selectedFile || isUploading ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-secondary-600 hover:bg-secondary-700'}`}
        >
          {isUploading && uploadingMediaType === 'audio' ? 'Uploading...' : 'Upload Audio'}
        </button>
        
        <button
          type="button"
          onClick={() => uploadMedia('video')}
          disabled={!selectedFile || isUploading}
          className={`px-3 py-1 text-sm rounded-md transition duration-150 ${!selectedFile || isUploading ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-secondary-600 hover:bg-secondary-700'}`}
        >
          {isUploading && uploadingMediaType === 'video' ? 'Uploading...' : 'Upload Video'}
        </button>
        
        <button
          type="button"
          onClick={() => uploadMedia('gif')}
          disabled={!selectedFile || isUploading}
          className={`px-3 py-1 text-sm rounded-md transition duration-150 ${!selectedFile || isUploading ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-secondary-600 hover:bg-secondary-700'}`}
        >
          {isUploading && uploadingMediaType === 'gif' ? 'Uploading...' : 'Upload GIF'}
        </button>
      </div>
    </div>
  );
};

export default TailwindMediaUploader;
