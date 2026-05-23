# apipro 项目管理 Bug 管理知识库 - 分卷 02/19

来源文件：apipro项目管理_Bug 管理.csv
本分卷记录范围：BUG-011 到 BUG-020
用途：用于 DevGuardAgent 知识库检索测试。

## Bug 记录

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

### BUG-017：aws和cc兼容性问题，参数组合报错： 1. {     "model": "claude-opus...

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

### BUG-019：aws和cc兼容性问题：API Error: 400 {"error":{"type":"<nil>...

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

---

文档签名：DevGuardAgent Imported Knowledge / apipro Bug 管理 CSV 分卷 / 生成时间 2026-05-15
