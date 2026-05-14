package chatmemory

import (
	"strings"
	"testing"
)

func TestEscapeMilvusString(t *testing.T) {
	got := EscapeMilvusString(`a\b"c`)
	want := `a\\b\"c`
	if got != want {
		t.Fatalf("EscapeMilvusString() = %q, want %q", got, want)
	}
}

func TestTruncateUTF8Bytes(t *testing.T) {
	value := "用户问题：" + strings.Repeat("异常", 5000)
	got := truncateUTF8Bytes(value, 32)
	if len(got) > 32 {
		t.Fatalf("truncateUTF8Bytes() len = %d, want <= 32", len(got))
	}
}
