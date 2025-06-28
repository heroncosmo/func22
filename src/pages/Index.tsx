import LandingPage from '@/components/LandingPage';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  const handleStartChat = (message: string) => {
    // Salvar a mensagem inicial no sessionStorage para usar na página de chat
    sessionStorage.setItem('initialMessage', message);
    navigate('/chat');
  };

  const handleTemplateSelect = (templateKey: string) => {
    // Salvar o template selecionado no sessionStorage
    sessionStorage.setItem('selectedTemplate', templateKey);
    navigate('/chat');
  };

  return (
    <LandingPage 
      onStartChat={handleStartChat}
      onTemplateSelect={handleTemplateSelect}
    />
  );
};

export default Index;
