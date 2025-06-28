import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { MISTRAL_CONFIG, getCurrentModelConfig } from '../config/mistral-config.js';
import { Settings, Zap, Star, DollarSign, Brain } from 'lucide-react';

const ModelSelector: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState(MISTRAL_CONFIG.CURRENT.model);
  const currentConfig = getCurrentModelConfig();

  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId);
    // Atualizar configuração (isso requer restart do sistema)
    console.log(`🔧 Modelo selecionado: ${modelId}`);
    alert(`Modelo alterado para: ${modelId}\n\nPara aplicar a mudança, atualize a página.`);
  };

  const renderModelCard = (modelId: string, modelData: any, tier: string) => {
    const isSelected = selectedModel === modelId;
    const isCurrent = MISTRAL_CONFIG.CURRENT.model === modelId;
    
    return (
      <Card 
        key={modelId}
        className={`cursor-pointer transition-all duration-200 ${
          isSelected 
            ? 'ring-2 ring-blue-500 border-blue-500' 
            : 'border-gray-200 hover:border-blue-300'
        } ${isCurrent ? 'bg-green-50' : 'bg-white'}`}
        onClick={() => handleModelChange(modelId)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-sm mb-1">
                {modelData.name}
                {isCurrent && <Badge className="ml-2 bg-green-500 text-white text-xs">ATUAL</Badge>}
              </h3>
              <p className="text-xs text-gray-600 mb-2">{modelData.description}</p>
            </div>
            <Badge 
              variant={tier === 'FREE' ? 'default' : 'destructive'}
              className="text-xs"
            >
              {tier === 'FREE' ? '🆓 GRÁTIS' : '💰 PAGO'}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-yellow-500" />
              <span className="text-gray-600">{modelData.speed}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-blue-500" />
              <span className="text-gray-600">{modelData.quality}</span>
            </div>
            <div className="flex items-center gap-1">
              <Brain className="w-3 h-3 text-purple-500" />
              <span className="text-gray-600">{modelData.maxTokens} tokens</span>
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-green-500" />
              <span className="text-gray-600">{modelData.cost}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Settings className="w-5 h-5 text-gray-700" />
          <h2 className="text-lg font-semibold text-gray-900">Configuração de Modelos IA</h2>
        </div>
        <p className="text-sm text-gray-600">
          Escolha o modelo Mistral AI que melhor se adapta às suas necessidades.
        </p>
      </div>

      {/* Modelo Atual */}
      <Card className="mb-6 bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Modelo em Uso
          </h3>
          <div className="text-sm text-blue-800">
            <strong>{currentConfig.name}</strong> ({currentConfig.tier})
            <br />
            <span className="text-blue-600">{currentConfig.description}</span>
          </div>
        </CardContent>
      </Card>

      {/* Modelos Gratuitos */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          🆓 Modelos Gratuitos
          <Badge variant="default" className="text-xs">1 req/sec • 500k tokens/min</Badge>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(MISTRAL_CONFIG.MODELS.FREE).map(([modelId, modelData]) =>
            renderModelCard(modelId, modelData, 'FREE')
          )}
        </div>
      </div>

      {/* Modelos Pagos */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          💰 Modelos Premium
          <Badge variant="destructive" className="text-xs">Rate limits maiores</Badge>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(MISTRAL_CONFIG.MODELS.PAID).map(([modelId, modelData]) =>
            renderModelCard(modelId, modelData, 'PAID')
          )}
        </div>
      </div>

      {/* Presets */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          ⚙️ Presets Otimizados
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.entries(MISTRAL_CONFIG.PRESETS).map(([presetName, presetData]) => (
            <Card 
              key={presetName}
              className="cursor-pointer hover:border-blue-300 transition-colors"
              onClick={() => handleModelChange(presetData.model)}
            >
              <CardContent className="p-3">
                <h4 className="font-medium text-gray-900 text-sm mb-1">{presetName}</h4>
                <p className="text-xs text-gray-600 mb-2">{presetData.description}</p>
                <div className="text-xs text-gray-500">
                  {presetData.model} • {presetData.maxTokens} tokens
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Instruções */}
      <Card className="mt-6 bg-yellow-50 border-yellow-200">
        <CardContent className="p-4">
          <h3 className="font-semibold text-yellow-900 mb-2">📝 Como Alterar o Modelo</h3>
          <div className="text-sm text-yellow-800 space-y-1">
            <p>1. <strong>Arquivo:</strong> <code>src/config/mistral-config.js</code></p>
            <p>2. <strong>Linha 54:</strong> <code>model: 'mistral-small-latest'</code></p>
            <p>3. <strong>Altere para:</strong> qualquer modelo da lista acima</p>
            <p>4. <strong>Salve o arquivo</strong> e atualize a página</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ModelSelector; 