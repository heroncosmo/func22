
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AgentData } from './MonetizedAgentBuilder';
import { Bot, Building2, MessageCircle, Clock, User, Settings } from 'lucide-react';

interface EmployeeInfoPanelProps {
  agentData: AgentData;
  onAgentUpdate: (data: Partial<AgentData>) => void;
}

const personalities = [
  { id: 'amigavel', name: 'Amigável', color: 'bg-green-100 text-green-800' },
  { id: 'profissional', name: 'Profissional', color: 'bg-blue-100 text-blue-800' },
  { id: 'divertido', name: 'Divertido', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'tecnico', name: 'Técnico', color: 'bg-gray-100 text-gray-800' },
  { id: 'vendedor', name: 'Persuasivo', color: 'bg-purple-100 text-purple-800' }
];

const EmployeeInfoPanel: React.FC<EmployeeInfoPanelProps> = ({ agentData, onAgentUpdate }) => {
  const currentPersonality = personalities.find(p => p.id === agentData.personality);
  const completionPercentage = Math.round(
    (Object.values(agentData).filter(Boolean).length / Object.keys(agentData).length) * 100
  );

  return (
    <div className="h-full bg-gray-50 overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b bg-white">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Informações do Funcionário</h3>
            <p className="text-sm text-gray-500">Configuração {completionPercentage}% completa</p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-3">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-green-500 to-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Basic Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center space-x-2">
              <Building2 className="h-4 w-4" />
              <span>Informações Básicas</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="businessName" className="text-xs">Nome do Negócio</Label>
              <Input
                id="businessName"
                value={agentData.businessName}
                onChange={(e) => onAgentUpdate({ businessName: e.target.value })}
                placeholder="Nome do estabelecimento"
                className="mt-1 h-8 text-sm"
              />
            </div>
            
            <div>
              <Label className="text-xs">Tipo de Negócio</Label>
              <div className="mt-1">
                <Badge variant="outline" className="text-xs">
                  {agentData.businessType || 'Não definido'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personality */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Personalidade</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select 
              value={agentData.personality} 
              onValueChange={(value) => onAgentUpdate({ personality: value })}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {personalities.map((personality) => (
                  <SelectItem key={personality.id} value={personality.id}>
                    <Badge className={`${personality.color} text-xs`}>
                      {personality.name}
                    </Badge>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Business Details */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Detalhes do Negócio</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={agentData.businessInfo}
              onChange={(e) => onAgentUpdate({ businessInfo: e.target.value })}
              placeholder="Informações sobre horários, serviços, localização..."
              className="min-h-[100px] text-sm"
            />
          </CardContent>
        </Card>

        {/* Welcome Message */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center space-x-2">
              <MessageCircle className="h-4 w-4" />
              <span>Mensagem de Boas-vindas</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={agentData.welcomeMessage}
              onChange={(e) => onAgentUpdate({ welcomeMessage: e.target.value })}
              placeholder="Primeira mensagem que o cliente verá"
              className="min-h-[60px] text-sm"
            />
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  completionPercentage >= 60 ? 'bg-green-500' : 'bg-yellow-500'
                }`}></div>
                <span className="text-sm text-gray-600">
                  {completionPercentage >= 60 ? 'Pronto para usar' : 'Em configuração'}
                </span>
              </div>
              <Badge variant={completionPercentage >= 60 ? 'default' : 'secondary'} className="text-xs">
                {completionPercentage}%
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmployeeInfoPanel;
