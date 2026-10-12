/**
 * Utility to load Arabic font for PDF generation
 */
/**
 * Utility to check Arabic content for PDF generation
 */

// Function to preload Arabic font before PDF generation
export async function preloadArabicFont(): Promise<void> {
  return new Promise((resolve) => {
    // Check if the font is already loaded
    if (document.querySelector('#arabic-font-css')) {
      resolve();
      return;
    }

    // Create a link element to load the Arabic font
    const link = document.createElement('link');
    link.id = 'arabic-font-css';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;700&display=swap';
    
    link.onload = () => {
      // Wait a bit more to ensure the font is fully loaded and applied
      setTimeout(() => {
        // Create a temporary element with Arabic text to force font loading
        const tempElement = document.createElement('div');
        tempElement.style.fontFamily = "'Noto Sans Arabic', 'Amiri', 'Tahoma', 'Arial', sans-serif";
        tempElement.style.visibility = 'hidden';
        tempElement.textContent = 'اختبار Test';
        document.body.appendChild(tempElement);
        
        // Force layout to ensure font is rendered
        tempElement.offsetHeight;
        
        // Remove the temporary element
        document.body.removeChild(tempElement);
        
        resolve();
      }, 500);
    };
    
    link.onerror = () => {
      console.warn('Failed to load Arabic font from Google Fonts, proceeding with fallback fonts');
      resolve();
    };
    
    document.head.appendChild(link);
  });
}

// Alternative approach: Preload font using Font API if available
export async function preloadArabicFontWithFontFace(): Promise<void> {
  if ('fonts' in document) {
    try {
      // First, try to load from local files if available
      const localFontLoaded = await tryLoadLocalArabicFont();
      if (localFontLoaded) {
        // Wait for fonts to be ready
        await document.fonts.ready;
        return;
      }
    } catch (err) {
      console.warn('Local font loading failed, trying alternative methods');
    }

    // If local fonts aren't available, fall back to Google Fonts
    try {
      // Define the font faces
      const arabicFont = new FontFace(
        'Noto Sans Arabic',
        'url(https://fonts.gstatic.com/s/notosansarabic/v26/J7aRr1THnIZmMxA6DsmzyNrvgP4.woff2)',
        { weight: '400', style: 'normal' }
      );
      
      const arabicFontBold = new FontFace(
        'Noto Sans Arabic',
        'url(https://fonts.gstatic.com/s/notosansarabic/v26/J7aRr1THnIZmMxA6DsmzyNrvgP4.woff2)',
        { weight: '700', style: 'normal' }
      );
      
      // Load the fonts
      await arabicFont.load();
      await arabicFontBold.load();
      
      // Add to document
      document.fonts.add(arabicFont);
      document.fonts.add(arabicFontBold);
      
      // Wait for the fonts to be ready
      await document.fonts.ready;
    } catch (err) {
      console.warn('FontFace API not supported or failed to load fonts, using fallback method');
      await preloadArabicFont();
    }
  } else {
    // Fallback to CSS loading method
    await preloadArabicFont();
  }
}

// Try to load local Arabic font files
async function tryLoadLocalArabicFont(): Promise<boolean> {
  try {
    if ('fonts' in document) {
      // Try to load local font files
      const arabicFontRegular = new FontFace(
        'Noto Sans Arabic',
        'url(/fonts/NotoSansArabic-Regular.ttf)',
        { weight: '400', style: 'normal' }
      );
      
      const arabicFontBold = new FontFace(
        'Noto Sans Arabic',
        'url(/fonts/NotoSansArabic-Bold.ttf)',
        { weight: '700', style: 'normal' }
      );
      
      // Load the fonts
      await arabicFontRegular.load();
      await arabicFontBold.load();
      
      // Add to document
      document.fonts.add(arabicFontRegular);
      document.fonts.add(arabicFontBold);
      
      return true;
    }
  } catch (err) {
    console.warn('Local font loading failed:', err);
    return false;
  }
  
  return false;
}

// Function to check if Arabic text is present in the weekly plan
export function hasArabicContent(weeklyPlan: any): boolean {
  // Helper function to check if text contains Arabic
  const containsArabic = (text: string): boolean => {
    if (!text) return false;
    return /[\u0600-\u06FF\u0750-\u077F]/.test(text);
  };

  // Check various fields in the weekly plan for Arabic content
  if (containsArabic(weeklyPlan.subject) || 
      containsArabic(weeklyPlan.teacher) ||
      containsArabic(weeklyPlan.grade) ||
      containsArabic(weeklyPlan.class)) {
    return true;
  }

  // Check days array if it exists
  if (weeklyPlan.days && Array.isArray(weeklyPlan.days)) {
    for (const day of weeklyPlan.days) {
      if (containsArabic(day.day || '') ||
          containsArabic(day.lessonTopic || '') ||
          containsArabic(day.learningObjectives || '') ||
          containsArabic(day.activities || '') ||
          containsArabic(day.activityTools || '') ||
          containsArabic(day.homeworkAssessment || '')) {
        return true;
      }
    }
  }

  return false;
}