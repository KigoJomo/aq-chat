type DeviceType = 'mobileOrTablet' | 'desktop';

export const useDeviceType = (): DeviceType => {
  // Check for touch capability
  const hasTouchScreen =
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    ('msMaxTouchPoints' in window && 'msMaxTouchPoints' in navigator);

  // Small screen is a secondary indicator
  const isSmallScreen = window.innerWidth <= 768;

  return hasTouchScreen || isSmallScreen ? 'mobileOrTablet' : 'desktop';
};
