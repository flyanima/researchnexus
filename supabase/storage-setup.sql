-- Storage Bucket 配置
-- 创建用于存储研究文档的存储桶

-- 注意：此 SQL 仅用于文档说明
-- 实际的 Storage Bucket 需要通过 Supabase Dashboard 或 API 创建

-- 创建 research-files 存储桶的步骤：
-- 1. 登录 Supabase Dashboard
-- 2. 进入 Storage 部分
-- 3. 创建新的 bucket，名称为 'research-files'
-- 4. 配置为 Public bucket（允许公开访问）或 Private（需要认证）

-- Storage 策略（通过 Dashboard 或 API 配置）
-- 
-- Bucket 名称: research-files
-- Public: true (允许公开访问上传的文件)
-- File size limit: 50MB
-- Allowed MIME types: 
--   - application/pdf
--   - text/html
--   - text/markdown
--   - text/plain

-- 如果使用 Supabase CLI，可以使用以下命令：
-- supabase storage create research-files --public

-- RLS 策略示例（允许所有人上传和访问）：
-- 
-- CREATE POLICY "允许所有人上传文件"
--     ON storage.objects FOR INSERT
--     WITH CHECK (bucket_id = 'research-files');
--
-- CREATE POLICY "允许所有人查看文件"
--     ON storage.objects FOR SELECT
--     USING (bucket_id = 'research-files');
--
-- CREATE POLICY "允许所有人删除文件"
--     ON storage.objects FOR DELETE
--     USING (bucket_id = 'research-files');

