import React, { useState, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import { Send, Bot, User, X, Edit, MessageSquare } from 'lucide-react';
import { MISTRAL_CONFIG } from '../config/mistral-config.js';
import InlineFieldInput from './InlineFieldInput';
import WhatsAppSimulator from './WhatsAppSimulator';
import LandingPage from './LandingPage';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  type?: 'text' | 'whatsapp' | 'field' | 'completion';
  fieldData?: any;
}

interface AgentData {
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
  hasDelivery?: boolean;
  deliveryFee?: string;
  acceptsReservations?: boolean;
  deliveryArea?: string;
}

interface CalibrationChatProps {
  agentData: AgentData;
  onAgentUpdate: (updates: Partial<AgentData>) => void;
}

// CONFIGURAÇÃO ÚNICA SEM DUPLICAÇÕES
const CONFIG_FIELDS = [
  {
    step: 'businessName',
    title: 'Nome',
    question: 'Qual é o nome do seu negócio?',
    fieldType: 'text',
    placeholder: 'Ex: Amor Pizzaria'
  },
  {
    step: 'contactPhone',
    title: 'WhatsApp',
    question: 'Qual seu WhatsApp?',
    fieldType: 'phone',
    placeholder: 'Ex: 11999887766'
  },
  {
    step: 'location',
    title: 'Endereço',
    question: 'Qual o endereço?',
    fieldType: 'textarea',
    placeholder: 'Ex: Rua das Flores, 123 - Centro'
  },
  {
    step: 'workingHours',
    title: 'Horários',
    question: 'Horários de funcionamento?',
    fieldType: 'textarea',
    placeholder: 'Ex: Seg-Sex: 8h-18h'
  },
  {
    step: 'services',
    title: 'Produtos/Serviços',
    question: 'O que você oferece?',
    fieldType: 'textarea',
    placeholder: 'Ex: Pizza Margherita R$25, Calabresa R$30'
  },
  {
    step: 'paymentMethods',
    title: 'Pagamento',
    question: 'Formas de pagamento?',
    fieldType: 'text',
    placeholder: 'Ex: PIX, Cartão, Dinheiro'
  },
  {
    step: 'hasDelivery',
    title: 'Entrega',
    question: 'Faz entrega?',
    fieldType: 'buttons',
    options: [
      { value: 'true', label: '✅ Sim' },
      { value: 'false', label: '❌ Não' }
    ]
  },
  {
    step: 'acceptsReservations',
    title: 'Agendamento',
    question: 'Aceita agendamentos?',
    fieldType: 'buttons',
    options: [
      { value: 'true', label: '✅ Sim' },
      { value: 'false', label: '❌ Não' }
    ]
  }
];

// SISTEMA DE CONHECIMENTO COMPLETO - FuncionarioPro
const SISTEMA_CONHECIMENTO = {
  nome: "FuncionarioPro",
  descricao: "Seu atendente virtual premium, treinado pra responder clientes, agendar, vender e aumentar sua receita — tudo 100% automático, no WhatsApp. Configure em 2 minutos, personalize pra qualquer nicho e comece a vender enquanto você dorme.",
  whatsapp_suporte: "+551132300474",
  link_whatsapp_suporte: "https://wa.me/551132300474?text=Olá%2C%20preciso%20de%20ajuda%20com%20o%20FuncionarioPro",
  
  planos: {
    mensal: {
      nome: "Plano Mensal",
      preco: "R$ 49,90",
      preco_original: "R$ 59,90",
      desconto_cupom: "R$ 10,00",
      cupom: "FUNCIONARIO10",
      beneficios: [
        "Atendimento automático 24h",
        "Respostas inteligentes personalizadas",
        "Integração completa WhatsApp",
        "Até 1.000 mensagens/mês",
        "Configuração ilimitada",
        "Suporte prioritário"
      ],
      limitacoes: "Até 1.000 mensagens por mês"
    },
    anual: {
      nome: "Plano Anual (12 meses)",
      preco: "R$ 499,00",
      preco_original: "R$ 599,00",
      desconto_cupom: "R$ 100,00",
      cupom: "FUNCIONARIO100",
      preco_mensal_equivalente: "R$ 41,58/mês",
      beneficios: [
        "Atendimento automático 24h",
        "Respostas inteligentes personalizadas", 
        "Integração completa WhatsApp",
        "Mensagens ILIMITADAS",
        "Configuração ilimitada",
        "Suporte VIP prioritário",
        "2 meses GRÁTIS"
      ],
      limitacoes: "Ilimitado"
    }
  },

  funcionalidades: [
    "Atendimento automático 24 horas por dia",
    "Respostas inteligentes e personalizadas",
    "Agendamento automático de consultas/serviços", 
    "Sistema de vendas automatizado",
    "Integração nativa com WhatsApp",
    "Configuração em menos de 2 minutos",
    "Personalização para qualquer nicho de negócio",
    "Suporte a delivery e retirada",
    "Gestão de horários de funcionamento",
    "Catálogo de produtos/serviços integrado"
  ],

  casos_uso: [
    {
      area: "Restaurantes e Delivery",
      beneficios: "Pedidos automáticos, cardápio digital, confirmação de entrega",
      resultado: "Aumento de 300% nos pedidos noturnos"
    },
    {
      area: "Clínicas e Consultórios", 
      beneficios: "Agendamento automático, confirmação de consultas, lembretes",
      resultado: "Redução de 80% no tempo de atendimento"
    },
    {
      area: "Salões de Beleza",
      beneficios: "Agendamento por especialidade, catálogo de serviços, confirmações",
      resultado: "Aumento de 250% na ocupação da agenda"
    },
    {
      area: "Lojas e E-commerce",
      beneficios: "Catálogo automatizado, processamento de pedidos, suporte a vendas",
      resultado: "Crescimento de 400% nas vendas online"
    }
  ],

  diferenciais: [
    "100% Personalizado para seu negócio",
    "Respostas Inteligentes com IA avançada", 
    "Mais Vendas garantidas automaticamente",
    "Configuração ultra-rápida (2 minutos)",
    "Sem necessidade de conhecimento técnico",
    "Funciona 24h mesmo quando você dorme",
    "Integração nativa WhatsApp (não é bot)"
  ]
};

// TEMPLATES MINIMALISTAS
const TEMPLATES = {
  restaurante: {
    icon: '🍕',
    title: 'Restaurante',
    businessType: 'restaurante',
    hasDelivery: true,
    acceptsReservations: true,
    personality: 'atencioso e prestativo',
    welcomeMessage: 'Olá! Bem-vindo(a) ao {businessName}! Como posso ajudá-lo(a) hoje?'
  },
  loja: {
    icon: '🏪',
    title: 'Loja',
    businessType: 'loja',
    hasDelivery: false,
    acceptsReservations: false,
    personality: 'amigável e informativo',
    welcomeMessage: 'Olá! Bem-vindo(a) à {businessName}! Posso ajudá-lo(a)?'
  },
  clinica: {
    icon: '🏥',
    title: 'Clínica',
    businessType: 'clinica',
    hasDelivery: false,
    acceptsReservations: true,
    personality: 'profissional e acolhedor',
    welcomeMessage: 'Olá! Bem-vindo(a) à {businessName}! Gostaria de agendar?'
  },
  salao: {
    icon: '💄',
    title: 'Salão',
    businessType: 'salao',
    hasDelivery: false,
    acceptsReservations: true,
    personality: 'carinhoso e atencioso',
    welcomeMessage: 'Olá! Bem-vindo(a) ao {businessName}! Vamos cuidar da sua beleza?'
  },
  oficina: {
    icon: '🔧',
    title: 'Oficina',
    businessType: 'oficina',
    hasDelivery: false,
    acceptsReservations: true,
    personality: 'profissional e confiável',
    welcomeMessage: 'Olá! Bem-vindo(a) à {businessName}! Precisa de serviço?'
  },
  hotel: {
    icon: '🏨',
    title: 'Hotel',
    businessType: 'hotel',
    hasDelivery: false,
    acceptsReservations: true,
    personality: 'hospitaleiro e prestativo',
    welcomeMessage: 'Olá! Bem-vindo(a) ao {businessName}! Posso ajudar com sua reserva?'
  },
  academia: {
    icon: '💪',
    title: 'Academia',
    businessType: 'academia',
    hasDelivery: false,
    acceptsReservations: true,
    personality: 'motivador e energético',
    welcomeMessage: 'Olá! Bem-vindo(a) à {businessName}! Vamos treinar?'
  },
  petshop: {
    icon: '🐕',
    title: 'Pet Shop',
    businessType: 'petshop',
    hasDelivery: true,
    acceptsReservations: true,
    personality: 'carinhoso e atencioso',
    welcomeMessage: 'Olá! Bem-vindo(a) ao {businessName}! Como posso cuidar do seu pet?'
  },
  farmacia: {
    icon: '💊',
    title: 'Farmácia',
    businessType: 'farmacia',
    hasDelivery: true,
    acceptsReservations: false,
    personality: 'profissional e cuidadoso',
    welcomeMessage: 'Olá! Bem-vindo(a) à {businessName}! Precisa de algum medicamento?'
  },
  escola: {
    icon: '📚',
    title: 'Escola',
    businessType: 'escola',
    hasDelivery: false,
    acceptsReservations: true,
    personality: 'educativo e acolhedor',
    welcomeMessage: 'Olá! Bem-vindo(a) à {businessName}! Como posso ajudar?'
  },
  outro: {
    icon: '💼',
    title: 'Outro',
    businessType: 'outro',
    hasDelivery: false,
    acceptsReservations: false,
    personality: 'profissional e atencioso',
    welcomeMessage: 'Olá! Bem-vindo(a) à {businessName}! Como posso ajudá-lo(a)?'
  }
};

interface ConfigData {
  isConfiguring: boolean;
  isShowingField: boolean;
}

const CalibrationChat: React.FC<CalibrationChatProps> = ({ agentData, onAgentUpdate }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTemplates, setShowTemplates] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [configData, setConfigData] = useState<ConfigData>({
    isConfiguring: false,
    isShowingField: false
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // PLACEHOLDER ANIMADO COM EFEITO DE DIGITAÇÃO - Estilo Lovable
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [currentPlaceholder, setCurrentPlaceholder] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  
  const placeholders = [
    "Quero um funcionário para advocacia...",
    "Preciso de atendimento para restaurante...", 
    "Quero automatizar meu salão de beleza...",
    "Preciso de um assistente para clínica...",
    "Quero atendimento 24h para minha loja...",
    "Preciso automatizar minha oficina...",
    "Quero um atendente para pet shop...",
    "Preciso de automação para farmácia..."
  ];

  // Efeito de digitação do placeholder
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const typeText = () => {
      const fullText = placeholders[placeholderIndex];
      let charIndex = 0;
      setCurrentPlaceholder('');
      setIsTyping(true);
      
      const typeChar = () => {
        if (charIndex < fullText.length) {
          setCurrentPlaceholder(fullText.substring(0, charIndex + 1));
          charIndex++;
          timeout = setTimeout(typeChar, 50); // Velocidade de digitação
        } else {
          // Texto completo digitado, aguardar antes de apagar
          timeout = setTimeout(() => {
            eraseText();
          }, 2000); // Tempo para ler
        }
      };
      
      const eraseText = () => {
        setIsTyping(false);
        let eraseIndex = fullText.length;
        
        const eraseChar = () => {
          if (eraseIndex > 0) {
            setCurrentPlaceholder(fullText.substring(0, eraseIndex - 1));
            eraseIndex--;
            timeout = setTimeout(eraseChar, 30); // Velocidade de apagar
          } else {
            // Texto apagado, próximo texto
            setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
            timeout = setTimeout(typeText, 500); // Pausa antes do próximo
          }
        };
        
        eraseChar();
      };
      
      typeChar();
    };
    
    typeText();
    
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [placeholderIndex]);

  // Função para gerar IDs únicos
  const generateUniqueId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Funções helper para mostrar configurações padrão
  const getDefaultHours = (type: string) => {
    const schedules = {
      'clinica': 'Seg-Sex: 8h-18h',
      'restaurante': 'Todos os dias: 11h-23h',
      'salao': 'Ter-Sáb: 9h-19h',
      'oficina': 'Seg-Sex: 8h-18h',
      'loja': 'Seg-Sex: 9h-18h, Sáb: 9h-14h',
      'academia': 'Seg-Sex: 6h-22h, Sáb: 8h-18h',
      'petshop': 'Seg-Sáb: 8h-18h',
      'farmacia': 'Todos os dias: 7h-22h',
      'escola': 'Seg-Sex: 7h-18h'
    };
    return schedules[type] || 'Seg-Sex: 8h-18h';
  };

  const getDefaultServices = (type: string) => {
    const services = {
      'clinica': 'Consultas e tratamentos',
      'restaurante': 'Pratos, lanches e bebidas',
      'salao': 'Cortes, coloração, manicure',
      'oficina': 'Manutenção e reparos',
      'loja': 'Produtos variados',
      'academia': 'Musculação e aulas',
      'petshop': 'Produtos e serviços pet',
      'farmacia': 'Medicamentos e produtos',
      'escola': 'Ensino e atividades'
    };
    return services[type] || 'Produtos e serviços';
  };

  const getDefaultPayments = (type: string) => {
    const payments = {
      'clinica': 'PIX, Cartão, Convênios',
      'restaurante': 'PIX, Cartão, Dinheiro, VR',
      'salao': 'PIX, Cartão, Dinheiro',
      'oficina': 'PIX, Cartão, Dinheiro',
      'loja': 'PIX, Cartão, Dinheiro',
      'academia': 'PIX, Cartão, Débito automático',
      'petshop': 'PIX, Cartão, Dinheiro',
      'farmacia': 'PIX, Cartão, Convênios',
      'escola': 'PIX, Cartão, Boleto'
    };
    return payments[type] || 'PIX, Cartão, Dinheiro';
  };

  const getDefaultDelivery = (type: string) => {
    return ['restaurante', 'farmacia', 'petshop', 'loja'].includes(type);
  };

  const getDefaultReservations = (type: string) => {
    return ['clinica', 'salao', 'oficina', 'academia', 'escola'].includes(type);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Processar mensagem inicial ou template da landing page
  useEffect(() => {
    const initialMessage = sessionStorage.getItem('initialMessage');
    const selectedTemplate = sessionStorage.getItem('selectedTemplate');

    if (initialMessage) {
      // Limpar sessionStorage
      sessionStorage.removeItem('initialMessage');
      
      // Processar mensagem inicial
      const userMessage: Message = {
        id: generateUniqueId(),
        content: initialMessage,
        sender: 'user',
        timestamp: new Date()
      };
      
      setMessages([userMessage]);
      setShowTemplates(false);
      
      // Processar com delay
      setTimeout(() => {
        handleChat(initialMessage);
      }, 500);
      
    } else if (selectedTemplate) {
      // Limpar sessionStorage
      sessionStorage.removeItem('selectedTemplate');
      
      // Aplicar template
      setShowTemplates(false);
      applyTemplate(selectedTemplate);
    }
  }, []);

  // Carregar dados salvos na sessionStorage
  useEffect(() => {
    try {
      const savedData = sessionStorage.getItem('functionarioIA_data');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        // Verificar se há dados salvos e se o agentData está vazio
        if (parsedData && (!agentData.businessName || agentData.businessName === '')) {
          console.log('📂 Carregando dados salvos da sessão:', parsedData);
          onAgentUpdate(parsedData);
          
          const loadedMessage: Message = {
            id: generateUniqueId(),
            content: `✅ **Seus dados foram carregados!**

Bem-vindo de volta ao FuncionarioPro. Sua configuração anterior foi recuperada:

**🏢 Nome:** ${parsedData.businessName}
**📱 WhatsApp:** ${parsedData.contactPhone || '-'}
**🚚 Entrega:** ${parsedData.hasDelivery ? '✅ Sim' : '❌ Não'}
**📅 Agendamento:** ${parsedData.acceptsReservations ? '✅ Sim' : '❌ Não'}

O que gostaria de fazer agora?`,
            sender: 'assistant',
            timestamp: new Date(),
            type: 'field',
            fieldData: {
              fieldName: 'loadedConfig',
              fieldLabel: 'Próxima Ação',
              fieldType: 'buttons',
              options: [
                { value: 'test_now', label: '🧪 Testar funcionamento' },
                { value: 'edit_config', label: '✏️ Editar configuração' },
                { value: 'reset_config', label: '🔄 Começar do zero' }
              ]
            }
          };
          
          setMessages(prev => [loadedMessage]);
          setShowTemplates(false); // Não mostrar templates se temos dados
        }
      }
    } catch (e) {
      console.error('Erro ao carregar dados da sessão:', e);
    }
  }, []);

  useEffect(() => {
    if (configData.isShowingField && configData.isConfiguring && !configData.isShowingField) {
      setConfigData({ ...configData, isShowingField: false });
      showCurrentStepField();
    }
  }, [configData.isShowingField, configData.isConfiguring, currentStep]);

  useEffect(() => {
    const handleOpenWhatsAppInline = (event: any) => {
      const whatsappMessage: Message = {
        id: Date.now().toString(),
        content: '📱 **Teste no WhatsApp**',
        sender: 'assistant',
        timestamp: new Date(),
        type: 'whatsapp'
      };
      setMessages(prev => [...prev, whatsappMessage]);
    };

    const handleTestButton = (event: any) => {
      // Abrir simulador diretamente em nova linha do chat
      const testMessage: Message = {
        id: generateUniqueId(),
        content: 'Iniciando teste do seu funcionário virtual...',
        sender: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, testMessage]);

      // Mostrar simulador na próxima linha após pequeno delay
      setTimeout(() => {
        const whatsappMessage: Message = {
          id: generateUniqueId(),
          content: 'Teste seu funcionário virtual:',
          sender: 'assistant',
          timestamp: new Date(),
          type: 'whatsapp'
        };
        setMessages(prev => [...prev, whatsappMessage]);
      }, 1500);
    };

    window.addEventListener('openWhatsAppInline', handleOpenWhatsAppInline);
    window.addEventListener('testButtonClicked', handleTestButton);
    
    return () => {
      window.removeEventListener('openWhatsAppInline', handleOpenWhatsAppInline);
      window.removeEventListener('testButtonClicked', handleTestButton);
    };
  }, []);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // EXPERIÊNCIA ESTILO LOVABLE - FULL SCREEN LAYOUT
  const renderTemplates = () => (
    <div className="flex-1 flex flex-col justify-center items-center px-4 py-8 bg-white min-h-screen">
      {/* Header Minimalista */}
      <div className="text-center mb-12 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Crie seu <span className="text-black">FuncionarioPro</span>
        </h1>
        <p className="text-lg md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
          Atendente virtual que responde clientes, agenda automaticamente e aumenta vendas 24h no WhatsApp
        </p>
        
        {/* Selos Pequenos */}
        <div className="flex justify-center items-center gap-8 text-sm text-gray-500 mb-16">
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 bg-black rounded-full"></div>
            100% Personalizado
          </span>
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 bg-black rounded-full"></div>
            Respostas Humanas
          </span>
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 bg-black rounded-full"></div>
            Mais Vendas
          </span>
          </div>
        </div>

      {/* INPUT GIGANTE CENTRALIZADO ESTILO LOVABLE */}
      <div className="w-full max-w-5xl mb-12">
        <div className="relative">
          <textarea
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder={currentPlaceholder + (isTyping ? '|' : '')}
            className="w-full h-40 md:h-48 px-8 py-8 text-xl md:text-2xl bg-white border-2 border-gray-200 rounded-3xl
              focus:outline-none focus:border-black focus:ring-4 focus:ring-black/5
              placeholder-gray-400 shadow-xl resize-none transition-all duration-300
              hover:border-gray-300 hover:shadow-2xl"
            style={{ 
              fontSize: 'clamp(18px, 3vw, 24px)',
              lineHeight: '1.4'
            }}
          />
          
          {/* Botão de Envio */}
          <button
            onClick={() => sendMessage()}
            disabled={!currentMessage.trim() || isLoading}
            className="absolute bottom-6 right-6 bg-black hover:bg-gray-800 disabled:bg-gray-300 
              text-white rounded-2xl p-4 transition-all duration-200 shadow-xl
              disabled:cursor-not-allowed hover:scale-105 active:scale-95"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-7 w-7 border-2 border-white border-t-transparent"></div>
            ) : (
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Modelos Pequenos - Quase Imperceptíveis */}
      <div className="w-full max-w-4xl mb-8">
        <p className="text-center text-sm text-gray-400 mb-4 font-medium">
          Ou escolha um modelo:
        </p>
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
          {Object.entries(TEMPLATES).map(([key, template]) => (
            <button
              key={key}
              onClick={() => applyTemplate(key)}
              className="flex flex-col items-center gap-1 p-3 rounded-xl hover:bg-gray-50 transition-all text-center group"
            >
              <div className="text-lg group-hover:scale-110 transition-transform opacity-70">
                {template.icon}
              </div>
              <span className="text-xs text-gray-500 font-medium leading-tight">
                {template.title}
              </span>
            </button>
          ))}
        </div>
        </div>

      {/* Ações Discretas */}
      <div className="flex flex-col sm:flex-row items-center gap-6 text-sm text-gray-400">
        <button
          onClick={() => {
            setShowTemplates(false);
            const startMessage: Message = {
              id: Date.now().toString(),
              content: 'Vamos configurar seu atendente virtual personalizado!\n\nVou te fazer algumas perguntas para criar o assistente perfeito para seu negócio.',
              sender: 'assistant',
              timestamp: new Date()
            };
            setMessages([startMessage]);
            setTimeout(() => {
              const defaultData = {
                businessName: '',
                businessType: '',
                contactPhone: '',
                location: '',
                workingHours: '',
                services: '',
                paymentMethods: '',
                hasDelivery: false,
                acceptsReservations: false
              };
              showConfigStep(0, defaultData);
            }, 1000);
          }}
          className="hover:text-gray-600 underline transition-colors"
        >
          Configuração personalizada
        </button>
        
        <span className="hidden sm:block">•</span>
        
        <a
          href="https://wa.me/551132300474?text=Olá%2C%20preciso%20de%20ajuda%20com%20o%20FuncionarioPro"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-600 underline transition-colors"
        >
          Precisa de ajuda?
        </a>
      </div>
    </div>
  );

  const sendMessage = async (customMessage?: string) => {
    const messageToSend = customMessage || currentMessage.trim();
    
    if (!messageToSend) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageToSend,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');

    if (showTemplates) {
      setShowTemplates(false);
    }

    await handleChat(messageToSend);
  };

  const handleChat = async (message: string) => {
    setIsLoading(true);
    
    try {
      // 1. PRIMEIRO, VERIFICAR SE É UM COMANDO DE CONFIGURAÇÃO (mencionou profissão)
      const businessType = detectBusinessType(message);
      if (businessType && (message.toLowerCase().includes('sou ') || message.toLowerCase().includes('tenho um') || message.toLowerCase().includes('minha área é'))) {
        await startStepByStepConfig(businessType, extractBusinessNameFromMessage(message));
        return;
      }

      // 2. SE NÃO FOR CONFIGURAÇÃO, USAR A IA PARA RESPOSTAS INTELIGENTES E PERSUASIVAS
      await handleGeneralChat(message);
      
    } catch (error) {
      console.error('❌ Erro no chat:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: '❌ Ops, tive um probleminha! Pode tentar novamente? 😅',
        sender: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // DETECTAR COMANDOS DE EDIÇÃO
  const detectEditCommand = (message: string): boolean => {
    const editKeywords = ['alterar', 'mudar', 'editar', 'corrigir', 'modificar', 'trocar'];
    const fieldKeywords = ['nome', 'telefone', 'whatsapp', 'endereço', 'horário', 'produto', 'serviço', 'pagamento'];
    
    const msg = message.toLowerCase();
    const hasEditKeyword = editKeywords.some(keyword => msg.includes(keyword));
    const hasFieldKeyword = fieldKeywords.some(keyword => msg.includes(keyword));
    
    return hasEditKeyword || hasFieldKeyword;
  };

  // PROCESSAR COMANDO DE EDIÇÃO
  const handleEditCommand = async (message: string) => {
    const msg = message.toLowerCase();
    
    let fieldToEdit = '';
    
    if (msg.includes('nome')) fieldToEdit = 'businessName';
    else if (msg.includes('telefone') || msg.includes('whatsapp')) fieldToEdit = 'contactPhone';
    else if (msg.includes('endereço') || msg.includes('endereco')) fieldToEdit = 'location';
    else if (msg.includes('horário') || msg.includes('horario')) fieldToEdit = 'workingHours';
    else if (msg.includes('produto') || msg.includes('serviço') || msg.includes('servico')) fieldToEdit = 'services';
    else if (msg.includes('pagamento')) fieldToEdit = 'paymentMethods';
    
    if (fieldToEdit) {
      const field = CONFIG_FIELDS.find(f => f.step === fieldToEdit);
      if (field) {
        const fieldMessage: Message = {
          id: Date.now().toString(),
          content: `**${field.question}**`,
          sender: 'assistant',
          timestamp: new Date(),
          type: 'field',
          fieldData: {
            fieldName: field.step,
            fieldLabel: field.title,
            fieldType: field.fieldType,
            placeholder: field.placeholder,
            currentValue: agentData[field.step as keyof AgentData] as string || '',
            options: field.options
          }
        };
        
        setMessages(prev => [...prev, fieldMessage]);
        return;
      }
    }
    
    // Se não detectou campo específico, usar IA
    await handleGeneralChat(message);
  };

  const extractBusinessNameFromMessage = (message: string): string | null => {
    const patterns = [
      /(?:meu|minha|nosso|nossa|o|a)\s+([a-zA-Zà-ÿ\s]+?)\s+(?:se chama|chama|é|chamado|chamada)/i,
      /(?:nome|chama|chamado|chamada)\s+([a-zA-Zà-ÿ\s]+)/i,
      /([a-zA-Zà-ÿ\s]+?)\s+(?:restaurante|pizzaria|lanchonete|clínica|consultório|loja)/i
    ];
    
    for (const pattern of patterns) {
      const match = message.match(pattern);
      if (match) {
        let name = match[2] || match[1];
        if (name) {
          name = name.trim();
          name = name.replace(/^(do|da|de|dos|das|o|a|um|uma)\s+/i, '');
          name = name.replace(/\s+(restaurante|pizzaria|lanchonete|clínica|consultório|loja)$/i, '');
          
          if (name.length > 2 && name.length < 50) {
            return name.split(' ').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            ).join(' ');
          }
        }
      }
    }
    
    return null;
  };

  const detectBusinessType = (message: string): string | null => {
    const msg = message.toLowerCase();
    
    const businessKeywords = {
      'restaurante': ['restaurante', 'pizza', 'pizzaria', 'comida', 'lanche', 'lanchonete', 'delivery', 'ifood', 'bar', 'café', 'confeitaria'],
      'clinica': ['médico', 'médica', 'clínica', 'consultório', 'saúde', 'consulta', 'dentista', 'psicólogo', 'advogado', 'advocacia', 'escritório', 'jurídico', 'direito', 'fisioterapeuta', 'nutricionista'],
      'loja': ['loja', 'venda', 'produtos', 'comércio', 'mercado', 'varejo', 'butique', 'shopping'],
      'salao': ['salão', 'cabelo', 'beleza', 'estética', 'manicure', 'barbearia', 'cabeleireiro', 'spa'],
      'oficina': ['oficina', 'mecânica', 'carro', 'conserto', 'manutenção', 'elétrica', 'hidráulica', 'técnico'],
      'hotel': ['hotel', 'pousada', 'hospedagem', 'reserva', 'turismo', 'hostel'],
      'academia': ['academia', 'ginástica', 'musculação', 'fitness', 'treino', 'pilates', 'crossfit', 'personal'],
      'petshop': ['pet shop', 'petshop', 'veterinário', 'pet', 'animal', 'cão', 'gato', 'veterinária'],
      'farmacia': ['farmácia', 'medicamento', 'remédio', 'drogaria', 'manipulação'],
      'escola': ['escola', 'educação', 'ensino', 'colégio', 'curso', 'professor', 'aula', 'reforço']
    };
    
    for (const [type, keywords] of Object.entries(businessKeywords)) {
      if (keywords.some(keyword => msg.includes(keyword))) {
        return type;
      }
    }
    
    return null;
  };

  // FUNÇÃO PARA CRIAR BOTÕES PERSUASIVOS BASEADOS NO CONTEXTO
  const createPersuasiveButtons = (intent: string, businessType?: string): Message | null => {
    let buttonOptions: Array<{value: string, label: string}> = [];
    let content = "";

    switch (intent) {
      case 'greeting':
        content = "**🚀 O que você gostaria de fazer agora?**";
        buttonOptions = [
          { value: 'tell_profession', label: '👩‍💼 Contar minha profissão' },
          { value: 'see_prices', label: '💰 Ver preços' },
          { value: 'test_now', label: '🧪 Testar grátis' },
          { value: 'how_works', label: '❓ Como funciona' }
        ];
        break;

      case 'configure':
        content = "**✨ Pronto para transformar seu atendimento?**";
        buttonOptions = [
          { value: `auto_${businessType}`, label: '🚀 Configurar agora!' },
          { value: 'show_details', label: '📋 Ver o que será configurado' },
          { value: 'test_first', label: '🧪 Testar antes' }
        ];
        break;

      case 'support':
        content = "**🎯 Como posso te ajudar melhor?**";
        buttonOptions = [
          { value: 'start_now', label: '🚀 Quero começar agora' },
          { value: 'test_first', label: '🧪 Fazer teste grátis' },
          { value: 'talk_human', label: '👨‍💼 Falar com consultor' },
          { value: 'more_info', label: '📚 Mais informações' }
        ];
        break;

      case 'unclear':
        content = "**💡 Talvez eu possa te ajudar com uma dessas opções:**";
        buttonOptions = [
          { value: 'tell_profession', label: '👩‍💼 Falar sobre meu negócio' },
          { value: 'see_prices', label: '💰 Ver preços e planos' },
          { value: 'test_now', label: '🧪 Fazer um teste' },
          { value: 'how_works', label: '❓ Entender como funciona' }
        ];
        break;

      default:
        // Para outros intents, mostrar ações gerais
        content = "**🌟 Que tal dar o próximo passo?**";
        buttonOptions = [
          { value: 'config_business', label: '⚙️ Configurar meu negócio' },
          { value: 'test_system', label: '🧪 Testar sistema' },
          { value: 'see_prices', label: '💰 Ver investimento' }
        ];
    }

    if (buttonOptions.length === 0) return null;

    return {
      id: generateUniqueId(),
      content,
      sender: 'assistant',
      timestamp: new Date(),
      type: 'field',
      fieldData: {
        fieldName: 'persuasiveAction',
        fieldLabel: 'Próxima Ação',
        fieldType: 'buttons',
        options: buttonOptions
      }
    };
  };

  const checkLearnedPatterns = (message: string) => {
    try {
      const patterns = JSON.parse(localStorage.getItem('ai_patterns') || '[]');
      const normalizedMessage = message.toLowerCase().trim();
      
      // Buscar padrão exato ou similar
      const matchedPattern = patterns.find((pattern: any) => {
        const similarity = calculateSimilarity(normalizedMessage, pattern.input);
        return similarity > 0.8; // 80% de similaridade
      });
      
      if (matchedPattern && matchedPattern.confidence > 0.8) {
        console.log('🎯 Padrão encontrado:', matchedPattern);
        return matchedPattern;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Erro ao verificar padrões:', error);
      return null;
    }
  };

  const calculateSimilarity = (str1: string, str2: string): number => {
    const words1 = str1.split(' ');
    const words2 = str2.split(' ');
    
    let matches = 0;
    words1.forEach(word => {
      if (words2.includes(word)) matches++;
    });
    
    return matches / Math.max(words1.length, words2.length);
  };

  const handleIntelligentAnalysis = async (message: string) => {
    // 1. PRIMEIRO, VERIFICAR SE É UM COMANDO DE CONFIGURAÇÃO (mencionou profissão)
    const businessType = detectBusinessType(message);
    if (businessType && (message.toLowerCase().includes('sou ') || message.toLowerCase().includes('tenho um') || message.toLowerCase().includes('minha área é'))) {
      await startStepByStepConfig(businessType, extractBusinessNameFromMessage(message));
      return;
          }

    // 2. SE NÃO FOR CONFIGURAÇÃO, USAR A IA PARA RESPOSTAS INTELIGENTES E PERSUASIVAS
    await handleGeneralChat(message);
  };

  const [configSteps, setConfigSteps] = useState<string[]>([]);
  const [currentConfigStep, setCurrentConfigStep] = useState(0);

  const startStepByStepConfig = async (businessType: string, businessName?: string, fullConfig?: any) => {
    // Configuração passo a passo editável
    const businessTypeNames = {
      'clinica': 'Clínica/Consultório',
      'restaurante': 'Restaurante/Alimentação',
      'salao': 'Salão de Beleza',
      'oficina': 'Oficina/Serviços Técnicos',
      'loja': 'Loja/Comércio',
      'academia': 'Academia/Fitness',
      'petshop': 'Pet Shop',
      'farmacia': 'Farmácia',
      'escola': 'Escola/Educação'
    };

    const typeName = businessTypeNames[businessType as keyof typeof businessTypeNames] || businessType;
    
    // Definir sequência de campos a configurar
    const steps = ['businessName', 'contactPhone', 'location', 'workingHours', 'services', 'paymentMethods', 'hasDelivery', 'acceptsReservations'];
    console.log(`🚀 Definindo configSteps:`, steps);
    setConfigSteps(steps);
    setCurrentConfigStep(0);
    
    // Aplicar valores padrão do tipo de negócio
    const defaultData = {
      businessType: businessType,
      businessName: businessName || `${typeName} Exemplo`,
      contactPhone: '(11) 99999-9999',
      location: 'São Paulo, SP',
      workingHours: getDefaultHours(businessType),
      services: getDefaultServices(businessType),
      paymentMethods: getDefaultPayments(businessType),
      hasDelivery: getDefaultDelivery(businessType),
      acceptsReservations: getDefaultReservations(businessType)
    };
    
    onAgentUpdate(defaultData);
    
    const startMessage: Message = {
      id: Date.now().toString(),
      content: `**✨ Perfeito! Vou configurar seu ${typeName} passo a passo.**

Preencherei com dados padrão, mas você pode editar tudo! 😊

**📝 Vamos começar:**`,
      sender: 'assistant',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, startMessage]);

    // Mostrar primeiro campo - usar steps diretamente para evitar race condition
    setTimeout(() => {
      showConfigStepDirect(0, defaultData, steps);
    }, 1500);
  };

  const showConfigStepDirect = (stepIndex: number, defaultData: any, steps: string[]) => {
    console.log(`🔧 showConfigStepDirect: stepIndex=${stepIndex}, steps.length=${steps.length}`);
    
    if (stepIndex >= steps.length) {
      console.log(`✅ Configuração concluída - chamando completeStepByStepConfig`);
      completeStepByStepConfig();
      return;
    }

    const fieldName = steps[stepIndex];
    console.log(`📝 Mostrando campo: ${fieldName}`);
    
    const fieldLabels = {
      businessName: 'Nome do Negócio',
      contactPhone: 'Telefone/WhatsApp',
      location: 'Localização',
      workingHours: 'Horários de Funcionamento',
      services: 'Principais Serviços',
      paymentMethods: 'Formas de Pagamento',
      hasDelivery: 'Entrega',
      acceptsReservations: 'Agendamento'
    };

    const currentValue = defaultData[fieldName] || '';
    console.log(`💾 Valor atual para ${fieldName}: ${currentValue}`);
    
    // Determinar tipo de campo baseado no nome do campo
    let fieldType = 'input';
    let options = undefined;
    
    if (fieldName === 'services' || fieldName === 'paymentMethods' || fieldName === 'workingHours') {
      fieldType = 'textarea';
    } else if (fieldName === 'hasDelivery' || fieldName === 'acceptsReservations') {
      fieldType = 'buttons';
      options = [
        { value: 'true', label: '✅ Sim' },
        { value: 'false', label: '❌ Não' }
      ];
    }
    
    const fieldMessage: Message = {
      id: generateUniqueId(),
      content: `**${fieldLabels[fieldName as keyof typeof fieldLabels]}:**`,
      sender: 'assistant',
      timestamp: new Date(),
      type: 'field',
      fieldData: {
        fieldName: fieldName,
        fieldLabel: fieldLabels[fieldName as keyof typeof fieldLabels],
        fieldType: fieldType,
        placeholder: String(currentValue),
        defaultValue: String(currentValue),
        configStep: stepIndex,
        isStepByStepConfig: true,
        options: options
      }
    };
    setMessages(prev => [...prev, fieldMessage]);
  };

  const showConfigStep = (stepIndex: number, defaultData: any) => {
    console.log(`🔧 showConfigStep: stepIndex=${stepIndex}, configSteps.length=${configSteps.length}`);
    
    if (stepIndex >= configSteps.length) {
      console.log(`✅ Configuração concluída - chamando completeStepByStepConfig`);
      completeStepByStepConfig();
      return;
    }

    const fieldName = configSteps[stepIndex];
    console.log(`📝 Mostrando campo: ${fieldName}`);
    
    const fieldLabels = {
      businessName: 'Nome do Negócio',
      contactPhone: 'Telefone/WhatsApp',
      location: 'Localização',
      workingHours: 'Horários de Funcionamento',
      services: 'Principais Serviços',
      paymentMethods: 'Formas de Pagamento',
      hasDelivery: 'Entrega',
      acceptsReservations: 'Agendamento'
    };

    const currentValue = defaultData[fieldName] || '';
    console.log(`💾 Valor atual para ${fieldName}: ${currentValue}`);
    
    // Determinar tipo de campo baseado no nome do campo
    let fieldType = 'input';
    let options = undefined;
    
    if (fieldName === 'services' || fieldName === 'paymentMethods' || fieldName === 'workingHours') {
      fieldType = 'textarea';
    } else if (fieldName === 'hasDelivery' || fieldName === 'acceptsReservations') {
      fieldType = 'buttons';
      options = [
        { value: 'true', label: '✅ Sim' },
        { value: 'false', label: '❌ Não' }
      ];
    }
    
    const fieldMessage: Message = {
      id: generateUniqueId(),
      content: `**${fieldLabels[fieldName as keyof typeof fieldLabels]}:**`,
      sender: 'assistant',
      timestamp: new Date(),
      type: 'field',
      fieldData: {
        fieldName: fieldName,
        fieldLabel: fieldLabels[fieldName as keyof typeof fieldLabels],
        fieldType: fieldType,
        placeholder: String(currentValue),
        defaultValue: String(currentValue),
        configStep: stepIndex,
        isStepByStepConfig: true,
        options: options
      }
    };
    setMessages(prev => [...prev, fieldMessage]);
  };

  const completeStepByStepConfig = () => {
    // Salvar dados na sessão
    try {
      sessionStorage.setItem('functionarioIA_data', JSON.stringify(agentData));
    } catch (e) {
      console.error('Erro ao salvar dados na sessão:', e);
    }

    // Primeiro mostrar mensagem de conclusão
    const completionMessage: Message = {
      id: Date.now().toString(),
      content: `Configuração concluída com sucesso!\n\nSeu funcionário virtual está pronto! Você também pode:\n\n• Conectar ao WhatsApp para usar em produção\n• Editar qualquer informação se necessário\n\nO que gostaria de fazer?`,
      sender: 'assistant',
      timestamp: new Date(),
      type: 'field',
      fieldData: {
        fieldName: 'afterConfig',
        fieldLabel: 'Próxima Ação',
        fieldType: 'buttons',
        options: [
          { value: 'test_now', label: 'Testar no simulador' },
          { value: 'connect_whatsapp', label: 'Conectar WhatsApp' },
          { value: 'edit_config', label: 'Editar algo' }
        ]
      }
    };
    setMessages(prev => [...prev, completionMessage]);

    // Após 3 segundos, mostrar automaticamente o simulador de WhatsApp
    setTimeout(() => {
      const whatsappMessage: Message = {
        id: generateUniqueId(),
        content: 'Teste seu funcionário virtual:',
        sender: 'assistant',
        timestamp: new Date(),
        type: 'whatsapp'
      };
      setMessages(prev => [...prev, whatsappMessage]);
    }, 3000);
  };

  const applyIntelligentConfig = async (businessType: string, businessName?: string, fullConfig?: any) => {
    setIsLoading(true);
    setConfigData({ ...configData, isConfiguring: true });
    setShowTemplates(false);

    const configs = {
      clinica: {
        businessType: 'clinica',
        businessName: businessName || 'Minha Clínica',
        contactPhone: '(11) 99999-9999',
        location: 'Rua das Flores, 123 - Centro, São Paulo - SP',
        workingHours: 'Segunda a Sexta: 08:00 às 18:00\nSábado: 08:00 às 12:00',
        services: 'Consultas de Psicologia\nTerapias e Avaliações\nAcompanhamento especializado',
        paymentMethods: 'PIX, Cartão de Crédito/Débito, Convênios Médicos, Dinheiro',
        hasDelivery: false,
        acceptsReservations: true,
        personality: 'profissional e acolhedor',
        welcomeMessage: 'Olá! Bem-vindo(a) à {businessName}! Gostaria de agendar uma consulta?'
      },
      restaurante: {
        businessType: 'restaurante',
        businessName: businessName || 'Meu Restaurante',
        contactPhone: '(11) 99999-9999',
        location: 'Rua dos Sabores, 456 - Centro, São Paulo - SP',
        workingHours: 'Todos os dias: 11:00 às 23:00\nDomingo: 11:00 às 22:00',
        services: 'Pizzas tradicionais e especiais\nPratos executivos a partir de R$ 25\nLanches e bebidas geladas',
        paymentMethods: 'PIX, Cartão de Crédito/Débito, Dinheiro, Vale Refeição',
        hasDelivery: true,
        acceptsReservations: false,
        personality: 'atencioso e prestativo',
        welcomeMessage: 'Olá! Bem-vindo(a) ao {businessName}! Vamos fazer seu pedido?'
      },
      salao: {
        businessType: 'salao',
        businessName: businessName || 'Meu Salão de Beleza',
        contactPhone: '(11) 99999-9999',
        location: 'Avenida da Beleza, 789 - Centro, São Paulo - SP',
        workingHours: 'Terça a Sábado: 09:00 às 19:00\nDomingo: 09:00 às 17:00',
        services: 'Cortes femininos e masculinos\nColoração e mechas\nManicure e Pedicure\nTratamentos capilares',
        paymentMethods: 'PIX, Cartão de Crédito/Débito, Dinheiro',
        hasDelivery: false,
        acceptsReservations: true,
        personality: 'carinhoso e atencioso',
        welcomeMessage: 'Olá! Bem-vindo(a) ao {businessName}! Vamos cuidar da sua beleza?'
      },
      oficina: {
        businessType: 'oficina',
        businessName: businessName || 'Minha Oficina',
        contactPhone: '(11) 99999-9999',
        location: 'Rua dos Mecânicos, 321 - Industrial, São Paulo - SP',
        workingHours: 'Segunda a Sexta: 08:00 às 18:00\nSábado: 08:00 às 12:00',
        services: 'Manutenção preventiva e corretiva\nTroca de óleo e filtros\nAlinhamento e balanceamento\nServiços elétricos automotivos',
        paymentMethods: 'PIX, Cartão de Crédito/Débito, Dinheiro',
        hasDelivery: false,
        acceptsReservations: true,
        personality: 'profissional e confiável',
        welcomeMessage: 'Olá! Bem-vindo(a) à {businessName}! Como posso ajudar com seu veículo?'
      },
      loja: {
        businessType: 'loja',
        businessName: businessName || 'Minha Loja',
        contactPhone: '(11) 99999-9999',
        location: 'Rua do Comércio, 654 - Centro, São Paulo - SP',
        workingHours: 'Segunda a Sexta: 09:00 às 18:00\nSábado: 09:00 às 14:00',
        services: 'Produtos variados com qualidade\nAtendimento personalizado\nEntrega rápida na região',
        paymentMethods: 'PIX, Cartão de Crédito/Débito, Dinheiro',
        hasDelivery: true,
        acceptsReservations: false,
        personality: 'amigável e informativo',
        welcomeMessage: 'Olá! Bem-vindo(a) à {businessName}! Como posso ajudá-lo(a)?'
      },
      academia: {
        businessType: 'academia',
        businessName: businessName || 'Minha Academia',
        contactPhone: '(11) 99999-9999',
        location: 'Avenida Fitness, 123 - Centro, São Paulo - SP',
        workingHours: 'Segunda a Sexta: 06:00 às 22:00\nSábado: 08:00 às 18:00\nDomingo: 08:00 às 16:00',
        services: 'Musculação e equipamentos modernos\nAulas coletivas (Zumba, Pilates, CrossFit)\nAvaliação física personalizada\nAcompanhamento nutricional',
        paymentMethods: 'PIX, Cartão de Crédito/Débito, Dinheiro, Débito em conta',
        hasDelivery: false,
        acceptsReservations: true,
        personality: 'motivador e energético',
        welcomeMessage: 'Olá! Bem-vindo(a) à {businessName}! Vamos treinar?'
      },
      petshop: {
        businessType: 'petshop',
        businessName: businessName || 'Meu Pet Shop',
        contactPhone: '(11) 99999-9999',
        location: 'Rua dos Animais, 456 - Centro, São Paulo - SP',
        workingHours: 'Segunda a Sábado: 08:00 às 18:00\nDomingo: 09:00 às 15:00',
        services: 'Ração e petiscos para cães e gatos\nBrinquedos e acessórios\nBanho e tosa\nConsultas veterinárias',
        paymentMethods: 'PIX, Cartão de Crédito/Débito, Dinheiro',
        hasDelivery: true,
        acceptsReservations: true,
        personality: 'carinhoso e atencioso',
        welcomeMessage: 'Olá! Bem-vindo(a) ao {businessName}! Como posso cuidar do seu pet?'
      },
      farmacia: {
        businessType: 'farmacia',
        businessName: businessName || 'Minha Farmácia',
        contactPhone: '(11) 99999-9999',
        location: 'Avenida da Saúde, 789 - Centro, São Paulo - SP',
        workingHours: 'Segunda a Domingo: 07:00 às 22:00',
        services: 'Medicamentos com e sem receita\nProdutos de higiene e beleza\nSuplementos e vitaminas\nMedicamentos manipulados',
        paymentMethods: 'PIX, Cartão de Crédito/Débito, Dinheiro, Convênios',
        hasDelivery: true,
        acceptsReservations: false,
        personality: 'profissional e cuidadoso',
        welcomeMessage: 'Olá! Bem-vindo(a) à {businessName}! Precisa de algum medicamento?'
      },
      escola: {
        businessType: 'escola',
        businessName: businessName || 'Minha Escola',
        contactPhone: '(11) 99999-9999',
        location: 'Rua da Educação, 321 - Centro, São Paulo - SP',
        workingHours: 'Segunda a Sexta: 07:00 às 18:00',
        services: 'Ensino Fundamental e Médio\nReforço escolar personalizado\nAtividades extracurriculares\nAcompanhamento psicopedagógico',
        paymentMethods: 'PIX, Cartão de Crédito/Débito, Boleto, Débito em conta',
        hasDelivery: false,
        acceptsReservations: true,
        personality: 'educativo e acolhedor',
        welcomeMessage: 'Olá! Bem-vindo(a) à {businessName}! Como posso ajudar?'
      },
      outro: {
        businessType: 'outro',
        businessName: businessName || 'Meu Negócio',
        contactPhone: '(11) 99999-9999',
        location: 'Rua Principal, 123 - Centro, São Paulo - SP',
        workingHours: 'Segunda a Sexta: 08:00 às 18:00\nSábado: 08:00 às 12:00',
        services: 'Produtos e serviços de qualidade\nAtendimento personalizado\nSoluções sob medida',
        paymentMethods: 'PIX, Cartão de Crédito/Débito, Dinheiro',
        hasDelivery: false,
        acceptsReservations: false,
        personality: 'profissional e atencioso',
        welcomeMessage: 'Olá! Bem-vindo(a) à {businessName}! Como posso ajudá-lo(a)?'
      }
    };

    // Usar configuração da IA se disponível, senão usar padrão
    const config = fullConfig || configs[businessType as keyof typeof configs];
    
    if (config) {
      const configMessage: Message = {
        id: Date.now().toString(),
        content: `✅ **CONFIGURAÇÃO COMPLETA APLICADA!**

**🏢 Nome:** ${config.businessName}
**📱 WhatsApp:** ${config.contactPhone}
**📍 Endereço:** ${config.location}
**⏰ Horários:** ${config.workingHours.split('\n')[0]}...
**🛍 Serviços:** ${config.services.split('\n')[0]}...
**💳 Pagamento:** ${config.paymentMethods}
**🚚 Entrega:** ${config.hasDelivery ? '✅ Sim' : '❌ Não'}
**📅 Agendamento:** ${config.acceptsReservations ? '✅ Sim' : '❌ Não'}

**🎉 Tudo foi preenchido automaticamente! Você pode editar qualquer campo posteriormente.**`,
        sender: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, configMessage]);

      // Aplicar TODA a configuração automaticamente
      onAgentUpdate({
        businessType: config.businessType,
        businessName: config.businessName,
        contactPhone: config.contactPhone,
        location: config.location,
        workingHours: config.workingHours,
        services: config.services,
        paymentMethods: config.paymentMethods,
        hasDelivery: config.hasDelivery,
        acceptsReservations: config.acceptsReservations,
        personality: config.personality,
        welcomeMessage: config.welcomeMessage.replace('{businessName}', config.businessName),
        businessInfo: `${config.businessName} - ${businessType} com atendimento de qualidade`,
        template: businessType
      });

      // Salvar dados na sessão
      try {
        sessionStorage.setItem('functionarioIA_data', JSON.stringify({
          ...config,
          businessInfo: `${config.businessName} - ${businessType} com atendimento de qualidade`,
          template: businessType,
          welcomeMessage: config.welcomeMessage.replace('{businessName}', config.businessName)
        }));
      } catch (e) {
        console.error('Erro ao salvar dados na sessão:', e);
      }

      // Finalizar configuração automaticamente
      setConfigData({ ...configData, isConfiguring: false });
      setCurrentStep(0);

      // Mostrar mensagem de conclusão primeiro
      setTimeout(() => {
        const completionMessage: Message = {
          id: generateUniqueId(),
          content: `**🚀 Tudo pronto! O que você quer fazer agora?**`,
          sender: 'assistant',
          timestamp: new Date(),
          type: 'field',
          fieldData: {
            fieldName: 'afterFullConfig',
            fieldLabel: 'Próxima Ação',
            fieldType: 'buttons',
            options: [
              { value: 'test_whatsapp', label: '🧪 Testar no WhatsApp' },
              { value: 'edit_info', label: '✏️ Editar informações' },
              { value: 'connect_now', label: '📱 Conectar WhatsApp' },
              { value: 'see_preview', label: '👀 Ver resumo' }
            ]
          }
        };
        setMessages(prev => [...prev, completionMessage]);
      }, 1500);

      // Mostrar simulador de WhatsApp automaticamente em uma nova linha
      setTimeout(() => {
        const whatsappSimulator: Message = {
          id: generateUniqueId(),
          content: '📱 **Seu funcionário virtual está pronto! Teste agora como ele vai atender seus clientes:**',
          sender: 'assistant',
          timestamp: new Date(),
          type: 'whatsapp'
        };
        setMessages(prev => [...prev, whatsappSimulator]);
      }, 3000);

    } else {
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: '❌ Tipo de negócio não reconhecido. Escolha um template abaixo:',
        sender: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
      setShowTemplates(true);
      setConfigData({ ...configData, isConfiguring: false });
    }

    setIsLoading(false);
  };

  const handleGeneralChat = async (message: string) => {
    // Verificar se pode responder com conversas salvas
    const conversationHistory = JSON.parse(localStorage.getItem('conversation_history') || '[]');
    const similarConversation = conversationHistory.find((conv: any) => 
      calculateSimilarity(message.toLowerCase(), conv.input.toLowerCase()) > 0.8
    );

    if (similarConversation) {
      const savedMessage: Message = {
        id: Date.now().toString(),
        content: similarConversation.response,
        sender: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, savedMessage]);
      return;
    }

    // Verificar se já está configurado para personalizar resposta
    const isConfigured = agentData.businessName && agentData.businessName !== '' && agentData.businessType && agentData.businessType !== '';
    const businessInfo = isConfigured ? `
    
NEGÓCIO JÁ CONFIGURADO:
- Nome: ${agentData.businessName}
- Tipo: ${agentData.businessType}
- WhatsApp: ${agentData.contactPhone || 'não informado'}
- Entrega: ${agentData.hasDelivery ? 'Sim' : 'Não'}
- Agendamento: ${agentData.acceptsReservations ? 'Sim' : 'Não'}
- Serviços: ${agentData.services || 'não especificado'}
- Horários: ${agentData.workingHours || 'não especificado'}
- Pagamentos: ${agentData.paymentMethods || 'não especificado'}

O usuário JÁ TEM TUDO CONFIGURADO! Seja mais direto e persuasivo para conectar ao WhatsApp ou assinar.` : '';

          const systemPrompt = `Você é Maria, assistente virtual do FuncionarioPro. Responda de forma HUMANA, EMPÁTICA e EXTREMAMENTE PERSUASIVA.

${businessInfo}

INFORMAÇÕES SOBRE O FUNCIONÁRIOAI:

PRODUTO:
- Sistema que cria funcionários virtuais para WhatsApp
- Atendimento automático 24h para qualquer tipo de negócio
- Configura automaticamente baseado na profissão do usuário

PLANOS E PREÇOS:
- TESTE GRÁTIS: 7 dias, R$ 0,00
- PROFISSIONAL: R$ 49,90/mês (até 3 funcionários virtuais)
- EMPRESARIAL: R$ 149,90/mês (funcionários ilimitados)

BENEFÍCIOS COMPROVADOS:
- Aumento médio de 300% nas vendas
- Redução de 80% no tempo de atendimento  
- Disponibilidade 24h todos os dias
- Nunca mais perder clientes

COMO FUNCIONA:
1. Configuração simples (2 minutos) ${isConfigured ? '- JÁ FEITA!' : ''}
2. Conexão oficial com WhatsApp Web Diretona nossa Plataforma
3. Atendimento automático imediato
4. Agendamentos e pedidos automatizados

INSTRUÇÕES ESPECIAIS:
- Se o usuário mencionar "quero assinar", "interessado", "vale a pena" seja EXTREMAMENTE persuasivo
- Use dados concretos: "300% mais vendas", "R$ 49,90 vs R$ 1.500 de funcionário"
- Cite casos de sucesso: "Semana passada uma cliente dobrou o movimento"
- Se JÁ ESTÁ CONFIGURADO: seja direto para conexão/assinatura
- NUNCA peça para configurar novamente se já está configurado
- Responda sempre como uma pessoa real, nunca como robô
- Use linguagem natural e conversacional

PERSONALIDADE:
- Seja MARIA, uma consultora experiente e entusiasmada
- Fale como uma pessoa real, com experiência em negócios
- Use linguagem calorosa, mas profissional
- Seja curiosa sobre o negócio da pessoa (se não configurado)
- Use emojis sutilmente para humanizar
- Seja PERSUASIVA sem ser chata

SEMPRE:
- Responda como uma pessoa experiente falaria
- Use referências específicas quando possível
- Faça perguntas para entender melhor (se necessário)
- Ofereça soluções práticas
- Nunca dê respostas vagas ou genéricas
- Se não souber, peça mais detalhes
- FOQUE na VENDA e BENEFÍCIOS quando detectar interesse
- NUNCA use respostas automáticas ou padronizadas`;

    try {
      setIsLoading(true);
      
      const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MISTRAL_CONFIG.API_KEY}`
        },
        body: JSON.stringify({
          model: MISTRAL_CONFIG.CURRENT.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ],
          max_tokens: 500,
          temperature: 0.7
        })
      });

      if (response.ok) {
        const data = await response.json();
        const aiResponse = data.choices[0]?.message?.content || 'Desculpe, não consegui processar sua pergunta no momento.';
        
        const assistantMessage: Message = {
          id: generateUniqueId(),
          content: aiResponse,
          sender: 'assistant',
          timestamp: new Date(),
          type: 'text'
        };

        setMessages(prev => [...prev, assistantMessage]);

        // Salvar conversa para aprendizado
        const conversationHistory = JSON.parse(localStorage.getItem('conversation_history') || '[]');
        conversationHistory.push({
          input: message,
          response: aiResponse,
          intent: 'general',
          timestamp: new Date().toISOString()
        });
        localStorage.setItem('conversation_history', JSON.stringify(conversationHistory.slice(-200)));
      } else {
        throw new Error(`API Error: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Erro na IA:', error);
      
      const errorMessage: Message = {
        id: Date.now().toString(),
        content: "Olha, vou ser bem direta com você: mesmo com esse probleminha técnico, posso te garantir que o FuncionarioPro é incrível!\n\n🚀 **Benefícios comprovados:**\n- 300% mais vendas em média\n- Atendimento 24h sem parar\n- R$ 49,90/mês vs R$ 1.500 de funcionário\n\n" + (isConfigured ? "Seu negócio já está configurado! Quer testar ou conectar direto ao WhatsApp?" : "Quer que eu configure para seu negócio? Me conta sua profissão!"),
        sender: 'assistant',
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const applyTemplate = (templateKey: string) => {
    const template = TEMPLATES[templateKey];
    if (!template) return;
    
    // Reset completo do estado
    setConfigData({ ...configData, isShowingField: false });
    setCurrentStep(0);
    setConfigData({ ...configData, isConfiguring: false }); // Não usar configuração automática
    setShowTemplates(false);
    
    // Usar configuração passo a passo baseada no tipo de negócio
    const businessType = template.businessType;
    
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      content: `✅ **${template.title}** selecionado!

Agora vou configurar passo a passo para você poder editar tudo! 😊`,
      sender: 'assistant',
      timestamp: new Date()
    };
    
    setMessages([welcomeMessage]);
    
    // Iniciar configuração passo a passo
    setTimeout(() => {
      startStepByStepConfig(businessType);
    }, 1000);
  };

  const showCurrentStepField = () => {
    console.log(`🔄 showCurrentStepField called - Step: ${currentStep}, isShowingField: ${configData.isShowingField}`);
    
    // Evitar chamadas duplicadas
    if (configData.isShowingField) {
      console.log('❌ Ignorando chamada duplicada de showCurrentStepField');
      return;
    }
    
    if (currentStep >= CONFIG_FIELDS.length) {
      console.log('✅ Configuração completa');
      completeConfiguration();
      return;
    }
    
    setConfigData({ ...configData, isShowingField: true });
    console.log('🔒 isShowingField = true');
    
    const field = CONFIG_FIELDS[currentStep];
    const currentValue = agentData[field.step as keyof AgentData] as string;
    
    console.log(`📝 Step ${currentStep}: ${field.step} = "${currentValue}"`);
    
    // Pular campos já preenchidos e válidos
    if (currentValue && 
        currentValue !== 'A ser definido' && 
        currentValue !== '' && 
        currentValue.trim() !== '') {
      console.log(`⏭️ Pulando campo ${field.step} (já preenchido)`);
      setConfigData({ ...configData, isShowingField: false });
      setCurrentStep(prev => prev + 1);
      setTimeout(() => setConfigData({ ...configData, isShowingField: true }), 50);
      return;
    }
    
    console.log('🎯 Criando campo:', field.step);
    
    // Remover qualquer campo existente antes de criar um novo
    setMessages(prev => prev.filter(msg => msg.type !== 'field'));
    
    const fieldMessage: Message = {
      id: Date.now().toString(),
      content: `**${currentStep + 1}. ${field.question}**`,
      sender: 'assistant',
      timestamp: new Date(),
      type: 'field',
      fieldData: {
        fieldName: field.step,
        fieldLabel: field.title,
        fieldType: field.fieldType,
        placeholder: field.placeholder,
        currentValue: currentValue || '',
        options: field.options
      }
    };
    
    setTimeout(() => {
      setMessages(prev => [...prev, fieldMessage]);
      setConfigData({ ...configData, isShowingField: false });
      console.log('🔓 isShowingField = false');
    }, 50);
  };

  const handleFieldResponse = (value: string) => {
    console.log(`🎯 handleFieldResponse called with: "${value}"`);
    console.log(`🔍 Debug - configSteps.length: ${configSteps.length}, currentConfigStep: ${currentConfigStep}`);
    
    // PRIMEIRO: Verificar se este campo é de configuração passo a passo
    // Buscar na mensagem mais recente se tem a flag isStepByStepConfig
    const lastMessage = messages[messages.length - 1];
    const isStepByStepField = lastMessage?.fieldData?.isStepByStepConfig;
    
    console.log(`🎯 É campo passo a passo? ${isStepByStepField}`);
    
    // Se é um campo da configuração passo a passo
    if (isStepByStepField && configSteps.length > 0 && currentConfigStep < configSteps.length) {
      const fieldName = configSteps[currentConfigStep];
      console.log(`📝 Processando campo: ${fieldName} = ${value}`);
      
      // Atualizar dados do agente
      const updateData = {
        [fieldName]: value
      };
      onAgentUpdate(updateData);
      
      // Confirmação visual
      const confirmMessage: Message = {
        id: Date.now().toString(),
        content: `✅ **${fieldName === 'businessName' ? 'Nome' : 
                       fieldName === 'contactPhone' ? 'Telefone' :
                       fieldName === 'location' ? 'Localização' :
                       fieldName === 'workingHours' ? 'Horários' :
                       fieldName === 'services' ? 'Serviços' :
                       fieldName === 'paymentMethods' ? 'Pagamentos' : 'Campo'} atualizado!**

${value}`,
        sender: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, confirmMessage]);
      
      // Avançar para próximo campo
      const nextStep = currentConfigStep + 1;
      setCurrentConfigStep(nextStep);
      
      setTimeout(() => {
        if (nextStep < configSteps.length) {
          setConfigData({ ...configData, isShowingField: true });
          // Próximo campo - usar valores atualizados
          const defaultData = {
            businessName: fieldName === 'businessName' ? value : agentData.businessName,
            contactPhone: fieldName === 'contactPhone' ? value : agentData.contactPhone,
            location: fieldName === 'location' ? value : agentData.location,
            workingHours: fieldName === 'workingHours' ? value : agentData.workingHours,
            services: fieldName === 'services' ? value : agentData.services,
            paymentMethods: fieldName === 'paymentMethods' ? value : agentData.paymentMethods,
            hasDelivery: fieldName === 'hasDelivery' ? value : agentData.hasDelivery,
            acceptsReservations: fieldName === 'acceptsReservations' ? value : agentData.acceptsReservations
          };
          showConfigStepDirect(nextStep, defaultData, configSteps);
        } else {
          // Configuração concluída
          setConfigSteps([]); // Reset
          setCurrentConfigStep(0);
          completeStepByStepConfig();
        }
      }, 1500);
      
      return;
    }
    
    // Processar ações rápidas dos botões
    if (value.startsWith('auto_')) {
      const businessType = value.replace('auto_', '');
      applyIntelligentConfig(businessType);
      return;
    }

    // Processar outras ações interativas
    switch (value) {
      case 'tell_profession':
        const askProfession: Message = {
          id: Date.now().toString(),
          content: '👩‍💼 Perfeito! Me conta qual é a sua profissão ou tipo de negócio. Por exemplo: "sou dentista", "tenho uma pizzaria", "trabalho com cabelo"...',
          sender: 'assistant',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, askProfession]);
        return;

      case 'see_prices':
        handleChat('quanto custa');
        return;
        
      case 'start_now':
        handleChat('quero começar a configurar meu negócio agora');
        return;

      case 'test_now':
      case 'test_first':
      case 'test_whatsapp':
        // Verificar se já existe um simulador nas mensagens
        const hasExistingWhatsApp = messages.some(msg => msg.type === 'whatsapp');
        if (hasExistingWhatsApp) {
          // Não fazer nada se já tem um simulador aberto
          return;
        }
        
        // Confirmar que vai testar
        const testConfirmMessage: Message = {
          id: generateUniqueId(),
          content: 'Iniciando teste do seu funcionário virtual...\n\nVou abrir o simulador de WhatsApp para você ver como ficou:',
          sender: 'assistant',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, testConfirmMessage]);
        
        // Mostrar simulador de WhatsApp na próxima linha (após pequeno delay)
        setTimeout(() => {
          // Verificar novamente se não foi criado nenhum simulador nesse período
          setMessages(prev => {
            const hasWhatsApp = prev.some(msg => msg.type === 'whatsapp');
            if (!hasWhatsApp) {
              const whatsappTestMessage: Message = {
                id: generateUniqueId(),
                content: 'Teste seu atendente virtual:',
                sender: 'assistant',
                timestamp: new Date(),
                type: 'whatsapp'
              };
              return [...prev, whatsappTestMessage];
            }
            return prev;
          });
        }, 1500);
        return;
        
      case 'connect_whatsapp':
      case 'connect_direct':
      case 'connect_now':
        // Disparar evento para mostrar o banner de conexão com WhatsApp 
        const connectEvent = new CustomEvent('openConnectWhatsApp', {
          detail: { 
            businessName: agentData.businessName,
            businessType: agentData.businessType
          }
        });
        window.dispatchEvent(connectEvent);
        
        const whatsappConnectMessage: Message = {
          id: Date.now().toString(),
          content: `**📱 Conectar ao WhatsApp**

        Para conectar seu FuncionarioPro ao WhatsApp:

1. ✅ **Escolha um plano** - Temos opções que cabem no seu orçamento
2. ✅ **QR Code** - Escaneie com seu celular
3. ✅ **Verificação** - Confirme a conexão
4. ✅ **Pronto!** - Funcionário ativo 24h`,
          sender: 'assistant',
          timestamp: new Date(),
          type: 'field',
          fieldData: {
            fieldName: 'connectOption',
            fieldLabel: 'Opção de Conexão',
            fieldType: 'buttons',
            options: [
              { value: 'plan_free', label: '🆓 Teste Grátis 7 dias' },
              { value: 'plan_starter', label: '💼 Plano Mensal R$49,90' },
              { value: 'plan_annual', label: '🔥 Anual R$39,90/mês' }
            ]
          }
        };
        setMessages(prev => [...prev, whatsappConnectMessage]);
        return;
        
      case 'edit_config':
        const editMessage: Message = {
          id: Date.now().toString(),
          content: `**✏️ Editar Configuração**

O que você gostaria de alterar?`,
          sender: 'assistant',
          timestamp: new Date(),
          type: 'field',
          fieldData: {
            fieldName: 'editField',
            fieldLabel: 'Campo para Editar',
            fieldType: 'buttons',
            options: [
              { value: 'edit_businessName', label: '🏷️ Nome do negócio' },
              { value: 'edit_contactPhone', label: '📞 Telefone' },
              { value: 'edit_location', label: '📍 Localização' },
              { value: 'edit_workingHours', label: '🕒 Horários' },
              { value: 'edit_services', label: '🍕 Serviços' },
              { value: 'edit_paymentMethods', label: '💳 Pagamentos' }
            ]
          }
        };
        setMessages(prev => [...prev, editMessage]);
        return;

      case 'show_details':
        const detailsMessage: Message = {
          id: Date.now().toString(),
          content: `**📋 O que será configurado automaticamente:**

**⏰ HORÁRIOS:** Baseado na sua área de atuação
**🛍 SERVIÇOS:** Principais serviços da profissão  
**💳 PAGAMENTOS:** Métodos mais usados no setor
**📅 FUNCIONALIDADES:** Agendamento ou delivery conforme o tipo

**✨ Você poderá ajustar tudo depois!**`,
          sender: 'assistant',
          timestamp: new Date(),
          type: 'field',
          fieldData: {
            fieldName: 'afterDetails',
            fieldLabel: 'Próxima Ação',
            fieldType: 'buttons',
            options: [
              { value: 'proceed_auto', label: '✅ Ok, configure!' },
              { value: 'manual_config', label: '✋ Fazer manual' }
            ]
          }
        };
        setMessages(prev => [...prev, detailsMessage]);
        return;

      case 'clinica':
      case 'restaurante':
      case 'salao':
      case 'oficina':
      case 'loja':
      case 'academia':
      case 'petshop':
      case 'farmacia':
      case 'escola':
        // Iniciar configuração passo a passo diretamente
        startStepByStepConfig(value);
        return;

      case 'outro':
        const otherTypeMessage: Message = {
          id: Date.now().toString(),
          content: `**💼 Perfeito! Vou te ajudar com seu negócio personalizado.**

**Primeiro, me conta:** Você trabalha mais com produtos ou serviços?`,
          sender: 'assistant',
          timestamp: new Date(),
          type: 'field',
          fieldData: {
            fieldName: 'businessCategory',
            fieldLabel: 'Categoria do Negócio',
            fieldType: 'buttons',
            options: [
              { value: 'produtos', label: '📦 Vendo produtos' },
              { value: 'servicos', label: '🔧 Ofereço serviços' },
              { value: 'ambos', label: '🏪 Produtos e serviços' }
            ]
          }
        };
        setMessages(prev => [...prev, otherTypeMessage]);
        return;

      case 'produtos':
      case 'servicos':
      case 'ambos':
        const businessDescMessage: Message = {
          id: Date.now().toString(),
          content: `**✨ Agora me conta qual é seu negócio específico:**

Por exemplo:
${value === 'produtos' ? 
  '• "Vendo roupas femininas"\n• "Trabalho com eletrônicos"\n• "Tenho uma doceria"' :
  value === 'servicos' ?
  '• "Sou arquiteto"\n• "Trabalho com eventos"\n• "Ofereço aulas particulares"' :
  '• "Tenho uma autoescola"\n• "Loja de carros com oficina"\n• "Vendo e instalo ar condicionado"'
}

Vou entender e configurar tudo automaticamente! 😊`,
          sender: 'assistant',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, businessDescMessage]);
        return;

      case 'how_works':
        const howWorksMessage: Message = {
          id: Date.now().toString(),
          content: `**❓ COMO FUNCIONA O FUNCIONARIOPRO:**

**🤖 1. CONFIGURAÇÃO SIMPLES (2 minutos)**
• Você me conta seu tipo de negócio
• Eu configuro automaticamente tudo para você
• Horários, serviços, formas de pagamento, etc.

**📱 2. CONEXÃO COM WHATSAPP**
• Conectamos oficialmente ao seu WhatsApp Web
• Seu número continua o mesmo
• Você recebe todas as conversas no seu celular

**⚡ 3. ATENDIMENTO AUTOMÁTICO 24H**
• Clientes fazem pedidos a qualquer hora
• Sistema agenda consultas automaticamente
• Responde perguntas frequentes na hora
• Você só atende casos que precisam de você

**📈 4. RESULTADOS REAIS:**
• 300% mais vendas em média
• 80% menos tempo perdido com atendimento
• Zero clientes perdidos por falta de resposta
• Funciona mesmo você dormindo!

**💰 5. INVESTIMENTO BAIXO:**
• Teste 7 dias GRÁTIS
• A partir de R$ 49,90/mês
• Sem contrato de fidelidade
• Cancela quando quiser`,
          sender: 'assistant',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, howWorksMessage]);

        setTimeout(() => {
          const howWorksButtons: Message = {
            id: generateUniqueId(),
            content: `**🚀 Ficou interessado?**`,
            sender: 'assistant',
            timestamp: new Date(),
            type: 'field',
            fieldData: {
              fieldName: 'afterHowWorks',
              fieldLabel: 'Próximo Passo',
              fieldType: 'buttons',
              options: [
                { value: 'start_config', label: '⚙️ Quero configurar agora' },
                { value: 'test_free', label: '🧪 Fazer teste grátis' },
                { value: 'see_prices', label: '💰 Ver preços' },
                { value: 'talk_human', label: '💬 Falar com consultor' }
              ]
            }
          };
          setMessages(prev => [...prev, howWorksButtons]);
                 }, 2000);
         return;

      case 'start_config':
        handleChat('quero configurar meu negócio');
        return;

      case 'change_template':
        setShowTemplates(true);
        const backToTemplatesMessage: Message = {
          id: Date.now().toString(),
          content: '🔄 **Voltando aos templates...**\n\nEscolha novamente o tipo do seu negócio:',
          sender: 'assistant',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, backToTemplatesMessage]);
        return;

      case 'manual_config':
        const manualMessage: Message = {
          id: Date.now().toString(),
          content: '✏️ **Configuração manual selecionada!**\n\nVamos começar pelo básico. Me conte qual é o nome do seu negócio?',
          sender: 'assistant',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, manualMessage]);
        setConfigData({ ...configData, isConfiguring: true });
        setCurrentStep(0);
        setTimeout(() => setConfigData({ ...configData, isShowingField: true }), 1000);
        return;

      case 'config_business':
        const askBusinessMessage: Message = {
          id: Date.now().toString(),
          content: '👩‍💼 Perfeito! Me conta qual é a sua profissão ou tipo de negócio. Por exemplo: "sou dentista", "tenho uma pizzaria", "trabalho com cabelo"...',
          sender: 'assistant',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, askBusinessMessage]);
        return;

      case 'test_system':
        handleChat('quero testar o sistema');
        return;

      case 'more_info':
        const moreInfoMessage: Message = {
          id: Date.now().toString(),
          content: `**📚 FUNCIONARIOPRO - INFORMAÇÕES COMPLETAS:**

**🎯 O QUE ELE FAZ:**
Cria um funcionário virtual que atende seus clientes no WhatsApp 24h por dia, 7 dias por semana. Ele agenda consultas, responde perguntas, recebe pedidos e muito mais!

**💰 INVESTIMENTO:**
• **Teste Grátis:** 7 dias - R$ 0,00
• **Profissional:** R$ 49,90/mês  
• **Empresarial:** R$ 149,90/mês

**📈 RESULTADOS REAIS:**
• 300% de aumento nas vendas
• 80% menos tempo gasto com atendimento
• 24h de disponibilidade
• Zero clientes perdidos

**🔧 COMO FUNCIONA:**
1. Você configura (2 minutos)
2. Conectamos ao WhatsApp
3. Clientes são atendidos automaticamente
4. Você só cuida dos casos complexos`,
          sender: 'assistant',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, moreInfoMessage]);

        setTimeout(() => {
          const ctaAfterInfo: Message = {
            id: (Date.now() + 1).toString(),
            content: `**🚀 Ficou interessado?**`,
            sender: 'assistant',
            timestamp: new Date(),
            type: 'field',
            fieldData: {
              fieldName: 'afterInfo',
              fieldLabel: 'Próximo Passo',
              fieldType: 'buttons',
              options: [
                { value: 'start_now', label: '✅ Quero começar agora' },
                { value: 'test_first', label: '🧪 Fazer teste grátis' },
                { value: 'talk_human', label: '💬 Falar com consultor' }
              ]
            }
          };
          setMessages(prev => [...prev, ctaAfterInfo]);
                 }, 2000);
        return;

      case 'edit_info':
        const editFieldsMessage: Message = {
          id: Date.now().toString(),
          content: '✏️ **Escolha o campo que deseja editar:**',
          sender: 'assistant',
          timestamp: new Date(),
          type: 'field',
          fieldData: {
            fieldName: 'editField',
            fieldLabel: 'Campo para Editar',
            fieldType: 'buttons',
            options: [
              { value: 'edit_businessName', label: '🏢 Nome do negócio' },
              { value: 'edit_contactPhone', label: '📱 WhatsApp' },
              { value: 'edit_location', label: '📍 Endereço' },
              { value: 'edit_workingHours', label: '⏰ Horários' },
              { value: 'edit_services', label: '🛍 Serviços' },
              { value: 'edit_paymentMethods', label: '💳 Pagamento' }
            ]
          }
        };
        setMessages(prev => [...prev, editFieldsMessage]);
        return;

      case 'connect_now':
        const connectMessage: Message = {
          id: Date.now().toString(),
          content: '📱 **Para conectar ao WhatsApp:**\n\n1️⃣ Você precisa de uma assinatura ativa\n2️⃣ Nós faremos a conexão oficial para você\n3️⃣ Em 5 minutos estará funcionando\n\n💰 **Planos disponíveis:**\n• **Teste Grátis:** 7 dias - R$ 0,00\n• **Profissional:** R$ 49,90/mês\n• **Empresarial:** R$ 149,90/mês',
          sender: 'assistant',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, connectMessage]);

                 setTimeout(() => {
           const planButtons: Message = {
             id: (Date.now() + 1).toString(),
             content: `**💳 Escolha seu plano:**`,
             sender: 'assistant',
             timestamp: new Date(),
             type: 'field',
             fieldData: {
               fieldName: 'choosePlan',
               fieldLabel: 'Plano',
               fieldType: 'buttons',
               options: [
                 { value: 'test_free', label: '🆓 Teste 7 dias grátis' },
                 { value: 'plan_starter', label: '💼 Starter R$ 47,00' },
                 { value: 'plan_pro', label: '🚀 Pro R$ 97,00' },
                 { value: 'plan_enterprise', label: '🏢 Enterprise R$ 197,00' }
               ]
             }
           };
           setMessages(prev => [...prev, planButtons]);
         }, 1500);
        return;

      case 'see_preview':
        const previewMessage: Message = {
          id: Date.now().toString(),
          content: `📋 **RESUMO DA CONFIGURAÇÃO:**

**🏢 NEGÓCIO:** ${agentData.businessName}
**📱 WHATSAPP:** ${agentData.contactPhone}
**📍 ENDEREÇO:** ${agentData.location}

**⏰ HORÁRIOS:**
${agentData.workingHours}

**🛍 SERVIÇOS:**
${agentData.services}

**💳 PAGAMENTOS:** ${agentData.paymentMethods}
**🚚 DELIVERY:** ${agentData.hasDelivery ? 'Sim ✅' : 'Não ❌'}
**📅 AGENDAMENTOS:** ${agentData.acceptsReservations ? 'Sim ✅' : 'Não ❌'}

**💬 MENSAGEM DE BOAS-VINDAS:**
"${agentData.welcomeMessage}"`,
          sender: 'assistant',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, previewMessage]);
        return;

      // Cases para edição inline
      case 'edit_businessName':
      case 'edit_contactPhone':
      case 'edit_location':
      case 'edit_workingHours':
      case 'edit_services':
      case 'edit_paymentMethods':
        const fieldToEdit = value.replace('edit_', '');
        const fieldLabels = {
          'businessName': 'Nome do negócio',
          'contactPhone': 'WhatsApp',
          'location': 'Endereço',
          'workingHours': 'Horários de funcionamento',
          'services': 'Produtos/Serviços',
          'paymentMethods': 'Formas de pagamento'
        };
        const currentValue = agentData[fieldToEdit as keyof AgentData] as string || '';
        
        const editInlineMessage: Message = {
          id: Date.now().toString(),
          content: `✏️ **Editando: ${fieldLabels[fieldToEdit]}**\n\n**Valor atual:** ${currentValue || 'Não definido'}\n\n**Digite o novo valor:**`,
          sender: 'assistant',
          timestamp: new Date(),
          type: 'field',
          fieldData: {
            fieldName: fieldToEdit,
            fieldLabel: fieldLabels[fieldToEdit],
            fieldType: fieldToEdit === 'workingHours' || fieldToEdit === 'services' ? 'textarea' : 'text',
            placeholder: `Digite ${fieldLabels[fieldToEdit].toLowerCase()}`,
            currentValue: currentValue,
            isEditing: true
          }
        };
                 setMessages(prev => [...prev, editInlineMessage]);
         return;

      // Cases para planos
      case 'test_free':
        const freeTestMessage: Message = {
          id: Date.now().toString(),
          content: `**🆓 TESTE GRÁTIS SELECIONADO!**

Perfeito! Você terá 7 dias para testar todas as funcionalidades sem pagar nada.

**O que você ganha:**
✅ Configuração completa do seu funcionário IA
✅ Conexão com WhatsApp Web
✅ Atendimento automático 24h
✅ Até 500 mensagens gratuitas
✅ Suporte completo

**Para ativar seu teste gratuito, preciso apenas:**
📱 Confirmar seu WhatsApp: ${agentData.contactPhone || '(11) 99999-9999'}
📧 Seu melhor email para login

**Posso ativar agora mesmo!**`,
          sender: 'assistant',
          timestamp: new Date(),
          type: 'field',
          fieldData: {
            fieldName: 'confirmFreeTest',
            fieldLabel: 'Ativar Teste',
            fieldType: 'buttons',
            options: [
              { value: 'activate_free', label: '✅ Ativar teste grátis' },
              { value: 'need_info', label: '📋 Preciso de mais infos' }
            ]
          }
        };
        setMessages(prev => [...prev, freeTestMessage]);
        return;

      case 'plan_starter':
      case 'plan_pro': 
      case 'plan_enterprise':
        // Disparar evento para abrir modal de pagamento
        const planDetails = {
          'plan_starter': { name: 'Starter', price: 47 },
          'plan_pro': { name: 'Pro', price: 97 },
          'plan_enterprise': { name: 'Enterprise', price: 197 }
        };
        
        const plan = planDetails[value];
        const paymentEvent = new CustomEvent('openPaymentModal', {
          detail: { plan }
        });
        window.dispatchEvent(paymentEvent);
        
        const planSelectedMessage: Message = {
          id: Date.now().toString(),
          content: `**💳 Plano ${plan.name} selecionado!**\n\nAbrindo opções de pagamento...`,
          sender: 'assistant',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, planSelectedMessage]);
        return;

      case 'reset_config':
        // Limpar dados salvos
        try {
          sessionStorage.removeItem('functionarioIA_data');
        } catch (e) {
          console.error('Erro ao limpar dados da sessão:', e);
        }
        
        // Limpar estado
        onAgentUpdate({
          businessName: '',
          businessType: '',
          businessInfo: '',
          personality: '',
          welcomeMessage: '',
          template: '',
          workingHours: '',
          services: '',
          location: '',
          paymentMethods: '',
          contactPhone: '',
          hasDelivery: false,
          acceptsReservations: false
        });
        
        // Reiniciar o fluxo
        setShowTemplates(true);
        setMessages([]);
        setConfigData({ ...configData, isConfiguring: false });
        setCurrentStep(0);
        return;
     }

     // Continuar com lógica original se não for ação especial
    const field = CONFIG_FIELDS[currentStep];
    
    // Reset do estado para evitar conflitos
    setConfigData({ ...configData, isShowingField: false });
    
    // Remover todas as mensagens de field para evitar duplicação
    setMessages(prev => prev.filter(msg => msg.type !== 'field'));
    
    // Adicionar mensagem de confirmação do usuário
    const userMessage: Message = {
      id: Date.now().toString(),
      content: value,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Atualizar os dados primeiro
    const updateData = {
      [field.step]: field.step === 'hasDelivery' || field.step === 'acceptsReservations' 
        ? value === 'true' 
        : value
    };
    
    onAgentUpdate(updateData);
    
    // Aguardar a atualização e então incrementar o step
    setTimeout(() => {
      setCurrentStep(prev => prev + 1);
      setTimeout(() => {
        setConfigData({ ...configData, isShowingField: true });
      }, 150);
    }, 100);
  };

  const completeConfiguration = () => {
    setConfigData({ ...configData, isConfiguring: false });
    
    // Salvar dados na sessão
    try {
      sessionStorage.setItem('functionarioIA_data', JSON.stringify(agentData));
    } catch (e) {
      console.error('Erro ao salvar dados na sessão:', e);
    }
    
    // Primeiro mostrar mensagem de conclusão
    const completionMessage: Message = {
      id: Date.now().toString(),
              content: `Pronto!\n\nSeu FuncionarioPro está configurado.\n\nPróximos passos:\n• Use "Conectar WhatsApp" para ativar em produção\n• Quer alterar algo? É só dizer!`,
      sender: 'assistant',
      timestamp: new Date(),
      type: 'field',
      fieldData: {
        fieldName: 'afterConfiguration',
        fieldLabel: 'Próxima Ação',
        fieldType: 'buttons',
        options: [
          { value: 'test_now', label: 'Testar no simulador' },
          { value: 'connect_whatsapp', label: 'Conectar WhatsApp' },
          { value: 'edit_config', label: 'Editar configuração' }
        ]
      }
    };
    setMessages(prev => [...prev, completionMessage]);
    
    // Após 2 segundos, mostrar automaticamente o simulador de WhatsApp apenas uma vez
    setTimeout(() => {
      // Verificar se já não existe um simulador nas mensagens
      const hasWhatsApp = messages.some(msg => msg.type === 'whatsapp');
      if (!hasWhatsApp) {
        const whatsappMessage: Message = {
          id: generateUniqueId(),
          content: 'Teste seu funcionário virtual:',
          sender: 'assistant',
          timestamp: new Date(),
          type: 'whatsapp'
        };
        setMessages(prev => [...prev, whatsappMessage]);
      }
    }, 2000);
  };

  useEffect(() => {
    // Carregar dados salvos da sessão ao inicializar
    try {
      const savedData = sessionStorage.getItem('functionarioIA_data');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        onAgentUpdate(parsedData);
      }
    } catch (e) {
      console.error('Erro ao carregar dados da sessão:', e);
    }
  }, []);

  // Salvamento automático sempre que agentData muda
  useEffect(() => {
    if (agentData.businessName || agentData.businessType || agentData.contactPhone) {
      try {
        sessionStorage.setItem('functionarioIA_data', JSON.stringify(agentData));
      } catch (e) {
        console.error('Erro ao salvar dados na sessão:', e);
      }
    }
  }, [agentData]);



  return (
    <div className="flex-1 flex flex-col h-full min-h-0">
      {/* Chat Container - SEM HEADER - com altura mínima 0 para permitir overflow */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden bg-white min-h-0">
        <div className="w-full max-w-full md:max-w-2xl mx-auto px-3 md:px-4 py-3 md:py-4 space-y-3 md:space-y-4 pb-8 md:pb-6">
      {showTemplates ? (
        renderTemplates()
      ) : (
        <>
              {messages.map((message) => (
                <div key={message.id} className="mb-3 md:mb-4">
                  <div className="flex items-start gap-2 md:gap-4 w-full">
                    <div className="w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      {message.sender === 'assistant' ? (
                        <div className="w-6 h-6 md:w-8 md:h-8 bg-black rounded-full flex items-center justify-center">
                          <Bot className="w-3 h-3 md:w-4 md:h-4 text-white" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 md:w-8 md:h-8 bg-gray-700 rounded-full flex items-center justify-center">
                          <User className="w-3 h-3 md:w-4 md:h-4 text-white" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0 overflow-hidden">
                      {(!message.type || message.type === 'text' || message.type === 'completion') && (
                        <div className="text-xs md:text-base text-gray-900 leading-relaxed whitespace-pre-wrap break-words word-break">
                          {message.content}
                        </div>
                      )}

                      {message.type === 'field' && message.fieldData && (
                        <div className="w-full">
                          <div className="text-xs md:text-base text-gray-900 leading-relaxed whitespace-pre-wrap mb-3 break-words word-break">
                            {message.content}
                          </div>
                          <div className="w-full overflow-hidden">
                          <InlineFieldInput
                            fieldName={message.fieldData.fieldName}
                            fieldLabel={message.fieldData.fieldLabel}
                            fieldType={message.fieldData.fieldType}
                            placeholder={message.fieldData.placeholder}
                            currentValue={message.fieldData.currentValue}
                            onSubmit={handleFieldResponse}
                            onCancel={() => {
                              setMessages(prev => prev.filter(m => m.id !== message.id));
                            }}
                            options={message.fieldData.options}
                          />
                          </div>
                        </div>
                      )}

                      {message.type === 'whatsapp' && (
                        <div className="w-full">
                          <div className="text-xs md:text-base text-gray-900 leading-relaxed whitespace-pre-wrap mb-2 break-words word-break">
                            {message.content}
                          </div>
                          {/* WhatsApp Simulator SEM container cinza - alinhado à esquerda */}
                          <div className="w-full max-w-[280px] md:max-w-sm">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-gray-600">WhatsApp Simulator</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setMessages(prev => prev.filter(m => m.id !== message.id));
                                }}
                                className="h-5 w-5 p-0 text-gray-400 hover:text-gray-600"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                              <WhatsAppSimulator 
                                agentData={agentData} 
                                onClose={() => {
                                  setMessages(prev => prev.filter(m => m.id !== message.id));
                                }}
                              />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="mb-3 md:mb-4">
                  <div className="flex items-start gap-2 md:gap-4">
                    <div className="w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <div className="w-6 h-6 md:w-8 md:h-8 bg-black rounded-full flex items-center justify-center animate-pulse">
                        <Bot className="w-3 h-3 md:w-4 md:h-4 text-white" />
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-500 mt-2">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
        </>
      )}
        </div>
      </div>

      {/* Input Area - SÓ APARECE APÓS PRIMEIRA INTERAÇÃO */}
      {!showTemplates && (
        <div className="fixed bottom-0 left-0 right-0 md:static border-t border-gray-200 bg-white p-3 md:p-4 z-10">
          <div className="w-full max-w-2xl mx-auto px-1 md:px-0">
            <div className="flex items-center gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
                  placeholder="Digite sua mensagem..."
                  className="w-full px-3 py-3 md:py-3 pr-10 bg-gray-50 border border-gray-300 rounded-lg text-sm md:text-base
                    focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent
                    placeholder-gray-500"
            />
            <button
              onClick={() => sendMessage()}
              disabled={!currentMessage.trim() || isLoading}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 
                    bg-black hover:bg-gray-800 disabled:bg-gray-300 
                    text-white rounded-lg p-1.5 md:p-2 transition-colors"
            >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-3 w-3 md:h-4 md:w-4 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <svg className="w-3 h-3 md:w-4 md:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
            </button>
          </div>
        </div>
      </div>
        </div>
      )}
    </div>
  );
};

export default CalibrationChat; 