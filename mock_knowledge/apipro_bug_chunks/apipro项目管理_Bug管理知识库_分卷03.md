# apipro 项目管理 Bug 管理知识库 - 分卷 03/19

来源文件：apipro项目管理_Bug 管理.csv
本分卷记录范围：BUG-021 到 BUG-030
用途：用于 DevGuardAgent 知识库检索测试。

## Bug 记录

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

### BUG-022：LLM error: {"error":{"message":"Corrupted thought ...

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

---

文档签名：DevGuardAgent Imported Knowledge / apipro Bug 管理 CSV 分卷 / 生成时间 2026-05-15
