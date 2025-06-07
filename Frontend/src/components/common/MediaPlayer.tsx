import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  IconButton,
  Slider,
  Typography,
  Paper,
  Menu,
  MenuItem,
  Fade
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  VolumeUp,
  VolumeOff,
  Fullscreen,
  FullscreenExit,
  Settings,
  Forward10,
  Replay10,
  PictureInPicture
} from '@mui/icons-material';

interface MediaPlayerProps {
  src: string;
  type: 'video' | 'audio' | 'image' | 'gif';
  title?: string;
  onProgress?: (currentTime: number, duration: number) => void;
  onComplete?: () => void;
  autoPlay?: boolean;
  controls?: boolean;
  className?: string;
}

const MediaPlayer: React.FC<MediaPlayerProps> = ({
  src,
  type,
  title,
  onProgress,
  onComplete,
  autoPlay = false,
  controls = true,
  className
}) => {
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [settingsAnchor, setSettingsAnchor] = useState<null | HTMLElement>(null);

  // Auto-hide controls for video
  useEffect(() => {
    if (type !== 'video') return;
    
    let timeout: NodeJS.Timeout;
    const resetTimeout = () => {
      clearTimeout(timeout);
      setShowControls(true);
      timeout = setTimeout(() => {
        if (isPlaying) setShowControls(false);
      }, 3000);
    };

    const handleMouseMove = () => resetTimeout();
    const handleMouseLeave = () => {
      if (isPlaying) setShowControls(false);
    };

    if (containerRef.current) {
      containerRef.current.addEventListener('mousemove', handleMouseMove);
      containerRef.current.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      clearTimeout(timeout);
      if (containerRef.current) {
        containerRef.current.removeEventListener('mousemove', handleMouseMove);
        containerRef.current.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [isPlaying, type]);

  // Media event handlers
  useEffect(() => {
    const media = mediaRef.current;
    if (!media) return;

    const handleLoadedMetadata = () => {
      setDuration(media.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(media.currentTime);
      onProgress?.(media.currentTime, media.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      onComplete?.();
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    media.addEventListener('loadedmetadata', handleLoadedMetadata);
    media.addEventListener('timeupdate', handleTimeUpdate);
    media.addEventListener('ended', handleEnded);
    media.addEventListener('play', handlePlay);
    media.addEventListener('pause', handlePause);

    return () => {
      media.removeEventListener('loadedmetadata', handleLoadedMetadata);
      media.removeEventListener('timeupdate', handleTimeUpdate);
      media.removeEventListener('ended', handleEnded);
      media.removeEventListener('play', handlePlay);
      media.removeEventListener('pause', handlePause);
    };
  }, [onProgress, onComplete]);

  const togglePlay = () => {
    const media = mediaRef.current;
    if (!media) return;

    if (isPlaying) {
      media.pause();
    } else {
      media.play();
    }
  };

  const handleSeek = (value: number) => {
    const media = mediaRef.current;
    if (!media) return;
    
    media.currentTime = value;
    setCurrentTime(value);
  };

  const handleVolumeChange = (value: number) => {
    const media = mediaRef.current;
    if (!media) return;
    
    media.volume = value;
    setVolume(value);
    setIsMuted(value === 0);
  };

  const toggleMute = () => {
    const media = mediaRef.current;
    if (!media) return;
    
    if (isMuted) {
      media.volume = volume;
      setIsMuted(false);
    } else {
      media.volume = 0;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const skip = (seconds: number) => {
    const media = mediaRef.current;
    if (!media) return;
    
    media.currentTime = Math.max(0, Math.min(duration, media.currentTime + seconds));
  };

  const changePlaybackRate = (rate: number) => {
    const media = mediaRef.current;
    if (!media) return;
    
    media.playbackRate = rate;
    setPlaybackRate(rate);
    setSettingsAnchor(null);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const togglePictureInPicture = async () => {
    const video = mediaRef.current as HTMLVideoElement;
    if (!video || type !== 'video') return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await video.requestPictureInPicture();
      }
    } catch (error) {
      console.error('Picture-in-picture error:', error);
    }
  };

  // Render different media types
  const renderMedia = () => {
    switch (type) {
      case 'image':
      case 'gif':
        return (
          <img
            src={src}
            alt={title || 'Media content'}
            style={{
              width: '100%',
              height: 'auto',
              maxHeight: '70vh',
              objectFit: 'contain',
              borderRadius: '8px'
            }}
          />
        );
      
      case 'video':
        return (
          <video
            ref={mediaRef as React.RefObject<HTMLVideoElement>}
            src={src}
            autoPlay={autoPlay}
            style={{
              width: '100%',
              height: 'auto',
              maxHeight: '70vh',
              borderRadius: '8px'
            }}
            onDoubleClick={toggleFullscreen}
          />
        );
      
      case 'audio':
        return (
          <Box
            sx={{
              width: '100%',
              height: 200,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'grey.100',
              borderRadius: 2,
              position: 'relative'
            }}
          >
            <audio ref={mediaRef as React.RefObject<HTMLAudioElement>} src={src} autoPlay={autoPlay} />
            <Typography variant="h6" color="text.secondary">
              🎵 {title || 'Audio Content'}
            </Typography>
          </Box>
        );
      
      default:
        return null;
    }
  };

  // Don't show controls for images/gifs
  if (type === 'image' || type === 'gif') {
    return (
      <Box className={className} sx={{ textAlign: 'center' }}>
        {renderMedia()}
        {title && (
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            {title}
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <Box
      ref={containerRef}
      className={className}
      sx={{
        position: 'relative',
        bgcolor: 'black',
        borderRadius: 2,
        overflow: 'hidden'
      }}
    >
      {renderMedia()}
      
      {controls && (
        <Fade in={showControls || !isPlaying}>
          <Paper
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              bgcolor: 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              p: 1
            }}
          >
            {/* Progress Bar */}
            <Box sx={{ px: 1, mb: 1 }}>
              <Slider
                value={currentTime}
                max={duration}
                onChange={(_, value) => handleSeek(value as number)}
                sx={{
                  color: 'primary.main',
                  '& .MuiSlider-thumb': {
                    width: 12,
                    height: 12
                  }
                }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                <Typography variant="caption">
                  {formatTime(currentTime)}
                </Typography>
                <Typography variant="caption">
                  {formatTime(duration)}
                </Typography>
              </Box>
            </Box>

            {/* Controls */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton onClick={togglePlay} sx={{ color: 'white' }}>
                {isPlaying ? <Pause /> : <PlayArrow />}
              </IconButton>

              {type === 'video' && (
                <>
                  <IconButton onClick={() => skip(-10)} sx={{ color: 'white' }}>
                    <Replay10 />
                  </IconButton>
                  <IconButton onClick={() => skip(10)} sx={{ color: 'white' }}>
                    <Forward10 />
                  </IconButton>
                </>
              )}

              <IconButton onClick={toggleMute} sx={{ color: 'white' }}>
                {isMuted ? <VolumeOff /> : <VolumeUp />}
              </IconButton>

              <Box sx={{ width: 100, mx: 1 }}>
                <Slider
                  value={isMuted ? 0 : volume}
                  max={1}
                  step={0.1}
                  onChange={(_, value) => handleVolumeChange(value as number)}
                  sx={{ color: 'white' }}
                />
              </Box>

              <Box sx={{ flexGrow: 1 }} />

              <Typography variant="caption" sx={{ mx: 1 }}>
                {playbackRate}x
              </Typography>

              <IconButton
                onClick={(e) => setSettingsAnchor(e.currentTarget)}
                sx={{ color: 'white' }}
              >
                <Settings />
              </IconButton>

              {type === 'video' && (
                <>
                  <IconButton onClick={togglePictureInPicture} sx={{ color: 'white' }}>
                    <PictureInPicture />
                  </IconButton>
                  <IconButton onClick={toggleFullscreen} sx={{ color: 'white' }}>
                    {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
                  </IconButton>
                </>
              )}
            </Box>
          </Paper>
        </Fade>
      )}

      {/* Settings Menu */}
      <Menu
        anchorEl={settingsAnchor}
        open={Boolean(settingsAnchor)}
        onClose={() => setSettingsAnchor(null)}
      >
        <MenuItem onClick={() => changePlaybackRate(0.5)}>0.5x</MenuItem>
        <MenuItem onClick={() => changePlaybackRate(0.75)}>0.75x</MenuItem>
        <MenuItem onClick={() => changePlaybackRate(1)}>1x</MenuItem>
        <MenuItem onClick={() => changePlaybackRate(1.25)}>1.25x</MenuItem>
        <MenuItem onClick={() => changePlaybackRate(1.5)}>1.5x</MenuItem>
        <MenuItem onClick={() => changePlaybackRate(2)}>2x</MenuItem>
      </Menu>
    </Box>
  );
};

export default MediaPlayer; 