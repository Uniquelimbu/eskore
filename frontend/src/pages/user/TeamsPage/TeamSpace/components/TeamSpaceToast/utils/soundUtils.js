/**
 * Toast Sound Utilities
 * Handles notification sounds for different toast types
 */

// Sound frequency mappings for different toast types
const SOUND_FREQUENCIES = {
  success: [523.25, 659.25, 783.99], // C5, E5, G5 (major chord)
  error: [220, 246.94], // A3, B3 (dissonant)
  warning: [440, 554.37], // A4, C#5 (warning tone)
  info: [523.25, 659.25], // C5, E5 (neutral)
  loading: [440] // A4 (single tone)
};

/**
 * Play notification sound for toast type
 */
export const playNotificationSound = (type = 'info') => {
  if (!window.AudioContext && !window.webkitAudioContext) {
    console.warn('Web Audio API not supported');
    return;
  }

  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const frequencies = SOUND_FREQUENCIES[type] || SOUND_FREQUENCIES.info;
    
    frequencies.forEach((freq, index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
      oscillator.type = type === 'error' ? 'sawtooth' : 'sine';
      
      // Volume and timing
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      
      const startTime = audioContext.currentTime + (index * 0.1);
      oscillator.start(startTime);
      oscillator.stop(startTime + 0.2);
    });
  } catch (error) {
    console.warn('Error playing notification sound:', error);
  }
};

/**
 * Check if sound is enabled in user preferences
 */
export const isSoundEnabled = () => {
  try {
    return localStorage.getItem('teamspace-toast-sound') !== 'false';
  } catch {
    return false;
  }
};

/**
 * Set sound preference
 */
export const setSoundEnabled = (enabled) => {
  try {
    localStorage.setItem('teamspace-toast-sound', enabled.toString());
  } catch {
    console.warn('Could not save sound preference');
  }
};