import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Bot, Menu, X, ChevronDown, Star, Zap, Shield, Clock, Send } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import WhatsAppSimulator from './WhatsAppSimulator';
import { MISTRAL_CONFIG, getCurrentModelConfig } from '../config/mistral-config.js';
import BUSINESS_TEMPLATES from '../data/base_conhecimento_funcionario_ia.json';
import { toast } from 'sonner';


interface LandingPageProps {
  onTemplateSelect: (templateKey: string) => void;
}

const TEMPLATES = {
  restaurante: { 
    icon: '🍕', 
    title: 'Restaurante', 
    subtitle: 'Gerencia reservas, anota pedidos e responde dúvidas sobre o cardápio 24h por dia, aumentando os pedidos.' 
  },
  clinica: { 
    icon: '🏥', 
    title: 'Clínica', 
    subtitle: 'Agenda consultas, confirma horários e responde sobre convênios, reduzindo em até 80% as chamadas para recepção.' 
  },
  salao: { 
    icon: '💄', 
    title: 'Salão', 
    subtitle: 'Marca horários, envia lembretes e gerencia a agenda dos profissionais, garantindo uma ocupação 50% maior.' 
  },
  loja: { 
    icon: '🛍️', 
    title: 'Loja', 
    subtitle: 'Apresenta produtos, responde sobre estoque e auxilia na finalização da compra, capturando mais clientes.' 
  },
  oficina: { 
    icon: '🔧', 
    title: 'Oficina', 
    subtitle: 'Agenda revisões, envia orçamentos e atualiza o status do serviço, melhorando a comunicação com o cliente.' 
  },
  academia: { 
    icon: '💪', 
    title: 'Academia', 
    subtitle: 'Realiza matrículas, agenda aulas experimentais e responde sobre planos, tudo de forma automática.' 
  },
  dentista: { 
    icon: '🦷', 
    title: 'Dentista', 
    subtitle: 'Agenda avaliações e procedimentos, envia lembretes e responde sobre tratamentos, otimizando a agenda.' 
  },
  advocacia: { 
    icon: '⚖️', 
    title: 'Advocacia', 
    subtitle: 'Qualifica casos, agenda consultas iniciais e fornece informações sobre áreas de atuação, filtrando clientes.' 
  },
  contabilidade: { 
    icon: '📊', 
    title: 'Contabilidade', 
    subtitle: 'Responde dúvidas comuns sobre impostos, agenda reuniões e coleta documentos de novos clientes.' 
  },
  petshop: { 
    icon: '🐕', 
    title: 'Pet Shop', 
    subtitle: 'Agenda banho e tosa, informa sobre produtos e lembra os clientes sobre vacinas e vermífugos.' 
  },
  hotel: { 
    icon: '🏨', 
    title: 'Hotel', 
    subtitle: 'Gerencia reservas, confirma check-in/check-out e oferece serviços de quarto, melhorando a experiência do hóspede.' 
  },
  imobiliaria: { 
    icon: '🏠', 
    title: 'Imobiliária', 
    subtitle: 'Agenda visitas, qualifica leads e responde dúvidas sobre imóveis 24/7, acelerando o ciclo de vendas.'
  }
};

const LandingPage: React.FC<LandingPageProps> = ({ onTemplateSelect }) => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [activeSimulator, setActiveSimulator] = useState<string | null>(null);

  // PLACEHOLDER ANIMADO COM EFEITO DE DIGITAÇÃO
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [currentPlaceholder, setCurrentPlaceholder] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  
  const placeholders = [
    "Crie um atendente para minha clínica...",
    "Quero automatizar meu restaurante...", 
    "Preciso de um assistente para advocacia...",
    "Automatizar atendimento do meu salão...",
    "Criar funcionário virtual para loja...",
    "Assistente automático para consultório..."
  ];

  // Sequência de mensagens tranquilizadoras
  const loadingMessages = [
    "Analisando sua solicitação...",
    "Personalizando seu funcionário virtual...",
    "Configurando respostas inteligentes...",
    "Ajustando tom de comunicação...",
    "Preparando ambiente de trabalho...",
    "Quase pronto! Finalizando configurações..."
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
          timeout = setTimeout(typeChar, 80); // Velocidade de digitação mais lenta
        } else {
          timeout = setTimeout(() => {
            eraseText();
          }, 3000); // Tempo para ler aumentado
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
            setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
            timeout = setTimeout(typeText, 1000); // Pausa antes do próximo
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

  // Efeito para alternar mensagens durante o carregamento
  useEffect(() => {
    let messageIndex = 0;
    let interval: NodeJS.Timeout;

    if (isLoading) {
      setLoadingMessage(loadingMessages[0]);
      interval = setInterval(() => {
        messageIndex = (messageIndex + 1) % loadingMessages.length;
        setLoadingMessage(loadingMessages[messageIndex]);
      }, 3000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading]);

  const handleCreateAgentFromPrompt = async () => {
    if (!currentMessage.trim()) return;
    
    // Iniciar loading imediatamente
    setIsLoading(true);
    setLoadingMessage(loadingMessages[0]);

    const businessTypes = Object.keys(BUSINESS_TEMPLATES.tipos_negocio);
    const initialPrompt = `
      Analise a frase do usuário e retorne um objeto JSON completo para personalizar todo o fluxo de configuração.

      Categorias disponíveis: [${businessTypes.join(', ')}]
      
      Use "clinica" para: advogados médicos dentistas psicólogos contadores
      Use "restaurante" para: lanchonetes bares cafeterias delivery de comida
      Use "loja" para: comércio em geral varejo e-commerce
      Use "salao" para: barbearias cabeleireiros estética spa
      
      Frase do usuário: "${currentMessage}"

      IMPORTANTE: Adapte as perguntas de entrega e agendamento ao contexto:
      - Para clínicas/consultórios/advogados: use "Trabalha com agendamento?" para ambos hasDelivery e acceptsReservations
      - Para restaurantes/lojas: use "Oferece entrega?" e "Aceita reservas?"
      - Para salões/barbearias: use "Oferece serviço domiciliar?" e "Trabalha com agendamento?"
      - Para oficinas: use "Oferece busca/entrega?" e "Trabalha com agendamento?"

      Retorne um JSON compacto:
      {
        "categoria_template": "clinica",
        "nome_negocio_especifico": "Escritório de Advocacia",
        "perguntas_personalizadas": {
          "businessName": "Nome do seu escritório?",
          "contactPhone": "WhatsApp para contato?",
          "services": "Áreas de atuação?",
          "workingHours": "Horário de atendimento?",
          "paymentMethods": "Como recebe pagamento?",
          "location": "Localização?",
          "hasDelivery": "Trabalha com agendamento?",
          "acceptsReservations": "Trabalha com agendamento?"
        },
        "placeholders_exemplos": {
          "businessName": "Ex: Silva Advocacia",
          "contactPhone": "Ex: (11) 99999-9999",
          "services": "Ex: Civil, Trabalhista",
          "paymentMethods": "Ex: PIX, Transferência",
          "workingHours": "Ex: Seg-Sex 8h-18h",
          "location": "Ex: Rua das Flores, 123"
        }
      }

      Responda APENAS com o objeto JSON válido.
    `;

    try {
      const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${MISTRAL_CONFIG.API_KEY}` },
        body: JSON.stringify({
          model: MISTRAL_CONFIG.CURRENT.model,
          messages: [{ role: 'user', content: initialPrompt }],
          temperature: 0.1,
          max_tokens: 500,
          response_format: { type: "json_object" },
        }),
      });

      if (!response.ok) throw new Error(`Erro da API Mistral: ${response.statusText}`);

      const data = await response.json();
      const resultText = data.choices[0].message.content;
      console.log(`🤖 Resposta crua da IA: ${resultText}`);
      
      // Verificar se o JSON está completo
      if (!resultText.trim().endsWith('}')) {
        throw new Error('Resposta da IA foi truncada. Tentando novamente...');
      }
      
      const resultJson = JSON.parse(resultText);
      const { categoria_template, nome_negocio_especifico, perguntas_personalizadas, placeholders_exemplos } = resultJson;

      if (categoria_template && nome_negocio_especifico && businessTypes.includes(categoria_template)) {
        console.log(`✅ Identificado: Categoria=${categoria_template}, Específico=${nome_negocio_especifico}`);
        toast.success(`Entendido! Vamos configurar seu ${nome_negocio_especifico}`);
        
        // Passar todos os dados personalizados pela URL
        const customData = encodeURIComponent(JSON.stringify({
          perguntas_personalizadas,
          placeholders_exemplos
        }));
        
        // Garantir tempo mínimo de exibição das mensagens de loading
        setTimeout(() => {
          navigate(`/chat?tipo=${categoria_template}&nome=${encodeURIComponent(nome_negocio_especifico)}&custom=${customData}`);
        }, 2000);
      } else {
        throw new Error('A resposta da IA não continha os dados esperados.');
      }
    } catch (error) {
      console.error("Erro ao contatar ou processar resposta da IA:", error);
      toast.error("Não consegui entender, vamos configurar como uma loja e você ajusta.");
      setTimeout(() => {
        navigate(`/chat?tipo=loja`);
      }, 2000);
    }
  };

  const handleTemplateSelect = (templateKey: string) => {
    setActiveSimulator(templateKey);
  };

  return (
    <div className="min-h-screen bg-white relative overflow-x-hidden">
      {/* Sidebar Colapsado */}
      <div className={`fixed top-0 left-0 h-full w-80 bg-gray-50 border-r border-gray-200 transform transition-transform duration-300 z-30 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl">FuncionárioPro</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="p-1 hover:bg-gray-200 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <nav className="space-y-2">
            <a href="#como-funciona" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg" onClick={() => setSidebarOpen(false)}>Como funciona</a>
            <a href="#precos" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg" onClick={() => setSidebarOpen(false)}>Preços</a>
            <a href="#casos-de-uso" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg" onClick={() => setSidebarOpen(false)}>Casos de Uso</a>
            <a href="#faq" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg" onClick={() => setSidebarOpen(false)}>FAQ</a>
            <a href="https://wa.me/551132300474" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Suporte</a>
          </nav>
        </div>
      </div>

      {/* Overlay quando sidebar aberto */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/20 z-20" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Header com Menu */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-b border-gray-100 z-10">
        <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center gap-2 md:gap-3">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 md:p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 md:w-7 md:h-7 bg-black rounded-lg flex items-center justify-center">
                <Bot className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
              </div>
              <span className="font-bold text-base md:text-lg">FuncionárioPro</span>
            </div>
          </div>
          
          <div className="flex items-center">
            <a href="https://wa.me/551132300474" className="text-sm text-gray-600 hover:text-gray-900">
              Suporte
            </a>
            <Button variant="outline" size="sm" className="hidden md:inline-flex ml-4">Fazer login</Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col justify-center items-center px-4 md:px-6 pt-16 md:pt-20">
        <div className="text-center w-full max-w-3xl mx-auto">
          {/* Título principal - BEM menor */}
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-3 md:mb-4 leading-tight px-2">
            Crie seu{' '}
            <span className="bg-gradient-to-r from-black to-gray-600 bg-clip-text text-transparent">
              FuncionárioPro
            </span>
          </h1>
          
          {/* Subtítulo limpo - BEM menor */}
          <p className="text-base md:text-lg text-gray-600 mb-10 md:mb-12 max-w-2xl mx-auto px-2">
            Atendimento inteligente que aumenta suas vendas 300% no WhatsApp.
          </p>

          {/* Input principal GIGANTE - foco principal */}
          <div className="w-full max-w-3xl mx-auto mb-6 md:mb-8 px-2">
            {/* Loading Message */}
            {isLoading && (
              <div className="flex items-center justify-center mb-4">
                <div className="flex items-center gap-3 text-gray-700 bg-gray-50 px-4 py-2 rounded-lg shadow-sm">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                  <span className="text-sm font-medium">{loadingMessage}</span>
                </div>
              </div>
            )}
            
            <div className="relative">
              <textarea
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleCreateAgentFromPrompt();
                  }
                }}
                disabled={isLoading}
                autoFocus
                placeholder={currentPlaceholder + (isTyping ? '|' : '')}
                className="w-full h-32 md:h-40 px-6 py-6 text-lg md:text-xl bg-white border-2 border-gray-200 rounded-2xl
                  focus:outline-none focus:border-black focus:ring-4 focus:ring-black/5
                  placeholder-gray-400 shadow-xl resize-none transition-all duration-300
                  hover:border-gray-300 hover:shadow-2xl
                  dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-500 dark:focus:border-blue-500"
                style={{ 
                  fontSize: 'clamp(18px, 3vw, 22px)',
                  lineHeight: '1.5'
                }}
              />
              
              <Button
                size="lg"
                onClick={handleCreateAgentFromPrompt}
                disabled={isLoading}
                className="absolute bottom-4 right-4 rounded-xl px-6 py-3 text-base font-semibold
                  bg-black hover:bg-gray-800 text-white
                  dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Criar Funcionário
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Menu sutil embaixo - mais compacto */}
          <div className="flex flex-wrap justify-center items-center gap-x-3 md:gap-x-4 gap-y-1 text-xs md:text-sm text-gray-500 px-4 mb-3">
            <button 
              onClick={() => onTemplateSelect("Quero criar meu FuncionárioPro")}
              className="text-black hover:underline font-medium"
            >
              Criar meu FuncionárioPro
            </button>
            <span className="text-gray-300">•</span>
            <a href="#como-funciona" className="hover:text-gray-700 transition-colors">Como funciona</a>
            <span className="text-gray-300">•</span>
            <a href="#casos-de-uso" className="hover:text-gray-700 transition-colors">Casos de Uso</a>
            <span className="text-gray-300">•</span>
            <a href="#faq" className="hover:text-gray-700 transition-colors">FAQ</a>
            <span className="text-gray-300">•</span>
            <a href="https://wa.me/551132300474" className="hover:text-gray-700 transition-colors">Ajuda</a>
          </div>
          
          <div className="text-xs text-gray-400">
            Configure em 2 minutos • Teste grátis por 7 dias
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-5 h-5 md:w-6 md:h-6 text-gray-400" />
        </div>
      </section>

      {/* Seção Como Funciona */}
      <section id="como-funciona" className="py-16 md:py-20 px-4 md:px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">Como funciona?</h2>
            <p className="text-gray-600 mt-4 text-lg">Em apenas 3 passos simples, seu negócio opera no piloto automático.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            <div className="text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-black rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6">
                <span className="text-white font-bold text-lg md:text-xl">1</span>
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Configure em 2 minutos</h3>
              <p className="text-sm md:text-base text-gray-600">Conte seu tipo de negócio e nossa IA configura automaticamente horários, serviços e personalidade</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-black rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6">
                <span className="text-white font-bold text-lg md:text-xl">2</span>
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Conecte ao WhatsApp</h3>
              <p className="text-sm md:text-base text-gray-600">Escaneie um QR Code e pronto! Seu funcionário virtual está ativo 24h no seu WhatsApp</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-black rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-4 md:mb-6">
                <span className="text-white font-bold text-lg md:text-xl">3</span>
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-3 md:mb-4">Venda enquanto dorme</h3>
              <p className="text-sm md:text-base text-gray-600">Clientes são atendidos automaticamente, fazem pedidos e agendam. Você só cuida dos casos complexos</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Seção de Casos de Uso Interativos - Estilo GPT Store */}
      <section id="casos-de-uso" className="py-16 md:py-24 px-4 md:px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-3 md:mb-4">Casos de Uso</h2>
            <p className="text-gray-600 text-lg">Veja como o FuncionárioPro se adapta perfeitamente ao seu negócio.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
            {Object.entries(TEMPLATES).map(([key, template]) => (
              <div 
                key={key} 
                onClick={() => handleTemplateSelect(key)}
                className="group flex flex-col text-left p-6 bg-white rounded-2xl h-full border border-transparent hover:border-gray-300 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
              >
                <div className="text-4xl mb-4">{template.icon}</div>
                <div className="flex-1 flex flex-col">
                  <h3 className="text-lg font-bold mb-2 text-gray-900">{template.title}</h3>
                  <p className="text-gray-600 text-sm flex-1 mb-6">
                    {template.subtitle}
                  </p>
                  <div
                    className="w-full text-sm font-semibold text-black group-hover:underline mt-auto"
                  >
                    Testar Simulação →
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {activeSimulator && (
        <Dialog open={!!activeSimulator} onOpenChange={() => setActiveSimulator(null)}>
          <DialogContent className="sm:max-w-[425px] bg-white p-0">
            <DialogHeader className="p-6 pb-0">
              <DialogTitle className="flex items-center gap-3">
                <span className="text-2xl">{TEMPLATES[activeSimulator as keyof typeof TEMPLATES].icon}</span>
                <span>Simulação para {TEMPLATES[activeSimulator as keyof typeof TEMPLATES].title}</span>
              </DialogTitle>
              <DialogDescription className="pt-2">
                Veja uma demonstração de como o FuncionárioPro atenderia um cliente real do seu negócio.
              </DialogDescription>
            </DialogHeader>
            <div className="p-6 pt-0">
              <WhatsAppSimulator templateKey={activeSimulator} />
              <Button 
                className="w-full mt-4 bg-black text-white hover:bg-gray-800"
                onClick={() => {
                  setActiveSimulator(null);
                  onTemplateSelect(`Quero criar um funcionário para ${TEMPLATES[activeSimulator as keyof typeof TEMPLATES].title}`);
                }}
              >
                Criar meu FuncionárioPro
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <section className="py-8 md:py-12 px-4 md:px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 md:gap-2 bg-white px-4 md:px-6 py-2 md:py-3 rounded-full text-sm md:text-base text-gray-700 shadow-sm border mb-6 md:mb-8">
            <Zap className="w-4 h-4 md:w-5 md:h-5" />
            <span>Atendimento 24h automático no WhatsApp</span>
          </div>
          
          {/* Prova social */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm md:text-base text-gray-600">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 md:w-5 md:h-5 fill-yellow-400 text-yellow-400" />
              <span>4.9/5 em avaliações</span>
            </div>
            <span className="hidden sm:inline text-gray-300">•</span>
            <span>+2.000 negócios automatizados</span>
            <span className="hidden sm:inline text-gray-300">•</span>
            <span>300% mais vendas em média</span>
          </div>
        </div>
      </section>

      <section id="precos" className="py-16 md:py-20 px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 md:mb-8">Investimento que se paga</h2>
          <p className="text-lg md:text-xl text-gray-600 mb-10 md:mb-12">Escolha o plano ideal para seu negócio</p>
          
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg w-full max-w-sm border">
              <h3 className="text-lg font-bold mb-2">Plano Mensal</h3>
              <p className="text-3xl font-bold mb-2">R$ 49,90<span className="text-base font-normal">/mês</span></p>
              <ul className="text-sm text-gray-600 space-y-1 mb-4">
                <li>✅ Atendimento 24h</li>
                <li>✅ Agendamentos ilimitados</li>
                <li>✅ 1 número de WhatsApp</li>
              </ul>
              <Button className="w-full bg-black hover:bg-gray-800 text-white" onClick={() => onTemplateSelect("Quero o plano mensal")}>Configurar grátis</Button>
              <p className="text-[10px] md:text-xs text-gray-500 mt-2">Use o cupom FUNCIONARIO10 e ganhe R$ 10 de desconto</p>
            </div>
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg w-full max-w-sm border">
              <h3 className="text-lg font-bold mb-2">Plano Anual</h3>
              <p className="text-3xl font-bold mb-2">R$ 499<span className="text-base font-normal">/ano</span></p>
              <ul className="text-sm text-gray-600 space-y-1 mb-4">
                <li>✅ Todos os benefícios do mensal</li>
                <li>✅ Desconto de R$ 99</li>
                <li>✅ Suporte prioritário</li>
              </ul>
              <Button className="w-full bg-gray-900 hover:bg-black text-white" onClick={() => onTemplateSelect("Quero o plano anual")}>Começar teste grátis</Button>
              <p className="text-[10px] md:text-xs text-gray-500 mt-2">Use o cupom FUNCIONARIO100 e ganhe R$ 100 de desconto</p>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="py-16 md:py-20 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 md:mb-16">Perguntas frequentes</h2>
          <div className="space-y-4 md:space-y-6">
            {[
              {
                q: "É difícil de configurar?",
                a: "Não! Em 2 minutos você conta seu tipo de negócio e nossa IA configura tudo automaticamente."
              },
              {
                q: "Funciona para qualquer negócio?",
                a: "Sim! Atendemos restaurantes, clínicas, salões, lojas, escritórios e muito mais."
              },
              {
                q: "Como conecta no meu WhatsApp?",
                a: "Você escaneia um QR Code e conectamos oficialmente ao WhatsApp Web. Simples e seguro."
              },
              {
                q: "Posso cancelar quando quiser?",
                a: "Claro! Não há contrato de fidelidade. Cancele a qualquer momento pelo painel."
              },
              {
                q: "Qual a diferença entre os planos?",
                a: "O plano mensal tem limite de 1.000 mensagens. O anual é ilimitado e sai mais barato."
              },
              {
                q: "Tem suporte se eu precisar?",
                a: "Sim! Temos suporte via WhatsApp no +55 11 3230-0474 para ajudar sempre que precisar."
              }
            ].map((faq, index) => (
              <details key={index} className="border border-gray-200 rounded-lg p-4 md:p-6 group">
                <summary className="font-semibold text-sm md:text-base cursor-pointer flex items-center justify-between">
                  {faq.q}
                  <ChevronDown className="w-4 h-4 md:w-5 md:h-5 group-open:rotate-180 transition-transform" />
                </summary>
                <p className="mt-3 text-sm md:text-base text-gray-600">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-black text-white text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-6">Pronto para automatizar seu atendimento?</h2>
          <p className="text-xl mb-8 text-gray-300">Configure em 2 minutos e comece a vender 24h</p>
          <Button 
            size="lg" 
            className="bg-white text-black hover:bg-gray-100"
            onClick={() => onTemplateSelect("Quero criar meu FuncionárioPro")}
          >
            Começar agora grátis
          </Button>
          <p className="text-sm text-gray-400 mt-4">
            7 dias de teste grátis • Sem contrato de fidelidade • Suporte incluído
          </p>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;