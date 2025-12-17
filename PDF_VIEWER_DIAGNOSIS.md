# PDF 查看器问题诊断报告

## 🔍 问题分析

### 当前实现
**文件**: `components/ArtifactViewer.tsx` (第 123-129 行)

```jsx
{artifact.type === ArtifactType.PDF && (
    <iframe 
        src={artifact.url} 
        title={artifact.title}
        className="w-full h-full border-none"
    />
)}
```

### 问题根源

#### 1. **iOS Safari 兼容性问题**
- iOS Safari 对 iframe 中的 PDF 滚动支持有限
- 特别是在 iframe 嵌套在 fixed 定位容器中时
- iOS 会限制 iframe 内的滚动行为

#### 2. **CSS 样式限制**
- 父容器 `overflow-hidden` (第 111 行)
- 内容容器 `overflow-y-auto` (第 112 行)
- 但 iframe 本身没有明确的滚动配置
- iOS 上 iframe 滚动可能被禁用

#### 3. **iframe 属性缺失**
- 缺少 `scrolling="yes"` 属性
- 缺少 `allow` 属性用于权限
- 缺少 `allowFullScreen` 属性

#### 4. **移动端特定问题**
- 固定定位的模态框 (第 60 行)
- 嵌套的 overflow 容器
- iOS 对嵌套滚动的限制

## ✅ 解决方案

### 方案 1: 改进 iframe 实现（推荐）
- 添加 `scrolling="yes"` 属性
- 添加 `allow` 属性
- 改进 CSS 样式
- 添加 iOS 特定的 meta 标签

### 方案 2: 使用 react-pdf 库
- 更好的 PDF 渲染控制
- 原生多页支持
- 更好的移动端兼容性
- 需要添加依赖

### 推荐方案
**方案 1** - 改进 iframe 实现
- 无需添加新依赖
- 快速实施
- 对大多数 PDF 有效
- 如果不行再考虑方案 2

## 📋 实施步骤

1. 修改 `ArtifactViewer.tsx` 中的 PDF 渲染代码
2. 添加 iOS 特定的 meta 标签到 HTML
3. 改进 CSS 样式
4. 测试多页 PDF 滚动

## 🧪 测试方法

1. 创建或上传多页 PDF
2. 在 iPhone Safari 中打开
3. 验证能否向下滚动查看所有页面
4. 在 Chrome、Firefox 等浏览器测试

