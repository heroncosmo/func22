
import React, { useState, useEffect } from 'react';
import AgentConfig from './AgentConfig';
import WhatsAppSimulator from './WhatsAppSimulator';
import PublishAgent from './PublishAgent';
import SubscriptionPlans from './SubscriptionPlans';
import CalibrationChat from './CalibrationChat';
import EmployeeInfoPanel from './EmployeeInfoPanel';
import { Bot, MessageSquare, Sparkles, Crown, Settings, Smartphone, TestTube, Globe, X } from 'lucide-react';
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
  const [showWhatsAppTest, setShowWhatsAppTest] = useState(false);

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

      {/* Layout Principal - ChatGPT Style */}
      <div className="flex h-[calc(100vh-73px)]">
        {/* Sidebar Esquerda - Lista de Configurações */}
        <div className="w-64 border-r border-gray-200 bg-gray-50 overflow-y-auto">
          <div className="p-4">
            <Button
              onClick={() => {
                setAgentData({
                  businessName: '',
                  businessType: 'restaurante',
                  businessInfo: '',
                  personality: 'amigável',
                  welcomeMessage: 'Olá! Como posso ajudá-lo hoje?',
                  template: 'restaurante'
                });
              }}
              className="w-full mb-4 bg-black text-white hover:bg-gray-800"
            >
              + Novo Funcionário IA
            </Button>
            
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-500 px-2">Configurações</div>
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <div className="flex items-center space-x-2">
                  <Bot className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium">
                    {agentData.businessName || 'Funcionário IA'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {agentData.businessType}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Área Central - Chat Style Interface */}
        <div className="flex-1 flex flex-col relative">
          {/* WhatsApp Test Overlay - Positioned over chat */}
          {showWhatsAppTest && (
            <div className="absolute inset-0 bg-black/20 flex items-start justify-center pt-16 z-30">
              <div className="relative">
                <Button
                  onClick={() => setShowWhatsAppTest(false)}
                  variant="ghost"
                  size="icon"
                  className="absolute -top-2 -right-2 z-10 bg-white rounded-full shadow-lg hover:bg-gray-100"
                >
                  <X className="h-4 w-4" />
                </Button>
                <WhatsAppSimulator agentData={agentData} />
              </div>
            </div>
          )}

          {/* Header do Chat */}
          <div className="border-b border-gray-200 bg-white px-6 py-4 z-20 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Assistente de Configuração
                  </h3>
                  <p className="text-sm text-gray-500">
                    Configure seu funcionário IA conversando comigo
                  </p>
                </div>
              </div>
              
              <Button
                onClick={() => setShowWhatsAppTest(true)}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <Smartphone className="h-4 w-4" />
                <span>Testar Funcionário IA</span>
              </Button>
            </div>
          </div>

          {/* Layout do Chat */}
          <div className="flex-1 flex">
            {/* Chat de Calibração */}
            <div className="flex-1">
              <CalibrationChat 
                agentData={agentData} 
                onAgentUpdate={handleAgentUpdate}
              />
            </div>

            {/* Painel de Informações do Funcionário */}
            <div className="w-80 border-l border-gray-200">
              <EmployeeInfoPanel 
                agentData={agentData}
                onAgentUpdate={handleAgentUpdate}
              />
            </div>
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
