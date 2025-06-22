
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, ArrowLeft, Phone, Video, MoreVertical, User } from 'lucide-react';
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
}

const WhatsAppSimulator: React.FC<WhatsAppSimulatorProps> = ({ agentData }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

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

    return `Você é um assistente virtual do ${agentData.businessName}.

INFORMAÇÕES DO NEGÓCIO:
${agentData.businessInfo}

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
          model: 'mistral-small-latest',
          messages: [
            { role: 'system', content: buildSystemPrompt() },
            ...conversationHistory,
            { role: 'user', content: inputMessage.trim() }
          ],
          max_tokens: 500,
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
      content: agentData.welcomeMessage,
      sender: 'agent',
      timestamp: new Date()
    }]);
  };

  return (
    <div className="w-80 h-[600px] bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
      {/* WhatsApp Header */}
      <div className="bg-green-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ArrowLeft className="h-5 w-5 cursor-pointer" />
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
              <User className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">{agentData.businessName || 'Assistente'}</h3>
              <p className="text-xs text-green-100">online</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Video className="h-5 w-5 cursor-pointer" />
            <Phone className="h-5 w-5 cursor-pointer" />
            <MoreVertical className="h-5 w-5 cursor-pointer" />
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 h-[calc(600px-140px)] overflow-y-auto bg-gray-50 bg-opacity-50" 
           style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23f0f0f0' fill-opacity='0.3'%3E%3Cpath d='M20 20c0 5.5-4.5 10-10 10s-10-4.5-10-10 4.5-10 10-10 10 4.5 10 10zm10 0c0 5.5-4.5 10-10 10s-10-4.5-10-10 4.5-10 10-10 10 4.5 10 10z'/%3E%3C/g%3E%3C/svg%3E')" }}>
        <div className="p-4 space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-2xl relative ${
                  message.sender === 'user'
                    ? 'bg-green-500 text-white rounded-br-sm'
                    : 'bg-white text-gray-800 shadow-sm rounded-bl-sm'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.sender === 'user' ? 'text-green-100' : 'text-gray-400'
                }`}>
                  {message.timestamp.toLocaleTimeString('pt-BR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white px-4 py-2 rounded-2xl rounded-bl-sm shadow-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-gray-100 p-3">
        <div className="flex items-center space-x-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite uma mensagem"
            disabled={isLoading}
            className="flex-1 rounded-full border-gray-300 bg-white"
          />
          <Button
            onClick={sendMessage}
            disabled={isLoading || !inputMessage.trim()}
            size="icon"
            className="rounded-full bg-green-600 hover:bg-green-700 text-white"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Clear Chat Button */}
      <div className="p-2 text-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={clearChat}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          Limpar Conversa
        </Button>
      </div>
    </div>
  );
};

export default WhatsAppSimulator;
