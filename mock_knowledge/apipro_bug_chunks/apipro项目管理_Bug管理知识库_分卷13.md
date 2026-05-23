# apipro 项目管理 Bug 管理知识库 - 分卷 13/19

来源文件：apipro项目管理_Bug 管理.csv
本分卷记录范围：BUG-121 到 BUG-130
用途：用于 DevGuardAgent 知识库检索测试。

## Bug 记录

### BUG-121：逆向sora，❌ 400 📦 {"error":{"code":"heavy_load","mess...

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

### BUG-123：API Error: 400 {error":t"type":"<nil>","message"."...

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

### BUG-124：账号有余额，但是报错这个API Error: 403 {"error":{"type":"new_a...

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

### BUG-125：The response was filtered due to the prompt trigge...

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

---

文档签名：DevGuardAgent Imported Knowledge / apipro Bug 管理 CSV 分卷 / 生成时间 2026-05-15
