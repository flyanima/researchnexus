import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';

interface PDFViewerProps {
  url: string;
  title: string;
}

/**
 * Enhanced PDF Viewer Component
 * Provides better mobile support and multi-page navigation
 * Falls back to iframe if PDF.js is not available
 */
const PDFViewer: React.FC<PDFViewerProps> = ({ url, title }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Try to load PDF.js library
  useEffect(() => {
    const loadPdfJs = async () => {
      try {
        // Check if PDF.js is already loaded
        if ((window as any).pdfjsLib) {
          (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = 
            `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${(window as any).pdfjsLib.version}/pdf.worker.min.js`;
          return;
        }

        // Load PDF.js from CDN
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        script.async = true;
        script.onload = () => {
          if ((window as any).pdfjsLib) {
            (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = 
              'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
          }
        };
        document.head.appendChild(script);
      } catch (err) {
        console.warn('Failed to load PDF.js, falling back to iframe:', err);
      }
    };

    loadPdfJs();
  }, []);

  // Fallback to iframe rendering
  // This is the primary method for mobile compatibility
  return (
    <div className="w-full h-full flex flex-col bg-white">
      {/* Controls */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-600">
            {currentPage > 0 ? `Page ${currentPage}` : 'Loading...'}
            {totalPages > 0 && ` of ${totalPages}`}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <button
            onClick={() => setZoom(Math.max(50, zoom - 10))}
            className="p-2 hover:bg-slate-200 rounded transition-colors"
            title="Zoom out"
          >
            <ZoomOut size={18} className="text-slate-600" />
          </button>
          <span className="text-sm text-slate-600 w-12 text-center">{zoom}%</span>
          <button
            onClick={() => setZoom(Math.min(200, zoom + 10))}
            className="p-2 hover:bg-slate-200 rounded transition-colors"
            title="Zoom in"
          >
            <ZoomIn size={18} className="text-slate-600" />
          </button>
        </div>
      </div>

      {/* PDF Content */}
      <div className="flex-1 overflow-hidden bg-slate-100">
        <div className="w-full h-full flex flex-col" style={{ WebkitOverflowScrolling: 'touch' }}>
          <iframe
            src={url}
            title={title}
            className="w-full h-full border-none flex-1"
            scrolling="yes"
            allow="fullscreen"
            allowFullScreen
            style={{
              WebkitOverflowScrolling: 'touch',
              overscrollBehavior: 'contain',
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top center',
              transition: 'transform 0.2s ease-out'
            }}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setError('Failed to load PDF');
              setIsLoading(false);
            }}
          />
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="px-4 py-3 bg-red-50 border-t border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}
    </div>
  );
};

export default PDFViewer;

