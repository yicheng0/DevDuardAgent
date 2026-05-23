# apipro 项目管理 Bug 管理知识库 - 分卷 07/19

来源文件：apipro项目管理_Bug 管理.csv
本分卷记录范围：BUG-061 到 BUG-070
用途：用于 DevGuardAgent 知识库检索测试。

## Bug 记录

### BUG-061：网站所有模型都返回慢

- 创建时间：2026/02/07 17:21
- 优先级：P0
- 提交人：mengma
- 指派人：王鹤涵
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

网站所有模型都返回慢

#### 问题排查

怀疑是带宽问题

#### 解决方式

扩机器

### BUG-062：陈煜kimi k2.5 function call有问题

- 创建时间：2026/02/06 20:17
- 优先级：P0
- 提交人：百炼钉钉
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

陈煜kimi k2.5 function call有问题

#### 问题排查

百炼订单渠道问题

#### 解决方式

已修复

### BUG-063：deepseek-v3-2-251201 auto分组无法调用

- 创建时间：2026/02/06 15:49
- 优先级：P0
- 提交人：翱殷
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

deepseek-v3-2-251201 auto分组无法调用

#### 问题排查

deepseek-v3-2-251201属于deepseek-volc分组，该分组没有在auto链路中

#### 解决方式

在auto中加入deepseek-volc分组

### BUG-064：claude: status_code=504, bad response status code ...

- 创建时间：2026/02/06 15:18
- 优先级：P0
- 提交人：scott
- 指派人：程哥
- 状态：临时解决
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

claude: status_code=504, bad response status code 504

#### 问题排查

gac 所有超过60s的响应都返回504

#### 解决方式

无

### BUG-065：claude-3-7-sonnet-20250219凌晨延迟超过100s

- 创建时间：2026/02/04 11:23
- 优先级：P0
- 提交人：成都用一
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

claude-3-7-sonnet-20250219凌晨延迟超过100s

#### 问题排查

初步判定是官方延迟，这个模型马上就要停用了，官方维护也没那么稳了，建议你们还是尽快切换到新模型吧

#### 解决方式

无

### BUG-066：deepseek-v3连接超时

- 创建时间：2026/02/04 11:22
- 优先级：P0
- 提交人：成都用一
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

deepseek-v3连接超时

#### 问题排查

url拼接错误

#### 解决方式

无

### BUG-067：qiniu claude分组首字时间很长

- 创建时间：2026/02/03 15:05
- 优先级：P0
- 提交人：qiniu
- 指派人：王鹤涵
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

qiniu claude分组首字时间很长

#### 问题排查

无

#### 解决方式

用cc兜底

### BUG-068：API Error: 400 {"error":{"type":"<nil>","message":...

- 创建时间：2026/02/03 10:37
- 优先级：P0
- 提交人：米璐老师
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

API Error: 400 {"error":{"type":"<nil>","message":"{\"type\":\"error\",\"error\":{
    \"type\":\"invalid_request_error\",\"message\":\"***.***.content.0: Invalid       
    `signature` in `thinking`                                                         
    block\"},

#### 问题排查

api站 8964，opus4.5模型报错

#### 解决方式

这个是思考链签名有问题，要重新开一个对话就可以了。也可以禁用cc的扩展思考模式：在claude code中按 ALT+T，选择 Disabled ✔  Claude will respond without extended thinking 可以禁止输出思考扩展，这不会影响模型的思考能力，只是输出的时候不带思考内容。

### BUG-069：gemini上传文件失败：video file = client.files.upload(path...

- 创建时间：2026/02/03 10:06
- 优先级：P0
- 提交人：智绘未来
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

gemini上传文件失败：video file = client.files.upload(path='path/to/video.mp4')：'Failed to create file. Upload URL did not returned from the create file request.'

#### 问题排查

确实会失败，不确定是否因为中转api没有权限

#### 解决方式

可以使用url方式上传文件：response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=[
            Part.from_uri(
                file_uri="https://aric.oss-cn-beijing.aliyuncs.com/woman_image.png",
                mime_type="image/png",
            ),
            prompt
        ],
    )

### BUG-070：ds出现雪崩

- 创建时间：2026/02/02 12:39
- 优先级：P0
- 提交人：一成
- 指派人：一成
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

ds出现雪崩

#### 问题排查

某个时间点流量暴涨，延迟大

#### 解决方式

无

---

文档签名：DevGuardAgent Imported Knowledge / apipro Bug 管理 CSV 分卷 / 生成时间 2026-05-15
