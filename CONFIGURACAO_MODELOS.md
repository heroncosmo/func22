# 🤖 Configuração de Modelos Mistral AI - FuncionárioIA

## 📋 Visão Geral

O sistema agora suporta **múltiplos modelos Mistral AI** com configuração dinâmica e **rate limiting inteligente** para evitar erros 429.

## 🔧 Como Alterar o Modelo

### Método 1: Editando o Arquivo de Configuração

1. **Abra o arquivo:** `src/config/mistral-config.js`
2. **Encontre a linha 54:** 
   ```javascript
   model: 'mistral-small-latest', // ← MUDE AQUI!
   ```
3. **Altere para um dos modelos disponíveis:**
   ```javascript
   model: 'mistral-small-2409',        // Mais rápido
   model: 'mistral-small-latest',      // Equilibrado (PADRÃO)
   model: 'mistral-large-2411',        // Melhor qualidade (pago)
   model: 'mistral-medium-latest',     // Intermediário (pago)
   ```
4. **Salve o arquivo** e atualize a página

### Método 2: Interface Visual (em desenvolvimento)

Acesse: `localhost:8080/models` para ver a interface de seleção visual.

## 📊 Modelos Disponíveis

### 🆓 **GRATUITOS** (1 req/sec, 500k tokens/min)

| Modelo | Velocidade | Qualidade | Tokens | Custo |
|--------|------------|-----------|---------|-------|
| `mistral-small-2409` | ⚡⚡⚡ Muito Rápido | ⭐⭐⭐ Boa | 400 | **GRATUITO** |
| `mistral-small-latest` | ⚡⚡⚡ Muito Rápido | ⭐⭐⭐ Boa | 400 | **GRATUITO** |

### 💰 **PAGOS** (Rate limits maiores)

| Modelo | Velocidade | Qualidade | Tokens | Custo |
|--------|------------|-----------|---------|-------|
| `mistral-large-2411` | ⚡⚡ Rápido | ⭐⭐⭐⭐⭐ Excelente | 600 | $0.002/1k tokens |
| `mistral-medium-latest` | ⚡⚡⚡ Muito Rápido | ⭐⭐⭐⭐ Muito Boa | 500 | $0.0015/1k tokens |

## ⚙️ Presets Otimizados

### 🧪 DESENVOLVIMENTO
```javascript
model: 'mistral-small-latest'
maxTokens: 300
temperature: 0.5
```
**Uso:** Testes e desenvolvimento

### 🆓 PRODUÇÃO GRATUITA
```javascript
model: 'mistral-small-2409'
maxTokens: 400
temperature: 0.7
```
**Uso:** Produção com modelo gratuito

### ⭐ PRODUÇÃO PREMIUM
```javascript
model: 'mistral-large-2411'
maxTokens: 600
temperature: 0.7
```
**Uso:** Máxima qualidade (requer conta paga)

### 💰 ECONÔMICO
```javascript
model: 'mistral-small-latest'
maxTokens: 250
temperature: 0.3
```
**Uso:** Economia máxima de tokens

## 🛡️ Rate Limiting Automático

O sistema agora inclui **rate limiting inteligente**:

- ⏱️ **1.2 segundos** entre requests (respeita limite de 1 req/sec)
- 📊 **Contador automático** de requisições por minuto
- 🔄 **Retry automático** com backoff exponencial
- 📝 **Logs detalhados** no console

### Configuração Atual
```javascript
rateLimits: {
  requestsPerSecond: 1,      // Máximo 1 request por segundo
  tokensPerMinute: 500000,   // 500k tokens por minuto
  delayBetweenRequests: 1200 // 1.2 segundos entre requests
}
```

## 🎯 Recomendações de Uso

### Para **Testes e Desenvolvimento**
```javascript
model: 'mistral-small-latest'  // Rápido e gratuito
```

### Para **Produção (Gratuito)**
```javascript
model: 'mistral-small-2409'   // Mais estável e gratuito
```

### Para **Máxima Qualidade**
```javascript
model: 'mistral-large-2411'   // Melhor resposta (requer pagamento)
```

### Para **Economia de Tokens**
```javascript
model: 'mistral-small-latest'
maxTokens: 250                // Reduz custo/consumo
```

## 📈 Monitoramento

### Logs no Console
O sistema mostra logs detalhados:
```
⏳ Rate limit: aguardando 800ms...
🤖 Usando modelo: Mistral Small Latest (FREE)
📊 Request 5 enviado com modelo: mistral-small-latest
```

### Métricas Importantes
- **Requests por minuto:** Monitorado automaticamente
- **Tokens consumidos:** Visível nos logs
- **Tempo de resposta:** Otimizado com rate limiting
- **Taxa de erro 429:** Reduzida drasticamente

## 🚨 Solução de Problemas

### Erro 429 (Rate Limit)
- ✅ **Resolvido automaticamente** com o novo sistema
- ⏱️ Sistema aguarda automaticamente entre requests
- 🔄 Retry automático se ainda assim der erro

### Performance Lenta
- 🔧 **Altere para:** `mistral-small-latest` (mais rápido)
- 📉 **Reduza:** `maxTokens` para 250-300
- ⚡ **Use preset:** `DESENVOLVIMENTO` ou `ECONOMICO`

### Qualidade Baixa das Respostas
- ⭐ **Altere para:** `mistral-large-2411` (melhor qualidade)
- 📈 **Aumente:** `maxTokens` para 600
- 🎯 **Use preset:** `PRODUCAO_PREMIUM`

## 📝 Exemplo de Configuração Personalizada

```javascript
// Em src/config/mistral-config.js
CURRENT: {
  model: 'mistral-small-latest',        // Seu modelo escolhido
  rateLimits: {
    requestsPerSecond: 1,               // Não altere (limite da API)
    tokensPerMinute: 500000,            // Limite do tier gratuito
    delayBetweenRequests: 1500          // Pode aumentar para mais segurança
  }
}
```

## 🔄 Atualizações Futuras

- [ ] Interface visual para troca de modelo em tempo real
- [ ] Métricas de uso em dashboard
- [ ] Auto-seleção de modelo baseada na disponibilidade
- [ ] Cache de respostas para reduzir API calls
- [ ] Fallback automático entre modelos

---

**✅ Sistema otimizado para máxima eficiência e mínimo rate limiting!** 