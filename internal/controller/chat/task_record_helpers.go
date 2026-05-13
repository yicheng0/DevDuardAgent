package chat

import (
	"SuperBizAgent/internal/taskrecord"
	agenttrace "SuperBizAgent/internal/trace"
	"fmt"
	"time"
)

func newAgentTaskID() string {
	return fmt.Sprintf("agent-task-%d", time.Now().UnixNano())
}

func completeAgentTask(store *taskrecord.Store, traces *agenttrace.Store, taskID, traceID string, status taskrecord.Status, answer, message string) error {
	var steps []agenttrace.Step
	if run, ok := traces.Run(traceID); ok {
		steps = run.Steps
	}
	_, err := store.Complete(taskrecord.CompleteInput{
		ID:     taskID,
		Status: status,
		Answer: answer,
		Steps:  steps,
		Error:  message,
	})
	return err
}
