package knowledge

import (
	"context"
	"errors"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"
)

func TestUploadValidatesExtensionAndSize(t *testing.T) {
	service := NewService(Config{
		FileDir:           t.TempDir(),
		AllowedExtensions: []string{".md"},
		MaxUploadBytes:    4,
	})

	if _, err := service.Upload(t.Context(), "runbook.exe", strings.NewReader("ok")); !errors.Is(err, ErrUnsupportedExtension) {
		t.Fatalf("Upload() err = %v, want ErrUnsupportedExtension", err)
	}
	if _, err := service.Upload(t.Context(), "runbook.md", strings.NewReader("12345")); !errors.Is(err, ErrUploadTooLarge) {
		t.Fatalf("Upload() err = %v, want ErrUploadTooLarge", err)
	}
}

func TestUploadDedupesReadyDocumentByHash(t *testing.T) {
	service := NewService(Config{
		FileDir:           t.TempDir(),
		AllowedExtensions: []string{".md"},
		MaxUploadBytes:    1024,
	})
	state := newState()
	state.Documents["doc-1"] = &Document{
		ID:       "doc-1",
		FileName: "existing.md",
		SHA256:   "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824",
		Status:   DocumentStatusReady,
	}
	if err := service.store.Save(state); err != nil {
		t.Fatal(err)
	}

	result, err := service.Upload(t.Context(), "copy.md", strings.NewReader("hello"))
	if err != nil {
		t.Fatalf("Upload() error = %v", err)
	}
	if !result.Deduped {
		t.Fatal("Upload() Deduped = false, want true")
	}
	if result.Task != nil {
		t.Fatalf("Upload() Task = %#v, want nil", result.Task)
	}
	if result.Document.ID != "doc-1" {
		t.Fatalf("Upload() document ID = %s, want doc-1", result.Document.ID)
	}
}

func TestEscapeMilvusString(t *testing.T) {
	got := escapeMilvusString(`a\b"c`)
	want := `a\\b\"c`
	if got != want {
		t.Fatalf("escapeMilvusString() = %q, want %q", got, want)
	}
}

func TestCancelQueuedTaskMarksDocumentCanceled(t *testing.T) {
	service := NewService(Config{FileDir: t.TempDir()})
	now := time.Now()
	state := newState()
	state.Documents["doc-1"] = &Document{
		ID:           "doc-1",
		FileName:     "runbook.md",
		Status:       DocumentStatusIndexing,
		ActiveTaskID: "task-1",
		UpdatedAt:    now,
	}
	state.Tasks["task-1"] = &Task{
		ID:         "task-1",
		DocumentID: "doc-1",
		Type:       TaskTypeIndex,
		Status:     TaskStatusQueued,
		CreatedAt:  now,
		UpdatedAt:  now,
	}
	if err := service.store.Save(state); err != nil {
		t.Fatal(err)
	}

	task, err := service.CancelTask(t.Context(), "task-1")
	if err != nil {
		t.Fatalf("CancelTask() error = %v", err)
	}
	if task.Status != TaskStatusCanceled {
		t.Fatalf("CancelTask() status = %s, want %s", task.Status, TaskStatusCanceled)
	}
	doc, err := service.store.Document("doc-1")
	if err != nil {
		t.Fatal(err)
	}
	if doc.Status != DocumentStatusCanceled || doc.ActiveTaskID != "" || doc.LastError != cancelMessage {
		t.Fatalf("document after cancel = %#v", doc)
	}
}

func TestCancelRunningTaskImmediatelyMarksDocumentCanceled(t *testing.T) {
	service := NewService(Config{FileDir: t.TempDir(), IndexTimeout: time.Minute})
	saveIndexTask(t, service, "doc-1", "task-1")
	started := make(chan struct{})
	release := make(chan struct{})
	service.indexDocumentFn = func(ctx context.Context, documentID string) (indexResult, error) {
		close(started)
		<-release
		return indexResult{chunkCount: 7, source: "runbook.md"}, nil
	}
	done := make(chan struct{})
	go func() {
		defer close(done)
		service.runTask("task-1")
	}()
	<-started

	if _, err := service.CancelTask(t.Context(), "task-1"); err != nil {
		t.Fatalf("CancelTask() error = %v", err)
	}
	assertTaskAndDocumentStatus(t, service, "task-1", TaskStatusCanceled, "doc-1", DocumentStatusCanceled, cancelMessage)

	close(release)
	select {
	case <-done:
	case <-time.After(time.Second):
		t.Fatal("runTask did not finish after cancellation")
	}
	assertTaskAndDocumentStatus(t, service, "task-1", TaskStatusCanceled, "doc-1", DocumentStatusCanceled, cancelMessage)
}

func TestCancelRunningTaskWithoutCancelFuncStillMarksDocumentCanceled(t *testing.T) {
	service := NewService(Config{FileDir: t.TempDir(), IndexTimeout: time.Minute})
	saveIndexTask(t, service, "doc-1", "task-1")
	if err := service.store.Update(func(state *State) error {
		state.Tasks["task-1"].Status = TaskStatusRunning
		return nil
	}); err != nil {
		t.Fatal(err)
	}

	if _, err := service.CancelTask(t.Context(), "task-1"); err != nil {
		t.Fatalf("CancelTask() error = %v", err)
	}

	assertTaskAndDocumentStatus(t, service, "task-1", TaskStatusCanceled, "doc-1", DocumentStatusCanceled, cancelMessage)
}

func TestRunTaskTimeoutMarksDocumentCanceled(t *testing.T) {
	service := NewService(Config{FileDir: t.TempDir(), IndexTimeout: 10 * time.Millisecond})
	saveIndexTask(t, service, "doc-1", "task-1")
	service.indexDocumentFn = func(ctx context.Context, documentID string) (indexResult, error) {
		<-ctx.Done()
		return indexResult{}, ctx.Err()
	}

	service.runTask("task-1")

	assertTaskAndDocumentStatus(t, service, "task-1", TaskStatusCanceled, "doc-1", DocumentStatusCanceled, timeoutMessage)
}

func TestRunTaskFailureClearsActiveTask(t *testing.T) {
	service := NewService(Config{FileDir: t.TempDir()})
	saveIndexTask(t, service, "doc-1", "task-1")
	service.indexDocumentFn = func(ctx context.Context, documentID string) (indexResult, error) {
		return indexResult{}, errors.New("embedding failed")
	}

	service.runTask("task-1")

	assertTaskAndDocumentStatus(t, service, "task-1", TaskStatusFailed, "doc-1", DocumentStatusFailed, "embedding failed")
}

func TestCancelDeleteTaskIsRejected(t *testing.T) {
	service := NewService(Config{FileDir: t.TempDir()})
	now := time.Now()
	state := newState()
	state.Documents["doc-1"] = &Document{
		ID:           "doc-1",
		FileName:     "runbook.md",
		Status:       DocumentStatusReady,
		ActiveTaskID: "task-1",
		UpdatedAt:    now,
	}
	state.Tasks["task-1"] = &Task{
		ID:         "task-1",
		DocumentID: "doc-1",
		Type:       TaskTypeDelete,
		Status:     TaskStatusQueued,
		CreatedAt:  now,
		UpdatedAt:  now,
	}
	if err := service.store.Save(state); err != nil {
		t.Fatal(err)
	}

	if _, err := service.CancelTask(t.Context(), "task-1"); !errors.Is(err, ErrTaskNotCancelable) {
		t.Fatalf("CancelTask() err = %v, want ErrTaskNotCancelable", err)
	}
}

func TestCleanupCreatesTaskForBadIndexDocuments(t *testing.T) {
	for _, status := range []DocumentStatus{DocumentStatusFailed, DocumentStatusCanceled, DocumentStatusDeleteFailed} {
		t.Run(string(status), func(t *testing.T) {
			service := NewService(Config{FileDir: t.TempDir()})
			saveDocumentWithStatus(t, service, "doc-1", status)
			cleanupStarted := make(chan struct{})
			releaseCleanup := make(chan struct{})
			service.cleanupDocumentFn = func(ctx context.Context, documentID string) error {
				close(cleanupStarted)
				<-releaseCleanup
				return nil
			}

			task, err := service.Cleanup(t.Context(), "doc-1")
			if err != nil {
				t.Fatalf("Cleanup() error = %v", err)
			}
			if task.Type != TaskTypeCleanup || task.Status != TaskStatusQueued {
				t.Fatalf("Cleanup() task = %#v, want cleanup queued", task)
			}
			doc, err := service.store.Document("doc-1")
			if err != nil {
				t.Fatal(err)
			}
			if doc.ActiveTaskID != task.ID {
				t.Fatalf("ActiveTaskID = %q, want %q", doc.ActiveTaskID, task.ID)
			}
			<-cleanupStarted
			close(releaseCleanup)
			waitForTaskStatus(t, service, task.ID, TaskStatusSucceeded)
		})
	}
}

func TestCleanupRejectsNonBadIndexDocuments(t *testing.T) {
	for _, status := range []DocumentStatus{DocumentStatusReady, DocumentStatusIndexing} {
		t.Run(string(status), func(t *testing.T) {
			service := NewService(Config{FileDir: t.TempDir()})
			saveDocumentWithStatus(t, service, "doc-1", status)

			if _, err := service.Cleanup(t.Context(), "doc-1"); !errors.Is(err, ErrDocumentNotCleanable) {
				t.Fatalf("Cleanup() err = %v, want ErrDocumentNotCleanable", err)
			}
		})
	}
}

func TestSetDocumentEnabledPersistsState(t *testing.T) {
	service := NewService(Config{FileDir: t.TempDir()})
	saveDocumentWithStatus(t, service, "doc-1", DocumentStatusReady)

	doc, err := service.SetDocumentEnabled(t.Context(), "doc-1", false)
	if err != nil {
		t.Fatalf("SetDocumentEnabled() error = %v", err)
	}
	if doc.Enabled == nil || *doc.Enabled {
		t.Fatalf("Enabled = %#v, want false", doc.Enabled)
	}

	stored, err := service.store.Document("doc-1")
	if err != nil {
		t.Fatal(err)
	}
	if stored.Enabled == nil || *stored.Enabled {
		t.Fatalf("stored Enabled = %#v, want false", stored.Enabled)
	}
}

func TestReindexAllQueuesEnabledReadyDocuments(t *testing.T) {
	dir := t.TempDir()
	service := NewService(Config{FileDir: dir})
	service.indexDocumentFn = func(ctx context.Context, documentID string) (indexResult, error) {
		return indexResult{chunkCount: 1, source: documentID}, nil
	}
	enabledFile := writeKnowledgeFile(t, dir, "enabled.md")
	disabledFile := writeKnowledgeFile(t, dir, "disabled.md")
	enabled := true
	disabled := false
	now := time.Now()
	state := newState()
	state.Documents["doc-enabled"] = &Document{
		ID:        "doc-enabled",
		FileName:  "enabled.md",
		FilePath:  enabledFile,
		Status:    DocumentStatusReady,
		Enabled:   &enabled,
		UpdatedAt: now,
	}
	state.Documents["doc-disabled"] = &Document{
		ID:        "doc-disabled",
		FileName:  "disabled.md",
		FilePath:  disabledFile,
		Status:    DocumentStatusReady,
		Enabled:   &disabled,
		UpdatedAt: now,
	}
	if err := service.store.Save(state); err != nil {
		t.Fatal(err)
	}

	result, err := service.ReindexAll(t.Context())
	if err != nil {
		t.Fatalf("ReindexAll() error = %v", err)
	}
	if len(result.Tasks) != 1 || result.Tasks[0].DocumentID != "doc-enabled" {
		t.Fatalf("ReindexAll() tasks = %#v, want only doc-enabled", result.Tasks)
	}
	doc, err := service.store.Document("doc-enabled")
	if err != nil {
		t.Fatal(err)
	}
	if doc.Status != DocumentStatusIndexing || doc.ActiveTaskID != result.Tasks[0].ID {
		t.Fatalf("doc-enabled = %#v, want indexing with active task", doc)
	}
	waitForTaskStatus(t, service, result.Tasks[0].ID, TaskStatusSucceeded)
}

func TestCleanupTaskSuccessRemovesDocument(t *testing.T) {
	service := NewService(Config{FileDir: t.TempDir()})
	saveCleanupTask(t, service, "doc-1", "task-1", DocumentStatusFailed)
	var cleanedDocID string
	service.cleanupDocumentFn = func(ctx context.Context, documentID string) error {
		cleanedDocID = documentID
		return nil
	}

	service.runTask("task-1")

	if cleanedDocID != "doc-1" {
		t.Fatalf("cleanupDocumentFn documentID = %q, want doc-1", cleanedDocID)
	}
	if _, err := service.store.Document("doc-1"); !errors.Is(err, ErrDocumentNotFound) {
		t.Fatalf("Document() err = %v, want ErrDocumentNotFound", err)
	}
	storedTask, err := service.store.Task("task-1")
	if err != nil {
		t.Fatal(err)
	}
	if storedTask.Status != TaskStatusSucceeded {
		t.Fatalf("task status = %s, want succeeded", storedTask.Status)
	}
}

func TestCleanupTaskFailureMarksDeleteFailed(t *testing.T) {
	service := NewService(Config{FileDir: t.TempDir()})
	saveCleanupTask(t, service, "doc-1", "task-1", DocumentStatusCanceled)
	service.cleanupDocumentFn = func(ctx context.Context, documentID string) error {
		return errors.New("milvus delete failed")
	}

	service.runTask("task-1")

	assertTaskAndDocumentStatus(t, service, "task-1", TaskStatusFailed, "doc-1", DocumentStatusDeleteFailed, "milvus delete failed")
}

func TestCleanupSourcePrefersStoredSource(t *testing.T) {
	got := cleanupSource(&Document{Source: "stored-source", FilePath: "file-path"})
	if got != "stored-source" {
		t.Fatalf("cleanupSource() = %q, want stored-source", got)
	}
	got = cleanupSource(&Document{FilePath: "file-path"})
	if got != "file-path" {
		t.Fatalf("cleanupSource() fallback = %q, want file-path", got)
	}
}

func saveIndexTask(t *testing.T, service *Service, documentID, taskID string) {
	t.Helper()
	now := time.Now()
	state := newState()
	state.Documents[documentID] = &Document{
		ID:           documentID,
		FileName:     "runbook.md",
		FilePath:     "runbook.md",
		Status:       DocumentStatusIndexing,
		ActiveTaskID: taskID,
		UpdatedAt:    now,
	}
	state.Tasks[taskID] = &Task{
		ID:         taskID,
		DocumentID: documentID,
		Type:       TaskTypeIndex,
		Status:     TaskStatusQueued,
		CreatedAt:  now,
		UpdatedAt:  now,
	}
	if err := service.store.Save(state); err != nil {
		t.Fatal(err)
	}
}

func saveDocumentWithStatus(t *testing.T, service *Service, documentID string, status DocumentStatus) {
	t.Helper()
	now := time.Now()
	state := newState()
	state.Documents[documentID] = &Document{
		ID:        documentID,
		FileName:  "runbook.md",
		FilePath:  "missing-runbook.md",
		Source:    "stored-source",
		Status:    status,
		UpdatedAt: now,
	}
	if err := service.store.Save(state); err != nil {
		t.Fatal(err)
	}
}

func writeKnowledgeFile(t *testing.T, dir, name string) string {
	t.Helper()
	path := filepath.Join(dir, name)
	if err := os.WriteFile(path, []byte("# Runbook\ncontent"), 0600); err != nil {
		t.Fatal(err)
	}
	return path
}

func saveCleanupTask(t *testing.T, service *Service, documentID, taskID string, status DocumentStatus) {
	t.Helper()
	now := time.Now()
	state := newState()
	state.Documents[documentID] = &Document{
		ID:           documentID,
		FileName:     "runbook.md",
		FilePath:     "missing-runbook.md",
		Source:       "stored-source",
		Status:       status,
		ActiveTaskID: taskID,
		UpdatedAt:    now,
	}
	state.Tasks[taskID] = &Task{
		ID:         taskID,
		DocumentID: documentID,
		Type:       TaskTypeCleanup,
		Status:     TaskStatusQueued,
		CreatedAt:  now,
		UpdatedAt:  now,
	}
	if err := service.store.Save(state); err != nil {
		t.Fatal(err)
	}
}

func assertTaskAndDocumentStatus(t *testing.T, service *Service, taskID string, taskStatus TaskStatus, documentID string, documentStatus DocumentStatus, message string) {
	t.Helper()
	task, err := service.store.Task(taskID)
	if err != nil {
		t.Fatal(err)
	}
	if task.Status != taskStatus || task.Error != message || task.FinishedAt == nil {
		t.Fatalf("task = %#v, want status %s and error %q", task, taskStatus, message)
	}
	doc, err := service.store.Document(documentID)
	if err != nil {
		t.Fatal(err)
	}
	if doc.Status != documentStatus || doc.ActiveTaskID != "" || doc.LastError != message {
		t.Fatalf("document = %#v, want status %s, no active task, error %q", doc, documentStatus, message)
	}
}

func waitForTaskStatus(t *testing.T, service *Service, taskID string, status TaskStatus) {
	t.Helper()
	deadline := time.After(time.Second)
	ticker := time.NewTicker(10 * time.Millisecond)
	defer ticker.Stop()
	for {
		select {
		case <-deadline:
			task, err := service.store.Task(taskID)
			if err != nil {
				t.Fatal(err)
			}
			t.Fatalf("task status = %s, want %s", task.Status, status)
		case <-ticker.C:
			task, err := service.store.Task(taskID)
			if err != nil {
				t.Fatal(err)
			}
			if task.Status == status {
				return
			}
		}
	}
}
