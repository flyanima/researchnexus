import { supabase } from '../lib/supabase';

export interface Theme {
  id: string;
  name: string;
  description: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 获取所有类目
 */
export const getAllThemes = async (): Promise<Theme[]> => {
  try {
    const { data, error } = await supabase
      .from('themes')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;

    return (data || []).map(theme => ({
      id: theme.id,
      name: theme.name,
      description: theme.description,
      color: theme.color,
      createdAt: theme.created_at,
      updatedAt: theme.updated_at,
    }));
  } catch (error) {
    console.error('Error fetching themes:', error);
    throw error;
  }
};

/**
 * 创建新类目
 */
export const createTheme = async (
  name: string,
  description: string = '',
  color: string = '#3b82f6'
): Promise<Theme> => {
  try {
    const { data, error } = await supabase
      .from('themes')
      .insert([
        {
          name,
          description,
          color,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      color: data.color,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  } catch (error) {
    console.error('Error creating theme:', error);
    throw error;
  }
};

/**
 * 更新类目
 */
export const updateTheme = async (
  id: string,
  updates: Partial<Omit<Theme, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<Theme> => {
  try {
    const { data, error } = await supabase
      .from('themes')
      .update({
        ...(updates.name && { name: updates.name }),
        ...(updates.description !== undefined && { description: updates.description }),
        ...(updates.color && { color: updates.color }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      color: data.color,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  } catch (error) {
    console.error('Error updating theme:', error);
    throw error;
  }
};

/**
 * 删除类目
 */
export const deleteTheme = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('themes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting theme:', error);
    throw error;
  }
};

/**
 * 检查类目是否被使用
 */
export const isThemeInUse = async (themeName: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('id')
      .eq('theme', themeName)
      .limit(1);

    if (error) throw error;

    return (data || []).length > 0;
  } catch (error) {
    console.error('Error checking theme usage:', error);
    throw error;
  }
};

