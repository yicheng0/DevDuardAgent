# apipro 项目管理 Bug 管理知识库 - 分卷 09/19

来源文件：apipro项目管理_Bug 管理.csv
本分卷记录范围：BUG-081 到 BUG-090
用途：用于 DevGuardAgent 知识库检索测试。

## Bug 记录

### BUG-081：gpt出现status_code=503,分组 default 下模型gpt-5.2无可用渠道(di...

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

### BUG-084：stream disconnected before completion: stream clos...

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

---

文档签名：DevGuardAgent Imported Knowledge / apipro Bug 管理 CSV 分卷 / 生成时间 2026-05-15
