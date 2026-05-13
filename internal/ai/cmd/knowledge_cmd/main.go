package main

import (
	"SuperBizAgent/internal/knowledge"
	"context"
	"fmt"
	"io/fs"
	"os"
	"path/filepath"
	"strings"
	"time"
)

func main() {
	ctx := context.Background()
	service := knowledge.NewService(knowledge.ConfigFromRuntime(ctx))

	err := filepath.WalkDir("./docs", func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return fmt.Errorf("walk dir failed: %w", err)
		}
		if d.IsDir() {
			return nil
		}
		ext := strings.ToLower(filepath.Ext(path))
		if ext != ".md" && ext != ".markdown" && ext != ".txt" {
			fmt.Printf("[skip] unsupported knowledge file: %s\n", path)
			return nil
		}

		fmt.Printf("[start] queue indexing file: %s\n", path)
		file, err := os.Open(path)
		if err != nil {
			return err
		}
		defer file.Close()
		result, err := service.Upload(ctx, filepath.Base(path), file)
		if err != nil {
			return err
		}
		if result.Deduped {
			fmt.Printf("[skip] duplicate ready document: %s\n", result.Document.FileName)
			return nil
		}
		if result.Task == nil {
			return fmt.Errorf("missing index task for %s", path)
		}
		for {
			task, err := service.Task(result.Task.ID)
			if err != nil {
				return err
			}
			if task.Status == knowledge.TaskStatusSucceeded {
				fmt.Printf("[done] indexed file: %s\n", path)
				return nil
			}
			if task.Status == knowledge.TaskStatusFailed {
				return fmt.Errorf("index failed for %s: %s", path, task.Error)
			}
			time.Sleep(300 * time.Millisecond)
		}
	})
	if err != nil {
		panic(err)
	}
}
