import { createClient } from '@supabase/supabase-js';

// Supabase 配置
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials are missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
}

// 创建 Supabase 客户端
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 数据库类型定义
export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          name: string;
          theme: string;
          description: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          theme: string;
          description: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          theme?: string;
          description?: string;
          created_at?: string;
        };
      };
      artifacts: {
        Row: {
          id: string;
          project_id: string;
          type: string;
          title: string;
          description: string;
          date: string;
          url: string | null;
          content: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          type: string;
          title: string;
          description: string;
          date: string;
          url?: string | null;
          content?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          type?: string;
          title?: string;
          description?: string;
          date?: string;
          url?: string | null;
          content?: string | null;
          created_at?: string;
        };
      };
    };
  };
}

