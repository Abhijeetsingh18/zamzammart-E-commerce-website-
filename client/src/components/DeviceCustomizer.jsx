import React from 'react';
import { 
  Smartphone, Tablet, Laptop, Sparkles, X, Check, 
  Settings, Sliders, Monitor, ShieldCheck, Vibrate, 
  Layers, Compass, ExternalLink, Keyboard, Info
} from 'lucide-react';
import { useDevice } from '../context/DeviceContext';

export default function DeviceCustomizer() {
  const { 
    deviceMode, 
    setDeviceMode, 
    activeDevice, 
    detectedEnvironment, 
    screenInfo, 
    isCustomizerOpen, 
    setIsCustomizerOpen,
    triggerHaptic,
    showDeviceFrame,
    toggleDeviceFrame
  } = useDevice();

  const deviceProfiles = [
    {
      id: 'auto',
      title: 'Auto-Detect',
      subtitle: `Follows your actual hardware (${detectedEnvironment.modelName})`,
      icon: Sparkles,
      color: 'from-emerald-600 to-teal-500',
      badge: 'Smart Auto',
      description: 'Dynamically adapts layout, dock, and touch targets based on your live screen and browser.'
    },
    {
      id: 'android',
      title: 'Android Smartphone',
      subtitle: 'Samsung, Pixel, OnePlus & Android mobile browsers',
      icon: Smartphone,
      color: 'from-green-600 to-emerald-600',
      badge: 'Android OS',
      description: 'Features bottom app dock, Material You cards, touch-optimized targets, and haptic feedback.'
    },
    {
      id: 'iphone',
      title: 'Apple iPhone (iOS)',
      subtitle: 'iPhone 16, 15, 14 & Safari / Chrome on iOS',
      icon: Smartphone,
      color: 'from-slate-800 to-slate-950',
      badge: 'Apple iOS',
      description: 'Frosted glassmorphism dock, iOS safe area notch & home bar insets, Cupertino styling.'
    },
    {
      id: 'ipad',
      title: 'iPad & Tablets',
      subtitle: 'iPad Pro, iPad Air, Galaxy Tab (768px - 1024px)',
      icon: Tablet,
      color: 'from-blue-600 to-indigo-600',
      badge: 'Tablet View',
      description: 'Balanced 3-column grid, touch-friendly product cards, and dual-column drawer layout.'
    },
    {
      id: 'desktop',
      title: 'Laptop & Desktop PC',
      subtitle: 'Windows, Mac, Linux (FHD, 2K, 4K Displays)',
      icon: Laptop,
      color: 'from-purple-600 to-indigo-700',
      badge: 'Full Desktop',
      description: 'Full 4-5 column mega grid, keyboard shortcuts (/ for search, Esc, Alt+C), hover animations.'
    }
  ];

  const handleSelectMode = (modeId) => {
    triggerHaptic(20);
    setDeviceMode(modeId);
  };

  const getDeviceIcon = () => {
    if (activeDevice === 'android' || activeDevice === 'iphone') return <Smartphone className="w-3.5 h-3.5" />;
    if (activeDevice === 'ipad') return <Tablet className="w-3.5 h-3.5" />;
    return <Laptop className="w-3.5 h-3.5" />;
  };

  const getDeviceLabel = () => {
    if (deviceMode === 'auto') return `Auto (${activeDevice.toUpperCase()})`;
    if (deviceMode === 'android') return 'Android Phone';
    if (deviceMode === 'iphone') return 'iPhone iOS';
    if (deviceMode === 'ipad') return 'iPad / Tablet';
    return 'Desktop PC';
  };

  return (
    <>
      {/* Discreet Floating Customizer Trigger Badge */}
      <aside 
        aria-label="Device Customizer Toggle"
        className="fixed bottom-20 sm:bottom-6 right-4 z-40 animate-fade-in"
      >
        <button
          type="button"
          onClick={() => {
            triggerHaptic(15);
            setIsCustomizerOpen(true);
          }}
          className="bg-slate-900/90 hover:bg-slate-900 text-white text-xs font-bold py-2 px-3 rounded-full shadow-xl shadow-slate-900/25 border border-slate-700/80 backdrop-blur-md flex items-center space-x-2 transition-all hover:scale-105 active:scale-95 group"
          title="Customize website for Android, iPhone, iPad, or Desktop"
        >
          <span className="p-1 rounded-full bg-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500/30">
            {getDeviceIcon()}
          </span>
          <span className="hidden sm:inline font-medium text-[11px] text-slate-200">Device:</span>
          <span className="font-extrabold text-[11px] text-emerald-400 tracking-wide">
            {getDeviceLabel()}
          </span>
          <Sliders className="w-3 h-3 text-slate-400 group-hover:text-white" />
        </button>
      </aside>

      {/* Device Customization Center Modal */}
      {isCustomizerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl relative border border-slate-100 animate-slide-up">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950 text-white">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
                  <Monitor className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black tracking-tight flex items-center">
                    Multi-Device Experience Customizer
                    <span className="ml-2 px-2 py-0.5 text-[9px] bg-emerald-500/20 text-emerald-300 rounded-full font-mono uppercase">
                      Live
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300">
                    Customize layouts, navigation docks, touch targets, and performance for each device
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCustomizerOpen(false)}
                className="p-2 text-slate-400 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* Profile Selection Grid */}
              <div>
                <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-3">
                  Choose Target Device Mode
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {deviceProfiles.map((profile) => {
                    const Icon = profile.icon;
                    const isSelected = deviceMode === profile.id;
                    const isCurrentlyActive = activeDevice === profile.id || (profile.id === 'auto' && deviceMode === 'auto');

                    return (
                      <button
                        key={profile.id}
                        type="button"
                        onClick={() => handleSelectMode(profile.id)}
                        className={`text-left p-4 rounded-2xl border-2 transition-all relative overflow-hidden flex flex-col justify-between ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/50 shadow-md ring-2 ring-emerald-500/20'
                            : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/60'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}

                        <div>
                          <div className="flex items-center space-x-2.5 mb-2">
                            <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${profile.color} text-white flex items-center justify-center shadow-sm`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="flex items-center space-x-1.5">
                                <span className="font-black text-xs text-slate-900">
                                  {profile.title}
                                </span>
                              </div>
                              <span className="text-[10px] font-semibold text-slate-500 block">
                                {profile.badge}
                              </span>
                            </div>
                          </div>

                          <p className="text-[11px] text-slate-600 leading-snug mt-1">
                            {profile.description}
                          </p>
                        </div>

                        {profile.id === 'auto' && (
                          <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center text-[10px] text-emerald-800 font-bold">
                            <Sparkles className="w-3 h-3 mr-1 text-emerald-600" />
                            Active Profile: <span className="uppercase ml-1 text-slate-900">{activeDevice}</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Hardware Diagnostics Card */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Info className="w-4 h-4 text-emerald-700" />
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wide">
                      Real Hardware Diagnostics
                    </span>
                  </div>
                  <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                    {detectedEnvironment.modelName}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Viewport</span>
                    <span className="font-extrabold text-slate-800 font-mono text-[11px]">
                      {screenInfo.width} × {screenInfo.height}px
                    </span>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Scale / DPR</span>
                    <span className="font-extrabold text-slate-800 font-mono text-[11px]">
                      {screenInfo.pixelRatio.toFixed(1)}x Retina
                    </span>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Orientation</span>
                    <span className="font-extrabold text-slate-800 capitalize text-[11px]">
                      {screenInfo.orientation}
                    </span>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Touch Screen</span>
                    <span className="font-extrabold text-slate-800 text-[11px]">
                      {screenInfo.hasTouch ? '✓ Multi-Touch' : 'Mouse / Pointer'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Special Features & Desktop Tools */}
              <div className="space-y-3 pt-1">
                <span className="block text-xs font-black text-slate-900 uppercase tracking-wider">
                  Device Specific Capabilities
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {/* Android & Haptic Feedback */}
                  <div className="p-3.5 bg-white border border-slate-200 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Vibrate className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-bold text-slate-800">Android Haptics</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => triggerHaptic(25)}
                        className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded-lg font-bold"
                      >
                        Test Vibration
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      Tactile micro-vibrations when tapping "+ Add" to cart and navigating the bottom dock on supported mobile devices.
                    </p>
                  </div>

                  {/* Desktop Keyboard Navigation */}
                  <div className="p-3.5 bg-white border border-slate-200 rounded-2xl space-y-2">
                    <div className="flex items-center space-x-2">
                      <Keyboard className="w-4 h-4 text-indigo-600" />
                      <span className="text-xs font-bold text-slate-800">Desktop Shortcuts</span>
                    </div>
                    <div className="text-[10px] text-slate-600 space-y-1">
                      <div><kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded font-mono font-bold">/</kbd> Focus Search Bar</div>
                      <div><kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded font-mono font-bold">Esc</kbd> Close Any Modal / Drawer</div>
                      <div><kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded font-mono font-bold">Alt+C</kbd> Toggle Shopping Cart</div>
                    </div>
                  </div>

                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <div className="text-[11px] text-slate-500">
                Current custom profile: <strong className="text-slate-800 uppercase">{activeDevice}</strong>
              </div>
              <button
                type="button"
                onClick={() => setIsCustomizerOpen(false)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-5 rounded-xl shadow-sm transition-all"
              >
                Apply & Done
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
