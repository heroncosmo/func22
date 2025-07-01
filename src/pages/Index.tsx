import LandingPage from '@/components/LandingPage';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  const handleTemplateSelect = (templateKey: string) => {
    navigate(`/chat?tipo=${templateKey}`);
  };

  return (
    <LandingPage 
      onTemplateSelect={handleTemplateSelect}
    />
  );
};

export default Index;
