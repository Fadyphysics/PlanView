import React, { useState } from 'react';
import type { WeeklyPlan } from '../models';
import { generatePdf, testArabicPdfGeneration } from '../utils/pdfGenerator';
import './ReviewScreen.css';

interface ReviewScreenProps {
  weeklyPlan: WeeklyPlan;
  onEdit: () => void;
  onHome: () => void;
}

export const ReviewScreen: React.FC<ReviewScreenProps> = ({
  weeklyPlan,
  onEdit,
  onHome,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  // Diagnostic logging for Arabic text
  console.log("A. Immediately after teacher enters it (in ReviewScreen):", weeklyPlan);

  // Helper to trigger file download or share
  const handlePdfAction = async (type: 'classdojo' | 'coordinator') => {
    setIsGenerating(true);
    try {
      // C. When the WeeklyPlan is loaded
      console.log("C. When the WeeklyPlan is loaded:", weeklyPlan);
      
      // D. Immediately before createClassDojoPdf()
      if (type === 'classdojo') {
        console.log("D. Immediately before createClassDojoPdf():", weeklyPlan);
      }
      // E. Immediately before createCoordinatorPdf()
      else {
        console.log("E. Immediately before createCoordinatorPdf():", weeklyPlan);
      }
      
      const result = await generatePdf(weeklyPlan, type);
      const blob = result.pdf;
      const fileName = result.filename;

      if (!blob || blob.size === 0) {
        alert('PDF generation failed or file is empty.');
        return;
      }

      const pdfFile = new File([blob], fileName, { type: 'application/pdf' });

      // Check if browser is mobile & supports Web Share API file payload
      const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

      if (isMobile && navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
        await navigator.share({
          files: [pdfFile],
        });
      } else {
        // Desktop / Unsupported fallback: Force direct download
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error(`Error processing ${type} PDF:`, error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Function to run isolated Arabic text test
  const handleArabicTest = async () => {
    setIsGenerating(true);
    try {
      console.log("Running isolated Arabic text test...");
      const arabicTestBlob = await testArabicPdfGeneration();
      
      // Download the test PDF
      const url = URL.createObjectURL(arabicTestBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'arabic_text_test.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log("Isolated Arabic test PDF downloaded successfully");
    } catch (error) {
      console.error('Error with Arabic text test:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Log the weekly plan when component renders
  console.log("B. When the WeeklyPlan object is saved (component render):", weeklyPlan);

  return (
    <div className="review-container">
      <header className="review-header">
        <h2>Review Weekly Plan</h2>
        <div className="plan-meta">
          <span><strong>Grade:</strong> {weeklyPlan.grade}</span>
          <span><strong>Class:</strong> {weeklyPlan.class}</span>
          <span><strong>Subject:</strong> {weeklyPlan.subject}</span>
        </div>
      </header>

      <div className="review-body">
        <h3>Plan Details</h3>
        <table className="review-table">
          <thead>
            <tr>
              <th>Day</th>
              <th>Topic / Lesson</th>
              <th>Learning Objectives</th>
              <th>Homework / Assessment</th>
            </tr>
          </thead>
          <tbody>
            {(weeklyPlan.days || []).map((day: any, index: number) => (
              <tr key={index}>
                <td>{day.day || day.name || `Day ${index + 1}`}</td>
                <td>{day.lessonTopic || day.topic || '-'}</td>
                <td>{day.learningObjectives || '-'}</td>
                <td>{day.homeworkAssessment || day.homework || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <footer className="review-actions">
        <button className="btn btn-secondary" onClick={onEdit} disabled={isGenerating}>
          Edit Plan
        </button>

        <button 
          className="btn btn-primary" 
          onClick={() => handlePdfAction('classdojo')} 
          disabled={isGenerating}
        >
          {isGenerating ? 'Generating...' : 'تحميل / مشاركة PDF كلاس دوجو'}
        </button>

        <button 
          className="btn btn-primary" 
          onClick={() => handlePdfAction('coordinator')} 
          disabled={isGenerating}
        >
          {isGenerating ? 'Generating...' : 'تحميل / مشاركة PDF المنسق الأكاديمي'}
        </button>
        
        {/* Button for isolated Arabic text test */}
        <button 
          className="btn btn-info" 
          onClick={handleArabicTest} 
          disabled={isGenerating}
        >
          {isGenerating ? 'Testing...' : 'Test Arabic Text Isolated'}
        </button>

        <button className="btn btn-outline" onClick={onHome} disabled={isGenerating}>
          Home
        </button>
      </footer>
    </div>
  );
};

export default ReviewScreen;