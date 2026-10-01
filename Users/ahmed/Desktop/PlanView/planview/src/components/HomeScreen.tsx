import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const HomeScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  
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
      <div className="continue-buttons">
        <button className="btn-primary">{t('continueThisWeek')}</button>
        <button className="btn-secondary">{t('startNewPlan')}</button>
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