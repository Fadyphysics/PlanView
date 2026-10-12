// @ts-ignore
import reshaper from 'arabic-persian-reshaper';

export function shapeArabic(text: string): string {
  if (!text) return '';
  
  // Check if string contains Arabic characters
  const hasArabic = /[\u0600-\u06FF\u0750-\u077F]/.test(text);
  if (!hasArabic) return text;

  // Convert Arabic letters into connected visual form and reverse for RTL flow
  const reshaped = reshaper.arabicShape(text);
  return reshaped.split('').reverse().join('');
}