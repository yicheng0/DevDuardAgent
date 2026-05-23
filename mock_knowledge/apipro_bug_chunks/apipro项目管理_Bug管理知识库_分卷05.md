# apipro 项目管理 Bug 管理知识库 - 分卷 05/19

来源文件：apipro项目管理_Bug 管理.csv
本分卷记录范围：BUG-041 到 BUG-050
用途：用于 DevGuardAgent 知识库检索测试。

## Bug 记录

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

### BUG-043：{     "error": {         "type": "<nil>",         ...

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

### BUG-045：invalid value at 'contents[0].parts[1].inline_data...

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

### BUG-046：gemini模型不支持谷歌存储桶地址作为入参，报错"Request contains an inva...

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

### BUG-049：status_code=400, prompt is too long: 213004 tokens...

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

---

文档签名：DevGuardAgent Imported Knowledge / apipro Bug 管理 CSV 分卷 / 生成时间 2026-05-15
