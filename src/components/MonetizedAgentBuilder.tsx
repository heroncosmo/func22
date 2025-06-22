
import React, { useState, useEffect } from 'react';
import AgentConfig from './AgentConfig';
import ChatInterface from './ChatInterface';
import PublishAgent from './PublishAgent';
import SubscriptionPlans from './SubscriptionPlans';
import { Bot, MessageSquare, Sparkles, Rocket, Crown } from 'lucide-react';
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
  const [currentStep, setCurrentStep] = useState<'configure' | 'test' | 'publish'>('configure');
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

  const handleStepChange = (step: 'configure' | 'test' | 'publish') => {
    if (step === 'test' && !isConfigured) {
      return; // Não permite avançar sem configuração básica
    }
    if (step === 'publish' && !subscription.isSubscribed) {
      setShowUpgradeModal(true);
      return;
    }
    setCurrentStep(step);
  };

  const steps = [
    { id: 'configure', name: '1. Configurar', icon: Bot, available: true },
    { id: 'test', name: '2. Testar', icon: MessageSquare, available: isConfigured },
    { id: 'publish', name: '3. Publicar', icon: Rocket, available: isConfigured }
  ];

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

      {/* Progress Steps */}
      <div className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-center space-x-8 mb-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = steps.findIndex(s => s.id === currentStep) > index;
            const isAvailable = step.available;
            
            return (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => handleStepChange(step.id as any)}
                  disabled={!isAvailable}
                  className={`flex items-center space-x-3 px-6 py-3 rounded-xl transition-all ${
                    isActive 
                      ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white shadow-lg scale-105' 
                      : isCompleted
                        ? 'bg-green-100 text-green-700'
                        : isAvailable
                          ? 'bg-white text-gray-700 hover:bg-gray-50 shadow-sm'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{step.name}</span>
                </button>
                {index < steps.length - 1 && (
                  <div className="w-8 h-0.5 bg-gray-300 mx-4" />
                )}
              </div>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="grid lg:grid-cols-1 gap-8">
          {currentStep === 'configure' && (
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
                {isConfigured && (
                  <div className="mt-6 flex justify-end">
                    <Button 
                      onClick={() => setCurrentStep('test')}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                    >
                      Próximo: Testar Agente
                      <MessageSquare className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {currentStep === 'test' && (
            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="bg-white rounded-2xl shadow-xl border border-gray-200/50">
                <div className="p-6 bg-gradient-to-r from-pink-500 to-rose-500">
                  <div className="flex items-center space-x-3">
                    <MessageSquare className="h-6 w-6 text-white" />
                    <h2 className="text-xl font-semibold text-white">Teste seu Agente</h2>
                  </div>
                  <p className="text-pink-100 mt-2">Converse e veja como ele responde</p>
                </div>
                <div className="h-[500px]">
                  <ChatInterface agentData={agentData} />
                </div>
              </Card>

              <Card className="bg-white rounded-2xl shadow-xl border border-gray-200/50">
                <div className="p-6 bg-gradient-to-r from-green-500 to-emerald-600">
                  <div className="flex items-center space-x-3">
                    <Sparkles className="h-6 w-6 text-white" />
                    <h2 className="text-xl font-semibold text-white">Próximo Passo</h2>
                  </div>
                  <p className="text-green-100 mt-2">Pronto para conectar ao WhatsApp?</p>
                </div>
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    <div className="text-6xl">🚀</div>
                    <h3 className="text-xl font-semibold text-gray-900">Agente Configurado!</h3>
                    <p className="text-gray-600">
                      Seu agente está funcionando perfeitamente. Agora você pode publicá-lo e conectá-lo ao WhatsApp para atender seus clientes automaticamente.
                    </p>
                    <div className="space-y-3 pt-4">
                      <Button
                        onClick={() => handleStepChange('publish')}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3"
                      >
                        <Rocket className="h-5 w-5 mr-2" />
                        Publicar e Conectar ao WhatsApp
                      </Button>
                      {!subscription.isSubscribed && (
                        <p className="text-sm text-gray-500">
                          💡 Conectar ao WhatsApp requer um plano pago
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
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
