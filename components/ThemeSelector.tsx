import React, { useState, useRef, useEffect } from 'react';
import { Plus, X, Edit2, Check } from 'lucide-react';
import { Theme } from '../services/themeService';

interface ThemeSelectorProps {
  themes: Theme[];
  activeTheme: string;
  onSelectTheme: (themeName: string) => void;
  onAddTheme: (name: string, color: string) => Promise<void>;
  onDeleteTheme: (id: string) => Promise<void>;
  onUpdateTheme: (id: string, name: string, color: string) => Promise<void>;
  loading?: boolean;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  themes,
  activeTheme,
  onSelectTheme,
  onAddTheme,
  onDeleteTheme,
  onUpdateTheme,
  loading = false,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newThemeName, setNewThemeName] = useState('');
  const [newThemeColor, setNewThemeColor] = useState('#3b82f6');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showAddForm && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showAddForm]);

  const handleAddTheme = async () => {
    if (!newThemeName.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddTheme(newThemeName.trim(), newThemeColor);
      setNewThemeName('');
      setNewThemeColor('#3b82f6');
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to add theme:', error);
      alert('Failed to add theme. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTheme = async (id: string) => {
    if (!editName.trim()) return;

    setIsSubmitting(true);
    try {
      await onUpdateTheme(id, editName.trim(), editColor);
      setEditingId(null);
    } catch (error) {
      console.error('Failed to update theme:', error);
      alert('Failed to update theme. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTheme = async (id: string) => {
    if (!confirm('Are you sure you want to delete this theme?')) return;

    setIsSubmitting(true);
    try {
      await onDeleteTheme(id);
    } catch (error) {
      console.error('Failed to delete theme:', error);
      alert('Failed to delete theme. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (theme: Theme) => {
    setEditingId(theme.id);
    setEditName(theme.name);
    setEditColor(theme.color);
  };

  return (
    <div className="flex items-center gap-2 pb-2 md:pb-0 md:flex-wrap">
      {/* All button */}
      <button
        onClick={() => onSelectTheme('All')}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 transform active:scale-95 whitespace-nowrap flex-shrink-0 ${
          activeTheme === 'All'
            ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 scale-105'
            : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 hover:border-slate-300'
        }`}
      >
        All
      </button>

      {/* Theme buttons */}
      {themes.map((theme) => (
        <div key={theme.id} className="relative group">
          {editingId === theme.id ? (
            <div className="flex items-center gap-1 bg-white border border-slate-300 rounded-full px-2 py-1">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="px-2 py-1 text-sm border-none outline-none w-24"
                disabled={isSubmitting}
              />
              <input
                type="color"
                value={editColor}
                onChange={(e) => setEditColor(e.target.value)}
                className="w-6 h-6 rounded cursor-pointer"
                disabled={isSubmitting}
              />
              <button
                onClick={() => handleUpdateTheme(theme.id)}
                disabled={isSubmitting}
                className="p-1 hover:bg-slate-100 rounded transition-colors"
              >
                <Check size={14} className="text-green-600" />
              </button>
              <button
                onClick={() => setEditingId(null)}
                disabled={isSubmitting}
                className="p-1 hover:bg-slate-100 rounded transition-colors"
              >
                <X size={14} className="text-red-600" />
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={() => onSelectTheme(theme.name)}
                style={{
                  backgroundColor:
                    activeTheme === theme.name ? theme.color : 'transparent',
                  borderColor: theme.color,
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 transform active:scale-95 whitespace-nowrap border-2 flex-shrink-0 ${
                  activeTheme === theme.name
                    ? 'text-white shadow-lg shadow-slate-900/20 scale-105'
                    : 'text-slate-600 hover:bg-slate-100/50'
                }`}
              >
                {theme.name}
              </button>

              {/* Edit and Delete buttons (shown on hover) */}
              <div className="absolute right-0 top-full mt-1 hidden group-hover:flex gap-1 bg-white border border-slate-200 rounded-lg shadow-lg p-1 z-10">
                <button
                  onClick={() => startEdit(theme)}
                  className="p-1.5 hover:bg-slate-100 rounded transition-colors"
                  title="Edit theme"
                >
                  <Edit2 size={14} className="text-blue-600" />
                </button>
                <button
                  onClick={() => handleDeleteTheme(theme.id)}
                  className="p-1.5 hover:bg-slate-100 rounded transition-colors"
                  title="Delete theme"
                >
                  <X size={14} className="text-red-600" />
                </button>
              </div>
            </>
          )}
        </div>
      ))}

      {/* Add new theme button */}
      {!showAddForm ? (
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 transform active:scale-95 whitespace-nowrap bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 hover:border-slate-300 flex items-center gap-1 flex-shrink-0"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Add Theme</span>
        </button>
      ) : (
        <div className="flex items-center gap-1 bg-white border border-blue-300 rounded-full px-2 py-1 shadow-md">
          <input
            ref={inputRef}
            type="text"
            placeholder="Theme name"
            value={newThemeName}
            onChange={(e) => setNewThemeName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleAddTheme();
            }}
            className="px-2 py-1 text-sm border-none outline-none w-32"
            disabled={isSubmitting}
          />
          <input
            type="color"
            value={newThemeColor}
            onChange={(e) => setNewThemeColor(e.target.value)}
            className="w-6 h-6 rounded cursor-pointer"
            disabled={isSubmitting}
          />
          <button
            onClick={handleAddTheme}
            disabled={isSubmitting || !newThemeName.trim()}
            className="p-1 hover:bg-slate-100 rounded transition-colors disabled:opacity-50"
          >
            <Check size={14} className="text-green-600" />
          </button>
          <button
            onClick={() => {
              setShowAddForm(false);
              setNewThemeName('');
              setNewThemeColor('#3b82f6');
            }}
            disabled={isSubmitting}
            className="p-1 hover:bg-slate-100 rounded transition-colors"
          >
            <X size={14} className="text-red-600" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ThemeSelector;

