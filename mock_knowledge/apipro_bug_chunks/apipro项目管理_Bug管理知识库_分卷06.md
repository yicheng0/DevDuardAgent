# apipro 项目管理 Bug 管理知识库 - 分卷 06/19

来源文件：apipro项目管理_Bug 管理.csv
本分卷记录范围：BUG-051 到 BUG-060
用途：用于 DevGuardAgent 知识库检索测试。

## Bug 记录

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

### BUG-056：status_code=500, 分组 aws-vip 下模型 claude-haiku-4-5-2...

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

### BUG-058：The 'gpt-5.3-codex' model is not supported when us...

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

### BUG-059：You exceededyour current quota, please checkyour p...

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

---

文档签名：DevGuardAgent Imported Knowledge / apipro Bug 管理 CSV 分卷 / 生成时间 2026-05-15
