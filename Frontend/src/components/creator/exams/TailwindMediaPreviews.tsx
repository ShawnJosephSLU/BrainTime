import React from 'react';
import type { IQuestion } from './types';

interface MediaPreviewsProps {
  question: IQuestion;
}

const TailwindMediaPreviews: React.FC<MediaPreviewsProps> = ({ question }) => {
  const hasMedia = question.imageUrl || question.audioUrl || question.videoUrl || question.gifUrl;
  
  if (!hasMedia) return null;
  
  return (
    <div className="flex flex-wrap gap-4">
      {question.imageUrl && (
        <div>
          <div className="text-xs text-gray-400 mb-1">Image</div>
          <img 
            src={question.imageUrl} 
            alt="Question" 
            className="max-w-[100px] max-h-[100px] rounded border border-gray-600" 
          />
        </div>
      )}
      
      {question.audioUrl && (
        <div>
          <div className="text-xs text-gray-400 mb-1">Audio</div>
          <audio controls className="h-10">
            <source src={question.audioUrl} />
            Your browser does not support the audio element.
          </audio>
        </div>
      )}
      
      {question.videoUrl && (
        <div>
          <div className="text-xs text-gray-400 mb-1">Video</div>
          <video controls className="max-w-[150px]">
            <source src={question.videoUrl} />
            Your browser does not support the video element.
          </video>
        </div>
      )}
      
      {question.gifUrl && (
        <div>
          <div className="text-xs text-gray-400 mb-1">GIF</div>
          <img 
            src={question.gifUrl} 
            alt="Question GIF" 
            className="max-w-[100px] max-h-[100px] rounded border border-gray-600" 
          />
        </div>
      )}
    </div>
  );
};

export default TailwindMediaPreviews;
