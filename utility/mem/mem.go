package mem

import (
	"sync"

	"github.com/cloudwego/eino/schema"
)

var SimpleMemoryMap = make(map[string]*SimpleMemory)
var mu sync.Mutex

func GetSimpleMemory(id string) *SimpleMemory {
	mu.Lock()
	defer mu.Unlock()
	// 如果存在就返回，不存在就创建
	if mem, ok := SimpleMemoryMap[id]; ok {
		return mem
	} else {
		newMem := &SimpleMemory{
			ID:            id,
			Messages:      []*schema.Message{},
			MaxWindowSize: 6,
		}
		SimpleMemoryMap[id] = newMem
		return newMem
	}
}

type SimpleMemory struct {
	ID            string            `json:"id"`
	Messages      []*schema.Message `json:"messages"`
	MaxWindowSize int
	mu            sync.Mutex
}

func (c *SimpleMemory) SetMessages(msg *schema.Message) {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.Messages = append(c.Messages, msg)
	if len(c.Messages) > c.MaxWindowSize {
		// 只保留最近窗口，避免历史无限增长
		excess := len(c.Messages) - c.MaxWindowSize
		c.Messages = c.Messages[excess:]
	}
}

func (c *SimpleMemory) SetUserMessage(content string) {
	c.SetMessages(schema.UserMessage(content))
}

func (c *SimpleMemory) SetAssistantMessage(content string) {
	c.SetMessages(schema.AssistantMessage(content, nil))
}

func (c *SimpleMemory) GetMessages() []*schema.Message {
	c.mu.Lock()
	defer c.mu.Unlock()

	return append([]*schema.Message(nil), c.Messages...)
}
