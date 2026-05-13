package knowledge

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"sync"
)

const stateFileName = "knowledge_state.json"

type StateStore struct {
	path string
	mu   sync.Mutex
}

func NewStateStore(fileDir string) *StateStore {
	return &StateStore{
		path: filepath.Join(fileDir, ".devguard", stateFileName),
	}
}

func (s *StateStore) StatePath() string {
	return s.path
}

func (s *StateStore) Load() (*State, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.loadLocked()
}

func (s *StateStore) Save(state *State) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	return s.saveLocked(normalizeState(state))
}

func (s *StateStore) Update(fn func(*State) error) error {
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

func (s *StateStore) Documents() ([]Document, error) {
	state, err := s.Load()
	if err != nil {
		return nil, err
	}
	docs := make([]Document, 0, len(state.Documents))
	for _, doc := range state.Documents {
		if doc.Status == DocumentStatusDeleted {
			continue
		}
		docs = append(docs, *doc)
	}
	sort.Slice(docs, func(i, j int) bool {
		return docs[i].UpdatedAt.After(docs[j].UpdatedAt)
	})
	return docs, nil
}

func (s *StateStore) Task(id string) (*Task, error) {
	state, err := s.Load()
	if err != nil {
		return nil, err
	}
	task, ok := state.Tasks[id]
	if !ok {
		return nil, ErrTaskNotFound
	}
	cp := *task
	return &cp, nil
}

func (s *StateStore) Document(id string) (*Document, error) {
	state, err := s.Load()
	if err != nil {
		return nil, err
	}
	doc, ok := state.Documents[id]
	if !ok || doc.Status == DocumentStatusDeleted {
		return nil, ErrDocumentNotFound
	}
	cp := *doc
	return &cp, nil
}

func (s *StateStore) loadLocked() (*State, error) {
	data, err := os.ReadFile(s.path)
	if errors.Is(err, os.ErrNotExist) {
		return newState(), nil
	}
	if err != nil {
		return nil, fmt.Errorf("read knowledge state: %w", err)
	}
	if len(data) == 0 {
		return newState(), nil
	}
	state := newState()
	if err := json.Unmarshal(data, state); err != nil {
		return nil, fmt.Errorf("parse knowledge state: %w", err)
	}
	return normalizeState(state), nil
}

func (s *StateStore) saveLocked(state *State) error {
	if err := os.MkdirAll(filepath.Dir(s.path), 0700); err != nil {
		return fmt.Errorf("create knowledge state dir: %w", err)
	}
	data, err := json.MarshalIndent(state, "", "  ")
	if err != nil {
		return fmt.Errorf("marshal knowledge state: %w", err)
	}
	tmp := s.path + ".tmp"
	if err := os.WriteFile(tmp, data, 0600); err != nil {
		return fmt.Errorf("write knowledge state tmp: %w", err)
	}
	if err := os.Rename(tmp, s.path); err != nil {
		_ = os.Remove(tmp)
		return fmt.Errorf("replace knowledge state: %w", err)
	}
	return nil
}

func normalizeState(state *State) *State {
	if state == nil {
		return newState()
	}
	if state.Documents == nil {
		state.Documents = make(map[string]*Document)
	}
	if state.Tasks == nil {
		state.Tasks = make(map[string]*Task)
	}
	return state
}
