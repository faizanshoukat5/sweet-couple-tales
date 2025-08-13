/**
 * Haptic feedback utilities for enhanced mobile UX
 * Provides standardized vibration patterns for different interactions
 */

export interface HapticPattern {
  pattern: number[];
  description: string;
}

export const HAPTIC_PATTERNS = {
  // Light feedback for button taps and selections
  light: {
    pattern: [10],
    description: 'Light tap feedback'
  },
  
  // Medium feedback for confirmations and important actions
  medium: {
    pattern: [25],
    description: 'Medium confirmation feedback'
  },
  
  // Heavy feedback for errors or warnings
  heavy: {
    pattern: [50],
    description: 'Heavy feedback for alerts'
  },
  
  // Double tap for notifications
  notification: {
    pattern: [25, 50, 25],
    description: 'Notification received'
  },
  
  // Success pattern for completed actions
  success: {
    pattern: [15, 25, 15],
    description: 'Action completed successfully'
  },
  
  // Error pattern for failed actions
  error: {
    pattern: [100, 50, 100],
    description: 'Error occurred'
  },
  
  // Selection pattern for swipe gestures
  selection: {
    pattern: [20],
    description: 'Item selected or focused'
  },
  
  // Long press confirmation
  longPress: {
    pattern: [30, 20, 30],
    description: 'Long press confirmed'
  }
} as const;

export type HapticType = keyof typeof HAPTIC_PATTERNS;

/**
 * Triggers haptic feedback with the specified pattern
 * Safely handles environments where vibration is not supported
 */
export function triggerHaptic(type: HapticType = 'light'): void {
  // Check if the device supports vibration
  if (!navigator.vibrate) {
    return;
  }
  
  // Check if user has enabled haptic feedback (respects accessibility preferences)
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }
  
  try {
    const pattern = HAPTIC_PATTERNS[type];
    navigator.vibrate(pattern.pattern);
  } catch (error) {
    // Silently fail if vibration is not supported or blocked
    console.debug('Haptic feedback not available:', error);
  }
}

/**
 * Enhanced haptic feedback for specific chat interactions
 */
export const chatHaptics = {
  // Message interactions
  messageSent: () => triggerHaptic('success'),
  messageReceived: () => triggerHaptic('notification'),
  messageReply: () => triggerHaptic('medium'),
  messageLongPress: () => triggerHaptic('longPress'),
  
  // Swipe gestures
  swipeStart: () => triggerHaptic('light'),
  swipeReply: () => triggerHaptic('medium'),
  swipeCancel: () => triggerHaptic('light'),
  
  // UI interactions
  buttonTap: () => triggerHaptic('light'),
  toggleOpen: () => triggerHaptic('medium'),
  toggleClose: () => triggerHaptic('light'),
  
  // Voice recording
  recordingStart: () => triggerHaptic('medium'),
  recordingStop: () => triggerHaptic('success'),
  recordingCancel: () => triggerHaptic('error'),
  
  // Connection status
  connected: () => triggerHaptic('success'),
  disconnected: () => triggerHaptic('error'),
  reconnecting: () => triggerHaptic('light'),
  
  // Errors and validations
  error: () => triggerHaptic('error'),
  warning: () => triggerHaptic('heavy'),
  inputError: () => triggerHaptic('heavy')
};

/**
 * Debounced haptic feedback to prevent rapid-fire vibrations
 */
export class DebouncedHaptic {
  private lastTrigger = 0;
  private minInterval = 50; // Minimum 50ms between haptics
  
  trigger(type: HapticType = 'light', forceDelay?: number): void {
    const now = Date.now();
    const interval = forceDelay ?? this.minInterval;
    
    if (now - this.lastTrigger >= interval) {
      triggerHaptic(type);
      this.lastTrigger = now;
    }
  }
}

// Global debounced haptic instance for use across components
export const debouncedHaptic = new DebouncedHaptic();

export default {
  triggerHaptic,
  chatHaptics,
  debouncedHaptic,
  HAPTIC_PATTERNS
};
