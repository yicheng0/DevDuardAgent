# DevGuardAgent 前端使用指南

## 功能介绍

DevGuardAgent 前端是一个面向运维响应的 AI 工作台，提供以下能力：

### 1. 智能对话
- **快速模式**：一次性返回完整诊断结果
- **流式模式**：实时展示模型输出过程

### 2. 知识库文件上传
- 通过输入框左下角工具菜单上传文件
- 支持的文件格式：TXT、MD、Markdown
- 文件大小限制：50MB
- 上传成功后后端会保存文件并刷新知识库索引

### 3. AI Ops 告警分析
- 点击顶部“运行 AI Ops”按钮触发告警分析
- 后端会结合告警、内部文档、日志和工具结果生成分析报告
- 详细执行步骤会以可折叠面板展示

## 启动前端服务

Windows PowerShell:

```powershell
cd DevGuardAgentFrontend
.\start.ps1
```

如果 PowerShell 阻止脚本执行，可以用：

```powershell
powershell -ExecutionPolicy Bypass -File .\start.ps1
```

macOS / Linux / WSL / Git Bash:

```bash
cd DevGuardAgentFrontend
chmod +x start.sh
./start.sh
```

也可以使用 npm：

```powershell
npm start
```

或者直接用浏览器打开 `index.html` 文件。

## 使用前准备

1. 确保后端服务已启动，默认地址为 `http://localhost:6872`。
2. 首次知识库问答前，建议先上传项目 `docs` 目录下的 TXT 或 Markdown 文件。
3. 上传成功后再开始提问，可避免知识库检索为空导致的错误。

## 后端 API

前端默认访问 `http://localhost:6872/api`。

### 对话接口

- `POST /api/chat`
- `POST /api/chat_stream`

### 上传文件接口

**URL**: `/api/upload`

**方法**: `POST`

**Content-Type**: `multipart/form-data`

**参数**:
- `file`: 要上传的文件，支持 `.txt`、`.md`、`.markdown`

**响应示例**:

```json
{
  "message": "OK",
  "data": {
    "fileName": "example.md",
    "filePath": "./docs/example.md",
    "fileSize": 102400
  }
}
```

### AI Ops 接口

- `POST /api/ai_ops`

## 技术栈

- 原生 JavaScript (ES6+)
- Fetch API
- FormData API
- Server-Sent Events (SSE)
- Markdown 渲染：marked
- 代码高亮：highlight.js

## 浏览器兼容性

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## 注意事项

1. 如果请求失败，请先检查后端服务是否运行在 `http://localhost:6872`。
2. 上传大文件时请等待遮罩层消失后再继续操作。
3. 当前前端只允许上传 TXT 和 Markdown 文件。
