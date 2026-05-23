# apipro 项目管理 Bug 管理知识库 - 分卷 01/19

来源文件：apipro项目管理_Bug 管理.csv
本分卷记录范围：BUG-001 到 BUG-010
用途：用于 DevGuardAgent 知识库检索测试。

## Bug 记录

### BUG-001：时间范围：19:00~19:10 模型id：claude-4.6-opus 有比较多ttft超时30...

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

### BUG-006：codex里面使用azure的gpt-5.5会报错("code":424, "msg":"POST ...

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

---

文档签名：DevGuardAgent Imported Knowledge / apipro Bug 管理 CSV 分卷 / 生成时间 2026-05-15
