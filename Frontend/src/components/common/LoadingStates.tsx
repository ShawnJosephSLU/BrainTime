import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Skeleton,
  Stack,
  CircularProgress,
  Typography,
  LinearProgress
} from '@mui/material';

// Generic loading spinner
export const LoadingSpinner: React.FC<{ size?: number; message?: string }> = ({ 
  size = 40, 
  message 
}) => (
  <Box 
    display="flex" 
    flexDirection="column" 
    alignItems="center" 
    justifyContent="center" 
    minHeight="200px"
    gap={2}
  >
    <CircularProgress size={size} />
    {message && (
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    )}
  </Box>
);

// Exam list skeleton
export const ExamListSkeleton: React.FC = () => (
  <Box>
    {[...Array(3)].map((_, index) => (
      <Card key={index} sx={{ mb: 2 }}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box flexGrow={1}>
              <Skeleton variant="text" width="60%" height={32} />
              <Skeleton variant="text" width="80%" height={20} sx={{ mt: 1 }} />
              <Stack direction="row" spacing={1} mt={2}>
                <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 1 }} />
                <Skeleton variant="rectangular" width={100} height={24} sx={{ borderRadius: 1 }} />
                <Skeleton variant="rectangular" width={90} height={24} sx={{ borderRadius: 1 }} />
              </Stack>
            </Box>
            <Box>
              <Skeleton variant="rectangular" width={120} height={36} sx={{ borderRadius: 1 }} />
            </Box>
          </Box>
        </CardContent>
      </Card>
    ))}
  </Box>
);

// Dashboard skeleton
export const DashboardSkeleton: React.FC = () => (
  <Box>
    {/* Header */}
    <Box mb={4}>
      <Skeleton variant="text" width="40%" height={40} />
      <Skeleton variant="text" width="60%" height={24} sx={{ mt: 1 }} />
    </Box>

    {/* Stats Cards */}
    <Box display="flex" gap={3} mb={4} flexWrap="wrap">
      {[...Array(4)].map((_, index) => (
        <Card key={index} sx={{ minWidth: 200, flex: 1 }}>
          <CardContent>
            <Stack spacing={2}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Skeleton variant="circular" width={40} height={40} />
                <Skeleton variant="text" width={60} height={32} />
              </Box>
              <Skeleton variant="text" width="80%" height={20} />
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Box>

    {/* Content Sections */}
    <Box display="flex" gap={3} flexWrap="wrap">
      <Card sx={{ flex: 2, minWidth: 300 }}>
        <CardContent>
          <Skeleton variant="text" width="30%" height={28} sx={{ mb: 2 }} />
          {[...Array(5)].map((_, index) => (
            <Box key={index} mb={2}>
              <Skeleton variant="text" width="100%" height={20} />
              <Skeleton variant="text" width="70%" height={16} sx={{ mt: 0.5 }} />
            </Box>
          ))}
        </CardContent>
      </Card>
      <Card sx={{ flex: 1, minWidth: 250 }}>
        <CardContent>
          <Skeleton variant="text" width="40%" height={28} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" width="100%" height={200} sx={{ borderRadius: 1 }} />
        </CardContent>
      </Card>
    </Box>
  </Box>
);

// Form skeleton
export const FormSkeleton: React.FC<{ fields?: number }> = ({ fields = 5 }) => (
  <Card>
    <CardContent>
      <Skeleton variant="text" width="30%" height={32} sx={{ mb: 3 }} />
      <Stack spacing={3}>
        {[...Array(fields)].map((_, index) => (
          <Box key={index}>
            <Skeleton variant="text" width="20%" height={20} sx={{ mb: 1 }} />
            <Skeleton variant="rectangular" width="100%" height={56} sx={{ borderRadius: 1 }} />
          </Box>
        ))}
        <Box display="flex" gap={2} justifyContent="flex-end" mt={3}>
          <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 1 }} />
          <Skeleton variant="rectangular" width={120} height={36} sx={{ borderRadius: 1 }} />
        </Box>
      </Stack>
    </CardContent>
  </Card>
);

// Progress loading with message
export const ProgressLoader: React.FC<{ 
  progress: number; 
  message?: string;
  subMessage?: string;
}> = ({ progress, message, subMessage }) => (
  <Box 
    display="flex" 
    flexDirection="column" 
    alignItems="center" 
    justifyContent="center" 
    minHeight="200px"
    gap={2}
    p={3}
  >
    <CircularProgress 
      variant="determinate" 
      value={progress} 
      size={60}
      thickness={4}
    />
    <Box textAlign="center">
      <Typography variant="h6" gutterBottom>
        {Math.round(progress)}%
      </Typography>
      {message && (
        <Typography variant="body1" color="text.primary" gutterBottom>
          {message}
        </Typography>
      )}
      {subMessage && (
        <Typography variant="body2" color="text.secondary">
          {subMessage}
        </Typography>
      )}
    </Box>
    <LinearProgress 
      variant="determinate" 
      value={progress} 
      sx={{ width: '100%', maxWidth: 300 }}
    />
  </Box>
);

export default {
  LoadingSpinner,
  ExamListSkeleton,
  DashboardSkeleton,
  FormSkeleton,
  ProgressLoader
}; 