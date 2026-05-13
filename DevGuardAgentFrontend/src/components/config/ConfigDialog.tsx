import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, KeyRound, Loader2, PlugZap, Save, Settings, X } from 'lucide-react';
import { ConfigTestResult, ConfigTestTarget, RuntimeConfig } from '@/types';
import { useUIStore } from '@/stores/uiStore';

const emptySecret = { hasValue: false, value: '' };

const emptyConfig: RuntimeConfig = {
  quickModel: { apiKey: emptySecret, baseUrl: '', model: '' },
  thinkModel: { apiKey: emptySecret, baseUrl: '', model: '' },
  embedding: { apiKey: emptySecret, baseUrl: '', model: '' },
  mcpUrl: '',
  milvusAddress: '',
  fileDir: '',
};

const tokenKey = 'devguard-config-token';

type ApiResponse<T> = {
  message: string;
  data: T;
};

const ConfigDialog = () => {
  const { isConfigOpen, setConfigOpen } = useUIStore();
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
    if (!hasToken || !isConfigOpen) return;
    setIsLoading(true);
    setError('');
    try {
      const data = await request<{ config: RuntimeConfig }>('/api/config/runtime');
      setConfig(data.config);
    } catch (err) {
      setError(err instanceof Error ? err.message : '读取配置失败');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, [isConfigOpen, token]);

  if (!isConfigOpen) return null;

  const updateModel = (
    key: 'quickModel' | 'thinkModel' | 'embedding',
    field: 'apiKey' | 'baseUrl' | 'model',
    value: string
  ) => {
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

  const renderModelGroup = (
    title: string,
    description: string,
    key: 'quickModel' | 'thinkModel' | 'embedding',
    target: ConfigTestTarget
  ) => (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
          <p className="mt-1 text-xs text-slate-500">{description}</p>
        </div>
        <button
          type="button"
          onClick={() => testConfig(target)}
          className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md border border-slate-200 px-2.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
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
            className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </label>
        <label className="block">
          <span className="text-xs font-medium text-slate-600">Model</span>
          <input
            value={config[key].model}
            onChange={(event) => updateModel(key, 'model', event.target.value)}
            className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </label>
        <label className="block md:col-span-2">
          <span className="text-xs font-medium text-slate-600">API Key</span>
          <input
            type="password"
            value={config[key].apiKey.value}
            onChange={(event) => updateModel(key, 'apiKey', event.target.value)}
            placeholder={config[key].apiKey.hasValue ? '已配置，留空或保持 ******** 表示不修改' : '请输入 API Key'}
            className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </label>
      </div>
      {testResults[target] && (
        <p className={`mt-3 text-xs font-medium ${testResults[target]?.ok ? 'text-emerald-700' : 'text-red-700'}`}>
          {testResults[target]?.message}
        </p>
      )}
    </section>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-2xl">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Settings className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-semibold text-slate-950">运行配置</h2>
              <p className="text-xs text-slate-500">模型、Embedding、MCP、Milvus 与文件目录</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setConfigOpen(false)}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            aria-label="关闭配置"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {!hasToken ? (
          <div className="p-5">
            <div className="mx-auto max-w-md rounded-lg border border-slate-200 bg-white p-5">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                  <KeyRound className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-slate-950">管理员口令</h3>
                  <p className="text-xs text-slate-500">默认口令为 devguard-admin，建议部署前修改。</p>
                </div>
              </div>
              <input
                type="password"
                value={draftToken}
                onChange={(event) => setDraftToken(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') handleTokenSubmit();
                }}
                className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                placeholder="输入管理员口令"
              />
              {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
              <button
                type="button"
                onClick={handleTokenSubmit}
                className="mt-4 inline-flex h-10 w-full cursor-pointer items-center justify-center rounded-md bg-blue-600 px-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              >
                进入配置
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto p-5">
              {isLoading ? (
                <div className="flex h-48 items-center justify-center text-sm text-slate-500">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  正在读取配置
                </div>
              ) : (
                <div className="space-y-4">
                  {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
                  {success && (
                    <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                      <CheckCircle2 className="h-4 w-4" />
                      {success}
                    </div>
                  )}
                  {renderModelGroup('快速模型', '用于普通对话和执行节点。', 'quickModel', 'quick_model')}
                  {renderModelGroup('深度模型', '用于规划、重规划和复杂分析。', 'thinkModel', 'think_model')}
                  {renderModelGroup('Embedding', '用于知识库向量化和检索。', 'embedding', 'embedding')}
                  <section className="rounded-lg border border-slate-200 bg-white p-4">
                    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-950">运维与存储</h3>
                        <p className="mt-1 text-xs text-slate-500">MCP 日志服务、Milvus 地址和上传文件目录。</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => testConfig('milvus')}
                        className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md border border-slate-200 px-2.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
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
                          className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                        />
                      </label>
                      <label className="block">
                        <span className="text-xs font-medium text-slate-600">Milvus Address</span>
                        <input
                          value={config.milvusAddress}
                          onChange={(event) => setConfig((current) => ({ ...current, milvusAddress: event.target.value }))}
                          className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                        />
                      </label>
                      <label className="block">
                        <span className="text-xs font-medium text-slate-600">File Dir</span>
                        <input
                          value={config.fileDir}
                          onChange={(event) => setConfig((current) => ({ ...current, fileDir: event.target.value }))}
                          className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                        />
                      </label>
                    </div>
                    {testResults.milvus && (
                      <p className={`mt-3 text-xs font-medium ${testResults.milvus.ok ? 'text-emerald-700' : 'text-red-700'}`}>
                        {testResults.milvus.message}
                      </p>
                    )}
                  </section>
                </div>
              )}
            </div>
            <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white px-5 py-4">
              <button
                type="button"
                onClick={() => {
                  sessionStorage.removeItem(tokenKey);
                  setToken('');
                  setDraftToken('');
                }}
                className="cursor-pointer text-sm font-medium text-slate-500 hover:text-slate-900"
              >
                更换管理员口令
              </button>
              <button
                type="button"
                onClick={saveConfig}
                disabled={isSaving || isLoading}
                className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                保存并立即生效
              </button>
            </footer>
          </>
        )}
      </div>
    </div>
  );
};

export default ConfigDialog;
