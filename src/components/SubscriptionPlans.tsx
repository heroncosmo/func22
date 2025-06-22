
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Crown, Zap, Rocket, Star } from 'lucide-react';

interface Plan {
  id: 'starter' | 'pro' | 'enterprise';
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  icon: React.ElementType;
  gradient: string;
  popular?: boolean;
}

interface SubscriptionPlansProps {
  currentPlan: 'free' | 'starter' | 'pro' | 'enterprise';
  onSelectPlan: (plan: 'starter' | 'pro' | 'enterprise') => void;
}

const plans: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 'R$ 29',
    period: '/mês',
    description: 'Perfeito para pequenos negócios',
    icon: Zap,
    gradient: 'from-blue-500 to-cyan-600',
    features: [
      'Conexão com WhatsApp',
      'Até 1.000 mensagens/mês',
      'Suporte por email',
      'Analytics básico',
      'Templates de resposta',
      'Horário de funcionamento'
    ]
  },
  {
    id: 'pro',
    name: 'Professional',
    price: 'R$ 79',
    period: '/mês',
    description: 'Para empresas em crescimento',
    icon: Crown,
    gradient: 'from-purple-500 to-pink-600',
    popular: true,
    features: [
      'Tudo do Starter +',
      'Até 10.000 mensagens/mês',
      'Múltiplos agentes',
      'Analytics avançado',
      'Integração com CRM',
      'Suporte prioritário',
      'Personalização avançada',
      'API access'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'R$ 199',
    period: '/mês',
    description: 'Para grandes operações',
    icon: Rocket,
    gradient: 'from-indigo-500 to-purple-600',
    features: [
      'Tudo do Pro +',
      'Mensagens ilimitadas',
      'White-label',
      'Gerente de conta dedicado',
      'SLA garantido',
      'Treinamento personalizado',
      'Integrações customizadas',
      'Suporte 24/7'
    ]
  }
];

const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({ 
  currentPlan, 
  onSelectPlan 
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-gray-900">
          Escolha o Plano Ideal
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Conecte seu agente ao WhatsApp e transforme seu atendimento. 
          Comece com 7 dias grátis em qualquer plano.
        </p>
        <div className="flex items-center justify-center space-x-2 bg-green-50 px-4 py-2 rounded-full inline-flex">
          <Star className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-green-700">
            7 dias grátis • Cancele quando quiser
          </span>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isCurrentPlan = currentPlan === plan.id;
          
          return (
            <Card 
              key={plan.id} 
              className={`relative bg-white rounded-2xl shadow-xl border-2 transition-all hover:scale-105 ${
                plan.popular 
                  ? 'border-purple-500 ring-4 ring-purple-100' 
                  : 'border-gray-200 hover:border-purple-300'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Mais Popular
                  </div>
                </div>
              )}
              
              <CardHeader className={`bg-gradient-to-r ${plan.gradient} text-white rounded-t-2xl`}>
                <CardTitle className="flex items-center space-x-3">
                  <Icon className="h-6 w-6" />
                  <span>{plan.name}</span>
                </CardTitle>
                <div className="space-y-2">
                  <div className="flex items-baseline space-x-1">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-lg opacity-90">{plan.period}</span>
                  </div>
                  <p className="text-sm opacity-90">{plan.description}</p>
                </div>
              </CardHeader>
              
              <CardContent className="p-6 space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button
                  onClick={() => onSelectPlan(plan.id)}
                  disabled={isCurrentPlan}
                  className={`w-full font-semibold py-3 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white'
                      : 'bg-gradient-to-r from-gray-900 to-gray-700 hover:from-gray-800 hover:to-gray-600 text-white'
                  }`}
                >
                  {isCurrentPlan ? 'Plano Atual' : 'Começar Agora'}
                </Button>
                
                {!isCurrentPlan && (
                  <p className="text-xs text-center text-gray-500">
                    7 dias grátis, depois {plan.price}{plan.period}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-8 rounded-2xl text-center space-y-4">
        <h3 className="text-xl font-semibold text-gray-900">
          Precisa de algo personalizado?
        </h3>
        <p className="text-gray-600">
          Entre em contato para soluções customizadas para sua empresa
        </p>
        <Button variant="outline" className="font-medium">
          Falar com Especialista
        </Button>
      </div>

      {/* Money Back Guarantee */}
      <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
        <div className="flex items-center space-x-2">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span>Garantia de 30 dias</span>
        </div>
        <div className="w-px h-4 bg-gray-300" />
        <div className="flex items-center space-x-2">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span>Sem taxa de cancelamento</span>
        </div>
        <div className="w-px h-4 bg-gray-300" />
        <div className="flex items-center space-x-2">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span>Suporte brasileiro</span>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlans;
