import { GlassCard } from '@/components/ui/GlassCard';
import { motion } from 'framer-motion';
import { Search, Shield, BarChart3, AlertTriangle } from 'lucide-react';
import { useChatStore } from '@/stores/chatStore';

const WelcomeScreen = () => {
  const { addMessage, currentSessionId, createSession } = useChatStore();

  const features = [
    {
      icon: Search,
      title: '扫描代码',
      description: '智能扫描代码安全漏洞',
      prompt: '帮我扫描代码中的安全漏洞',
      color: 'bg-blue-500',
    },
    {
      icon: Shield,
      title: '防护系统',
      description: '实时监控系统安全状态',
      prompt: '查看当前系统安全状态',
      color: 'bg-green-500',
    },
    {
      icon: BarChart3,
      title: '分析日志',
      description: '智能分析系统日志',
      prompt: '帮我分析最近的系统日志',
      color: 'bg-purple-500',
    },
    {
      icon: AlertTriangle,
      title: '告警处理',
      description: '自动化告警分析与处理',
      prompt: '查看并分析当前告警',
      color: 'bg-orange-500',
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
  };

  return (
    <div className="h-full flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold text-white mb-4">DevGuard Agent</h1>
          <p className="text-xl text-slate-400">您的 AI 安全助手</p>
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
                className="p-6 cursor-pointer h-full bg-slate-800 border border-slate-700 rounded-2xl hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/20 transition-all"
                onClick={() => handleFeatureClick(feature.prompt)}
              >
                <div
                  className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4`}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
