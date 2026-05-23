# apipro 项目管理 Bug 管理知识库 - 分卷 08/19

来源文件：apipro项目管理_Bug 管理.csv
本分卷记录范围：BUG-071 到 BUG-080
用途：用于 DevGuardAgent 知识库检索测试。

## Bug 记录

### BUG-071：`max_tokens` must be greater than `thinking.budget...

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

### BUG-072："invalid_request_error", "message" : "This credent...

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

### BUG-073：Mismatched content block type content_block_delta ...

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

### BUG-079：API Error:403{"error":{"type":"<nil>"，"message":"预...

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

---

文档签名：DevGuardAgent Imported Knowledge / apipro Bug 管理 CSV 分卷 / 生成时间 2026-05-15
