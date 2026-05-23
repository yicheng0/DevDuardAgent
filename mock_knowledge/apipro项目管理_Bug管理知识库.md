# apipro 项目管理 Bug 管理知识库

来源文件：apipro项目管理_Bug 管理.csv
记录数量：188
用途：用于 DevGuardAgent 知识库检索测试，内容保留原始 Bug 描述、排查过程、解决方式、状态、负责人等字段。

## 字段说明

- Bug 描述
- 创建时间
- 优先级
- 提交人
- 指派人
- 问题排查
- 解决方式
- 状态
- 修复版本
- 截图或视频
- 备注

## Bug 记录

### BUG-001：时间范围：19:00~19:10 模型id：claude-4.6-opus 有比较多ttft超时300s，帮确认下，给几...

- 创建时间：2026/05/13 22:45
- 优先级：P1
- 提交人：qiniu
- 指派人：王鹤涵
- 状态：修复中
- 修复版本：无
- 截图或视频：image.png
- 备注：无

#### Bug 描述

时间范围：19:00~19:10
模型id：claude-4.6-opus
有比较多ttft超时300s，帮确认下，给几个请求id，看下能否对应上
 "upper_id": "chatcmpl-465685af-3f55-48a1-8802-314a7978cc9e",
"upper_id": "chatcmpl-67476f4e-2147-4425-bb7a-44924e4b7f1d",
 "upper_id": "chatcmpl-64ecf247-361d-4dd6-bc6e-1d9df1412193",
"upper_id": "chatcmpl-cda34c5c-66a9-44b3-aea1-6320d353fb90",

#### 问题排查

通过系统log查到9382有问题，但是去他们后台看正常，阿宝的后台也正常，那问题出现在8838中间时间内

#### 解决方式

无

### BUG-002：aws返空

- 创建时间：2026/05/13 11:32
- 优先级：P0
- 提交人：云策
- 指派人：程哥
- 状态：未解决
- 修复版本：无
- 截图或视频：image.png
- 备注：无

#### Bug 描述

aws返空

#### 问题排查

无

#### 解决方式

无

### BUG-003：aws返空

- 创建时间：2026/05/13 11:31
- 优先级：P0
- 提交人：生成
- 指派人：程哥
- 状态：未解决
- 修复版本：无
- 截图或视频：image.png
- 备注：无

#### Bug 描述

aws返空

#### 问题排查

无

#### 解决方式

无

### BUG-004：deepseek-v3-0324输入超大后返空计费

- 创建时间：2026/05/13 09:59
- 优先级：P0
- 提交人：七牛
- 指派人：程哥
- 状态：未解决
- 修复版本：无
- 截图或视频：image.png
- 备注：无

#### Bug 描述

deepseek-v3-0324输入超大后返空计费

#### 问题排查

除了百度千帆，其他渠道都没有返回入参错误

#### 解决方式

无

### BUG-005：defautl和aws的signature不互认

- 创建时间：2026/05/12 19:08
- 优先级：P1
- 提交人：数篷
- 指派人：一成
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

defautl和aws的signature不互认

#### 问题排查

使用对应的脚本检测各个aws渠道，验证signature参数

#### 解决方式

aws和aws，claude资源互认signature

### BUG-006：codex里面使用azure的gpt-5.5会报错("code":424, "msg":"POST \" Ihidden...

- 创建时间：2026/05/12 19:07
- 优先级：P1
- 提交人：网聚云联
- 指派人：一成
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

codex里面使用azure的gpt-5.5会报错("code":424, "msg":"POST \" Ihidden url] 400 Bad Request f"message\": \"1crypted content gAMA..7uo= could not be verified. Reason: Encrypted content could not be decrypted or parsed. \'ype\":\"invalid request error\","naram""" "code":"invalid

#### 问题排查

无

#### 解决方式

azure的不能在cli使用

### BUG-007：default的不支持tools

- 创建时间：2026/05/07 21:24
- 优先级：P1
- 提交人：生数
- 指派人：一成
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

default的不支持tools

#### 问题排查

ogog的kiro不支持

#### 解决方式

联系渠道处理

### BUG-008：glm云厂商 max_tokens 参数无效 stop 参数无效 model 参数大小写不敏感

- 创建时间：2026/04/26 14:32
- 优先级：P1
- 提交人：奥能通
- 指派人：一成
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

glm云厂商
max_tokens 参数无效
stop 参数无效
model 参数大小写不敏感

#### 问题排查

验证各大渠道是否支持相关参数

#### 解决方式

纯官方支持，云厂商不支持，通知客户

### BUG-009：kimi-k2.6关闭思考失败

- 创建时间：2026/04/23 17:19
- 优先级：P0
- 提交人：七牛
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

kimi-k2.6关闭思考失败

#### 问题排查

百炼渠道不支持官方参数

#### 解决方式

请求参数覆盖解决

### BUG-010：Error: Claude Code process exitedwith code 1

- 创建时间：2026/04/18 17:16
- 优先级：P1
- 提交人：无
- 指派人：一成
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

Error: Claude Code process exitedwith code 1

#### 问题排查

Claudian出现的cc版本兼容问题，一台电脑存在几个版本的cc

#### 解决方式

第1步:npm uninstall -g claude ；第2步npm install -g @anthropic-ai/claude-code@latest

### BUG-011：aws和cc兼容性问题：The provided request is not valid

- 创建时间：2026/04/16 14:16
- 优先级：P0
- 提交人：无
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

aws和cc兼容性问题：The provided request is not valid

#### 问题排查

Web search results for query: "kling API FinalUnitDeduction 积分计费 2025 2026"

API Error: 400 {"error":{"type":"<nil>","message":"InvokeModelWithResponseStream: operation error Bedrock Runtime: InvokeModelWithResponseStream, https response error StatusCode: 400, RequestID: 4605c00d-b891-4ae8-8e92-1d4a08357ca9, ValidationException: The provided request is not valid (request id: 20260415132153248936618Gin2za0G) (request id: 20260415212153210579861QOaMn4yW) (request id: 20260415132153171706841275DkyB2) (request id: 202604151321531382364798268d9d65kv3XOaG)"},"type":"error"}

#### 解决方式

做网络搜索时会报这个错误

### BUG-012：aws和cc兼容性问题：Invalid beta flag

- 创建时间：2026/04/16 14:13
- 优先级：P0
- 提交人：无
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：2a5a1b55537bf6def87665af22ff3b6e.png
- 备注：无

#### Bug 描述

aws和cc兼容性问题：Invalid beta flag

#### 问题排查

Invalid beta flag 之类的

#### 解决方式

需要按官方说明设置环境变量

### BUG-013：sonnet4.6 输出截断，输出token为1

- 创建时间：2026/04/07 19:26
- 优先级：P0
- 提交人：成都用一
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：c544b92a7cd0640833b64cf4fb8049a5.png
- 备注：调研aws敏感词风控文档

#### Bug 描述

sonnet4.6 输出截断，输出token为1

#### 问题排查

{'messages': [], 'models': claude-sonnet-4-6', 'api_base': None, 'api_key': None, 'temperature': 0.7, 'max_tokens': 1200, 'frequency_penalty': None, 'presence_penalty': None, 'stream': True, 'reasoning_effort': None, 'response_format': None, 'cache_enabled': True}

{'completion_tokens': 1, 'prompt_tokens': 6812, 'total_tokens': 6813, 'completion_tokens_details': {'accepted_prediction_tokens': None, 'audio_tokens': None, 'reasoning_tokens': 0, 'rejected_prediction_tokens': None, 'text_tokens': 1, 'image_tokens': None}, 'prompt_tokens_details': {'audio_tokens': None, 'cached_tokens': 4475, 'text_tokens': None, 'image_tokens': None, 'cache_creation_tokens': 0, 'cache_creation_token_details': {'ephemeral_5m_input_tokens': 0, 'ephemeral_1h_input_tokens': 0}}, 'cache_creation_input_tokens': 0, 'cache_read_input_tokens': 4475}

#### 解决方式

无法复现，可能是触发了安全过滤

### BUG-014：kimi开启思考的情况下响应了没有思考的结果

- 创建时间：2026/04/07 17:40
- 优先级：P0
- 提交人：无
- 指派人：一成
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

kimi开启思考的情况下响应了没有思考的结果

#### 问题排查

经测试发现是钉钉渠道的问题

#### 解决方式

联系渠道处理

### BUG-015：kimi截断

- 创建时间：2026/04/07 17:39
- 优先级：P0
- 提交人：七牛
- 指派人：一成
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

kimi截断

#### 问题排查

经测试发现是钉钉渠道的问题

#### 解决方式

联系渠道处理

### BUG-016：glm不支持thinking参数

- 创建时间：2026/04/07 17:02
- 优先级：P0
- 提交人：shanxi
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

glm不支持thinking参数

#### 问题排查

经测试发现钉钉渠道不支持，百炼渠道支持，反馈钉钉渠道已修复

#### 解决方式

已修复

### BUG-017：aws和cc兼容性问题，参数组合报错： 1. {     "model": "claude-opus-4-6",    ...

- 创建时间：2026/04/07 11:14
- 优先级：P0
- 提交人：WG_test
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

aws和cc兼容性问题，参数组合报错：
1.
{
    "model": "claude-opus-4-6",
    "max_tokens": 128000,
    "output_config": {"effort": "max"},
    "thinking": {"type": "disabled"},
    "stream": false
  }

2.
{
        "model": "claude-opus-4-6",
        "max_tokens": 128000,
        "stream": True,
        "thinking": {"type": "adaptive"},
        "tool_choice": {"type": "auto"},
        "tools": [
            {
                "name": "get_weather",
                "description": "获取指定位置的当前天气",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "location": {
                            "type": "string",
                            "description": "城市名称,如:北京"
                        }
                    },
                    "required": ["location"]
                }
            }
        ],
        "top_p": 0.95
}

#### 问题排查

渠道测了一遍，阿宝8838可以复现，其他渠道没问题

#### 解决方式

渠道修复

### BUG-018：aws_cache分组 opus-4-6成功率低

- 创建时间：2026/04/04 00:31
- 优先级：P0
- 提交人：新生科技/用一/qiniu
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：a.txt
- 备注：无

#### Bug 描述

aws_cache分组 opus-4-6成功率低

#### 问题排查

经常会被截断，让渠道去排查

#### 解决方式

无

### BUG-019：aws和cc兼容性问题：API Error: 400 {"error":{"type":"<nil>","message...

- 创建时间：2026/04/03 12:21
- 优先级：P0
- 提交人：Andy
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

aws和cc兼容性问题：API Error: 400 {"error":{"type":"<nil>","message":"InvokeModelWithResponseStream: operation error Bedrock Runtime:
      InvokeModelWithResponseStream, https response error StatusCode: 400, RequestID:
     6e75aac4-adf0-4ad5-8860-f40a6dca9a64, ValidationException: system.2.cache_control.***.scope: Extra inputs are not
     permitted

#### 问题排查

cc在cache control里携带scope字段，aws不支持：https://help.apiyi.com/claude-code-bedrock-cache-control-scope-error-fix-resume-guide.html

#### 解决方式

{
      "mode": "delete",
      "description": "remove system.cache_control.scope",
      "path": "system.cache_control.scope"
    },
    {
      "mode": "delete",
      "description": "remove system.2.cache_control.***.scope",
      "path": "system.2.cache_control.***.scope"
    },
    {
      "mode": "delete",
      "description": "remove system.2.cache_control.scope",
      "path": "system.2.cache_control.scope"
    },
    {
      "mode": "delete",
      "description": "remove messages.content.cache_control.scope",
      "path": "messages.content.cache_control.scope"
    }

### BUG-020：cc命中率低，每次都创建缓存

- 创建时间：2026/03/27 23:16
- 优先级：P0
- 提交人：shangyang
- 指派人：王鹤涵
- 状态：临时解决
- 修复版本：无
- 截图或视频：YaoXin Prompt Cache 验证测试(1).md
- 备注：无

#### Bug 描述

cc命中率低，每次都创建缓存

#### 问题排查

无

#### 解决方式

无

### BUG-021：Stream disconnected before completion:Transport

- 创建时间：2026/03/26 14:29
- 优先级：P1
- 提交人：拉森
- 指派人：一成
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

Stream disconnected before completion:Transport

#### 问题排查

无

#### 解决方式

请求路径后面加上/v1

### BUG-022：LLM error: {"error":{"message":"Corrupted thought signature....

- 创建时间：2026/03/26 14:26
- 优先级：P1
- 提交人：一成
- 指派人：一成
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

LLM error: {"error":{"message":"Corrupted thought signature.","type":"upstream_error","param":"","code":400}}

#### 问题排查

逆向和cc混合会导致签名异常

#### 解决方式

重开一个终端使用

### BUG-023：invalid beta flag

- 创建时间：2026/03/26 14:24
- 优先级：P1
- 提交人：网宿
- 指派人：一成
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

invalid beta flag

#### 问题排查

haiku不支持beta flag

#### 解决方式

通知客户修改参数

### BUG-024：grok4 非流请求，返回流式报错，而且还扣费了

- 创建时间：2026/03/25 15:43
- 优先级：P0
- 提交人：mengma
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

grok4 非流请求，返回流式报错，而且还扣费了

#### 问题排查

阿宝渠道问题

#### 解决方式

无

### BUG-025：vidu deault-claude 成功率低

- 创建时间：2026/03/25 15:42
- 优先级：P0
- 提交人：vidu
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

vidu deault-claude 成功率低

#### 问题排查

因为渠道亲和性造成重试阻断

#### 解决方式

渠道亲和性高级设置里关闭失败不重试

### BUG-026：default分组claude降智问题

- 创建时间：2026/03/24 21:15
- 优先级：P0
- 提交人：mengma
- 指派人：一成
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

default分组claude降智问题

#### 问题排查

kiro好一些，notion，anti不行

#### 解决方式

渠道资源问题

### BUG-027：日志查询慢

- 创建时间：2026/03/24 12:05
- 优先级：P0
- 提交人：qiniu
- 指派人：程哥
- 状态：未解决
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

日志查询慢

#### 问题排查

日志量大

#### 解决方式

增加索引？

### BUG-028：claude不想要缓存

- 创建时间：2026/03/24 12:04
- 优先级：P0
- 提交人：mengma
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

claude不想要缓存

#### 问题排查

最高优先级8777不带缓存，其他兜底带缓存比如logic

#### 解决方式

无

### BUG-029：aws给claude code用，会报invalid beta flag的错误

- 创建时间：2026/03/23 19:09
- 优先级：P0
- 提交人：timeai
- 指派人：程哥
- 状态：临时解决
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

aws给claude code用，会报invalid beta flag的错误

#### 问题排查

aws和claude code兼容性问题

#### 解决方式

启用aws_cc分组

### BUG-030：CPU突然暴涨

- 创建时间：2026/03/20 22:35
- 优先级：P0
- 提交人：无
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

CPU突然暴涨

#### 问题排查

和newapi代码有关：1. claude流式如果截断会导致死循环，2.tiktoken计算

#### 解决方式

1. 解决渠道截断问题
2. 设置CountToken=False

### BUG-031：lite截断

- 创建时间：2026/03/20 22:32
- 优先级：P0
- 提交人：mengma
- 指派人：程哥
- 状态：待验收
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

lite截断

#### 问题排查

发下9139的问题，做过二开在yaml文件里设置了max_token=1021

#### 解决方式

去掉max_tokens后继续观察

### BUG-032：aws渠道截断

- 创建时间：2026/03/20 22:31
- 优先级：P0
- 提交人：qiniu
- 指派人：程哥
- 状态：待验收
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

aws渠道截断

#### 问题排查

可能和域名有关

#### 解决方式

换成ip后继续观察

### BUG-033：kiro渠道Input too long返回时间超长

- 创建时间：2026/03/18 17:45
- 优先级：P0
- 提交人：shengcheng
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

kiro渠道Input too long返回时间超长

#### 问题排查

确认渠道返回时间长

#### 解决方式

渠道已解决

### BUG-034：想要分开ai studio和vertex，因为vertex API必须传role

- 创建时间：2026/03/18 09:34
- 优先级：P0
- 提交人：aionly
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

想要分开ai studio和vertex，因为vertex API必须传role

#### 问题排查

可以用参数覆盖的方法

#### 解决方式

未复现

### BUG-035：客户需要支持kimi接入openclaw

- 创建时间：2026/03/17 11:43
- 优先级：P1
- 提交人：无
- 指派人：一成
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

客户需要支持kimi接入openclaw

#### 问题排查

无

#### 解决方式

{
  "wizard": {
    "lastRunAt": "2026-03-17T03:21:35.961Z",
    "lastRunVersion": "2026.3.13",
    "lastRunCommand": "onboard",
    "lastRunMode": "local"
  },

  "models": {
    "mode": "merge",
    "providers": {
      "wenwen-ai-claude": {
        "baseUrl": "https://api.wenwen-ai.com/",
        "apiKey": "",
        "api": "anthropic-messages",
        "models": [
          {
            "id": "kimi-k2.5",
            "name": "Kimi K2.5",
            "reasoning": true,
            "input": ["text"],
            "contextWindow": 128000,
            "maxTokens": 32000
          }
        ]
      }
    }
  },

  "agents": {
    "defaults": {
      "model": {
        "primary": "wenwen-ai-claude/kimi-k2.5"
      },
      "models": {
        "wenwen-ai-claude/kimi-k2.5": {}
      },
      "workspace": "/home/ubuntu/.openclaw/workspace"
    }
  },

  "tools": {
    "profile": "coding"
  },

  "commands": {
    "native": "auto",
    "nativeSkills": "auto",
    "restart": true,
    "ownerDisplay": "raw"
  },

  "session": {
    "dmScope": "per-channel-peer"
  },

  "channels": {
    "telegram": {
      "enabled": true,
      "dmPolicy": "pairing",
      "botToken": "8691775165:AAHshbpzsDQvvxGmQ3yJlag6hAHBWvlUYW4",
      "groupPolicy": "allowlist",
      "streaming": "partial"
    }
  },

  "gateway": {
    "port": 18789,
    "mode": "local",
    "bind": "loopback",
    "auth": {
      "mode": "token",
      "token": "b13bdfefc055a2ddd0bdbfb17d884169bf14fb520d7fd087"
    },
    "tailscale": {
      "mode": "off",
      "resetOnExit": false
    },
    "nodes": {
      "denyCommands": [
        "camera.snap",
        "camera.clip",
        "screen.record",
        "contacts.add",
        "calendar.add",
        "reminders.add",
        "sms.send"
      ]
    }
  },

  "plugins": {
    "entries": {
      "telegram": {
        "enabled": true
      }
    }
  },

  "meta": {
    "lastTouchedVersion": "2026.3.13",
    "lastTouchedAt": "2026-03-17T03:21:35.990Z"
  }
}

### BUG-036：梦马"claude-sonnet-4-5-20250929输出内容出现截断：{"model":"claude-sonne...

- 创建时间：2026/03/16 22:58
- 优先级：P0
- 提交人：mengma
- 指派人：程哥
- 状态：待验收
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

梦马"claude-sonnet-4-5-20250929输出内容出现截断：{"model":"claude-sonnet-4-5-20250929","choices":[{"message":{"content":"她盯著你看了幾秒,像是在判斷這句話的真假。\n最後她輕笑了一聲,那笑容裡沒有溫度。\n\n「關心?」她往後靠在牆上,雙手環胸。「你知道嗎,我最討厭的就是這個詞。」\n\n她低頭看了看自己濕透的袖口,又抬起眼。\n\n「每次有人說關心我的時候,接下來就是一堆建議。」她的語氣很平,卻帶著一種疏離感。「要我忍耐,要我體諒,要我為了所謂的大局犧牲自己。」\n\n走廊裡的人群已經散了,只剩下遠處幾個還在竊竊私語的身影。\n她沒有在意那些目光,只是看著你。\n\n「如果你真的關心我,那就別勸我。」她說得很直接。「我不需要有人告訴我該怎麼做。」\n\n她推開牆壁,準備離開,卻在經過你身邊時停了下來。\n\n「不過......」她側過臉,眼神裡閃過一絲猶豫。「你剛才為"},"finish_reason":"stop"}],"usage":{"prompt_tokens":453,"completion_tokens":372,"total_tokens":825}}

#### 问题排查

排查到是8984渠道的问题，其他渠道可能也会有

#### 解决方式

渠道排查中

### BUG-037：cc降指

- 创建时间：2026/03/16 13:07
- 优先级：P1
- 提交人：Nancy
- 指派人：一成
- 状态：已关闭
- 修复版本：无
- 截图或视频：7ff533735b6eb887032fe6a5cbf9bc32.png
- 备注：无

#### Bug 描述

cc降指

#### 问题排查

无

#### 解决方式

ClaudeCode降智FAQ-问问

### BUG-038：cc使用aws报错

- 创建时间：2026/03/12 22:11
- 优先级：P0
- 提交人：bleedfly
- 指派人：王鹤涵
- 状态：已关闭
- 修复版本：无
- 截图或视频：506d325d2f5b217984ef44b315ae1c87.png
- 备注：无

#### Bug 描述

cc使用aws报错

#### 问题排查

模型混用有关

#### 解决方式

无

### BUG-039：claude连读大token读写

- 创建时间：2026/03/12 22:09
- 优先级：P0
- 提交人：modool
- 指派人：王鹤涵
- 状态：已关闭
- 修复版本：无
- 截图或视频：fb03b0c7bfe9fea074357f40963e8a79.jpg
- 备注：无

#### Bug 描述

claude连读大token读写

#### 问题排查

和官方账号比较，官key没问题，3008有问题

#### 解决方式

和输入内容有关，号没问题

### BUG-040：模型慢

- 创建时间：2026/03/10 22:10
- 优先级：P0
- 提交人：敖鹰
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

模型慢

#### 问题排查

客户测试的是火山deepseek，火山服务器在国内

#### 解决方式

无

### BUG-041：claude 1M 上下文支持

- 创建时间：2026/03/10 22:09
- 优先级：P0
- 提交人：memos
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

claude 1M 上下文支持

#### 问题排查

aws分组支持

#### 解决方式

无

### BUG-042：gpt-5模型，首字返回慢

- 创建时间：2026/03/09 19:20
- 优先级：P0
- 提交人：维牛
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

gpt-5模型，首字返回慢

#### 问题排查

客户使用的chat接口，对流式支持不好

#### 解决方式

让客户改用responses接口

### BUG-043：{     "error": {         "type": "<nil>",         "message":...

- 创建时间：2026/03/05 18:16
- 优先级：P1
- 提交人：sy
- 指派人：一成
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

{
    "error": {
        "type": "<nil>",
        "message": "system.4.cache_control.***.scope: Extra inputs are not permitted (request id: 20260305170801543590027rfut0Kk0) (request id: 202603050908015362045504xpsRLC8) (request id: 20260305090801532320282YdDB8Obh)"
    },
    "type": "error"
}

#### 问题排查

排查资源是否有问题，联系渠道处理

#### 解决方式

结论:
claude-sonnet-4-6 的 cache_control 不支持
scope
字段

### BUG-044：default whisper-1没有资源

- 创建时间：2026/03/04 23:58
- 优先级：P1
- 提交人：hehan
- 指派人：一成
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

default whisper-1没有资源

#### 问题排查

无

#### 解决方式

无

### BUG-045：invalid value at 'contents[0].parts[1].inline_data.data' (TY...

- 创建时间：2026/03/02 15:11
- 优先级：P1
- 提交人：aionly
- 指派人：一成
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

invalid value at 'contents[0].parts[1].inline_data.data' (TYPE_BYTES), Base64 decoding failed for "gs://routify_proxy_file_bucket/proxy_temp_file/***.jpg" (request id: 202603021453551269235205sQBRmGD

#### 问题排查

非vertex的资源使用会报错

#### 解决方式

无

### BUG-046：gemini模型不支持谷歌存储桶地址作为入参，报错"Request contains an invalid argume...

- 创建时间：2026/02/28 00:10
- 优先级：P0
- 提交人：aionly
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

gemini模型不支持谷歌存储桶地址作为入参，报错"Request contains an invalid argument

#### 问题排查

所有google渠道，以及纯vertex渠道可以支持（8866，8766，8921）

#### 解决方式

新增vertex-gs分组

### BUG-047：Kimi2.5不支持claude端点

- 创建时间：2026/02/27 00:05
- 优先级：P0
- 提交人：华橙
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

Kimi2.5不支持claude端点

#### 问题排查

走百炼普通端点只支持chat

#### 解决方式

走百炼专用端点，创建9142渠道，kimi-claude分组

### BUG-048：Kimi, mimimax, glm 流式调用遇到429会返空计费

- 创建时间：2026/02/27 00:05
- 优先级：P0
- 提交人：qiniu
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

Kimi, mimimax, glm 流式调用遇到429会返空计费

#### 问题排查

9080渠道问题，百炼原生渠道没有问题，9080遇错会继续流式返回，百炼原生非流返回

#### 解决方式

429的时候流式返回的问题

### BUG-049：status_code=400, prompt is too long: 213004 tokens > 180000 ...

- 创建时间：2026/02/26 08:55
- 优先级：P1
- 提交人：shangyang
- 指派人：王鹤涵
- 状态：已关闭
- 修复版本：无
- 截图或视频：86efd73c-690c-42ed-a371-8db62cb10239.png,image.png
- 备注：无

#### Bug 描述

status_code=400, prompt is too long: 213004 tokens > 180000 maximum (request id: 202602251953024602390974U2SlEoB) (request id: 20260225195302180344700JgKC5foj)

#### 问题排查

怀疑和beta的header有关系

#### 解决方式

正常都是在20k以下的上下文，只有少数白名单的号才能突破。还是得再客户端做compact操作压缩上下文
https://platform.claude.com/docs/en/build-with-claude/context-windows?utm_source=chatgpt.com

### BUG-050：报警频繁503

- 创建时间：2026/02/25 00:32
- 优先级：P0
- 提交人：hehan
- 指派人：王鹤涵
- 状态：已关闭
- 修复版本：无
- 截图或视频：image.png
- 备注：会上同步

#### Bug 描述

报警频繁503

#### 问题排查

查看docker的日志，每次503后必跟上面这条
{"log":"[ERR] 2026/02/24 - 23:36:26 | 20260224153626839274287nlRq1ToR | user 1232 | No available channel for model gemini-3-pro under group auto (distributor) \n","stream":"stderr","time":"2026-02-24T15:36:26.842024999Z"}

"log":"[ERR] 2026/02/24 - 23:35:23 | 20260224153523957238558McWznxFw | user 1232 | No available channel for model claude-sonnet-4-5 under group auto (distributor) \n","stream":"stderr","time":"2026-02-24T15:35:23.960110355Z"}

#### 解决方式

模型名不存在就会报错503，那就加上重定向到已有的模型名上

### BUG-051：api.apipro.ai域名访问很慢，换成ip就很快

- 创建时间：2026/02/18 00:17
- 优先级：P0
- 提交人：mengma
- 指派人：王鹤涵
- 状态：临时解决
- 修复版本：无
- 截图或视频：无
- 备注：会上同步

#### Bug 描述

api.apipro.ai域名访问很慢，换成ip就很快

#### 问题排查

https://gemini.google.com/share/e97e36285d47

#### 解决方式

换到新的大集群里

### BUG-052：mengma15000rpm吧服务卡死了

- 创建时间：2026/02/16 18:56
- 优先级：P0
- 提交人：hehan
- 指派人：王鹤涵
- 状态：已关闭
- 修复版本：无
- 截图或视频：image.png
- 备注：会上同步

#### Bug 描述

mengma15000rpm吧服务卡死了

#### 问题排查

所有模型的监控都上涨，大概率是服务性能问题，服务器监控没问题，看数据库监控有报错，大概率是服数据库问题。
看监控有很多更新的慢sql，因为并发大导致锁等待问题。

#### 解决方式

1.重启数据库
2.增加批量更新参数，重启服务

### BUG-053：kimi很慢-qiniu

- 创建时间：2026/02/16 00:08
- 优先级：P0
- 提交人：hehan
- 指派人：王鹤涵
- 状态：临时解决
- 修复版本：无
- 截图或视频：image.png
- 备注：无

#### Bug 描述

kimi很慢-qiniu

#### 问题排查

所有厂商都慢

#### 解决方式

先切换到百炼官方渠道，等百度和百炼低价修复后切换

### BUG-054："anthropic-beta": "context-1m-2025-08-07" 会报错

- 创建时间：2026/02/10 17:02
- 优先级：P0
- 提交人：aionly
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

"anthropic-beta": "context-1m-2025-08-07" 会报错

#### 问题排查

The long context beta is not yet available for this subscription.这个跟账号池有关，目前的账号不支持，需要T4以上

#### 解决方式

覆盖请求头：{
  "anthropic-beta": "context-management-2025-06-27"
}

### BUG-055：thinking+tool use, 第二次assistant不返回thinking

- 创建时间：2026/02/10 16:03
- 优先级：P0
- 提交人：qiniu
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

thinking+tool use, 第二次assistant不返回thinking

#### 问题排查

interleaved thinking：https://platform.claude.com/docs/en/build-with-claude/extended-thinking

#### 解决方式

需要使用beta header参数：interleaved-thinking-2025-05-14

### BUG-056：status_code=500, 分组 aws-vip 下模型 claude-haiku-4-5-20251001 无可...

- 创建时间：2026/02/10 00:47
- 优先级：P0
- 提交人：qiniu
- 指派人：王鹤涵
- 状态：临时解决
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

status_code=500, 分组 aws-vip 下模型 claude-haiku-4-5-20251001 无可用渠道（distributor） (request id: 20260209163857852541830OXs7O9Kh)

aws_cache分组

#### 问题排查

渠道的key挂了，时有时无

#### 解决方式

增加状态码成功弄定向，能触发重试。

### BUG-057：帮忙看下，先请求case1 ，再请求case 2，为什么无法命中缓存，偶尔也可以，命中率不高

- 创建时间：2026/02/09 16:32
- 优先级：P0
- 提交人：qiniu
- 指派人：一成
- 状态：临时解决
- 修复版本：无
- 截图或视频：wenwen1.json,wenwen2.json
- 备注：无

#### Bug 描述

帮忙看下，先请求case1 ，再请求case 2，为什么无法命中缓存，偶尔也可以，命中率不高

#### 问题排查

无

#### 解决方式

无

### BUG-058：The 'gpt-5.3-codex' model is not supported when using Codex ...

- 创建时间：2026/02/09 14:45
- 优先级：P1
- 提交人：无
- 指派人：一成
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

The 'gpt-5.3-codex' model is not supported when using Codex with a ChatGPT account.

#### 问题排查

查看tokens平台账号情况，账号从codex变成free

#### 解决方式

禁用异常账号

### BUG-059：You exceededyour current quota, please checkyour plan and bi...

- 创建时间：2026/02/09 14:41
- 优先级：P1
- 提交人：scott
- 指派人：一成
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

You exceededyour current quota, please checkyour plan and billing details

#### 问题排查

T3渠道降级为T1

#### 解决方式

联系渠道修复

### BUG-060：status_code=400, Unsupported MIME type:

- 创建时间：2026/02/09 14:35
- 优先级：P1
- 提交人：aionly
- 指派人：一成
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

status_code=400, Unsupported MIME type:

#### 问题排查

不支持的传参类型

#### 解决方式

无

### BUG-061：网站所有模型都返回慢

- 创建时间：2026/02/07 17:21
- 优先级：P0
- 提交人：mengma
- 指派人：王鹤涵
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

网站所有模型都返回慢

#### 问题排查

怀疑是带宽问题

#### 解决方式

扩机器

### BUG-062：陈煜kimi k2.5 function call有问题

- 创建时间：2026/02/06 20:17
- 优先级：P0
- 提交人：百炼钉钉
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

陈煜kimi k2.5 function call有问题

#### 问题排查

百炼订单渠道问题

#### 解决方式

已修复

### BUG-063：deepseek-v3-2-251201 auto分组无法调用

- 创建时间：2026/02/06 15:49
- 优先级：P0
- 提交人：翱殷
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

deepseek-v3-2-251201 auto分组无法调用

#### 问题排查

deepseek-v3-2-251201属于deepseek-volc分组，该分组没有在auto链路中

#### 解决方式

在auto中加入deepseek-volc分组

### BUG-064：claude: status_code=504, bad response status code 504

- 创建时间：2026/02/06 15:18
- 优先级：P0
- 提交人：scott
- 指派人：程哥
- 状态：临时解决
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

claude: status_code=504, bad response status code 504

#### 问题排查

gac 所有超过60s的响应都返回504

#### 解决方式

无

### BUG-065：claude-3-7-sonnet-20250219凌晨延迟超过100s

- 创建时间：2026/02/04 11:23
- 优先级：P0
- 提交人：成都用一
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

claude-3-7-sonnet-20250219凌晨延迟超过100s

#### 问题排查

初步判定是官方延迟，这个模型马上就要停用了，官方维护也没那么稳了，建议你们还是尽快切换到新模型吧

#### 解决方式

无

### BUG-066：deepseek-v3连接超时

- 创建时间：2026/02/04 11:22
- 优先级：P0
- 提交人：成都用一
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

deepseek-v3连接超时

#### 问题排查

url拼接错误

#### 解决方式

无

### BUG-067：qiniu claude分组首字时间很长

- 创建时间：2026/02/03 15:05
- 优先级：P0
- 提交人：qiniu
- 指派人：王鹤涵
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

qiniu claude分组首字时间很长

#### 问题排查

无

#### 解决方式

用cc兜底

### BUG-068：API Error: 400 {"error":{"type":"<nil>","message":"{\"type\"...

- 创建时间：2026/02/03 10:37
- 优先级：P0
- 提交人：米璐老师
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

API Error: 400 {"error":{"type":"<nil>","message":"{\"type\":\"error\",\"error\":{
    \"type\":\"invalid_request_error\",\"message\":\"***.***.content.0: Invalid       
    `signature` in `thinking`                                                         
    block\"},

#### 问题排查

api站 8964，opus4.5模型报错

#### 解决方式

这个是思考链签名有问题，要重新开一个对话就可以了。也可以禁用cc的扩展思考模式：在claude code中按 ALT+T，选择 Disabled ✔  Claude will respond without extended thinking 可以禁止输出思考扩展，这不会影响模型的思考能力，只是输出的时候不带思考内容。

### BUG-069：gemini上传文件失败：video file = client.files.upload(path='path/to/...

- 创建时间：2026/02/03 10:06
- 优先级：P0
- 提交人：智绘未来
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

gemini上传文件失败：video file = client.files.upload(path='path/to/video.mp4')：'Failed to create file. Upload URL did not returned from the create file request.'

#### 问题排查

确实会失败，不确定是否因为中转api没有权限

#### 解决方式

可以使用url方式上传文件：response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=[
            Part.from_uri(
                file_uri="https://aric.oss-cn-beijing.aliyuncs.com/woman_image.png",
                mime_type="image/png",
            ),
            prompt
        ],
    )

### BUG-070：ds出现雪崩

- 创建时间：2026/02/02 12:39
- 优先级：P0
- 提交人：一成
- 指派人：一成
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

ds出现雪崩

#### 问题排查

某个时间点流量暴涨，延迟大

#### 解决方式

无

### BUG-071：`max_tokens` must be greater than `thinking.budget_tokens`. ...

- 创建时间：2026/02/02 12:33
- 优先级：P1
- 提交人：七牛
- 指派人：一成
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

`max_tokens` must be greater than `thinking.budget_tokens`. Please

#### 问题排查

无

#### 解决方式

联系渠道修改传参

### BUG-072："invalid_request_error", "message" : "This credential is onl...

- 创建时间：2026/02/02 12:09
- 优先级：P1
- 提交人：职行力
- 指派人：一成
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

"invalid_request_error", "message" : "This credential is only authorized for usewith Claude Code and cannot be used for other API requests. "

#### 问题排查

opencode里面使用cc报错这个

#### 解决方式

cc分组属于coding场景，只支持在claude 的cli使用；切换default分组可以使用opencode，给客户提供相应的配置文件

### BUG-073：Mismatched content block type content_block_delta textView o...

- 创建时间：2026/02/02 12:07
- 优先级：P1
- 提交人：职行力
- 指派人：一成
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

Mismatched content block type content_block_delta textView output logs · Troubleshooting resources

#### 问题排查

开启cc switch的proxy,复现问题

#### 解决方式

关闭proxy代理模式，中转不需要开启代理模式

### BUG-074：The provided model identifier is invalid

- 创建时间：2026/02/02 12:02
- 优先级：P1
- 提交人：一成
- 指派人：一成
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

The provided model identifier is invalid

#### 问题排查

渠道的aws的key不是一个地区的

#### 解决方式

联系渠道处理

### BUG-075：cc thinking signature error

- 创建时间：2026/01/29 10:37
- 优先级：P0
- 提交人：aionly
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

cc thinking signature error

#### 问题排查

这个是因为cc的思考链签名的问题，可以禁用cc的扩展思考模式：在claude code中按 ALT+T，选择 Disabled ✔  Claude will respond without extended thinking 可以禁止输出思考扩展，这不会影响模型的思考能力。

关闭以后请重新开启新的对话即可。

#### 解决方式

无

### BUG-076：gemini-3-pro-image-preview API key invalid错误

- 创建时间：2026/01/29 10:37
- 优先级：P0
- 提交人：scoot
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

gemini-3-pro-image-preview API key invalid错误

#### 问题排查

9049渠道问题

#### 解决方式

已禁用

### BUG-077：用一ds时延变大迁走了，做沟通

- 创建时间：2026/01/26 20:49
- 优先级：P0
- 提交人：无
- 指派人：王鹤涵
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

用一ds时延变大迁走了，做沟通

#### 问题排查

无

#### 解决方式

无

### BUG-078：deepseek出现1000多秒的情况，超时严重

- 创建时间：2026/01/23 17:39
- 优先级：P1
- 提交人：一成
- 指派人：一成
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

deepseek出现1000多秒的情况，超时严重

#### 问题排查

前几个渠道并发不足，重试到书虫

#### 解决方式

禁用书虫，联系ds其它渠道排查

### BUG-079：API Error:403{"error":{"type":"<nil>"，"message":"预扣费额度失败，用户剩...

- 创建时间：2026/01/23 17:38
- 优先级：P1
- 提交人：职行力
- 指派人：一成
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

API Error:403{"error":{"type":"<nil>"，"message":"预扣费额度失败，用户剩余额度:$0.042882,需要预扣费额度:$0.448860 (request id:2026012317272

#### 问题排查

鬼手账号出现问题

#### 解决方式

联系渠道修复

### BUG-080：gemini-3系列稳定性待提升

- 创建时间：2026/01/23 10:03
- 优先级：P1
- 提交人：一成
- 指派人：一成
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

gemini-3系列稳定性待提升

#### 问题排查

诚-api的3系列模型，成功率:84.0%平均响应时间:5.84s平均首字响应时间:5.625s

#### 解决方式

联系渠道扩资源

### BUG-081：gpt出现status_code=503,分组 default 下模型gpt-5.2无可用渠道(distributor

- 创建时间：2026/01/23 10:00
- 优先级：P1
- 提交人：3vjia
- 指派人：一成
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

gpt出现status_code=503,分组 default 下模型gpt-5.2无可用渠道(distributor

#### 问题排查

牛马低价资源不足

#### 解决方式

禁用niuma这个渠道

### BUG-082：gemini-2.5-flash-image不能支持image接口

- 创建时间：2026/01/23 09:56
- 优先级：P1
- 提交人：WENWEN-AI
- 指派人：一成
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

gemini-2.5-flash-image不能支持image接口

#### 问题排查

测试image接口的情况,2.5不支持image接口

#### 解决方式

修改nano的接口文档

### BUG-083：gpt-4o-image出现，status_code=403,网络出现异常，请重新进行操作

- 创建时间：2026/01/23 09:54
- 优先级：P1
- 提交人：一成
- 指派人：一成
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

gpt-4o-image出现，status_code=403,网络出现异常，请重新进行操作

#### 问题排查

mj-proxy渠道出现问题

#### 解决方式

联系渠道排查修复

### BUG-084：stream disconnected before completion: stream closed before ...

- 创建时间：2026/01/21 11:37
- 优先级：P1
- 提交人：AiOnly
- 指派人：一成
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

stream disconnected before completion: stream closed before response.completed

#### 问题排查

存在几个codex账号掉授权的情况，请求正好命中了这部分账号，导致响应截断

#### 解决方式

删除错误的team账号

### BUG-085：香蕉1出现Request contains an invalid argument

- 创建时间：2026/01/20 13:20
- 优先级：P1
- 提交人：AiOnly
- 指派人：一成
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

香蕉1出现Request contains an invalid argument

#### 问题排查

盛翔这个渠道账号有问题

#### 解决方式

更换为vertex分组

### BUG-086：用一deepseek卡顿

- 创建时间：2026/01/20 00:04
- 优先级：P1
- 提交人：用一
- 指派人：一成
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

用一deepseek卡顿

#### 问题排查

无

#### 解决方式

无

### BUG-087：claude-sonnet-4-5-20250929有时候会返回空token，还照样扣费

- 创建时间：2026/01/19 19:55
- 优先级：P0
- 提交人：aionly
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

claude-sonnet-4-5-20250929有时候会返回空token，还照样扣费

#### 问题排查

进排查是8776鬼手的claude-sonnet-4-5-20250929问题

#### 解决方式

鬼手暂时不解决，已将模型从渠道去除

### BUG-088：阿里百炼deepseek

- 创建时间：2026/01/18 11:27
- 优先级：P0
- 提交人：鹤涵
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：image.png
- 备注：无

#### Bug 描述

阿里百炼deepseek

#### 问题排查

时延变高和心跳图现象排查。高时延的时候，在服务器直连阿里url，时延正常

#### 解决方式

无

### BUG-089：gemini-3-pro-image-preview 504

- 创建时间：2026/01/18 11:07
- 优先级：P0
- 提交人：scott
- 指派人：程哥
- 状态：临时解决
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

gemini-3-pro-image-preview 504

#### 问题排查

定位为渠道问题：9019,8987均会出现

#### 解决方式

暂时下掉该模型，等渠道反馈中

### BUG-090：gemini思考签名

- 创建时间：2026/01/16 18:01
- 优先级：P0
- 提交人：scott
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：2a831ecb9fc21e939d8b89a2ba2d63c2.png
- 备注：无

#### Bug 描述

gemini思考签名

#### 问题排查

客户可能理解有偏差，这个功能不是加密思考内容的，是为了保持思考上下文，官方文档里也说了，比如用在函数调用的时候

#### 解决方式

无

### BUG-091：pro出现思考

- 创建时间：2026/01/16 15:37
- 优先级：P0
- 提交人：mengma
- 指派人：王鹤涵
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

pro出现思考

#### 问题排查

无

#### 解决方式

1.渠道上线前，先测试。
2.增加resoning token的拨测

### BUG-092：官网cicd卡主

- 创建时间：2026/01/16 15:09
- 优先级：P1
- 提交人：hehan
- 指派人：王鹤涵
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

官网cicd卡主

#### 问题排查

无

#### 解决方式

重新去runner机器把镜像提前下载下来

### BUG-093：lite出现思考

- 创建时间：2026/01/12 18:08
- 优先级：P0
- 提交人：mengma
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

lite出现思考

#### 问题排查

无

#### 解决方式

之前的结论是官方文词，此时走的纯vertex大概率是官方问题，

### BUG-094：客户质疑claude纯度

- 创建时间：2026/01/12 18:06
- 优先级：P0
- 提交人：aionly
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

客户质疑claude纯度

#### 问题排查

官key返回都是2024，返回2025的是官逆

#### 解决方式

aws官方已回复

### BUG-095：sora2使用问题

- 创建时间：2026/01/08 17:11
- 优先级：P0
- 提交人：当贝
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

sora2使用问题

#### 问题排查

自建渠道恢复，同步接口目前无法支持

#### 解决方式

让用户改为异步接口

### BUG-096：sora2使用问题

- 创建时间：2026/01/08 17:09
- 优先级：P0
- 提交人：光魔
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

sora2使用问题

#### 问题排查

视频无法下载，客户服务器在美东，目前只能使用videos.openai.com下载

#### 解决方式

让用户代码里替换域名

### BUG-097：api.wenwen-ai.com带宽打满

- 创建时间：2026/01/08 00:41
- 优先级：P0
- 提交人：hehan
- 指派人：王鹤涵
- 状态：已关闭
- 修复版本：无
- 截图或视频：image.png
- 备注：无

#### Bug 描述

api.wenwen-ai.com带宽打满

#### 问题排查

发现国内网站卡顿，带宽报警，查询专线监控发现带宽满了，先去掉专线走直连

#### 解决方式

无

### BUG-098：claude-code封号

- 创建时间：2026/01/07 16:14
- 优先级：P0
- 提交人：shehan
- 指派人：王鹤涵
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

claude-code封号

#### 问题排查

claude大封号，并发不足

#### 解决方式

1.对接其他渠道
2.自己开账号
3.盯烟花退款

### BUG-099：sora-2 heavy load

- 创建时间：2026/01/06 13:52
- 优先级：P1
- 提交人：光魔
- 指派人：王鹤涵
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

sora-2 heavy load

#### 问题排查

无

#### 解决方式

无

### BUG-100：华橙邮箱绑定异常

- 创建时间：2026/01/05 17:18
- 优先级：P1
- 提交人：华橙
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

华橙邮箱绑定异常

#### 问题排查

绑定邮箱无法收到邮件，经排查是客户系统会过滤邮件，另外验证码需要确认多次才行

#### 解决方式

邮箱加白名单

### BUG-101：gpt-5.2 异常

- 创建时间：2026/01/05 10:08
- 优先级：P0
- 提交人：sy
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

gpt-5.2 异常

#### 问题排查

多渠道同时出现异常，可能与azure有关，目前8552和8961已恢复，8519和8978还有cache

#### 解决方式

用codex

### BUG-102：出现用户额度不足的情况，扣费额度为负数

- 创建时间：2026/01/01 15:39
- 优先级：P1
- 提交人：期智
- 指派人：一成,程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

出现用户额度不足的情况，扣费额度为负数

#### 问题排查

用脚本批量检测各个渠道的使用情况

#### 解决方式

关闭诚-api渠道

### BUG-103：gpt-3.5-turbo, gpt-4不可用

- 创建时间：2025/12/31 18:14
- 优先级：P1
- 提交人：期智
- 指派人：程哥,一成
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

gpt-3.5-turbo, gpt-4不可用

#### 问题排查

旧模型资源不足

#### 解决方式

找可用资源和替代模型

### BUG-104：gpt-5.2 报错

- 创建时间：2025/12/31 16:40
- 优先级：P1
- 提交人：电信
- 指派人：程哥,一成
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

gpt-5.2 报错

#### 问题排查

1. chat接口调用到了codex 分组 2.并发不足

#### 解决方式

1. 调整codex分组优先级 2. 加号

### BUG-105：网站充值失败。从epay后台看是回调失败

- 创建时间：2025/12/31 00:38
- 优先级：P1
- 提交人：鹤涵
- 指派人：王鹤涵
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

网站充值失败。从epay后台看是回调失败

#### 问题排查

无

#### 解决方式

无

### BUG-106：claude生成速度缓慢，出现stream disconnected before completion: stream...

- 创建时间：2025/12/29 17:20
- 优先级：P1
- 提交人：泡泡玛特
- 指派人：一成
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

claude生成速度缓慢，出现stream disconnected before completion: stream closed before response.completed，客户反馈响应慢，生成速度慢

#### 问题排查

推测是响应内容未完整生成就被截断或者当前使用人数较多

#### 解决方式

无

### BUG-107：enable-experimental-windows-sandbox is deprecated. Use '[fea...

- 创建时间：2025/12/29 17:19
- 优先级：P1
- 提交人：code站用户
- 指派人：一成
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

enable-experimental-windows-sandbox is deprecated. Use '[features]. experimental-windows-sandbox instead

#### 问题排查

更新版本之后，原来版本没有修改配置导致的bug

#### 解决方式

将enable_experimental_windows_sandbox = true改成experimental_windows_sandbox = true

### BUG-108：自建sora逆向渠道，生成视频画质模糊

- 创建时间：2025/12/29 17:15
- 优先级：P1
- 提交人：无
- 指派人：一成
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

自建sora逆向渠道，生成视频画质模糊

#### 问题排查

无

#### 解决方式

暂时继续使用tokens逆向平台

### BUG-109：1.改充值倍率7 2.改系统倍率7 3.改国内模型的价格（ds,可灵，千问），按照7吧人名币换算成美金，设置模型倍率 4...

- 创建时间：2025/12/29 16:37
- 优先级：P1
- 提交人：鹤涵
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：修改中文模型价格.xlsx
- 备注：无

#### Bug 描述

1.改充值倍率7
2.改系统倍率7
3.改国内模型的价格（ds,可灵，千问），按照7吧人名币换算成美金，设置模型倍率
4.校验模型广场里的中美价格

#### 问题排查

无

#### 解决方式

无

### BUG-110：gemini-3-flash-preview思考深度测试-本地

- 创建时间：2025/12/27 15:12
- 优先级：P1
- 提交人：鹤涵
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

gemini-3-flash-preview思考深度测试-本地

#### 问题排查

需要支持-minimal参数

#### 解决方式

最新版本已解决

### BUG-111：gemini-3-pro-image-preview 1K-2K和4K价格设置

- 创建时间：2025/12/24 19:34
- 优先级：P1
- 提交人：鹤涵
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

gemini-3-pro-image-preview 1K-2K和4K价格设置

#### 问题排查

1K2K：0.12  4K: 0.241

#### 解决方式

4K单独渠道，通过参数覆盖

### BUG-112：gemini 缓存模式

- 创建时间：2025/12/24 17:47
- 优先级：P1
- 提交人：肯斯爪特
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

gemini 缓存模式

#### 问题排查

目前账号池不支持，需要开大账号

#### 解决方式

无

### BUG-113：gemini思考深度测试

- 创建时间：2025/12/24 16:58
- 优先级：P1
- 提交人：鹤涵
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

gemini思考深度测试

#### 问题排查

gemini思考深度测试

#### 解决方式

gemini-3-flash-preview 这个模型要想没有reasoning token只能用minimal模式，其他low,medium,high都差不多。但是现在chat接口new api还没有支持参数-minimal

### BUG-114：问问智能体平台速度慢

- 创建时间：2025/12/24 15:17
- 优先级：P1
- 提交人：湃青年
- 指派人：程哥,一成
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

问问智能体平台速度慢

#### 问题排查

知识库检索速度慢，AI回复也慢

#### 解决方式

1. embedding模型应该是主因，建议选用Embedding-3-Small这个模型，这个模型比较快  
2. 知识库搜索的问题优化会占用一些时间，可以考虑关掉 
3. 问答大模型, gemini-3-pro思考时间偏长，可以综合效果尝试使用genimi-3-flash-preview

### BUG-115：gemini-2.5-flash-nothinking 出现thinking

- 创建时间：2025/12/24 12:50
- 优先级：P1
- 提交人：mengma
- 指派人：程哥,一成
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

gemini-2.5-flash-nothinking 出现thinking

#### 问题排查

8919渠道问题

#### 解决方式

渠道已解决

### BUG-116：sora-2 模型计费问题

- 创建时间：2025/12/23 21:05
- 优先级：P1
- 提交人：光魔
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

sora-2 模型计费问题

#### 问题排查

/videos接口new-api会基于视频时长计费

#### 解决方式

使用环境变量TASK_PRICE_PATCH=sora-2,sora_video2

### BUG-117：'message': 'newAPIError: unmarshal response to error failed:...

- 创建时间：2025/12/23 18:24
- 优先级：P1
- 提交人：肯斯爪特
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

'message': 'newAPIError: unmarshal response to error failed: json: cannot unmarshal string into Go struct field apiError.error.code of type int. Response: {"error":{"code":"model_not_found","message":"分组 default 下模型 gemini-2.0-flash-001 无可用渠道（distributor） (request id: 202512231800297279799417EsKh3hS)","type":"new_api_error"}}',
2）换了个模型，可以跑通，但是50%概率会出现无法识别图片的问题： [{'content': {'parts': [{'text': '好的，请提供您需要审核的图片和文本内容。我将根据您提供的标准进行判断和打分。'}],

#### 问题排查

模型选择错误，接口调用错误

#### 解决方式

无

### BUG-118：sora-2 模型使用

- 创建时间：2025/12/23 17:55
- 优先级：P1
- 提交人：光魔
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

sora-2 模型使用

#### 问题排查

为了兼容ZeakAi渠道的模型名字，在tokens后台加了sora-2 到 sora_video2的重定向，这样光魔那边还是可以继续使用sora-2，之前使用sora_video2的也不受影响

#### 解决方式

为了兼容ZeakAi渠道的模型名字，在tokens后台加了sora-2 到 sora_video2的重定向，这样光魔那边还是可以继续使用sora-2，之前使用sora_video2的也不受影响

### BUG-119：gemini-3-pro-image-preview 不可用

- 创建时间：2025/12/23 14:40
- 优先级：P1
- 提交人：峰兄
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

gemini-3-pro-image-preview 不可用

#### 问题排查

8887不可用但是优先级太高（涨价到8毛一刀）

#### 解决方式

暂时去掉该模型

### BUG-120：ZeakAi sora接入

- 创建时间：2025/12/23 13:49
- 优先级：P1
- 提交人：程哥
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：和chat接口无法兼容

#### Bug 描述

ZeakAi sora接入

#### 问题排查

渠道设置不对

#### 解决方式

videos接口需要使用https://zeakai.api4midjourney.com/api/sora 地址，调用格式需要是multi/form-data

### BUG-121：逆向sora，❌ 400 📦 {"error":{"code":"heavy_load","message":"We'r...

- 创建时间：2025/12/23 13:48
- 优先级：P1
- 提交人：光魔
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

逆向sora，❌ 400 📦 {"error":{"code":"heavy_load","message":"We're under heavy load, please try again later.","param":null,"type":"invalid_request_error"}}

#### 问题排查

官方问题

#### 解决方式

升级后解决

### BUG-122：余额告警，企微webhook不支持

- 创建时间：2025/12/22 21:52
- 优先级：P1
- 提交人：光魔
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

余额告警，企微webhook不支持

#### 问题排查

new api不支持企微webhook格式，仅支持默认格式，需要单独适配

#### 解决方式

让客户使用邮箱通知

### BUG-123：API Error: 400 {error":t"type":"<nil>","message"."messages

- 创建时间：2025/12/22 14:33
- 优先级：P1
- 提交人：code站
- 指派人：一成
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

API Error: 400 {error":t"type":"<nil>","message"."messages

#### 问题排查

无

#### 解决方式

让客户重装cc终端npm uninstall -g @anthropic-ai/claude-code
npm install -g @anthropic-ai/claude-code，再配置新的环境变量

### BUG-124：账号有余额，但是报错这个API Error: 403 {"error":{"type":"new_api_error",...

- 创建时间：2025/12/22 14:33
- 优先级：P1
- 提交人：code站
- 指派人：一成
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

账号有余额，但是报错这个API Error: 403 {"error":{"type":"new_api_error","message":"token quota is not enough, token remain quota: ＄0.194932, need quota: ＄0.227610 (request id: 20251221215854405487233VkTsCSO2)"},"type":"error"} · Please run
    /login

#### 问题排查

查看gemini相关渠道的使用情况

#### 解决方式

default分组资源不足，联系客户更换分组

### BUG-125：The response was filtered due to the prompt triggering Azure...

- 创建时间：2025/12/18 00:02
- 优先级：P1
- 提交人：sy
- 指派人：一成
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

The response was filtered due to the prompt triggering Azure OpenAI's content management policy. Please modify your prompt and retry. To learn more about our content filtering policies please read our documentation: https://***.com/***?linkid=***

#### 问题排查

查看日志信息，发现内容触犯Azure规则，

#### 解决方式

联系客户过滤敏感内容

### BUG-126：claude多个模型报错返回nil

- 创建时间：2025/12/17 21:17
- 优先级：P1
- 提交人：Aionly
- 指派人：一成
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

claude多个模型报错返回nil

#### 问题排查

按照之前的解决方式，通知客户更改环境变量

#### 解决方式

API Error: 400 {"error": {"type":"<nil>","message":"***,***.custom.input_examples: Extra inputs are not permitted"}}
这是Claude新版本引入的一个实验性功能冲突。从搜索结果看，这个问题非常普遍：
根本原因
Claude Code 2.0.42+ 版本在新的工具定义中添加了 input_examples 字段
这个字段是实验性的beta功能，需要特定的API版本支持
但当前Anthropic API还不接受这个字段，导致"Extra inputs are not permitted"错误
触发条件
主要影响无头模式 (claude -p)
工具索引3（Grep工具）是第一个包含input_examples的工具
与是否使用第三方网关无关，是Claude Code自身的问题
解决方案
✅ 推荐方案：禁用实验性功能
设置环境变量：
bash
复制
export CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS=1
不同系统的设置方法：
macOS/Linux:
bash
复制
echo 'export CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS="1"' >> ~/.zshrc
source ~/.zshrc
Windows:
在系统环境变量中添加：
变量名：CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS
变量值：1
重要：设置后需要关闭所有终端窗口重新打开才能生效！
🔄 临时绕过方案
如果上述方法无效，可以尝试：
使用交互模式 - 这个问题主要影响无头模式
降级Claude Code版本 - 回退到2.0.41或更早版本
通过settings.json配置 - 但注意环境变量设置可能不生效
⚠️ 注意事项
这个环境变量必须在系统层面设置，在settings.json中设置可能无效
设置后需要完全重启终端
如果问题持续，可能需要等待Claude Code的新版本修复

### BUG-127：gpt-5.2一直报错

- 创建时间：2025/12/17 21:15
- 优先级：P1
- 提交人：sy
- 指派人：一成
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

gpt-5.2一直报错

#### 问题排查

风雨渠道资源不足，告知客户更换分组，客户不接受

#### 解决方式

接入其它逆向渠道，牛马api

### BUG-128：风雨渠道不通

- 创建时间：2025/12/17 13:14
- 优先级：P1
- 提交人：鹤涵
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

风雨渠道不通

#### 问题排查

风雨渠道不再支持ip访问，切换到域名

#### 解决方式

风雨渠道不再支持ip访问，切换到域名

### BUG-129：gpt渠道一直在报错

- 创建时间：2025/12/16 21:33
- 优先级：P1
- 提交人：鹤涵
- 指派人：王鹤涵
- 状态：已关闭
- 修复版本：无
- 截图或视频：image.png
- 备注：无

#### Bug 描述

gpt渠道一直在报错

#### 问题排查

无

#### 解决方式

无

### BUG-130：claude无法使用function call

- 创建时间：2025/12/15 16:23
- 优先级：P1
- 提交人：随意
- 指派人：一成
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

claude无法使用function call

#### 问题排查

根据日志定位具体的模型和渠道，编写相关测试案例进行验证

#### 解决方式

给客户提供调用案例，调整渠道的优先级{
    "model": "claude-sonnet-4-5-20250929",
    "messages": [
        {
            "role": "user",
            "content": "今天北京的天气怎么样?"
        },
        {
            "role": "assistant",
            "content": [
                {
                    "type": "tool_use",
                    "id": "toolu_1",
                    "name": "get_weather",
                    "input": {
                        "location": "北京"
                    }
                }
            ]
        },
        {
            "role": "user",
            "content": [
                {
                    "type": "tool_result",
                    "tool_use_id": "toolu_1",
                    "content": "{\"location\":\"北京\",\"weather\":\"多云\",\"temperature\":\"26°C\",\"humidity\":\"45%\"}"
                }
            ]
        }
    ]
}

### BUG-131：vscode里使用cc，总是出现请稍等，无法真正完成任务

- 创建时间：2025/12/15 11:37
- 优先级：P1
- 提交人：国金汇德
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

vscode里使用cc，总是出现请稍等，无法真正完成任务

#### 问题排查

令牌问题，没有使用claude-code分组

#### 解决方式

换成claude-code分组后解决

### BUG-132：cc命令长时间不返回

- 创建时间：2025/12/15 11:02
- 优先级：P1
- 提交人：期智
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

cc命令长时间不返回

#### 问题排查

没有报错，可能和输入长度以及任务复杂度有关

#### 解决方式

无

### BUG-133：gemini-2.5-flash-lite

- 创建时间：2025/12/14 14:58
- 优先级：P1
- 提交人：mengma
- 指派人：一成
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：第一时间反馈渠道

#### Bug 描述

gemini-2.5-flash-lite

#### 问题排查

lite里面出现reason token，通过报错日志，溯源渠道

#### 解决方式

临时切换渠道

### BUG-134：新版本cc，容易出现API Error: 400 {"error": {"type":"<nil>","message"...

- 创建时间：2025/12/14 14:57
- 优先级：P1
- 提交人：泡泡玛特
- 指派人：程哥,一成
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：等new-api更新

#### Bug 描述

新版本cc，容易出现API Error: 400 {"error": {"type":"<nil>","message":"***,***.custom.input_examples: Extra inputs are not permitted"}}

#### 问题排查

API Error: 400 {"error": {"type":"<nil>","message":"***,***.custom.input_examples: Extra inputs are not permitted"}}
这是Claude新版本引入的一个实验性功能冲突。从搜索结果看，这个问题非常普遍：
根本原因
Claude Code 2.0.42+ 版本在新的工具定义中添加了 input_examples 字段
这个字段是实验性的beta功能，需要特定的API版本支持
但当前Anthropic API还不接受这个字段，导致"Extra inputs are not permitted"错误
触发条件
主要影响无头模式 (claude -p)
工具索引3（Grep工具）是第一个包含input_examples的工具
与是否使用第三方网关无关，是Claude Code自身的问题
解决方案
✅ 推荐方案：禁用实验性功能
设置环境变量：
bash
复制
export CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS=1
不同系统的设置方法：
macOS/Linux:
bash
复制
echo 'export CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS="1"' >> ~/.zshrc
source ~/.zshrc
Windows:
在系统环境变量中添加：
变量名：CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS
变量值：1
重要：设置后需要关闭所有终端窗口重新打开才能生效！
🔄 临时绕过方案
如果上述方法无效，可以尝试：
使用交互模式 - 这个问题主要影响无头模式
降级Claude Code版本 - 回退到2.0.41或更早版本
通过settings.json配置 - 但注意环境变量设置可能不生效
⚠️ 注意事项
这个环境变量必须在系统层面设置，在settings.json中设置可能无效
设置后需要完全重启终端
如果问题持续，可能需要等待Claude Code的新版本修复

#### 解决方式

① 删除已有 AB Test 状态文件
rm -f statsig.session_id* \
      statsig.cached.evaluations* \
      statsig.last_modified_time.evaluations*

② 创建“只读占位文件”
touch statsig.session_id \
      statsig.cached.evaluations \
      statsig.last_modified_time.evaluations

③ 设置为只读（禁止 SDK 再写入）
chmod 444 statsig.session_id \
          statsig.cached.evaluations \
          statsig.last_modified_time.evaluations


执行完这三步后：AB Test 永久失效

④ 验证
ls -l statsig.*


看到类似下面即成功：

-r--r--r--  statsig.session_id
-r--r--r--  statsig.cached.evaluations
-r--r--r--  statsig.last_modified_time.evaluations

### BUG-135：claude-4.5 sonnet和haiku使用api会出现提交请求后等到数分钟无响应的问题

- 创建时间：2025/12/12 20:03
- 优先级：P1
- 提交人：易感智能
- 指派人：一成
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

claude-4.5 sonnet和haiku使用api会出现提交请求后等到数分钟无响应的问题

#### 问题排查

后台日志发现大量截断，输出异常的情况，鬼手渠道问题。

#### 解决方式

溯源腾讯云后台日志，联系渠道修复，他无法修复，禁用该渠道。测试并启用其他渠道

### BUG-136：claude-4.5 sonnet和haiku

- 创建时间：2025/12/12 20:02
- 优先级：P1
- 提交人：问问code
- 指派人：一成
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

claude-4.5 sonnet和haiku

#### 问题排查

先自测无误，再检查客户的url和参数

#### 解决方式

修改url,删除/

### BUG-137：客户需要单独查询每个key的用量情况

- 创建时间：2025/12/11 11:14
- 优先级：P1
- 提交人：wenwen支持
- 指派人：一成
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

客户需要单独查询每个key的用量情况

#### 问题排查

无

#### 解决方式

提供key的查询插件https://usage.wenwen-ai.com/

### BUG-138：gemini-2.5-pro出现频繁截断现象

- 创建时间：2025/12/11 11:04
- 优先级：P1
- 提交人：mengma
- 指派人：一成
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

gemini-2.5-pro出现频繁截断现象

#### 问题排查

先观察腾讯云仪表盘是否存在异常情况，根据报错日志时间锁定具体的渠道

#### 解决方式

联系渠道，关闭Gemini思考后缀适配

### BUG-139：decode base64 image data failed: fail to decode image config...

- 创建时间：2025/12/11 08:48
- 优先级：P1
- 提交人：aionly
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

decode base64 image data failed: fail to decode image config(we
bp): riff: missing RIFF chunk header

#### 问题排查

openai渠道类型无法支持谷歌存储桶地址：gs://cloud-samples-data/generative-ai/image/scones.jpg

#### 解决方式

给gemini渠道类型新建vertx分组，8866,8887

### BUG-140：上传失败:Request failed with status code 404

- 创建时间：2025/12/07 19:29
- 优先级：P1
- 提交人：问问code
- 指派人：一成
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

上传失败:Request failed with status code 404

#### 问题排查

问问平台不支持某些功能

#### 解决方式

告知客户使用CherryStudio.并帮助客户配置api

### BUG-141：8866,8887使用gemini-3-pro-image-preview会出现返回文字，不出图的情况

- 创建时间：2025/12/05 22:37
- 优先级：P1
- 提交人：无
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

8866,8887使用gemini-3-pro-image-preview会出现返回文字，不出图的情况

#### 问题排查

打印信息不全，已排除

#### 解决方式

无

### BUG-142：500 {"error":{"type":"bad response_status_code","message

- 创建时间：2025/12/05 15:49
- 优先级：P1
- 提交人：泡泡玛特
- 指派人：一成
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

500 {"error":{"type":"bad response_status_code","message

#### 问题排查

某个账号周限流，请求正好命中限流账号，触发重试

#### 解决方式

告知客户重启cc终端

### BUG-143：breakout5.1不能访问

- 创建时间：2025/12/04 18:52
- 优先级：P1
- 提交人：code站用户
- 指派人：一成
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

breakout5.1不能访问

#### 问题排查

resopnse接口不适用于n8n的openai接口

#### 解决方式

已告知用户，更换请求方式

### BUG-144：gemini-3-pro-preview 408超时

- 创建时间：2025/12/03 12:02
- 优先级：P1
- 提交人：有赞
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

gemini-3-pro-preview 408超时

#### 问题排查

输出token超长65535，需要时间输出，

#### 解决方式

已告知客户

### BUG-145：whisper-1  不稳定报错

- 创建时间：2025/12/03 11:57
- 优先级：P1
- 提交人：科科
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

whisper-1  不稳定报错

#### 问题排查

8569渠道问题，时好时坏，multipart form error

#### 解决方式

寻找其他渠道替代,6353可用

### BUG-146：codex-mini不能响应

- 创建时间：2025/12/02 19:05
- 优先级：P1
- 提交人：code站用户
- 指派人：一成
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

codex-mini不能响应

#### 问题排查

更换其它模型测试正常，官方没有添加这个模型

#### 解决方式

模型市场加上这个mini模型

### BUG-147：claude-sonnet-4-5-20250929

- 创建时间：2025/12/02 19:04
- 优先级：P1
- 提交人：有赞&锦望
- 指派人：一成
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

claude-sonnet-4-5-20250929

#### 问题排查

tokens超过500w，推测是传入异常巨大的文件

#### 解决方式

无

### BUG-148：控制台报表报错 错误：sql: Scan error on column index 3, name "token_us...

- 创建时间：2025/12/01 21:41
- 优先级：P1
- 提交人：鹤涵
- 指派人：王鹤涵
- 状态：已关闭
- 修复版本：无
- 截图或视频：bea6c1abcd519b5e8f9a7d8f848f2528.png
- 备注：无

#### Bug 描述

控制台报表报错 错误：sql: Scan error on column index 3, name "token_used": converting driver.Value type []uint8 ("-27670116110564325757") to a int: value out of range

#### 问题排查

通过sql查询，看是whisper-1影响的
  SELECT model_name,
         sum(count) as count,
         sum(quota) as quota,
         sum(token_used) as token_used,
         created_at
  FROM quota_data
  WHERE created_at >= 1764507069
    AND created_at <= 1764597069
  GROUP BY model_name, created_at;

#### 解决方式

用sql删掉报表和log的脏数据

### BUG-149："{"error":{"message":"error parsing multipart form: multipar...

- 创建时间：2025/12/01 18:17
- 优先级：P1
- 提交人：larkagent
- 指派人：程哥
- 状态：临时解决
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

"{"error":{"message":"error parsing multipart form: multipart: NextPart: EOF (request id: 20251201180128485346156zNQhxXXI)","type":"new_api_error","param":"","code":"convert_request_failed"}}"

#### 问题排查

8552渠道的问题，8502，8837有同样的问题。另外8514,8524都不可用。gpt-4o-transcribe和gpt-4o-mini-transcribe只有8502有，但是也会报这个错。

#### 解决方式

将这些渠道的模型暂时下架,不让客户跑mp4，数据修复下

### BUG-150：whisper计费规则：

- 创建时间：2025/12/01 17:47
- 优先级：P0
- 提交人：科科
- 指派人：程哥
- 状态：临时解决
- 修复版本：无
- 截图或视频：7854caacc44de7c97fc4a493aff6e73b.png,7b41710f-997f-4bb9-991c-e907ae47170d.png
- 备注：无

#### Bug 描述

whisper计费规则：

#### 问题排查

按音频时长来算的token，1s=16.66 token

#### 解决方式

无

### BUG-151：图片修改出现黑边

- 创建时间：2025/11/29 11:41
- 优先级：P1
- 提交人：3vjia
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

图片修改出现黑边

#### 问题排查

渠道8503适配问题，已修复。

#### 解决方式

8503返回格式为url，其他渠道返回格式为b64，目前建议客户使用b64格式。如果客户需要使用url格式，可以继续使用8503渠道，为了避免各渠道url和b64混用的情况，8503模型名字改为gemini-2.5-flash-image-url

### BUG-152：claude 4.5 报400

- 创建时间：2025/11/28 19:19
- 优先级：P1
- 提交人：成都用一
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

claude 4.5 报400

#### 问题排查

channel error (channel #8523, status code: 500): InvokeModel: operation error Bedrock Runtime: InvokeModel, https response error StatusCode: 400, RequestID: 3ae238a8-7ed6-43ae-b3d0-536339977e65, ValidationException: invalid beta flag

#### 解决方式

待获取复现参数

### BUG-153：梦马flash-nothinking产生reasoning

- 创建时间：2025/11/28 12:40
- 优先级：P1
- 提交人：mengma
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

梦马flash-nothinking产生reasoning

#### 问题排查

发现实际使用模型是gemini-2.5-flash，经过排查发现8564渠道，将gemini-2.5-flash-nothinking重定向到gemini-2.5-flash，并且渠道没有gemini-2.5-flash-nothinking可以用

#### 解决方式

8564去掉nothinking模型

### BUG-154：问问code访问失效

- 创建时间：2025/11/26 21:36
- 优先级：P1
- 提交人：泡泡马特
- 指派人：一成
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

问问code访问失效

#### 问题排查

中转站频繁打不开

#### 解决方式

让客户更换节点或换节点重试

### BUG-155：gpt-5-codex模型请求阻塞没响应

- 创建时间：2025/11/26 21:35
- 优先级：P1
- 提交人：华橙
- 指派人：一成
- 状态：临时解决
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

gpt-5-codex模型请求阻塞没响应

#### 问题排查

中转站无法启动，溯源服务器，发现服务器已挂

#### 解决方式

重启服务器或更换

### BUG-156：{"id":"chatcmpl-20251125130837563136397KBTEYbQy","object":"c...

- 创建时间：2025/11/25 21:19
- 优先级：P1
- 提交人：mengma
- 指派人：程哥
- 状态：临时解决
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

{"id":"chatcmpl-20251125130837563136397KBTEYbQy","object":"chat.completion","created":1764047319,"model":"gemini-2.5-flash-lite","choices":[{"index":0,"message":{"role":"assistant","content":"*Hyunjin nhìn xuống chiếc váy chị đang mặc, trái tim em"},"logprobs":null,"finish_reason":"length"}],"usage":{"prompt_tokens":4791,"completion_tokens":398,"total_tokens":5189,"prompt_tokens_details":{"text_tokens":4791,"cached_tokens_details":{}},"completion_tokens_details":{"reasoning_tokens":383},"claude_cache_creation_5_m_tokens":0,"claude_cache_creation_1_h_tokens":0}}

#### 问题排查

flashlite默认不应该思考，无法复现，排查中... 参数也没给出

#### 解决方式

无

### BUG-157：问问操场显示"分组 default 下模型 gpt-5.1-codex无可用渠道

- 创建时间：2025/11/25 19:51
- 优先级：P1
- 提交人：Yanan
- 指派人：一成
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

问问操场显示"分组 default 下模型 gpt-5.1-codex无可用渠道

#### 问题排查

无

#### 解决方式

修改分组为codex即可

### BUG-158：问问操场截断上下文，复杂问题返回为空

- 创建时间：2025/11/25 14:58
- 优先级：P1
- 提交人：code站用户
- 指派人：一成
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

问问操场截断上下文，复杂问题返回为空

#### 问题排查

号池正常使用，curl测试正常

#### 解决方式

建议客户使用cherrystudio或curl测试

### BUG-159：sora2-video生成速度慢

- 创建时间：2025/11/25 13:07
- 优先级：P1
- 提交人：脑琪科技
- 指派人：一成
- 状态：临时解决
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

sora2-video生成速度慢

#### 问题排查

官方负载严重

#### 解决方式

无

### BUG-160：可灵模型使用无权限

- 创建时间：2025/11/24 17:53
- 优先级：P1
- 提交人：当贝
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

可灵模型使用无权限

#### 问题排查

尝试不同令牌发现为令牌原因，根因是令牌做了模型限制

#### 解决方式

取消令牌模型限制

### BUG-161：gemini-2.5-flash-nothinking8901渠道响应慢，平均超过90s

- 创建时间：2025/11/23 11:52
- 优先级：P1
- 提交人：mengma
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

gemini-2.5-flash-nothinking8901渠道响应慢，平均超过90s

#### 问题排查

发现不是8901的问题，是权重在前面的8859和8896因并发不足，长时间后返回{"error":{"message":"当前分组上游负载已饱和，请稍后再试 (request id: 2025112311075463772747699742868)","type":"upstream_error","param":"","code":429}}
耗时81.49378085136414

#### 解决方式

降低8895,8896的权重

### BUG-162：{id=null, type=error, role=null, model=claude-opus-4.1, cont...

- 创建时间：2025/11/19 19:21
- 优先级：P1
- 提交人：aionly
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

{id=null, type=error, role=null, model=claude-opus-4.1, content=null, usage=null, error={message=InvokeModel: operation error Bedrock Runtime: InvokeModel, https response error StatusCode: 400, RequestID: cd0acc22-06b0-42ee-a1c6-e35f13a2f7bc, ValidationException: The provided model identifier is invalid. (request id: 20251119170316364610470leuyGtGr) (request id: 20251119170314590525501yOC4zlmQ) (request id: 20251119040117980223321hNVbbOZO), type=<nil>, param=null, code=null}, stop_reason=null, stop_sequence=null}

#### 问题排查

客户封装模型名称claude-opus-4.1，无法找到模型，原始模型未复现。

#### 解决方式

请客户使用原始模型测试，排除问问问题

### BUG-163：gpt-5-codex调用失败

- 创建时间：2025/11/19 15:28
- 优先级：P1
- 提交人：华橙
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

gpt-5-codex调用失败

#### 问题排查

新的渠道仅支持responses接口+stream模式

#### 解决方式

无

### BUG-164：deepseek-v3-0324出现超时

- 创建时间：2025/11/19 15:23
- 优先级：P0
- 提交人：鹤涵-用一
- 指派人：王鹤涵
- 状态：已关闭
- 修复版本：无
- 截图或视频：image.png
- 备注：无

#### Bug 描述

deepseek-v3-0324出现超时

#### 问题排查

观察监控看到，是百度云的问题

#### 解决方式

让百度修复，接其他渠道

### BUG-165：现在mj生成图片速度很慢，出图大概要10分钟，这个速度能提升吗？

- 创建时间：2025/11/19 14:32
- 优先级：P1
- 提交人：当贝
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

现在mj生成图片速度很慢，出图大概要10分钟，这个速度能提升吗？

#### 问题排查

渠道改为RELAX模式后变慢了了，尝试其他接入渠道

#### 解决方式

接入8900后，速度正常

### BUG-166：感易智能sonnet4.5报错

- 创建时间：2025/11/19 00:06
- 优先级：P1
- 提交人：无
- 指派人：王鹤涵
- 状态：临时解决
- 修复版本：无
- 截图或视频：2.png
- 备注：无

#### Bug 描述

感易智能sonnet4.5报错

#### 问题排查

无

#### 解决方式

无

### BUG-167：用一报错500

- 创建时间：2025/11/18 22:37
- 优先级：P0
- 提交人：用一
- 指派人：王鹤涵
- 状态：已关闭
- 修复版本：无
- 截图或视频：image.png,276dc000e866013cd8e850c79bf10e53.png
- 备注：无

#### Bug 描述

用一报错500

#### 问题排查

用户日志上看有大量的500

#### 解决方式

问题排查记录

### BUG-168：大量模型同时报警500

- 创建时间：2025/11/18 19:40
- 优先级：P0
- 提交人：鹤涵
- 指派人：王鹤涵
- 状态：已关闭
- 修复版本：无
- 截图或视频：image.png
- 备注：无

#### Bug 描述

大量模型同时报警500

#### 问题排查

cf挂了，后续挂的更严重

#### 解决方式

让客户切换到key.wenwen,同时去掉cf的流量托管

### BUG-169：通过newapi的目前遇到了一个问题，sonnet4.5的，返回的结构体出现了非官方结构的。导致我们这边解析会异常。咱们...

- 创建时间：2025/11/17 16:48
- 优先级：P1
- 提交人：AIonly
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

通过newapi的目前遇到了一个问题，sonnet4.5的，返回的结构体出现了非官方结构的。导致我们这边解析会异常。咱们这边是否可以排查一下日志里面，是不是有非官方结构的渠道在跑着

#### 问题排查

需要用户提供确切时间，确认有问题的渠道

#### 解决方式

客户未提供相关信息

### BUG-170：code站codex报错

- 创建时间：2025/11/17 14:01
- 优先级：P1
- 提交人：孟健
- 指派人：一成
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

code站codex报错

#### 问题排查

无

#### 解决方式

无

### BUG-171：gemini,flash,lite并发不足（1120全面崩溃）

- 创建时间：2025/11/14 22:32
- 优先级：P0
- 提交人：梦马
- 指派人：王鹤涵
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

gemini,flash,lite并发不足（1120全面崩溃）

#### 问题排查

腾讯云超时告警群

#### 解决方式

1.自己平台上线扩并发
2.上游扩并发
3.用官方资源兜底（现在已经走到这个阶段了）

### BUG-172：这个codex的key请求报错bad response code是为什么呀

- 创建时间：2025/11/14 16:17
- 优先级：P1
- 提交人：AWS
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

这个codex的key请求报错bad response code是为什么呀

#### 问题排查

客户接口调用错误

#### 解决方式

需要用responses接口，并且stream要设为True

### BUG-173：发现配套cursor ide,使用openai 的gpt-5-codex模型一直报错，报错信息field message...

- 创建时间：2025/11/14 10:34
- 优先级：P1
- 提交人：华橙
- 指派人：程哥
- 状态：修复中
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

发现配套cursor ide,使用openai 的gpt-5-codex模型一直报错，报错信息field messages is required (request id: 20251113202956642042327zVvZKqyv)

#### 问题排查

排查中

#### 解决方式

无

### BUG-174：2025-11-12 11:23:23,账号sy,模型gpt5-chat-latest,调用出错

- 创建时间：2025/11/13 20:28
- 优先级：P1
- 提交人：sy
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：2f202c3a6b0ad3bd813e8b1b7c4a1296.jpg
- 备注：无

#### Bug 描述

2025-11-12 11:23:23,账号sy,模型gpt5-chat-latest,调用出错

#### 问题排查

循环测试50次没有问题，平均耗时: 7.064283061027527

#### 解决方式

无

### BUG-175：gemini-2.5-pro-thinking-128比较慢

- 创建时间：2025/11/13 20:22
- 优先级：P0
- 提交人：梦马
- 指派人：王鹤涵
- 状态：已关闭
- 修复版本：无
- 截图或视频：1763036501511.png,1763036493159.png
- 备注：无

#### Bug 描述

gemini-2.5-pro-thinking-128比较慢

#### 问题排查

同一条日志看我们后台和上游后台有12s的差距很不正常，大概率还是并发问题

#### 解决方式

自己平台做适配，上游扩并发

### BUG-176：@鹤涵 非流式请求deepseek,30s超时的频次稍微高一些，能看下主要问题是什么吗

- 创建时间：2025/11/13 19:02
- 优先级：P1
- 提交人：用一
- 指派人：王鹤涵
- 状态：已关闭
- 修复版本：无
- 截图或视频：image.png,00b6d9cd814c3e5b3d3fbd5d24394d2b.png
- 备注：无

#### Bug 描述

@鹤涵 非流式请求deepseek,30s超时的频次稍微高一些，能看下主要问题是什么吗

#### 问题排查

看腾讯云日志确实有复现，再看百度的后台是百度的问题

#### 解决方式

让百度去排查，同时去测试火山

### BUG-177：sora2 有报错的会一直重试，耗时长，也会触发风控

- 创建时间：2025/11/13 17:53
- 优先级：P1
- 提交人：鹤涵-当贝
- 指派人：王鹤涵
- 状态：已关闭
- 修复版本：无
- 截图或视频：294793357a3e1dea3dd9cc552b2fc049.png,image.png
- 备注：无

#### Bug 描述

sora2 有报错的会一直重试，耗时长，也会触发风控

#### 问题排查

从日志页面上看，会一直重试 。从上游页面能看到有敏感词报错，系统还会一直重试，但是大概率还是会失败

#### 解决方式

失败现在也直接返回了，自己的账号池增加了并发

### BUG-178：youzan调用gpt-image-1没记上费

- 创建时间：2025/11/13 17:04
- 优先级：P1
- 提交人：鹤涵-有赞
- 指派人：王鹤涵
- 状态：已关闭
- 修复版本：无
- 截图或视频：image.png
- 备注：无

#### Bug 描述

youzan调用gpt-image-1没记上费

#### 问题排查

从日志页面上看调用8503渠道image计费

#### 解决方式

去掉default渠道走逆向的渠道（计费不上token赔本的）

### BUG-179：gpt-4o-mini 又躺平了，好多几十秒的[捂脸] HTTP/1.1 200 OK (51795ms)

- 创建时间：2025/11/13 16:56
- 优先级：P1
- 提交人：larkagent
- 指派人：王鹤涵
- 状态：已关闭
- 修复版本：无
- 截图或视频：image.png
- 备注：无

#### Bug 描述

gpt-4o-mini
又躺平了，好多几十秒的[捂脸]
HTTP/1.1 200 OK (51795ms)

#### 问题排查

看腾讯云日志

#### 解决方式

1. 报警改成30s。
2. 8514渠道有问题，通知渠道修复。优先级降低，用其他渠道兜底。

### BUG-180：aws的key请求会被截断

- 创建时间：2025/11/13 16:49
- 优先级：P1
- 提交人：aionly
- 指派人：王鹤涵
- 状态：已关闭
- 修复版本：无
- 截图或视频：新建 文本文档.txt
- 备注：无

#### Bug 描述

aws的key请求会被截断

#### 问题排查

号也挂了，要从新渠道开账号了

#### 解决方式

无

### BUG-181：gemini-2.5-flash-image-preview 报错：I can't create more images...

- 创建时间：2025/11/13 14:37
- 优先级：P1
- 提交人：当贝
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

gemini-2.5-flash-image-preview 报错：I can't create more images for you today, but I can still find images from the web.

Sorry, I can't generate more images for you today, but come back tomorrow and we can make more.

#### 问题排查

gemini-2.5-flash-image-preview已过期，目前切换为gemini-2.5-flash-image，返回格式为b64
除了8573返回google url，其他渠道都返回b64：
8503：耗时17.916265964508057
8525：{"error":{"message":"当前分组上游负载已饱和，请稍后再试
8570：耗时13.967704057693481   
8571：耗时92.92047429084778
8573：返回 http://googleusercontent.com/image_collection/image_retrieval/1742844427365043388

#### 解决方式

删除8503，8570，8573，gemini-2.5-flash-image-preview模型。
指导用户使用gemini-2.5-flash-image

### BUG-182：max_tokens参数下，gemini-2.5-flash模型返回内容被截断

- 创建时间：2025/11/12 18:47
- 优先级：P1
- 提交人：梦马
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：删除gemini-2.5-flash-nothinking模型后，还是会被调用

#### Bug 描述

max_tokens参数下，gemini-2.5-flash模型返回内容被截断

#### 问题排查

8755 nothinking模式失效

#### 解决方式

删除gemini-2.5-flash-nothinking模型

### BUG-183：客户在code站使用api调用，chat无法访问gpt-5-codex模型

- 创建时间：2025/11/12 18:47
- 优先级：P1
- 提交人：code站用户
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

客户在code站使用api调用，chat无法访问gpt-5-codex模型

#### 问题排查

新的逆向渠道需要使用responses接口以及stream模式

#### 解决方式

让客户使用breakout站

### BUG-184：这个模型调用的是claude-sonnet-4-5-20250929，响应用的模型是一个没有见过的BBHH666，是配置...

- 创建时间：2025/11/12 18:46
- 优先级：P1
- 提交人：有赞
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

这个模型调用的是claude-sonnet-4-5-20250929，响应用的模型是一个没有见过的BBHH666，是配置了什么策略吗？

#### 问题排查

渠道反馈是因为用了aws兜底导致

#### 解决方式

无

### BUG-185：gemini-2.5-flash-image-preview 图片出现黑边

- 创建时间：2025/11/12 18:46
- 优先级：P1
- 提交人：Yanan
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

gemini-2.5-flash-image-preview 图片出现黑边

#### 问题排查

8503渠道问题

#### 解决方式

渠道已修复

### BUG-186：mj支持edit接口 quota not enough

- 创建时间：2025/11/12 18:46
- 优先级：P1
- 提交人：当贝
- 指派人：王鹤涵
- 状态：临时解决
- 修复版本：无
- 截图或视频：无
- 备注：调研下新的接口 https://github.com/trueai-org/midjourney-proxy

#### Bug 描述

mj支持edit接口
quota not enough

#### 问题排查

8497渠道报错

#### 解决方式

禁用8497

### BUG-187：gemini-2.5-pro-thinking-128 token限制不生效

- 创建时间：2025/11/12 18:40
- 优先级：P1
- 提交人：梦马
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

gemini-2.5-pro-thinking-128 token限制不生效

#### 问题排查

8573逆向渠道，不支持128参数

#### 解决方式

走的风雨渠道让风雨去支持了

### BUG-188：自建逆向sora不返回oss的地址

- 创建时间：2025/11/12 18:29
- 优先级：P1
- 提交人：微烽
- 指派人：王鹤涵
- 状态：已关闭
- 修复版本：无
- 截图或视频：image.png
- 备注：无

#### Bug 描述

自建逆向sora不返回oss的地址

#### 问题排查

tokens逆向平台没有上传到oss

#### 解决方式

tokens更新了，但是没有向前兼容，得手动改下配配置

---

文档签名：DevGuardAgent Imported Knowledge / apipro Bug 管理 CSV 转 Markdown / 生成时间 2026-05-15
