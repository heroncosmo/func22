import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import AgentConfig from './AgentConfig';
import WhatsAppSimulator from './WhatsAppSimulator';
import PublishAgent from './PublishAgent';
import SubscriptionPlans from './SubscriptionPlans';
import CalibrationChat from './CalibrationChat';
import ConfigurationEditor from './ConfigurationEditor';
import { Bot, Menu, Plus, Send, Smartphone, Share, Crown, Settings, X, CreditCard, QrCode, MessageSquare, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

// Importa os dados de templates
import BUSINESS_TEMPLATES from '@/data/base_conhecimento_funcionario_ia.json';

type BusinessType = keyof typeof BUSINESS_TEMPLATES.tipos_negocio;

export interface AgentData {
  businessName: string;
  businessType: string;
  businessInfo: string;
  personality: string;
  welcomeMessage: string;
  template: string;
  workingHours: string;
  services: string;
  location: string;
  paymentMethods: string;
  contactPhone: string;
  // Novos campos para estabelecimentos que entregam
  hasDelivery?: boolean;
  deliveryFee?: string;
  acceptsReservations?: boolean;
  deliveryArea?: string;
}

export interface SubscriptionState {
  isSubscribed: boolean;
  plan: 'free' | 'starter' | 'pro' | 'enterprise';
  features: string[];
}

interface PaymentData {
  plan: string;
  price: number;
  method: 'pix' | 'card';
  cardNumber?: string;
  cardName?: string;
  cardExpiry?: string;
  cardCvv?: string;
}

const MonetizedAgentBuilder = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Ler parâmetros da URL
  const urlTipo = searchParams.get('tipo') || 'loja';
  const urlNome = searchParams.get('nome');
  const urlCustom = searchParams.get('custom');
  
  // Decodificar dados personalizados
  const customData = urlCustom ? JSON.parse(decodeURIComponent(urlCustom)) : null;

  // NOVA LÓGICA: Verificar se já existe configuração salva
  const [hasExistingConfig, setHasExistingConfig] = useState(false);
  const [showReconfigurePrompt, setShowReconfigurePrompt] = useState(false);
  const [existingConfigData, setExistingConfigData] = useState<any>(null);

  const [currentStep, setCurrentStep] = useState<'configure' | 'publish'>('configure');
  const [agentData, setAgentData] = useState<AgentData>(() => {
    // Verificar se há dados salvos na sessão
    const savedData = sessionStorage.getItem('functionarioIA_data');
    
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        // Verificar se é uma configuração válida (tem nome e tipo de negócio)
        if (parsedData.businessName && parsedData.businessType && 
            parsedData.businessName.trim() !== '' && 
            parsedData.businessName !== 'A ser definido' &&
            parsedData.businessName !== 'Meu Negócio' &&
            parsedData.businessName !== 'Minha Empresa') {
          
          setHasExistingConfig(true);
          setExistingConfigData(parsedData);
          
          // Se veio com parâmetros na URL (tipo, nome, custom), mostrar prompt de reconfiguração
          if (urlTipo || urlNome || urlCustom) {
            setShowReconfigurePrompt(true);
          }
          
          console.log('🔧 Configuração existente encontrada:', parsedData);
          return parsedData;
        }
      } catch (e) {
        console.error('Erro ao carregar dados salvos:', e);
      }
    }

    // Se não há dados salvos ou são inválidos, usar lógica original
    const businessType = (Object.keys(BUSINESS_TEMPLATES.tipos_negocio).includes(urlTipo) ? urlTipo : 'loja') as BusinessType;
    const templateData = BUSINESS_TEMPLATES.tipos_negocio[businessType];
    
    const initialData = {
      businessName: urlNome || templateData.configuracao_padrao.servicos,
      businessType: businessType,
      businessInfo: `Especializado em ${urlNome || templateData.profissoes.join(', ')}.`,
      personality: "amigável e profissional",
      welcomeMessage: `Olá! Bem-vindo(a) ao ${urlNome || 'nosso estabelecimento'}. Como posso ajudar?`,
      template: businessType,
      workingHours: templateData.configuracao_padrao.horarios,
      services: templateData.exemplos_uso.join(', '),
      location: "A ser definido",
      paymentMethods: templateData.configuracao_padrao.pagamentos,
      contactPhone: "A ser definido",
      hasDelivery: templateData.configuracao_padrao.delivery,
      acceptsReservations: templateData.configuracao_padrao.agendamento,
      deliveryArea: "A ser definido",
    };
    
    console.log('🎯 MonetizedAgentBuilder - dados iniciais personalizados:', initialData);
    return initialData;
  });

  const [subscription, setSubscription] = useState<SubscriptionState>({
    isSubscribed: false,
    plan: 'free',
    features: ['Teste limitado', 'Suporte básico']
  });

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showWhatsAppTest, setShowWhatsAppTest] = useState(false);
  const [showConnectWhatsApp, setShowConnectWhatsApp] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [paymentData, setPaymentData] = useState<PaymentData>({
    plan: '',
    price: 0,
    method: 'pix'
  });
  
  // Detectar se é mobile e controlar sidebar
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // Estados para promoção com countdown
  const [couponApplied, setCouponApplied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutos em segundos

  // Efeito para listeners e detecção de dispositivo
  useEffect(() => {
    const checkDevice = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    
        // Event Listeners para ações do chat
    const handleConnectWhatsAppEvent = (event: any) => {
      handleConnectWhatsApp();
    };

    const handlePaymentModalEvent = (event: any) => {
      if (event.detail?.plan) {
        setSelectedPlan(event.detail.plan);
        setPaymentData({
          plan: event.detail.plan.name,
          price: event.detail.plan.price,
          method: 'pix'
        });
        setShowPaymentModal(true);
        // Resetar timer quando abrir modal
        setTimeLeft(15 * 60);
        setCouponApplied(false);
      }
    };

    // NOVO: Event listener para modal de upgrade
    const handleUpgradeModalEvent = (event: any) => {
      console.log('🔥 Evento openUpgradeModal recebido:', event.detail);
      setShowUpgradeModal(true);
    };
    
    window.addEventListener('connectWhatsApp', handleConnectWhatsAppEvent);
    window.addEventListener('openPaymentModal', handlePaymentModalEvent);
    window.addEventListener('openUpgradeModal', handleUpgradeModalEvent);
    
    return () => {
      window.removeEventListener('resize', checkDevice);
      window.removeEventListener('connectWhatsApp', handleConnectWhatsAppEvent);
      window.removeEventListener('openPaymentModal', handlePaymentModalEvent);
      window.removeEventListener('openUpgradeModal', handleUpgradeModalEvent);
    };
  }, []);

  // Countdown timer
  useEffect(() => {
    if (showPaymentModal && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [showPaymentModal, timeLeft]);

  // Formatar tempo do countdown
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Aplicar cupom de desconto
  const applyCoupon = () => {
    if (selectedPlan && !couponApplied) {
      setCouponApplied(true);
      setPaymentData(prev => ({
        ...prev,
        price: selectedPlan.price - selectedPlan.discount
      }));
    }
  };

  // NOVAS FUNÇÕES PARA RECONFIGURAÇÃO
  const handleReconfigureYes = () => {
    // Limpar dados salvos e iniciar nova configuração
    sessionStorage.removeItem('functionarioIA_data');
    setShowReconfigurePrompt(false);
    setHasExistingConfig(false);
    
    // Carregar nova configuração baseada nos parâmetros da URL
    const businessType = (Object.keys(BUSINESS_TEMPLATES.tipos_negocio).includes(urlTipo) ? urlTipo : 'loja') as BusinessType;
    const templateData = BUSINESS_TEMPLATES.tipos_negocio[businessType];
    
    const newData = {
      businessName: urlNome || templateData.configuracao_padrao.servicos,
      businessType: businessType,
      businessInfo: `Especializado em ${urlNome || templateData.profissoes.join(', ')}.`,
      personality: "amigável e profissional",
      welcomeMessage: `Olá! Bem-vindo(a) ao ${urlNome || 'nosso estabelecimento'}. Como posso ajudar?`,
      template: businessType,
      workingHours: templateData.configuracao_padrao.horarios,
      services: templateData.exemplos_uso.join(', '),
      location: "A ser definido",
      paymentMethods: templateData.configuracao_padrao.pagamentos,
      contactPhone: "A ser definido",
      hasDelivery: templateData.configuracao_padrao.delivery,
      acceptsReservations: templateData.configuracao_padrao.agendamento,
      deliveryArea: "A ser definido",
    };
    
    setAgentData(newData);
    
    // Trigger reconfiguração no chat
    const reconfigEvent = new CustomEvent('startReconfiguration', {
      detail: { 
        businessType: businessType,
        businessName: urlNome,
        customData: customData
      }
    });
    window.dispatchEvent(reconfigEvent);
  };

  const handleReconfigureNo = () => {
    setShowReconfigurePrompt(false);
    // Manter configuração existente, apenas mostrar opções de editar/conectar/assinar
    const keepConfigEvent = new CustomEvent('keepExistingConfig', {
      detail: { 
        existingData: existingConfigData
      }
    });
    window.dispatchEvent(keepConfigEvent);
  };

  const handleAgentUpdate = (newData: Partial<AgentData>) => {
    setAgentData(prev => ({ ...prev, ...newData }));
  };

  const handleTestWhatsApp = () => {
    // Forçar abertura do WhatsApp simulador no chat
    const testEvent = new CustomEvent('testButtonClicked', {
      detail: { 
        message: 'quero testar o whatsapp simulador agora',
        forceWhatsApp: true 
      }
    });
    window.dispatchEvent(testEvent);
  };

  const handleConnectWhatsApp = () => {
    if (!subscription.isSubscribed) {
      setShowConnectWhatsApp(true);
      return;
    }
    // Se já tem assinatura, conectar diretamente
    openWhatsAppSupport("Olá! Quero conectar meu FuncionárioPro ao WhatsApp. Já tenho uma assinatura ativa.");
  };

  const handlePublish = () => {
    if (!subscription.isSubscribed) {
      setShowUpgradeModal(true);
      return;
    }
    setCurrentStep('publish');
  };

  // Função para abrir WhatsApp com mensagem personalizada
  const openWhatsAppSupport = (message: string) => {
    const whatsappUrl = `https://wa.me/551132300474?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Gerar QR Code PIX
  const generatePixQRCode = (value: number) => {
    const pixKey = "17991610665"; // Sua chave PIX
    const merchantName = "FuncionárioPro";
    const merchantCity = "SAO PAULO";
    const txId = Math.random().toString(36).substring(7);
    
    // QR Code seria gerado aqui - por enquanto retorna URL de exemplo
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PIX:${pixKey}:${value}:${txId}`;
  };

  const plans = [
    {
      name: 'Mensal',
      price: 49.90,
      originalPrice: 59.90,
      discount: 10.00,
      coupon: 'FUNCIONARIO10',
      features: [
        'Atendimento automático 24h',
        'Respostas inteligentes personalizadas',
        'Integração completa WhatsApp',
        'Até 1.000 mensagens/mês',
        'Configuração ilimitada',
        'Suporte prioritário'
      ],
      description: 'Ideal para pequenos e médios negócios',
      limitations: 'Até 1.000 mensagens por mês'
    },
    {
      name: 'Anual (12 meses)', 
      price: 499.00,
      originalPrice: 599.00,
      discount: 100.00,
      coupon: 'FUNCIONARIO100',
      monthlyEquivalent: 41.58,
      features: [
        'Atendimento automático 24h',
        'Respostas inteligentes personalizadas',
        'Integração completa WhatsApp',
        'Mensagens ILIMITADAS',
        'Configuração ilimitada',
        'Suporte VIP prioritário',
        '2 meses GRÁTIS'
      ],
      description: 'Melhor custo-benefício - 2 meses grátis',
      limitations: 'Ilimitado',
      popular: true
    }
  ];

  const handleSelectPlan = (plan: any) => {
    setSelectedPlan(plan);
    setPaymentData({
      plan: plan.name,
      price: plan.price,
      method: 'pix'
    });
    setShowPaymentModal(true);
    setShowConnectWhatsApp(false);
    setShowUpgradeModal(false);
    // Resetar estados de promoção
    setTimeLeft(15 * 60);
    setCouponApplied(false);
  };

  const handlePaymentSubmit = () => {
    if (paymentData.method === 'pix') {
      // Processar PIX
      alert(`PIX de R$ ${paymentData.price} gerado! Após o pagamento seu plano será ativado automaticamente.`);
      // Simular ativação da assinatura
      setTimeout(() => {
        setSubscription({
          isSubscribed: true,
          plan: paymentData.plan.toLowerCase() as any,
          features: selectedPlan.features
        });
        setShowPaymentModal(false);
        setShowUpgradeModal(false);
        setShowConnectWhatsApp(false);
      }, 2000);
    } else {
      // Simular erro no cartão
      alert('Erro no processamento do cartão. Entre em contato com o suporte para assistência.');
      openWhatsAppSupport("Olá! Tive um erro ao tentar pagar com cartão no FuncionárioPro. Preciso de ajuda.");
    }
  };

  return (
    <div className="h-screen bg-gray-50 flex" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
      {/* Sidebar Desktop - Estilo ChatGPT */}
      {!isMobile && (
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
          {/* Header da Sidebar */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 bg-black rounded-md flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-semibold text-gray-900">FuncionárioPro</span>
            </div>
          </div>
          
          {/* Status do Plano - SEM PALAVRA STATUS */}
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex-shrink-0">
            <div className="p-3 rounded-lg bg-white border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-gray-900">
                  {subscription.isSubscribed ? subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1) : 'Gratuito'}
                </div>
                <div className={`w-2 h-2 rounded-full ${
                  subscription.isSubscribed ? 'bg-gray-900' : 'bg-gray-400'
                }`}></div>
              </div>
              <div className="text-xs text-gray-600 mb-3">
                {subscription.features[0]}
              </div>
              {!subscription.isSubscribed && (
                <button 
                  onClick={() => setShowUpgradeModal(true)}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  Fazer upgrade →
                </button>
              )}
            </div>
          </div>
          
          {/* Área de Configuração */}
          <div className="flex-1 overflow-hidden">
            <ConfigurationEditor 
              agentData={agentData}
              onAgentUpdate={handleAgentUpdate}
            />
          </div>

          {/* Suporte WhatsApp - Desktop */}
          <div className="p-4 border-t border-gray-200">
            <a
              href="https://wa.me/551132300474?text=Olá%2C%20preciso%20de%20ajuda%20com%20o%20FuncionárioPro"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-black hover:bg-gray-800 text-white text-sm rounded-lg transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              Suporte WhatsApp
            </a>
          </div>
        </div>
      )}

      {/* Sidebar Mobile - Overlay */}
      {isMobile && showMobileSidebar && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowMobileSidebar(false)}></div>
          <div className="fixed inset-y-0 left-0 w-80 bg-white shadow-xl flex flex-col">
            {/* Header da Sidebar Mobile */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 bg-black rounded-md flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-semibold text-gray-900">FuncionárioPro</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowMobileSidebar(false)}
                className="p-2"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Status do Plano Mobile */}
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex-shrink-0">
              <div className="p-3 rounded-lg bg-white border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-gray-900">
                    {subscription.isSubscribed ? subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1) : 'Gratuito'}
                  </div>
                  <div className={`w-2 h-2 rounded-full ${
                    subscription.isSubscribed ? 'bg-gray-900' : 'bg-gray-400'
                  }`}></div>
                </div>
                <div className="text-xs text-gray-600 mb-3">
                  {subscription.features[0]}
                </div>
                {!subscription.isSubscribed && (
                  <button 
                    onClick={() => {
                      setShowUpgradeModal(true);
                      setShowMobileSidebar(false);
                    }}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    Fazer upgrade →
                  </button>
                )}
              </div>
            </div>
            
            {/* Configuração Mobile */}
            <div className="flex-1 overflow-hidden">
              <ConfigurationEditor 
                agentData={agentData}
                onAgentUpdate={handleAgentUpdate}
              />
            </div>

            {/* Suporte WhatsApp - Mobile */}
            <div className="p-4 border-t border-gray-200">
              <a
                href="https://wa.me/551132300474?text=Olá%2C%20preciso%20de%20ajuda%20com%20o%20FuncionárioPro"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-black hover:bg-gray-800 text-white text-sm rounded-lg transition-colors"
                onClick={() => setShowMobileSidebar(false)}
              >
                <MessageSquare className="w-4 h-4" />
                Suporte WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
      
      {/* Área Principal do Chat - Estilo ChatGPT */}
      <div className="flex-1 flex flex-col bg-white relative">
        {/* Header Principal - Design ChatGPT */}
        <div className="border-b border-gray-200 bg-white/95 backdrop-blur-sm sticky top-0 z-40">
          <div className="flex items-center justify-between h-14 px-4">
            <div className="flex items-center space-x-3">
              {isMobile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMobileSidebar(true)}
                  className="p-2"
                >
                  <Menu className="h-5 w-5 text-gray-700" />
                </Button>
              )}
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-black rounded-md flex items-center justify-center">
                  <Bot className="h-3 w-3 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-900">
                  FuncionárioPro
                </span>
              </div>
            </div>
            
            {/* Botões de Ação - Mobile Style */}
            <div className="flex items-center space-x-2">
              {isMobile ? (
                <>
                  {/* Mobile - Apenas ícones */}
                  <Button
                    onClick={handleTestWhatsApp}
                    variant="outline"
                    size="sm"
                    title="Testar funcionamento"
                    className="border-gray-300 hover:border-gray-400 text-gray-700 h-8 w-8 p-0 rounded-md transition-all duration-200"
                  >
                    <Smartphone className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    onClick={handleConnectWhatsApp}
                    size="sm"
                    title="Conectar WhatsApp"
                    className="bg-black hover:bg-gray-800 text-white h-8 w-8 p-0 rounded-md transition-all duration-200"
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  {/* Desktop - Com texto */}
              <Button
                onClick={handleTestWhatsApp}
                variant="outline"
                size="sm"
                className="border-gray-300 hover:border-gray-400 text-gray-700 h-8 text-xs px-3 rounded-md font-medium transition-all duration-200"
              >
                <Smartphone className="h-3 w-3 mr-1.5" />
                Testar
              </Button>
              
              <Button
                onClick={handleConnectWhatsApp}
                size="sm"
                className="bg-black hover:bg-gray-800 text-white h-8 text-xs px-3 rounded-md font-medium transition-all duration-200"
              >
                <MessageSquare className="h-3 w-3 mr-1.5" />
                Conectar WhatsApp
              </Button>
                </>
              )}

              {/* Indicador de Status */}
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full ${
                  subscription.isSubscribed ? 'bg-gray-900' : 'bg-gray-400'
                } animate-pulse`}></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Chat Interface - Protagonista */}
        <div className="flex-1 overflow-hidden">
          <CalibrationChat 
            agentData={agentData} 
            onAgentUpdate={handleAgentUpdate}
            autoStartBusinessType={urlTipo}
            specificBusinessName={urlNome || undefined}
            customData={customData}
          />
        </div>
        

      </div>

      {/* Modal de Conectar WhatsApp */}
      {showConnectWhatsApp && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowConnectWhatsApp(false)}
        >
          <div 
            className="bg-white rounded-xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Conectar ao WhatsApp
                  </h2>
                  <p className="text-gray-600 mt-1 text-sm">
                    Para conectar, você precisa de uma assinatura ativa
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  onClick={() => setShowConnectWhatsApp(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {plans.map((plan, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-gray-400 cursor-pointer transition-colors"
                       onClick={() => handleSelectPlan(plan)}>
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                        <p className="text-sm text-gray-600">{plan.description}</p>
                        {plan.popular && (
                          <span className="inline-block mt-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                            Mais Popular
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        {plan.monthlyEquivalent && (
                          <div className="text-xs text-gray-500 line-through">
                            R$ {plan.originalPrice.toFixed(2)}
                          </div>
                        )}
                        <div className="text-2xl font-bold text-gray-900">
                          R$ {plan.price.toFixed(2)}
                        </div>
                        {plan.monthlyEquivalent ? (
                          <div className="text-sm text-gray-600">
                            R$ {plan.monthlyEquivalent.toFixed(2)}/mês
                          </div>
                        ) : (
                          <div className="text-sm text-gray-600">/mês</div>
                        )}
                      </div>
                    </div>
                    <div className="mt-2">
                      <ul className="text-xs text-gray-600 space-y-1">
                        {plan.features.map((feature, idx) => (
                          <li key={idx}>✓ {feature}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Pagamento */}
      {showPaymentModal && selectedPlan && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowPaymentModal(false)}
        >
          <div 
            className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Pagamento - {selectedPlan.name}
                  </h2>
                  <p className="text-gray-600 mt-1 text-sm">
                    R$ {selectedPlan.price}/mês
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  onClick={() => setShowPaymentModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <div className="p-6">
              {/* Oferta Especial com Countdown - Versão Sutil */}
              {timeLeft > 0 && (
                <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600 text-sm">🔥</span>
                      <span className="text-sm font-medium text-gray-800">Oferta especial</span>
                      <span className="text-xs text-gray-600 font-mono bg-gray-100 px-2 py-0.5 rounded">
                        {formatTime(timeLeft)}
                      </span>
                    </div>
                    {!couponApplied ? (
                      <button
                        onClick={applyCoupon}
                        className="text-xs bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded-md font-medium transition-colors"
                      >
                        R$ {selectedPlan?.discount?.toFixed(2)} OFF
                      </button>
                    ) : (
                      <span className="text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded">
                        ✓ Desconto aplicado
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Resumo do Pedido */}
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Resumo do Pedido</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Plano {selectedPlan?.name}</span>
                    <span>R$ {selectedPlan?.originalPrice?.toFixed(2)}</span>
                  </div>
                                      {couponApplied && (
                      <div className="flex justify-between text-gray-600">
                        <span>Desconto ({selectedPlan?.coupon})</span>
                        <span>-R$ {selectedPlan?.discount?.toFixed(2)}</span>
                      </div>
                    )}
                  <div className="border-t pt-1 flex justify-between font-semibold">
                    <span>Total</span>
                    <span>R$ {paymentData.price.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {/* Escolher método de pagamento */}
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">
                    Método de Pagamento
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setPaymentData(prev => ({ ...prev, method: 'pix' }))}
                      className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                        paymentData.method === 'pix' ? 'border-gray-500 bg-gray-50 text-gray-700' : 'border-gray-300'
                      }`}
                    >
                      <QrCode className="h-4 w-4 mx-auto mb-1" />
                      PIX
                    </button>
                    <button
                      onClick={() => setPaymentData(prev => ({ ...prev, method: 'card' }))}
                      className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                        paymentData.method === 'card' ? 'border-gray-500 bg-gray-50 text-gray-700' : 'border-gray-300'
                      }`}
                    >
                      <CreditCard className="h-4 w-4 mx-auto mb-1" />
                      Cartão
                    </button>
                  </div>
                </div>

                {/* PIX - Checkout Profissional */}
                {paymentData.method === 'pix' && (
                  <div className="space-y-4">
                    {/* Cabeçalho PIX */}
                    <div className="flex items-center gap-2 pb-2 border-b">
                      <QrCode className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-900">Pagamento via PIX</span>
                    </div>
                    
                    {/* QR Code e Instruções */}
                    <div className="bg-gray-50 border rounded-lg p-4">
                      <div className="text-center mb-4">
                        <img 
                          src={generatePixQRCode(selectedPlan.price)} 
                          alt="QR Code PIX" 
                          className="mx-auto mb-3 rounded-lg shadow-sm"
                          style={{ maxWidth: '160px' }}
                        />
                        <p className="text-xs text-gray-600 mb-2">
                          Escaneie o código com seu app bancário
                        </p>
                      </div>
                      
                      {/* Chave PIX */}
                      <div className="bg-white rounded-md border p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Chave PIX (telefone)</p>
                            <p className="font-mono text-sm font-medium">17 99161-0665</p>
                          </div>
                          <button 
                            onClick={() => navigator.clipboard.writeText('17991610665')}
                            className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
                          >
                            Copiar
                          </button>
                        </div>
                      </div>
                      
                      {/* Valor */}
                      <div className="mt-3 text-center">
                        <p className="text-xs text-gray-500">Valor a pagar</p>
                        <p className="text-lg font-bold text-gray-900">R$ {paymentData.price.toFixed(2)}</p>
                      </div>
                    </div>
                    
                    {/* Segurança */}
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <div className="w-3 h-3 bg-gray-500 rounded-full flex items-center justify-center">
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                      </div>
                      <span>Pagamento seguro • Confirmação automática</span>
                    </div>
                    
                    <Button 
                      onClick={handlePaymentSubmit}
                      className="w-full bg-black hover:bg-gray-800 text-white h-11"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Confirmar Pagamento PIX
                    </Button>
                  </div>
                )}

                {/* Cartão - Checkout Profissional */}
                {paymentData.method === 'card' && (
                  <div className="space-y-4">
                    {/* Cabeçalho Cartão */}
                    <div className="flex items-center gap-2 pb-2 border-b">
                      <CreditCard className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-900">Cartão de Crédito</span>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-gray-700 block mb-1">Número do Cartão</label>
                        <Input
                          placeholder="1234 5678 9012 3456"
                          value={paymentData.cardNumber || ''}
                          onChange={(e) => setPaymentData(prev => ({ ...prev, cardNumber: e.target.value }))}
                          className="h-10"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700 block mb-1">Nome no Cartão</label>
                        <Input
                          placeholder="Como está no cartão"
                          value={paymentData.cardName || ''}
                          onChange={(e) => setPaymentData(prev => ({ ...prev, cardName: e.target.value }))}
                          className="h-10"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-medium text-gray-700 block mb-1">Validade</label>
                          <Input
                            placeholder="MM/AA"
                            value={paymentData.cardExpiry || ''}
                            onChange={(e) => setPaymentData(prev => ({ ...prev, cardExpiry: e.target.value }))}
                            className="h-10"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-700 block mb-1">CVV</label>
                          <Input
                            placeholder="123"
                            value={paymentData.cardCvv || ''}
                            onChange={(e) => setPaymentData(prev => ({ ...prev, cardCvv: e.target.value }))}
                            className="h-10"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Segurança */}
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <div className="w-3 h-3 bg-gray-500 rounded-full flex items-center justify-center">
                        <div className="w-1 h-1 bg-white rounded-full"></div>
                      </div>
                      <span>Dados protegidos por SSL • Transação segura</span>
                    </div>
                    
                    <Button 
                      onClick={handlePaymentSubmit}
                      className="w-full bg-black hover:bg-gray-800 text-white h-11"
                      disabled={!paymentData.cardNumber || !paymentData.cardName || !paymentData.cardExpiry || !paymentData.cardCvv}
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Pagar R$ {paymentData.price.toFixed(2)}
                    </Button>
                    
                    <p className="text-xs text-gray-500 text-center">
                      Suporte: <a href="https://wa.me/551132300474" className="text-gray-600 hover:underline">WhatsApp</a>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Reconfiguração */}
      {showReconfigurePrompt && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowReconfigurePrompt(false)}
        >
          <div 
            className="bg-white rounded-xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Configuração Detectada
                  </h2>
                  <p className="text-gray-600 mt-1 text-sm">
                    Você já tem um estabelecimento configurado
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Configuração Atual:</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><strong>Nome:</strong> {existingConfigData?.businessName}</p>
                  <p><strong>Tipo:</strong> {existingConfigData?.businessType}</p>
                  <p><strong>WhatsApp:</strong> {existingConfigData?.contactPhone || 'Não configurado'}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <p className="text-sm text-gray-700">
                  Você quer configurar novamente ou manter sua configuração atual?
                </p>
                
                <div className="space-y-2">
                  <Button 
                    onClick={handleReconfigureYes}
                    className="w-full bg-black hover:bg-gray-800 text-white"
                  >
                    Sim, configurar novamente
                  </Button>
                  
                  <Button 
                    onClick={handleReconfigureNo}
                    variant="outline"
                    className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Não, manter configuração atual
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Upgrade */}
      {showUpgradeModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowUpgradeModal(false)}
        >
          <div 
            className="bg-white rounded-xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Fazer Upgrade
                  </h2>
                  <p className="text-gray-600 mt-1 text-sm">
                    Libere recursos avançados para seu negócio
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  onClick={() => setShowUpgradeModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {plans.map((plan, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-gray-400 cursor-pointer transition-colors"
                        onClick={() => handleSelectPlan(plan)}>
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                        <p className="text-sm text-gray-600">{plan.description}</p>
                        {plan.popular && (
                          <span className="inline-block mt-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                            Mais Popular
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        {plan.monthlyEquivalent && (
                          <div className="text-xs text-gray-500 line-through">
                            R$ {plan.originalPrice.toFixed(2)}
                          </div>
                        )}
                        <div className="text-2xl font-bold text-gray-900">
                          R$ {plan.price.toFixed(2)}
                        </div>
                        {plan.monthlyEquivalent ? (
                          <div className="text-sm text-gray-600">
                            R$ {plan.monthlyEquivalent.toFixed(2)}/mês
                          </div>
                        ) : (
                          <div className="text-sm text-gray-600">/mês</div>
                        )}
                          </div>
                      </div>
                    <div className="mt-2">
                      <ul className="text-xs text-gray-600 space-y-1">
                        {plan.features.map((feature, idx) => (
                          <li key={idx}>✓ {feature}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
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