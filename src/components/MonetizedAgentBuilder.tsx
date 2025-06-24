
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
              onClick={() => setShowWhatsAppTest(true)}
              size="sm"
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Smartphone className="h-4 w-4" />
              <span>Testar no WhatsApp</span>
            </Button>

            <Button
              onClick={() => setShowUpgradeModal(true)}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white flex items-center space-x-2"
            >
              <Globe className="h-4 w-4" />
              <span>Publicar</span>
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

      {/* Main Layout - ChatGPT Style */}
      <div className="flex h-[calc(100vh-73px)]">
        {/* Chat Interface - Main Area */}
        <div className="flex-1 flex flex-col relative">
          {/* WhatsApp Test Overlay */}
          {showWhatsAppTest && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-50">
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

          <CalibrationChat 
            agentData={agentData} 
            onAgentUpdate={handleAgentUpdate}
          />
        </div>

        {/* Right Panel - Employee Info */}
        <div className="w-80 border-l border-gray-200">
          <EmployeeInfoPanel 
            agentData={agentData}
            onAgentUpdate={handleAgentUpdate}
          />
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
