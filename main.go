package main

import (
	"SuperBizAgent/internal/controller/chat"
	"SuperBizAgent/utility/common"
	"SuperBizAgent/utility/middleware"
	"fmt"
	"os"
	"strconv"
	"strings"

	"github.com/gogf/gf/v2/frame/g"
	"github.com/gogf/gf/v2/net/ghttp"
	"github.com/gogf/gf/v2/os/gctx"
)

func main() {
	ctx := gctx.New()
	fileDir, err := g.Cfg().Get(ctx, "file_dir")
	if err != nil {
		panic(err)
	}
	common.FileDir = fileDir.String()
	if configToken, err := g.Cfg().Get(ctx, "admin.config_token"); err == nil && configToken.String() == "devguard-admin" {
		fmt.Println("[warn] admin.config_token is using default value, set DEVGUARD_CONFIG_TOKEN or update config.yaml before exposing this service")
	}
	s := g.Server()
	s.Group("/api", func(group *ghttp.RouterGroup) {
		group.Middleware(middleware.CORSMiddleware)
		group.Middleware(middleware.ResponseMiddleware)
		group.Bind(chat.NewV1())
	})
	if serverAddr, err := g.Cfg().Get(ctx, "server.address"); err == nil && serverAddr.String() != "" {
		addr := serverAddr.String()
		fmt.Printf("server address from config: %s\n", addr)
		if strings.HasPrefix(addr, ":") {
			if port, err := strconv.Atoi(strings.TrimPrefix(addr, ":")); err == nil {
				s.SetPort(port)
			}
		}
	}
	if envPort := os.Getenv("PORT"); envPort != "" {
		if port, err := strconv.Atoi(envPort); err == nil {
			s.SetPort(port)
		}
	}
	s.Run()
}
