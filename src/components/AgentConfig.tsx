import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { AgentData } from './AgentBuilder';
import { Store, Coffee, Car, Heart, Briefcase, Home, Utensils, ShoppingBag } from 'lucide-react';
import baseKnowledge from '@/data/base_conhecimento_funcionario_ia.json';

interface AgentConfigProps {
  agentData: AgentData;
  onUpdate: (data: Partial<AgentData>) => void;
}

const AgentConfig: React.FC<AgentConfigProps> = ({ agentData, onUpdate }) => {
  const businessTypes = Object.entries(baseKnowledge.tipos_negocio).map(([key, value]) => ({
    value: key,
    label: key.charAt(0).toUpperCase() + key.slice(1),
    profissoes: (value as any).profissoes
  }));

  const handleBusinessTypeChange = (value: string) => {
    const businessType = baseKnowledge.tipos_negocio[value as keyof typeof baseKnowledge.tipos_negocio];
    if (businessType) {
      const config = businessType.configuracao_padrao;
      const info = `
Horários: ${config.horarios}
Serviços: ${config.servicos}
Formas de Pagamento: ${config.pagamentos}
${config.agendamento ? '✓ Aceita Agendamentos' : '✗ Não Aceita Agendamentos'}
${config.delivery ? '✓ Faz Delivery' : '✗ Não Faz Delivery'}
      `.trim();

      onUpdate({
        businessType: value,
        businessInfo: info,
        template: value
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Business Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <Store className="h-5 w-5" />
            <span>Tipo de Negócio</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {businessTypes.map((type) => {
              return (
                <button
                  key={type.value}
                  onClick={() => handleBusinessTypeChange(type.value)}
                  className={`p-4 rounded-xl border-2 transition-all hover:scale-105 ${
                    agentData.businessType === type.value
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="text-sm font-medium text-gray-900">{type.label}</div>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-gray-500">
            Profissões relacionadas: {businessTypes.find(t => t.value === agentData.businessType)?.profissoes.join(', ')}
          </p>
        </CardContent>
      </Card>

      {/* Business Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informações do Negócio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="businessName">Nome do Estabelecimento *</Label>
            <Input
              id="businessName"
              value={agentData.businessName}
              onChange={(e) => onUpdate({ businessName: e.target.value })}
              placeholder="Ex: Restaurante do João"
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="businessInfo">Informações Detalhadas *</Label>
            <Textarea
              id="businessInfo"
              value={agentData.businessInfo}
              onChange={(e) => onUpdate({ businessInfo: e.target.value })}
              placeholder="Descreva seu negócio: horários, especialidades, localização, etc."
              className="mt-2 min-h-[100px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Personality */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Personalidade do Agente</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={agentData.personality} onValueChange={(value) => onUpdate({ personality: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Escolha a personalidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="amigavel">Amigável e Acolhedor</SelectItem>
              <SelectItem value="profissional">Profissional e Formal</SelectItem>
              <SelectItem value="divertido">Divertido e Descontraído</SelectItem>
              <SelectItem value="tecnico">Técnico e Direto</SelectItem>
              <SelectItem value="vendedor">Vendedor e Persuasivo</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Welcome Message */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Mensagem de Boas-vindas</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={agentData.welcomeMessage}
            onChange={(e) => onUpdate({ welcomeMessage: e.target.value })}
            placeholder="Primeira mensagem que o cliente verá"
            className="min-h-[80px]"
          />
        </CardContent>
      </Card>

      {/* Quick Test Button */}
      <Button 
        className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-medium py-3"
        disabled={!agentData.businessName || !agentData.businessInfo}
      >
        {agentData.businessName && agentData.businessInfo ? '✨ Agente Configurado!' : 'Preencha os campos obrigatórios'}
      </Button>
    </div>
  );
};

export default AgentConfig;
