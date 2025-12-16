import React, { useState, useEffect } from 'react';
import { X, Trash2, Maximize2, Minimize2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Artifact, ArtifactType } from '../types';
import ConfirmDialog from './ConfirmDialog';

interface ArtifactViewerProps {
  artifact: Artifact;
  onClose: () => void;
  onDelete?: (artifactId: string) => Promise<void>;
}

const ArtifactViewer: React.FC<ArtifactViewerProps> = ({ artifact, onClose, onDelete }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 调试日志 - 仅在 HTML 类型时输出
  React.useEffect(() => {
    if (artifact.type === ArtifactType.HTML) {
      console.log('🔍 HTML Artifact:', {
        hasUrl: !!artifact.url,
        hasContent: !!artifact.content,
        contentLength: artifact.content?.length || 0,
        willUse: artifact.content ? 'iframe srcDoc ✅' : artifact.url ? 'iframe src (可能失败)' : 'error message'
      });
    }
  }, [artifact]);

  // 处理 ESC 键退出全屏
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  const handleDeleteClick = async () => {
    if (!onDelete) return;
    try {
      setIsDeleting(true);
      await onDelete(artifact.id);
      onClose();
    } catch (error) {
      console.error('Failed to delete artifact:', error);
      alert('Failed to delete artifact. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with blur and fade */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-[fadeIn_0.3s_ease-out_forwards]"
        onClick={onClose}
      />

      {/* Modal Container with scale animation */}
      <div className={`flex flex-col z-10 animate-scale-in origin-center transition-all duration-300 ${
        isFullscreen
          ? 'w-[98vw] h-[98vh]'
          : 'w-full h-full md:h-[90vh] md:w-[90vw] max-w-6xl'
      }`}>
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-800 text-white shadow-lg md:rounded-t-xl border-b border-slate-700">
            <div>
                <h2 className="text-xl font-bold">{artifact.title}</h2>
                <div className="flex items-center gap-2 text-sm text-slate-400 mt-1">
                    <span className="bg-slate-700 px-2 py-0.5 rounded text-xs">{artifact.type}</span>
                    <span>&bull;</span>
                    <span>{new Date(artifact.date).toLocaleDateString()}</span>
                </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                  onClick={toggleFullscreen}
                  className="p-2 hover:bg-slate-700 hover:text-white text-slate-400 rounded-full transition-all duration-300"
                  title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                  {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
              </button>
              {onDelete && (
                <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="p-2 hover:bg-red-600 hover:text-white text-red-400 rounded-full transition-all duration-300"
                    title="Delete artifact"
                >
                    <Trash2 size={20} />
                </button>
              )}
              <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-700 hover:text-white text-slate-400 rounded-full transition-all hover:rotate-90 duration-300"
              >
                  <X size={24} />
              </button>
            </div>
        </div>
        
        {/* Content Area */}
        <div className="flex-1 overflow-hidden bg-slate-100 relative md:rounded-b-xl shadow-2xl">
            <div className="w-full h-full bg-white overflow-y-auto">
                {artifact.type === ArtifactType.MARKDOWN && (
                    <div className="p-8 prose prose-slate max-w-none mx-auto container">
                        {artifact.content ? (
                            <ReactMarkdown>{artifact.content}</ReactMarkdown>
                        ) : (
                            <p className="text-slate-500 italic text-center mt-20">No content available.</p>
                        )}
                    </div>
                )}

                {artifact.type === ArtifactType.PDF && (
                    <iframe 
                        src={artifact.url} 
                        title={artifact.title}
                        className="w-full h-full border-none"
                    />
                )}

                {artifact.type === ArtifactType.HTML && (
                    <>
                        {artifact.content ? (
                            <iframe
                                srcDoc={artifact.content}
                                title={artifact.title}
                                className="w-full h-full border-none bg-white"
                                sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-presentation"
                            />
                        ) : artifact.url ? (
                            <iframe
                                src={artifact.url}
                                title={artifact.title}
                                className="w-full h-full border-none bg-white"
                                sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-presentation"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-500">
                                <p>No HTML content available.</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Artifact"
        message={`Are you sure you want to delete "${artifact.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous={true}
        isLoading={isDeleting}
        onConfirm={handleDeleteClick}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};

export default ArtifactViewer;