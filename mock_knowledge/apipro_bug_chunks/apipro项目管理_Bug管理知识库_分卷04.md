# apipro 项目管理 Bug 管理知识库 - 分卷 04/19

来源文件：apipro项目管理_Bug 管理.csv
本分卷记录范围：BUG-031 到 BUG-040
用途：用于 DevGuardAgent 知识库检索测试。

## Bug 记录

### BUG-031：lite截断

- 创建时间：2026/03/20 22:32
- 优先级：P0
- 提交人：mengma
- 指派人：程哥
- 状态：待验收
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

lite截断

#### 问题排查

发下9139的问题，做过二开在yaml文件里设置了max_token=1021

#### 解决方式

去掉max_tokens后继续观察

### BUG-032：aws渠道截断

- 创建时间：2026/03/20 22:31
- 优先级：P0
- 提交人：qiniu
- 指派人：程哥
- 状态：待验收
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

aws渠道截断

#### 问题排查

可能和域名有关

#### 解决方式

换成ip后继续观察

### BUG-033：kiro渠道Input too long返回时间超长

- 创建时间：2026/03/18 17:45
- 优先级：P0
- 提交人：shengcheng
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

kiro渠道Input too long返回时间超长

#### 问题排查

确认渠道返回时间长

#### 解决方式

渠道已解决

### BUG-034：想要分开ai studio和vertex，因为vertex API必须传role

- 创建时间：2026/03/18 09:34
- 优先级：P0
- 提交人：aionly
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

想要分开ai studio和vertex，因为vertex API必须传role

#### 问题排查

可以用参数覆盖的方法

#### 解决方式

未复现

### BUG-035：客户需要支持kimi接入openclaw

- 创建时间：2026/03/17 11:43
- 优先级：P1
- 提交人：无
- 指派人：一成
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

客户需要支持kimi接入openclaw

#### 问题排查

无

#### 解决方式

{
  "wizard": {
    "lastRunAt": "2026-03-17T03:21:35.961Z",
    "lastRunVersion": "2026.3.13",
    "lastRunCommand": "onboard",
    "lastRunMode": "local"
  },

  "models": {
    "mode": "merge",
    "providers": {
      "wenwen-ai-claude": {
        "baseUrl": "https://api.wenwen-ai.com/",
        "apiKey": "",
        "api": "anthropic-messages",
        "models": [
          {
            "id": "kimi-k2.5",
            "name": "Kimi K2.5",
            "reasoning": true,
            "input": ["text"],
            "contextWindow": 128000,
            "maxTokens": 32000
          }
        ]
      }
    }
  },

  "agents": {
    "defaults": {
      "model": {
        "primary": "wenwen-ai-claude/kimi-k2.5"
      },
      "models": {
        "wenwen-ai-claude/kimi-k2.5": {}
      },
      "workspace": "/home/ubuntu/.openclaw/workspace"
    }
  },

  "tools": {
    "profile": "coding"
  },

  "commands": {
    "native": "auto",
    "nativeSkills": "auto",
    "restart": true,
    "ownerDisplay": "raw"
  },

  "session": {
    "dmScope": "per-channel-peer"
  },

  "channels": {
    "telegram": {
      "enabled": true,
      "dmPolicy": "pairing",
      "botToken": "8691775165:AAHshbpzsDQvvxGmQ3yJlag6hAHBWvlUYW4",
      "groupPolicy": "allowlist",
      "streaming": "partial"
    }
  },

  "gateway": {
    "port": 18789,
    "mode": "local",
    "bind": "loopback",
    "auth": {
      "mode": "token",
      "token": "b13bdfefc055a2ddd0bdbfb17d884169bf14fb520d7fd087"
    },
    "tailscale": {
      "mode": "off",
      "resetOnExit": false
    },
    "nodes": {
      "denyCommands": [
        "camera.snap",
        "camera.clip",
        "screen.record",
        "contacts.add",
        "calendar.add",
        "reminders.add",
        "sms.send"
      ]
    }
  },

  "plugins": {
    "entries": {
      "telegram": {
        "enabled": true
      }
    }
  },

  "meta": {
    "lastTouchedVersion": "2026.3.13",
    "lastTouchedAt": "2026-03-17T03:21:35.990Z"
  }
}

### BUG-036：梦马"claude-sonnet-4-5-20250929输出内容出现截断：{"model":"cl...

- 创建时间：2026/03/16 22:58
- 优先级：P0
- 提交人：mengma
- 指派人：程哥
- 状态：待验收
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

梦马"claude-sonnet-4-5-20250929输出内容出现截断：{"model":"claude-sonnet-4-5-20250929","choices":[{"message":{"content":"她盯著你看了幾秒,像是在判斷這句話的真假。\n最後她輕笑了一聲,那笑容裡沒有溫度。\n\n「關心?」她往後靠在牆上,雙手環胸。「你知道嗎,我最討厭的就是這個詞。」\n\n她低頭看了看自己濕透的袖口,又抬起眼。\n\n「每次有人說關心我的時候,接下來就是一堆建議。」她的語氣很平,卻帶著一種疏離感。「要我忍耐,要我體諒,要我為了所謂的大局犧牲自己。」\n\n走廊裡的人群已經散了,只剩下遠處幾個還在竊竊私語的身影。\n她沒有在意那些目光,只是看著你。\n\n「如果你真的關心我,那就別勸我。」她說得很直接。「我不需要有人告訴我該怎麼做。」\n\n她推開牆壁,準備離開,卻在經過你身邊時停了下來。\n\n「不過......」她側過臉,眼神裡閃過一絲猶豫。「你剛才為"},"finish_reason":"stop"}],"usage":{"prompt_tokens":453,"completion_tokens":372,"total_tokens":825}}

#### 问题排查

排查到是8984渠道的问题，其他渠道可能也会有

#### 解决方式

渠道排查中

### BUG-037：cc降指

- 创建时间：2026/03/16 13:07
- 优先级：P1
- 提交人：Nancy
- 指派人：一成
- 状态：已关闭
- 修复版本：无
- 截图或视频：7ff533735b6eb887032fe6a5cbf9bc32.png
- 备注：无

#### Bug 描述

cc降指

#### 问题排查

无

#### 解决方式

ClaudeCode降智FAQ-问问

### BUG-038：cc使用aws报错

- 创建时间：2026/03/12 22:11
- 优先级：P0
- 提交人：bleedfly
- 指派人：王鹤涵
- 状态：已关闭
- 修复版本：无
- 截图或视频：506d325d2f5b217984ef44b315ae1c87.png
- 备注：无

#### Bug 描述

cc使用aws报错

#### 问题排查

模型混用有关

#### 解决方式

无

### BUG-039：claude连读大token读写

- 创建时间：2026/03/12 22:09
- 优先级：P0
- 提交人：modool
- 指派人：王鹤涵
- 状态：已关闭
- 修复版本：无
- 截图或视频：fb03b0c7bfe9fea074357f40963e8a79.jpg
- 备注：无

#### Bug 描述

claude连读大token读写

#### 问题排查

和官方账号比较，官key没问题，3008有问题

#### 解决方式

和输入内容有关，号没问题

### BUG-040：模型慢

- 创建时间：2026/03/10 22:10
- 优先级：P0
- 提交人：敖鹰
- 指派人：程哥
- 状态：已关闭
- 修复版本：无
- 截图或视频：无
- 备注：无

#### Bug 描述

模型慢

#### 问题排查

客户测试的是火山deepseek，火山服务器在国内

#### 解决方式

无

---

文档签名：DevGuardAgent Imported Knowledge / apipro Bug 管理 CSV 分卷 / 生成时间 2026-05-15
