import * as React from 'react';

const ProtectionShield: React.FC = () => {
  React.useEffect(() => {
    // Disable right-click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // Disable text selection
    const handleSelectStart = (e: Event) => {
      if (e.preventDefault) {
        e.preventDefault();
      }
    };

    // Disable keyboard shortcuts for saving/copying/viewing source
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && ['s', 'c', 'u', 'p'].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
      // Disable F12 (developer tools)
      if (e.key === 'F12') {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('selectstart', handleSelectStart);
    document.body.style.userSelect = 'none'; // CSS method for modern browsers
    document.addEventListener('keydown', handleKeyDown);

    // Log access attempt in console
    console.log('%c🔒 PROTECTED DEMO ACCESS ACTIVE', 'color: red; font-size: 16px; font-weight: bold;');

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('selectstart', handleSelectStart);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.userSelect = ''; // Clean up style on unmount
    };
  }, []);

  return (
    <>
      {/* Watermark */}
      <div className="fixed bottom-2 right-2 text-xs text-red-600 font-semibold z-50 bg-white/80 px-2 py-1 rounded border border-red-300 backdrop-blur-sm pointer-events-none">
        🔒 Confidential - © Nicolase Lesapo 2024
      </div>
      
      {/* Protection Notice */}
      <div className="fixed top-2 left-2 text-xs text-red-600 font-semibold z-50 bg-white/80 px-2 py-1 rounded border border-red-300 backdrop-blur-sm pointer-events-none">
        PROTECTED INTELLECTUAL PROPERTY
      </div>
    </>
  );
};

export default ProtectionShield;
