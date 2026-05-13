package knowledge

import (
	"errors"
	"strings"
	"testing"
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
