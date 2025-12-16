-- ResearchNexus 数据库架构
-- 此文件包含创建表、索引和关系的 SQL 语句

-- 启用 UUID 扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 创建 projects 表
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    theme TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 创建 artifacts 表
CREATE TABLE IF NOT EXISTS artifacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('HTML', 'PDF', 'MARKDOWN')),
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    date TIMESTAMPTZ NOT NULL,
    url TEXT,
    content TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_artifacts_project_id ON artifacts(project_id);
CREATE INDEX IF NOT EXISTS idx_artifacts_date ON artifacts(date);
CREATE INDEX IF NOT EXISTS idx_projects_theme ON projects(theme);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);

-- 创建 themes 表（用于管理自定义类目）
CREATE TABLE IF NOT EXISTS themes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT DEFAULT '',
    color TEXT DEFAULT '#3b82f6',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_themes_name ON themes(name);

-- 添加注释
COMMENT ON TABLE projects IS '研究项目表';
COMMENT ON TABLE artifacts IS '研究成果/文档表';
COMMENT ON TABLE themes IS '自定义类目/主题表';
COMMENT ON COLUMN artifacts.type IS '文档类型: HTML, PDF, 或 MARKDOWN';
COMMENT ON COLUMN artifacts.url IS '文件 URL（用于 PDF 和 HTML）';
COMMENT ON COLUMN artifacts.content IS 'Markdown 内容（仅用于 MARKDOWN 类型）';
COMMENT ON COLUMN themes.color IS '类目的颜色代码（用于UI展示）';

