package chat

import (
	"SuperBizAgent/api/chat/v1"
	"SuperBizAgent/internal/taskrecord"
	"SuperBizAgent/utility/common"
	"context"
	"errors"
	"net/http"
	"strings"
	"sync"

	"github.com/gogf/gf/v2/errors/gerror"
	"github.com/gogf/gf/v2/frame/g"
)

var (
	taskStoreMu  sync.Mutex
	taskStoreKey string
	taskStore    *taskrecord.Store
)

func (c *ControllerV1) AgentTasks(ctx context.Context, req *v1.AgentTasksReq) (res *v1.AgentTasksRes, err error) {
	tasks, err := newTaskRecordStore().List(taskrecord.ListFilter{
		Status:  taskrecord.Status(strings.TrimSpace(req.Status)),
		Keyword: req.Keyword,
		Limit:   req.Limit,
	})
	if err != nil {
		return nil, taskRecordHTTPError(ctx, err)
	}
	out := make([]v1.AgentTask, 0, len(tasks))
	for _, task := range tasks {
		out = append(out, toAgentTask(task))
	}
	return &v1.AgentTasksRes{Tasks: out}, nil
}

func (c *ControllerV1) AgentTaskDetail(ctx context.Context, req *v1.AgentTaskDetailReq) (res *v1.AgentTaskDetailRes, err error) {
	id := strings.TrimSpace(req.ID)
	if id == "" {
		return nil, gerror.New("任务ID不能为空")
	}
	task, err := newTaskRecordStore().Task(id)
	if err != nil {
		return nil, taskRecordHTTPError(ctx, err)
	}
	return &v1.AgentTaskDetailRes{Task: toAgentTask(*task)}, nil
}

func newTaskRecordStore() *taskrecord.Store {
	key := common.FileDir
	taskStoreMu.Lock()
	defer taskStoreMu.Unlock()
	if taskStore == nil || taskStoreKey != key {
		taskStore = taskrecord.NewStore(key)
		taskStoreKey = key
	}
	return taskStore
}

func taskRecordHTTPError(ctx context.Context, err error) error {
	req := g.RequestFromCtx(ctx)
	if req != nil {
		switch {
		case errors.Is(err, taskrecord.ErrTaskNotFound):
			req.Response.Status = http.StatusNotFound
		case errors.Is(err, taskrecord.ErrInvalidTaskStatus):
			req.Response.Status = http.StatusBadRequest
			return gerror.New("任务状态只支持 running、succeeded、failed")
		}
	}
	return err
}

func toAgentTask(task taskrecord.Task) v1.AgentTask {
	steps := make([]v1.AgentTaskStep, 0, len(task.Steps))
	for _, step := range task.Steps {
		steps = append(steps, v1.AgentTaskStep{
			ID:          step.ID,
			Title:       step.Title,
			Status:      string(step.Status),
			Phase:       string(step.Phase),
			ToolName:    step.ToolName,
			Description: step.Description,
			Result:      step.Result,
			Evidence:    step.Evidence,
			DurationMs:  step.DurationMs,
			RiskLevel:   string(step.RiskLevel),
		})
	}
	return v1.AgentTask{
		ID:         task.ID,
		SessionID:  task.SessionID,
		TraceID:    task.TraceID,
		Title:      task.Title,
		Question:   task.Question,
		Answer:     task.Answer,
		Mode:       string(task.Mode),
		Status:     string(task.Status),
		Steps:      steps,
		Error:      task.Error,
		CreatedAt:  formatTime(task.CreatedAt),
		UpdatedAt:  formatTime(task.UpdatedAt),
		StartedAt:  formatOptionalTime(task.StartedAt),
		FinishedAt: formatOptionalTime(task.FinishedAt),
	}
}
