import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock3,
  Gauge,
  RefreshCcw,
  Server,
  ShieldCheck,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { MetricHealthStatus, MetricServiceHealth, MetricTrendPoint } from '@/types';

type TimeRange = '15m' | '1h' | '6h' | '24h';

const baseServices: MetricServiceHealth[] = [
  {
    id: 'checkout-api',
    name: 'checkout-api',
    environment: 'prod',
    owner: 'Payments',
    status: 'critical',
    slo: 98.92,
    sloTarget: 99.9,
    errorBudgetRemaining: 18,
    burnRate: 8.4,
    rps: 1840,
    errorRate: 4.8,
    p95LatencyMs: 1240,
    cpu: 82,
    memory: 76,
    activeAlerts: 3,
    updatedAt: '2 分钟前',
    trend: [
      { label: '14:00', requests: 1180, errorRate: 0.7, latencyMs: 420, resource: 52 },
      { label: '14:10', requests: 1320, errorRate: 1.1, latencyMs: 510, resource: 58 },
      { label: '14:20', requests: 1510, errorRate: 2.8, latencyMs: 760, resource: 67 },
      { label: '14:30', requests: 1840, errorRate: 4.8, latencyMs: 1240, resource: 82 },
    ],
  },
  {
    id: 'order-worker',
    name: 'order-worker',
    environment: 'prod',
    owner: 'Platform Ops',
    status: 'warning',
    slo: 99.62,
    sloTarget: 99.8,
    errorBudgetRemaining: 42,
    burnRate: 2.1,
    rps: 620,
    errorRate: 1.3,
    p95LatencyMs: 880,
    cpu: 68,
    memory: 71,
    activeAlerts: 1,
    updatedAt: '4 分钟前',
    trend: [
      { label: '14:00', requests: 510, errorRate: 0.8, latencyMs: 620, resource: 58 },
      { label: '14:10', requests: 560, errorRate: 1.0, latencyMs: 710, resource: 62 },
      { label: '14:20', requests: 590, errorRate: 1.2, latencyMs: 820, resource: 66 },
      { label: '14:30', requests: 620, errorRate: 1.3, latencyMs: 880, resource: 71 },
    ],
  },
  {
    id: 'auth-gateway',
    name: 'auth-gateway',
    environment: 'prod',
    owner: 'Security Ops',
    status: 'warning',
    slo: 99.74,
    sloTarget: 99.9,
    errorBudgetRemaining: 55,
    burnRate: 1.8,
    rps: 2460,
    errorRate: 0.9,
    p95LatencyMs: 360,
    cpu: 61,
    memory: 64,
    activeAlerts: 1,
    updatedAt: '6 分钟前',
    trend: [
      { label: '14:00', requests: 2210, errorRate: 0.4, latencyMs: 310, resource: 48 },
      { label: '14:10', requests: 2360, errorRate: 0.6, latencyMs: 330, resource: 54 },
      { label: '14:20', requests: 2490, errorRate: 0.8, latencyMs: 350, resource: 59 },
      { label: '14:30', requests: 2460, errorRate: 0.9, latencyMs: 360, resource: 64 },
    ],
  },
  {
    id: 'inventory-api',
    name: 'inventory-api',
    environment: 'prod',
    owner: 'Core Biz',
    status: 'healthy',
    slo: 99.96,
    sloTarget: 99.9,
    errorBudgetRemaining: 86,
    burnRate: 0.4,
    rps: 920,
    errorRate: 0.08,
    p95LatencyMs: 220,
    cpu: 42,
    memory: 51,
    activeAlerts: 0,
    updatedAt: '1 分钟前',
    trend: [
      { label: '14:00', requests: 860, errorRate: 0.06, latencyMs: 210, resource: 39 },
      { label: '14:10', requests: 880, errorRate: 0.07, latencyMs: 215, resource: 41 },
      { label: '14:20', requests: 910, errorRate: 0.08, latencyMs: 218, resource: 43 },
      { label: '14:30', requests: 920, errorRate: 0.08, latencyMs: 220, resource: 42 },
    ],
  },
  {
    id: 'notification',
    name: 'notification',
    environment: 'prod',
    owner: 'Growth',
    status: 'healthy',
    slo: 99.91,
    sloTarget: 99.5,
    errorBudgetRemaining: 78,
    burnRate: 0.7,
    rps: 340,
    errorRate: 0.18,
    p95LatencyMs: 410,
    cpu: 47,
    memory: 58,
    activeAlerts: 0,
    updatedAt: '3 分钟前',
    trend: [
      { label: '14:00', requests: 300, errorRate: 0.16, latencyMs: 390, resource: 44 },
      { label: '14:10', requests: 320, errorRate: 0.17, latencyMs: 398, resource: 48 },
      { label: '14:20', requests: 330, errorRate: 0.18, latencyMs: 405, resource: 52 },
      { label: '14:30', requests: 340, errorRate: 0.18, latencyMs: 410, resource: 58 },
    ],
  },
];

const statusLabel: Record<MetricHealthStatus, string> = {
  healthy: '健康',
  warning: '关注',
  critical: '异常',
};

const statusStyle: Record<MetricHealthStatus, string> = {
  healthy: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-700',
  critical: 'border-red-200 bg-red-50 text-red-700',
};

const statusIcon = {
  healthy: CheckCircle2,
  warning: AlertTriangle,
  critical: Zap,
};

const timeRangeLabel: Record<TimeRange, string> = {
  '15m': '最近 15 分钟',
  '1h': '最近 1 小时',
  '6h': '最近 6 小时',
  '24h': '最近 24 小时',
};

const numberFormat = new Intl.NumberFormat('en-US');

const formatPercent = (value: number, digits = 2) => `${value.toFixed(digits)}%`;

const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, value));

const Sparkline = ({ points, metric }: { points: MetricTrendPoint[]; metric: keyof MetricTrendPoint }) => {
  const values = points.map((point) => Number(point[metric]));
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const coords = values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * 100;
      const y = 32 - ((value - min) / range) * 28;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg viewBox="0 0 100 36" className="h-10 w-full" role="img" aria-label="趋势图">
      <polyline points={coords} fill="none" stroke="#9a563f" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="0" y1="34" x2="100" y2="34" stroke="#e2e8f0" strokeWidth="1" />
    </svg>
  );
};

const HealthBar = ({ value, tone = 'emerald' }: { value: number; tone?: 'emerald' | 'amber' | 'red' | 'slate' }) => {
  const fill =
    tone === 'red'
      ? 'bg-red-500'
      : tone === 'amber'
        ? 'bg-amber-500'
        : tone === 'slate'
          ? 'bg-[#9a7a62]'
          : 'bg-emerald-500';
  return (
    <div className="h-2 overflow-hidden rounded-full bg-[#f4e3ca]">
      <div className={`h-full rounded-full ${fill}`} style={{ width: `${clamp(value)}%` }} />
    </div>
  );
};

const MetricsHealthPage = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('1h');
  const [serviceId, setServiceId] = useState('all');
  const [refreshTick, setRefreshTick] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(() => new Date());

  const services = useMemo(() => {
    const modifier = refreshTick % 3;
    return baseServices.map((service, index) => ({
      ...service,
      rps: service.rps + modifier * (index + 1) * 8,
      cpu: clamp(service.cpu + modifier * 1.5),
      memory: clamp(service.memory + modifier),
      updatedAt: refreshTick ? '刚刚' : service.updatedAt,
    }));
  }, [refreshTick]);

  const visibleServices = serviceId === 'all' ? services : services.filter((service) => service.id === serviceId);

  const summary = useMemo(() => {
    const total = visibleServices.length || 1;
    const activeAlerts = visibleServices.reduce((sum, service) => sum + service.activeAlerts, 0);
    return {
      totalServices: visibleServices.length,
      healthyServices: visibleServices.filter((service) => service.status === 'healthy').length,
      warningServices: visibleServices.filter((service) => service.status === 'warning').length,
      criticalServices: visibleServices.filter((service) => service.status === 'critical').length,
      averageSlo: visibleServices.reduce((sum, service) => sum + service.slo, 0) / total,
      averageErrorBudgetRemaining:
        visibleServices.reduce((sum, service) => sum + service.errorBudgetRemaining, 0) / total,
      activeAlerts,
      worstBurnRate: Math.max(...visibleServices.map((service) => service.burnRate), 0),
    };
  }, [visibleServices]);

  const aggregateTrend = useMemo(() => {
    const length = visibleServices[0]?.trend.length || 0;
    return Array.from({ length }, (_, index) => {
      const slice = visibleServices.map((service) => service.trend[index]).filter(Boolean);
      const divisor = slice.length || 1;
      return {
        label: slice[0]?.label || '',
        requests: slice.reduce((sum, point) => sum + point.requests, 0),
        errorRate: slice.reduce((sum, point) => sum + point.errorRate, 0) / divisor,
        latencyMs: slice.reduce((sum, point) => sum + point.latencyMs, 0) / divisor,
        resource: slice.reduce((sum, point) => sum + point.resource, 0) / divisor,
      };
    });
  }, [visibleServices]);

  const riskyServices = [...visibleServices].sort((a, b) => {
    if (a.status !== b.status) {
      const weight = { critical: 3, warning: 2, healthy: 1 };
      return weight[b.status] - weight[a.status];
    }
    return b.burnRate - a.burnRate;
  });

  const handleRefresh = () => {
    setIsRefreshing(true);
    window.setTimeout(() => {
      setRefreshTick((current) => current + 1);
      setLastRefresh(new Date());
      setIsRefreshing(false);
    }, 520);
  };

  const latestTrend = aggregateTrend[aggregateTrend.length - 1];

  return (
    <div className="app-bg h-full min-h-0 overflow-y-auto p-3 xl:grid xl:grid-cols-[minmax(680px,1fr)_340px] xl:gap-3 xl:overflow-hidden">
      <main className="app-surface mb-3 flex min-h-[760px] flex-col overflow-hidden rounded-lg border shadow-sm xl:mb-0 xl:min-h-0">
        <div className="border-b border-[#ead7b7] bg-[#fffdf8] p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <h1 className="flex items-center gap-2 text-base font-semibold text-slate-950">
                <Gauge className="h-5 w-5 text-[#9a563f]" />
                指标健康总览
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {timeRangeLabel[timeRange]}服务健康、SLO、资源压力和活跃告警。
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <select
                value={serviceId}
                onChange={(event) => setServiceId(event.target.value)}
                className="brand-input h-10 rounded-md border px-3 text-sm text-slate-800"
                aria-label="服务筛选"
              >
                <option value="all">全部服务</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
              <div className="grid grid-cols-4 overflow-hidden rounded-md border border-[#ead7b7] bg-[#fff6e8]">
                {(['15m', '1h', '6h', '24h'] as TimeRange[]).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setTimeRange(item)}
                    className={`h-10 px-3 text-xs font-semibold transition-colors ${
                      timeRange === item ? 'bg-[#f7ebe5] text-[#7f432f]' : 'text-slate-500 hover:bg-[#fffdf8]'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="brand-button h-10 px-4 text-sm disabled:cursor-not-allowed"
              >
                <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                刷新
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-3 border-b border-[#ead7b7] bg-[#fff6e8] p-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="app-surface rounded-lg border p-3">
            <p className="text-xs font-semibold text-slate-500">健康服务</p>
            <p className="mt-1 text-2xl font-semibold text-slate-950">{summary.healthyServices}/{summary.totalServices}</p>
            <HealthBar value={(summary.healthyServices / Math.max(summary.totalServices, 1)) * 100} />
          </div>
          <div className="app-surface rounded-lg border p-3">
            <p className="text-xs font-semibold text-slate-500">异常服务</p>
            <p className="mt-1 text-2xl font-semibold text-red-700">{summary.criticalServices}</p>
            <HealthBar value={(summary.criticalServices / Math.max(summary.totalServices, 1)) * 100} tone="red" />
          </div>
          <div className="app-surface rounded-lg border p-3">
            <p className="text-xs font-semibold text-slate-500">平均 SLO</p>
            <p className="mt-1 text-2xl font-semibold text-slate-950">{formatPercent(summary.averageSlo)}</p>
            <HealthBar value={summary.averageSlo} />
          </div>
          <div className="app-surface rounded-lg border p-3">
            <p className="text-xs font-semibold text-slate-500">错误预算剩余</p>
            <p className="mt-1 text-2xl font-semibold text-slate-950">{formatPercent(summary.averageErrorBudgetRemaining, 0)}</p>
            <HealthBar value={summary.averageErrorBudgetRemaining} tone={summary.averageErrorBudgetRemaining < 30 ? 'red' : 'amber'} />
          </div>
          <div className="app-surface rounded-lg border p-3">
            <p className="text-xs font-semibold text-slate-500">活跃告警</p>
            <p className="mt-1 text-2xl font-semibold text-slate-950">{summary.activeAlerts}</p>
            <HealthBar value={summary.activeAlerts * 18} tone={summary.activeAlerts ? 'amber' : 'emerald'} />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <section className="grid gap-4 xl:grid-cols-[minmax(420px,1fr)_320px]">
            <div className="app-surface rounded-lg border p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                  <BarChart3 className="h-4 w-4 text-[#9a563f]" />
                  聚合趋势
                </h2>
                <span className="text-xs text-slate-500">{timeRangeLabel[timeRange]}</span>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="mb-2 text-xs font-semibold text-slate-500">请求量</p>
                  <Sparkline points={aggregateTrend} metric="requests" />
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {numberFormat.format(latestTrend?.requests || 0)} rpm
                  </p>
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold text-slate-500">错误率</p>
                  <Sparkline points={aggregateTrend} metric="errorRate" />
                  <p className="mt-1 text-sm font-semibold text-slate-900">{formatPercent(latestTrend?.errorRate || 0)}</p>
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold text-slate-500">p95 延迟</p>
                  <Sparkline points={aggregateTrend} metric="latencyMs" />
                  <p className="mt-1 text-sm font-semibold text-slate-900">{Math.round(latestTrend?.latencyMs || 0)}ms</p>
                </div>
              </div>
            </div>

            <div className="app-surface rounded-lg border p-4">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-950">
                <ShieldCheck className="h-4 w-4 text-[#9a563f]" />
                SLO 风险
              </h2>
              <div className="space-y-3">
                {riskyServices.slice(0, 3).map((service) => (
                  <div key={service.id} className="rounded-md bg-[#fff6e8] p-3 ring-1 ring-[#ead7b7]">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className="truncate text-sm font-semibold text-slate-950">{service.name}</span>
                      <span className="text-xs font-semibold text-slate-500">{service.burnRate.toFixed(1)}x burn</span>
                    </div>
                    <HealthBar value={service.errorBudgetRemaining} tone={service.errorBudgetRemaining < 30 ? 'red' : 'amber'} />
                    <p className="mt-2 text-xs text-slate-500">错误预算剩余 {formatPercent(service.errorBudgetRemaining, 0)}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="app-surface mt-4 overflow-hidden rounded-lg border">
            <div className="flex items-center justify-between gap-3 border-b border-[#ead7b7] px-4 py-3">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                <Server className="h-4 w-4 text-[#9a563f]" />
                服务健康
              </h2>
              <span className="text-xs text-slate-500">最后刷新 {lastRefresh.toLocaleTimeString()}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-[920px] w-full text-left text-sm">
                <thead className="bg-[#fff6e8] text-xs font-semibold text-slate-500">
                  <tr>
                    <th className="px-4 py-3">服务</th>
                    <th className="px-4 py-3">状态</th>
                    <th className="px-4 py-3">SLO</th>
                    <th className="px-4 py-3">RPS</th>
                    <th className="px-4 py-3">错误率</th>
                    <th className="px-4 py-3">p95</th>
                    <th className="px-4 py-3">CPU / 内存</th>
                    <th className="px-4 py-3">告警</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visibleServices.map((service) => {
                    const StatusIcon = statusIcon[service.status];
                    return (
                      <tr key={service.id} className="hover:bg-[#fff6e8]">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-slate-950">{service.name}</p>
                          <p className="text-xs text-slate-500">{service.owner} · {service.environment}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-semibold ${statusStyle[service.status]}`}>
                            <StatusIcon className="h-3.5 w-3.5" />
                            {statusLabel[service.status]}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-slate-900">{formatPercent(service.slo)}</p>
                          <p className="text-xs text-slate-500">目标 {formatPercent(service.sloTarget)}</p>
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-900">{numberFormat.format(service.rps)}</td>
                        <td className="px-4 py-3 font-semibold text-slate-900">{formatPercent(service.errorRate)}</td>
                        <td className="px-4 py-3 font-semibold text-slate-900">{service.p95LatencyMs}ms</td>
                        <td className="px-4 py-3">
                          <div className="min-w-[120px] space-y-1.5">
                            <HealthBar value={service.cpu} tone={service.cpu > 80 ? 'red' : 'slate'} />
                            <HealthBar value={service.memory} tone={service.memory > 80 ? 'red' : 'amber'} />
                          </div>
                          <p className="mt-1 text-xs text-slate-500">CPU {service.cpu}% · MEM {service.memory}%</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={service.activeAlerts ? 'font-semibold text-red-700' : 'font-semibold text-emerald-700'}>
                            {service.activeAlerts}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>

      <aside className="app-surface flex min-h-[620px] flex-col overflow-hidden rounded-lg border shadow-sm xl:min-h-0">
        <div className="border-b border-[#ead7b7] px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-950">健康上下文</h2>
          <p className="mt-0.5 text-xs text-slate-500">风险服务、资源压力与最近异常</p>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <section>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-950">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              高风险服务
            </h3>
            <div className="space-y-3">
              {riskyServices.slice(0, 4).map((service) => (
                <article key={service.id} className="app-surface rounded-lg border p-3 shadow-sm">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-semibold text-slate-950">{service.name}</p>
                    <span className={`rounded-md border px-1.5 py-0.5 text-[11px] font-semibold ${statusStyle[service.status]}`}>
                      {statusLabel[service.status]}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="rounded-md bg-[#fff6e8] p-2">
                      <p className="font-semibold text-slate-900">{formatPercent(service.errorRate)}</p>
                      <p className="text-slate-500">错误率</p>
                    </div>
                    <div className="rounded-md bg-[#fff6e8] p-2">
                      <p className="font-semibold text-slate-900">{service.p95LatencyMs}ms</p>
                      <p className="text-slate-500">p95</p>
                    </div>
                    <div className="rounded-md bg-[#fff6e8] p-2">
                      <p className="font-semibold text-slate-900">{service.activeAlerts}</p>
                      <p className="text-slate-500">告警</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-5">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-950">
              <TrendingUp className="h-4 w-4 text-[#9a563f]" />
              资源压力排行
            </h3>
            <div className="space-y-3">
              {[...visibleServices]
                .sort((a, b) => b.cpu + b.memory - (a.cpu + a.memory))
                .slice(0, 4)
                .map((service) => (
                  <div key={service.id} className="rounded-md bg-[#fff6e8] p-3 ring-1 ring-[#ead7b7]">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className="truncate text-sm font-semibold text-slate-950">{service.name}</span>
                      <span className="text-xs text-slate-500">{Math.round((service.cpu + service.memory) / 2)}%</span>
                    </div>
                    <HealthBar value={(service.cpu + service.memory) / 2} tone={service.cpu > 80 || service.memory > 80 ? 'red' : 'amber'} />
                  </div>
                ))}
            </div>
          </section>

          <section className="app-surface-muted mt-5 rounded-lg border p-3">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-950">
              <Clock3 className="h-4 w-4 text-[#9a563f]" />
              最近异常
            </h3>
            <div className="space-y-3 text-sm leading-6 text-slate-600">
              <p>checkout-api 5xx 错误率超过 4%，错误预算燃烧率达到 8.4x。</p>
              <p>order-worker p95 延迟持续高于 800ms，队列消费可能受影响。</p>
              <p>auth-gateway 登录失败请求增加，建议联动安全告警确认来源。</p>
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
};

export default MetricsHealthPage;
