
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Bot, User, Sparkles, Store, Coffee, Car, Heart, Briefcase, Home } from 'lucide-react';
import { AgentData } from './MonetizedAgentBuilder';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

interface CalibrationChatProps {
  agentData: AgentData;
  onAgentUpdate: (data: Partial<AgentData>) => void;
}

const businessSuggestions = [
  { icon: Store, label: 'Loja', type: 'loja' },
  { icon: Coffee, label: 'Restaurante', type: 'restaurante' },
  { icon: Car, label: 'Oficina', type: 'oficina' },
  { icon: Heart, label: 'Clínica', type: 'clinica' },
  { icon: Briefcase, label: 'Escritório', type: 'escritorio' },
  { icon: Home, label: 'Hotel', type: 'hotel' },
];

const CalibrationChat: React.FC<CalibrationChatProps> = ({ agentData, onAgentUpdate }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Olá! Sou seu assistente para configurar o funcionário IA perfeito para seu negócio. Vamos começar? Que tipo de negócio você tem?',
      sender: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const buildSystemPrompt = () => {
    return `Você é um assistente especializado em configurar agentes de IA para negócios. Seu objetivo é entender o negócio do usuário e ajudar a configurar um funcionário virtual perfeito.

INSTRUÇÕES IMPORTANTES:
- Faça perguntas específicas sobre o negócio
- Sugira melhorias na personalidade do agente
- Ajude a definir informações importantes do negócio
- Seja conversacional e amigável
- Quando o usuário fornecer informações, confirme e sugira próximos passos
- Foque em: nome do negócio, tipo, horários, serviços, personalidade do atendimento

INFORMAÇÕES ATUAIS DO AGENTE:
- Nome: ${agentData.businessName || 'Não definido'}
- Tipo: ${agentData.businessType}
- Informações: ${agentData.businessInfo || 'Não definido'}
- Personalidade: ${agentData.personality}

Responda sempre em português brasileiro de forma natural e útil.`;
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
      const assistantResponse = data.choices[0]?.message?.content || 'Desculpe, não consegui processar sua mensagem.';

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: assistantResponse,
        sender: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Análise automática para atualizar dados do agente
      analyzeAndUpdateAgent(inputMessage.trim(), assistantResponse);

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Erro na Comunicação",
        description: "Não foi possível enviar a mensagem. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeAndUpdateAgent = (userInput: string, assistantResponse: string) => {
    const input = userInput.toLowerCase();
    
    // Detectar nome do negócio
    const nomeMatch = input.match(/(?:chama|nome|é)\s+(.+?)(?:\s|$|,|\.)/);
    if (nomeMatch && !agentData.businessName) {
      onAgentUpdate({ businessName: nomeMatch[1].trim() });
    }

    // Detectar tipo de negócio
    if (input.includes('restaurante') || input.includes('lanchonete') || input.includes('comida')) {
      onAgentUpdate({ businessType: 'restaurante', template: 'restaurante' });
    } else if (input.includes('loja') || input.includes('comércio') || input.includes('vendo')) {
      onAgentUpdate({ businessType: 'loja', template: 'loja' });
    } else if (input.includes('clínica') || input.includes('médico') || input.includes('saúde')) {
      onAgentUpdate({ businessType: 'clinica', template: 'clinica' });
    }

    // Atualizar informações do negócio
    if (input.length > 20 && !input.includes('?')) {
      const currentInfo = agentData.businessInfo || '';
      if (!currentInfo.includes(userInput.substring(0, 50))) {
        onAgentUpdate({ 
          businessInfo: currentInfo ? `${currentInfo}\n\n${userInput}` : userInput 
        });
      }
    }
  };

  const handleSuggestionClick = (suggestion: typeof businessSuggestions[0]) => {
    const message = `Tenho um ${suggestion.label.toLowerCase()}`;
    setInputMessage(message);
    onAgentUpdate({ businessType: suggestion.type, template: suggestion.type });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Quick Suggestions */}
      {!agentData.businessName && (
        <div className="p-4 border-b bg-gray-50">
          <p className="text-sm text-gray-600 mb-3">Sugestões rápidas:</p>
          <div className="flex flex-wrap gap-2">
            {businessSuggestions.map((suggestion) => {
              const Icon = suggestion.icon;
              return (
                <button
                  key={suggestion.type}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="flex items-center space-x-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Icon className="h-4 w-4 text-gray-600" />
                  <span className="text-sm text-gray-700">{suggestion.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start space-x-2 max-w-xs lg:max-w-md`}>
              {message.sender === 'assistant' && (
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
              )}
              <div
                className={`px-4 py-3 rounded-2xl ${
                  message.sender === 'user'
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.sender === 'user' ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString('pt-BR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
              {message.sender === 'user' && (
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div className="bg-gray-100 px-4 py-3 rounded-2xl">
                <div className="flex space-x-1">
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

      {/* Input */}
      <div className="p-4 border-t bg-white">
        <div className="flex space-x-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Descreva seu negócio ou faça uma pergunta..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={sendMessage}
            disabled={isLoading || !inputMessage.trim()}
            className="bg-black hover:bg-gray-800 text-white"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          💡 Conte sobre seu negócio para calibrar o funcionário IA perfeitamente
        </p>
      </div>
    </div>
  );
};

export default CalibrationChat;
