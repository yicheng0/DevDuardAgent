package knowledge

import "time"

type DocumentStatus string

const (
	DocumentStatusIndexing     DocumentStatus = "indexing"
	DocumentStatusReady        DocumentStatus = "ready"
	DocumentStatusFailed       DocumentStatus = "failed"
	DocumentStatusDeleteFailed DocumentStatus = "delete_failed"
	DocumentStatusDeleted      DocumentStatus = "deleted"
)

type TaskType string

const (
	TaskTypeIndex   TaskType = "index"
	TaskTypeDelete  TaskType = "delete"
	TaskTypeReindex TaskType = "reindex"
)

type TaskStatus string

const (
	TaskStatusQueued    TaskStatus = "queued"
	TaskStatusRunning   TaskStatus = "running"
	TaskStatusSucceeded TaskStatus = "succeeded"
	TaskStatusFailed    TaskStatus = "failed"
)

type Document struct {
	ID            string         `json:"id"`
	FileName      string         `json:"fileName"`
	FilePath      string         `json:"filePath"`
	Source        string         `json:"source"`
	SHA256        string         `json:"sha256"`
	Size          int64          `json:"size"`
	Status        DocumentStatus `json:"status"`
	ChunkCount    int            `json:"chunkCount"`
	ActiveTaskID  string         `json:"activeTaskId,omitempty"`
	CreatedAt     time.Time      `json:"createdAt"`
	UpdatedAt     time.Time      `json:"updatedAt"`
	LastIndexedAt *time.Time     `json:"lastIndexedAt,omitempty"`
	LastError     string         `json:"lastError,omitempty"`
}

type Task struct {
	ID         string     `json:"id"`
	DocumentID string     `json:"documentId"`
	Type       TaskType   `json:"type"`
	Status     TaskStatus `json:"status"`
	StartedAt  *time.Time `json:"startedAt,omitempty"`
	FinishedAt *time.Time `json:"finishedAt,omitempty"`
	Error      string     `json:"error,omitempty"`
	CreatedAt  time.Time  `json:"createdAt"`
	UpdatedAt  time.Time  `json:"updatedAt"`
}

type State struct {
	Documents map[string]*Document `json:"documents"`
	Tasks     map[string]*Task     `json:"tasks"`
}

func newState() *State {
	return &State{
		Documents: make(map[string]*Document),
		Tasks:     make(map[string]*Task),
	}
}
