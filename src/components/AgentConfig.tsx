
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { AgentData } from './AgentBuilder';
import { Store, Coffee, Car, Heart, Briefcase, Home, Utensils, ShoppingBag } from 'lucide-react';

interface AgentConfigProps {
  agentData: AgentData;
  onUpdate: (data: Partial<AgentData>) => void;
}

const businessTemplates = [
  {
    id: 'restaurante',
    name: 'Restaurante',
    icon: Utensils,
    color: 'from-orange-400 to-red-500',
    prompt: 'Você é um atendente virtual de restaurante. Seja amigável, ajude com o cardápio, aceite pedidos e forneça informações sobre horários e localização.',
    info: 'Restaurante familiar com pratos caseiros e ambiente acolhedor. Funcionamos de terça a domingo das 11h às 22h.'
  },
  {
    id: 'loja',
    name: 'Loja',
    icon: ShoppingBag,
    color: 'from-blue-400 to-purple-500',
    prompt: 'Você é um vendedor virtual. Seja prestativo, ajude os clientes a encontrar produtos, esclareça dúvidas sobre preços e disponibilidade.',
    info: 'Loja com variedade de produtos de qualidade. Trabalhamos com as melhores marcas e oferecemos ótimo atendimento.'
  },
  {
    id: 'clinica',
    name: 'Clínica',
    icon: Heart,
    color: 'from-green-400 to-teal-500',
    prompt: 'Você é um assistente de clínica médica. Seja profissional e cuidadoso, ajude com agendamentos, informações sobre procedimentos e horários.',
    info: 'Clínica médica com profissionais qualificados. Oferecemos consultas e exames com qualidade e cuidado.'
  },
  {
    id: 'hotel',
    name: 'Hotel',
    icon: Home,
    color: 'from-indigo-400 to-blue-500',
    prompt: 'Você é um concierge virtual. Seja hospitaleiro, ajude com reservas, informações sobre acomodações e serviços do hotel.',
    info: 'Hotel confortável com excelente localização. Oferecemos quartos bem equipados e serviços de qualidade.'
  },
  {
    id: 'oficina',
    name: 'Oficina',
    icon: Car,
    color: 'from-gray-400 to-slate-500',
    prompt: 'Você é um atendente de oficina mecânica. Seja direto e técnico quando necessário, ajude com orçamentos e agendamentos de serviços.',
    info: 'Oficina especializada em reparos automotivos. Equipe experiente e peças de qualidade garantida.'
  },
  {
    id: 'escritorio',
    name: 'Escritório',
    icon: Briefcase,
    color: 'from-slate-400 to-gray-600',
    prompt: 'Você é um assistente de escritório. Seja formal e eficiente, ajude com agendamentos, informações sobre serviços e contatos.',
    info: 'Escritório profissional oferecendo serviços especializados. Atendimento de qualidade e soluções personalizadas.'
  }
];

const personalities = [
  { id: 'amigavel', name: 'Amigável e Caloroso', description: 'Tom descontraído e acolhedor' },
  { id: 'profissional', name: 'Profissional', description: 'Formal e respeitoso' },
  { id: 'divertido', name: 'Divertido e Descontraído', description: 'Uso de emojis e linguagem casual' },
  { id: 'tecnico', name: 'Técnico e Direto', description: 'Foco em informações precisas' },
  { id: 'vendedor', name: 'Persuasivo', description: 'Focado em vendas e conversão' }
];

const AgentConfig: React.FC<AgentConfigProps> = ({ agentData, onUpdate }) => {
  const handleTemplateSelect = (templateId: string) => {
    const template = businessTemplates.find(t => t.id === templateId);
    if (template) {
      onUpdate({
        template: templateId,
        businessType: template.name.toLowerCase(),
        businessInfo: template.info,
        welcomeMessage: `Olá! Bem-vindo ao nosso ${template.name.toLowerCase()}! Como posso ajudá-lo hoje?`
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
            {businessTemplates.map((template) => {
              const Icon = template.icon;
              return (
                <button
                  key={template.id}
                  onClick={() => handleTemplateSelect(template.id)}
                  className={`p-4 rounded-xl border-2 transition-all hover:scale-105 ${
                    agentData.template === template.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className={`inline-flex p-2 rounded-lg bg-gradient-to-r ${template.color} mb-2`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-sm font-medium text-gray-900">{template.name}</div>
                </button>
              );
            })}
          </div>
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
              {personalities.map((personality) => (
                <SelectItem key={personality.id} value={personality.id}>
                  <div>
                    <div className="font-medium">{personality.name}</div>
                    <div className="text-sm text-gray-500">{personality.description}</div>
                  </div>
                </SelectItem>
              ))}
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
