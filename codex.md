# Codex Project Notes

## Project Summary

This repository is a GoFrame + Eino based intelligent operations agent. The Go module name is `SuperBizAgent`.

The backend exposes chat, streaming chat, file upload, and AI Ops APIs under `/api`. The frontend in `SuperBizAgentFrontend` is a plain HTML/CSS/JavaScript chat UI that talks to `http://localhost:6872/api`.

Core capabilities:

- Knowledge-base chat using RAG over Milvus plus a ReAct agent.
- Streaming chat over Server-Sent Events style responses.
- File upload into the knowledge base, followed by Milvus re-indexing.
- AI Ops alert analysis using a plan-execute-replan workflow and tools for alerts, internal docs, logs, MySQL, and current time.

## Important Entry Points

- `main.go`
  - Reads `file_dir` from GoFrame config and stores it in `common.FileDir`.
  - Starts the GoFrame HTTP server.
  - Registers routes under `/api`.
  - Applies CORS and response middleware.
  - Binds `chat.NewV1()`.
  - Sets the runtime port to `6872`.
- `api/chat/v1/chat.go`
  - Defines public request/response structs and route metadata.
  - Current routes:
    - `POST /api/chat`
    - `POST /api/chat_stream`
    - `POST /api/upload`
    - `POST /api/ai_ops`
- `internal/controller/chat`
  - Contains HTTP handlers for chat, streaming chat, file upload, and AI Ops.
- `internal/ai/agent/chat_pipeline`
  - Builds the chat graph: user input to RAG, Milvus retrieval, prompt template, and ReAct agent.
- `internal/ai/agent/knowledge_index_pipeline`
  - Builds the indexing graph: file loader, markdown splitter, and Milvus indexer.
- `internal/ai/agent/plan_execute_replan`
  - Builds the AI Ops planning and execution workflow.
- `SuperBizAgentFrontend`
  - Plain frontend app. `app.js` uses `http://localhost:6872/api` as the API base URL.

## Runtime Dependencies

Required or expected locally:

- Go `1.24.x`; `go.mod` specifies `go 1.24.0` and toolchain `go1.24.4`.
- GoFrame CLI `gf` for `make -f hack/hack.mk build` and code generation tasks.
- Milvus on `localhost:19530`.
- LLM and embedding provider credentials in GoFrame config.
- MCP SSE endpoint for log tooling.

Milvus defaults:

- Address: `localhost:19530`
- Database: `agent`
- Collection: `biz`
- Collection fields include `id`, `vector`, `content`, and `metadata`.

Docker Compose for Milvus is available at:

```bash
docker compose -f manifest/docker/docker-compose.yml up -d
```

It starts etcd, MinIO, Milvus standalone, and Attu. Attu is mapped to local port `8000`.

## Configuration

The main config template is `manifest/config/config.yaml`. Similar command configs exist under `internal/ai/cmd/*/config/config.yaml`.

Important keys:

- `ds_think_chat_model`
  - `api_key`
  - `base_url`
  - `model`
- `ds_quick_chat_model`
  - `api_key`
  - `base_url`
  - `model`
- `doubao_embedding_model`
  - Despite the historical name, comments indicate this should use Aliyun DashScope/Bailian compatible embedding config.
  - `model` is currently `text-embedding-v4`.
- `file_dir`
  - Directory where uploaded knowledge files are saved.
  - `main.go` requires this value at startup.
- `mcp_url`
  - SSE endpoint used by log MCP tooling.

Do not commit real API keys, tokens, or private MCP URLs.

## Common Commands

Run backend:

```bash
go run main.go
```

Compile/test check:

```bash
go test ./...
```

GoFrame build:

```bash
make -f hack/hack.mk build
```

Start Milvus stack:

```bash
docker compose -f manifest/docker/docker-compose.yml up -d
```

Run frontend:

```bash
cd DevGuardAgentFrontend
./start.sh
```

On Windows, if `start.sh` is inconvenient, serve the directory with any static server or open `index.html` directly. The frontend expects the backend at `http://localhost:6872`.

## API Behavior

### `POST /api/chat`

Request fields:

- `Id`
- `Question`

Behavior:

- Loads per-session memory by `Id`.
- Builds the chat agent through `chat_pipeline.BuildChatAgent`.
- Invokes the graph once.
- Stores user message and assistant response in in-memory session history.

### `POST /api/chat_stream`

Request fields:

- `Id`
- `Question`

Behavior:

- Creates an SSE client through `internal/logic/sse`.
- Streams chunks from the chat agent.
- Sends events named `message`, `done`, or `error`.
- Stores the full response in memory after streaming completes.

### `POST /api/upload`

Content type:

- `multipart/form-data`

Request field:

- `file`

Behavior:

- Saves the upload to `common.FileDir`.
- Loads the saved file.
- Deletes existing Milvus records whose metadata `_source` matches the uploaded file source.
- Rebuilds the knowledge index for that file.

Frontend currently allows only `.txt`, `.md`, and `.markdown` uploads and limits files to 50 MB.

### `POST /api/ai_ops`

Behavior:

- Uses a hard-coded Chinese AI Ops prompt.
- Calls `plan_execute_replan.BuildPlanAgent`.
- Returns a final report in `result` and execution details in `detail`.

The prompt requires the agent to query active alerts, retrieve matching internal docs, use current time for time-sensitive tool calls, query logs with region and topic, and produce an alert analysis report.

## Development Notes

- Prefer existing project patterns over new abstractions.
- Keep route definitions in `api/chat/v1/chat.go` aligned with controller methods in `internal/controller/chat`.
- The project uses GoFrame response middleware, so frontend code expects responses shaped with `message: "OK"` and `data`.
- Session memory is in-process only via `utility/mem`; it is not persistent.
- Milvus client creation in `utility/client/client.go` also creates the `agent` database and `biz` collection if missing.
- The current repository has no `_test.go` test files. After code changes, at minimum run `go test ./...` for compile-level verification.
- Be careful with config loading. `main.go` panics if `file_dir` is missing.
- The Dockerfile appears to expect GoFrame build output under `temp/linux_amd64/main` and resources under `resource`.

## Known Cautions

- `manifest/config/config.yaml` has `server.address: ":8000"`, but `main.go` explicitly calls `s.SetPort(6872)`. Treat `6872` as the effective backend port unless the code changes.
- `SuperBizAgentFrontend/README.md` mentions broader upload formats, but current `app.js` only accepts text and Markdown extensions.
- Milvus vector configuration uses `FieldTypeBinaryVector` with dimension `65536`; embedding/indexer changes must preserve compatibility or include a migration plan.
- `FileUpload` saves into `common.FileDir` and then indexes `common.FileDir + "/" + newFileName`; keep path handling consistent when modifying upload logic.
