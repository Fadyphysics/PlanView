import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import type { TeacherProfile, WeeklyPlan } from '../models';
import { getTeacherProfile, getAllWeeklyPlans, saveTeacherProfile } from '../utils/indexedDbUtils';

const HomeScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [teacherProfile, setTeacherProfile] = useState<TeacherProfile | null>(null);
  const [weeklyPlans, setWeeklyPlans] = useState<WeeklyPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const profile = await getTeacherProfile();
        setTeacherProfile(profile || null); // 将 undefined 转换为 null

        const plans = await getAllWeeklyPlans();
        setWeeklyPlans(plans.sort((a, b) => b.weekNumber - a.weekNumber)); // Sort by week number descending
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleStartNewPlan = () => {
    navigate('/weekly-plan');
  };

  const handleContinuePlan = () => {
    // For now, just navigate to the weekly plan editor
    // In a real app, we'd check for an in-progress plan
    navigate('/weekly-plan');
  };

  const handleSwitchClass = () => {
    // Navigate to profile setup to change the class
    navigate('/profile-setup');
  };

  const handleManageClasses = () => {
    // Navigate to profile setup to manage classes
    navigate('/profile-setup');
  };

  const handleCreateNewPlanForClass = (className: string) => {
    // Update the profile with the selected class and navigate to create a new plan
    if (teacherProfile) {
      const updatedProfile = { ...teacherProfile, currentClass: className };
      // Save the updated profile to IndexedDB
      try {
        saveTeacherProfile(updatedProfile);
        navigate('/weekly-plan');
      } catch (error) {
        console.error('Error saving updated profile:', error);
      }
    }
  };

  const handleContinuePlanForClass = (className: string) => {
    // Find any existing plans for this class and continue from there
    if (weeklyPlans.length > 0) {
      const classPlans = weeklyPlans.filter(plan => plan.class === className);
      if (classPlans.length > 0) {
        // For now, just navigate to the weekly plan editor
        // In a real app, we'd continue from the most recent plan for this class
        navigate('/weekly-plan');
      } else {
        // If no plans exist for this class, create a new one
        handleCreateNewPlanForClass(className);
      }
    } else {
      // If no plans exist at all, create a new one for this class
      handleCreateNewPlanForClass(className);
    }
  };

  if (loading) {
    return (
      <div className="home-screen loading">
        <div className="spinner"></div>
        <p>{t('loading')}...</p>
      </div>
    );
  }

  return (
    <div className="home-screen">
      <header className="app-header">
  <h1 className="app-title" style={{ color: '#0066ff' }}>PlanView</h1>
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

      <main className="main-content">
        <div className="welcome-section">
          {teacherProfile && (
            <>
              <p>
                {weeklyPlans.length > 0 
                  ? new Date(weeklyPlans[0].startDate).toLocaleDateString(i18n.language, { 
                      month: 'short', 
                      day: 'numeric' 
                    })
                  : new Date().toLocaleDateString(i18n.language, { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                <br />
                {weeklyPlans.length > 0 
                  ? `${new Date(weeklyPlans[0].startDate).toLocaleDateString(i18n.language, { 
                      month: 'short', 
                      day: 'numeric' 
                    })} - ${new Date(weeklyPlans[0].endDate).toLocaleDateString(i18n.language, { 
                      month: 'short', 
                      day: 'numeric' 
                    })}`
                  : `${new Date().toLocaleDateString(i18n.language, { 
                      month: 'short', 
                      day: 'numeric' 
                    })} - ${new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString(i18n.language, { 
                      month: 'short', 
                      day: 'numeric' 
                    })}`
                }
              </p>
              {/* Display current class if available */}
              {teacherProfile.currentClass && (
                <div className="current-class-display">
                  <p><strong>{t('className')}:</strong> {teacherProfile.currentClass}</p>
                </div>
              )}
              {/* Show switch class button if user has multiple classes */}
              {teacherProfile.classes && teacherProfile.classes.length > 1 && (
                <div className="switch-class-section">
                  <button 
                    className="btn-switch-class"
                    onClick={handleSwitchClass}
                  >
                    Switch Class
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Display class icons if user has classes */}
        {teacherProfile && teacherProfile.classes && teacherProfile.classes.length > 0 && (
          <div className="classes-section">
            <h3>{t('yourClasses')}</h3>
            <div className="classes-grid">
              {teacherProfile.classes.map((className: string, index: number) => {
                // Find the most recent plan for this class
                const classPlans = weeklyPlans.filter(plan => plan.class === className);
                const hasActivePlan = classPlans.length > 0;
                
                return (
                  <div key={index} className="class-icon">
                    <div 
                      className="class-circle"
                      onClick={() => handleCreateNewPlanForClass(className)}
                      title={t('createNewPlanFor', { className })}
                    >
                      <span className="class-name">{className.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="class-name-full">{className}</div>
                    <div className="class-actions">
                      <button 
                        className="btn-small btn-primary"
                        onClick={() => handleContinuePlanForClass(className)}
                      >
                        {hasActivePlan ? t('continuePlan') : t('createNewPlan')}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="actions-grid">
          <button 
            className="btn-large btn-primary"
            onClick={handleContinuePlan}
          >
            {t('continueThisWeek')}
          </button>
          
          <button 
            className="btn-large btn-secondary"
            onClick={handleStartNewPlan}
          >
            {t('startNewPlan')}
          </button>
        </div>

        {/* Add a section for managing classes */}
        <div className="manage-classes-section">
          <h3>{t('manageClasses')}</h3>
          <button 
            className="btn-manage-classes"
            onClick={handleManageClasses}
          >
            {t('addClassOrEditProfile')}
          </button>
        </div>

        {weeklyPlans.length > 0 && (
          <section className="previous-plans">
            <h3>{t('previousPlans')}</h3>
            <div className="plans-list">
              {weeklyPlans.map(plan => (
                <div key={plan.id} className="plan-card">
                  <div className="plan-info">
                    <h4>{t('weekNumber', { weekNumber: plan.weekNumber })}</h4>
                    <p>
                      {new Date(plan.startDate).toLocaleDateString(i18n.language, { 
                        month: 'short', 
                        day: 'numeric' 
                      })} - {new Date(plan.endDate).toLocaleDateString(i18n.language, { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                  <div className="plan-details">
                    <span>{plan.subject}</span>
                    <span>{plan.grade}{plan.class}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
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