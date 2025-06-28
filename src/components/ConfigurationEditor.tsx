import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Save, Loader2, ChevronDown, ChevronRight, Calendar, Users, Info } from 'lucide-react';
import { AgentData } from './MonetizedAgentBuilder';

interface ConfigurationEditorProps {
  agentData: AgentData;
  onAgentUpdate: (updates: Partial<AgentData>) => void;
}

const ConfigurationEditor: React.FC<ConfigurationEditorProps> = ({ agentData, onAgentUpdate }) => {
  const [editingData, setEditingData] = useState<AgentData>(agentData);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    location: false,
    services: false,
    payment: false,
    reservations: false,
    additional: false
  });

  // Sincronização automática
  useEffect(() => {
    setEditingData(agentData);
  }, [agentData]);

  const handleFieldChange = (field: keyof AgentData, value: string | boolean) => {
    setEditingData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      onAgentUpdate(editingData);
      await new Promise(resolve => setTimeout(resolve, 800));
    } catch (error) {
      console.error('❌ Erro ao salvar:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const calculateProgress = () => {
    const fields = [
      agentData.businessName,
      agentData.businessType,
      agentData.contactPhone,
      agentData.location,
      agentData.services,
      agentData.workingHours,
      agentData.paymentMethods
    ];
    
    const filledFields = fields.filter(field => 
      field && 
      field !== 'A ser definido' && 
      field !== 'Como vai ser o nome do seu' &&
      field !== 'Lista de serviços' &&
      field !== 'Endereço a ser definido' &&
      field !== 'xxxxx-xxxx' &&
      field.length > 3
    ).length;
    
    return Math.round((filledFields / fields.length) * 100);
  };

  const progress = calculateProgress();

  return (
    <div className="h-full flex flex-col">
      {/* Header com Progresso - SEMPRE VISÍVEL */}
      <div className="p-3 border-b border-gray-200 bg-white flex-shrink-0 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-800">Configuração</span>
          <span className="text-xs text-gray-600">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1">
          <div
            className="bg-black h-1 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Conteúdo Rolável */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-3 space-y-2 text-xs">
          {/* Seção Básica */}
          <div>
            <button
              onClick={() => toggleSection('basic')}
              className="flex items-center justify-between w-full text-left p-2 hover:bg-gray-100 rounded transition-colors"
            >
              <span className="text-xs font-medium text-gray-800">Básico</span>
              {expandedSections.basic ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </button>
            
            {expandedSections.basic && (
              <div className="space-y-2 mt-1 pl-2">
                <div>
                  <label className="text-xs text-gray-600 block mb-1">Nome</label>
                  <Input
                    value={editingData.businessName}
                    onChange={(e) => handleFieldChange('businessName', e.target.value)}
                    placeholder="Nome do negócio"
                    className="h-6 text-xs"
                  />
                </div>
                
                <div>
                  <label className="text-xs text-gray-600 block mb-1">Tipo</label>
                  <Input
                    value={editingData.businessType}
                    onChange={(e) => handleFieldChange('businessType', e.target.value)}
                    placeholder="Ex: psicólogo, advogado, restaurante..."
                    className="h-6 text-xs"
                  />
                </div>
                
                <div>
                  <label className="text-xs text-gray-600 block mb-1">Telefone</label>
                  <Input
                    value={editingData.contactPhone}
                    onChange={(e) => handleFieldChange('contactPhone', e.target.value)}
                    placeholder="(XX) XXXXX-XXXX"
                    className="h-6 text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Seção Localização */}
          <div>
            <button
              onClick={() => toggleSection('location')}
              className="flex items-center justify-between w-full text-left p-2 hover:bg-gray-100 rounded transition-colors"
            >
              <span className="text-xs font-medium text-gray-800">Local & Horários</span>
              {expandedSections.location ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </button>
            
            {expandedSections.location && (
              <div className="space-y-2 mt-1 pl-2">
                <div>
                  <label className="text-xs text-gray-600 block mb-1">Endereço</label>
                  <Textarea
                    value={editingData.location}
                    onChange={(e) => handleFieldChange('location', e.target.value)}
                    placeholder="Endereço completo"
                    className="min-h-[50px] text-xs resize-none"
                  />
                </div>
                
                <div>
                  <label className="text-xs text-gray-600 block mb-1">Horários</label>
                  <Textarea
                    value={editingData.workingHours}
                    onChange={(e) => handleFieldChange('workingHours', e.target.value)}
                    placeholder="Seg-Sex: 9h-18h"
                    className="min-h-[50px] text-xs resize-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Seção Serviços */}
          <div>
            <button
              onClick={() => toggleSection('services')}
              className="flex items-center justify-between w-full text-left p-2 hover:bg-gray-100 rounded transition-colors"
            >
              <span className="text-xs font-medium text-gray-800">Produtos/Serviços</span>
              {expandedSections.services ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </button>
            
            {expandedSections.services && (
              <div className="space-y-2 mt-1 pl-2">
                <div>
                  <label className="text-xs text-gray-600 block mb-1">Cardápio/Lista</label>
                  <Textarea
                    value={editingData.services}
                    onChange={(e) => handleFieldChange('services', e.target.value)}
                    placeholder="Descreva produtos/serviços"
                    className="min-h-[60px] text-xs resize-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Seção Pagamento */}
          <div>
            <button
              onClick={() => toggleSection('payment')}
              className="flex items-center justify-between w-full text-left p-2 hover:bg-gray-100 rounded transition-colors"
            >
              <span className="text-xs font-medium text-gray-800">Pagamento & Entrega</span>
              {expandedSections.payment ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </button>
            
            {expandedSections.payment && (
              <div className="space-y-2 mt-1 pl-2">
                <div>
                  <label className="text-xs text-gray-600 block mb-1">Formas de Pagamento</label>
                  <Input
                    value={editingData.paymentMethods}
                    onChange={(e) => handleFieldChange('paymentMethods', e.target.value)}
                    placeholder="PIX, Cartão, Dinheiro..."
                    className="h-6 text-xs"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={editingData.hasDelivery || false}
                    onChange={(e) => handleFieldChange('hasDelivery', e.target.checked)}
                    className="h-3 w-3"
                  />
                  <label className="text-xs text-gray-600">Faz entregas</label>
                </div>
                
                {editingData.hasDelivery && (
                  <div>
                    <label className="text-xs text-gray-600 block mb-1">Taxa Entrega</label>
                    <Input
                      value={editingData.deliveryFee || ''}
                      onChange={(e) => handleFieldChange('deliveryFee', e.target.value)}
                      placeholder="R$ 5,00"
                      className="h-6 text-xs"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Seção Reservas */}
          <div>
            <button
              onClick={() => toggleSection('reservations')}
              className="flex items-center justify-between w-full text-left p-2 hover:bg-gray-100 rounded transition-colors"
            >
              <span className="text-xs font-medium text-gray-800 flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                Reservas/Agendamentos
              </span>
              {expandedSections.reservations ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </button>
            
            {expandedSections.reservations && (
              <div className="space-y-2 mt-1 pl-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={editingData.acceptsReservations || false}
                    onChange={(e) => handleFieldChange('acceptsReservations', e.target.checked)}
                    className="h-3 w-3"
                  />
                  <label className="text-xs text-gray-600">Aceita reservas</label>
                </div>
                
                {editingData.acceptsReservations && (
                  <div className="bg-gray-50 p-2 rounded text-xs">
                    <div className="flex items-center text-gray-600 mb-1">
                      <Users className="h-3 w-3 mr-1" />
                      <span>Reservas Hoje</span>
                    </div>
                    <div className="text-gray-500">
                      Nenhuma reserva para hoje
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Seção Informações Adicionais */}
          <div>
            <button
              onClick={() => toggleSection('additional')}
              className="flex items-center justify-between w-full text-left p-2 hover:bg-gray-100 rounded transition-colors"
            >
              <span className="text-xs font-medium text-gray-800 flex items-center">
                <Info className="h-3 w-3 mr-1" />
                Informações Adicionais
              </span>
              {expandedSections.additional ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </button>
            
            {expandedSections.additional && (
              <div className="space-y-2 mt-1 pl-2">
                <div>
                  <label className="text-xs text-gray-600 block mb-1">Observações e Extras</label>
                  <Textarea
                    value={editingData.businessInfo}
                    onChange={(e) => handleFieldChange('businessInfo', e.target.value)}
                    placeholder="Ex: Wi-Fi gratuito, estacionamento, aceita pets..."
                    className="min-h-[60px] text-xs resize-none"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer com Botão de Salvar */}
      <div className="p-3 border-t border-gray-200 bg-white flex-shrink-0 sticky bottom-0">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          size="sm"
          className="w-full bg-black hover:bg-gray-800 text-white h-7 text-xs"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="h-3 w-3 mr-1" />
              Salvar Tudo
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ConfigurationEditor; 