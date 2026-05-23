# apipro 项目管理 Bug 管理知识库 - 分卷 16/19

来源文件：apipro项目管理_Bug 管理.csv
本分卷记录范围：BUG-151 到 BUG-160
用途：用于 DevGuardAgent 知识库检索测试。

## Bug 记录

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

### BUG-156：{"id":"chatcmpl-20251125130837563136397KBTEYbQy","...

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

---

文档签名：DevGuardAgent Imported Knowledge / apipro Bug 管理 CSV 分卷 / 生成时间 2026-05-15
