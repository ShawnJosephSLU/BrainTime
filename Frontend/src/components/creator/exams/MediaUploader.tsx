import React, { useState } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Paper
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ImageIcon from '@mui/icons-material/Image';
import AudiotrackIcon from '@mui/icons-material/Audiotrack';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import GifBoxIcon from '@mui/icons-material/GifBox';

interface MediaUploaderProps {
  questionIndex: number;
  onMediaUploaded: (questionIndex: number, mediaType: string, url: string) => void;
}

const MediaUploader: React.FC<MediaUploaderProps> = ({ questionIndex, onMediaUploaded }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingMediaType, setUploadingMediaType] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setError(null);
      setSuccess(null);
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
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error uploading media:', err);
      setError('Failed to upload media');
    } finally {
      setIsUploading(false);
      setUploadingMediaType('');
    }
  };

  return (
    <Paper 
      variant="outlined" 
      sx={{ 
        p: 2, 
        borderRadius: '8px',
        backgroundColor: 'grey.50'
      }}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
      
      <Box sx={{ mb: 2 }}>
        <Button
          component="label"
          variant="outlined"
          startIcon={<CloudUploadIcon />}
          sx={{ borderRadius: '8px' }}
        >
          Select File
          <input
            type="file"
            accept="image/*,audio/*,video/*"
            hidden
            onChange={handleFileChange}
          />
        </Button>
        
        {selectedFile && (
          <Chip 
            label={selectedFile.name} 
            sx={{ ml: 2 }}
            color="primary"
            variant="outlined"
          />
        )}
      </Box>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        <Button
          variant="contained"
          size="small"
          onClick={() => uploadMedia('image')}
          disabled={!selectedFile || isUploading}
          startIcon={
            isUploading && uploadingMediaType === 'image' ? 
            <CircularProgress size={16} color="inherit" /> : 
            <ImageIcon />
          }
          sx={{ borderRadius: '6px' }}
        >
          {isUploading && uploadingMediaType === 'image' ? 'Uploading...' : 'Upload Image'}
        </Button>
        
        <Button
          variant="contained"
          size="small"
          onClick={() => uploadMedia('audio')}
          disabled={!selectedFile || isUploading}
          startIcon={
            isUploading && uploadingMediaType === 'audio' ? 
            <CircularProgress size={16} color="inherit" /> : 
            <AudiotrackIcon />
          }
          sx={{ borderRadius: '6px' }}
        >
          {isUploading && uploadingMediaType === 'audio' ? 'Uploading...' : 'Upload Audio'}
        </Button>
        
        <Button
          variant="contained"
          size="small"
          onClick={() => uploadMedia('video')}
          disabled={!selectedFile || isUploading}
          startIcon={
            isUploading && uploadingMediaType === 'video' ? 
            <CircularProgress size={16} color="inherit" /> : 
            <VideoLibraryIcon />
          }
          sx={{ borderRadius: '6px' }}
        >
          {isUploading && uploadingMediaType === 'video' ? 'Uploading...' : 'Upload Video'}
        </Button>
        
        <Button
          variant="contained"
          size="small"
          onClick={() => uploadMedia('gif')}
          disabled={!selectedFile || isUploading}
          startIcon={
            isUploading && uploadingMediaType === 'gif' ? 
            <CircularProgress size={16} color="inherit" /> : 
            <GifBoxIcon />
          }
          sx={{ borderRadius: '6px' }}
        >
          {isUploading && uploadingMediaType === 'gif' ? 'Uploading...' : 'Upload GIF'}
        </Button>
      </Box>
    </Paper>
  );
};

export default MediaUploader; 