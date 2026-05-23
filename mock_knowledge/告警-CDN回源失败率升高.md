# CDN 回源失败率升高告警处理手册

## 告警名称

CDN-ORIGIN-FAILURE-RATE-HIGH

## 适用范围

适用于静态资源、商品图片、活动页、前端入口文件回源失败率升高的场景。用户侧可能表现为页面白屏、图片加载失败、活动页打开慢。

## 告警触发条件

- 指标：`cdn_origin_5xx_rate`、`cdn_origin_timeout_rate`
- 触发：回源 5xx 或 timeout 比例大于 2%，持续 10 分钟
- 严重级别：P2；如果入口 HTML 受影响，升级 P1

## 首要确认

1. 确认失败是否集中在某个域名，例如 `static.example.com` 或 `campaign.example.com`。
2. 确认是否只影响某个地区或运营商。
3. 查看源站 Nginx、对象存储、负载均衡状态。
4. 判断 CDN 缓存命中率是否异常下降。

## 排查命令

```bash
curl -I https://static.example.com/index.html
curl -I --resolve static.example.com:443:ORIGIN_IP https://static.example.com/index.html
kubectl -n edge logs deploy/origin-nginx --since=20m | grep -E "upstream timed out|connect failed|no live upstreams"
```

## 常见原因

- 发布时错误清空缓存，导致大规模回源。
- 源站带宽或连接数不足。
- 对象存储权限策略变更，返回 403 或 404。
- CDN 配置错误，Host 头未透传。
- 源站证书过期或链路 TLS 握手失败。

## 处置步骤

1. 如果缓存命中率骤降，暂停全量刷新任务，优先预热入口 HTML、JS、CSS。
2. 如果源站负载过高，临时扩容 origin-nginx，并开启 CDN stale-if-error。
3. 如果对象存储权限错误，回滚 bucket policy。
4. 如果证书异常，恢复上一可用证书，并验证完整证书链。
5. 如果只有单地区异常，联系 CDN 厂商切换调度线路。

## 恢复验证

- CDN 回源失败率低于 0.5%。
- 首页 HTML、主 JS、主 CSS 连续 5 次访问均返回 200。
- CDN 缓存命中率恢复到 90% 以上。
- 用户白屏监控恢复到基线。

## 业务说明

CDN 回源故障通常不代表应用服务故障，但会直接影响用户访问入口。入口 HTML 失败时按 P1 处理。

---

文档签名：DevGuardAgent Mock Knowledge / 仅用于告警任务测试 / 生成时间 2026-05-15
