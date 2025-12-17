import React, { useState } from 'react';
import { ExternalLink } from 'lucide-react';

interface PDFViewerProps {
  url: string;
  title: string;
}

/**
 * Simplified PDF Viewer Component
 * Optimized for iOS Safari and mobile browsers
 * Uses minimal styling to ensure maximum compatibility
 */
const PDFViewer: React.FC<PDFViewerProps> = ({ url, title }) => {
  const [error, setError] = useState<string | null>(null);

  // Open PDF in new tab - most reliable method for iOS
  const handleOpenInNewTab = () => {
    window.open(url, '_blank');
  };

  return (
    <div className="w-full h-full flex flex-col bg-white">
      {/* Simple header with "Open in New Tab" option */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200 flex-shrink-0">
        <span className="text-sm text-slate-600 font-medium">{title}</span>
        <button
          onClick={handleOpenInNewTab}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
          title="Open in new tab"
        >
          <ExternalLink size={16} />
          <span className="hidden sm:inline">Open in New Tab</span>
        </button>
      </div>

      {/* PDF Content - Simplified iframe with iOS-optimized settings */}
      <div className="flex-1 relative" style={{ minHeight: 0 }}>
        <iframe
          src={url}
          title={title}
          className="absolute inset-0 w-full h-full border-none"
          style={{
            WebkitOverflowScrolling: 'touch',
            overflow: 'auto'
          }}
          onError={() => {
            setError('Failed to load PDF. Please try opening in a new tab.');
          }}
        />
      </div>

      {/* Error message */}
      {error && (
        <div className="px-4 py-3 bg-red-50 border-t border-red-200 text-red-700 text-sm flex-shrink-0">
          <p>{error}</p>
          <button
            onClick={handleOpenInNewTab}
            className="mt-2 text-blue-600 hover:underline"
          >
            Click here to open in new tab
          </button>
        </div>
      )}
    </div>
  );
};

export default PDFViewer;

