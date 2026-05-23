# apipro 项目管理 Bug 管理知识库 - 分卷 19/19

来源文件：apipro项目管理_Bug 管理.csv
本分卷记录范围：BUG-181 到 BUG-188
用途：用于 DevGuardAgent 知识库检索测试。

## Bug 记录

### BUG-181：gemini-2.5-flash-image-preview 报错：I can't create m...

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

### BUG-184：这个模型调用的是claude-sonnet-4-5-20250929，响应用的模型是一个没有见过的B...

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

文档签名：DevGuardAgent Imported Knowledge / apipro Bug 管理 CSV 分卷 / 生成时间 2026-05-15
