import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Bot, Menu, X, ChevronDown, Star, Zap, Shield, Clock, Send } from 'lucide-react';

interface LandingPageProps {
  onStartChat: (message: string) => void;
  onTemplateSelect: (templateKey: string) => void;
}

const TEMPLATES = {
  restaurante: { icon: '🍕', title: 'Restaurante' },
  clinica: { icon: '🏥', title: 'Clínica' },
  salao: { icon: '💄', title: 'Salão' },
  loja: { icon: '🛍️', title: 'Loja' },
  oficina: { icon: '🔧', title: 'Oficina' },
  academia: { icon: '💪', title: 'Academia' }
};

const LandingPage: React.FC<LandingPageProps> = ({ onStartChat, onTemplateSelect }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

  const handleStartChat = () => {
    if (!currentMessage.trim()) return;
    setIsLoading(true);
    setTimeout(() => {
      onStartChat(currentMessage);
      setIsLoading(false);
    }, 500);
  };

  const handleTemplateSelect = (templateKey: string) => {
    onTemplateSelect(templateKey);
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Sidebar Colapsado */}
      <div className={`fixed top-0 left-0 h-full w-80 bg-gray-50 border-r border-gray-200 transform transition-transform duration-300 z-30 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl">FuncionarioPro</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="p-1 hover:bg-gray-200 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <nav className="space-y-2">
            <a href="#como-funciona" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg" onClick={() => setSidebarOpen(false)}>Como funciona</a>
            <a href="#precos" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg" onClick={() => setSidebarOpen(false)}>Preços</a>
            <a href="#casos-sucesso" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg" onClick={() => setSidebarOpen(false)}>Casos de sucesso</a>
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
              <span className="font-bold text-base md:text-lg">FuncionarioPro</span>
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

      {/* Hero Section - 100vh sem scroll */}
      <section className="min-h-screen flex flex-col justify-center items-center px-4 md:px-6 pt-16 md:pt-20">
        <div className="text-center w-full max-w-5xl mx-auto">
          {/* Badge de destaque */}
          <div className="inline-flex items-center gap-1.5 md:gap-2 bg-gray-100 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm text-gray-700 mb-6 md:mb-8">
            <Zap className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <span>Atendimento 24h automático no WhatsApp</span>
          </div>

          {/* Título principal */}
          <h1 className="text-3xl sm:text-4xl md:text-7xl font-bold text-gray-900 mb-4 md:mb-6 leading-tight px-2">
            Crie seu{' '}
            <span className="bg-gradient-to-r from-black to-gray-600 bg-clip-text text-transparent">
              FuncionarioPro
            </span>
          </h1>
          
          {/* Subtítulo */}
          <p className="text-lg sm:text-xl md:text-2xl text-gray-600 mb-4 max-w-4xl mx-auto leading-relaxed px-2">
            Atendente virtual que responde clientes, agenda automaticamente e <strong>aumenta suas vendas 24h</strong> no WhatsApp
          </p>

          {/* Prova social rápida */}
          <div className="flex items-center justify-center gap-2 sm:gap-4 md:gap-6 text-xs md:text-sm text-gray-500 mb-8 md:mb-12">
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 md:w-4 md:h-4 fill-yellow-400 text-yellow-400" />
              <span>4.9/5 em avaliações</span>
            </div>
            <span className="inline text-gray-300">•</span>
            <span>+2.000 negócios automatizados</span>
            <span className="inline text-gray-300">•</span>
            <span>300% mais vendas em média</span>
          </div>

          {/* Input principal gigante */}
          <div className="w-full max-w-4xl mx-auto mb-6 md:mb-8 px-2">
            <div className="relative">
              <textarea
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleStartChat();
                  }
                }}
                placeholder={currentPlaceholder + (isTyping ? '|' : '')}
                className="w-full h-[4.5rem] md:h-24 px-4 md:px-6 py-4 md:py-6 text-base md:text-xl bg-white border-2 border-gray-200 rounded-xl md:rounded-2xl
                  focus:outline-none focus:border-black focus:ring-4 focus:ring-black/5
                  placeholder-gray-400 shadow-lg resize-none transition-all duration-300
                  hover:border-gray-300 hover:shadow-xl"
                style={{ 
                  fontSize: 'clamp(14px, 2vw, 20px)',
                  lineHeight: '1.4'
                }}
              />
              
              <button
                onClick={handleStartChat}
                disabled={!currentMessage.trim() || isLoading}
                className="absolute bottom-3 md:bottom-4 right-3 md:right-4 bg-black hover:bg-gray-800 disabled:bg-gray-300 
                  text-white rounded-lg md:rounded-xl p-2 md:p-3 transition-all duration-200 shadow-lg
                  disabled:cursor-not-allowed hover:scale-105 active:scale-95"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-2 border-white border-t-transparent"></div>
                ) : (
                  <Send className="w-4 h-4 md:w-5 md:h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Modelos rápidos */}
          <div className="flex flex-wrap justify-center gap-1.5 md:gap-2 mb-6 md:mb-8 px-2">
            {Object.entries(TEMPLATES).slice(0, 6).map(([key, template]) => (
              <button
                key={key}
                onClick={() => handleTemplateSelect(key)}
                className="inline-flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-1.5 md:py-2 bg-gray-100 hover:bg-gray-200 
                  rounded-lg text-xs md:text-sm text-gray-700 transition-colors"
              >
                <span>{template.icon}</span>
                <span>{template.title}</span>
              </button>
            ))}
          </div>

          {/* CTA secundário */}
          <p className="text-xs md:text-sm text-gray-500 px-4">
            Configure em 2 minutos • Teste grátis por 7 dias • 
            <a href="https://wa.me/551132300474" className="text-black hover:underline ml-1">
              Precisa de ajuda?
            </a>
          </p>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-5 h-5 md:w-6 md:h-6 text-gray-400" />
        </div>
      </section>

      {/* Seções de scroll reveal */}
      <section id="como-funciona" className="py-16 md:py-20 px-4 md:px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 md:mb-16">Como funciona?</h2>
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

      <section id="precos" className="py-16 md:py-20 px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 md:mb-8">Investimento que se paga</h2>
          <p className="text-lg md:text-xl text-gray-600 mb-10 md:mb-12">Escolha o plano ideal para seu negócio</p>
          
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            <div className="border-2 border-gray-200 rounded-xl md:rounded-2xl p-6 md:p-8">
              <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Mensal</h3>
              <div className="text-3xl md:text-4xl font-bold mb-2">R$ 49,90<span className="text-base md:text-lg text-gray-500">/mês</span></div>
              <p className="text-gray-600 mb-6">Perfeito para começar</p>
              <Button className="w-full bg-black hover:bg-gray-800" size="lg">Começar agora</Button>
              <p className="text-[10px] md:text-xs text-gray-500 mt-2">Use o cupom FUNCIONARIO10 e ganhe R$ 10 de desconto</p>
            </div>
            <div className="border-2 border-black rounded-xl md:rounded-2xl p-6 md:p-8 relative">
              <div className="absolute -top-2.5 md:-top-3 left-1/2 transform -translate-x-1/2 bg-black text-white px-3 md:px-4 py-0.5 md:py-1 rounded-full text-xs md:text-sm">
                Mais popular
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Anual</h3>
              <div className="text-3xl md:text-4xl font-bold mb-2">R$ 499,00<span className="text-base md:text-lg text-gray-500">/ano</span></div>
              <p className="text-gray-600 mb-6">2 meses grátis • R$ 41,58/mês</p>
              <Button className="w-full bg-black hover:bg-gray-800" size="lg">Escolher anual</Button>
              <p className="text-[10px] md:text-xs text-gray-500 mt-2">Use o cupom FUNCIONARIO100 e ganhe R$ 100 de desconto</p>
            </div>
          </div>
        </div>
      </section>

      <section id="casos-sucesso" className="py-16 md:py-20 px-4 md:px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 md:mb-16">Casos de sucesso reais</h2>
          <div className="grid md:grid-cols-3 gap-4 md:gap-8">
            <div className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl">
              <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  🍕
                </div>
                <div>
                  <h4 className="font-semibold text-sm md:text-base">Pizzaria Vila Nova</h4>
                  <p className="text-xs md:text-sm text-gray-600">São Paulo, SP</p>
                </div>
              </div>
              <p className="text-sm md:text-base text-gray-700 mb-3 md:mb-4">"Aumentamos 300% os pedidos noturnos. O FuncionarioPro atende quando estamos fechados!"</p>
              <div className="text-xs md:text-sm text-gray-500">+300% em vendas noturnas</div>
            </div>
            <div className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl">
              <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  🏥
                </div>
                <div>
                  <h4 className="font-semibold text-sm md:text-base">Clínica Dr. Silva</h4>
                  <p className="text-xs md:text-sm text-gray-600">Rio de Janeiro, RJ</p>
                </div>
              </div>
              <p className="text-sm md:text-base text-gray-700 mb-3 md:mb-4">"Reduziu 80% do tempo gasto com agendamentos. Pacientes agendam sozinhos!"</p>
              <div className="text-xs md:text-sm text-gray-500">-80% tempo de atendimento</div>
            </div>
            <div className="bg-white p-4 md:p-6 rounded-xl md:rounded-2xl">
              <div className="flex items-center gap-3 md:gap-4 mb-3 md:mb-4">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-pink-100 rounded-full flex items-center justify-center">
                  💄
                </div>
                <div>
                  <h4 className="font-semibold text-sm md:text-base">Salão Beleza Pura</h4>
                  <p className="text-xs md:text-sm text-gray-600">Belo Horizonte, MG</p>
                </div>
              </div>
              <p className="text-sm md:text-base text-gray-700 mb-3 md:mb-4">"Agenda lotada todos os dias. Clientes adoram a praticidade de agendar pelo WhatsApp!"</p>
              <div className="text-xs md:text-sm text-gray-500">+250% ocupação da agenda</div>
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

      {/* CTA Final */}
      <section className="py-20 px-6 bg-black text-white text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-6">Pronto para automatizar seu atendimento?</h2>
          <p className="text-xl mb-8 text-gray-300">Configure em 2 minutos e comece a vender 24h</p>
          <Button 
            size="lg" 
            className="bg-white text-black hover:bg-gray-100"
            onClick={() => onStartChat("Quero criar meu FuncionarioPro")}
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