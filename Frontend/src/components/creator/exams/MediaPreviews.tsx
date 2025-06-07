import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia
} from '@mui/material';
import type { IQuestion } from './types';

interface MediaPreviewsProps {
  question: IQuestion;
}

const MediaPreviews: React.FC<MediaPreviewsProps> = ({ question }) => {
  const hasMedia = question.imageUrl || question.audioUrl || question.videoUrl || question.gifUrl;
  
  if (!hasMedia) return null;
  
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
      {question.imageUrl && (
        <Card sx={{ maxWidth: 120, borderRadius: '8px' }}>
          <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Image
            </Typography>
            <CardMedia
              component="img"
              image={question.imageUrl}
              alt="Question"
              sx={{ 
                maxWidth: 100, 
                maxHeight: 100, 
                borderRadius: '4px',
                objectFit: 'cover'
              }}
            />
          </CardContent>
        </Card>
      )}
      
      {question.audioUrl && (
        <Card sx={{ minWidth: 200, borderRadius: '8px' }}>
          <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Audio
            </Typography>
            <audio controls style={{ width: '100%', height: '40px' }}>
              <source src={question.audioUrl} />
              Your browser does not support the audio element.
            </audio>
          </CardContent>
        </Card>
      )}
      
      {question.videoUrl && (
        <Card sx={{ maxWidth: 180, borderRadius: '8px' }}>
          <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Video
            </Typography>
            <video 
              controls 
              style={{ 
                width: '100%', 
                maxWidth: '150px',
                borderRadius: '4px'
              }}
            >
              <source src={question.videoUrl} />
              Your browser does not support the video element.
            </video>
          </CardContent>
        </Card>
      )}
      
      {question.gifUrl && (
        <Card sx={{ maxWidth: 120, borderRadius: '8px' }}>
          <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              GIF
            </Typography>
            <CardMedia
              component="img"
              image={question.gifUrl}
              alt="Question GIF"
              sx={{ 
                maxWidth: 100, 
                maxHeight: 100, 
                borderRadius: '4px',
                objectFit: 'cover'
              }}
            />
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default MediaPreviews; 