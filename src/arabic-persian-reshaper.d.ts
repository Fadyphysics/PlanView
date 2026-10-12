declare module 'arabic-persian-reshaper' {
  const reshaper: {
    arabicShape: (text: string) => string;
  };
  export default reshaper;
}