import React, { useState } from 'react';
import { Project } from '../types';
import { FolderGit2, Calendar, FileText, ArrowRight, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import ConfirmDialog from './ConfirmDialog';

interface ProjectCardProps {
  project: Project;
  index?: number;
  onDelete?: (projectId: string) => Promise<void>;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, index = 0, onDelete }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Staggered animation delay based on index
  const style = { animationDelay: `${index * 100}ms` };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!onDelete) return;
    try {
      setIsDeleting(true);
      await onDelete(project.id);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Failed to delete project:', error);
      alert('Failed to delete project. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Link
        to={`/project/${project.id}`}
        className="block group animate-fade-in-up"
        style={style}
      >
        <div className="relative bg-white/80 glass rounded-xl border border-slate-200 p-6 h-full flex flex-col transition-all duration-300 ease-out hover:-translate-y-2 hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-300 overflow-hidden">
        
        {/* Subtle gradient background on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-purple-50/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white group-hover:scale-110 transition-all duration-300 shadow-sm">
              <FolderGit2 size={24} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100/80 text-slate-600 border border-slate-100 group-hover:border-blue-200 transition-colors">
                {project.theme}
              </span>
              {onDelete && (
                <button
                  onClick={handleDeleteClick}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                  title="Delete project"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>
          
          <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors flex items-center gap-2">
            {project.name}
            <ArrowRight size={16} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-blue-400" />
          </h3>
          
          <p className="text-slate-500 text-sm mb-6 flex-grow line-clamp-3">
            {project.description}
          </p>
          
          <div className="flex items-center justify-between text-slate-400 text-sm pt-4 border-t border-slate-100 group-hover:border-blue-100 transition-colors">
              <div className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  <span>{new Date(project.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1.5">
                  <FileText size={14} />
                  <span>{project.artifacts.length} Items</span>
              </div>
          </div>
        </div>
      </div>
    </Link>

    {/* Delete Confirmation Dialog */}
    <ConfirmDialog
      isOpen={showDeleteConfirm}
      title="Delete Project"
      message={`Are you sure you want to delete "${project.name}"? This action cannot be undone and will also delete all associated artifacts.`}
      confirmText="Delete"
      cancelText="Cancel"
      isDangerous={true}
      isLoading={isDeleting}
      onConfirm={handleConfirmDelete}
      onCancel={() => setShowDeleteConfirm(false)}
    />
    </>
  );
};

export default ProjectCard;