import { useState, useEffect, useCallback, useRef } from 'react';
import { TOAST_CONSTANTS } from '../utils/constants';

/**
 * Custom hook for managing toast timer logic
 */
export const useToastTimer = ({
  duration,
  persistent,
  animate,
  onDismiss,
  id,
  trackInteraction,
  type
}) => {
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);
  
  const timerRef = useRef(null);
  const progressRef = useRef(null);
  const startTimeRef = useRef(null);
  const remainingTimeRef = useRef(duration);

  /**
   * Handle dismissal with tracking
   */
  const handleDismiss = useCallback(() => {
    if (trackInteraction && window.gtag) {
      window.gtag('event', 'toast_auto_dismissed', {
        toast_type: type,
        toast_id: id || 'anonymous'
      });
    }

    if (animate) {
      // Let the component handle the animation
      if (onDismiss) {
        onDismiss(id);
      }
    } else {
      if (onDismiss) {
        onDismiss(id);
      }
    }
  }, [animate, onDismiss, id, trackInteraction, type]);

  /**
   * Pause timer
   */
  const pauseTimer = useCallback(() => {
    if (!persistent && !isPaused) {
      setIsPaused(true);
      
      // Clear existing timers
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (progressRef.current) {
        clearInterval(progressRef.current);
        progressRef.current = null;
      }
      
      // Calculate remaining time
      if (startTimeRef.current) {
        const elapsed = Date.now() - startTimeRef.current;
        remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
      }
    }
  }, [persistent, isPaused]);

  /**
   * Resume timer
   */
  const resumeTimer = useCallback(() => {
    if (!persistent && isPaused && remainingTimeRef.current > 0) {
      setIsPaused(false);
      startTimeRef.current = Date.now();
    }
  }, [persistent, isPaused]);

  // Auto-dismiss timer
  useEffect(() => {
    if (!persistent && duration > 0 && !isPaused) {
      startTimeRef.current = Date.now();
      remainingTimeRef.current = duration;
      
      const startTimer = () => {
        timerRef.current = setTimeout(() => {
          handleDismiss();
        }, remainingTimeRef.current);
      };

      startTimer();

      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
      };
    }
  }, [duration, persistent, isPaused, handleDismiss]);

  // Progress bar animation
  useEffect(() => {
    if (!persistent && duration > 0 && !isPaused) {
      progressRef.current = setInterval(() => {
        setProgress(prev => {
          const elapsed = Date.now() - startTimeRef.current;
          const remaining = Math.max(0, (remainingTimeRef.current - elapsed) / remainingTimeRef.current * 100);
          
          if (remaining <= 0) {
            clearInterval(progressRef.current);
            return 0;
          }
          
          return remaining;
        });
      }, TOAST_CONSTANTS.PROGRESS_UPDATE_INTERVAL);

      return () => {
        if (progressRef.current) {
          clearInterval(progressRef.current);
        }
      };
    }
  }, [duration, persistent, isPaused]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (progressRef.current) {
        clearInterval(progressRef.current);
      }
    };
  }, []);

  return {
    progress,
    isPaused,
    pauseTimer,
    resumeTimer,
    handleDismiss
  };
};