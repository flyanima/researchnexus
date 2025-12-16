# Supabase 集成设置指南

本指南将帮助你为 ResearchNexus 项目配置 Supabase 后端。

## 📋 前置要求

- Node.js 已安装
- Supabase 账户（免费）：https://supabase.com

## 🚀 快速开始

### 1. 创建 Supabase 项目

1. 访问 [Supabase Dashboard](https://app.supabase.com)
2. 点击 "New Project"
3. 填写项目信息：
   - **Name**: ResearchNexus（或你喜欢的名称）
   - **Database Password**: 设置一个强密码（请保存好）
   - **Region**: 选择离你最近的区域
4. 点击 "Create new project"，等待项目初始化（约 2 分钟）

### 2. 配置数据库

#### 方法 A：使用 SQL 编辑器（推荐）

1. 在 Supabase Dashboard 中，点击左侧菜单的 **SQL Editor**
2. 点击 "New query"
3. 复制并粘贴 `supabase/schema.sql` 的内容
4. 点击 "Run" 执行 SQL
5. 重复以上步骤，执行 `supabase/rls-policies.sql`

#### 方法 B：使用 Supabase CLI

```bash
# 安装 Supabase CLI
npm install -g supabase

# 登录
supabase login

# 链接到你的项目
supabase link --project-ref your-project-ref

# 执行迁移
supabase db push
```

### 3. 配置 Storage Bucket

1. 在 Supabase Dashboard 中，点击左侧菜单的 **Storage**
2. 点击 "Create a new bucket"
3. 配置如下：
   - **Name**: `research-files`
   - **Public bucket**: ✅ 勾选（允许公开访问）
4. 点击 "Create bucket"

#### 配置 Storage 策略

1. 点击刚创建的 `research-files` bucket
2. 点击 "Policies" 标签
3. 点击 "New Policy"
4. 选择 "For full customization"
5. 添加以下策略：

**允许所有人上传文件：**
```sql
CREATE POLICY "允许所有人上传文件"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'research-files');
```

**允许所有人查看文件：**
```sql
CREATE POLICY "允许所有人查看文件"
ON storage.objects FOR SELECT
USING (bucket_id = 'research-files');
```

**允许所有人删除文件：**
```sql
CREATE POLICY "允许所有人删除文件"
ON storage.objects FOR DELETE
USING (bucket_id = 'research-files');
```

### 4. 获取 API 凭证

1. 在 Supabase Dashboard 中，点击左侧菜单的 **Settings** (齿轮图标)
2. 点击 **API**
3. 找到以下信息：
   - **Project URL**: 类似 `https://xxxxx.supabase.co`
   - **anon public**: 公开的匿名密钥

### 5. 配置环境变量

1. 在项目根目录创建 `.env.local` 文件（如果不存在）
2. 添加以下内容：

```env
# Gemini API Key (已有)
GEMINI_API_KEY=your_gemini_api_key_here

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

3. 将 `your-project-ref` 和 `your-anon-key-here` 替换为你的实际值

### 6. 运行应用

```bash
# 安装依赖（如果还没安装）
npm install

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000，你应该能看到应用正常运行！

## 📊 数据库结构

### Projects 表
- `id` (UUID): 主键
- `name` (TEXT): 项目名称
- `theme` (TEXT): 项目主题
- `description` (TEXT): 项目描述
- `created_at` (TIMESTAMPTZ): 创建时间

### Artifacts 表
- `id` (UUID): 主键
- `project_id` (UUID): 外键，关联到 projects
- `type` (TEXT): 类型（HTML, PDF, MARKDOWN）
- `title` (TEXT): 标题
- `description` (TEXT): 描述
- `date` (TIMESTAMPTZ): 日期
- `url` (TEXT): 文件 URL（可选）
- `content` (TEXT): Markdown 内容（可选）
- `created_at` (TIMESTAMPTZ): 创建时间

## 🔒 安全注意事项

**当前配置**：为了简化演示，RLS 策略允许所有人访问所有数据。

**生产环境建议**：
1. 启用 Supabase Authentication
2. 在 projects 表添加 `user_id` 字段
3. 更新 RLS 策略，限制用户只能访问自己的数据
4. 参考 `supabase/rls-policies.sql` 中的注释

## 🧪 测试数据

如果你想添加一些测试数据，可以在 SQL Editor 中运行：

```sql
-- 插入示例项目
INSERT INTO projects (name, theme, description) VALUES
('Quantum Computing Algorithms', 'Physics', 'Exploration of new algorithms for error correction in quantum circuits.'),
('Sustainable Urban Planning', 'Architecture', 'Designing self-sustaining modular housing units for high-density cities.');
```

## 🆘 故障排除

### 问题：应用显示 "Failed to load projects"
- 检查 `.env.local` 文件中的 Supabase 凭证是否正确
- 确保数据库表已正确创建
- 检查浏览器控制台的错误信息

### 问题：文件上传失败
- 确保 Storage bucket `research-files` 已创建
- 检查 Storage 策略是否正确配置
- 确认 bucket 设置为 Public

### 问题：RLS 策略错误
- 确保已执行 `supabase/rls-policies.sql`
- 在 Supabase Dashboard 的 Authentication > Policies 中检查策略

## 📚 更多资源

- [Supabase 官方文档](https://supabase.com/docs)
- [Supabase JavaScript 客户端](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security 指南](https://supabase.com/docs/guides/auth/row-level-security)

