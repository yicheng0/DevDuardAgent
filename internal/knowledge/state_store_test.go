package knowledge

import (
	"os"
	"path/filepath"
	"testing"
	"time"
)

func TestStateStoreSaveLoadAndSortDocuments(t *testing.T) {
	dir := t.TempDir()
	store := NewStateStore(dir)
	now := time.Now()
	old := now.Add(-time.Hour)
	state := newState()
	state.Documents["old"] = &Document{
		ID:        "old",
		FileName:  "old.md",
		Status:    DocumentStatusReady,
		UpdatedAt: old,
	}
	state.Documents["new"] = &Document{
		ID:        "new",
		FileName:  "new.md",
		Status:    DocumentStatusReady,
		UpdatedAt: now,
	}
	state.Documents["deleted"] = &Document{
		ID:        "deleted",
		FileName:  "deleted.md",
		Status:    DocumentStatusDeleted,
		UpdatedAt: now.Add(time.Hour),
	}

	if err := store.Save(state); err != nil {
		t.Fatalf("Save() error = %v", err)
	}
	docs, err := store.Documents()
	if err != nil {
		t.Fatalf("Documents() error = %v", err)
	}
	if len(docs) != 2 {
		t.Fatalf("Documents() len = %d, want 2", len(docs))
	}
	if docs[0].ID != "new" || docs[1].ID != "old" {
		t.Fatalf("Documents() order = [%s %s], want [new old]", docs[0].ID, docs[1].ID)
	}
	if _, err := os.Stat(filepath.Join(dir, ".devguard", stateFileName)); err != nil {
		t.Fatalf("state file not written: %v", err)
	}
}

func TestStateStoreCorruptJSONReturnsError(t *testing.T) {
	dir := t.TempDir()
	store := NewStateStore(dir)
	if err := os.MkdirAll(filepath.Dir(store.StatePath()), 0700); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(store.StatePath(), []byte("{bad-json"), 0600); err != nil {
		t.Fatal(err)
	}
	if _, err := store.Load(); err == nil {
		t.Fatal("Load() error = nil, want error")
	}
}
