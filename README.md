<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# ResearchNexus

一个研究成果管理平台，支持按主题和时间线组织项目，管理 HTML、PDF 和 Markdown 格式的研究文档。

## ✨ 功能特性

- 📁 **项目管理**：按主题（物理、AI、生物等）创建和组织研究项目
- 📄 **文档存储**：支持 HTML、PDF 和 Markdown 研究文档
- 📊 **时间线可视化**：使用 D3.js 交互式展示研究进展
- 🤖 **AI 集成**：使用 Gemini API 自动生成 Markdown 内容摘要
- 💾 **数据持久化**：使用 Supabase 后端存储数据和文件
- 🎨 **现代 UI**：玻璃态设计风格，流畅动画效果

## 🛠️ 技术栈

- **前端**: React 19, TypeScript, React Router
- **样式**: Tailwind CSS
- **后端**: Supabase (PostgreSQL + Storage)
- **AI**: Google Gemini API
- **可视化**: D3.js
- **构建工具**: Vite

## 🚀 快速开始

### 前置要求

- Node.js (推荐 v18+)
- Supabase 账户（免费）
- Gemini API Key（可选，用于 AI 摘要功能）

### 安装步骤

1. **克隆仓库并安装依赖**
   ```bash
   npm install
   ```

2. **配置 Supabase 后端**

   详细步骤请参考 [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

   简要步骤：
   - 在 [Supabase](https://supabase.com) 创建新项目
   - 执行 `supabase/schema.sql` 创建数据库表
   - 执行 `supabase/rls-policies.sql` 配置安全策略
   - 创建 Storage bucket `research-files`

3. **配置环境变量**

   创建 `.env.local` 文件：
   ```env
   # Gemini API Key (可选)
   GEMINI_API_KEY=your_gemini_api_key_here

   # Supabase Configuration (必需)
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **启动开发服务器**
   ```bash
   npm run dev
   ```

   访问 http://localhost:3000

## 📖 使用指南

### 创建项目
1. 点击首页的 "New Project" 按钮
2. 输入项目名称、主题和描述
3. 项目将自动保存到 Supabase

### 添加研究成果
1. 进入项目详情页
2. 点击 "Add Artifact" 按钮
3. 选择文档类型：
   - **Markdown**: 直接输入内容，可使用 AI 生成摘要
   - **PDF/HTML**: 上传文件，自动存储到 Supabase Storage
4. 填写标题和描述，点击保存

### 查看时间线
- 项目详情页自动显示交互式时间线
- 点击时间线上的节点可查看对应的研究成果

## 📁 项目结构

```
researchnexus/
├── components/          # React 组件
│   ├── ArtifactViewer.tsx
│   ├── ProjectCard.tsx
│   └── TimelineChart.tsx
├── pages/              # 页面组件
│   └── ProjectDetail.tsx
├── services/           # 服务层
│   ├── geminiService.ts      # AI 摘要服务
│   ├── projectService.ts     # 项目 CRUD
│   ├── artifactService.ts    # 文档 CRUD
│   └── storageService.ts     # 文件存储
├── lib/                # 库配置
│   └── supabase.ts     # Supabase 客户端
├── supabase/           # 数据库脚本
│   ├── schema.sql      # 表结构
│   ├── rls-policies.sql # 安全策略
│   └── storage-setup.sql # 存储配置
├── types.ts            # TypeScript 类型定义
└── App.tsx             # 主应用组件
```

## 🔒 安全说明

当前配置为演示模式，允许所有人访问所有数据。

**生产环境建议**：
- 启用 Supabase Authentication
- 配置基于用户的 RLS 策略
- 限制 Storage bucket 访问权限

详见 [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) 的安全部分。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🔗 相关链接

- [AI Studio App](https://ai.studio/apps/drive/1IpVhCwvUvzPjvM-D-7Q4RJc1krOADSY_)
- [Supabase 文档](https://supabase.com/docs)
- [Gemini API](https://ai.google.dev/)
