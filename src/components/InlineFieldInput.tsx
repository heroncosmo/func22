import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Send, Check, X } from 'lucide-react';

interface InlineFieldInputProps {
  fieldName: string;
  fieldLabel: string;
  fieldType: 'text' | 'textarea' | 'phone' | 'select' | 'buttons';
  placeholder: string;
  currentValue?: string | boolean;
  onSubmit: (value: string) => void;
  onCancel: () => void;
  options?: Array<{ value: string; label: string }>;
}

const InlineFieldInput: React.FC<InlineFieldInputProps> = ({
  fieldName,
  fieldLabel,
  fieldType,
  placeholder,
  currentValue = '',
  onSubmit,
  onCancel,
  options
}) => {
  // Converter valor para string segura
  const safeStringValue = (value: string | boolean | undefined): string => {
    if (value === undefined || value === null) return '';
    if (typeof value === 'boolean') return value.toString();
    return String(value);
  };

  // Use placeholder como valor inicial se currentValue estiver vazio
  const initialValue = safeStringValue(currentValue) || placeholder || '';
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Atualizar valor se currentValue mudar
    const newValue = safeStringValue(currentValue) || placeholder || '';
    setValue(newValue);
  }, [currentValue, placeholder]);

  useEffect(() => {
    // Focar no input quando aparecer
    const timeout = setTimeout(() => {
      if (fieldType === 'textarea') {
        textareaRef.current?.focus();
        textareaRef.current?.select(); // Selecionar texto pré-preenchido
      } else {
        inputRef.current?.focus();
        inputRef.current?.select(); // Selecionar texto pré-preenchido
      }
    }, 100);
    
    return () => clearTimeout(timeout);
  }, [fieldType]);

  const handleSubmit = () => {
    const safeValue = safeStringValue(value);
    if (safeValue.trim()) {
      onSubmit(safeValue.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  const formatPhone = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 11) {
      return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`;
    }
    return phone;
  };

  const getIcon = () => {
    switch (fieldName) {
      case 'businessName': return '🏷️';
      case 'contactPhone': return '📞';
      case 'location': return '📍';
      case 'services': return '🍕';
      case 'workingHours': return '🕒';
      case 'paymentMethods': return '💳';
      case 'hasDelivery': return '🚚';
      case 'acceptsReservations': return '📅';
      default: return '📝';
    }
  };

  // Usar sempre o fieldType original - sem conversões automáticas

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 my-2 animate-in slide-in-from-bottom duration-300">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm">{getIcon()}</span>
        <h3 className="font-medium text-blue-900 text-xs">
          {fieldLabel}
        </h3>
        {currentValue && (
          <span className="text-xs text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded text-xs">
            Atualizando
          </span>
        )}
      </div>

      <div className="space-y-2">
        {fieldType === 'textarea' ? (
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={placeholder}
            className="text-sm border-blue-200 focus:border-blue-400 focus:ring-blue-400 min-h-[60px]"
            style={{ fontSize: '14px' }}
            rows={2}
          />
        ) : fieldType === 'buttons' && options ? (
          <div className="grid grid-cols-1 gap-2">
            {options.map((option) => (
              <Button
                key={option.value}
                onClick={() => {
                  setValue(option.value);
                  onSubmit(option.value);
                }}
                variant="outline"
                size="sm"
                className="h-9 text-sm font-medium border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200"
              >
                {option.label}
              </Button>
            ))}
          </div>
        ) : (
          <Input
            ref={inputRef}
            type={fieldType === 'phone' ? 'tel' : 'text'}
            value={fieldType === 'phone' ? formatPhone(value) : value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={placeholder}
            className="text-sm border-blue-200 focus:border-blue-400 focus:ring-blue-400 h-8"
            style={{ fontSize: '14px' }}
          />
        )}

        {fieldType !== 'buttons' && (
          <div className="flex items-center gap-2">
            <Button
              onClick={handleSubmit}
              disabled={!safeStringValue(value).trim()}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white h-7 text-xs px-3"
            >
              <Check className="w-3 h-3 mr-1" />
              Confirmar
            </Button>
            
            <Button
              onClick={onCancel}
              variant="outline"
              size="sm"
              className="border-gray-300 h-7 text-xs px-3"
            >
              <X className="w-3 h-3 mr-1" />
              Cancelar
            </Button>

            <div className="text-xs text-gray-500 ml-auto">
              Enter • Esc
            </div>
          </div>
        )}

        {currentValue && (
          <div className="text-xs text-blue-600 bg-blue-100 p-2 rounded">
            <strong>Atual:</strong> {safeStringValue(currentValue)}
          </div>
        )}
      </div>
    </div>
  );
};

export default InlineFieldInput; 