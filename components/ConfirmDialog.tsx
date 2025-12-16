import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDangerous = false,
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const handleConfirm = async () => {
    try {
      await onConfirm();
    } catch (error) {
      console.error('Confirm action failed:', error);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full animate-scale-in">
          {/* Header */}
          <div className="flex items-start justify-between p-6 border-b border-slate-200">
            <div className="flex items-start gap-3">
              {isDangerous && (
                <div className="p-2 bg-red-50 rounded-lg flex-shrink-0">
                  <AlertCircle className="text-red-600" size={20} />
                </div>
              )}
              <div>
                <h2 className={`text-lg font-bold ${isDangerous ? 'text-red-600' : 'text-slate-900'}`}>
                  {title}
                </h2>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="text-slate-400 hover:text-slate-600 transition-colors"
              disabled={isLoading}
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-slate-600 text-sm leading-relaxed">
              {message}
            </p>
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-6 border-t border-slate-200 bg-slate-50/50">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className={`flex-1 px-4 py-2 rounded-lg text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                isDangerous
                  ? 'bg-red-600 hover:bg-red-700 active:scale-95'
                  : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {confirmText}
                </span>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConfirmDialog;

