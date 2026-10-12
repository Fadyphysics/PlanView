import pdfMake from 'pdfmake/build/pdfmake';

let isFontLoaded = false;

function isFontInVFS(fontName: string): boolean {
  return pdfMake.vfs && pdfMake.vfs[fontName] !== undefined;
}

export async function configurePdfMakeFonts(): Promise<void> {
  if (isFontLoaded) return;

  try {
    // Try to load Noto Sans Arabic Regular font
    let response = await fetch('/fonts/NotoSansArabic-Regular.ttf');
    if (!response.ok) {
      console.warn('Regular Arabic font not found, attempting to load from CDN...');
      // Fallback: try to get font from CDN if local file not available
      response = await fetch('https://fonts.gstatic.com/s/notosansarabic/v26/JRNVWXIvG7Ba1Lu6ilKuHwmayNqpGTTjYDIzcdSc5qU.woff2');
      if (!response.ok) throw new Error(`Font fetch failed: ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const base64Font = bufferToBase64(arrayBuffer);

    // Add font to virtual file system
    pdfMake.vfs = {
      ...pdfMake.vfs,
      'NotoSansArabic-Regular.ttf': base64Font
    };

    // Try to load bold variant as well
    try {
      const boldResponse = await fetch('/fonts/NotoSansArabic-Bold.ttf');
      if (boldResponse.ok) {
        const boldArrayBuffer = await boldResponse.arrayBuffer();
        const boldBase64Font = bufferToBase64(boldArrayBuffer);
        pdfMake.vfs = {
          ...pdfMake.vfs,
          'NotoSansArabic-Bold.ttf': boldBase64Font
        };
      }
    } catch (boldErr) {
      console.warn('Bold Arabic font not found, using regular as fallback:', boldErr);
    }

    // Configure font mapping
    pdfMake.fonts = {
      ...pdfMake.fonts, // Preserve existing fonts
      NotoSansArabic: {
        normal: 'NotoSansArabic-Regular.ttf',
        bold: isFontInVFS('NotoSansArabic-Bold.ttf') ? 'NotoSansArabic-Bold.ttf' : 'NotoSansArabic-Regular.ttf', // Use regular if bold not available
        italics: 'NotoSansArabic-Regular.ttf',
        bolditalics: isFontInVFS('NotoSansArabic-Bold.ttf') ? 'NotoSansArabic-Bold.ttf' : 'NotoSansArabic-Regular.ttf',
      }
    };

    isFontLoaded = true;
    console.log('Arabic fonts loaded successfully');
  } catch (err) {
    console.error('Failed to load Arabic font for PDF, falling back to default:', err);
    
    // Configure fallback font mapping even if local font loading fails
    pdfMake.fonts = {
      ...pdfMake.fonts,
      NotoSansArabic: {
        normal: 'https://fonts.gstatic.com/s/notosansarabic/v26/JRNVWXIvG7Ba1Lu6ilKuHwmayNqpGTTjYDIzcdSc5qU.woff2',
        bold: 'https://fonts.gstatic.com/s/notosansarabic/v26/JRNVWXIvG7Ba1Lu6ilKuHwaGQp8LiDpOaQq4poqJ9XY.woff2',
      }
    };
  }
}

function bufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}
