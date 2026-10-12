import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import 'jspdf-autotable';
import type { WeeklyPlan } from '../models';

const PDF_CONTENT_WIDTH = 1100;
const arabicFontUrl = new URL('../fonts/Amiri-Regular.ttf', import.meta.url).href;

const arabicStyles = `
  @font-face {
    font-family: 'PlanViewArabic';
    src: url('${arabicFontUrl}') format('truetype');
    font-style: normal;
    font-weight: 400;
  }
  * {
    box-sizing: border-box;
    font-family: Tahoma, Arial, 'PlanViewArabic', sans-serif !important;
  }
  html, body {
    margin: 0;
    padding: 0;
    width: ${PDF_CONTENT_WIDTH}px;
    color: #111;
    background: #fff;
    font-size: 16px;
    line-height: 1.5;
  }
  body {
    direction: rtl;
    unicode-bidi: plaintext;
  }
  .pdf-container {
    width: ${PDF_CONTENT_WIDTH}px;
    padding: 28px;
    direction: rtl;
    unicode-bidi: plaintext;
  }
  .pdf-header {
    margin-bottom: 20px;
    text-align: center;
  }
  .pdf-meta {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 16px;
  }
  table {
    width: 100%;
    table-layout: auto;
    border-collapse: collapse;
    direction: rtl;
  }
  th, td {
    border: 1px solid #aaa;
    padding: 10px;
    direction: rtl;
    unicode-bidi: plaintext;
    text-align: right;
    vertical-align: top;
    word-break: keep-all; /* Keeps Arabic words intact */
    overflow-wrap: break-word; /* Wraps long English strings safely */
    white-space: normal;
  }
  th {
    color: #fff;
    background: #287eae;
  }
  .activity-section {
    margin-top: 20px;
  }
  .section-title {
    font-weight: bold;
  }
`;

// Function to create ClassDojo PDF content
function createClassDojoPdfContent(weeklyPlan: WeeklyPlan) {
  console.log("F. Immediately before container.innerHTML is assigned (ClassDojo):", weeklyPlan);
  
  // Test string for Arabic rendering
  const arabicTest = "خطة الدرس الأسبوعية";
  console.log("Arabic test string:", arabicTest);
  
  let content = `
    <!DOCTYPE html>
    <html dir="rtl">
    <head>
      <meta charset="UTF-8">
      <style>
        ${arabicStyles}
      </style>
    </head>
    <body>
      <div class="pdf-container">
        <div class="pdf-header">
          <h1>${weeklyPlan.teacher || 'Teacher Name'}</h1>
          <h2>${weeklyPlan.subject || 'Subject'} - ${weeklyPlan.grade || 'Grade'} ${weeklyPlan.class || 'Class'}</h2>
          <p>Week: ${weeklyPlan.startDate ? new Date(weeklyPlan.startDate).toLocaleDateString() : 'Start Date'} - ${weeklyPlan.endDate ? new Date(weeklyPlan.endDate).toLocaleDateString() : 'End Date'}</p>
        </div>
        
        <div class="pdf-meta">
          <div><strong>Academic Year:</strong> ${weeklyPlan.academicYear || 'N/A'}</div>
          <div><strong>Week Number:</strong> ${weeklyPlan.weekNumber || 'N/A'}</div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Day</th>
              <th>Lesson Topic</th>
              <th>Learning Objectives</th>
              <th>Activities</th>
              <th>Activity Tools</th>
              <th>Homework/Assessment</th>
            </tr>
          </thead>
          <tbody>
  `;
  
  if (weeklyPlan.days && Array.isArray(weeklyPlan.days)) {
    weeklyPlan.days.forEach((day: any) => {
      content += `
        <tr>
          <td>${day.day || ''}</td>
          <td>${day.lessonTopic || ''}</td>
          <td>${day.learningObjectives || ''}</td>
          <td>${day.activities || ''}</td>
          <td>${day.activityTools || ''}</td>
          <td>${day.homeworkAssessment || ''}</td>
        </tr>
      `;
    });
  }
  
  content += `
        </tbody>
      </table>
  `;
  
  if (weeklyPlan.weeklyActivities) {
    content += `
      <div class="activity-section">
        <div class="section-title">Weekly Activities</div>
        <p><strong>Special Activity:</strong> ${weeklyPlan.weeklyActivities.hasSpecialActivity ? 'Yes' : 'No'}</p>
        ${weeklyPlan.weeklyActivities.description ? `<p><strong>Description:</strong> ${weeklyPlan.weeklyActivities.description}</p>` : ''}
        ${weeklyPlan.weeklyActivities.materialsNeeded ? `<p><strong>Materials Needed:</strong> ${weeklyPlan.weeklyActivities.materialsNeeded}</p>` : ''}
        ${weeklyPlan.weeklyActivities.teacherNotes ? `<p><strong>Teacher Notes:</strong> ${weeklyPlan.weeklyActivities.teacherNotes}</p>` : ''}
      </div>
    `;
  }
  
  content += `
      </div>
    </body>
    </html>
  `;
  
  console.log("G. Immediately after container.innerHTML is assigned (ClassDojo):", content.includes(arabicTest));
  
  return content;
}

// Function to create Coordinator PDF content
function createCoordinatorPdfContent(weeklyPlan: WeeklyPlan) {
  console.log("F. Immediately before container.innerHTML is assigned (Coordinator):", weeklyPlan);
  
  // Test string for Arabic rendering
  const arabicTest = "خطة الدرس الأسبوعية";
  console.log("Arabic test string:", arabicTest);
  
  let content = `
    <!DOCTYPE html>
    <html dir="rtl">
    <head>
      <meta charset="UTF-8">
      <style>
        ${arabicStyles}
      </style>
    </head>
    <body>
      <div class="pdf-container">
        <div class="pdf-header">
          <h1>Weekly Plan - Academic Coordinator</h1>
          <h2>${weeklyPlan.subject || 'Subject'} - ${weeklyPlan.grade || 'Grade'} ${weeklyPlan.class || 'Class'}</h2>
          <p>Teacher: ${weeklyPlan.teacher || 'Teacher Name'}</p>
          <p>Week: ${weeklyPlan.startDate ? new Date(weeklyPlan.startDate).toLocaleDateString() : 'Start Date'} - ${weeklyPlan.endDate ? new Date(weeklyPlan.endDate).toLocaleDateString() : 'End Date'}</p>
        </div>
        
        <div class="pdf-meta">
          <div><strong>Academic Year:</strong> ${weeklyPlan.academicYear || 'N/A'}</div>
          <div><strong>Week Number:</strong> ${weeklyPlan.weekNumber || 'N/A'}</div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Day</th>
              <th>Lesson Topic</th>
              <th>Learning Objectives</th>
              <th>Activities</th>
              <th>Activity Tools</th>
              <th>Homework/Assessment</th>
            </tr>
          </thead>
          <tbody>
  `;
  
  if (weeklyPlan.days && Array.isArray(weeklyPlan.days)) {
    weeklyPlan.days.forEach((day: any) => {
      content += `
        <tr>
          <td>${day.day || ''}</td>
          <td>${day.lessonTopic || ''}</td>
          <td>${day.learningObjectives || ''}</td>
          <td>${day.activities || ''}</td>
          <td>${day.activityTools || ''}</td>
          <td>${day.homeworkAssessment || ''}</td>
        </tr>
      `;
    });
  }
  
  content += `
        </tbody>
      </table>
  `;
  
  if (weeklyPlan.weeklyActivities) {
    content += `
      <div class="activity-section">
        <div class="section-title">Weekly Activities</div>
        <p><strong>Special Activity:</strong> ${weeklyPlan.weeklyActivities.hasSpecialActivity ? 'Yes' : 'No'}</p>
        ${weeklyPlan.weeklyActivities.description ? `<p><strong>Description:</strong> ${weeklyPlan.weeklyActivities.description}</p>` : ''}
        ${weeklyPlan.weeklyActivities.materialsNeeded ? `<p><strong>Materials Needed:</strong> ${weeklyPlan.weeklyActivities.materialsNeeded}</p>` : ''}
        ${weeklyPlan.weeklyActivities.teacherNotes ? `<p><strong>Teacher Notes:</strong> ${weeklyPlan.weeklyActivities.teacherNotes}</p>` : ''}
      </div>
    `;
  }
  
  content += `
      </div>
    </body>
    </html>
  `;
  
  console.log("G. Immediately after container.innerHTML is assigned (Coordinator):", content.includes(arabicTest));
  
  return content;
}

// Isolated test function for Arabic text rendering
export async function testArabicPdfGeneration() {
  console.log("Starting isolated Arabic text PDF test...");

  return renderPdf(`
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <style>${arabicStyles}</style>
      </head>
      <body>
        <div class="pdf-container" style="text-align:center;font-size:28px;padding-top:80px">
          خطة الدرس الأسبوعية
        </div>
      </body>
    </html>
  `, 'p');
}

// Generate both ClassDojo and Coordinator PDFs using a more reliable method
export async function generatePdf(weeklyPlan: WeeklyPlan, type: 'classdojo' | 'coordinator') {
  const pdf = type === 'classdojo'
    ? await generateClassDojoPdf(weeklyPlan)
    : await generateCoordinatorPdf(weeklyPlan);
  const filename = type === 'classdojo'
    ? 'ClassDojo_WeeklyPlan.pdf'
    : `Coordinator_WeeklyPlan_${weeklyPlan.teacher}_${weeklyPlan.subject}_${weeklyPlan.grade}_${weeklyPlan.class}.pdf`;

  return { pdf, filename };
}

// Generate ClassDojo PDF using jsPDF directly
async function generateClassDojoPdf(weeklyPlan: WeeklyPlan) {
  return renderPdf(createClassDojoPdfContent(weeklyPlan), 'l');
}

// Generate Coordinator PDF using jsPDF directly
async function generateCoordinatorPdf(weeklyPlan: WeeklyPlan) {
  return renderPdf(createCoordinatorPdfContent(weeklyPlan), 'l');
}

async function renderPdf(html: string, orientation: 'l' | 'p'): Promise<Blob> {
  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.position = 'fixed';
  iframe.style.left = '-12000px';
  iframe.style.top = '0';
  iframe.style.width = `${PDF_CONTENT_WIDTH}px`;
  iframe.style.height = '900px';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  try {
    const iframeDoc = iframe.contentDocument;
    if (!iframeDoc) {
      throw new Error('Could not access PDF document');
    }

    iframeDoc.open();
    iframeDoc.write(html);
    iframeDoc.close();

    await iframeDoc.fonts.load('16px "PlanViewArabic"', 'اختبار');
    await iframeDoc.fonts.ready;

    const element = iframeDoc.querySelector<HTMLElement>('.pdf-container');
    if (!element) {
      throw new Error('PDF content container was not created');
    }

    const contentHeight = Math.max(element.scrollHeight, element.offsetHeight);
    if (contentHeight === 0) {
      throw new Error('PDF content has no height');
    }
    iframe.style.height = `${contentHeight}px`;

    const canvas = await html2canvas(element, {
      scale: 1.5,
      backgroundColor: '#ffffff',
      width: PDF_CONTENT_WIDTH,
      height: contentHeight,
      windowWidth: PDF_CONTENT_WIDTH,
      windowHeight: contentHeight,
    });

    const pdf = new jsPDF(orientation, 'mm', 'a4');
    const pageWidth = orientation === 'l' ? 297 : 210;
    const pageHeight = orientation === 'l' ? 210 : 297;
    const sourcePageHeight = canvas.width * pageHeight / pageWidth;
    const pageCount = Math.ceil(canvas.height / sourcePageHeight);

    for (let page = 0; page < pageCount; page++) {
      if (page > 0) {
        pdf.addPage();
      }

      const sourceY = Math.round(page * sourcePageHeight);
      const sourceHeight = Math.min(Math.ceil(sourcePageHeight), canvas.height - sourceY);
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvas.width;
      pageCanvas.height = sourceHeight;

      const context = pageCanvas.getContext('2d');
      if (!context) {
        throw new Error('Could not create PDF page canvas');
      }

      context.drawImage(canvas, 0, sourceY, canvas.width, sourceHeight, 0, 0, canvas.width, sourceHeight);
      const imageData = pageCanvas.toDataURL('image/jpeg', 0.78);
      const imageHeight = sourceHeight * pageWidth / canvas.width;
      pdf.addImage(imageData, 'JPEG', 0, 0, pageWidth, imageHeight);
      pageCanvas.width = 0;
      pageCanvas.height = 0;
    }

    canvas.width = 0;
    canvas.height = 0;
    return pdf.output('blob');
  } finally {
    iframe.remove();
  }
}