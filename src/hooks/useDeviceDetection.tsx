import { useState, useEffect } from 'react';

interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouchDevice: boolean;
  orientation: 'portrait' | 'landscape';
  screenWidth: number;
  screenHeight: number;
}

export const useDeviceDetection = (): DeviceInfo => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => {
    // Initial state with safe defaults
    if (typeof window === 'undefined') {
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        isTouchDevice: false,
        orientation: 'landscape',
        screenWidth: 1024,
        screenHeight: 768,
      };
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    
    return {
      isMobile: width < 768,
      isTablet: width >= 768 && width < 1024,
      isDesktop: width >= 1024,
      isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      orientation: width > height ? 'landscape' : 'portrait',
      screenWidth: width,
      screenHeight: height,
    };
  });

  useEffect(() => {
    const updateDeviceInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setDeviceInfo({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
        orientation: width > height ? 'landscape' : 'portrait',
        screenWidth: width,
        screenHeight: height,
      });
    };

    // Throttled resize handler
    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateDeviceInfo, 150);
    };

    // Orientation change handler
    const handleOrientationChange = () => {
      // Small delay to ensure viewport has updated
      setTimeout(updateDeviceInfo, 100);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    // Initial update
    updateDeviceInfo();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      clearTimeout(timeoutId);
    };
  }, []);

  return deviceInfo;
};

// Hook for mobile-specific behaviors
export const useMobileOptimizations = () => {
  const { isMobile, isTouchDevice } = useDeviceDetection();

  useEffect(() => {
    if (isMobile) {
      // Prevent zoom on input focus (iOS)
      const inputs = document.querySelectorAll('input, textarea, select');
      inputs.forEach((input) => {
        const element = input as HTMLElement;
        if (element.style.fontSize === '' || parseInt(element.style.fontSize) < 16) {
          element.style.fontSize = '16px';
        }
      });

      // Improve scroll performance on mobile
      (document.body.style as any).webkitOverflowScrolling = 'touch';
      
      // Add mobile-specific classes
      document.body.classList.add('mobile-device');
      
      if (isTouchDevice) {
        document.body.classList.add('touch-device');
      }
    } else {
      document.body.classList.remove('mobile-device', 'touch-device');
    }

    return () => {
      document.body.classList.remove('mobile-device', 'touch-device');
    };
  }, [isMobile, isTouchDevice]);

  return {
    isMobile,
    isTouchDevice,
    // Utility functions
    getOptimalImageSize: () => {
      if (isMobile) return 'mobile';
      return 'desktop';
    },
    shouldReduceAnimations: () => {
      return isMobile || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    },
    getTouchTargetSize: () => {
      return isTouchDevice ? 44 : 32; // 44px minimum for touch, 32px for mouse
    }
  };
};

export default useDeviceDetection;
