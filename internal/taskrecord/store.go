package taskrecord

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"sync"
	"time"
)

const (
	stateFileName = "agent_tasks.json"
	defaultLimit  = 100
	maxStored     = 100
)

var (
	ErrTaskNotFound      = errors.New("agent task not found")
	ErrInvalidTaskStatus = errors.New("invalid agent task status")
)

type Store struct {
	path string
	mu   sync.Mutex
}

func NewStore(fileDir string) *Store {
	return &Store{path: filepath.Join(fileDir, ".devguard", stateFileName)}
}

func (s *Store) StatePath() string {
	return s.path
}

func (s *Store) Create(input CreateInput) (*Task, error) {
	now := time.Now()
	task := &Task{
		ID:        strings.TrimSpace(input.ID),
		SessionID: strings.TrimSpace(input.SessionID),
		TraceID:   strings.TrimSpace(input.TraceID),
		Title:     titleFromQuestion(input.Question),
		Question:  strings.TrimSpace(input.Question),
		Mode:      input.Mode,
		Status:    StatusRunning,
		CreatedAt: now,
		UpdatedAt: now,
		StartedAt: &now,
	}
	if task.ID == "" {
		task.ID = fmt.Sprintf("task-%d", now.UnixNano())
	}
	if task.Mode == "" {
		task.Mode = ModeStream
	}

	err := s.Update(func(state *State) error {
		state.Tasks[task.ID] = task
		trimState(state)
		return nil
	})
	if err != nil {
		return nil, err
	}
	cp := *task
	return &cp, nil
}

func (s *Store) Complete(input CompleteInput) (*Task, error) {
	var out *Task
	err := s.Update(func(state *State) error {
		task, ok := state.Tasks[strings.TrimSpace(input.ID)]
		if !ok || task == nil {
			return ErrTaskNotFound
		}
		now := time.Now()
		status := input.Status
		if status == "" {
			status = StatusSucceeded
		}
		if !IsValidStatus(status) {
			return ErrInvalidTaskStatus
		}
		task.Status = status
		task.Answer = input.Answer
		task.Steps = input.Steps
		task.Error = input.Error
		task.UpdatedAt = now
		task.FinishedAt = &now
		cp := *task
		out = &cp
		return nil
	})
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (s *Store) List(filter ListFilter) ([]Task, error) {
	if filter.Status != "" && !IsValidStatus(filter.Status) {
		return nil, ErrInvalidTaskStatus
	}
	state, err := s.Load()
	if err != nil {
		return nil, err
	}
	tasks := make([]Task, 0, len(state.Tasks))
	keyword := strings.ToLower(strings.TrimSpace(filter.Keyword))
	for _, task := range state.Tasks {
		if task == nil {
			continue
		}
		if filter.Status != "" && task.Status != filter.Status {
			continue
		}
		if keyword != "" && !taskMatchesKeyword(task, keyword) {
			continue
		}
		tasks = append(tasks, *task)
	}
	sortTasks(tasks)
	limit := filter.Limit
	if limit <= 0 || limit > defaultLimit {
		limit = defaultLimit
	}
	if len(tasks) > limit {
		tasks = tasks[:limit]
	}
	return tasks, nil
}

func IsValidStatus(status Status) bool {
	switch status {
	case StatusRunning, StatusSucceeded, StatusFailed:
		return true
	default:
		return false
	}
}

func (s *Store) Task(id string) (*Task, error) {
	state, err := s.Load()
	if err != nil {
		return nil, err
	}
	task, ok := state.Tasks[strings.TrimSpace(id)]
	if !ok || task == nil {
		return nil, ErrTaskNotFound
	}
	cp := *task
	return &cp, nil
}

func (s *Store) Load() (*State, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.loadLocked()
}

func (s *Store) Update(fn func(*State) error) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	state, err := s.loadLocked()
	if err != nil {
		return err
	}
	if err := fn(state); err != nil {
		return err
	}
	return s.saveLocked(normalizeState(state))
}

func (s *Store) loadLocked() (*State, error) {
	data, err := os.ReadFile(s.path)
	if errors.Is(err, os.ErrNotExist) {
		return newState(), nil
	}
	if err != nil {
		return nil, fmt.Errorf("read agent task state: %w", err)
	}
	if len(data) == 0 {
		return newState(), nil
	}
	state := newState()
	if err := json.Unmarshal(data, state); err != nil {
		return nil, fmt.Errorf("parse agent task state: %w", err)
	}
	return normalizeState(state), nil
}

func (s *Store) saveLocked(state *State) error {
	if err := os.MkdirAll(filepath.Dir(s.path), 0700); err != nil {
		return fmt.Errorf("create agent task state dir: %w", err)
	}
	data, err := json.MarshalIndent(state, "", "  ")
	if err != nil {
		return fmt.Errorf("marshal agent task state: %w", err)
	}
	tmp := s.path + ".tmp"
	if err := os.WriteFile(tmp, data, 0600); err != nil {
		return fmt.Errorf("write agent task state tmp: %w", err)
	}
	if err := os.Rename(tmp, s.path); err != nil {
		_ = os.Remove(tmp)
		return fmt.Errorf("replace agent task state: %w", err)
	}
	return nil
}

func normalizeState(state *State) *State {
	if state == nil {
		return newState()
	}
	if state.Tasks == nil {
		state.Tasks = make(map[string]*Task)
	}
	return state
}

func trimState(state *State) {
	tasks := make([]Task, 0, len(state.Tasks))
	for _, task := range state.Tasks {
		if task != nil {
			tasks = append(tasks, *task)
		}
	}
	sortTasks(tasks)
	for i := maxStored; i < len(tasks); i++ {
		delete(state.Tasks, tasks[i].ID)
	}
}

func sortTasks(tasks []Task) {
	sort.Slice(tasks, func(i, j int) bool {
		return tasks[i].UpdatedAt.After(tasks[j].UpdatedAt)
	})
}

func taskMatchesKeyword(task *Task, keyword string) bool {
	values := []string{
		task.ID,
		task.SessionID,
		task.TraceID,
		task.Title,
		task.Question,
		task.Answer,
		task.Error,
	}
	for _, value := range values {
		if strings.Contains(strings.ToLower(value), keyword) {
			return true
		}
	}
	return false
}

func titleFromQuestion(question string) string {
	title := strings.TrimSpace(question)
	if title == "" {
		return "未命名任务"
	}
	runes := []rune(title)
	if len(runes) > 36 {
		return string(runes[:36]) + "..."
	}
	return title
}
