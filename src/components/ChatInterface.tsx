import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Bot, User, ArrowLeft } from 'lucide-react';
import { AgentData } from './AgentBuilder';
import { useToast } from '@/hooks/use-toast';
import baseKnowledge from '@/data/base_conhecimento_funcionario_ia.json';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'agent';
  timestamp: Date;
}

interface ChatInterfaceProps {
  agentData: AgentData;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ agentData }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Initialize with welcome message
  useEffect(() => {
    if (agentData.welcomeMessage && messages.length === 0) {
      setMessages([{
        id: '1',
        content: agentData.welcomeMessage,
        sender: 'agent',
        timestamp: new Date()
      }]);
    }
  }, [agentData.welcomeMessage, messages.length]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const buildSystemPrompt = () => {
    const personalityMap = {
      'amigavel': 'Seja muito amigável, caloroso e acolhedor. Use uma linguagem descontraída e sempre demonstre interesse genuíno.',
      'profissional': 'Mantenha um tom profissional, formal e respeitoso. Seja claro e objetivo nas respostas.',
      'divertido': 'Seja divertido, use emojis quando apropriado e mantenha uma conversa descontraída e alegre.',
      'tecnico': 'Seja direto, técnico e focado em informações precisas. Evite linguagem muito casual.',
      'vendedor': 'Seja persuasivo e focado em destacar benefícios. Conduza a conversa para fechar vendas ou agendamentos.'
    };

    const businessType = baseKnowledge.tipos_negocio[agentData.businessType as keyof typeof baseKnowledge.tipos_negocio];
    const businessConfig = businessType?.configuracao_padrao || {};
    const businessExamples = businessType?.exemplos_uso || [];

    return `Você é um assistente virtual do ${agentData.businessName}.

INFORMAÇÕES DO NEGÓCIO:
${agentData.businessInfo}

CONFIGURAÇÃO PADRÃO:
Horários: ${businessConfig.horarios || 'Não definido'}
Serviços: ${businessConfig.servicos || 'Não definido'}
Formas de Pagamento: ${businessConfig.pagamentos || 'Não definido'}
${businessConfig.agendamento ? '✓ Aceita Agendamentos' : '✗ Não Aceita Agendamentos'}
${businessConfig.delivery ? '✓ Faz Delivery' : '✗ Não Faz Delivery'}

EXEMPLOS DE USO:
${businessExamples.map(ex => `- ${ex}`).join('\n')}

PERSONALIDADE:
${personalityMap[agentData.personality as keyof typeof personalityMap]}

INSTRUÇÕES:
- Responda sempre em português brasileiro
- Seja útil e prestativo
- Se não souber algo específico, seja honesto
- Mantenha as respostas focadas no negócio
- Tente sempre ajudar o cliente a resolver sua necessidade
- Se apropriado para o tipo de negócio, tente conduzir para agendamentos ou vendas

Responda de forma natural e conversacional.`;
  };

  const sendMessage = async (messageContent?: string) => {
    const content = messageContent || inputMessage;
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: content.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const conversationHistory = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer OOf5YOgTZDgiyxTu0oBAdWT9NYKA8gqe'
        },
        body: JSON.stringify({
          model: 'mistral-large-2411',
          messages: [
            { role: 'system', content: buildSystemPrompt() },
            ...conversationHistory,
            { role: 'user', content: content.trim() }
          ],
          max_tokens: 1000,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const agentResponse = data.choices[0]?.message?.content || 'Desculpe, não consegui processar sua mensagem.';

      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: agentResponse,
        sender: 'agent',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, agentMessage]);

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Erro na Comunicação",
        description: "Não foi possível enviar a mensagem. Tente novamente.",
        variant: "destructive"
      });

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Desculpe, estou com dificuldades técnicas no momento. Tente novamente em instantes.',
        sender: 'agent',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const onBack = () => {
    // Implement the back functionality
  };

  const handleSuggestionClick = (suggestion: string) => {
    switch (suggestion) {
      case "Configurar meu negócio":
        sendMessage("Quero configurar o meu negócio.");
        break;
      case "Testar o simulador":
        sendMessage("Gostaria de testar o simulador.");
        break;
      case "Conectar ao WhatsApp":
        window.dispatchEvent(new CustomEvent('open-whatsapp-modal'));
        break;
      case "Ver planos":
        window.dispatchEvent(new CustomEvent('open-upgrade-modal'));
        break;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Área de Mensagens - Minimalista */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          /* Estado Inicial - Foco no Input */
          <div className="h-full flex flex-col items-center justify-center px-4">
            <div className="max-w-2xl w-full text-center mb-8">
              <div className="flex items-center gap-3 justify-center">
                <Avatar className="h-12 w-12 border">
                  <AvatarImage src={agentData.logo || '/placeholder.svg'} alt={agentData.businessName} />
                  <AvatarFallback>{agentData.businessName ? agentData.businessName.charAt(0) : 'A'}</AvatarFallback>
                </Avatar>
                <h1 className="text-2xl font-semibold text-gray-900">
                  Como posso te ajudar hoje?
                </h1>
              </div>
            </div>
          </div>
        ) : (
          /* Mensagens */
          <div className="max-w-3xl mx-auto px-4 py-8">
            {messages.map((message) => (
              <div key={message.id} className="mb-6 group">
                <div className="flex items-start space-x-4">
                  {/* Avatar */}
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    {message.sender === 'agent' ? (
                      <div className="w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                    ) : (
                      <div className="w-7 h-7 bg-gray-700 rounded-full flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                  
                  {/* Conteúdo da Mensagem */}
                  <div className="flex-1 min-w-0">
                    <div className="prose prose-sm max-w-none">
                      <p className="text-gray-800 text-base leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Indicador de Digitação */}
            {isLoading && (
              <div className="mb-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-1 text-gray-500">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Área de Input - Foco e Minimalismo */}
      <div className="p-4 bg-white border-t">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col gap-2">
            <div className="relative">
              <Input
                type="text"
                placeholder="Digite sua mensagem aqui..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full pl-4 pr-12 py-3 h-14 text-base rounded-lg bg-gray-50 border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                disabled={isLoading}
              />
              <Button
                size="icon"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full h-9 w-9 bg-blue-600 hover:bg-blue-700"
                onClick={() => sendMessage()}
                disabled={isLoading || !inputMessage.trim()}
              >
                <Send className="h-5 w-5 text-white" />
              </Button>
            </div>
            
            {/* Sugestões de Ação - Sempre visíveis */}
            <div className="flex flex-wrap gap-2 px-1">
              <button
                onClick={() => handleSuggestionClick("Configurar meu negócio")}
                className="text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md px-3 py-1.5 transition-colors"
              >
                Configurar meu negócio
              </button>
              <button
                onClick={() => handleSuggestionClick("Testar o simulador")}
                className="text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md px-3 py-1.5 transition-colors"
              >
                Testar o simulador
              </button>
              <button
                onClick={() => handleSuggestionClick("Conectar ao WhatsApp")}
                className="text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md px-3 py-1.5 transition-colors"
              >
                Conectar ao WhatsApp
              </button>
              <button
                onClick={() => handleSuggestionClick("Ver planos")}
                className="text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md px-3 py-1.5 transition-colors"
              >
                Ver planos
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
