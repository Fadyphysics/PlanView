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
  const [showDeleteMenu, setShowDeleteMenu] = useState<{show: boolean, className: string | null}>({show: false, className: null});
  const [longPressTimer, setLongPressTimer] = useState<number | null>(null);

  const handleLongPressStart = (className: string) => {
    // Start a timer for long press detection (e.g., 500ms)
    const timer = setTimeout(() => {
      setShowDeleteMenu({show: true, className});
    }, 500);
    
    setLongPressTimer(timer);
  };

  const handleLongPressEnd = () => {
    // Clear the timer if released before long press duration
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handleDeleteClass = (className: string) => {
    if (teacherProfile && teacherProfile.classes) {
      const updatedClasses = teacherProfile.classes.filter(c => c !== className);
      const updatedProfile = { ...teacherProfile, classes: updatedClasses };
      
      try {
        saveTeacherProfile(updatedProfile);
        setTeacherProfile(updatedProfile);
        
        // Also remove any weekly plans associated with this class
        const updatedPlans = weeklyPlans.filter(plan => plan.class !== className);
        setWeeklyPlans(updatedPlans);
      } catch (error) {
        console.error('Error deleting class:', error);
      }
    }
    
    setShowDeleteMenu({show: false, className: null});
  };

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
  const handleSwitchClass = () => {
    // Navigate to profile setup to change the class
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

  // Helper function to generate a consistent color for each class name
  const getClassColor = (className: string): string => {
    // Create a simple hash of the class name
    let hash = 0;
    for (let i = 0; i < className.length; i++) {
      hash = className.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Convert the hash to a hue value (0-360) for consistent colors
    const hue = Math.abs(hash) % 360;
    
    // Return a color in HSL format with good contrast
    return `hsl(${hue}, 70%, 60%)`;
  };

  // Close delete menu when clicking elsewhere
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showDeleteMenu.show) {
        const target = event.target as HTMLElement;
        // Check if the click is outside the class icon that triggered the menu
        if (!target.closest('.class-icon')) {
          setShowDeleteMenu({show: false, className: null});
        }
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showDeleteMenu]);

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
              {/* Show switch class button if user has multiple classes */}
              {teacherProfile && teacherProfile.classes && teacherProfile.classes.length > 1 && (
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
              {teacherProfile.classes.map((className: string) => {
                // Find the most recent plan for this class
                const classPlans = weeklyPlans.filter(plan => plan.class === className);
                const hasActivePlan = classPlans.length > 0;
                
                return (
                  <div 
                    key={className} 
                    className="class-icon"
                    onMouseDown={() => handleLongPressStart(className)}
                    onMouseUp={handleLongPressEnd}
                    onMouseLeave={handleLongPressEnd}
                    onTouchStart={() => handleLongPressStart(className)}
                    onTouchEnd={handleLongPressEnd}
                  >
                    <div 
                      className="class-circle"
                      onClick={() => handleCreateNewPlanForClass(className)}
                      title={`Create new plan for ${className}`}
                      style={{ backgroundColor: getClassColor(className) }}
                    >
                      <span className="class-name">{className.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="class-name-full" title={className}>{className}</div>
                    <div className="class-actions">
                      <button 
                        className="btn-small btn-primary"
                        onClick={() => handleContinuePlanForClass(className)}
                      >
                        {hasActivePlan ? t('continuePlan') : t('createNewPlan')}
                      </button>
                    </div>
                    
                    {/* Delete menu overlay */}
                    {showDeleteMenu.show && showDeleteMenu.className === className && (
                      <div 
                        className="delete-menu-overlay"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button 
                          className="delete-class-btn"
                          onClick={() => handleDeleteClass(className)}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="actions-grid">
          <button 
            className="btn-large btn-primary"
            onClick={() => navigate('/weekly-plan')}
            title={t('weeklyPlan')}
          >
            {t('weeklyPlan')}
          </button>
        </div>

        {/* Modal for delete class confirmation */}
        {showDeleteMenu.show && showDeleteMenu.className && (
          <div className="delete-class-modal">
            <div className="modal-content">
              <p>{t('deleteClassConfirmation', { className: showDeleteMenu.className })}</p>
              <div className="modal-actions">
                <button 
                  className="btn btn-danger"
                  onClick={() => handleDeleteClass(showDeleteMenu.className!)}
                >
                  {t('delete')}
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteMenu({show: false, className: null})}
                >
                  {t('cancel')}
                </button>
              </div>
            </div>
          </div>
        )}

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