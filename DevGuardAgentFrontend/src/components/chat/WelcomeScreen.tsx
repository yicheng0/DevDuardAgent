import { motion } from 'framer-motion';
import { AlertTriangle, BarChart3, FileSearch, Radar, Search, Shield } from 'lucide-react';
import { useChatStore } from '@/stores/chatStore';
import { useAIOpsStore } from '@/stores/aiopsStore';
import { useUIStore } from '@/stores/uiStore';

const WelcomeScreen = () => {
  const { addMessage, currentSessionId, createSession } = useChatStore();
  const { startDemoTrace } = useAIOpsStore();
  const { isAIOpsOpen, toggleAIOps } = useUIStore();

  const features = [
    {
      icon: Search,
      title: '扫描代码',
      description: '识别风险函数、依赖漏洞和修复优先级',
      prompt: '帮我扫描代码中的安全漏洞',
      color: 'from-cyan-400 to-blue-500',
    },
    {
      icon: Shield,
      title: '防护系统',
      description: '检查服务健康、访问异常和防护状态',
      prompt: '查看当前系统安全状态',
      color: 'from-emerald-400 to-teal-500',
    },
    {
      icon: BarChart3,
      title: '分析日志',
      description: '从日志中提取异常模式和影响范围',
      prompt: '帮我分析最近的系统日志',
      color: 'from-indigo-400 to-cyan-500',
    },
    {
      icon: AlertTriangle,
      title: '告警处理',
      description: '完成告警归因、止血动作和复盘摘要',
      prompt: '查看并分析当前告警',
      color: 'from-amber-400 to-red-500',
    },
  ];

  const handleFeatureClick = (prompt: string) => {
    if (!currentSessionId) {
      createSession();
    }
    addMessage({
      role: 'user',
      content: prompt,
    });
    startDemoTrace(prompt);
    if (!isAIOpsOpen) {
      toggleAIOps();
    }
  };

  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.22em] text-cyan-100">
            <Radar className="h-4 w-4" />
            Agent Reasoning Workspace
          </div>
          <h1 className="mb-4 text-5xl font-semibold tracking-tight text-white">DevGuard Agent</h1>
          <p className="mx-auto max-w-2xl text-lg leading-7 text-slate-400">
            面向安全运维场景的 Agent 工作台，展示任务理解、工具调用、证据沉淀和处置建议。
          </p>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              whileHover={{ y: -8, scale: 1.02 }}
            >
              <div
                className="group h-full cursor-pointer rounded-2xl border border-white/10 bg-slate-950/62 p-6 shadow-[0_24px_70px_rgba(0,0,0,0.25)] backdrop-blur-xl transition-all hover:border-cyan-300/35 hover:bg-white/[0.07]"
                onClick={() => handleFeatureClick(feature.prompt)}
              >
                <div
                  className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} shadow-[0_0_28px_rgba(34,211,238,0.18)]`}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400">{feature.description}</p>
                <div className="mt-5 flex items-center gap-2 text-xs font-medium text-cyan-100 opacity-0 transition-opacity group-hover:opacity-100">
                  <FileSearch className="h-3.5 w-3.5" />
                  启动推理轨迹
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
