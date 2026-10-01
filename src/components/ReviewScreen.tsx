import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { generatePdfs } from '../utils/pdfGenerator';
import { getAllWeeklyPlans } from '../utils/indexedDbUtils';
import type { WeeklyPlan, DayPlan } from '../models';
import HomeButton from './HomeButton';
import './ReviewScreen.css';

const ReviewScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [generatingPdf, setGeneratingPdf] = useState<boolean>(false);
  const [validationMessage, setValidationMessage] = useState<string>('');

  useEffect(() => {
    const loadLatestPlan = async () => {
      try {
        const plans = await getAllWeeklyPlans();
        if (plans.length > 0) {
          // Get the latest plan
          const latestPlan = plans.reduce((latest, current) => 
            current.updatedAt > latest.updatedAt ? current : latest
          );
          setWeeklyPlan(latestPlan);
          
          // Check validation - check if at least one day has activities
          const hasActivity = latestPlan.days.some(day => day.activities.trim() !== '');
          if (!hasActivity) {
            setValidationMessage(t('oneActivityRequired'));
          } else {
            setValidationMessage(t('weeklyPlanComplete'));
          }
        }
      } catch (error) {
        console.error('Error loading plan:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLatestPlan();
  }, []);

  const handleGeneratePdf = async (pdfType: 'classdojo' | 'coordinator') => {
    if (!weeklyPlan) return;
    
    setGeneratingPdf(true);
    try {
      const pdfs = await generatePdfs(weeklyPlan);
      
      // Determine which blob to use based on type
      const blob = pdfType === 'classdojo' ? pdfs.classdojoPdf : pdfs.coordinatorPdf;
      const filename = pdfType === 'classdojo' ? pdfs.classdojoFilename : pdfs.coordinatorFilename;
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleShare = async (pdfType: 'classdojo' | 'coordinator') => {
    if (!weeklyPlan) return;
    
    try {
      const pdfs = await generatePdfs(weeklyPlan);
      
      // Determine which blob to use based on type
      const blob = pdfType === 'classdojo' ? pdfs.classdojoPdf : pdfs.coordinatorPdf;
      const filename = pdfType === 'classdojo' ? pdfs.classdojoFilename : pdfs.coordinatorFilename;
      
      // Create file for sharing
      const file = new File([blob], filename, { type: 'application/pdf' });
      
      // Check if Web Share API is available
      if (navigator.share) {
        try {
          await navigator.share({
            title: filename,
            text: pdfType === 'classdojo' 
              ? t('shareClassDojoPdf') 
              : t('shareCoordinatorPdf'),
            files: [file]
          });
        } catch (error) {
          // User cancelled sharing, fall back to download
          console.log('Sharing cancelled, falling back to download');
          handleGeneratePdf(pdfType);
        }
      } else {
        // Web Share API not supported, fall back to download
        handleGeneratePdf(pdfType);
      }
    } catch (error) {
      console.error('Error sharing PDF:', error);
      // Fall back to download
      handleGeneratePdf(pdfType);
    }
  };

  const handleEdit = () => {
    navigate('/weekly-plan');
  };

  if (loading) {
    return (
      <div className="review-screen loading">
        <div className="spinner"></div>
        <p>{t('loading')}...</p>
      </div>
    );
  }

  if (!weeklyPlan) {
    return (
      <div className="review-screen">
        <div className="container">
          <h1>{t('reviewScreenTitle')}</h1>
          <p>No weekly plan found. Please go back and create one.</p>
          <button onClick={() => navigate('/weekly-plan')} className="btn-primary">
            {t('startNewPlan')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="review-screen">
      <HomeButton />
      <div className="review-container">
        <header className="review-header">
          <h1>{t('reviewScreenTitle')}</h1>
          <div className={`validation-badge ${validationMessage.includes('complete') ? 'success' : 'warning'}`}>
            {validationMessage}
          </div>
        </header>

        <main className="review-content">
          <div className="plan-summary">
            <h2>
              <small>{t('dateRange', { 
                startDate: new Date(weeklyPlan.startDate).toLocaleDateString(i18n.language, { month: 'short', day: 'numeric' }), 
                endDate: new Date(weeklyPlan.endDate).toLocaleDateString(i18n.language, { month: 'short', day: 'numeric' })
              })}</small>
            </h2>
            
            <div className="summary-details">
              <p><strong>{t('teacher')}:</strong> {weeklyPlan.teacher}</p>
              <p><strong>{t('subject')}:</strong> {weeklyPlan.subject}</p>
              <p><strong>{t('grade')}:</strong> {weeklyPlan.grade}{weeklyPlan.class}</p>
            </div>
          </div>

          <div className="daily-reviews">
            <h3>{t('dailyLessons')}</h3>
            {weeklyPlan.days.map((day: DayPlan, index: number) => (
              <div key={index} className="day-review">
                <h4>{day.day}</h4>
                <div className="day-content">
                  <div className="content-section">
                    <p><strong>{t('lessonTopic')}:</strong> {day.lessonTopic || '-'}</p>
                    <p><strong>{t('learningObjectives')}:</strong> {day.learningObjectives || '-'}</p>
                  </div>
                  <div className="content-section">
                    <p><strong>{t('activitiesClasswork')}:</strong> {day.activities || '-'}</p>
                    <p><strong>{t('activityTools')}:</strong> {day.activityTools || '-'}</p>
                    <p><strong>{t('homeworkAssessment')}:</strong> {day.homeworkAssessment || '-'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Removed the weekly activities section since it's been removed from the workflow */}
        </main>

        <footer className="review-actions">
          <div className="action-buttons">
            <button 
              className="btn-secondary" 
              onClick={handleEdit}
              disabled={generatingPdf}
            >
              {t('edit')}
            </button>
            
            <div className="pdf-buttons">
              <button 
                className="btn-primary" 
                onClick={() => handleShare('classdojo')}
                disabled={generatingPdf}
              >
                {generatingPdf ? t('loading') + '...' : t('shareClassDojoPdf')}
              </button>
              
              <button 
                className="btn-accent" 
                onClick={() => handleShare('coordinator')}
                disabled={generatingPdf}
              >
                {generatingPdf ? t('loading') + '...' : t('shareCoordinatorPdf')}
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default ReviewScreen;