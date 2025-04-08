'use client';

import { useState, useEffect } from 'react';

type DeviceType = 'mobileOrTablet' | 'desktop';

export const useDeviceType = (): DeviceType => {
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');

  useEffect(() => {
    // Check for touch capability
    const hasTouchScreen =
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      ('msMaxTouchPoints' in window && 'msMaxTouchPoints' in navigator);

    // Small screen is a secondary indicator
    const isSmallScreen = window.innerWidth <= 768;

    setDeviceType(hasTouchScreen || isSmallScreen ? 'mobileOrTablet' : 'desktop');
  }, []);

  return deviceType;
};
