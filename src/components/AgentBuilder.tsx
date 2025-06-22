import React, { useState, useEffect } from 'react';
import AgentConfig from './AgentConfig';
import ChatInterface from './ChatInterface';
import { Bot, MessageSquare, Sparkles } from 'lucide-react';

export interface AgentData {
  businessName: string;
  businessType: string;
  businessInfo: string;
  personality: string;
  welcomeMessage: string;
  template: string;
}

const AgentBuilder = () => {
  const [agentData, setAgentData] = useState<AgentData>({
    businessName: '',
    businessType: 'restaurante',
    businessInfo: '',
    personality: 'amigável',
    welcomeMessage: 'Olá! Como posso ajudá-lo hoje?',
    template: 'restaurante'
  });

  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    const hasBasicConfig = Boolean(agentData.businessName && agentData.businessInfo);
    setIsConfigured(hasBasicConfig);
  }, [agentData]);

  const handleAgentUpdate = (newData: Partial<AgentData>) => {
    setAgentData(prev => ({ ...prev, ...newData }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  AgentBuilder
                </h1>
                <p className="text-sm text-gray-600">Crie seu agente de IA em minutos</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full">
              <Sparkles className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">Grátis até 1B tokens/mês</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-8 h-[calc(100vh-180px)]">
          {/* Left Panel - Configuration */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-purple-500 to-blue-600">
              <div className="flex items-center space-x-3">
                <MessageSquare className="h-6 w-6 text-white" />
                <h2 className="text-xl font-semibold text-white">Configuração do Agente</h2>
              </div>
              <p className="text-purple-100 mt-2">Configure seu agente do jeito que você quiser</p>
            </div>
            <div className="p-6 h-[calc(100%-100px)] overflow-y-auto">
              <AgentConfig agentData={agentData} onUpdate={handleAgentUpdate} />
            </div>
          </div>

          {/* Right Panel - Chat Interface */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-pink-500 to-rose-500">
              <div className="flex items-center space-x-3">
                <Bot className="h-6 w-6 text-white" />
                <h2 className="text-xl font-semibold text-white">Teste seu Agente</h2>
              </div>
              <p className="text-pink-100 mt-2">Converse e veja como ele responde</p>
            </div>
            <div className="h-[calc(100%-100px)]">
              {isConfigured ? (
                <ChatInterface agentData={agentData} />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto">
                      <Bot className="h-8 w-8 text-gray-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Configure seu agente</h3>
                      <p className="text-gray-500 max-w-sm">
                        Preencha as informações básicas à esquerda para começar a testar seu agente
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentBuilder;
