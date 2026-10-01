import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { WeeklyPlan } from '../models';

interface PdfGenerationResult {
  classdojoPdf: Blob;
  coordinatorPdf: Blob;
  classdojoFilename: string;
  coordinatorFilename: string;
}

export async function generatePdfs(weeklyPlan: WeeklyPlan): Promise<PdfGenerationResult> {
  // Extract the first day of the week (Sunday) for filename
  const startDate = new Date(weeklyPlan.startDate);
  const firstDayOfMonth = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const classdojoFilename = `CD ${firstDayOfMonth}.pdf`;
  const coordinatorFilename = `${weeklyPlan.grade}${weeklyPlan.class}${weeklyPlan.subject.substring(0, 4)}${firstDayOfMonth}.pdf`;

  // Generate ClassDojo PDF (simplified version)
  const classdojoPdf = await createClassDojoPdf(weeklyPlan);
  
  // Generate Academic Coordinator PDF (complete version)
  const coordinatorPdf = await createCoordinatorPdf(weeklyPlan);

  return {
    classdojoPdf,
    coordinatorPdf,
    classdojoFilename,
    coordinatorFilename
  };
}

async function createClassDojoPdf(weeklyPlan: WeeklyPlan): Promise<Blob> {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  // Add title
  doc.setFontSize(16);
  doc.text('SEACOAST INTERNATIONAL SCHOOL', 105, 20, { align: 'center' });
  doc.setFontSize(14);
  doc.text('HAY DEMASHQ BRANCH', 105, 28, { align: 'center' });
  doc.setFontSize(18);
  doc.text('WEEKLY LESSON PLAN', 105, 38, { align: 'center' });

  // Add teacher info
  doc.setFontSize(12);
  doc.text(`Teacher: ${weeklyPlan.teacher}`, 20, 50);
  doc.text(`Subject: ${weeklyPlan.subject}`, 120, 50);
  doc.text(`Grade: ${weeklyPlan.grade}`, 20, 58);
  doc.text(`${formatDate(weeklyPlan.startDate)}`, 120, 58);

  // Define the table columns for ClassDojo version (only essential columns)
  const tableColumnHeaders = [
    'Day',
    'Lesson / Topic',
    'Learning Objectives',
    'Homework / Assessment'
  ];

  // Prepare table data
  const tableRows = weeklyPlan.days.map(day => [
    day.day,
    day.lessonTopic,
    day.learningObjectives,
    day.homeworkAssessment
  ]);

  // Add the table
  autoTable(doc, {
    head: [tableColumnHeaders],
    body: tableRows,
    startY: 70,
    margin: { horizontal: 10 },
    styles: {
      fontSize: 10,
      cellPadding: 5
    },
    headStyles: {
      fillColor: [0, 51, 102] // Blue color matching school identity
    }
  });

  // Add signature section
  const finalY = (doc as any).lastAutoTable.finalY + 20;
  doc.text("Teacher's Signature: ______________________", 20, finalY);
  doc.text(`Date: ______________________`, 120, finalY);

  return doc.output('blob') as Blob;
}

async function createCoordinatorPdf(weeklyPlan: WeeklyPlan): Promise<Blob> {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  // Add title
  doc.setFontSize(16);
  doc.text('SEACOAST INTERNATIONAL SCHOOL', 105, 20, { align: 'center' });
  doc.setFontSize(14);
  doc.text('HAY DEMASHQ BRANCH', 105, 28, { align: 'center' });
  doc.setFontSize(18);
  doc.text('WEEKLY LESSON PLAN', 105, 38, { align: 'center' });

  // Add teacher info
  doc.setFontSize(12);
  doc.text(`Teacher: ${weeklyPlan.teacher}`, 20, 50);
  doc.text(`Subject: ${weeklyPlan.subject}`, 120, 50);
  doc.text(`Grade: ${weeklyPlan.grade}`, 20, 58);
  doc.text(`${formatDate(weeklyPlan.startDate)}`, 120, 58);

  // Define the table columns for Coordinator version (all columns)
  const tableColumnHeaders = [
    'Day',
    'Lesson / Topic',
    'Learning Objectives',
    'Activities / Classwork',
    'Activity Tools',
    'Homework / Assessment'
  ];

  // Prepare table data
  const tableRows = weeklyPlan.days.map(day => [
    day.day,
    day.lessonTopic,
    day.learningObjectives,
    day.activities,
    day.activityTools,
    day.homeworkAssessment
  ]);

  // Add the table
  autoTable(doc, {
    head: [tableColumnHeaders],
    body: tableRows,
    startY: 70,
    margin: { horizontal: 5 },
    styles: {
      fontSize: 9,
      cellPadding: 4
    },
    headStyles: {
      fillColor: [0, 51, 102] // Blue color matching school identity
    }
  });

  // Add weekly activities section if applicable
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.text('WEEKLY ACTIVITIES', 20, finalY);
  
  const weeklySectionY = finalY + 8;
  doc.setFontSize(10);
  doc.text(
    `Are there any special activities this week? ${weeklyPlan.weeklyActivities.hasSpecialActivity ? 'Yes' : 'No'}`,
    20,
    weeklySectionY
  );

  let notesY = weeklySectionY + 40; // Default value when there are no special activities
  
  if (weeklyPlan.weeklyActivities.hasSpecialActivity) {
    const descriptionY = weeklySectionY + 8;
    doc.text('If yes, please describe:', 20, descriptionY);
    
    const descTextY = descriptionY + 6;
    if (weeklyPlan.weeklyActivities.description) {
      doc.text(weeklyPlan.weeklyActivities.description, 20, descTextY, { maxWidth: 170 });
    }
    
    const materialsY = descTextY + (weeklyPlan.weeklyActivities.description ? 
      Math.ceil(weeklyPlan.weeklyActivities.description.length / 80) * 8 : 8) + 8;
    doc.text('Materials / Resources Needed:', 20, materialsY);
    
    const materialsTextY = materialsY + 6;
    if (weeklyPlan.weeklyActivities.materialsNeeded) {
      doc.text(weeklyPlan.weeklyActivities.materialsNeeded, 20, materialsTextY, { maxWidth: 170 });
    }
    
    notesY = materialsTextY + (weeklyPlan.weeklyActivities.materialsNeeded ? 
      Math.ceil(weeklyPlan.weeklyActivities.materialsNeeded.length / 80) * 8 : 8) + 8;
    doc.text("Teacher's Notes:", 20, notesY);
    
    const notesTextY = notesY + 6;
    if (weeklyPlan.weeklyActivities.teacherNotes) {
      doc.text(weeklyPlan.weeklyActivities.teacherNotes, 20, notesTextY, { maxWidth: 170 });
    }
  }

  // Add signature section
  const signatureY = Math.max(
    finalY + 60,
    notesY + 20
  );
  doc.text("Teacher's Signature: ______________________", 20, signatureY);
  doc.text(`Date: ______________________`, 120, signatureY);

  return doc.output('blob') as Blob;
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}