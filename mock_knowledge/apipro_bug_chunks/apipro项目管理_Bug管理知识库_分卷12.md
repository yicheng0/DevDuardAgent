# apipro 项目管理 Bug 管理知识库 - 分卷 12/19

来源文件：apipro项目管理_Bug 管理.csv
本分卷记录范围：BUG-111 到 BUG-120
用途：用于 DevGuardAgent 知识库检索测试。

## Bug 记录

### BUG-111：gemini-3-pro-image-preview 1K-2K和4K价格设置

- 创建时间：2025/12/24 19:34
- 优先级：P1
- 提交人：鹤涵
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

gemini-3-pro-image-preview 1K-2K和4K价格设置

#### 问题排查

1K2K：0.12  4K: 0.241

#### 解决方式

4K单独渠道，通过参数覆盖

### BUG-112：gemini 缓存模式

- 创建时间：2025/12/24 17:47
- 优先级：P1
- 提交人：肯斯爪特
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

gemini 缓存模式

#### 问题排查

目前账号池不支持，需要开大账号

#### 解决方式

无

### BUG-113：gemini思考深度测试

- 创建时间：2025/12/24 16:58
- 优先级：P1
- 提交人：鹤涵
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

gemini思考深度测试

#### 问题排查

gemini思考深度测试

#### 解决方式

gemini-3-flash-preview 这个模型要想没有reasoning token只能用minimal模式，其他low,medium,high都差不多。但是现在chat接口new api还没有支持参数-minimal

### BUG-114：问问智能体平台速度慢

- 创建时间：2025/12/24 15:17
- 优先级：P1
- 提交人：湃青年
- 指派人：程哥,一成
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

问问智能体平台速度慢

#### 问题排查

知识库检索速度慢，AI回复也慢

#### 解决方式

1. embedding模型应该是主因，建议选用Embedding-3-Small这个模型，这个模型比较快  
2. 知识库搜索的问题优化会占用一些时间，可以考虑关掉 
3. 问答大模型, gemini-3-pro思考时间偏长，可以综合效果尝试使用genimi-3-flash-preview

### BUG-115：gemini-2.5-flash-nothinking 出现thinking

- 创建时间：2025/12/24 12:50
- 优先级：P1
- 提交人：mengma
- 指派人：程哥,一成
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

gemini-2.5-flash-nothinking 出现thinking

#### 问题排查

8919渠道问题

#### 解决方式

渠道已解决

### BUG-116：sora-2 模型计费问题

- 创建时间：2025/12/23 21:05
- 优先级：P1
- 提交人：光魔
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

sora-2 模型计费问题

#### 问题排查

/videos接口new-api会基于视频时长计费

#### 解决方式

使用环境变量TASK_PRICE_PATCH=sora-2,sora_video2

### BUG-117：'message': 'newAPIError: unmarshal response to err...

- 创建时间：2025/12/23 18:24
- 优先级：P1
- 提交人：肯斯爪特
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

'message': 'newAPIError: unmarshal response to error failed: json: cannot unmarshal string into Go struct field apiError.error.code of type int. Response: {"error":{"code":"model_not_found","message":"分组 default 下模型 gemini-2.0-flash-001 无可用渠道（distributor） (request id: 202512231800297279799417EsKh3hS)","type":"new_api_error"}}',
2）换了个模型，可以跑通，但是50%概率会出现无法识别图片的问题： [{'content': {'parts': [{'text': '好的，请提供您需要审核的图片和文本内容。我将根据您提供的标准进行判断和打分。'}],

#### 问题排查

模型选择错误，接口调用错误

#### 解决方式

无

### BUG-118：sora-2 模型使用

- 创建时间：2025/12/23 17:55
- 优先级：P1
- 提交人：光魔
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

sora-2 模型使用

#### 问题排查

为了兼容ZeakAi渠道的模型名字，在tokens后台加了sora-2 到 sora_video2的重定向，这样光魔那边还是可以继续使用sora-2，之前使用sora_video2的也不受影响

#### 解决方式

为了兼容ZeakAi渠道的模型名字，在tokens后台加了sora-2 到 sora_video2的重定向，这样光魔那边还是可以继续使用sora-2，之前使用sora_video2的也不受影响

### BUG-119：gemini-3-pro-image-preview 不可用

- 创建时间：2025/12/23 14:40
- 优先级：P1
- 提交人：峰兄
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

gemini-3-pro-image-preview 不可用

#### 问题排查

8887不可用但是优先级太高（涨价到8毛一刀）

#### 解决方式

暂时去掉该模型

### BUG-120：ZeakAi sora接入

- 创建时间：2025/12/23 13:49
- 优先级：P1
- 提交人：程哥
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：和chat接口无法兼容

#### Bug 描述

ZeakAi sora接入

#### 问题排查

渠道设置不对

#### 解决方式

videos接口需要使用https://zeakai.api4midjourney.com/api/sora 地址，调用格式需要是multi/form-data

---

文档签名：DevGuardAgent Imported Knowledge / apipro Bug 管理 CSV 分卷 / 生成时间 2026-05-15
