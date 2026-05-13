package tools

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/cloudwego/eino/components/tool"
	"github.com/cloudwego/eino/components/tool/utils"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

type MysqlCrudInput struct {
	DSN         string `json:"dsn" jsonschema:"description=The Data Source Name for connecting to the MySQL database, including username, password, host, port, and database name"`
	SQL         string `json:"sql" jsonschema:"description=The SQL query to execute against the MySQL database"`
	OperateType string `json:"operate_type" jsonschema:"description=The type of SQL operation to perform: query, insert, update, or delete"`
}

func NewMysqlCrudTool() tool.InvokableTool {
	t, err := utils.InferOptionableTool(
		"mysql_crud",
		"Execute SQL queries against the MySQL database and return results in JSON format. Use this tool when you need to query, insert, update or delete data from the database. The results will be formatted as JSON for easy parsing.",
		func(ctx context.Context, input *MysqlCrudInput, opts ...tool.Option) (output string, err error) {
			if input == nil {
				return "", fmt.Errorf("mysql tool input is empty")
			}
			if input.SQL == "" {
				return "", fmt.Errorf("sql is required")
			}
			operateType := strings.ToLower(strings.TrimSpace(input.OperateType))
			if operateType == "" {
				operateType = "query"
			}
			// 1. 建立数据库连接
			db, err := gorm.Open(mysql.Open(input.DSN), &gorm.Config{})
			if err != nil {
				return "", fmt.Errorf("open mysql failed: %w", err)
			}

			// 2. 执行 SQL 查询
			if operateType == "query" {
				// 3. 获取查询结果
				var results []interface{}
				err = db.Raw(input.SQL).Scan(&results).Error
				if err != nil {
					return "", fmt.Errorf("query mysql failed: %w", err)
				}
				// 4. 将结果格式化为 JSON
				resBytes, err := json.Marshal(results)
				return string(resBytes), err
			}
			err = db.Exec(input.SQL).Error
			if err != nil {
				return "", fmt.Errorf("exec mysql failed: %w", err)
			}
			return "", nil
		})
	if err != nil {
		return nil
	}
	return t
}
