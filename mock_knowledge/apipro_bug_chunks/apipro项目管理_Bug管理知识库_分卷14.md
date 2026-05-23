# apipro 项目管理 Bug 管理知识库 - 分卷 14/19

来源文件：apipro项目管理_Bug 管理.csv
本分卷记录范围：BUG-131 到 BUG-140
用途：用于 DevGuardAgent 知识库检索测试。

## Bug 记录

### BUG-131：vscode里使用cc，总是出现请稍等，无法真正完成任务

- 创建时间：2025/12/15 11:37
- 优先级：P1
- 提交人：国金汇德
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

vscode里使用cc，总是出现请稍等，无法真正完成任务

#### 问题排查

令牌问题，没有使用claude-code分组

#### 解决方式

换成claude-code分组后解决

### BUG-132：cc命令长时间不返回

- 创建时间：2025/12/15 11:02
- 优先级：P1
- 提交人：期智
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

cc命令长时间不返回

#### 问题排查

没有报错，可能和输入长度以及任务复杂度有关

#### 解决方式

无

### BUG-133：gemini-2.5-flash-lite

- 创建时间：2025/12/14 14:58
- 优先级：P1
- 提交人：mengma
- 指派人：一成
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：第一时间反馈渠道

#### Bug 描述

gemini-2.5-flash-lite

#### 问题排查

lite里面出现reason token，通过报错日志，溯源渠道

#### 解决方式

临时切换渠道

### BUG-134：新版本cc，容易出现API Error: 400 {"error": {"type":"<nil>"...

- 创建时间：2025/12/14 14:57
- 优先级：P1
- 提交人：泡泡玛特
- 指派人：程哥,一成
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：等new-api更新

#### Bug 描述

新版本cc，容易出现API Error: 400 {"error": {"type":"<nil>","message":"***,***.custom.input_examples: Extra inputs are not permitted"}}

#### 问题排查

API Error: 400 {"error": {"type":"<nil>","message":"***,***.custom.input_examples: Extra inputs are not permitted"}}
这是Claude新版本引入的一个实验性功能冲突。从搜索结果看，这个问题非常普遍：
根本原因
Claude Code 2.0.42+ 版本在新的工具定义中添加了 input_examples 字段
这个字段是实验性的beta功能，需要特定的API版本支持
但当前Anthropic API还不接受这个字段，导致"Extra inputs are not permitted"错误
触发条件
主要影响无头模式 (claude -p)
工具索引3（Grep工具）是第一个包含input_examples的工具
与是否使用第三方网关无关，是Claude Code自身的问题
解决方案
✅ 推荐方案：禁用实验性功能
设置环境变量：
bash
复制
export CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS=1
不同系统的设置方法：
macOS/Linux:
bash
复制
echo 'export CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS="1"' >> ~/.zshrc
source ~/.zshrc
Windows:
在系统环境变量中添加：
变量名：CLAUDE_CODE_DISABLE_EXPERIMENTAL_BETAS
变量值：1
重要：设置后需要关闭所有终端窗口重新打开才能生效！
🔄 临时绕过方案
如果上述方法无效，可以尝试：
使用交互模式 - 这个问题主要影响无头模式
降级Claude Code版本 - 回退到2.0.41或更早版本
通过settings.json配置 - 但注意环境变量设置可能不生效
⚠️ 注意事项
这个环境变量必须在系统层面设置，在settings.json中设置可能无效
设置后需要完全重启终端
如果问题持续，可能需要等待Claude Code的新版本修复

#### 解决方式

① 删除已有 AB Test 状态文件
rm -f statsig.session_id* \
      statsig.cached.evaluations* \
      statsig.last_modified_time.evaluations*

② 创建“只读占位文件”
touch statsig.session_id \
      statsig.cached.evaluations \
      statsig.last_modified_time.evaluations

③ 设置为只读（禁止 SDK 再写入）
chmod 444 statsig.session_id \
          statsig.cached.evaluations \
          statsig.last_modified_time.evaluations


执行完这三步后：AB Test 永久失效

④ 验证
ls -l statsig.*


看到类似下面即成功：

-r--r--r--  statsig.session_id
-r--r--r--  statsig.cached.evaluations
-r--r--r--  statsig.last_modified_time.evaluations

### BUG-135：claude-4.5 sonnet和haiku使用api会出现提交请求后等到数分钟无响应的问题

- 创建时间：2025/12/12 20:03
- 优先级：P1
- 提交人：易感智能
- 指派人：一成
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

claude-4.5 sonnet和haiku使用api会出现提交请求后等到数分钟无响应的问题

#### 问题排查

后台日志发现大量截断，输出异常的情况，鬼手渠道问题。

#### 解决方式

溯源腾讯云后台日志，联系渠道修复，他无法修复，禁用该渠道。测试并启用其他渠道

### BUG-136：claude-4.5 sonnet和haiku

- 创建时间：2025/12/12 20:02
- 优先级：P1
- 提交人：问问code
- 指派人：一成
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

claude-4.5 sonnet和haiku

#### 问题排查

先自测无误，再检查客户的url和参数

#### 解决方式

修改url,删除/

### BUG-137：客户需要单独查询每个key的用量情况

- 创建时间：2025/12/11 11:14
- 优先级：P1
- 提交人：wenwen支持
- 指派人：一成
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

客户需要单独查询每个key的用量情况

#### 问题排查

无

#### 解决方式

提供key的查询插件https://usage.wenwen-ai.com/

### BUG-138：gemini-2.5-pro出现频繁截断现象

- 创建时间：2025/12/11 11:04
- 优先级：P1
- 提交人：mengma
- 指派人：一成
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

gemini-2.5-pro出现频繁截断现象

#### 问题排查

先观察腾讯云仪表盘是否存在异常情况，根据报错日志时间锁定具体的渠道

#### 解决方式

联系渠道，关闭Gemini思考后缀适配

### BUG-139：decode base64 image data failed: fail to decode im...

- 创建时间：2025/12/11 08:48
- 优先级：P1
- 提交人：aionly
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

decode base64 image data failed: fail to decode image config(we
bp): riff: missing RIFF chunk header

#### 问题排查

openai渠道类型无法支持谷歌存储桶地址：gs://cloud-samples-data/generative-ai/image/scones.jpg

#### 解决方式

给gemini渠道类型新建vertx分组，8866,8887

### BUG-140：上传失败:Request failed with status code 404

- 创建时间：2025/12/07 19:29
- 优先级：P1
- 提交人：问问code
- 指派人：一成
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

上传失败:Request failed with status code 404

#### 问题排查

问问平台不支持某些功能

#### 解决方式

告知客户使用CherryStudio.并帮助客户配置api

---

文档签名：DevGuardAgent Imported Knowledge / apipro Bug 管理 CSV 分卷 / 生成时间 2026-05-15
