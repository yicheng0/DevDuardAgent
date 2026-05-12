# DevGuard Agent - React Frontend

> 字节跳动训练营初赛项目 - Glassmorphism 风格 React 重构版本

## 🎨 设计特色

- **Glassmorphism 玻璃态设计**：半透明毛玻璃效果，科技感十足
- **流体动画**：Framer Motion 驱动的丝滑动画效果
- **发光交互**：关键元素的霓虹发光边框
- **渐变背景**：深紫到深蓝的动态径向渐变
- **响应式设计**：完美适配桌面端和移动端

## 🚀 技术栈

- **React 18.2+** - 现代化 React 框架
- **TypeScript 5.3+** - 类型安全
- **Vite 5.0+** - 极速构建工具
- **Tailwind CSS 3.4+** - 原子化 CSS 框架
- **Framer Motion 11+** - 高级动画库
- **Zustand 4.5+** - 轻量级状态管理
- **marked + highlight.js** - Markdown 渲染和代码高亮

## 📦 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

服务将在 `http://localhost:8080` 启动（如果端口被占用会自动切换）

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 📁 项目结构

```
DevGuardAgentFrontend/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx          # 主布局容器
│   │   │   ├── Sidebar.tsx            # 侧边栏（聊天历史）
│   │   │   └── Topbar.tsx             # 顶栏（状态指示器）
│   │   ├── chat/
│   │   │   ├── ChatContainer.tsx      # 聊天容器
│   │   │   ├── MessageList.tsx        # 消息列表
│   │   │   ├── Message.tsx            # 单条消息
│   │   │   ├── InputArea.tsx          # 输入区域
│   │   │   └── WelcomeScreen.tsx      # 欢迎屏幕
│   │   ├── aiops/
│   │   │   └── AIOpsPanel.tsx         # AI Ops 分析面板
│   │   └── ui/
│   │       ├── GlassCard.tsx          # 玻璃卡片组件
│   │       ├── GlowButton.tsx         # 发光按钮
│   │       └── LoadingSpinner.tsx     # 加载动画
│   ├── hooks/
│   │   └── useStreaming.ts            # SSE 流式响应 Hook
│   ├── stores/
│   │   ├── chatStore.ts               # 聊天状态管理
│   │   ├── uiStore.ts                 # UI 状态管理
│   │   └── aiopsStore.ts              # AI Ops 状态管理
│   ├── types/
│   │   └── index.ts                   # TypeScript 类型定义
│   ├── styles/
│   │   └── globals.css                # 全局样式
│   ├── utils/
│   │   └── cn.ts                      # 工具函数
│   ├── App.tsx                        # 根组件
│   └── main.tsx                       # 入口文件
├── index.html                         # HTML 模板
├── vite.config.ts                     # Vite 配置
├── tailwind.config.js                 # Tailwind 配置
├── tsconfig.json                      # TypeScript 配置
└── package.json                       # 项目依赖
```

## 🎯 核心功能

### 1. 智能对话

- ✅ 支持快速模式和流式模式
- ✅ Markdown 渲染和代码高亮
- ✅ 文件上传（TXT/MD/Markdown）
- ✅ 会话管理（创建、切换、删除）
- ✅ 本地持久化（LocalStorage）

### 2. 玻璃态 UI

- ✅ 半透明毛玻璃效果（backdrop-blur）
- ✅ 发光边框和阴影
- ✅ 渐变背景
- ✅ 流体动画

### 3. 状态管理

- ✅ Zustand 轻量级状态管理
- ✅ 会话持久化
- ✅ UI 状态管理
- ✅ AI Ops 状态管理

### 4. 响应式设计

- ✅ 桌面端优化（1920x1080+）
- ✅ 平板端适配（768px-1024px）
- ✅ 移动端适配（<768px）
- ✅ 侧边栏抽屉式设计

## 🎨 设计系统

### 配色方案

```css
/* 背景渐变 */
background: radial-gradient(
  ellipse at top,
  #1e1b4b 0%,      /* 深紫 */
  #1e3a8a 50%,     /* 深蓝 */
  #0f172a 100%     /* 深灰蓝 */
);

/* 玻璃态颜色 */
--glass-light: rgba(255, 255, 255, 0.1);
--glass-dark: rgba(0, 0, 0, 0.2);

/* 发光颜色 */
--glow-blue: #60a5fa;
--glow-purple: #a78bfa;
--glow-pink: #f472b6;
--glow-green: #34d399;
```

### 组件样式

#### 玻璃卡片

```tsx
<GlassCard variant="elevated" blur="xl">
  {/* 内容 */}
</GlassCard>
```

#### 发光按钮

```tsx
<GlowButton variant="primary" onClick={handleClick}>
  按钮文字
</GlowButton>
```

## 🔌 API 集成

### 后端接口

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/chat` | POST | 快速模式对话 |
| `/api/chat_stream` | GET/POST | 流式模式对话（SSE） |
| `/api/upload` | POST | 文件上传 |
| `/api/ai_ops` | POST | AI Ops 分析 |

### 代理配置

Vite 开发服务器已配置代理，自动转发 `/api` 请求到后端：

```typescript
// vite.config.ts
server: {
  port: 8080,
  proxy: {
    '/api': {
      target: 'http://localhost:6872',
      changeOrigin: true,
    },
  },
}
```

## 📊 性能优化

### 已实现

- ✅ 代码分割（React.lazy）
- ✅ 组件 Memo 优化
- ✅ Zustand 状态管理（避免不必要的重渲染）
- ✅ CSS-in-JS 优化（Tailwind JIT）

### 待优化

- ⏳ 虚拟滚动（消息列表超过 100 条时）
- ⏳ GPU 能力检测（动态调整模糊强度）
- ⏳ Service Worker（离线支持）
- ⏳ 图片懒加载

## 🐛 已知问题

1. **移动端侧边栏**：需要添加手势滑动支持
2. **代码高亮主题**：当前使用 GitHub Dark，可能需要自定义
3. **文件上传进度**：缺少上传进度条
4. **错误处理**：需要更友好的错误提示

## 🔧 开发指南

### 添加新组件

1. 在 `src/components/` 对应目录创建组件文件
2. 使用 TypeScript 定义 Props 接口
3. 使用 Tailwind CSS 编写样式
4. 使用 Framer Motion 添加动画

示例：

```tsx
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';

interface MyComponentProps {
  title: string;
  onClose: () => void;
}

const MyComponent = ({ title, onClose }: MyComponentProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <GlassCard variant="elevated">
        <h2 className="text-xl font-bold text-white">{title}</h2>
        <button onClick={onClose}>关闭</button>
      </GlassCard>
    </motion.div>
  );
};

export default MyComponent;
```

### 添加新状态

使用 Zustand 创建新的 Store：

```typescript
import { create } from 'zustand';

interface MyStore {
  count: number;
  increment: () => void;
}

export const useMyStore = create<MyStore>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));
```

## 📝 待办事项

- [ ] 添加单元测试（Vitest）
- [ ] 添加 E2E 测试（Playwright）
- [ ] 添加 Storybook 组件文档
- [ ] 优化移动端体验
- [ ] 添加暗色/亮色模式切换
- [ ] 添加国际化支持（i18n）
- [ ] 添加无障碍支持（ARIA）

## 🎓 竞赛亮点

### 视觉设计创新 ⭐⭐⭐⭐⭐

- Glassmorphism 玻璃态设计（行业前沿）
- 动态渐变背景 + 发光交互
- 流体动画 + 统一设计语言

### 技术实现先进 ⭐⭐⭐⭐⭐

- React 18 + TypeScript 类型安全
- Framer Motion 高级动画
- Vite 极速构建
- Zustand 轻量级状态管理

### 用户体验优秀 ⭐⭐⭐⭐⭐

- 流畅的动画过渡
- 响应式设计
- 数据持久化
- 流式响应

### 代码质量高 ⭐⭐⭐⭐⭐

- 组件化架构
- TypeScript 类型安全
- 可维护性强
- 文档完善

## 📄 许可证

MIT

## 👥 贡献者

DevGuard Agent Team

---

**最后更新**：2026-05-12  
**版本**：v2.0.0 (React 重构版)
