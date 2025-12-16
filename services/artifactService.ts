import { supabase } from '../lib/supabase';
import { Artifact, ArtifactType } from '../types';
import { deleteFile, extractPathFromUrl } from './storageService';

/**
 * Artifact 数据库服务
 * 封装所有与 artifacts 表相关的 CRUD 操作
 */

// 创建新的 artifact
export const createArtifact = async (artifact: Omit<Artifact, 'id'>): Promise<Artifact> => {
  try {
    const { data, error } = await supabase
      .from('artifacts')
      .insert({
        project_id: artifact.projectId,
        type: artifact.type,
        title: artifact.title,
        description: artifact.description,
        date: artifact.date,
        url: artifact.url || null,
        content: artifact.content || null,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      projectId: data.project_id,
      type: data.type as ArtifactType,
      title: data.title,
      description: data.description,
      date: data.date,
      url: data.url || '',
      content: data.content || undefined,
    };
  } catch (error) {
    console.error('Error creating artifact:', error);
    throw error;
  }
};

// 获取项目的所有 artifacts
export const getArtifactsByProjectId = async (projectId: string): Promise<Artifact[]> => {
  try {
    const { data, error } = await supabase
      .from('artifacts')
      .select('*')
      .eq('project_id', projectId)
      .order('date', { ascending: true });

    if (error) throw error;
    if (!data) return [];

    return data.map(artifact => ({
      id: artifact.id,
      projectId: artifact.project_id,
      type: artifact.type as ArtifactType,
      title: artifact.title,
      description: artifact.description,
      date: artifact.date,
      url: artifact.url || '',
      content: artifact.content || undefined,
    }));
  } catch (error) {
    console.error('Error fetching artifacts:', error);
    throw error;
  }
};

// 更新 artifact
export const updateArtifact = async (id: string, updates: Partial<Omit<Artifact, 'id' | 'projectId'>>): Promise<void> => {
  try {
    const { error } = await supabase
      .from('artifacts')
      .update({
        type: updates.type,
        title: updates.title,
        description: updates.description,
        date: updates.date,
        url: updates.url || null,
        content: updates.content || null,
      })
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating artifact:', error);
    throw error;
  }
};

// 删除 artifact
export const deleteArtifact = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('artifacts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting artifact:', error);
    throw error;
  }
};

// 删除 artifact 及其关联的存储文件
export const deleteArtifactWithFile = async (artifact: Artifact): Promise<void> => {
  try {
    // 如果是 PDF 或 HTML 类型，需要删除存储的文件
    if ((artifact.type === ArtifactType.PDF || artifact.type === ArtifactType.HTML) && artifact.url) {
      const filePath = extractPathFromUrl(artifact.url);
      if (filePath) {
        try {
          await deleteFile(filePath);
        } catch (storageError) {
          console.warn('Warning: Failed to delete file from storage, but continuing with database deletion:', storageError);
          // 继续删除数据库记录，即使文件删除失败
        }
      }
    }

    // 删除数据库记录
    await deleteArtifact(artifact.id);
  } catch (error) {
    console.error('Error deleting artifact with file:', error);
    throw error;
  }
};

