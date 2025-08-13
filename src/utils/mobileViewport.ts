/**
 * Mobile viewport utilities for perfect mobile UX
 * Handles safe areas, keyboard avoidance, and orientation changes
 */

import { useState, useEffect } from 'react';

export interface ViewportInfo {
  width: number;
  height: number;
  availableHeight: number;
  isKeyboardOpen: boolean;
  safeAreaInsets: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  orientation: 'portrait' | 'landscape';
}

/**
 * Hook for monitoring viewport changes and keyboard state
 */
export function useViewport() {
  const [viewportInfo, setViewportInfo] = useState<ViewportInfo>(() => {
    if (typeof window === 'undefined') {
      return {
        width: 375,
        height: 667,
        availableHeight: 667,
        isKeyboardOpen: false,
        safeAreaInsets: { top: 0, bottom: 0, left: 0, right: 0 },
        orientation: 'portrait'
      };
    }

    return getViewportInfo();
  });

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    const updateViewport = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setViewportInfo(getViewportInfo());
      }, 100);
    };

    // Listen for various viewport changes
    window.addEventListener('resize', updateViewport);
    window.addEventListener('orientationchange', updateViewport);
    window.addEventListener('scroll', updateViewport);
    
    // Visual viewport for better keyboard detection
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateViewport);
    }

    return () => {
      window.removeEventListener('resize', updateViewport);
      window.removeEventListener('orientationchange', updateViewport);
      window.removeEventListener('scroll', updateViewport);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateViewport);
      }
      clearTimeout(timeoutId);
    };
  }, []);

  return viewportInfo;
}

/**
 * Get current viewport information
 */
function getViewportInfo(): ViewportInfo {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const visualHeight = window.visualViewport?.height ?? height;
  
  // Detect keyboard by comparing visual viewport to window height
  const isKeyboardOpen = visualHeight < height * 0.8;
  
  // Get safe area insets from CSS env() variables
  const safeAreaInsets = {
    top: getCSSEnvValue('safe-area-inset-top'),
    bottom: getCSSEnvValue('safe-area-inset-bottom'),
    left: getCSSEnvValue('safe-area-inset-left'),
    right: getCSSEnvValue('safe-area-inset-right')
  };

  return {
    width,
    height,
    availableHeight: visualHeight,
    isKeyboardOpen,
    safeAreaInsets,
    orientation: width > height ? 'landscape' : 'portrait'
  };
}

/**
 * Get CSS env() value in pixels
 */
function getCSSEnvValue(property: string): number {
  if (typeof window === 'undefined') return 0;
  
  try {
    const element = document.createElement('div');
    element.style.position = 'fixed';
    element.style.top = '0';
    element.style.left = '0';
    element.style.width = `env(${property})`;
    element.style.height = `env(${property})`;
    element.style.pointerEvents = 'none';
    element.style.visibility = 'hidden';
    
    document.body.appendChild(element);
    const rect = element.getBoundingClientRect();
    document.body.removeChild(element);
    
    return Math.max(rect.width, rect.height);
  } catch {
    return 0;
  }
}

/**
 * Viewport-aware positioning utility
 */
export function getViewportAwarePosition(
  element: HTMLElement,
  preferredPosition: 'top' | 'bottom' = 'bottom'
): 'top' | 'bottom' {
  const rect = element.getBoundingClientRect();
  const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
  
  const spaceAbove = rect.top;
  const spaceBelow = viewportHeight - rect.bottom;
  
  if (preferredPosition === 'bottom' && spaceBelow >= 200) {
    return 'bottom';
  } else if (preferredPosition === 'top' && spaceAbove >= 200) {
    return 'top';
  } else {
    return spaceBelow > spaceAbove ? 'bottom' : 'top';
  }
}

/**
 * Smooth scroll to element with keyboard awareness
 */
export function scrollToElement(
  element: HTMLElement,
  options: {
    behavior?: ScrollBehavior;
    block?: ScrollLogicalPosition;
    inline?: ScrollLogicalPosition;
    offset?: number;
  } = {}
) {
  const { behavior = 'smooth', block = 'nearest', inline = 'nearest', offset = 0 } = options;
  
  // Use visual viewport if available for better keyboard handling
  const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
  const elementRect = element.getBoundingClientRect();
  
  // Calculate if element is visible in current viewport
  const isVisible = elementRect.top >= 0 && elementRect.bottom <= viewportHeight;
  
  if (!isVisible) {
    // Calculate scroll position to center element in available viewport
    const targetScrollTop = window.scrollY + elementRect.top - (viewportHeight / 2) + offset;
    
    window.scrollTo({
      top: Math.max(0, targetScrollTop),
      behavior
    });
  }
}

/**
 * CSS utility for safe area aware styling
 */
export const safeAreaCSS = {
  paddingTop: 'env(safe-area-inset-top, 0px)',
  paddingBottom: 'env(safe-area-inset-bottom, 0px)',
  paddingLeft: 'env(safe-area-inset-left, 0px)',
  paddingRight: 'env(safe-area-inset-right, 0px)',
  
  marginTop: 'env(safe-area-inset-top, 0px)',
  marginBottom: 'env(safe-area-inset-bottom, 0px)',
  marginLeft: 'env(safe-area-inset-left, 0px)',
  marginRight: 'env(safe-area-inset-right, 0px)',
  
  height: 'calc(100vh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px))',
  minHeight: 'calc(100vh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px))',
  maxHeight: 'calc(100vh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px))'
};

/**
 * Perfect mobile chat container height
 */
export function getChatContainerHeight(viewportInfo: ViewportInfo): string {
  const { availableHeight, safeAreaInsets, isKeyboardOpen } = viewportInfo;
  
  if (isKeyboardOpen) {
    // When keyboard is open, use visual viewport height
    return `${availableHeight - safeAreaInsets.top - safeAreaInsets.bottom}px`;
  } else {
    // When keyboard is closed, use full viewport minus safe areas
    return `calc(100vh - ${safeAreaInsets.top}px - ${safeAreaInsets.bottom}px)`;
  }
}

export default {
  useViewport,
  getViewportAwarePosition,
  scrollToElement,
  safeAreaCSS,
  getChatContainerHeight
};
