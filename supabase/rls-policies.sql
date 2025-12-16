-- Row Level Security (RLS) 策略
-- 为了简化演示，这里配置为允许所有操作
-- 在生产环境中，应该根据用户认证状态配置更严格的策略

-- 启用 RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE artifacts ENABLE ROW LEVEL SECURITY;

-- Projects 表策略
-- 允许所有人查看所有项目
CREATE POLICY "允许所有人查看项目"
    ON projects FOR SELECT
    USING (true);

-- 允许所有人插入项目（在生产环境中应该限制为已认证用户）
CREATE POLICY "允许所有人创建项目"
    ON projects FOR INSERT
    WITH CHECK (true);

-- 允许所有人更新项目
CREATE POLICY "允许所有人更新项目"
    ON projects FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- 允许所有人删除项目
CREATE POLICY "允许所有人删除项目"
    ON projects FOR DELETE
    USING (true);

-- Artifacts 表策略
-- 允许所有人查看所有文档
CREATE POLICY "允许所有人查看文档"
    ON artifacts FOR SELECT
    USING (true);

-- 允许所有人插入文档
CREATE POLICY "允许所有人创建文档"
    ON artifacts FOR INSERT
    WITH CHECK (true);

-- 允许所有人更新文档
CREATE POLICY "允许所有人更新文档"
    ON artifacts FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- 允许所有人删除文档
CREATE POLICY "允许所有人删除文档"
    ON artifacts FOR DELETE
    USING (true);

-- 注意：在生产环境中，建议使用以下策略替代上述策略：
-- 
-- 1. 添加用户认证
-- 2. 在 projects 表添加 user_id 字段
-- 3. 使用如下策略：
--
-- CREATE POLICY "用户只能查看自己的项目"
--     ON projects FOR SELECT
--     USING (auth.uid() = user_id);
--
-- CREATE POLICY "用户只能创建自己的项目"
--     ON projects FOR INSERT
--     WITH CHECK (auth.uid() = user_id);
--
-- 等等...

