import { supabase } from '../lib/supabase';

/**
 * 文件存储服务
 * 封装 Supabase Storage 的文件上传、下载、删除操作
 */

const BUCKET_NAME = 'research-files';

/**
 * 上传文件到 Supabase Storage
 * @param file 要上传的文件
 * @param path 存储路径（例如：'projects/project-id/filename.pdf'）
 * @returns 文件的公开 URL
 */
export const uploadFile = async (file: File, path: string): Promise<string> => {
  try {
    // 确定 Content-Type
    let contentType = file.type;

    // 如果文件类型为空或不正确，根据文件扩展名推断
    if (!contentType || contentType === 'application/octet-stream') {
      const ext = path.split('.').pop()?.toLowerCase();
      const mimeTypes: { [key: string]: string } = {
        'html': 'text/html; charset=utf-8',
        'htm': 'text/html; charset=utf-8',
        'pdf': 'application/pdf',
        'txt': 'text/plain; charset=utf-8',
        'md': 'text/markdown; charset=utf-8',
      };
      contentType = mimeTypes[ext || ''] || file.type || 'application/octet-stream';
    }

    // 仅在 HTML 文件时输出日志
    if (contentType.includes('html')) {
      console.log('📤 上传 HTML，Content-Type:', contentType);
    }

    // 上传文件
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false, // 如果文件已存在则报错
        contentType: contentType, // 明确指定 Content-Type
      });

    if (error) throw error;

    // 获取公开 URL
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

/**
 * 删除文件
 * @param path 文件路径
 */
export const deleteFile = async (path: string): Promise<void> => {
  try {
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([path]);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

/**
 * 获取文件的公开 URL
 * @param path 文件路径
 * @returns 文件的公开 URL
 */
export const getFileUrl = (path: string): string => {
  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(path);

  return data.publicUrl;
};

/**
 * 生成唯一的文件路径
 * @param projectId 项目 ID
 * @param fileName 原始文件名
 * @returns 唯一的存储路径
 */
export const generateFilePath = (projectId: string, fileName: string): string => {
  const timestamp = Date.now();
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `projects/${projectId}/${timestamp}-${sanitizedFileName}`;
};

/**
 * 从 URL 中提取文件路径
 * @param url 完整的文件 URL
 * @returns 文件路径，如果无法提取则返回 null
 */
export const extractPathFromUrl = (url: string): string | null => {
  try {
    // Supabase Storage URL 格式：
    // https://[project-ref].supabase.co/storage/v1/object/public/[bucket-name]/[path]
    const match = url.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)$/);
    return match ? match[1] : null;
  } catch (error) {
    console.error('Error extracting path from URL:', error);
    return null;
  }
};

/**
 * 列出项目的所有文件
 * @param projectId 项目 ID
 * @returns 文件列表
 */
export const listProjectFiles = async (projectId: string): Promise<string[]> => {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list(`projects/${projectId}`);

    if (error) throw error;
    if (!data) return [];

    return data.map(file => `projects/${projectId}/${file.name}`);
  } catch (error) {
    console.error('Error listing files:', error);
    throw error;
  }
};

