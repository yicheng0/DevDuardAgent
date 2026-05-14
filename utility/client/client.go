package client

import (
	"SuperBizAgent/utility/common"
	"context"
	"fmt"
	"net"
	"sync"
	"time"

	"github.com/gogf/gf/v2/frame/g"
	cli "github.com/milvus-io/milvus-sdk-go/v2/client"
	"github.com/milvus-io/milvus-sdk-go/v2/entity"
)

var milvusClientCache sync.Map

const defaultMilvusOperationTimeout = 8 * time.Second

type MilvusHealth struct {
	Address          string `json:"address"`
	OK               bool   `json:"ok"`
	TCPOK            bool   `json:"tcpOk"`
	SDKOK            bool   `json:"sdkOk"`
	DatabaseOK       bool   `json:"databaseOk"`
	CollectionOK     bool   `json:"collectionOk"`
	CollectionLoaded bool   `json:"collectionLoaded"`
	Message          string `json:"message"`
	Error            string `json:"error,omitempty"`
	Suggestion       string `json:"suggestion,omitempty"`
	DurationMs       int64  `json:"durationMs"`
}

func NewMilvusClient(ctx context.Context) (cli.Client, error) {
	ctx, cancel := withDefaultTimeout(ctx)
	defer cancel()
	address, err := g.Cfg().Get(ctx, "milvus.address")
	if err != nil {
		return nil, fmt.Errorf("failed to read milvus address: %w", err)
	}
	milvusAddress := address.String()
	if milvusAddress == "" {
		milvusAddress = "localhost:19530"
	}
	if cached, ok := milvusClientCache.Load(milvusAddress); ok {
		agentClient := cached.(cli.Client)
		if err := ensureCollectionLoaded(ctx, agentClient); err == nil {
			return agentClient, nil
		}
		agentClient.Close()
		milvusClientCache.Delete(milvusAddress)
	}
	// 1. 先连接default数据库
	defaultClient, err := cli.NewClient(ctx, cli.Config{
		Address: milvusAddress,
		DBName:  "default",
	})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to default database: %w", err)
	}
	defer defaultClient.Close()
	// 2. 检查agent数据库是否存在，不存在则创建
	databases, err := defaultClient.ListDatabases(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to list databases: %w", err)
	}
	agentDBExists := false
	for _, db := range databases {
		if db.Name == common.MilvusDBName {
			agentDBExists = true
			break
		}
	}
	if !agentDBExists {
		err = defaultClient.CreateDatabase(ctx, common.MilvusDBName)
		if err != nil {
			return nil, fmt.Errorf("failed to create agent database: %w", err)
		}
	}

	// 3. 创建连接到agent数据库的客户端
	agentClient, err := cli.NewClient(ctx, cli.Config{
		Address: milvusAddress,
		DBName:  common.MilvusDBName,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to agent database: %w", err)
	}
	// 4. 检查biz collection是否存在，不存在则创建
	collections, err := agentClient.ListCollections(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to list collections: %w", err)
	}

	bizCollectionExists := false
	for _, collection := range collections {
		if collection.Name == common.MilvusCollectionName {
			bizCollectionExists = true
			break
		}
	}

	if !bizCollectionExists {
		// 创建biz collection的schema
		schema := &entity.Schema{
			CollectionName: common.MilvusCollectionName,
			Description:    "Business knowledge collection",
			Fields:         fields,
		}

		err = agentClient.CreateCollection(ctx, schema, entity.DefaultShardNumber)
		if err != nil {
			return nil, fmt.Errorf("failed to create biz collection: %w", err)
		}

		// 为id字段创建autoindex索引
		idIndex, err := entity.NewIndexAUTOINDEX(entity.L2)
		if err != nil {
			return nil, fmt.Errorf("failed to create id index: %w", err)
		}
		err = agentClient.CreateIndex(ctx, common.MilvusCollectionName, "id", idIndex, false)
		if err != nil {
			return nil, fmt.Errorf("failed to create id index: %w", err)
		}

		// 为content字段创建autoindex索引
		contentIndex, err := entity.NewIndexAUTOINDEX(entity.L2)
		if err != nil {
			return nil, fmt.Errorf("failed to create content index: %w", err)
		}
		err = agentClient.CreateIndex(ctx, common.MilvusCollectionName, "content", contentIndex, false)
		if err != nil {
			return nil, fmt.Errorf("failed to create content index: %w", err)
		}

		// 为vector字段创建autoindex索引
		vectorIndex, err := entity.NewIndexAUTOINDEX(entity.HAMMING)
		if err != nil {
			return nil, fmt.Errorf("failed to create vector index: %w", err)
		}
		err = agentClient.CreateIndex(ctx, common.MilvusCollectionName, "vector", vectorIndex, false)
		if err != nil {
			return nil, fmt.Errorf("failed to create vector index: %w", err)
		}
	}

	if err := ensureCollectionLoaded(ctx, agentClient); err != nil {
		agentClient.Close()
		return nil, err
	}

	milvusClientCache.Store(milvusAddress, agentClient)
	return agentClient, nil
}

func CheckMilvusHealth(ctx context.Context, address string) (health MilvusHealth) {
	started := time.Now()
	address = normalizeMilvusAddress(address)
	health = MilvusHealth{Address: address}
	defer func() {
		health.OK = health.TCPOK && health.SDKOK && health.DatabaseOK && health.CollectionOK && health.CollectionLoaded
		if health.Message == "" {
			if health.OK {
				health.Message = "Milvus 健康"
			} else {
				health.Message = "Milvus 异常"
			}
		}
		health.DurationMs = time.Since(started).Milliseconds()
	}()

	checkCtx, cancel := context.WithTimeout(ctx, defaultMilvusOperationTimeout)
	defer cancel()
	if conn, err := (&net.Dialer{}).DialContext(checkCtx, "tcp", address); err != nil {
		health.Error = fmt.Sprintf("TCP 连接失败: %v", err)
		health.Message = "Milvus TCP 连接失败"
		health.Suggestion = "确认 Milvus 容器已启动，并检查 manifest/config/config.yaml 中的 milvus.address 是否指向 localhost:19530。"
		return health
	} else {
		_ = conn.Close()
		health.TCPOK = true
	}

	defaultClient, err := cli.NewClient(checkCtx, cli.Config{Address: address, DBName: "default"})
	if err != nil {
		health.Error = fmt.Sprintf("SDK 连接失败: %v", err)
		health.Message = "Milvus SDK 连接失败"
		health.Suggestion = "Milvus 端口可达但 SDK 握手超时，建议重启 milvus-standalone、milvus-etcd、milvus-minio，并确认 Attu 使用 8001 而不是占用后端 8000。"
		return health
	}
	defer defaultClient.Close()
	health.SDKOK = true

	databases, err := defaultClient.ListDatabases(checkCtx)
	if err != nil {
		health.Error = fmt.Sprintf("列出数据库失败: %v", err)
		health.Message = "Milvus 数据库检查失败"
		health.Suggestion = "检查 Milvus standalone 日志和 etcd 健康状态；恢复后重新检测向量库状态。"
		return health
	}
	for _, db := range databases {
		if db.Name == common.MilvusDBName {
			health.DatabaseOK = true
			break
		}
	}
	if !health.DatabaseOK {
		health.Error = fmt.Sprintf("数据库 %s 不存在", common.MilvusDBName)
		health.Message = "Milvus 数据库未初始化"
		health.Suggestion = "后端会在初始化 Milvus 客户端时创建 agent 数据库；确认 Milvus SDK 可连接后重试上传或检索。"
		return health
	}

	agentClient, err := cli.NewClient(checkCtx, cli.Config{Address: address, DBName: common.MilvusDBName})
	if err != nil {
		health.Error = fmt.Sprintf("连接业务数据库失败: %v", err)
		health.Message = "Milvus 业务数据库连接失败"
		health.Suggestion = "确认 agent 数据库可访问；如刚重启 Milvus，请等待 standalone 健康后重新检测。"
		return health
	}
	defer agentClient.Close()

	hasCollection, err := agentClient.HasCollection(checkCtx, common.MilvusCollectionName)
	if err != nil {
		health.Error = fmt.Sprintf("检查 collection 失败: %v", err)
		health.Message = "Milvus collection 检查失败"
		health.Suggestion = "确认 biz collection 元数据正常；如 collection 缺失，可通过重新上传或重建索引触发初始化。"
		return health
	}
	health.CollectionOK = hasCollection
	if !hasCollection {
		health.Error = fmt.Sprintf("collection %s 不存在", common.MilvusCollectionName)
		health.Message = "Milvus collection 未初始化"
		health.Suggestion = "上传第一份知识库文档或执行重建索引，让后端创建 biz collection。"
		return health
	}
	loadState, err := agentClient.GetLoadState(checkCtx, common.MilvusCollectionName, nil)
	if err != nil {
		health.Error = fmt.Sprintf("检查 collection load 状态失败: %v", err)
		health.Message = "Milvus load 状态检查失败"
		health.Suggestion = "检查 Milvus query node/standalone 日志；恢复后后端会自动尝试加载 collection。"
		return health
	}
	health.CollectionLoaded = loadState == entity.LoadStateLoaded
	if !health.CollectionLoaded {
		health.Message = "Milvus collection 未加载"
		health.Suggestion = "后端检索前会自动 LoadCollection；如果持续未加载，请检查 Milvus 内存和 standalone 健康状态。"
		return health
	}
	return health
}

func normalizeMilvusAddress(address string) string {
	if address == "" {
		return "localhost:19530"
	}
	return address
}

func withDefaultTimeout(ctx context.Context) (context.Context, context.CancelFunc) {
	if _, ok := ctx.Deadline(); ok {
		return ctx, func() {}
	}
	return context.WithTimeout(ctx, defaultMilvusOperationTimeout)
}

func ensureCollectionLoaded(ctx context.Context, c cli.Client) error {
	state, err := c.GetLoadState(ctx, common.MilvusCollectionName, nil)
	if err == nil && state == entity.LoadStateLoaded {
		return nil
	}
	if err := c.LoadCollection(ctx, common.MilvusCollectionName, false); err != nil {
		return fmt.Errorf("failed to load %s collection: %w", common.MilvusCollectionName, err)
	}
	return nil
}

var fields = []*entity.Field{
	{
		Name:     "id",
		DataType: entity.FieldTypeVarChar,
		TypeParams: map[string]string{
			"max_length": "255",
		},
		PrimaryKey: true,
	},
	{
		Name:     "vector", // 确保字段名匹配
		DataType: entity.FieldTypeBinaryVector,
		TypeParams: map[string]string{
			"dim": "65536",
		},
	},
	{
		Name:     "content",
		DataType: entity.FieldTypeVarChar,
		TypeParams: map[string]string{
			"max_length": "8192",
		},
	},
	{
		Name:     "metadata",
		DataType: entity.FieldTypeJSON,
	},
}
