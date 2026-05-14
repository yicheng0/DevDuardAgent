import { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Database,
  FolderOpen,
  KeyRound,
  Loader2,
  Network,
  PlugZap,
  RotateCcw,
  Save,
  ServerCog,
  Settings,
  X,
} from 'lucide-react';
import { ConfigTestResult, ConfigTestTarget, RuntimeConfig } from '@/types';

const emptySecret = { hasValue: false, value: '' };

const emptyConfig: RuntimeConfig = {
  quickModel: { apiKey: emptySecret, baseUrl: '', model: '' },
  thinkModel: { apiKey: emptySecret, baseUrl: '', model: '' },
  embedding: { apiKey: emptySecret, baseUrl: '', model: '' },
  mcpUrl: '',
  milvusAddress: '',
  fileDir: '',
  indexTimeoutSeconds: 600,
};

const tokenKey = 'devguard-config-token';

type ApiResponse<T> = {
  message: string;
  data: T;
};

type ConfigPanelProps = {
  onClose?: () => void;
  variant?: 'dialog' | 'page';
};

type ModelConfigKey = 'quickModel' | 'thinkModel' | 'embedding';

const modelGroups: Array<{
  title: string;
  description: string;
  key: ModelConfigKey;
  target: ConfigTestTarget;
  badge: string;
}> = [
  {
    title: '快速模型',
    description: '用于普通对话、工具调用和执行节点。',
    key: 'quickModel',
    target: 'quick_model',
    badge: 'Chat',
  },
  {
    title: '深度模型',
    description: '用于规划、重规划和复杂分析。',
    key: 'thinkModel',
    target: 'think_model',
    badge: 'Reasoning',
  },
  {
    title: 'Embedding',
    description: '用于知识库向量化、召回和内部文档检索。',
    key: 'embedding',
    target: 'embedding',
    badge: 'Vector',
  },
];

const ConfigPanel = ({ onClose, variant = 'page' }: ConfigPanelProps) => {
  const [token, setToken] = useState(() => sessionStorage.getItem(tokenKey) || '');
  const [draftToken, setDraftToken] = useState(token);
  const [config, setConfig] = useState<RuntimeConfig>(emptyConfig);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [testResults, setTestResults] = useState<Partial<Record<ConfigTestTarget, ConfigTestResult>>>({});
  const [testingTarget, setTestingTarget] = useState<ConfigTestTarget | null>(null);

  const hasToken = token.trim().length > 0;
  const isDialog = variant === 'dialog';

  const headers = useMemo(
    () => ({
      'Content-Type': 'application/json',
      'X-Admin-Token': token,
    }),
    [token]
  );

  const request = async <T,>(url: string, options: RequestInit = {}) => {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...(options.headers || {}),
      },
    });
    const body = (await response.json()) as ApiResponse<T>;
    if (response.status === 401) {
      sessionStorage.removeItem(tokenKey);
      setToken('');
      setDraftToken('');
      throw new Error('管理员口令无效，请重新输入。');
    }
    if (!response.ok || body.message !== 'OK') {
      throw new Error(body.message || '请求失败');
    }
    return body.data;
  };

  const loadConfig = async () => {
    if (!hasToken) return;
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      const data = await request<{ config: RuntimeConfig }>('/api/config/runtime');
      setConfig(data.config);
      setTestResults({});
    } catch (err) {
      setError(err instanceof Error ? err.message : '读取配置失败');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, [token]);

  const updateModel = (key: ModelConfigKey, field: 'apiKey' | 'baseUrl' | 'model', value: string) => {
    setConfig((current) => ({
      ...current,
      [key]: {
        ...current[key],
        [field]: field === 'apiKey' ? { hasValue: value.length > 0, value } : value,
      },
    }));
  };

  const handleTokenSubmit = () => {
    const next = draftToken.trim();
    if (!next) {
      setError('请输入管理员口令');
      return;
    }
    sessionStorage.setItem(tokenKey, next);
    setToken(next);
    setError('');
  };

  const saveConfig = async () => {
    setIsSaving(true);
    setError('');
    setSuccess('');
    try {
      const data = await request<{ config: RuntimeConfig }>('/api/config/runtime', {
        method: 'PUT',
        body: JSON.stringify({ config }),
      });
      setConfig(data.config);
      setTestResults({});
      setSuccess('配置已保存，后续新请求会立即使用新配置。');
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存配置失败');
    } finally {
      setIsSaving(false);
    }
  };

  const testConfig = async (target: ConfigTestTarget) => {
    setTestingTarget(target);
    setError('');
    setSuccess('');
    try {
      const data = await request<ConfigTestResult>('/api/config/test', {
        method: 'POST',
        body: JSON.stringify({ target, config }),
      });
      setTestResults((current) => ({ ...current, [target]: data }));
    } catch (err) {
      setError(err instanceof Error ? err.message : '测试失败');
    } finally {
      setTestingTarget(null);
    }
  };

  const renderTestResult = (target: ConfigTestTarget) => {
    const result = testResults[target];
    if (!result) return null;

    return (
      <p className={`mt-3 text-xs font-medium ${result.ok ? 'text-emerald-700' : 'text-red-700'}`}>
        {result.message}
      </p>
    );
  };

  const renderModelGroup = (
    title: string,
    description: string,
    key: ModelConfigKey,
    target: ConfigTestTarget,
    badge: string
  ) => (
    <section className="app-surface rounded-lg border p-4 shadow-sm">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
            <span className="rounded-md bg-[#f7ebe5] px-2 py-1 text-xs font-semibold text-[#7f432f]">{badge}</span>
          </div>
          <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
        </div>
        <button
          type="button"
          onClick={() => testConfig(target)}
          disabled={testingTarget !== null}
          className="brand-subtle-button inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md border px-3 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-60"
        >
          {testingTarget === target ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <PlugZap className="h-3.5 w-3.5" />}
          测试
        </button>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="block">
          <span className="text-xs font-medium text-slate-600">Base URL</span>
          <input
            value={config[key].baseUrl}
            onChange={(event) => updateModel(key, 'baseUrl', event.target.value)}
            placeholder={key === 'embedding' ? 'https://dashscope.aliyuncs.com/compatible-mode/v1' : 'https://ark.cn-beijing.volces.com/api/v3'}
            className="brand-input mt-1 h-10 w-full rounded-md border px-3 text-sm"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-slate-600">Model</span>
          <input
            value={config[key].model}
            onChange={(event) => updateModel(key, 'model', event.target.value)}
            placeholder={key === 'embedding' ? 'text-embedding-v4' : 'deepseek-v3-1-terminus'}
            className="brand-input mt-1 h-10 w-full rounded-md border px-3 text-sm"
          />
        </label>
        <label className="block md:col-span-2">
          <span className="text-xs font-medium text-slate-600">API Key</span>
          <input
            type="password"
            value={config[key].apiKey.value}
            onChange={(event) => updateModel(key, 'apiKey', event.target.value)}
            placeholder={config[key].apiKey.hasValue ? '已配置，留空或保持 ******** 表示不修改' : '请输入 API Key'}
            className="brand-input mt-1 h-10 w-full rounded-md border px-3 text-sm"
          />
        </label>
      </div>
      {renderTestResult(target)}
    </section>
  );

  return (
    <div className={`flex min-h-0 flex-col overflow-hidden ${isDialog ? 'h-full' : 'app-surface h-full rounded-lg border shadow-sm'}`}>
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-[#ead7b7] bg-[#fffdf8] px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#9a563f] text-white">
            <Settings className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold text-slate-950">运行配置</h2>
            <p className="truncate text-xs text-slate-500">模型、Embedding、MCP、Milvus 与文件目录</p>
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="brand-icon-button flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-md text-slate-500"
            aria-label="关闭配置"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </header>

      {!hasToken ? (
        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          <div className="app-surface mx-auto max-w-md rounded-lg border p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#fff6e8] text-[#7f432f]">
                <KeyRound className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-slate-950">管理员口令</h3>
                <p className="text-xs leading-5 text-slate-500">默认口令为 devguard-admin，建议部署前修改。</p>
              </div>
            </div>
            <input
              type="password"
              value={draftToken}
              onChange={(event) => setDraftToken(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') handleTokenSubmit();
              }}
              className="brand-input h-10 w-full rounded-md border px-3 text-sm"
              placeholder="输入管理员口令"
            />
            {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
            <button
              type="button"
              onClick={handleTokenSubmit}
              className="brand-button mt-4 h-10 w-full px-3 text-sm"
            >
              进入配置
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
            {isLoading ? (
              <div className="flex h-48 items-center justify-center text-sm text-slate-500">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                正在读取配置
              </div>
            ) : (
              <div className="mx-auto grid max-w-6xl gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
                <div className="min-w-0 space-y-4">
                  {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
                  {success && (
                    <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      {success}
                    </div>
                  )}
                  {modelGroups.map((group) => renderModelGroup(group.title, group.description, group.key, group.target, group.badge))}
                  <section className="app-surface rounded-lg border p-4 shadow-sm">
                    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-950">运维与存储</h3>
                        <p className="mt-1 text-xs leading-5 text-slate-500">MCP 日志服务、Milvus 地址和上传文件目录。</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => testConfig('milvus')}
                        disabled={testingTarget !== null}
                        className="brand-subtle-button inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-md border px-3 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {testingTarget === 'milvus' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <PlugZap className="h-3.5 w-3.5" />}
                        测试 Milvus
                      </button>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <label className="block md:col-span-2">
                        <span className="text-xs font-medium text-slate-600">MCP URL</span>
                        <input
                          value={config.mcpUrl}
                          onChange={(event) => setConfig((current) => ({ ...current, mcpUrl: event.target.value }))}
                          placeholder="https://mcp-api.tencent-cloud.com/sse/XXXX"
                          className="brand-input mt-1 h-10 w-full rounded-md border px-3 text-sm"
                        />
                      </label>
                      <label className="block">
                        <span className="text-xs font-medium text-slate-600">Milvus Address</span>
                        <input
                          value={config.milvusAddress}
                          onChange={(event) => setConfig((current) => ({ ...current, milvusAddress: event.target.value }))}
                          placeholder="localhost:19530"
                          className="brand-input mt-1 h-10 w-full rounded-md border px-3 text-sm"
                        />
                      </label>
                      <label className="block">
                        <span className="text-xs font-medium text-slate-600">File Dir</span>
                        <input
                          value={config.fileDir}
                          onChange={(event) => setConfig((current) => ({ ...current, fileDir: event.target.value }))}
                          placeholder="/path/to/knowledge_cmd/docs"
                          className="brand-input mt-1 h-10 w-full rounded-md border px-3 text-sm"
                        />
                      </label>
                      <label className="block">
                        <span className="text-xs font-medium text-slate-600">Index Timeout Seconds</span>
                        <input
                          type="number"
                          min={30}
                          max={3600}
                          step={1}
                          value={config.indexTimeoutSeconds}
                          onChange={(event) =>
                            setConfig((current) => ({
                              ...current,
                              indexTimeoutSeconds: Number.parseInt(event.target.value, 10) || 0,
                            }))
                          }
                          placeholder="600"
                          className="brand-input mt-1 h-10 w-full rounded-md border px-3 text-sm"
                        />
                      </label>
                    </div>
                    {renderTestResult('milvus')}
                  </section>
                </div>

                <aside className="space-y-4">
                  <section className="app-surface rounded-lg border p-4 shadow-sm">
                    <h3 className="text-sm font-semibold text-slate-950">当前配置范围</h3>
                    <div className="mt-4 space-y-3 text-sm">
                      <div className="flex items-center gap-3 text-slate-600">
                        <ServerCog className="h-4 w-4 text-[#9a563f]" />
                        两套 OpenAI 兼容 Chat 模型
                      </div>
                      <div className="flex items-center gap-3 text-slate-600">
                        <Database className="h-4 w-4 text-[#9a563f]" />
                        DashScope 兼容 Embedding
                      </div>
                      <div className="flex items-center gap-3 text-slate-600">
                        <Network className="h-4 w-4 text-[#9a563f]" />
                        MCP SSE 与 Milvus 连接
                      </div>
                      <div className="flex items-center gap-3 text-slate-600">
                        <FolderOpen className="h-4 w-4 text-[#9a563f]" />
                        知识库文件存储目录
                      </div>
                    </div>
                  </section>

                  <section className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                    <h3 className="font-semibold">密钥保存说明</h3>
                    <p className="mt-2 leading-6">
                      已配置的 API Key 会以 ******** 显示。保存时保持为空或保持 ********，后端会沿用原密钥；输入新值才会覆盖。
                    </p>
                  </section>

                  <button
                    type="button"
                    onClick={loadConfig}
                    disabled={isLoading || isSaving}
                    className="brand-subtle-button inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-md border px-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <RotateCcw className="h-4 w-4" />
                    重新读取配置
                  </button>
                </aside>
              </div>
            )}
          </div>
          <footer className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-[#ead7b7] bg-[#fffdf8] px-5 py-4">
            <button
              type="button"
              onClick={() => {
                sessionStorage.removeItem(tokenKey);
                setToken('');
                setDraftToken('');
              }}
              className="brand-text-link cursor-pointer rounded px-1 text-sm font-semibold"
            >
              更换管理员口令
            </button>
            <button
              type="button"
              onClick={saveConfig}
              disabled={isSaving || isLoading}
              className="brand-button h-10 px-4 text-sm disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              保存并立即生效
            </button>
          </footer>
        </>
      )}
    </div>
  );
};

export default ConfigPanel;
