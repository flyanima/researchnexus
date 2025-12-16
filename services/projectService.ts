import { supabase } from '../lib/supabase';
import { Project, Artifact, ArtifactType } from '../types';

/**
 * 项目数据库服务
 * 封装所有与 projects 表相关的 CRUD 操作
 */

// 获取所有项目（包含关联的 artifacts）
export const getAllProjects = async (): Promise<Project[]> => {
  try {
    // 获取所有项目
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (projectsError) throw projectsError;
    if (!projects) return [];

    // 获取所有 artifacts
    const { data: artifacts, error: artifactsError } = await supabase
      .from('artifacts')
      .select('*')
      .order('date', { ascending: true });

    if (artifactsError) throw artifactsError;

    // 组合数据
    const projectsWithArtifacts: Project[] = projects.map(project => ({
      id: project.id,
      name: project.name,
      theme: project.theme,
      description: project.description,
      createdAt: project.created_at,
      artifacts: (artifacts || [])
        .filter(artifact => artifact.project_id === project.id)
        .map(artifact => ({
          id: artifact.id,
          projectId: artifact.project_id,
          type: artifact.type as ArtifactType,
          title: artifact.title,
          description: artifact.description,
          date: artifact.date,
          url: artifact.url || '',
          content: artifact.content || undefined,
        })),
    }));

    return projectsWithArtifacts;
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
};

// 根据 ID 获取单个项目
export const getProjectById = async (id: string): Promise<Project | null> => {
  try {
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (projectError) throw projectError;
    if (!project) return null;

    const { data: artifacts, error: artifactsError } = await supabase
      .from('artifacts')
      .select('*')
      .eq('project_id', id)
      .order('date', { ascending: true });

    if (artifactsError) throw artifactsError;

    return {
      id: project.id,
      name: project.name,
      theme: project.theme,
      description: project.description,
      createdAt: project.created_at,
      artifacts: (artifacts || []).map(artifact => ({
        id: artifact.id,
        projectId: artifact.project_id,
        type: artifact.type as ArtifactType,
        title: artifact.title,
        description: artifact.description,
        date: artifact.date,
        url: artifact.url || '',
        content: artifact.content || undefined,
      })),
    };
  } catch (error) {
    console.error('Error fetching project:', error);
    throw error;
  }
};

// 创建新项目
export const createProject = async (project: Omit<Project, 'id' | 'artifacts'>): Promise<Project> => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .insert({
        name: project.name,
        theme: project.theme,
        description: project.description,
        created_at: project.createdAt,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      theme: data.theme,
      description: data.description,
      createdAt: data.created_at,
      artifacts: [],
    };
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
};

// 更新项目
export const updateProject = async (id: string, updates: Partial<Omit<Project, 'id' | 'artifacts'>>): Promise<void> => {
  try {
    const { error } = await supabase
      .from('projects')
      .update({
        name: updates.name,
        theme: updates.theme,
        description: updates.description,
      })
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating project:', error);
    throw error;
  }
};

// 删除项目（会级联删除关联的 artifacts）
export const deleteProject = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
};

