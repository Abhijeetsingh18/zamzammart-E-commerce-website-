import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

const DeviceContext = createContext();

export function DeviceProvider({ children }) {
  // Saved device preference ('auto', 'android', 'iphone', 'ipad', 'desktop')
  const [deviceMode, setDeviceModeState] = useState(() => {
    try {
      return localStorage.getItem('zzm_device_mode') || 'auto';
    } catch (e) {
      return 'auto';
    }
  });

  // Toggle realistic phone/tablet frame mockup when simulating on desktop screens
  const [showDeviceFrame, setShowDeviceFrame] = useState(() => {
    try {
      return localStorage.getItem('zzm_device_frame') === 'true';
    } catch (e) {
      return false;
    }
  });

  // Modal visibility for the Device Customization Center
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);

  // Real-time window metrics
  const [screenInfo, setScreenInfo] = useState(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 1280,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
    pixelRatio: typeof window !== 'undefined' ? (window.devicePixelRatio || 1) : 1,
    orientation: typeof window !== 'undefined' && window.innerWidth < window.innerHeight ? 'portrait' : 'landscape',
    hasTouch: typeof navigator !== 'undefined' ? (navigator.maxTouchPoints > 0) : false
  }));

  // Auto-detect real hardware environment
  const detectedEnvironment = useMemo(() => {
    if (typeof navigator === 'undefined') {
      return { os: 'windows', type: 'desktop', modelName: 'Desktop PC' };
    }

    const ua = navigator.userAgent || '';
    const platform = navigator.platform || '';
    const maxTouchPoints = navigator.maxTouchPoints || 0;
    const width = screenInfo.width;

    // Detect iPad (Modern iPads on iPadOS send MacIntel with multi-touch)
    const isIPad = /iPad/i.test(ua) || (platform === 'MacIntel' && maxTouchPoints > 1);
    if (isIPad || (/Tablet|PlayBook|Silk/i.test(ua)) || (width >= 768 && width <= 1024 && maxTouchPoints > 0)) {
      return { os: 'ipados', type: 'tablet', modelName: 'Apple iPad / Tablet' };
    }

    // Detect iPhone / iPod
    const isIPhone = /iPhone|iPod/i.test(ua);
    if (isIPhone) {
      return { os: 'ios', type: 'mobile', modelName: 'Apple iPhone (iOS)' };
    }

    // Detect Android
    const isAndroid = /Android/i.test(ua);
    if (isAndroid) {
      return { os: 'android', type: 'mobile', modelName: 'Android Smartphone' };
    }

    // Small screen fallback as mobile
    if (width < 768 && maxTouchPoints > 0) {
      return { os: 'android', type: 'mobile', modelName: 'Mobile Smartphone' };
    }

    // Desktop environments
    if (/Macintosh|Mac OS X/i.test(ua)) {
      return { os: 'macos', type: 'desktop', modelName: 'Apple Mac / MacBook' };
    }
    if (/Windows/i.test(ua)) {
      return { os: 'windows', type: 'desktop', modelName: 'Windows Laptop / PC' };
    }
    if (/Linux/i.test(ua)) {
      return { os: 'linux', type: 'desktop', modelName: 'Linux Workstation' };
    }

    return { os: 'unknown', type: 'desktop', modelName: 'Desktop / Laptop' };
  }, [screenInfo.width]);

  // Window resize listener
  useEffect(() => {
    const handleResize = () => {
      setScreenInfo({
        width: window.innerWidth,
        height: window.innerHeight,
        pixelRatio: window.devicePixelRatio || 1,
        orientation: window.innerWidth < window.innerHeight ? 'portrait' : 'landscape',
        hasTouch: navigator.maxTouchPoints > 0
      });
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  const setDeviceMode = (mode) => {
    setDeviceModeState(mode);
    try {
      localStorage.setItem('zzm_device_mode', mode);
    } catch (e) {
      // ignore
    }
  };

  const toggleDeviceFrame = () => {
    setShowDeviceFrame((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('zzm_device_frame', String(next));
      } catch (e) {
        // ignore
      }
      return next;
    });
  };

  // Compute active customized profile
  const activeDevice = useMemo(() => {
    if (deviceMode !== 'auto') {
      return deviceMode; // 'android', 'iphone', 'ipad', 'desktop'
    }

    // Auto-detect resolution
    if (detectedEnvironment.type === 'tablet') return 'ipad';
    if (detectedEnvironment.os === 'ios') return 'iphone';
    if (detectedEnvironment.type === 'mobile') return 'android';
    return 'desktop';
  }, [deviceMode, detectedEnvironment]);

  // Derived flags
  const isMobile = activeDevice === 'android' || activeDevice === 'iphone';
  const isAndroid = activeDevice === 'android';
  const isIPhone = activeDevice === 'iphone';
  const isIPad = activeDevice === 'ipad';
  const isTablet = activeDevice === 'ipad';
  const isDesktop = activeDevice === 'desktop';
  const isTouch = isMobile || isTablet || screenInfo.hasTouch;

  // Haptic feedback vibration (supported on Android devices/browsers)
  const triggerHaptic = (duration = 15) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(duration);
      } catch (e) {
        // ignore
      }
    }
  };

  // Apply device class tags to <html> and <body> for CSS scoping
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('device-android', 'device-iphone', 'device-ipad', 'device-desktop', 'is-mobile', 'is-touch');

    root.classList.add(`device-${activeDevice}`);
    if (isMobile) root.classList.add('is-mobile');
    if (isTouch) root.classList.add('is-touch');

    // Theme color adjustments for Android status bar
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      if (activeDevice === 'android') {
        metaTheme.setAttribute('content', '#064e3b'); // Emerald dark
      } else if (activeDevice === 'iphone') {
        metaTheme.setAttribute('content', '#ffffff'); // Clean iOS style
      } else {
        metaTheme.setAttribute('content', '#064e3b');
      }
    }
  }, [activeDevice, isMobile, isTouch]);

  return (
    <DeviceContext.Provider
      value={{
        deviceMode,
        setDeviceMode,
        activeDevice,
        detectedEnvironment,
        screenInfo,
        isMobile,
        isAndroid,
        isIPhone,
        isIPad,
        isTablet,
        isDesktop,
        isTouch,
        triggerHaptic,
        showDeviceFrame,
        toggleDeviceFrame,
        isCustomizerOpen,
        setIsCustomizerOpen
      }}
    >
      {children}
    </DeviceContext.Provider>
  );
}

export function useDevice() {
  const context = useContext(DeviceContext);
  if (!context) {
    throw new Error('useDevice must be used within a DeviceProvider');
  }
  return context;
}
