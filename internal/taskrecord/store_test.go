package taskrecord

import (
	agenttrace "SuperBizAgent/internal/trace"
	"testing"
)

func TestStoreCreateCompleteAndList(t *testing.T) {
	store := NewStore(t.TempDir())

	created, err := store.Create(CreateInput{
		ID:        "task-1",
		SessionID: "session-1",
		TraceID:   "trace-1",
		Question:  "订单服务错误率升高",
		Mode:      ModeStream,
	})
	if err != nil {
		t.Fatalf("Create() error = %v", err)
	}
	if created.Status != StatusRunning {
		t.Fatalf("Create() status = %s, want %s", created.Status, StatusRunning)
	}

	_, err = store.Complete(CompleteInput{
		ID:     "task-1",
		Status: StatusSucceeded,
		Answer: "已定位到数据库连接池耗尽",
		Steps: []agenttrace.Step{
			{ID: "respond", Title: "生成处置建议", Status: agenttrace.StatusCompleted},
		},
	})
	if err != nil {
		t.Fatalf("Complete() error = %v", err)
	}

	tasks, err := store.List(ListFilter{Status: StatusSucceeded, Keyword: "数据库"})
	if err != nil {
		t.Fatalf("List() error = %v", err)
	}
	if len(tasks) != 1 {
		t.Fatalf("List() len = %d, want 1", len(tasks))
	}
	if tasks[0].Answer == "" || len(tasks[0].Steps) != 1 || tasks[0].FinishedAt == nil {
		t.Fatalf("List() task missing completion fields: %#v", tasks[0])
	}

	detail, err := store.Task("task-1")
	if err != nil {
		t.Fatalf("Task() error = %v", err)
	}
	if detail.ID != "task-1" || detail.Status != StatusSucceeded {
		t.Fatalf("Task() = %#v, want completed task-1", detail)
	}
}

func TestStoreMissingAndEmptyState(t *testing.T) {
	store := NewStore(t.TempDir())

	tasks, err := store.List(ListFilter{})
	if err != nil {
		t.Fatalf("List() on missing state error = %v", err)
	}
	if len(tasks) != 0 {
		t.Fatalf("List() len = %d, want 0", len(tasks))
	}

	if _, err := store.Task("missing"); err != ErrTaskNotFound {
		t.Fatalf("Task() error = %v, want ErrTaskNotFound", err)
	}
}

func TestStoreLimitAndOrdering(t *testing.T) {
	store := NewStore(t.TempDir())
	for _, id := range []string{"task-1", "task-2", "task-3"} {
		if _, err := store.Create(CreateInput{ID: id, Question: id}); err != nil {
			t.Fatalf("Create(%s) error = %v", id, err)
		}
	}

	tasks, err := store.List(ListFilter{Limit: 2})
	if err != nil {
		t.Fatalf("List() error = %v", err)
	}
	if len(tasks) != 2 {
		t.Fatalf("List() len = %d, want 2", len(tasks))
	}
	if tasks[0].ID != "task-3" {
		t.Fatalf("List()[0].ID = %s, want task-3", tasks[0].ID)
	}
}

func TestStoreRejectsInvalidStatus(t *testing.T) {
	store := NewStore(t.TempDir())
	if _, err := store.Create(CreateInput{ID: "task-1", Question: "test"}); err != nil {
		t.Fatalf("Create() error = %v", err)
	}

	if _, err := store.List(ListFilter{Status: Status("bad")}); err != ErrInvalidTaskStatus {
		t.Fatalf("List() error = %v, want ErrInvalidTaskStatus", err)
	}
	if _, err := store.Complete(CompleteInput{ID: "task-1", Status: Status("bad")}); err != ErrInvalidTaskStatus {
		t.Fatalf("Complete() error = %v, want ErrInvalidTaskStatus", err)
	}
}

func TestStoreCompleteFailedTask(t *testing.T) {
	store := NewStore(t.TempDir())
	if _, err := store.Create(CreateInput{ID: "task-1", Question: "test"}); err != nil {
		t.Fatalf("Create() error = %v", err)
	}

	task, err := store.Complete(CompleteInput{
		ID:     "task-1",
		Status: StatusFailed,
		Answer: "partial answer",
		Error:  "model timeout",
	})
	if err != nil {
		t.Fatalf("Complete() error = %v", err)
	}
	if task.Status != StatusFailed || task.Answer == "" || task.Error == "" || task.FinishedAt == nil {
		t.Fatalf("Complete() failed task = %#v", task)
	}
}

func TestStoreSetImportant(t *testing.T) {
	store := NewStore(t.TempDir())
	if _, err := store.Create(CreateInput{ID: "task-1", Question: "test"}); err != nil {
		t.Fatalf("Create() error = %v", err)
	}

	task, err := store.SetImportant(ImportantInput{
		ID:        "task-1",
		Important: true,
		MemoryID:  "chat-memory-task-1",
	})
	if err != nil {
		t.Fatalf("SetImportant(true) error = %v", err)
	}
	if !task.Important || task.MemoryID != "chat-memory-task-1" || task.ImportantAt == nil {
		t.Fatalf("SetImportant(true) task = %#v", task)
	}

	task, err = store.SetImportant(ImportantInput{ID: "task-1", Important: false})
	if err != nil {
		t.Fatalf("SetImportant(false) error = %v", err)
	}
	if task.Important || task.MemoryID != "" || task.ImportantAt != nil {
		t.Fatalf("SetImportant(false) task = %#v", task)
	}
}

func TestStoreDeleteTask(t *testing.T) {
	store := NewStore(t.TempDir())
	if _, err := store.Create(CreateInput{ID: "task-1", Question: "test"}); err != nil {
		t.Fatalf("Create() error = %v", err)
	}

	deleted, err := store.Delete("task-1")
	if err != nil {
		t.Fatalf("Delete() error = %v", err)
	}
	if deleted.ID != "task-1" {
		t.Fatalf("Delete() = %#v, want task-1", deleted)
	}
	if _, err := store.Task("task-1"); err != ErrTaskNotFound {
		t.Fatalf("Task() after delete error = %v, want ErrTaskNotFound", err)
	}
}

func TestStoreDeleteBySession(t *testing.T) {
	store := NewStore(t.TempDir())
	for _, input := range []CreateInput{
		{ID: "task-1", SessionID: "session-1", Question: "one"},
		{ID: "task-2", SessionID: "session-2", Question: "two"},
		{ID: "task-3", SessionID: "session-1", Question: "three"},
	} {
		if _, err := store.Create(input); err != nil {
			t.Fatalf("Create(%s) error = %v", input.ID, err)
		}
	}

	deleted, err := store.DeleteBySession("session-1")
	if err != nil {
		t.Fatalf("DeleteBySession() error = %v", err)
	}
	if len(deleted) != 2 {
		t.Fatalf("DeleteBySession() len = %d, want 2", len(deleted))
	}
	if _, err := store.Task("task-1"); err != ErrTaskNotFound {
		t.Fatalf("Task(task-1) error = %v, want ErrTaskNotFound", err)
	}
	if _, err := store.Task("task-3"); err != ErrTaskNotFound {
		t.Fatalf("Task(task-3) error = %v, want ErrTaskNotFound", err)
	}
	if task, err := store.Task("task-2"); err != nil || task.SessionID != "session-2" {
		t.Fatalf("Task(task-2) = %#v, %v; want session-2", task, err)
	}
}

func TestStoreTasksBySession(t *testing.T) {
	store := NewStore(t.TempDir())
	for _, input := range []CreateInput{
		{ID: "task-1", SessionID: "session-1", Question: "one"},
		{ID: "task-2", SessionID: "session-2", Question: "two"},
		{ID: "task-3", SessionID: "session-1", Question: "three"},
	} {
		if _, err := store.Create(input); err != nil {
			t.Fatalf("Create(%s) error = %v", input.ID, err)
		}
	}

	tasks, err := store.TasksBySession("session-1")
	if err != nil {
		t.Fatalf("TasksBySession() error = %v", err)
	}
	if len(tasks) != 2 {
		t.Fatalf("TasksBySession() len = %d, want 2", len(tasks))
	}
	for _, task := range tasks {
		if task.SessionID != "session-1" {
			t.Fatalf("TasksBySession() included wrong task = %#v", task)
		}
	}
}
