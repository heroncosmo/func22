import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, ArrowLeft, Phone, Video, MoreVertical, User, X } from 'lucide-react';
import { AgentData } from './MonetizedAgentBuilder';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'agent';
  timestamp: Date;
}

interface WhatsAppSimulatorProps {
  agentData: AgentData;
  onClose?: () => void;
}

const WhatsAppSimulator: React.FC<WhatsAppSimulatorProps> = ({ agentData, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Initialize with welcome message usando businessInfo completo
  useEffect(() => {
    if (messages.length === 0) {
      // Processar o welcomeMessage substituindo {businessName}
      let welcomeMsg = agentData.welcomeMessage || 
        `Olá! Bem-vindo ao ${agentData.businessName || 'nosso negócio'}! 
        
Como posso ajudá-lo hoje? 😊

🕒 *Horário:* ${agentData.workingHours || 'Consulte nossos horários'}
📍 *Local:* ${agentData.location || 'Entre em contato para saber nossa localização'}
📱 *Contato:* ${agentData.contactPhone || 'Em breve disponibilizaremos o telefone'}

${agentData.services ? `✨ *Nossos serviços:*\n${agentData.services}` : ''}

${agentData.paymentMethods ? `💳 *Formas de pagamento:* ${agentData.paymentMethods}` : ''}`;

      // Substituir placeholders no welcomeMessage
      if (agentData.welcomeMessage) {
        welcomeMsg = agentData.welcomeMessage
          .replace(/{businessName}/g, agentData.businessName || 'nosso negócio')
          .replace(/{businessType}/g, agentData.businessType || 'estabelecimento');
      }

      setMessages([{
        id: '1',
        content: welcomeMsg,
        sender: 'agent',
        timestamp: new Date()
      }]);
    }
  }, [agentData, messages.length]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const buildSystemPrompt = () => {
    const personalityMap = {
      'amigavel': 'Seja muito amigável, caloroso e acolhedor. Use linguagem natural, mostre interesse genuíno pelo cliente e seja sempre atencioso.',
      'profissional': 'Mantenha um tom profissional mas humano. Seja respeitoso, claro e demonstre expertise no seu negócio.',
      'divertido': 'Seja carismático e descontraído. Use emojis moderadamente e mantenha um clima alegre e positivo.',
      'tecnico': 'Seja preciso e informativo, mas não robótico. Explique com clareza e demonstre conhecimento técnico.',
      'vendedor': 'Seja persuasivo de forma natural. Destaque benefícios genuinamente e ajude o cliente a tomar a melhor decisão.'
    };

    const businessTypeContext = {
      'clinica': 'Você trabalha na área da saúde/serviços. Seja empático, profissional e demonstre cuidado com o bem-estar do paciente.',
      'restaurante': 'Você trabalha no setor alimentício. Seja acolhedor, desperte o apetite do cliente e demonstre paixão pela culinária.',
      'salao': 'Você trabalha na área de beleza/estética. Seja carinhoso, realce a autoestima do cliente e demonstre carinho pelos detalhes.',
      'oficina': 'Você trabalha com serviços técnicos. Seja confiável, mostre competência e tranquilize sobre a qualidade do serviço.',
      'loja': 'Você trabalha no comércio. Seja prestativo, conhecedor dos produtos e focado em atender as necessidades do cliente.'
    };

    return `Você é um funcionário HUMANO e dedicado do ${agentData.businessName || 'negócio'}, NÃO um assistente virtual.

VOCÊ É UMA PESSOA REAL que trabalha aqui e se preocupa genuinamente com este estabelecimento e com cada cliente.

INFORMAÇÕES DO SEU LOCAL DE TRABALHO:
- Nome: ${agentData.businessName || 'nosso estabelecimento'}
- Tipo: ${agentData.businessType || 'nosso negócio'}
- Telefone: ${agentData.contactPhone || '(disponibilizaremos em breve)'}
- Endereço: ${agentData.location || '(entre em contato para saber nossa localização)'}
- Horários: ${agentData.workingHours || 'consulte nossos horários'}
- Serviços/Produtos: ${agentData.services || 'diversos serviços disponíveis'}
- Formas de Pagamento: ${agentData.paymentMethods || 'várias opções disponíveis'}
- Informações Adicionais: ${agentData.businessInfo || 'estamos aqui para atender você'}

SUA PERSONALIDADE:
${personalityMap[agentData.personality as keyof typeof personalityMap] || 'Seja profissional, amigável e atencioso'}

CONTEXTO DA SUA ÁREA:
${businessTypeContext[agentData.businessType as keyof typeof businessTypeContext] || 'Demonstre conhecimento sobre seu negócio e paixão pelo que faz.'}

COMO VOCÊ DEVE AGIR:
✅ Fale como uma PESSOA REAL que trabalha aqui há anos
✅ Demonstre ORGULHO e CARINHO pelo estabelecimento
✅ Mostre CONHECIMENTO PROFUNDO sobre produtos/serviços
✅ Seja PROATIVO em ajudar e sugerir soluções
✅ Use linguagem NATURAL e CONVERSACIONAL
✅ Quando apropriado, conte brevemente sobre sua experiência
✅ Demonstre que você REALMENTE SE IMPORTA com o cliente
✅ Se o cliente tem urgência, mostre que você quer ajudar rápido

NUNCA:
❌ Diga que é um "assistente virtual" ou "bot"
❌ Seja genérico ou robótico
❌ Dê respostas curtas demais
❌ Ignore o contexto emocional do cliente

EXEMPLOS DE COMO RESPONDER:

Cliente: "Olá"
❌ Ruim: "Olá! Como posso ajudar?"
✅ Bom: "Oi! Seja bem-vindo(a) ao ${agentData.businessName || 'nosso estabelecimento'}! 😊 Fico feliz em falar com você! Como posso te ajudar hoje?"

Cliente: "Qual o horário?"
❌ Ruim: "Horário: ${agentData.workingHours || 'consulte'}"
✅ Bom: "Olha só, funcionamos ${agentData.workingHours || 'em horários especiais - posso te passar certinho!'}. Que dia você estava pensando em vir? Posso já te adiantar se temos disponibilidade! 📅"

LEMBRE-SE: Você é uma pessoa real, dedicada e apaixonada pelo seu trabalho. Cada cliente é importante para você e para o sucesso do seu local de trabalho.`;
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage.trim(),
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
            { role: 'user', content: inputMessage.trim() }
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

  const clearChat = () => {
    setMessages([{
      id: '1',
      content: agentData.welcomeMessage || `Olá! Bem-vindo ao ${agentData.businessName || 'nosso negócio'}! Como posso ajudá-lo hoje?`,
      sender: 'agent',
      timestamp: new Date()
    }]);
  };

  return (
    <div className="w-full max-w-[280px] md:max-w-xs h-[380px] md:h-[450px] bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex flex-col">
      {/* WhatsApp Header simples */}
      <div className="bg-green-600 text-white p-2 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 md:w-8 md:h-8 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
              <User className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-xs md:text-sm truncate">{agentData.businessName || 'Assistente'}</h3>
              <p className="text-[10px] md:text-xs text-green-100">online</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              onClick={clearChat}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-green-700 text-[9px] md:text-[10px] px-1 py-0.5 h-auto"
            >
              Limpar
            </Button>
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="h-5 w-5 md:h-6 md:w-6 text-white hover:bg-green-700 p-0"
            >
              <X className="h-2.5 w-2.5 md:h-3 md:w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages Area - FLEX-1 para ocupar espaço restante */}
      <div className="flex-1 overflow-y-auto bg-gray-50 bg-opacity-50" 
           style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23f0f0f0' fill-opacity='0.3'%3E%3Cpath d='M20 20c0 5.5-4.5 10-10 10s-10-4.5-10-10 4.5-10 10-10 10 4.5 10 10zm10 0c0 5.5-4.5 10-10 10s-10-4.5-10-10 4.5-10 10-10 10 4.5 10 10z'/%3E%3C/g%3E%3C/svg%3E')" }}>
        <div className="p-2 space-y-1.5 md:space-y-2 min-h-full">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] md:max-w-[80%] px-2 md:px-2.5 py-1 md:py-1.5 rounded-2xl relative text-xs md:text-sm ${
                  message.sender === 'user'
                    ? 'bg-green-500 text-white rounded-br-sm'
                    : 'bg-white text-gray-800 shadow-sm rounded-bl-sm'
                }`}
              >
                <p className="whitespace-pre-wrap break-words leading-tight">{message.content}</p>
                <span className={`text-[8px] md:text-[9px] ${message.sender === 'user' ? 'text-green-100' : 'text-gray-500'} block text-right mt-0.5`}>
                  {message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white text-gray-800 shadow-sm rounded-2xl rounded-bl-sm px-2 py-1.5">
                <div className="flex space-x-0.5">
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area - FIXO NO BOTTOM */}
      <div className="flex-shrink-0 p-2 bg-white border-t border-gray-200">
        <div className="flex items-center space-x-1.5">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite uma mensagem..."
            className="flex-1 rounded-full bg-gray-100 border-0 focus:ring-1 focus:ring-green-500 text-xs h-7 md:h-8 px-2.5"
            disabled={isLoading}
          />
          <Button
            onClick={sendMessage}
            size="icon"
            className="rounded-full bg-green-500 hover:bg-green-600 text-white h-7 w-7 md:h-8 md:w-8 flex-shrink-0"
            disabled={isLoading || !inputMessage.trim()}
          >
            <Send className="h-2.5 w-2.5 md:h-3 md:w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppSimulator;
