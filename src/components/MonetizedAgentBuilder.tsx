
import React, { useState, useEffect } from 'react';
import AgentConfig from './AgentConfig';
import WhatsAppSimulator from './WhatsAppSimulator';
import PublishAgent from './PublishAgent';
import SubscriptionPlans from './SubscriptionPlans';
import { Bot, MessageSquare, Sparkles, Crown, Settings, Smartphone } from 'lucide-react';
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
                <p className="text-sm text-gray-600">Crie e publique seu agente de IA</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => setCurrentStep('configure')}
                  variant={currentStep === 'configure' ? 'default' : 'outline'}
                  className="flex items-center space-x-2"
                >
                  <Settings className="h-4 w-4" />
                  <span>Configurar</span>
                </Button>
                <Button
                  onClick={handlePublish}
                  variant={currentStep === 'publish' ? 'default' : 'outline'}
                  className="flex items-center space-x-2"
                  disabled={!isConfigured}
                >
                  <Smartphone className="h-4 w-4" />
                  <span>Publicar</span>
                </Button>
              </div>
              {!subscription.isSubscribed && (
                <Button 
                  onClick={() => setShowUpgradeModal(true)}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade Pro
                </Button>
              )}
              <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full">
                <Sparkles className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">
                  {subscription.isSubscribed ? `Plano ${subscription.plan.toUpperCase()}` : 'Teste Grátis'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {currentStep === 'configure' && (
          <div className="grid lg:grid-cols-2 gap-8 h-[calc(100vh-200px)]">
            {/* Left Side - Configuration */}
            <div className="space-y-6">
              <Card className="bg-white rounded-2xl shadow-xl border border-gray-200/50">
                <div className="p-6 bg-gradient-to-r from-purple-500 to-blue-600">
                  <div className="flex items-center space-x-3">
                    <Bot className="h-6 w-6 text-white" />
                    <h2 className="text-xl font-semibold text-white">Configuração do Agente</h2>
                  </div>
                  <p className="text-purple-100 mt-2">Configure seu agente do jeito que você quiser</p>
                </div>
                <CardContent className="p-6">
                  <AgentConfig agentData={agentData} onUpdate={handleAgentUpdate} />
                </CardContent>
              </Card>

              {isConfigured && (
                <div className="text-center">
                  <div className="inline-flex items-center space-x-2 bg-green-50 px-4 py-2 rounded-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-green-700">
                      Agente configurado! Teste no simulador →
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Right Side - WhatsApp Simulator */}
            <div className="flex flex-col items-center justify-center space-y-6">
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold text-gray-900">Simulador WhatsApp</h3>
                <p className="text-gray-600">Teste como seu agente responde</p>
              </div>
              
              {isConfigured ? (
                <WhatsAppSimulator agentData={agentData} />
              ) : (
                <div className="w-80 h-[600px] bg-gray-100 rounded-3xl shadow-2xl border border-gray-200 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <Smartphone className="h-12 w-12 text-gray-400 mx-auto" />
                    <div>
                      <h4 className="font-medium text-gray-700">Configure seu agente</h4>
                      <p className="text-sm text-gray-500">Preencha as informações básicas para testar</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {currentStep === 'publish' && (
          <PublishAgent 
            agentData={agentData} 
            subscription={subscription}
            onUpgradeClick={() => setShowUpgradeModal(true)}
          />
        )}
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Escolha seu Plano</h2>
                <Button 
                  variant="ghost" 
                  onClick={() => setShowUpgradeModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </Button>
              </div>
              <p className="text-gray-600 mt-2">
                Conecte seu agente ao WhatsApp e atenda clientes 24/7
              </p>
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
    </div>
  );
};

export default MonetizedAgentBuilder;
