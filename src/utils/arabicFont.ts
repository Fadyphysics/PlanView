// Font name constants
export const ARABIC_FONT_NAME = 'NotoSansArabic';
export const ARABIC_FONT_FILE_NAME = 'NotoSansArabic-Regular.ttf';

// This would contain the actual base64 representation of the Arabic font
// For now, this is empty - it needs to be filled with actual font data
let arabicFontBase64 = '';

// Async function to load font data (this would fetch the actual font)
export async function loadArabicFontData(): Promise<string> {
  // In a real implementation, you could fetch the font file from the public directory
  // or load it from a base64 encoded string stored in this file
  try {
    if (!arabicFontBase64) {
      // Attempt to fetch font from public directory
      const response = await fetch(`/fonts/${ARABIC_FONT_FILE_NAME}`);
      if (response.ok) {
        const fontArrayBuffer = await response.arrayBuffer();
        // Convert ArrayBuffer to base64
        const bytes = new Uint8Array(fontArrayBuffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        arabicFontBase64 = btoa(binary);
      } else {
        console.warn(`Font file not found at /fonts/${ARABIC_FONT_FILE_NAME}. Please add the font file to enable Arabic support.`);
      }
    }
    return arabicFontBase64;
  } catch (error) {
    console.error('Error loading Arabic font:', error);
    return '';
  }
}

// Register the Arabic font with jsPDF
export async function registerArabicFont(doc: any): Promise<void> {
  try {
    // Check if the font is already registered
    const fontList = doc.getFontList();
    if (fontList[ARABIC_FONT_NAME]) {
      return; // Already registered
    }

    // Try to load the font data
    const fontData = await loadArabicFontData();
    
    if (fontData) {
      // Add the font to jsPDF's virtual file system
      doc.addFileToVFS(ARABIC_FONT_FILE_NAME, fontData);
      // Register the font
      doc.addFont(ARABIC_FONT_FILE_NAME, ARABIC_FONT_NAME, 'normal');
      console.log('Arabic font successfully registered');
    } else {
      console.warn('Could not load Arabic font. English-only PDF will be generated.');
    }
  } catch (error) {
    console.error('Error registering Arabic font:', error);
  }
}

// Alternative sync function for cases where async isn't suitable
export function registerArabicFontSync(doc: any): void {
  try {
    // Check if the font is already registered
    const fontList = doc.getFontList();
    if (fontList[ARABIC_FONT_NAME]) {
      return; // Already registered
    }

    // If we have the font data available synchronously, use it
    if (arabicFontBase64) {
      doc.addFileToVFS(ARABIC_FONT_FILE_NAME, arabicFontBase64);
      doc.addFont(ARABIC_FONT_FILE_NAME, ARABIC_FONT_NAME, 'normal');
    }
  } catch (error) {
    console.error('Error registering Arabic font (sync):', error);
  }
}

// Function to detect Arabic text
export function containsArabic(text: string): boolean {
  return /[\u0600-\u06FF\u0750-\u077F]/.test(text || '');
}

// Function to determine text alignment based on content
export function getTextAlignment(text: string): 'left' | 'right' | 'center' | 'justify' {
  return containsArabic(text) ? 'right' : 'left';
}