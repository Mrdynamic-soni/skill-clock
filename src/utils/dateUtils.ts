// Cross-platform date utilities that work on iOS and all browsers
export const getLocalDateString = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const parseLocalDate = (dateString: string): string => {
  const date = new Date(dateString);
  return getLocalDateString(date);
};

// Device detection utilities
export const isIOS = (): boolean => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

export const isMacOS = (): boolean => {
  return navigator.platform.indexOf('Mac') > -1;
};

export const isAppleDevice = (): boolean => {
  return isIOS() || isMacOS();
};

// iOS-specific viewport handling
export const handleIOSViewport = (): void => {
  if (isIOS()) {
    // Prevent zoom on input focus
    const viewport = document.querySelector('meta[name=viewport]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
    }
    
    // Handle iOS safe areas
    document.documentElement.style.setProperty('--safe-area-inset-top', 'env(safe-area-inset-top)');
    document.documentElement.style.setProperty('--safe-area-inset-bottom', 'env(safe-area-inset-bottom)');
  }
};