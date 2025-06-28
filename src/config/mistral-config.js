// ===================================
// CONFIGURAÇÃO MISTRAL AI - FUNCIONÁRIO IA
// ===================================

export const MISTRAL_CONFIG = {
  // API KEY - Configure aqui sua chave
  API_KEY: 'OOf5YOgTZDgiyxTu0oBAdWT9NYKA8gqe',
  
  // ===================================
  // MODELOS DISPONÍVEIS
  // ===================================
  MODELS: {
    // 🆓 GRATUITOS (1 req/sec, 500k tokens/min)
    FREE: {
      'mistral-tiny': {
        name: 'Mistral Tiny',
        description: 'Modelo mais rápido e leve - GRATUITO',
        maxTokens: 300,
        temperature: 0.7,
        cost: 'GRATUITO',
        speed: '⚡⚡⚡⚡ Ultra Rápido',
        quality: '⭐⭐ Básica'
      },
      'mistral-small-2409': {
        name: 'Mistral Small 2409',
        description: 'Modelo pequeno, rápido e econômico - GRATUITO',
        maxTokens: 400,
        temperature: 0.7,
        cost: 'GRATUITO',
        speed: '⚡⚡⚡ Muito Rápido',
        quality: '⭐⭐⭐ Boa'
      },
      'mistral-small-latest': {
        name: 'Mistral Small Latest',
        description: 'Versão mais recente do modelo pequeno - GRATUITO',
        maxTokens: 400,
        temperature: 0.7,
        cost: 'GRATUITO',
        speed: '⚡⚡⚡ Muito Rápido',
        quality: '⭐⭐⭐ Boa'
      }
    },
    
    // 💰 PAGOS (Rate limits maiores)
    PAID: {
      'mistral-large-2411': {
        name: 'Mistral Large 2411',
        description: 'Modelo mais avançado, melhor qualidade - PAGO',
        maxTokens: 600,
        temperature: 0.7,
        cost: '$0.002 por 1k tokens',
        speed: '⚡⚡ Rápido',
        quality: '⭐⭐⭐⭐⭐ Excelente'
      },
      'mistral-medium-latest': {
        name: 'Mistral Medium Latest',
        description: 'Equilíbrio entre velocidade e qualidade - PAGO',
        maxTokens: 500,
        temperature: 0.7,
        cost: '$0.0015 por 1k tokens',
        speed: '⚡⚡⚡ Muito Rápido',
        quality: '⭐⭐⭐⭐ Muito Boa'
      }
    }
  },

  // ===================================
  // CONFIGURAÇÃO ATUAL
  // ===================================
  CURRENT: {
    // 🔧 ALTERE AQUI O MODELO QUE QUER USAR
    model: 'mistral-small-2409', // ← MUDE AQUI!
    
    // Rate Limiting para evitar erro 429
    rateLimits: {
      requestsPerSecond: 1,      // Máximo 1 request por segundo
      tokensPerMinute: 500000,   // 500k tokens por minuto
      delayBetweenRequests: 1200 // 1.2 segundos entre requests
    },
    
    // Configurações de retry
    retry: {
      maxAttempts: 3,
      backoffDelay: 2000, // 2 segundos
      exponentialBackoff: true
    }
  },

  // ===================================
  // PRESETS OTIMIZADOS
  // ===================================
  PRESETS: {
    DESENVOLVIMENTO: {
      model: 'mistral-small-latest',
      maxTokens: 300,
      temperature: 0.5,
      description: '🧪 Para testes e desenvolvimento'
    },
    
    PRODUCAO_FREE: {
      model: 'mistral-small-2409',
      maxTokens: 400,
      temperature: 0.7,
      description: '🆓 Produção com modelo gratuito'
    },
    
    PRODUCAO_PREMIUM: {
      model: 'mistral-large-2411',
      maxTokens: 600,
      temperature: 0.7,
      description: '⭐ Máxima qualidade (pago)'
    },
    
    ECONOMICO: {
      model: 'mistral-small-latest',
      maxTokens: 250,
      temperature: 0.3,
      description: '💰 Economia de tokens'
    }
  }
};

// ===================================
// FUNÇÃO HELPER
// ===================================
export const getCurrentModelConfig = () => {
  const currentModel = MISTRAL_CONFIG.CURRENT.model;
  
  // Buscar nas opções gratuitas primeiro
  if (MISTRAL_CONFIG.MODELS.FREE[currentModel]) {
    return {
      ...MISTRAL_CONFIG.MODELS.FREE[currentModel],
      id: currentModel,
      tier: 'FREE'
    };
  }
  
  // Buscar nas opções pagas
  if (MISTRAL_CONFIG.MODELS.PAID[currentModel]) {
    return {
      ...MISTRAL_CONFIG.MODELS.PAID[currentModel],
      id: currentModel,
      tier: 'PAID'
    };
  }
  
  // Fallback para modelo padrão
  return {
    ...MISTRAL_CONFIG.MODELS.FREE['mistral-small-latest'],
    id: 'mistral-small-latest',
    tier: 'FREE'
  };
};

// ===================================
// RATE LIMITER
// ===================================
class RateLimiter {
  constructor() {
    this.lastRequest = 0;
    this.requestCount = 0;
    this.resetTime = Date.now() + 60000; // Reset a cada minuto
  }
  
  async checkRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequest;
    const minDelay = MISTRAL_CONFIG.CURRENT.rateLimits.delayBetweenRequests;
    
    // Reset contador a cada minuto
    if (now > this.resetTime) {
      this.requestCount = 0;
      this.resetTime = now + 60000;
    }
    
    // Verificar se precisa aguardar
    if (timeSinceLastRequest < minDelay) {
      const waitTime = minDelay - timeSinceLastRequest;
      console.log(`⏳ Rate limit: aguardando ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequest = Date.now();
    this.requestCount++;
    
    console.log(`📊 Request ${this.requestCount} enviado com modelo: ${MISTRAL_CONFIG.CURRENT.model}`);
  }
}

export const rateLimiter = new RateLimiter(); 