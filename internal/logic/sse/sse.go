package sse

import (
	"context"
	"encoding/json"
	"fmt"
	"sync"
	"time"

	"github.com/gogf/gf/v2/container/gmap"
	"github.com/gogf/gf/v2/net/ghttp"
	"github.com/gogf/gf/v2/util/guid"
)

// Client 表示SSE客户端连接
type Client struct {
	Id          string
	Request     *ghttp.Request
	messageChan chan string
	writeMu     sync.Mutex
}

// Service SSE服务
type Service struct {
	clients *gmap.StrAnyMap // 存储所有客户端连接
}

// New 创建SSE服务实例
func New() *Service {
	return &Service{
		clients: gmap.NewStrAnyMap(true),
	}
}

// Create 创建SSE连接
func (s *Service) Create(ctx context.Context, r *ghttp.Request) (*Client, error) {
	// 设置SSE必要的HTTP头
	r.Response.Header().Set("Content-Type", "text/event-stream")
	r.Response.Header().Set("Cache-Control", "no-cache")
	r.Response.Header().Set("Connection", "keep-alive")
	r.Response.Header().Set("Access-Control-Allow-Origin", "*")
	// 创建新客户端
	clientId := r.Get("client_id", guid.S()).String()
	client := &Client{
		Id:          clientId,
		Request:     r,
		messageChan: make(chan string, 100),
	}
	// 发送连接成功消息
	r.Response.Writef("id: %s\n", clientId)
	r.Response.WriteString("event: connected\n")
	connectedPayload, _ := json.Marshal(map[string]string{
		"status":    "connected",
		"client_id": clientId,
	})
	r.Response.Writef("data: %s\n\n", string(connectedPayload))
	r.Response.Flush()
	return client, nil
}

// SendToClient 向指定客户端发送消息
func (c *Client) SendToClient(eventType, data string) bool {
	msg := fmt.Sprintf("id: %d\nevent: %s\ndata: %s\n\n", time.Now().UnixNano(), eventType, data)
	c.writeMu.Lock()
	defer c.writeMu.Unlock()
	c.Request.Response.WriteString(msg)
	c.Request.Response.Flush()
	return true
}

func (c *Client) SendJSON(eventType string, payload any) bool {
	b, err := json.Marshal(payload)
	if err != nil {
		b, _ = json.Marshal(map[string]string{"message": err.Error()})
	}
	return c.SendToClient(eventType, string(b))
}
