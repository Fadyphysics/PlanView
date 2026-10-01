import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../App.css'; // Import the main styles

interface HomeButtonProps {
  className?: string;
}

const HomeButton: React.FC<HomeButtonProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleClick = () => {
    // Navigate to home without losing progress
    navigate('/', { replace: true });
  };

  return (
    <button 
      type="button" // Explicitly set type to prevent form submission
      className={`btn-home ${className}`}
      onClick={handleClick}
      aria-label={t('home')}
    >
      {t('home')}
    </button>
  );
};

export default HomeButton;