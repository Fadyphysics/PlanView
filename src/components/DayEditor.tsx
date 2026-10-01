import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { saveWeeklyPlan, getTeacherProfile } from '../utils/indexedDbUtils';
import type { WeeklyPlan, DayPlan } from '../models';
import HomeButton from './HomeButton';
import './DayEditor.css';

const DayEditor: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { dayIndex } = useParams<{ dayIndex: string }>();
  const [loading, setLoading] = useState<boolean>(true);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // State for teacher details (loaded from profile)
  const [teacherDetails, setTeacherDetails] = useState({
    teacher: '',
    subject: '',
    grade: '',
    class: ''  // Add class to teacher details
  });

  // State for the specific day being edited
  const [dayPlan, setDayPlan] = useState<DayPlan>({
    day: '',
    lessonTopic: '',
    learningObjectives: '',
    activities: '',
    activityTools: '',
    homeworkAssessment: ''
  });

  // State for all days (to maintain context)
  const [allDays, setAllDays] = useState<DayPlan[]>([]);
  const [currentDayIndex, setCurrentDayIndex] = useState<number>(0);

  useEffect(() => {
    const loadProfileAndData = async () => {
      try {
        // Load teacher profile
        const profile = await getTeacherProfile();
        if (profile) {
          setTeacherDetails({
            teacher: profile.name,
            subject: profile.subject,
            grade: profile.grade,
            class: profile.currentClass || profile.class || ''  // Use current class if available, otherwise fallback to old class field
          });
        }

        // Load any existing weekly plan data
        const storedPlan = localStorage.getItem('weeklyPlanDraft');
        if (storedPlan) {
          const plan: WeeklyPlan = JSON.parse(storedPlan);
          setAllDays(plan.days);
          
          // Parse day index from URL
          const index = parseInt(dayIndex || '0', 10);
          if (!isNaN(index) && index >= 0 && index < plan.days.length) {
            setDayPlan(plan.days[index]);
            setCurrentDayIndex(index);
          } else {
            // If invalid index, default to first day
            setDayPlan(plan.days[0]);
            setCurrentDayIndex(0);
          }
        } else {
          // If no draft exists, create default days
          const defaultDays: DayPlan[] = [
            { day: t('sunday'), lessonTopic: '', learningObjectives: '', activities: '', activityTools: '', homeworkAssessment: '' },
            { day: t('monday'), lessonTopic: '', learningObjectives: '', activities: '', activityTools: '', homeworkAssessment: '' },
            { day: t('tuesday'), lessonTopic: '', learningObjectives: '', activities: '', activityTools: '', homeworkAssessment: '' },
            { day: t('wednesday'), lessonTopic: '', learningObjectives: '', activities: '', activityTools: '', homeworkAssessment: '' },
            { day: t('thursday'), lessonTopic: '', learningObjectives: '', activities: '', activityTools: '', homeworkAssessment: '' }
          ];
          setAllDays(defaultDays);
          
          const index = parseInt(dayIndex || '0', 10);
          if (!isNaN(index) && index >= 0 && index < defaultDays.length) {
            setDayPlan(defaultDays[index]);
            setCurrentDayIndex(index);
          } else {
            setDayPlan(defaultDays[0]);
            setCurrentDayIndex(0);
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfileAndData();
  }, [dayIndex, t]);

  const handleFieldChange = (field: keyof DayPlan, value: string) => {
    setDayPlan(prev => ({ ...prev, [field]: value }));
    
    // Update the allDays array to keep everything in sync
    const updatedDays = [...allDays];
    updatedDays[currentDayIndex] = { ...dayPlan, [field]: value };
    setAllDays(updatedDays);
    
    // Clear the noActivity error when user adds content to activity field
    if (field === 'activities' && value.trim() && errors.noActivity) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors.noActivity;
        return newErrors;
      });
    }
  };

  const handleSaveDraft = async () => {
    try {
      // Get week details (same as in WeeklyPlanEditor)
      const weekDetails = {
        weekNumber: new Date().getWeekNumber(),
        startDate: new Date(new Date().setDate(new Date().getDate() - new Date().getDay() + 1)), // Monday
        endDate: new Date(new Date().setDate(new Date().getDate() - new Date().getDay() + 5))    // Friday
      };

      const weeklyPlan: WeeklyPlan = {
        id: Date.now(), // Generate temporary ID
        teacherId: 1, // Default teacher ID
        academicYear: new Date().getFullYear().toString(), // Current academic year
        weekNumber: weekDetails.weekNumber,
        startDate: weekDetails.startDate,
        endDate: weekDetails.endDate,
        teacher: teacherDetails.teacher,
        subject: teacherDetails.subject,
        grade: teacherDetails.grade,
        class: teacherDetails.class, // Use the current class from teacher details
        days: allDays, // Updated days array
        weeklyActivities: {  // Default weekly activities
          hasSpecialActivity: false,
          description: '',
          materialsNeeded: '',
          teacherNotes: ''
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Save the plan as a draft in localStorage
      localStorage.setItem('weeklyPlanDraft', JSON.stringify(weeklyPlan));

      // Also save to IndexedDB
      await saveWeeklyPlan(weeklyPlan);
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  };

  const handlePreviousDay = () => {
    if (currentDayIndex > 0) {
      // Save current day before navigating
      const updatedDays = [...allDays];
      updatedDays[currentDayIndex] = dayPlan;
      setAllDays(updatedDays);
      
      navigate(`/day/${currentDayIndex - 1}`);
    }
  };

  const handleNextDay = () => {
    if (currentDayIndex < allDays.length - 1) {
      // Save current day before navigating
      const updatedDays = [...allDays];
      updatedDays[currentDayIndex] = dayPlan;
      setAllDays(updatedDays);
      
      navigate(`/day/${currentDayIndex + 1}`);
    } else {
      // If we're on the last day, validate and move to review
      const hasActivity = allDays.some(day => day.activities && day.activities.trim() !== '');
      if (!hasActivity) {
        setErrors({ noActivity: t('atLeastOneActivity') });
        return;
      }
      navigate('/review');
    }
  };

  const handleGoToReview = () => {
    const hasActivity = allDays.some(day => day.activities && day.activities.trim() !== '');
    if (!hasActivity) {
      setErrors({ noActivity: t('atLeastOneActivity') });
      return;
    }
    navigate('/review');
  };

  if (loading) {
    return (
      <div className="day-editor loading">
        <div className="spinner"></div>
        <p>{t('loading')}...</p>
      </div>
    );
  }

  return (
    <div className="day-editor">
      <HomeButton />
      <div className="editor-container">
        <header className="editor-header">
          <div className="header-top">
            <button className="btn-back" onClick={() => navigate(-1)}>
              ← {t('back')}
            </button>
            <h1>{t('weeklyLessonPlan')}</h1>
            <div className="day-indicator">
              {currentDayIndex + 1}/{allDays.length}
            </div>
          </div>
          <div className="day-title">
            <h2>{dayPlan.day}</h2>
          </div>
        </header>

        <main className="editor-main">
          {Object.keys(errors).length > 0 && (
            <div className="error-message">
              {errors.noActivity && (
                <div className="alert alert-warning">
                  {errors.noActivity}
                </div>
              )}
            </div>
          )}

          <div className="day-form">
            <div className="form-group">
              <label htmlFor="lessonTopic">{t('lessonTopic')}</label>
              <textarea
                id="lessonTopic"
                value={dayPlan.lessonTopic}
                onChange={(e) => handleFieldChange('lessonTopic', e.target.value)}
                placeholder={t('lessonTopic')}
              />
            </div>

            <div className="form-group">
              <label htmlFor="learningObjectives">{t('learningObjectives')}</label>
              <textarea
                id="learningObjectives"
                value={dayPlan.learningObjectives}
                onChange={(e) => handleFieldChange('learningObjectives', e.target.value)}
                placeholder={t('learningObjectives')}
              />
            </div>

            <div className="form-group">
              <label htmlFor="activities">{t('activitiesClasswork')}</label>
              <textarea
                id="activities"
                value={dayPlan.activities}
                onChange={(e) => handleFieldChange('activities', e.target.value)}
                placeholder={t('activitiesClasswork')}
              />
            </div>

            <div className="form-group">
              <label htmlFor="activityTools">{t('activityTools')}</label>
              <textarea
                id="activityTools"
                value={dayPlan.activityTools}
                onChange={(e) => handleFieldChange('activityTools', e.target.value)}
                placeholder={t('activityTools')}
              />
            </div>

            <div className="form-group">
              <label htmlFor="homeworkAssessment">{t('homeworkAssessment')}</label>
              <textarea
                id="homeworkAssessment"
                value={dayPlan.homeworkAssessment}
                onChange={(e) => handleFieldChange('homeworkAssessment', e.target.value)}
                placeholder={t('homeworkAssessment')}
              />
            </div>
          </div>
        </main>

        <footer className="editor-footer">
          <div className="nav-buttons">
            <div className="day-navigation">
              <button 
                className="btn-secondary" 
                onClick={handlePreviousDay}
                disabled={currentDayIndex === 0}
              >
                ← {t('previousDay')}
              </button>
              
              <div className="progress-indicators">
                {allDays.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`progress-dot ${idx === currentDayIndex ? 'active' : idx < currentDayIndex ? 'completed' : ''}`}
                    onClick={() => {
                      const updatedDays = [...allDays];
                      updatedDays[currentDayIndex] = dayPlan;
                      setAllDays(updatedDays);
                      navigate(`/day/${idx}`);
                    }}
                  ></div>
                ))}
              </div>
              
              {currentDayIndex < allDays.length - 1 ? (
                <button 
                  className="btn-primary" 
                  onClick={handleNextDay}
                >
                  {t('nextDay')} →
                </button>
              ) : (
                <button 
                  className="btn-primary" 
                  onClick={handleGoToReview}
                >
                  {t('review')}
                </button>
              )}
            </div>
            
            <button 
              className="btn-save" 
              onClick={handleSaveDraft}
            >
              {t('saveDraft')}
            </button>
          </div>
        </footer>
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

export default DayEditor;