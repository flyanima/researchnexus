import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Project, Artifact, ArtifactType } from '../types';
import TimelineChart from '../components/TimelineChart';
import ArtifactViewer from '../components/ArtifactViewer';
import ConfirmDialog from '../components/ConfirmDialog';
import { Plus, FileText, FileCode, FileType, Upload, Sparkles, ArrowLeft, Trash2 } from 'lucide-react';
import { generateSummary } from '../services/geminiService';
import { createArtifact, deleteArtifactWithFile } from '../services/artifactService';
import { uploadFile, generateFilePath } from '../services/storageService';

interface ProjectDetailProps {
  projects: Project[];
  onUpdateProject: (project: Project) => void;
  onRefresh: () => Promise<void>;
  onDeleteProject?: (projectId: string) => Promise<void>;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ projects, onUpdateProject, onRefresh, onDeleteProject }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const project = projects.find(p => p.id === id);

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Upload Form State
  const [newArtifactType, setNewArtifactType] = useState<ArtifactType>(ArtifactType.MARKDOWN);
  const [newArtifactTitle, setNewArtifactTitle] = useState('');
  const [newArtifactDesc, setNewArtifactDesc] = useState('');
  const [newArtifactContent, setNewArtifactContent] = useState(''); // For MD
  const [newArtifactFile, setNewArtifactFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!project) {
    return (
        <div className="p-20 text-center animate-fade-in-up">
            <h2 className="text-2xl font-bold text-slate-700">Project Not Found</h2>
            <button onClick={() => navigate('/')} className="mt-4 text-blue-600 underline hover:text-blue-800">Return Home</button>
        </div>
    );
  }

  const handleGeminiSummary = async () => {
    if (newArtifactType === ArtifactType.MARKDOWN && newArtifactContent) {
        setUploadLoading(true);
        const summary = await generateSummary(newArtifactContent);
        setNewArtifactDesc(summary);
        setUploadLoading(false);
    } else {
        alert("Please enter Markdown content first.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        setNewArtifactFile(e.target.files[0]);
    }
  };

  const handleAddArtifact = async () => {
    if (!newArtifactTitle) {
        alert("Title is required");
        return;
    }

    if (newArtifactType !== ArtifactType.MARKDOWN && !newArtifactFile) {
        alert("Please select a file");
        return;
    }

    try {
        setIsSubmitting(true);
        let fileUrl = '';

        // 如果是文件类型（PDF 或 HTML），上传到 Supabase Storage
        let htmlContent: string | undefined = undefined;
        if (newArtifactType !== ArtifactType.MARKDOWN && newArtifactFile) {
            const filePath = generateFilePath(project.id, newArtifactFile.name);
            fileUrl = await uploadFile(newArtifactFile, filePath);

            // 对于 HTML 文件，同时读取内容存储到数据库
            if (newArtifactType === ArtifactType.HTML) {
                htmlContent = await newArtifactFile.text();
                console.log('✅ HTML 文件上传成功，已读取内容用于渲染');
            }
        }

        // 创建 artifact 记录
        const newArtifact = await createArtifact({
            projectId: project.id,
            type: newArtifactType,
            title: newArtifactTitle,
            description: newArtifactDesc,
            date: new Date().toISOString(),
            url: fileUrl,
            content: newArtifactType === ArtifactType.MARKDOWN ? newArtifactContent : htmlContent
        });

        // 更新本地状态
        const updatedProject = {
            ...project,
            artifacts: [...project.artifacts, newArtifact]
        };

        onUpdateProject(updatedProject);

        // 刷新数据以确保同步
        await onRefresh();

        setIsUploadOpen(false);
        resetForm();
    } catch (error) {
        console.error('Failed to add artifact:', error);
        alert('Failed to add artifact. Please try again.');
    } finally {
        setIsSubmitting(false);
    }
  };

  const resetForm = () => {
      setNewArtifactTitle('');
      setNewArtifactDesc('');
      setNewArtifactContent('');
      setNewArtifactFile(null);
  };

  const handleDeleteProject = async () => {
    if (!onDeleteProject || !project) return;
    try {
      setIsDeleting(true);
      await onDeleteProject(project.id);
      navigate('/');
    } catch (error) {
      console.error('Failed to delete project:', error);
      alert('Failed to delete project. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteArtifact = async (artifactId: string) => {
    const artifact = project?.artifacts.find(a => a.id === artifactId);
    if (!artifact) return;

    try {
      await deleteArtifactWithFile(artifact);
      // Update project state by removing the deleted artifact
      if (project) {
        const updatedProject = {
          ...project,
          artifacts: project.artifacts.filter(a => a.id !== artifactId),
        };
        onUpdateProject(updatedProject);
      }
      setSelectedArtifact(null);
    } catch (error) {
      console.error('Failed to delete artifact:', error);
      alert('Failed to delete artifact. Please try again.');
    }
  };

  const getIcon = (type: ArtifactType) => {
      switch(type) {
          case ArtifactType.PDF: return <FileType className="text-red-500" />;
          case ArtifactType.HTML: return <FileCode className="text-blue-500" />;
          case ArtifactType.MARKDOWN: return <FileText className="text-green-500" />;
      }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-8 min-h-screen pb-20">
      <button 
        onClick={() => navigate('/')}
        className="group flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-6 transition-colors animate-fade-in-up"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        Back to Projects
      </button>

      {/* Header */}
      <div className="mb-10 border-b border-slate-200 pb-8 animate-fade-in-up" style={{animationDelay: '100ms'}}>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div>
                <div className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold tracking-wide uppercase mb-3 shadow-sm">
                    {project.theme}
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 leading-tight">{project.name}</h1>
                <p className="text-slate-600 text-lg max-w-3xl leading-relaxed">{project.description}</p>
            </div>
            <div className="flex gap-3 self-start flex-col sm:flex-row">
              <button
                  onClick={() => setIsUploadOpen(true)}
                  className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-medium transition-all hover:shadow-lg hover:shadow-slate-900/30 active:scale-95 whitespace-nowrap"
              >
                  <Plus size={20} />
                  <span>Add Artifact</span>
              </button>
              {onDeleteProject && (
                <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-6 py-3 rounded-xl font-medium transition-all hover:shadow-lg hover:shadow-red-600/20 active:scale-95 whitespace-nowrap border border-red-200"
                >
                    <Trash2 size={20} />
                    <span>Delete</span>
                </button>
              )}
            </div>
        </div>
        <div className="mt-6 flex gap-6 text-sm text-slate-500 font-medium">
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Created {new Date(project.createdAt).toLocaleDateString()}</span>
            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span> {project.artifacts.length} Findings</span>
        </div>
      </div>

      {/* Timeline Visualization */}
      <div className="mb-12 animate-fade-in-up" style={{animationDelay: '200ms'}}>
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
            Timeline
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">Interactive</span>
        </h2>
        <div className="bg-white/80 glass p-6 rounded-2xl shadow-sm border border-slate-200 backdrop-blur-sm">
            {project.artifacts.length > 0 ? (
                <TimelineChart artifacts={project.artifacts} onArtifactClick={setSelectedArtifact} />
            ) : (
                <div className="h-32 flex items-center justify-center text-slate-400 italic">
                    Add your first artifact to see the timeline grow.
                </div>
            )}
        </div>
      </div>

      {/* Artifacts List Grid */}
      <div className="animate-fade-in-up" style={{animationDelay: '300ms'}}>
        <h2 className="text-xl font-bold text-slate-800 mb-6">All Research Outcomes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {project.artifacts.map((artifact, idx) => (
                <div
                    key={artifact.id}
                    className="group bg-white rounded-xl p-5 border border-slate-200 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 flex flex-col hover:-translate-y-1 relative"
                    style={{animationDelay: `${idx * 100}ms`}} // Stagger effect
                >
                    {/* Delete button - top right corner */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteArtifact(artifact.id);
                      }}
                      className="absolute top-3 right-3 p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      title="Delete artifact"
                    >
                      <Trash2 size={16} />
                    </button>

                    <div
                      onClick={() => setSelectedArtifact(artifact)}
                      className="cursor-pointer flex-1 flex flex-col"
                    >
                      <div className="flex items-start gap-3 mb-4">
                          <div className="p-2.5 bg-slate-50 rounded-lg group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors flex-shrink-0">
                              {getIcon(artifact.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded inline-block">{new Date(artifact.date).toLocaleDateString()}</span>
                          </div>
                      </div>
                      <h3 className="font-bold text-lg text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">{artifact.title}</h3>
                      <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">{artifact.description}</p>
                      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          <span>{artifact.type}</span>
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-500 flex items-center gap-1">View <ArrowLeft className="rotate-180" size={12}/></span>
                      </div>
                    </div>
                </div>
            ))}
            
            {/* Create New Card */}
            <button 
                onClick={() => setIsUploadOpen(true)}
                className="group border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-300 min-h-[200px]"
            >
                <div className="p-4 rounded-full bg-slate-50 group-hover:bg-blue-100 mb-3 transition-colors">
                    <Plus size={32} className="group-hover:scale-110 transition-transform" />
                </div>
                <span className="font-semibold text-lg">Add New Finding</span>
            </button>
        </div>
      </div>

      {/* Artifact Viewer Modal */}
      {selectedArtifact && (
        <ArtifactViewer
          artifact={selectedArtifact}
          onClose={() => setSelectedArtifact(null)}
          onDelete={handleDeleteArtifact}
        />
      )}

      {/* Upload/Create Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
             <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out_forwards]" onClick={() => setIsUploadOpen(false)} />
             
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden relative z-10 animate-scale-in">
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
                    <h3 className="font-bold text-lg text-slate-800">Add Research Artifact</h3>
                    <button onClick={() => setIsUploadOpen(false)} className="p-1 rounded-full hover:bg-slate-200 transition-colors">
                        <Plus size={24} className="rotate-45 text-slate-500" />
                    </button>
                </div>
                
                <div className="p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Artifact Type</label>
                        <div className="grid grid-cols-3 gap-3">
                            {[ArtifactType.MARKDOWN, ArtifactType.HTML, ArtifactType.PDF].map(type => (
                                <button
                                    key={type}
                                    onClick={() => setNewArtifactType(type)}
                                    className={`py-2.5 text-sm font-semibold rounded-xl border transition-all ${
                                        newArtifactType === type 
                                        ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm' 
                                        : 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                                    }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Title</label>
                        <input 
                            type="text" 
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            value={newArtifactTitle}
                            onChange={e => setNewArtifactTitle(e.target.value)}
                            placeholder="e.g. Experiment Results Phase 1"
                        />
                    </div>

                    {newArtifactType === ArtifactType.MARKDOWN ? (
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Content (Markdown)</label>
                            <textarea 
                                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-mono text-sm h-36 resize-none"
                                value={newArtifactContent}
                                onChange={e => setNewArtifactContent(e.target.value)}
                                placeholder="# Heading..."
                            />
                             <div className="mt-2 flex justify-end">
                                <button 
                                    onClick={handleGeminiSummary}
                                    disabled={uploadLoading || !newArtifactContent}
                                    className="flex items-center gap-1.5 text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1.5 rounded-full hover:bg-purple-100 disabled:opacity-50 transition-colors"
                                >
                                    <Sparkles size={14} />
                                    {uploadLoading ? 'Generating...' : 'Auto-Generate Description'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">File Upload</label>
                            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 hover:border-blue-400 transition-all relative group cursor-pointer">
                                <input 
                                    type="file" 
                                    accept={newArtifactType === ArtifactType.PDF ? ".pdf" : ".html"}
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                />
                                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform text-slate-400 group-hover:text-blue-500">
                                    <Upload size={20} />
                                </div>
                                <p className="text-sm font-medium text-slate-600 group-hover:text-blue-600">
                                    {newArtifactFile ? newArtifactFile.name : `Click to upload ${newArtifactType} file`}
                                </p>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
                        <textarea 
                            className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm h-24 resize-none"
                            value={newArtifactDesc}
                            onChange={e => setNewArtifactDesc(e.target.value)}
                            placeholder="Brief description of findings..."
                        />
                    </div>
                </div>

                <div className="px-6 py-4 bg-slate-50 flex justify-end gap-3 border-t border-slate-100">
                    <button
                        onClick={() => setIsUploadOpen(false)}
                        disabled={isSubmitting}
                        className="px-5 py-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleAddArtifact}
                        disabled={isSubmitting}
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-lg shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Saving...
                            </>
                        ) : (
                            'Save Outcome'
                        )}
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Project"
        message={`Are you sure you want to delete "${project?.name}"? This action cannot be undone and will also delete all associated artifacts.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous={true}
        isLoading={isDeleting}
        onConfirm={handleDeleteProject}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};

export default ProjectDetail;