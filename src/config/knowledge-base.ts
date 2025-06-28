import baseKnowledge from '../data/base_conhecimento_funcionario_ia.json';

export const getBusinessTypes = () => baseKnowledge.tipos_negocio;
export const getSystemInfo = () => baseKnowledge.sistema;
export const getBenefits = () => baseKnowledge.beneficios;
export const getPlans = () => baseKnowledge.planos_precos;
export const getIntegrations = () => baseKnowledge.integracoes;
export const getSupport = () => baseKnowledge.suporte;
export const getSuccessCases = () => baseKnowledge.casos_sucesso;

export default baseKnowledge; 