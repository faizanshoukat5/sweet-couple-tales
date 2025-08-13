/**
 * Text readability and contrast utilities
 * Ensures perfect text readability across all themes and contexts
 */

export interface ContrastLevel {
  ratio: number;
  level: 'AA' | 'AAA' | 'Fail';
}

/**
 * Calculate contrast ratio between two colors
 * Based on WCAG 2.1 guidelines
 */
export function getContrastRatio(foreground: string, background: string): number {
  const getLuminance = (color: string): number => {
    // Convert hex to RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;

    // Calculate relative luminance
    const getComponent = (c: number) => 
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

    const rLum = getComponent(r);
    const gLum = getComponent(g);
    const bLum = getComponent(b);

    return 0.2126 * rLum + 0.7152 * gLum + 0.0722 * bLum;
  };

  const lum1 = getLuminance(foreground);
  const lum2 = getLuminance(background);
  
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Check if contrast meets WCAG guidelines
 */
export function checkContrast(foreground: string, background: string): ContrastLevel {
  const ratio = getContrastRatio(foreground, background);
  
  if (ratio >= 7) {
    return { ratio, level: 'AAA' };
  } else if (ratio >= 4.5) {
    return { ratio, level: 'AA' };
  } else {
    return { ratio, level: 'Fail' };
  }
}

/**
 * CSS utility classes for enhanced text readability
 */
export const readabilityClasses = {
  // High contrast text
  highContrast: 'text-foreground font-medium',
  
  // Message bubble text for own messages
  ownMessage: 'text-white font-medium drop-shadow-sm',
  
  // Message bubble text for received messages
  receivedMessage: 'text-foreground font-medium',
  
  // Status text with better visibility
  statusText: 'text-muted-foreground font-medium opacity-100',
  
  // Timestamp with enhanced readability
  timestamp: 'text-xs font-medium opacity-90',
  
  // Error text with high visibility
  errorText: 'text-destructive font-semibold',
  
  // Success text with good contrast
  successText: 'text-primary font-medium',
  
  // Warning text
  warningText: 'text-amber-600 dark:text-amber-400 font-medium'
};

/**
 * Dynamic text color based on background
 */
export function getOptimalTextColor(backgroundColor: string): string {
  const whiteContrast = getContrastRatio('#ffffff', backgroundColor);
  const blackContrast = getContrastRatio('#000000', backgroundColor);
  
  return whiteContrast > blackContrast ? '#ffffff' : '#000000';
}

/**
 * Enhanced text shadow for better readability
 */
export function getTextShadow(backgroundColor: string): string {
  const optimalColor = getOptimalTextColor(backgroundColor);
  
  if (optimalColor === '#ffffff') {
    // Light text on dark background
    return '0 1px 2px rgba(0, 0, 0, 0.3), 0 0 4px rgba(0, 0, 0, 0.1)';
  } else {
    // Dark text on light background
    return '0 1px 1px rgba(255, 255, 255, 0.8)';
  }
}

/**
 * CSS-in-JS styles for perfect readability
 */
export const readabilityStyles = {
  messageOwn: {
    color: '#ffffff',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
    fontWeight: '500'
  },
  
  messageReceived: {
    color: 'hsl(var(--foreground))',
    textShadow: 'none',
    fontWeight: '500'
  },
  
  statusOwn: {
    color: 'rgba(255, 255, 255, 0.9)',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
    fontWeight: '500'
  },
  
  statusReceived: {
    color: 'hsl(var(--muted-foreground))',
    textShadow: 'none',
    fontWeight: '500'
  },
  
  timestamp: {
    fontWeight: '500',
    letterSpacing: '0.01em'
  }
};

/**
 * Accessibility-compliant text sizing
 */
export const textSizes = {
  // Minimum sizes for readability
  xs: '12px',    // Minimum for secondary text
  sm: '14px',    // Standard body text
  base: '16px',  // Preferred body text
  lg: '18px',    // Large text
  xl: '20px',    // Heading text
  
  // Line heights for optimal readability
  lineHeights: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75
  }
};

/**
 * Test text readability for a given element
 */
export function testReadability(element: HTMLElement): ContrastLevel {
  const styles = window.getComputedStyle(element);
  const textColor = styles.color;
  const backgroundColor = styles.backgroundColor;
  
  // Convert RGB to hex for calculation
  const rgbToHex = (rgb: string): string => {
    const values = rgb.match(/\d+/g);
    if (!values || values.length < 3) return '#000000';
    
    const [r, g, b] = values.map(num => parseInt(num));
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  };
  
  const foregroundHex = rgbToHex(textColor);
  const backgroundHex = rgbToHex(backgroundColor);
  
  return checkContrast(foregroundHex, backgroundHex);
}

export default {
  getContrastRatio,
  checkContrast,
  readabilityClasses,
  getOptimalTextColor,
  getTextShadow,
  readabilityStyles,
  textSizes,
  testReadability
};
