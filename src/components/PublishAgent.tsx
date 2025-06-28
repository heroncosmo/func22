
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AgentData, SubscriptionState } from './MonetizedAgentBuilder';
import { 
  Smartphone, 
  Copy, 
  CheckCircle, 
  ExternalLink, 
  Zap, 
  Users, 
  MessageCircle,
  Crown,
  Globe,
  Settings,
  BarChart3
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PublishAgentProps {
  agentData: AgentData;
  subscription: SubscriptionState;
  onUpgradeClick: () => void;
}

const PublishAgent: React.FC<PublishAgentProps> = ({ 
  agentData, 
  subscription, 
  onUpgradeClick 
}) => {
  const [agentUrl, setAgentUrl] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  const handlePublishAgent = async () => {
    setIsPublishing(true);
    
    // Simular publicação
    setTimeout(() => {
      const generatedUrl = `https://agent.lovable.app/${agentData.businessName.toLowerCase().replace(/\s+/g, '-')}-${Math.random().toString(36).substr(2, 6)}`;
      setAgentUrl(generatedUrl);
      setIsPublished(true);
      setIsPublishing(false);
      
      toast({
        title: "Agente Publicado! 🎉",
        description: "Seu agente está disponível online e pronto para ser conectado ao WhatsApp.",
      });
    }, 2000);
  };

  const handleConnectWhatsApp = async () => {
    if (!subscription.isSubscribed) {
      onUpgradeClick();
      return;
    }

    setIsConnecting(true);
    
    // Simular conexão com WhatsApp
    setTimeout(() => {
      setIsConnected(true);
      setIsConnecting(false);
      
      toast({
        title: "WhatsApp Conectado! 📱",
        description: `Seu agente está ativo no número ${whatsappNumber}`,
      });
    }, 3000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Link copiado para a área de transferência",
    });
  };

  const stats = [
    { label: 'Conversas Hoje', value: isConnected ? '24' : '0', icon: MessageCircle },
    { label: 'Usuários Ativos', value: isConnected ? '156' : '0', icon: Users },
    { label: 'Taxa de Resposta', value: isConnected ? '98%' : '0%', icon: Zap }
  ];

  return (
    <div className="space-y-6">
      {/* Status Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="bg-white shadow-lg border border-gray-200/50">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-lg ${
                    isConnected 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Publish Section */}
        <Card className="bg-white rounded-2xl shadow-xl border border-gray-200/50">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-2xl">
            <CardTitle className="flex items-center space-x-3">
              <Globe className="h-6 w-6" />
              <span>Publicar Agente</span>
            </CardTitle>
            <p className="text-blue-100 mt-2">Disponibilize seu agente online</p>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {!isPublished ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Globe className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Pronto para Publicar</h3>
                  <p className="text-gray-600">
                    Seu agente será disponibilizado com um link único para testes
                  </p>
                </div>
                <Button
                  onClick={handlePublishAgent}
                  disabled={isPublishing}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3"
                >
                  {isPublishing ? 'Publicando...' : 'Publicar Agente'}
                  <Globe className="h-4 w-4 ml-2" />
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Agente publicado com sucesso!</span>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-700">Link do Agente</Label>
                  <div className="flex mt-2">
                    <Input 
                      value={agentUrl} 
                      readOnly 
                      className="rounded-r-none bg-gray-50"
                    />
                    <Button
                      onClick={() => copyToClipboard(agentUrl)}
                      variant="outline"
                      className="rounded-l-none border-l-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    onClick={() => window.open(agentUrl, '_blank')}
                    variant="outline"
                    className="flex-1"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Visualizar
                  </Button>
                  <Button
                    onClick={() => copyToClipboard(agentUrl)}
                    variant="outline"
                    className="flex-1"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Compartilhar
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* WhatsApp Connection */}
        <Card className="bg-white rounded-2xl shadow-xl border border-gray-200/50">
          <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-t-2xl">
            <CardTitle className="flex items-center space-x-3">
              <Smartphone className="h-6 w-6" />
              <span>Conectar WhatsApp</span>
            </CardTitle>
            <p className="text-green-100 mt-2">Atenda clientes automaticamente</p>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {!subscription.isSubscribed ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
                  <Crown className="h-8 w-8 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Upgrade Necessário</h3>
                  <p className="text-gray-600">
                    Para conectar ao WhatsApp, você precisa de um plano pago
                  </p>
                </div>
                <Button
                  onClick={onUpgradeClick}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold py-3"
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Ver Planos
                </Button>
                <div className="bg-blue-50 p-4 rounded-lg text-sm">
                  <p className="text-blue-800 font-medium">💡 Recursos inclusos:</p>
                  <ul className="text-blue-700 mt-2 space-y-1">
                    <li>• Conexão direta com WhatsApp</li>
                    <li>• Atendimento 24/7 automatizado</li>
                    <li>• Analytics detalhado</li>
                    <li>• Suporte prioritário</li>
                  </ul>
                </div>
              </div>
            ) : !isConnected ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="whatsapp" className="text-sm font-medium text-gray-700">
                    Número do WhatsApp Web
                  </Label>
                  <Input
                    id="whatsapp"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="+55 11 99999-9999"
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use o formato internacional com código do país
                  </p>
                </div>

                <Button
                  onClick={handleConnectWhatsApp}
                  disabled={isConnecting || !whatsappNumber}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3"
                >
                  {isConnecting ? 'Conectando...' : 'Conectar WhatsApp'}
                  <Smartphone className="h-4 w-4 ml-2" />
                </Button>

                <div className="bg-green-50 p-4 rounded-lg text-sm">
                  <p className="text-green-800 font-medium">📱 Como funciona:</p>
                  <ol className="text-green-700 mt-2 space-y-1 list-decimal list-inside">
                    <li>Conectamos seu número ao nosso sistema</li>
                    <li>Configuramos o webhook automaticamente</li>
                    <li>Seu agente começa a responder mensagens</li>
                  </ol>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">WhatsApp conectado com sucesso!</span>
                </div>

                <div className="bg-white border border-green-200 p-4 rounded-lg">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Smartphone className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Número Ativo</p>
                      <p className="text-sm text-gray-600">{whatsappNumber}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Settings className="h-4 w-4 mr-2" />
                      Configurar
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Analytics
                    </Button>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg text-sm">
                  <p className="text-blue-800 font-medium">🎉 Parabéns!</p>
                  <p className="text-blue-700 mt-1">
                    Seu agente está respondendo mensagens automaticamente no WhatsApp. 
                    Monitore as conversas através do painel de analytics.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PublishAgent;
