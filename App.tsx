import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { LayoutDashboard, Plus, Search, Layers } from 'lucide-react';
import { Project } from './types';
import { getAllProjects, createProject, deleteProject } from './services/projectService';
import { getAllThemes, createTheme, updateTheme, deleteTheme } from './services/themeService';
import { Theme } from './services/themeService';
import ProjectDetail from './pages/ProjectDetail';
import ProjectCard from './components/ProjectCard';
import ThemeSelector from './components/ThemeSelector';

// -- Home Page Component --
const Home = ({ projects, onCreateProject, onDeleteProject, loading }: {
    projects: Project[],
    onCreateProject: (p: Omit<Project, 'id' | 'artifacts'>) => Promise<void>,
    onDeleteProject: (projectId: string) => Promise<void>,
    loading: boolean
}) => {
    const [filter, setFilter] = useState('');
    const [activeTheme, setActiveTheme] = useState('All');
    const [themes, setThemes] = useState<Theme[]>([]);
    const [themesLoading, setThemesLoading] = useState(true);

    // Load themes on mount
    useEffect(() => {
        loadThemes();
    }, []);

    const loadThemes = async () => {
        try {
            setThemesLoading(true);
            const data = await getAllThemes();
            setThemes(data);
        } catch (error) {
            console.error('Failed to load themes:', error);
        } finally {
            setThemesLoading(false);
        }
    };

    const handleAddTheme = async (name: string, color: string) => {
        try {
            const newTheme = await createTheme(name, '', color);
            setThemes([...themes, newTheme]);
        } catch (error) {
            console.error('Failed to add theme:', error);
            throw error;
        }
    };

    const handleUpdateTheme = async (id: string, name: string, color: string) => {
        try {
            const updated = await updateTheme(id, { name, color });
            setThemes(themes.map(t => t.id === id ? updated : t));
        } catch (error) {
            console.error('Failed to update theme:', error);
            throw error;
        }
    };

    const handleDeleteTheme = async (id: string) => {
        try {
            await deleteTheme(id);
            setThemes(themes.filter(t => t.id !== id));
        } catch (error) {
            console.error('Failed to delete theme:', error);
            throw error;
        }
    };

    const filteredProjects = projects.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(filter.toLowerCase()) || p.description.toLowerCase().includes(filter.toLowerCase());
        const matchesTheme = activeTheme === 'All' || p.theme === activeTheme;
        return matchesSearch && matchesTheme;
    });

    const handleCreateClick = async () => {
        const name = prompt("Enter Project Name:");
        if(!name) return;
        const theme = prompt("Enter Project Theme (e.g., Physics, AI, Biology):") || "General";
        const desc = prompt("Enter Project Description:");

        const newProject = {
            name,
            theme,
            description: desc || '',
            createdAt: new Date().toISOString(),
        };
        await onCreateProject(newProject);
    };

    return (
        <div className="p-8 max-w-7xl mx-auto min-h-screen">
            <header className="mb-10 animate-fade-in-up">
                <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-700 mb-2">Research Nexus</h1>
                <p className="text-slate-500 text-lg">Manage and visualize your research outcomes by theme and timeline.</p>
            </header>

            {/* Unified toolbar section with glass effect */}
            <div className="mb-8 animate-fade-in-up" style={{animationDelay: '100ms'}}>
                <div className="bg-white/60 glass rounded-2xl border border-slate-200/50 p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                    {/* Desktop layout: horizontal with flex */}
                    <div className="hidden md:flex items-center gap-4">
                        {/* Theme selector - flex with max width and scroll */}
                        <div className="flex-1 min-w-0">
                            <div className="overflow-x-auto no-scrollbar">
                                <ThemeSelector
                                    themes={themes}
                                    activeTheme={activeTheme}
                                    onSelectTheme={setActiveTheme}
                                    onAddTheme={handleAddTheme}
                                    onUpdateTheme={handleUpdateTheme}
                                    onDeleteTheme={handleDeleteTheme}
                                    loading={themesLoading}
                                />
                            </div>
                        </div>

                        {/* Vertical divider */}
                        <div className="h-8 w-px bg-gradient-to-b from-slate-200/0 via-slate-200 to-slate-200/0" />

                        {/* Search and create section - fixed width */}
                        <div className="flex gap-3 flex-shrink-0">
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search projects..."
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                    className="w-56 pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white/80 glass focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all shadow-sm focus:shadow-md"
                                />
                            </div>
                            <button
                                onClick={handleCreateClick}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl font-medium transition-all hover:shadow-lg hover:shadow-blue-600/30 active:scale-95 flex-shrink-0 whitespace-nowrap"
                            >
                                <Plus size={18} />
                                New Project
                            </button>
                        </div>
                    </div>

                    {/* Mobile layout: vertical stack */}
                    <div className="md:hidden space-y-4">
                        {/* Theme selector */}
                        <div className="overflow-x-auto -mx-4 px-4 no-scrollbar">
                            <ThemeSelector
                                themes={themes}
                                activeTheme={activeTheme}
                                onSelectTheme={setActiveTheme}
                                onAddTheme={handleAddTheme}
                                onUpdateTheme={handleUpdateTheme}
                                onDeleteTheme={handleDeleteTheme}
                                loading={themesLoading}
                            />
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-gradient-to-r from-slate-200/0 via-slate-200 to-slate-200/0" />

                        {/* Search and create section */}
                        <div className="flex gap-3 flex-col sm:flex-row">
                            <div className="relative flex-1 group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search projects..."
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white/80 glass focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all shadow-sm focus:shadow-md"
                                />
                            </div>
                            <button
                                onClick={handleCreateClick}
                                className="flex items-center justify-center sm:justify-start gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl font-medium transition-all hover:shadow-lg hover:shadow-blue-600/30 active:scale-95 flex-shrink-0 whitespace-nowrap"
                            >
                                <Plus size={18} />
                                <span className="hidden sm:inline">New Project</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                        {filteredProjects.map((project, index) => (
                           <ProjectCard
                             key={project.id}
                             project={project}
                             index={index}
                             onDelete={onDeleteProject}
                           />
                        ))}
                    </div>

                    {filteredProjects.length === 0 && (
                        <div className="text-center py-20 bg-white/50 glass rounded-2xl border border-dashed border-slate-300 animate-scale-in">
                            <Layers className="mx-auto text-slate-300 mb-4" size={48} />
                            <h3 className="text-lg font-medium text-slate-600">No projects found</h3>
                            <p className="text-slate-400">Try adjusting your filters or create a new project.</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

const App = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // 从 Supabase 加载项目
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await getAllProjects();
      setProjects(data);
    } catch (error) {
      console.error('Failed to load projects:', error);
      alert('Failed to load projects. Please check your Supabase configuration.');
    } finally {
      setLoading(false);
    }
  };

  const addProject = async (projectData: Omit<Project, 'id' | 'artifacts'>) => {
    try {
      const newProject = await createProject(projectData);
      setProjects([newProject, ...projects]);
    } catch (error) {
      console.error('Failed to create project:', error);
      alert('Failed to create project. Please try again.');
    }
  };

  const removeProject = async (projectId: string) => {
    try {
      await deleteProject(projectId);
      setProjects(projects.filter(p => p.id !== projectId));
    } catch (error) {
      console.error('Failed to delete project:', error);
      alert('Failed to delete project. Please try again.');
    }
  };

  const updateProject = (updatedProject: Project) => {
    setProjects(projects.map(p => p.id === updatedProject.id ? updatedProject : p));
  };

  return (
    <Router>
        <div className="min-h-screen text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
            <nav className="h-16 bg-white/80 glass border-b border-slate-200/50 backdrop-blur-md fixed top-0 w-full z-50 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 font-bold text-xl text-slate-800 hover:opacity-80 transition-opacity">
                        <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-lg flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                            <Layers size={18} />
                        </div>
                        ResearchNexus
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link to="/" className="text-slate-600 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-all">
                            <LayoutDashboard size={20} />
                        </Link>
                    </div>
                </div>
            </nav>

            <div className="pt-16">
                <Routes>
                    <Route path="/" element={<Home projects={projects} onCreateProject={addProject} onDeleteProject={removeProject} loading={loading} />} />
                    <Route
                        path="/project/:id"
                        element={<ProjectDetail projects={projects} onUpdateProject={updateProject} onRefresh={loadProjects} onDeleteProject={removeProject} />}
                    />
                </Routes>
            </div>
        </div>
    </Router>
  );
};

export default App;