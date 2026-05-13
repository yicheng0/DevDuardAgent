package taskrecord

import (
	agenttrace "SuperBizAgent/internal/trace"
	"time"
)

type Status string

const (
	StatusRunning   Status = "running"
	StatusSucceeded Status = "succeeded"
	StatusFailed    Status = "failed"
)

type Mode string

const (
	ModeQuick  Mode = "quick"
	ModeStream Mode = "stream"
)

type Task struct {
	ID         string            `json:"id"`
	SessionID  string            `json:"sessionId"`
	TraceID    string            `json:"traceId"`
	Title      string            `json:"title"`
	Question   string            `json:"question"`
	Answer     string            `json:"answer,omitempty"`
	Mode       Mode              `json:"mode"`
	Status     Status            `json:"status"`
	Steps      []agenttrace.Step `json:"steps,omitempty"`
	Error      string            `json:"error,omitempty"`
	CreatedAt  time.Time         `json:"createdAt"`
	UpdatedAt  time.Time         `json:"updatedAt"`
	StartedAt  *time.Time        `json:"startedAt,omitempty"`
	FinishedAt *time.Time        `json:"finishedAt,omitempty"`
}

type State struct {
	Tasks map[string]*Task `json:"tasks"`
}

type ListFilter struct {
	Status  Status
	Keyword string
	Limit   int
}

type CreateInput struct {
	ID        string
	SessionID string
	TraceID   string
	Question  string
	Mode      Mode
}

type CompleteInput struct {
	ID     string
	Status Status
	Answer string
	Steps  []agenttrace.Step
	Error  string
}

func newState() *State {
	return &State{Tasks: make(map[string]*Task)}
}
