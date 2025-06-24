
import React, { useState, useEffect } from 'react';
import AgentConfig from './AgentConfig';
import WhatsAppSimulator from './WhatsAppSimulator';
import PublishAgent from './PublishAgent';
import SubscriptionPlans from './SubscriptionPlans';
import { Bot, MessageSquare, Sparkles, Crown, Settings, Smartphone, TestTube, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export interface AgentData {
  businessName: string;
  businessType: string;
  businessInfo: string;
  personality: string;
  welcomeMessage: string;
  template: string;
}

export interface SubscriptionState {
  isSubscribed: boolean;
  plan: 'free' | 'starter' | 'pro' | 'enterprise';
  features: string[];
}

const MonetizedAgentBuilder = () => {
  const [currentStep, setCurrentStep] = useState<'configure' | 'publish'>('configure');
  const [agentData, setAgentData] = useState<AgentData>({
    businessName: '',
    businessType: 'restaurante',
    businessInfo: '',
    personality: 'amigável',
    welcomeMessage: 'Olá! Como posso ajudá-lo hoje?',
    template: 'restaurante'
  });

  const [subscription, setSubscription] = useState<SubscriptionState>({
    isSubscribed: false,
    plan: 'free',
    features: ['Teste limitado', 'Suporte básico']
  });

  const [isConfigured, setIsConfigured] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    const hasBasicConfig = Boolean(agentData.businessName && agentData.businessInfo);
    setIsConfigured(hasBasicConfig);
  }, [agentData]);

  const handleAgentUpdate = (newData: Partial<AgentData>) => {
    setAgentData(prev => ({ ...prev, ...newData }));
  };

  const handlePublish = () => {
    if (!subscription.isSubscribed) {
      setShowUpgradeModal(true);
      return;
    }
    setCurrentStep('publish');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header Minimalista */}
      <div className="border-b border-gray-200">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">FuncionárioIA</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            {isConfigured && (
              <Button
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <TestTube className="h-4 w-4" />
                <span>Testar Funcionário Inteligente</span>
              </Button>
            )}
            
            <Button
              onClick={() => setShowUpgradeModal(true)}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white flex items-center space-x-2"
            >
              <Globe className="h-4 w-4" />
              <span>Criar Site Interativo</span>
            </Button>

            {!subscription.isSubscribed && (
              <Button 
                onClick={() => setShowUpgradeModal(true)}
                size="sm"
                className="bg-black text-white hover:bg-gray-800"
              >
                <Crown className="h-4 w-4 mr-2" />
                Upgrade Pro
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Layout Principal */}
      <div className="flex h-[calc(100vh-73px)]">
        {/* Sidebar Esquerda - Configurações */}
        <div className="w-80 border-r border-gray-200 bg-gray-50 overflow-y-auto">
          <div className="p-6">
            <div className="space-y-1 mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Configure seu Funcionário IA
              </h2>
              <p className="text-sm text-gray-600">
                Transforme seu atendimento com inteligência artificial de última geração
              </p>
            </div>
            
            <AgentConfig agentData={agentData} onUpdate={handleAgentUpdate} />
          </div>
        </div>

        {/* Área Principal - Chat */}
        <div className="flex-1 flex flex-col">
          {/* Header do Chat */}
          <div className="border-b border-gray-200 bg-white px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {agentData.businessName || 'Seu Funcionário IA'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {isConfigured ? 'Pronto para atender seus clientes 24/7' : 'Configure à esquerda para começar'}
                  </p>
                </div>
              </div>
              
              {isConfigured && (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-green-600 font-medium">Online</span>
                </div>
              )}
            </div>
          </div>

          {/* Área do Chat */}
          <div className="flex-1 flex items-center justify-center p-6">
            {isConfigured ? (
              <div className="w-full max-w-md">
                <WhatsAppSimulator agentData={agentData} />
              </div>
            ) : (
              <div className="text-center space-y-6 max-w-md">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                  <Bot className="h-10 w-10 text-gray-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Seu Funcionário IA está esperando
                  </h3>
                  <p className="text-gray-600">
                    Complete a configuração à esquerda para começar a treinar seu assistente inteligente personalizado
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">🚀 Por que escolher FuncionárioIA?</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Atendimento 24/7 sem pausas</li>
                    <li>• Reduz custos em até 80%</li>
                    <li>• Aprende com seu negócio</li>
                    <li>• Integração WhatsApp nativa</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Upgrade */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Libere o Poder Total do seu Funcionário IA
                  </h2>
                  <p className="text-gray-600 mt-2">
                    Conecte ao WhatsApp e transforme seu atendimento hoje mesmo
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  onClick={() => setShowUpgradeModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </Button>
              </div>
            </div>
            <div className="p-6">
              <SubscriptionPlans 
                currentPlan={subscription.plan}
                onSelectPlan={(plan) => {
                  setSubscription({
                    isSubscribed: true,
                    plan,
                    features: plan === 'starter' ? ['WhatsApp', 'Suporte'] : ['WhatsApp', 'Analytics', 'Suporte Priority']
                  });
                  setShowUpgradeModal(false);
                  setCurrentStep('publish');
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Página de Publicação */}
      {currentStep === 'publish' && (
        <div className="fixed inset-0 bg-white z-40 overflow-y-auto">
          <PublishAgent 
            agentData={agentData} 
            subscription={subscription}
            onUpgradeClick={() => setShowUpgradeModal(true)}
          />
        </div>
      )}
    </div>
  );
};

export default MonetizedAgentBuilder;
