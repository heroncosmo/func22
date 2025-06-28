import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AgentData } from './MonetizedAgentBuilder';
import { Bot, Building2, MessageCircle, Clock, User, Settings, Sparkles, MapPin, Phone, Globe } from 'lucide-react';

interface EmployeeInfoPanelProps {
  agentData: AgentData;
  onAgentUpdate: (data: Partial<AgentData>) => void;
}

const personalities = [
  { id: 'amigavel', name: 'Amigável e Caloroso', description: 'Acolhedor e prestativo', color: 'bg-green-100 text-green-800' },
  { id: 'profissional', name: 'Profissional', description: 'Formal e eficiente', color: 'bg-blue-100 text-blue-800' },
  { id: 'divertido', name: 'Divertido e Descontraído', description: 'Jovial e animado', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'tecnico', name: 'Técnico e Especialista', description: 'Detalhista e preciso', color: 'bg-gray-100 text-gray-800' },
  { id: 'vendedor', name: 'Persuasivo', description: 'Focado em vendas', color: 'bg-purple-100 text-purple-800' }
];

const businessTypes = [
  { id: 'restaurante', name: 'Restaurante/Lanchonete', icon: '🍽️' },
  { id: 'loja', name: 'Loja/Comércio', icon: '🛍️' },
  { id: 'oficina', name: 'Oficina/Mecânica', icon: '🔧' },
  { id: 'clinica', name: 'Clínica/Consultório', icon: '🏥' },
  { id: 'escritorio', name: 'Escritório/Consultoria', icon: '💼' },
  { id: 'hotel', name: 'Hotel/Pousada', icon: '🏨' },
  { id: 'salao', name: 'Salão de Beleza', icon: '💄' },
  { id: 'academia', name: 'Academia/Fitness', icon: '💪' },
  { id: 'petshop', name: 'Pet Shop', icon: '🐕' },
  { id: 'outro', name: 'Outro', icon: '📋' }
];

const EmployeeInfoPanel: React.FC<EmployeeInfoPanelProps> = ({ agentData, onAgentUpdate }) => {
  const currentPersonality = personalities.find(p => p.id === agentData.personality);
  const currentBusinessType = businessTypes.find(b => b.id === agentData.businessType);
  const completionPercentage = Math.round(
    (Object.values(agentData).filter(Boolean).length / Object.keys(agentData).length) * 100
  );

  const getStatusColor = () => {
    if (completionPercentage >= 80) return 'from-green-500 to-emerald-600';
    if (completionPercentage >= 60) return 'from-yellow-500 to-orange-600';
    return 'from-gray-400 to-gray-600';
  };

  const getStatusText = () => {
    if (completionPercentage >= 80) return 'Funcionário Configurado ✨';
    if (completionPercentage >= 60) return 'Quase Pronto 🔄';
    return 'Em Configuração ⚙️';
  };

  return (
    <div className="h-full bg-gray-50 overflow-y-auto">
      {/* Header com Status */}
      <div className="sticky top-0 z-10 p-4 border-b bg-white shadow-sm">
        <div className="flex items-center space-x-3 mb-3">
          <div className={`w-12 h-12 bg-gradient-to-br ${getStatusColor()} rounded-xl flex items-center justify-center`}>
            <Bot className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 text-lg">Meu Funcionário IA</h3>
            <p className="text-sm text-gray-600">{getStatusText()}</p>
          </div>
        </div>
        
        {/* Progress Bar Melhorada */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Progresso da Configuração</span>
            <span className="font-semibold text-gray-700">{completionPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={`bg-gradient-to-r ${getStatusColor()} h-3 rounded-full transition-all duration-500`}
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Informações Básicas */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center space-x-2">
              <Building2 className="h-4 w-4 text-blue-600" />
              <span>Informações do Negócio</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="businessName" className="text-sm font-medium text-gray-700">
                Nome do Estabelecimento *
              </Label>
              <Input
                id="businessName"
                value={agentData.businessName}
                onChange={(e) => onAgentUpdate({ businessName: e.target.value })}
                placeholder="Ex: Restaurante do João"
                className="mt-1 text-sm"
              />
              {!agentData.businessName && (
                <p className="text-xs text-gray-500 mt-1">Este será o nome que aparecer no WhatsApp</p>
              )}
            </div>
            
            <div>
              <Label className="text-sm font-medium text-gray-700">Tipo de Negócio *</Label>
              <Select 
                value={agentData.businessType} 
                onValueChange={(value) => onAgentUpdate({ businessType: value })}
              >
                <SelectTrigger className="mt-1 text-sm">
                  <SelectValue placeholder="Selecione o tipo do seu negócio" />
                </SelectTrigger>
                <SelectContent>
                  {businessTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      <div className="flex items-center space-x-2">
                        <span>{type.icon}</span>
                        <span>{type.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Personalidade do Atendimento */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center space-x-2">
              <User className="h-4 w-4 text-purple-600" />
              <span>Personalidade do Atendimento</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select 
              value={agentData.personality} 
              onValueChange={(value) => onAgentUpdate({ personality: value })}
            >
              <SelectTrigger className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {personalities.map((personality) => (
                  <SelectItem key={personality.id} value={personality.id}>
                    <div className="flex flex-col">
                      <div className="flex items-center space-x-2">
                        <Badge className={`${personality.color} text-xs`}>
                          {personality.name}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{personality.description}</p>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {currentPersonality && (
              <p className="text-xs text-gray-600 mt-2 p-2 bg-gray-50 rounded">
                <strong>Estilo escolhido:</strong> {currentPersonality.description}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Detalhes Operacionais */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center space-x-2">
              <Settings className="h-4 w-4 text-green-600" />
              <span>Informações Operacionais</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Detalhes do Negócio
              </Label>
              <Textarea
                value={agentData.businessInfo}
                onChange={(e) => onAgentUpdate({ businessInfo: e.target.value })}
                placeholder="Informações importantes:&#10;• Horário de funcionamento&#10;• Principais serviços/produtos&#10;• Localização (bairro/cidade)&#10;• Formas de pagamento&#10;• Telefone para contato&#10;• Política de entrega..."
                className="min-h-[120px] text-sm mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Estas informações ajudam o funcionário IA a responder perguntas dos clientes
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Mensagem de Boas-vindas */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center space-x-2">
              <MessageCircle className="h-4 w-4 text-blue-600" />
              <span>Primeira Impressão</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Mensagem de Boas-vindas
              </Label>
              <Textarea
                value={agentData.welcomeMessage}
                onChange={(e) => onAgentUpdate({ welcomeMessage: e.target.value })}
                placeholder="Ex: Olá! Bem-vindo ao [Nome do Negócio]! Como posso ajudá-lo hoje?"
                className="min-h-[80px] text-sm mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Esta será a primeira mensagem que os clientes receberão
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Status Final e Ações */}
        <Card className="shadow-sm">
          <CardContent className="pt-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    completionPercentage >= 80 ? 'bg-green-500' : 
                    completionPercentage >= 60 ? 'bg-yellow-500' : 'bg-gray-400'
                  }`}></div>
                  <span className="text-sm text-gray-600">
                    {completionPercentage >= 80 ? 'Pronto para publicar!' : 
                     completionPercentage >= 60 ? 'Quase pronto' : 'Continue configurando'}
                  </span>
                </div>
                <Badge 
                  variant={completionPercentage >= 80 ? 'default' : 'secondary'} 
                  className="text-xs"
                >
                  {completionPercentage}% completo
                </Badge>
              </div>

              {completionPercentage >= 60 && (
                <div className="pt-2 border-t">
                  <p className="text-xs text-green-600 font-medium mb-2">
                    ✨ Seu funcionário IA está quase pronto!
                  </p>
                  <div className="space-y-1 text-xs text-gray-600">
                    <p>✅ Configuração básica concluída</p>
                    <p>✅ Personalidade definida</p>
                    {completionPercentage >= 80 && <p>✅ Informações completas</p>}
                  </div>
                </div>
              )}

              {completionPercentage < 60 && (
                <div className="pt-2 border-t">
                  <p className="text-xs text-orange-600 font-medium mb-2">
                    ⚠️ Continue configurando para melhor funcionamento
                  </p>
                  <div className="space-y-1 text-xs text-gray-600">
                    {!agentData.businessName && <p>• Defina o nome do negócio</p>}
                    {!agentData.businessInfo && <p>• Adicione informações operacionais</p>}
                    {!agentData.welcomeMessage && <p>• Personalize a mensagem de boas-vindas</p>}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmployeeInfoPanel;
