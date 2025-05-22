import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Chip, Tooltip } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

interface SessionInfoProps {
  showDetailedInfo?: boolean;
}

const SessionInfo: React.FC<SessionInfoProps> = ({ showDetailedInfo = false }) => {
  const { getTokenExpiryTime, getRemainingTokenTime } = useAuth();
  
  const expiryTime = getTokenExpiryTime();
  const remainingTime = getRemainingTokenTime();
  
  if (!expiryTime || !remainingTime) return null;
  
  const minutesRemaining = Math.floor(remainingTime / 60000);
  const hoursRemaining = Math.floor(minutesRemaining / 60);
  const minutesRemainingAfterHours = minutesRemaining % 60;
  
  // Format time as HH:MM:SS
  const formattedTime = expiryTime.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit'
  });
  
  // Format date as Month DD, YYYY
  const formattedDate = expiryTime.toLocaleDateString([], { 
    month: 'short', 
    day: 'numeric'
  });
  
  // Determine color based on remaining time
  let chipColor: 'success' | 'warning' | 'error' = 'success';
  if (minutesRemaining < 10) {
    chipColor = 'error';
  } else if (minutesRemaining < 30) {
    chipColor = 'warning';
  }
  
  const tooltipText = showDetailedInfo
    ? `Session expires on ${formattedDate} at ${formattedTime}`
    : `${hoursRemaining > 0 ? `${hoursRemaining}h ` : ''}${minutesRemainingAfterHours}m remaining`;
  
  const displayText = showDetailedInfo
    ? `Expires: ${formattedTime}`
    : `${hoursRemaining > 0 ? `${hoursRemaining}h ` : ''}${minutesRemainingAfterHours}m`;
  
  return (
    <Tooltip title={tooltipText}>
      <Chip
        icon={<AccessTimeIcon />}
        label={displayText}
        size="small"
        color={chipColor}
        variant="outlined"
        sx={{ fontSize: '0.75rem' }}
      />
    </Tooltip>
  );
};

export default SessionInfo; 