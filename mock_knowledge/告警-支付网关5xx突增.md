# 支付网关 5xx 突增告警处理手册

## 告警名称

PAYMENT-GATEWAY-5XX-RATE-HIGH

## 适用范围

适用于支付网关、订单确认页、收银台回调接口在 5 分钟内 5xx 比例持续高于 3% 的场景。常见影响包括用户无法完成支付、订单状态长时间停留在待支付、第三方支付回调重复重试。

## 告警触发条件

- 指标：`http_server_requests_total{service="payment-gateway",status=~"5.."}`
- 触发：5 分钟错误率大于 3%，且请求量大于 500/min
- 严重级别：P1
- 业务影响：支付成功率下降，订单漏斗转化下降

## 首要确认

1. 查看错误是否集中在 `/api/payments/create`、`/api/payments/callback`、`/api/refunds/apply`。
2. 查看最近 30 分钟是否有发布、配置变更、网关证书更新。
3. 检查第三方支付渠道状态页和内部渠道探测任务。
4. 对比 `payment-gateway`、`order-service`、`risk-control` 三个服务的错误时间线。

## 排查命令

```bash
kubectl -n prod get pods -l app=payment-gateway -o wide
kubectl -n prod logs deploy/payment-gateway --since=20m | grep -E "panic|timeout|connection refused|signature"
kubectl -n prod describe deploy/payment-gateway
curl -s http://payment-gateway:8000/healthz
```

## 常见原因

- 第三方支付渠道超时，导致同步创建支付单失败。
- 数据库连接池耗尽，错误中常见 `too many connections`。
- 风控服务响应慢，支付创建链路被阻塞。
- 回调验签密钥配置错误，错误中常见 `invalid signature`。
- 新版本变更了金额单位，导致支付渠道拒绝请求。

## 处置步骤

1. 如果错误集中在某个第三方渠道，临时将该渠道权重调为 0，并保留至少两个可用渠道。
2. 如果数据库连接池耗尽，先扩容只读查询实例，随后下调支付网关连接池上限，避免压垮主库。
3. 如果是新版本发布导致，立即回滚 `payment-gateway` 到上一稳定镜像。
4. 如果回调验签失败，核对密钥版本，恢复上一版 `PAYMENT_CALLBACK_SECRET`。
5. 处置后观察支付成功率、订单取消率、回调重试队列长度至少 20 分钟。

## 恢复验证

- 5xx 错误率低于 0.5% 并持续 10 分钟。
- 支付成功率恢复到过去 7 天同时间段均值的 95% 以上。
- 回调重试队列长度连续下降。
- 客服工单新增量停止增长。

## 升级联系人

- 支付平台负责人：支付中台 Oncall
- 数据库负责人：DBA Oncall
- 业务负责人：交易域值班负责人

---

文档签名：DevGuardAgent Mock Knowledge / 仅用于告警任务测试 / 生成时间 2026-05-15
