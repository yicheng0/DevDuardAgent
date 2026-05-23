# apipro 项目管理 Bug 管理知识库 - 分卷 15/19

来源文件：apipro项目管理_Bug 管理.csv
本分卷记录范围：BUG-141 到 BUG-150
用途：用于 DevGuardAgent 知识库检索测试。

## Bug 记录

### BUG-141：8866,8887使用gemini-3-pro-image-preview会出现返回文字，不出图的情...

- 创建时间：2025/12/05 22:37
- 优先级：P1
- 提交人：无
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

8866,8887使用gemini-3-pro-image-preview会出现返回文字，不出图的情况

#### 问题排查

打印信息不全，已排除

#### 解决方式

无

### BUG-142：500 {"error":{"type":"bad response_status_code","m...

- 创建时间：2025/12/05 15:49
- 优先级：P1
- 提交人：泡泡玛特
- 指派人：一成
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

500 {"error":{"type":"bad response_status_code","message

#### 问题排查

某个账号周限流，请求正好命中限流账号，触发重试

#### 解决方式

告知客户重启cc终端

### BUG-143：breakout5.1不能访问

- 创建时间：2025/12/04 18:52
- 优先级：P1
- 提交人：code站用户
- 指派人：一成
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

breakout5.1不能访问

#### 问题排查

resopnse接口不适用于n8n的openai接口

#### 解决方式

已告知用户，更换请求方式

### BUG-144：gemini-3-pro-preview 408超时

- 创建时间：2025/12/03 12:02
- 优先级：P1
- 提交人：有赞
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

gemini-3-pro-preview 408超时

#### 问题排查

输出token超长65535，需要时间输出，

#### 解决方式

已告知客户

### BUG-145：whisper-1  不稳定报错

- 创建时间：2025/12/03 11:57
- 优先级：P1
- 提交人：科科
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

whisper-1  不稳定报错

#### 问题排查

8569渠道问题，时好时坏，multipart form error

#### 解决方式

寻找其他渠道替代,6353可用

### BUG-146：codex-mini不能响应

- 创建时间：2025/12/02 19:05
- 优先级：P1
- 提交人：code站用户
- 指派人：一成
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

codex-mini不能响应

#### 问题排查

更换其它模型测试正常，官方没有添加这个模型

#### 解决方式

模型市场加上这个mini模型

### BUG-147：claude-sonnet-4-5-20250929

- 创建时间：2025/12/02 19:04
- 优先级：P1
- 提交人：有赞&锦望
- 指派人：一成
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

claude-sonnet-4-5-20250929

#### 问题排查

tokens超过500w，推测是传入异常巨大的文件

#### 解决方式

无

### BUG-148：控制台报表报错 错误：sql: Scan error on column index 3, name...

- 创建时间：2025/12/01 21:41
- 优先级：P1
- 提交人：鹤涵
- 指派人：王鹤涵
- 状态：已关闭
- 修复版本：无
- 截图或视频：bea6c1abcd519b5e8f9a7d8f848f2528.png
- 备注：无

#### Bug 描述

控制台报表报错 错误：sql: Scan error on column index 3, name "token_used": converting driver.Value type []uint8 ("-27670116110564325757") to a int: value out of range

#### 问题排查

通过sql查询，看是whisper-1影响的
  SELECT model_name,
         sum(count) as count,
         sum(quota) as quota,
         sum(token_used) as token_used,
         created_at
  FROM quota_data
  WHERE created_at >= 1764507069
    AND created_at <= 1764597069
  GROUP BY model_name, created_at;

#### 解决方式

用sql删掉报表和log的脏数据

### BUG-149："{"error":{"message":"error parsing multipart form...

- 创建时间：2025/12/01 18:17
- 优先级：P1
- 提交人：larkagent
- 指派人：程哥
- 状态：临时解决
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

"{"error":{"message":"error parsing multipart form: multipart: NextPart: EOF (request id: 20251201180128485346156zNQhxXXI)","type":"new_api_error","param":"","code":"convert_request_failed"}}"

#### 问题排查

8552渠道的问题，8502，8837有同样的问题。另外8514,8524都不可用。gpt-4o-transcribe和gpt-4o-mini-transcribe只有8502有，但是也会报这个错。

#### 解决方式

将这些渠道的模型暂时下架,不让客户跑mp4，数据修复下

### BUG-150：whisper计费规则：

- 创建时间：2025/12/01 17:47
- 优先级：P0
- 提交人：科科
- 指派人：程哥
- 状态：临时解决
- 修复版本：无
- 截图或视频：7854caacc44de7c97fc4a493aff6e73b.png,7b41710f-997f-4bb9-991c-e907ae47170d.png
- 备注：无

#### Bug 描述

whisper计费规则：

#### 问题排查

按音频时长来算的token，1s=16.66 token

#### 解决方式

无

---

文档签名：DevGuardAgent Imported Knowledge / apipro Bug 管理 CSV 分卷 / 生成时间 2026-05-15
