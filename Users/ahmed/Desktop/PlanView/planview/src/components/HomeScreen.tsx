import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const HomeScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="home-screen">
      <header className="app-header">
        <h1 className="app-title">PlanView</h1>
        <div className="header-actions">
          <Link to="/profile-setup" className="btn-text">
            {t('profile')}
          </Link>
          <select 
            value={i18n.language} 
            onChange={(e) => i18n.changeLanguage(e.target.value)}
            className="language-selector"
          >
            <option value="en">{t('english')}</option>
            <option value="ar">{t('arabic')}</option>
          </select>
        </div>
      </header>
      
      <div className="welcome-section">
        <p className="welcome-text">{t('welcome')}</p>
        <div className="date-section">
          <p className="date-text">Oct 4</p>
          <p className="date-text">Oct 4 - Oct 8</p>
          <p className="class-text">Class: G9</p>
        </div>
      </div>
      
      {/* Your Classes section */}
      <div className="your-classes">
        <h2>{t('yourClasses')}</h2>
        <div className="class-list">
          <div className="class-item">G</div>
          <div className="class-item">G9</div>
        </div>
        <button className="continue-button">{t('continue')}</button>
      </div>
      
      {/* Continue buttons */}
      <div className="actions-grid">
        <button 
          className="btn-large btn-primary"
          onClick={() => navigate('/weekly-plan')}
          title="Weekly Plan"
        >
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            style={{ marginRight: '8px' }}
          >
            <path 
              d="M19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19H12L19 19V17C19 15.8954 18.1046 15 17 15H12V11H17C18.1046 11 19 10.1046 19 9V7C19 5.89543 18.1046 5 17 5H19Z" 
              fill="white"
            />
            <path 
              d="M12 11V15" 
              stroke="white" 
              strokeWidth="2" 
              strokeLinecap="round"
            />
            <path 
              d="M15 11H9" 
              stroke="white" 
              strokeWidth="2" 
              strokeLinecap="round"
            />
          </svg>
          {t('weeklyPlan')}
        </button>
      </div>
      
      {/* Manage Classes section */}
      <div className="manage-classes">
        <h2>{t('manageClasses')}</h2>
        <button className="edit-profile-button">{t('addClassOrEditProfile')}</button>
      </div>
      
      {/* Previous Plans section */}
      <div className="previous-plans">
        <h2>{t('previousPlans')}</h2>
      </div>
    </div>
  );
};

// Extend Date prototype to add getWeekNumber method
declare global {
  interface Date {
    getWeekNumber(): number;
  }
}

Date.prototype.getWeekNumber = function(): number {
  const onejan = new Date(this.getFullYear(), 0, 1);
  return Math.ceil((((this.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() + 1) / 7);
};

export default HomeScreen;