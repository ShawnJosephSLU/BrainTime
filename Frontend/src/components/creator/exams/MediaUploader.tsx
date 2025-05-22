import React, { useState } from 'react';
import { Box, Button, Typography, Stack, CircularProgress } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import axios from 'axios';

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
    <Box className="mb-4 p-4 border border-gray-700 rounded-lg">
      <Typography variant="subtitle1" className="text-white mb-2">
        Media Attachments
      </Typography>
      
      {error && (
        <Typography variant="body2" className="text-red-500 mb-2">
          {error}
        </Typography>
      )}
      
      {success && (
        <Typography variant="body2" className="text-green-500 mb-2">
          {success}
        </Typography>
      )}
      
      <Stack direction="row" spacing={2} className="mb-3 items-center">
        <input
          accept="image/*,audio/*,video/*"
          className="hidden"
          id={`file-upload-${questionIndex}`}
          type="file"
          onChange={handleFileChange}
        />
        <label htmlFor={`file-upload-${questionIndex}`}>
          <Button 
            variant="contained" 
            component="span"
            startIcon={<CloudUploadIcon />}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Select File
          </Button>
        </label>
        
        {selectedFile && (
          <Typography variant="body2" className="text-gray-300">
            {selectedFile.name}
          </Typography>
        )}
      </Stack>
      
      <Stack direction="row" spacing={2} className="flex-wrap">
        <Button 
          variant="outlined"
          onClick={() => uploadMedia('image')}
          disabled={!selectedFile || isUploading}
          className="border-gray-500 text-gray-300"
        >
          {isUploading && uploadingMediaType === 'image' ? (
            <><CircularProgress size={16} className="mr-2" /> Uploading...</>
          ) : 'Upload Image'}
        </Button>
        
        <Button 
          variant="outlined"
          onClick={() => uploadMedia('audio')}
          disabled={!selectedFile || isUploading}
          className="border-gray-500 text-gray-300"
        >
          {isUploading && uploadingMediaType === 'audio' ? (
            <><CircularProgress size={16} className="mr-2" /> Uploading...</>
          ) : 'Upload Audio'}
        </Button>
        
        <Button 
          variant="outlined"
          onClick={() => uploadMedia('video')}
          disabled={!selectedFile || isUploading}
          className="border-gray-500 text-gray-300"
        >
          {isUploading && uploadingMediaType === 'video' ? (
            <><CircularProgress size={16} className="mr-2" /> Uploading...</>
          ) : 'Upload Video'}
        </Button>
        
        <Button 
          variant="outlined"
          onClick={() => uploadMedia('gif')}
          disabled={!selectedFile || isUploading}
          className="border-gray-500 text-gray-300"
        >
          {isUploading && uploadingMediaType === 'gif' ? (
            <><CircularProgress size={16} className="mr-2" /> Uploading...</>
          ) : 'Upload GIF'}
        </Button>
      </Stack>
    </Box>
  );
};

export default MediaUploader; 