package trace

import (
	"fmt"
	"sync"
	"time"
)

type StepStatus string

const (
	StatusPending   StepStatus = "pending"
	StatusRunning   StepStatus = "running"
	StatusCompleted StepStatus = "completed"
	StatusError     StepStatus = "error"
)

type StepPhase string

const (
	PhaseUnderstand StepPhase = "understand"
	PhaseRetrieve   StepPhase = "retrieve"
	PhaseObserve    StepPhase = "observe"
	PhaseReason     StepPhase = "reason"
	PhaseRespond    StepPhase = "respond"
)

type RiskLevel string

const (
	RiskLow    RiskLevel = "low"
	RiskMedium RiskLevel = "medium"
	RiskHigh   RiskLevel = "high"
)

type Step struct {
	ID          string     `json:"id"`
	Title       string     `json:"title"`
	Status      StepStatus `json:"status"`
	Phase       StepPhase  `json:"phase,omitempty"`
	ToolName    string     `json:"toolName,omitempty"`
	Description string     `json:"description,omitempty"`
	Result      string     `json:"result,omitempty"`
	Evidence    []string   `json:"evidence,omitempty"`
	DurationMs  int64      `json:"durationMs,omitempty"`
	RiskLevel   RiskLevel  `json:"riskLevel,omitempty"`
}

type Event struct {
	TraceID string `json:"traceId"`
	Step    Step   `json:"step"`
}

type Run struct {
	TraceID   string    `json:"traceId"`
	SessionID string    `json:"sessionId"`
	Steps     []Step    `json:"steps"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type EventSink func(Event)

type Store struct {
	mu       sync.Mutex
	runs     map[string]*Run
	sessions map[string][]string
	maxRuns  int
}

func NewStore(maxRunsPerSession int) *Store {
	if maxRunsPerSession <= 0 {
		maxRunsPerSession = 20
	}
	return &Store{
		runs:     make(map[string]*Run),
		sessions: make(map[string][]string),
		maxRuns:  maxRunsPerSession,
	}
}

func NewTraceID(sessionID string) string {
	return fmt.Sprintf("%s-%d", sessionID, time.Now().UnixNano())
}

func (s *Store) StartRun(sessionID, traceID string) Run {
	now := time.Now()
	run := &Run{
		TraceID:   traceID,
		SessionID: sessionID,
		CreatedAt: now,
		UpdatedAt: now,
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	s.runs[traceID] = run
	s.sessions[sessionID] = append([]string{traceID}, s.sessions[sessionID]...)
	if len(s.sessions[sessionID]) > s.maxRuns {
		expired := s.sessions[sessionID][s.maxRuns:]
		s.sessions[sessionID] = s.sessions[sessionID][:s.maxRuns]
		for _, id := range expired {
			delete(s.runs, id)
		}
	}
	return *run
}

func (s *Store) UpsertStep(traceID string, step Step) Run {
	s.mu.Lock()
	defer s.mu.Unlock()

	run := s.runs[traceID]
	if run == nil {
		now := time.Now()
		run = &Run{TraceID: traceID, CreatedAt: now}
		s.runs[traceID] = run
	}

	updated := false
	for i := range run.Steps {
		if run.Steps[i].ID == step.ID {
			run.Steps[i] = mergeStep(run.Steps[i], step)
			updated = true
			break
		}
	}
	if !updated {
		run.Steps = append(run.Steps, step)
	}
	run.UpdatedAt = time.Now()
	return *run
}

func (s *Store) LatestRun(sessionID string) (Run, bool) {
	s.mu.Lock()
	defer s.mu.Unlock()

	ids := s.sessions[sessionID]
	if len(ids) == 0 {
		return Run{}, false
	}
	run, ok := s.runs[ids[0]]
	if !ok || run == nil {
		return Run{}, false
	}
	return *run, true
}

func mergeStep(current, update Step) Step {
	if update.Title != "" {
		current.Title = update.Title
	}
	if update.Status != "" {
		current.Status = update.Status
	}
	if update.Phase != "" {
		current.Phase = update.Phase
	}
	if update.ToolName != "" {
		current.ToolName = update.ToolName
	}
	if update.Description != "" {
		current.Description = update.Description
	}
	if update.Result != "" {
		current.Result = update.Result
	}
	if update.Evidence != nil {
		current.Evidence = update.Evidence
	}
	if update.DurationMs > 0 {
		current.DurationMs = update.DurationMs
	}
	if update.RiskLevel != "" {
		current.RiskLevel = update.RiskLevel
	}
	return current
}
