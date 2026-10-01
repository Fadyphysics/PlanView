import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { saveWeeklyPlan, getTeacherProfile, getNextSundayToDateRange } from '../utils/indexedDbUtils';
import type { WeeklyPlan, DayPlan } from '../models';
import HomeButton from './HomeButton';
import CalendarPicker from './CalendarPicker';
import './WeeklyPlanEditor.css';

const WeeklyPlanEditor: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  
   const [currentStep, setCurrentStep] = useState<number>(1); // 1: Details, 2: Days (removed activities step)
  const [loading, setLoading] = useState<boolean>(true);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  
  // State for week details (now using date-based identification)
  const { startDate, endDate } = getNextSundayToDateRange();
  const [weekDetails, setWeekDetails] = useState({
    weekNumber: startDate.getWeekNumber(),
    startDate: startDate,
    endDate: endDate
  });
  
  
  // State for showing calendar picker
  const [showCalendar, setShowCalendar] = useState<boolean>(false);
  
  // Ref for the date picker container to detect outside clicks
  const datePickerRef = useRef<HTMLDivElement>(null);
  
  // State for teacher details (loaded from profile)
  const [teacherDetails, setTeacherDetails] = useState({
    teacher: '',
    subject: '',
    grade: '',
    class: ''  // Add class to teacher details
  });
  
  // State for daily plans
  const [dailyPlans, setDailyPlans] = useState<DayPlan[]>([
    { day: t('sunday'), lessonTopic: '', learningObjectives: '', activities: '', activityTools: '', homeworkAssessment: '' },
    { day: t('monday'), lessonTopic: '', learningObjectives: '', activities: '', activityTools: '', homeworkAssessment: '' },
    { day: t('tuesday'), lessonTopic: '', learningObjectives: '', activities: '', activityTools: '', homeworkAssessment: '' },
    { day: t('wednesday'), lessonTopic: '', learningObjectives: '', activities: '', activityTools: '', homeworkAssessment: '' },
    { day: t('thursday'), lessonTopic: '', learningObjectives: '', activities: '', activityTools: '', homeworkAssessment: '' }
  ]);
  

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await getTeacherProfile();
        if (profile) {
          setTeacherDetails({
            teacher: profile.name,
            subject: profile.subject,
            grade: profile.grade,
            class: profile.currentClass || profile.class || ''  // Use current class if available, otherwise fallback to old class field
          });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  // Handle clicks outside the calendar to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowCalendar(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleDayChange = (index: number, field: keyof DayPlan, value: string) => {
    const newDailyPlans = [...dailyPlans];
    newDailyPlans[index] = { ...newDailyPlans[index], [field]: value };
    setDailyPlans(newDailyPlans);
    
    // Clear the noActivity error when user adds content to any activity field
    if (field === 'activities' && value.trim() && errors.noActivity) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors.noActivity;
        return newErrors;
      });
    }
  };


  // Function to handle date changes
  const handleStartDateChange = (newDate: Date) => {
    if (!isNaN(newDate.getTime())) {
      // Calculate end date (Thursday) based on new start date (Sunday)
      const newEndDate = new Date(newDate);
      newEndDate.setDate(newDate.getDate() + 4); // Sunday to Thursday
      
      setWeekDetails({
        weekNumber: newDate.getWeekNumber(),
        startDate: newDate,
        endDate: newEndDate
      });
      
      // Close the calendar after selection
      setShowCalendar(false);
    }
  };

  // Function to toggle calendar visibility
  const toggleCalendar = () => {
    setShowCalendar(!showCalendar);
  };

  // Function to check if at least one activity exists
  const hasAtLeastOneActivity = (): boolean => {
    return dailyPlans.some(day => day.activities && day.activities.trim() !== '');
  }

  const handleNext = () => {
    if (currentStep === 1) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Check if at least one activity exists before proceeding to review
      if (!hasAtLeastOneActivity()) {
        setErrors({ noActivity: t('atLeastOneActivity') });
        return;
      }
      // Navigate directly to review since activities step is removed
      handleSaveAndReview();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate(-1); // Go back to previous page
    }
  };

  const handleSaveAndReview = async () => {
    try {
      const weeklyPlan: WeeklyPlan = {
        id: Date.now(), // Generate temporary ID
        teacherId: 1, // Default teacher ID
        academicYear: new Date().getFullYear().toString(), // Current academic year
        weekNumber: weekDetails.startDate.getWeekNumber(), // Calculate week number from start date
        startDate: weekDetails.startDate,
        endDate: weekDetails.endDate,
        teacher: teacherDetails.teacher,
        subject: teacherDetails.subject,
        grade: teacherDetails.grade,
        class: teacherDetails.class, // Use the current class from teacher details
        days: dailyPlans, // Use the correct property name
        weeklyActivities: {  // Default weekly activities since the step is removed
          hasSpecialActivity: false,
          description: '',
          materialsNeeded: '',
          teacherNotes: ''
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Save the plan
      await saveWeeklyPlan(weeklyPlan);

      // Navigate to review screen
      navigate('/review');
    } catch (error) {
      console.error('Error saving weekly plan:', error);
    }
  };

  if (loading) {
    return (
      <div className="weekly-plan-editor loading">
        <div className="spinner"></div>
        <p>{t('loading')}...</p>
      </div>
    );
  }

  return (
    <div className="weekly-plan-editor">
      <HomeButton />
      <div className="editor-container">
        <header className="editor-header">
          <h1>{t('weeklyLessonPlan')}</h1>
          <div className="step-indicator">
            {[1, 2].map(step => (
              <div 
                key={step} 
                className={`step ${currentStep === step ? 'active' : ''}`}
              >
                {step}
              </div>
            ))}
          </div>
        </header>

        <main className="editor-main">
          {/* Step 1: Week Details */}
          {currentStep === 1 && (
            <div className="step-content">
              <h2>{weekDetails.startDate.toLocaleDateString(i18n.language, { month: 'short', day: 'numeric' })}</h2>
              <p>{t('dateRange', { 
                startDate: weekDetails.startDate.toLocaleDateString(i18n.language, { weekday: 'long', month: 'short', day: 'numeric' }), 
                endDate: weekDetails.endDate.toLocaleDateString(i18n.language, { weekday: 'long', month: 'short', day: 'numeric' })
              })}</p>
              
              
              <div className="form-group" ref={datePickerRef}>
                <label htmlFor="startDate">{t('startDate') || 'Start Date'}</label>
                <div className="date-picker-container">
                  <input
                    type="text"
                    id="startDate"
                    value={`${weekDetails.startDate.toLocaleDateString(i18n.language, { month: 'short', day: 'numeric' })}`}
                    readOnly
                    onClick={toggleCalendar}
                    className="date-input"
                    placeholder="Select Sunday"
                  />
                  <button 
                    type="button" 
                    className="calendar-button"
                    onClick={toggleCalendar}
                  >
                    📅
                  </button>
                  {showCalendar && (
                    <div className="calendar-popup">
                      <CalendarPicker
                        selectedDate={weekDetails.startDate}
                        onSelectDate={handleStartDateChange}
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="teacher">{t('teacher')}</label>
                  <input
                    type="text"
                    id="teacher"
                    value={teacherDetails.teacher}
                    readOnly
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="subject">{t('subject')}</label>
                  <input
                    type="text"
                    id="subject"
                    value={teacherDetails.subject}
                    readOnly
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="grade">{t('grade')}</label>
                  <input
                    type="text"
                    id="grade"
                    value={teacherDetails.grade}
                    readOnly
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="class">{t('className')}</label>
                  <input
                    type="text"
                    id="class"
                    value={teacherDetails.class}
                    readOnly
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Daily Plans */}
          {currentStep === 2 && (
            <div className="step-content">
              <h2>{t('dailyLessons')}</h2>
              
              {Object.keys(errors).length > 0 && (
                <div className="error-message">
                  {errors.noActivity && (
                    <div className="alert alert-warning">
                      {errors.noActivity}
                      <button 
                        className="btn-text"
                        onClick={() => setCurrentStep(2)}
                      >
                        {t('goToActivities')}
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              <div className="days-container">
                {dailyPlans.map((day, index) => (
                  <div key={index} className="day-card">
                    <h3>{day.day}</h3>
                    
                    <div className="form-group">
                      <label htmlFor={`lessonTopic-${index}`}>{t('lessonTopic')}</label>
                      <textarea
                        id={`lessonTopic-${index}`}
                        value={day.lessonTopic}
                        onChange={(e) => handleDayChange(index, 'lessonTopic', e.target.value)}
                        placeholder={t('lessonTopic')}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor={`learningObjectives-${index}`}>{t('learningObjectives')}</label>
                      <textarea
                        id={`learningObjectives-${index}`}
                        value={day.learningObjectives}
                        onChange={(e) => handleDayChange(index, 'learningObjectives', e.target.value)}
                        placeholder={t('learningObjectives')}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor={`activities-${index}`}>{t('activitiesClasswork')}</label>
                      <textarea
                        id={`activities-${index}`}
                        value={day.activities}
                        onChange={(e) => handleDayChange(index, 'activities', e.target.value)}
                        placeholder={t('activitiesClasswork')}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor={`activityTools-${index}`}>{t('activityTools')}</label>
                      <textarea
                        id={`activityTools-${index}`}
                        value={day.activityTools}
                        onChange={(e) => handleDayChange(index, 'activityTools', e.target.value)}
                        placeholder={t('activityTools')}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor={`homeworkAssessment-${index}`}>{t('homeworkAssessment')}</label>
                      <textarea
                        id={`homeworkAssessment-${index}`}
                        value={day.homeworkAssessment}
                        onChange={(e) => handleDayChange(index, 'homeworkAssessment', e.target.value)}
                        placeholder={t('homeworkAssessment')}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        <footer className="editor-footer">
          <div className="nav-buttons">
            {currentStep > 1 && (
              <button className="btn-secondary" onClick={handleBack}>
                {t('back')}
              </button>
            )}
            
            <button className="btn-primary" onClick={handleNext}>
              {currentStep < 2 ? t('next') : t('review')}
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
  // Create a new date object for the Thursday of the same week to ensure we're in the right year
  const targetDate = new Date(this.valueOf());
  targetDate.setDate(targetDate.getDate() + 4 - (targetDate.getDay() || 7)); // Move to the Thursday of the same week
  const firstDayOfYear = new Date(targetDate.getFullYear(), 0, 1);
  const diffInTime = targetDate.getTime() - firstDayOfYear.getTime();
  const diffInDays = Math.floor(diffInTime / (24 * 60 * 60 * 1000));
  return Math.floor(diffInDays / 7) + 1;
};

export default WeeklyPlanEditor;