import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bot, RefreshCw, Send } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from './ui/button';
import { MISTRAL_CONFIG } from '../config/mistral-config.js'; // Importar configuração
import BUSINESS_TEMPLATES from '../data/base_conhecimento_funcionario_ia.json'; // Importar templates

interface TemplateStep {
  fieldName: string;
  fieldPrompt: string;
}

interface TemplateData {
  businessName: string;
  businessType: string;
  businessInfo: string;
  personality: string;
  welcomeMessage: string;
  steps: TemplateStep[];
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

interface Message {
  id: number;
  sender: 'user' | 'bot';
  content: React.ReactNode;
  delay: number;
}

interface Props {
  templateKey?: string;
  agentData?: AgentData;
  onClose?: () => void;
}

const WhatsAppSimulator: React.FC<Props> = ({ templateKey, agentData: initialAgentData, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [key, setKey] = useState(0);
  const [isSimulationComplete, setIsSimulationComplete] = useState(false);
  const [testInput, setTestInput] = useState('');
  const [isTestMode, setIsTestMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAgentData, setCurrentAgentData] = useState<AgentData | undefined>(initialAgentData);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Carregar dados do agente a partir do templateKey se não forem passados diretamente
  useEffect(() => {
    if (templateKey && !initialAgentData) {
      const templateData = (BUSINESS_TEMPLATES.tipos_negocio as any)[templateKey];
      if (templateData) {
        // Construir agentData a partir da estrutura real do JSON
        setCurrentAgentData({
          businessName: `Simulação ${templateKey.charAt(0).toUpperCase() + templateKey.slice(1)}`,
          businessType: templateKey,
          businessInfo: `Uma simulação de atendimento para ${templateKey}.`,
          personality: "amigável e prestativo",
          welcomeMessage: `Olá! Bem-vindo(a) à simulação de atendimento para ${templateKey}. Como posso ajudar?`,
          template: templateKey,
          services: templateData.configuracao_padrao?.servicos || 'Nossos serviços',
          workingHours: templateData.configuracao_padrao?.horarios || 'Nosso horário',
          location: 'Localização não informada na simulação',
          paymentMethods: templateData.configuracao_padrao?.pagamentos || 'Nossas formas de pagamento',
          contactPhone: 'Contato não informado na simulação',
          hasDelivery: templateData.configuracao_padrao?.delivery || false,
          acceptsReservations: templateData.configuracao_padrao?.agendamento || false,
        });
      }
    } else if (initialAgentData) {
      setCurrentAgentData(initialAgentData);
    }
  }, [templateKey, initialAgentData]);

  // Nova função central para chamar a API do Mistral
  const callMistralAI = async (prompt: string): Promise<string> => {
    setIsLoading(true);
    try {
      const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MISTRAL_CONFIG.API_KEY}`
        },
        body: JSON.stringify({
          model: MISTRAL_CONFIG.CURRENT.model,
          messages: [
            { role: 'user', content: prompt }
          ],
          max_tokens: 600,
          temperature: 0.7,
          response_format: { type: "json_object" } // Solicitar JSON
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || '{}';
    } catch (error) {
      console.error('❌ Erro na chamada da IA:', error);
      return '{}'; // Retorna um JSON vazio em caso de erro
    } finally {
      setIsLoading(false);
    }
  };

  const generateSimulationWithAI = useCallback(async () => {
    if (!currentAgentData) return;

    setMessages([]);
    setIsSimulationComplete(false);
    setIsTestMode(false);
    
    const systemPrompt = `
      Você é um roteirista de simulações de atendimento no WhatsApp.
      Sua tarefa é criar uma conversa realista, completa e HUMANIZADA entre um cliente e um atendente de IA para o negócio abaixo.

      DADOS DO NEGÓCIO:
      - Nome: ${currentAgentData.businessName}
      - Tipo: ${currentAgentData.businessType}
      - Descrição: ${currentAgentData.businessInfo}
      - Personalidade do Atendente: ${currentAgentData.personality}
      - Mensagem de Boas-Vindas: ${currentAgentData.welcomeMessage}
      - Serviços/Produtos: ${currentAgentData.services}
      - Horários: ${currentAgentData.workingHours}
      - Localização: ${currentAgentData.location}
      - Pagamento: ${currentAgentData.paymentMethods}
      - Contato: ${currentAgentData.contactPhone}
      - Faz Entrega: ${currentAgentData.hasDelivery ? 'Sim' : 'Não'}
      - Aceita Agendamento: ${currentAgentData.acceptsReservations ? 'Sim' : 'Não'}

      REGRAS ESTRITAS:
      1. A conversa DEVE ter um começo, meio e fim claros. O cliente inicia, o atendente resolve a questão, e o atendente finaliza a conversa de forma prestativa.
      2. A conversa deve ter entre 6 a 8 trocas de mensagens no total (3-4 do usuário, 3-4 do bot).
      3. A última mensagem da conversa OBRIGATORIAMENTE deve ser do atendente ('sender': 'bot').
      4. As respostas do atendente precisam ser EXTREMAMENTE HUMANAS, usando a personalidade definida e as informações do negócio de forma natural. Não use jargões robóticos.
      5. A resposta DEVE ser um objeto JSON válido contendo uma única chave "simulation" que é um array de objetos.
      6. Cada objeto no array deve ter as chaves: "id" (número sequencial), "sender" ("user" ou "bot"), "content" (string da mensagem) e "delay" (número em milissegundos, entre 800 e 2500).
      
      EXEMPLO DE SAÍDA JSON:
      {
        "simulation": [
          { "id": 1, "sender": "user", "content": "Oi, tudo bem?", "delay": 800 },
          { "id": 2, "sender": "bot", "content": "Olá! Tudo ótimo e com você? Bem-vindo...", "delay": 1500 },
          { "id": 7, "sender": "bot", "content": "Perfeito! Se precisar de mais algo, é só chamar!", "delay": 1200 }
        ]
      }
    `;

    let simulationScript: Message[] = [];
    const maxRetries = 3;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      console.log(`🤖 Tentativa ${attempt} de gerar simulação com IA...`);
      const jsonResponse = await callMistralAI(systemPrompt);

      try {
        const parsedData = JSON.parse(jsonResponse);
        const script = parsedData.simulation || [];

        // Validação do script gerado
        if (script.length > 0 && script[script.length - 1].sender === 'bot') {
          simulationScript = script;
          console.log('✅ Simulação gerada com sucesso!');
          break; // Sai do loop se for bem-sucedido
        } else {
          console.warn(`⚠️ Tentativa ${attempt} falhou: script inválido ou incompleto.`, script);
        }
      } catch (e) {
        console.error(`❌ Tentativa ${attempt} falhou: erro ao processar JSON.`, e);
      }

      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1500)); // Espera 1.5s antes de tentar novamente
      }
    }

    if (simulationScript.length > 0) {
        let isActive = true;
        const showMessages = async (index: number) => {
          if (!isActive || index >= simulationScript.length) {
            if (isActive) {
              setTimeout(() => setIsSimulationComplete(true), 1000);
            }
            return;
          }
          await new Promise(resolve => setTimeout(resolve, simulationScript[index].delay));
          if (isActive) {
            setMessages(prev => [...prev, simulationScript[index]]);
            showMessages(index + 1);
          }
        };
        showMessages(0);
        return () => { isActive = false; };
    } else {
        console.error('❌ Falha ao gerar simulação após todas as tentativas.');
        setMessages([{ id: 1, sender: 'bot', content: 'Ops! Tive um problema para criar a simulação. Por favor, clique em "Reiniciar Simulação" para tentar de novo. Se o erro persistir, nossa equipe já foi notificada! 🛠️', delay: 0 }]);
    }
  }, [currentAgentData, key]);

  useEffect(() => {
    generateSimulationWithAI();
  }, [generateSimulationWithAI]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleTestMessage = async () => {
    if (!testInput.trim() || !currentAgentData) return;

    const userMessage: Message = {
      id: messages.length + 1,
      sender: 'user' as const,
      content: testInput,
      delay: 0
    };
    
    setMessages(prev => [...prev, userMessage]);
    const currentInput = testInput;
    setTestInput('');

    const responsePrompt = `
      Você é um atendente de IA para o seguinte negócio:

      DADOS DO NEGÓCIO:
      - Nome: ${currentAgentData.businessName}
      - Tipo: ${currentAgentData.businessType}
      - Descrição: ${currentAgentData.businessInfo}
      - Personalidade do Atendente: ${currentAgentData.personality}
      - Serviços/Produtos: ${currentAgentData.services}
      - Horários: ${currentAgentData.workingHours}
      - Localização: ${currentAgentData.location}
      - Pagamento: ${currentAgentData.paymentMethods}
      - Contato: ${currentAgentData.contactPhone}
      - Faz Entrega: ${currentAgentData.hasDelivery ? 'Sim' : 'Não'}
      - Aceita Agendamento: ${currentAgentData.acceptsReservations ? 'Sim' : 'Não'}
      
      INSTRUÇÕES:
      1. Responda à pergunta do cliente de forma HUMANIZADA, NATURAL e específica para o negócio.
      2. Use as informações fornecidas e a personalidade definida.
      3. A resposta DEVE ser um objeto JSON com uma única chave "response", contendo a sua resposta em texto.

      PERGUNTA DO CLIENTE: "${currentInput}"

      EXEMPLO DE SAÍDA JSON:
      {
        "response": "Claro, posso te ajudar com isso! Nossos serviços de advocacia..."
      }
    `;
    
    const jsonResponse = await callMistralAI(responsePrompt);
    
    try {
        const parsedData = JSON.parse(jsonResponse);
        const botResponseContent = parsedData.response || "Desculpe, não entendi. Pode reformular a pergunta?";
        
        const botMessage: Message = {
            id: messages.length + 2,
            sender: 'bot' as const,
            content: botResponseContent,
            delay: 0
        };
        setMessages(prev => [...prev, botMessage]);
    } catch (e) {
        console.error("Erro ao processar JSON da resposta da IA:", e);
    }
  };
  
  const restartAnimation = useCallback(() => {
    setKey(prevKey => prevKey + 1);
  }, []);

  return (
    <div className="flex flex-col h-96">
      <div ref={chatContainerRef} className="flex-1 bg-[#E5DDD5] p-4 rounded-lg overflow-y-auto flex flex-col gap-3 scroll-smooth">
        <div className="bg-[#dcf8c6] p-2 text-center text-xs text-gray-700 rounded-md shadow-sm mb-2">
            Hoje
        </div>
        {messages.map((msg, index) => (
          <div
            key={`${key}-${msg.id}-${index}`}
            className={`flex items-end gap-2 w-full animate-fade-in ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'bot' && (
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarImage src="/favicon.svg" alt="Bot" />
                <AvatarFallback className="bg-black text-white"><Bot size={16} /></AvatarFallback>
              </Avatar>
            )}
            <div
              className={`max-w-[80%] p-3 rounded-xl text-sm shadow-sm leading-snug ${
                msg.sender === 'user' ? 'bg-white text-black rounded-tr-none' : 'bg-[#DCF8C6] text-black rounded-bl-none'
              }`}
            >
              {msg.content}
              </div>
            </div>
          ))}

        {/* Indicador de Carregamento */}
        {isLoading && (
          <div className="flex items-end gap-2 w-full justify-start animate-fade-in">
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarImage src="/favicon.svg" alt="Bot" />
              <AvatarFallback className="bg-black text-white"><Bot size={16} /></AvatarFallback>
            </Avatar>
            <div className="max-w-[80%] p-3 rounded-xl text-sm shadow-sm leading-snug bg-[#DCF8C6] text-black rounded-bl-none">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></span>
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-300"></span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Botão de Reiniciar */}
      <div className="flex justify-center mt-2">
        <Button variant="ghost" onClick={restartAnimation} className="text-xs text-gray-500">
        <RefreshCw className="w-3 h-3 mr-1.5" />
        Reiniciar Simulação
          </Button>
      </div>

      {/* Interface de Teste Interativo */}
      {isSimulationComplete && currentAgentData && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="text-sm font-semibold text-gray-800">Teste a Inteligência do Atendimento</h4>
              <p className="text-xs text-gray-600">Faça perguntas para testar como seu funcionário IA responderá</p>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsTestMode(!isTestMode)}
              className="text-xs"
            >
              {isTestMode ? 'Fechar Teste' : 'Iniciar Teste'}
            </Button>
          </div>
          
          {isTestMode && (
            <div className="flex gap-2">
              <input
                type="text"
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleTestMessage()}
                placeholder="Digite sua pergunta para testar..."
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-20"
              />
              <Button 
                onClick={handleTestMessage}
                disabled={!testInput.trim() || isLoading}
                size="sm"
                className="bg-black hover:bg-gray-800 text-white px-4"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WhatsAppSimulator;
