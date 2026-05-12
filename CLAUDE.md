# DevGuardAgent

## 项目概述

DevGuardAgent 是一个基于大语言模型的智能 AIOps 平台，提供知识库问答、告警分析和日志查询等功能。

### 核心能力

- RAG 增强的智能对话（基于 Milvus 向量检索）
- 自动化告警分析（Plan-Execute-Replan 模式）
- 知识库管理（支持 TXT/MD/Markdown 文件上传）
- 多工具集成（Prometheus、日志查询、MySQL、内部文档）
- 流式响应（SSE）

### 技术栈

- 后端框架: GoFrame v2.7.1
- AI 框架: CloudWeGo Eino v0.6.0
- 向量数据库: Milvus v2.4.2
- LLM: DeepSeek v3 (via Volcano Engine)
- Embedding: Aliyun DashScope text-embedding-v4
- 前端: Vanilla JavaScript + SSE

## 快速开始

### 环境要求

- Go 1.24.x
- Docker & Docker Compose（用于 Milvus）
- DeepSeek API Key（Volcano Engine）
- Aliyun DashScope API Key

### 启动步骤

1. **启动 Milvus 向量数据库**
```bash
cd manifest/docker
docker-compose up -d
```

2. **配置环境变量**

编辑 `manifest/config/config.yaml`：
```yaml
# LLM 配置
ds_chat_model:
  model: "ep-xxx"  # DeepSeek 模型 endpoint
  api_key: "your-api-key"

# Embedding 配置
dashscope_embedder:
  api_key: "your-dashscope-key"

# 文件存储路径（必填）
file_dir: "./uploads"

# Milvus 配置
milvus:
  address: "localhost:19530"
```

3. **运行服务**
```bash
go run main.go
```

服务将在 `http://localhost:6872` 启动。

### API 端点

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/chat` | POST | 普通对话（RAG） |
| `/api/chat_stream` | POST | 流式对话（SSE） |
| `/api/upload` | POST | 上传知识库文件 |
| `/api/ai_ops` | POST | 自动化告警分析 |

## 项目结构

```
DevGuardAgent/
├── api/                          # API 定义层
│   └── chat/v1/                  # 版本化 API 契约
├── internal/                     # 内部实现
│   ├── ai/                       # AI 核心组件
│   │   ├── agent/                # Agent 实现
│   │   │   ├── chat_pipeline/    # 对话 Agent（RAG + ReAct）
│   │   │   ├── knowledge_index_pipeline/  # 知识索引 Agent
│   │   │   └── plan_execute_replan/       # 告警分析 Agent
│   │   ├── embedder/             # Embedding 模型
│   │   ├── indexer/              # 向量索引
│   │   ├── loader/               # 文档加载器
│   │   ├── models/               # LLM 模型配置
│   │   ├── retriever/            # RAG 检索器
│   │   └── tools/                # Agent 工具集
│   ├── controller/               # HTTP 控制器
│   └── logic/                    # 业务逻辑层
├── utility/                      # 工具库
│   ├── client/                   # 外部客户端（Milvus）
│   ├── mem/                      # 内存会话管理
│   └── middleware/               # HTTP 中间件
├── manifest/                     # 配置和部署
│   ├── config/                   # 配置文件
│   └── docker/                   # Docker Compose
└── docs/                         # 文档
```

## 核心架构

### 1. Chat Pipeline（对话流程）

```
用户输入 → Milvus 检索 → Prompt 模板 → ReAct Agent → 流式响应
```

**实现文件**: `internal/ai/agent/chat_pipeline/chat_pipeline.go`

**关键组件**:
- `InputToRagLambda`: 将用户输入转换为检索查询
- `RagNode`: 从 Milvus 检索相关文档
- `ChatTemplateNode`: 构建 Prompt
- `ReactAgentNode`: ReAct 模式的 Agent 执行

### 2. Knowledge Index Pipeline（知识索引流程）

```
文件上传 → 文档加载 → 分块 → Embedding → Milvus 索引
```

**实现文件**: `internal/ai/agent/knowledge_index_pipeline/knowledge_index_pipeline.go`

**关键组件**:
- `LoaderNode`: 加载 TXT/MD 文件
- `TransformNode`: 文本分块（RecursiveCharacterTextSplitter）
- `IndexerNode`: 向量化并存储到 Milvus

### 3. AI Ops Pipeline（告警分析流程）

```
查询告警 → 检索文档 → 查询日志 → 生成分析报告
```

**实现文件**: `internal/ai/agent/plan_execute_replan/plan_execute_replan.go`

**模式**: Plan-Execute-Replan（规划-执行-重新规划）

## Agent 工具集

| 工具名 | 文件 | 功能 |
|--------|------|------|
| `query_prometheus_alerts` | `tools/query_metrics_alerts.go` | 查询 Prometheus 告警（当前禁用） |
| `query_internal_docs` | `tools/query_internal_docs.go` | RAG 检索内部文档 |
| `query_log` | `tools/query_log.go` | MCP 协议查询日志（腾讯云） |
| `mysql_crud` | `tools/mysql_crud.go` | MySQL 数据库操作 |
| `get_current_time` | `tools/get_current_time.go` | 获取当前时间 |

**添加新工具**:
1. 在 `internal/ai/tools/` 创建新文件
2. 实现 `tool.InvokableTool` 接口
3. 在 `chat_pipeline.go` 的 `tools` 数组中注册

## 开发规范

### 代码风格

遵循 [ByteDance Go 编码规范](https://github.com/bytedance/guide)：

1. **命名规范**
   - 包名：小写单词，无下划线（如 `chat`, `tools`）
   - 导出函数：PascalCase（如 `NewMilvusClient`）
   - 私有函数：camelCase（如 `newInputToRagLambda`）
   - 常量：PascalCase（如 `MilvusDBName`）

2. **错误处理**
```go
// ✅ 推荐：使用 fmt.Errorf 包装错误
func NewMilvusClient(ctx context.Context) (cli.Client, error) {
    client, err := cli.NewClient(ctx, config)
    if err != nil {
        return nil, fmt.Errorf("failed to connect to milvus: %w", err)
    }
    return client, nil
}

// ❌ 避免：忽略错误
result, _ := someFunction()  // 不要这样做
```

3. **Context 传递**
   - 所有函数第一个参数应为 `context.Context`
   - 使用 `ctx` 作为变量名

4. **注释规范**
```go
// NewChatAgent 创建一个新的对话 Agent
// 参数:
//   - ctx: 上下文
//   - model: LLM 模型
// 返回:
//   - *ChatAgent: Agent 实例
//   - error: 错误信息
func NewChatAgent(ctx context.Context, model string) (*ChatAgent, error) {
    // 实现...
}
```

### 项目约定

1. **分层架构**
   - `api/`: 仅定义请求/响应结构体
   - `controller/`: HTTP 处理器，调用 `logic` 层
   - `logic/`: 业务逻辑实现
   - `internal/ai/`: AI 相关核心逻辑

2. **配置管理**
   - 使用 GoFrame 的 `g.Cfg()` 读取配置
   - 配置文件：`manifest/config/config.yaml`
   - 敏感信息通过环境变量注入

3. **日志规范**
```go
// 使用 GoFrame 的日志
g.Log().Info(ctx, "Starting chat agent")
g.Log().Error(ctx, "Failed to connect", err)
```

4. **并发安全**
   - 使用 `sync.Mutex` 保护共享资源
   - 示例：`utility/mem/mem.go` 的会话管理

### 测试规范

当前状态: 项目缺少测试覆盖

TODO: 添加单元测试和集成测试

```go
// 测试文件命名：*_test.go
// 示例：chat_pipeline_test.go

func TestChatPipeline(t *testing.T) {
    ctx := context.Background()
    // 测试逻辑...
}
```

### 代码质量工具

推荐配置 `.golangci.yml`:
```yaml
linters:
  enable:
    - gofmt
    - goimports
    - govet
    - errcheck
    - staticcheck
    - unused
    - gosimple
    - ineffassign
    - misspell
    - revive
```

运行检查:
```bash
# 格式化代码
gofmt -w .

# 运行 linter
golangci-lint run

# 运行测试
go test ./...
```

## 配置说明

### Milvus 配置

数据库: `agent`  
集合: `biz`  
Schema:
- `id`: 主键（自增）
- `vector`: BinaryVector(65536) - 文档向量
- `content`: VarChar(65535) - 文档内容
- `metadata`: JSON - 元数据

索引: FLAT（精确检索）

### LLM 模型配置

项目使用多个 DeepSeek 模型：

| 配置项 | 模型用途 |
|--------|----------|
| `ds_chat_model` | 普通对话 |
| `ds_think_chat_model` | 深度思考模式 |
| `ds_plan_execute_replan_model` | 告警分析 |

### 会话管理

- 存储方式: 内存（`utility/mem/mem.go`）
- 窗口大小: 最多保留 6 条历史消息
- 并发安全: 使用 `sync.Mutex`

## 常见问题

### 1. 端口冲突

问题: 配置文件显示 `:8000`，但实际运行在 `6872`

原因: `main.go` 硬编码了端口：
```go
s.SetPort(6872)  // 覆盖配置文件
```

解决: 修改 `main.go:21` 或删除该行使用配置文件端口

### 2. Milvus 连接失败

检查清单:
```bash
# 1. 确认 Milvus 运行中
docker ps | grep milvus

# 2. 检查端口
netstat -an | grep 19530

# 3. 测试连接
curl http://localhost:9091/healthz
```

### 3. 文件上传失败

错误: `file_dir config is required`

解决: 在 `config.yaml` 中设置：
```yaml
file_dir: "./uploads"
```

### 4. Prometheus 工具无数据

原因: `query_metrics_alerts.go:54` 返回空结果（功能未实现）

解决: 实现 Prometheus API 调用或使用其他监控工具

## 性能优化建议

1. **向量检索优化**
   - 当前使用 FLAT 索引（精确但慢）
   - 生产环境建议使用 IVF_FLAT 或 HNSW 索引

2. **会话持久化**
   - 当前会话仅存内存，重启丢失
   - 建议使用 Redis 或数据库持久化

3. **并发控制**
   - 添加请求限流（rate limiting）
   - 使用连接池管理 Milvus 连接

4. **缓存策略**
   - 缓存常见问题的检索结果
   - 使用 Redis 缓存 Embedding 结果

## 部署指南

### Docker 部署

```dockerfile
# Dockerfile
FROM golang:1.24-alpine AS builder
WORKDIR /app
COPY . .
RUN go build -o devguard main.go

FROM alpine:latest
COPY --from=builder /app/devguard /devguard
COPY manifest/config /config
CMD ["/devguard"]
```

### 生产环境检查清单

- [ ] 配置外部 Milvus 集群
- [ ] 启用 HTTPS
- [ ] 配置日志收集（ELK/Loki）
- [ ] 添加监控（Prometheus + Grafana）
- [ ] 实现会话持久化
- [ ] 添加认证/鉴权
- [ ] 配置 CORS 白名单
- [ ] 添加请求限流
- [ ] 实现优雅关闭
- [ ] 添加健康检查端点

## 贡献指南

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

代码审查要点:
- 遵循 ByteDance Go 编码规范
- 添加单元测试（覆盖率 > 80%）
- 更新相关文档
- 通过所有 CI 检查

## 许可证

待添加

## 联系方式

待添加

---

最后更新: 2026-05-12  
维护者: 待添加
