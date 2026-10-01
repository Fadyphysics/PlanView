import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      // Navigation and general
      'welcome': 'Welcome back teacher',
      'continueThisWeek': 'Continue This Week',
      'startNewPlan': 'Start New Weekly Plan',
      'previousPlans': 'Previous Plans',
      'profile': 'Profile',
      'language': 'Language',
      'english': 'English',
      'arabic': 'العربية',
      
      // Class management
      'manageClasses': 'Manage Classes',
      'addClassOrEditProfile': 'Add Class or Edit Profile',
      'yourClasses': 'Your Classes',
      'continuePlan': 'Continue',
      'createNewPlan': 'Create New',
      'createNewPlanFor': 'Create new plan for {{className}}',
      
      // Form labels
      'weeklyLessonPlan': 'Weekly Lesson Plan',
      'lessonTopic': 'Lesson / Topic',
      'learningObjectives': 'Learning Objectives',
      'activitiesClasswork': 'Activities / Classwork',
      'activityTools': 'Activity Tools',
      'homeworkAssessment': 'Homework / Assessment',
      'weeklyActivities': 'Weekly Activities',
      'materialsResources': 'Materials / Resources Needed',
      'teacherNotes': 'Teacher\'s Notes',
      'teacher': 'Teacher',
      'subject': 'Subject',
      'grade': 'Grade',
      'weekFromTo': 'Week: From {{startDate}} to {{endDate}}',
      
      // Buttons and actions
      'generatePdf': 'Generate PDF',
      'share': 'Share',
      'save': 'Save',
      'cancel': 'Cancel',
      'next': 'Next',
      'back': 'Back',
      'edit': 'Edit',
      'review': 'Review',
      'download': 'Download',
      'previousDay': 'Previous Day',
      'nextDay': 'Next Day',
      'saveDraft': 'Save Draft',
      'startEditingFirstDay': 'Start Editing First Day',
      'selectDayToEdit': 'Select a Day to Edit',
      
      // Saving state
      'saving': 'Saving',
      
      // Validation and messages
      'atLeastOneActivity': 'Please add at least one activity to this week\'s plan.',
      'goToActivities': 'Go to Activities',
      'weeklyPlanComplete': 'Weekly plan complete',
      'oneActivityRequired': 'One activity is still required',
      
      // Days of the week
      'sunday': 'Sunday',
      'monday': 'Monday',
      'tuesday': 'Tuesday',
      'wednesday': 'Wednesday',
      'thursday': 'Thursday',
      
      // Special activities section
      'specialActivitiesQuestion': 'Are there any special activities this week?',
      'yes': 'Yes',
      'no': 'No',
      'ifYesDescribe': 'If yes, please describe:',
      
      // PDF sharing
      'shareClassDojoPdf': 'Share ClassDojo PDF',
      'shareCoordinatorPdf': 'Share Coordinator PDF',
      
      // Profile setup
      'teacherProfileSetup': 'Teacher Profile Setup',
      'enterYourDetails': 'Please enter your details',
      'schoolBranch': 'School/Branch',
      'className': 'Class',
      
      // Review screen
      'reviewScreenTitle': 'Review Your Weekly Plan',
      'weekNumber': 'Week {{weekNumber}}',
      'dateRange': '{{startDate}} – {{endDate}}',
      
      // Signatures
      'signatureLine': "Teacher's Signature: ______________________",
      'dateLine': 'Date: ______________________',
    }
  },
  ar: {
    translation: {
      // Navigation and general
      'welcome': 'مرحبا بعودتك، يا معلم',
      'continueThisWeek': 'متابعة هذا الأسبوع',
      'startNewPlan': 'بدء خطة أسبوعية جديدة',
      'previousPlans': 'الخطط السابقة',
      'profile': 'الملف الشخصي',
      'language': 'اللغة',
      'english': 'English',
      'arabic': 'العربية',
      
      // Class management
      'manageClasses': 'إدارة الفصول',
      'addClassOrEditProfile': 'إضافة فصل أو تعديل الملف الشخصي',
      'yourClasses': 'فصولك',
      'continuePlan': 'متابعة',
      'createNewPlan': 'إنشاء جديد',
      'createNewPlanFor': 'إنشاء خطة جديدة لـ {{className}}',
      
      // Form labels
      'weeklyLessonPlan': 'خطة الدرس الأسبوعية',
      'lessonTopic': 'الدرس / الموضوع',
      'learningObjectives': 'أهداف التعلم',
      'activitiesClasswork': 'الأنشطة / العمل الصفي',
      'activityTools': 'أدوات النشاط',
      'homeworkAssessment': 'الواجب المنزلي / التقييم',
      'weeklyActivities': 'الأنشطة الأسبوعية',
      'materialsResources': 'المواد / الموارد المطلوبة',
      'teacherNotes': 'ملاحظات المعلم',
      'teacher': 'المعلم',
      'subject': 'المادة',
      'grade': 'الصف',
      'weekFromTo': 'الأسبوع: من {{startDate}} إلى {{endDate}}',
      
      // Buttons and actions
      'generatePdf': 'إنشاء PDF',
      'share': 'مشاركة',
      'save': 'حفظ',
      'cancel': 'إلغاء',
      'next': 'التالي',
      'back': 'رجوع',
      'edit': 'تعديل',
      'review': 'مراجعة',
      'download': 'تحميل',
      'previousDay': 'اليوم السابق',
      'nextDay': 'اليوم التالي',
      'saveDraft': 'حفظ المسودة',
      'startEditingFirstDay': 'بدء تعديل اليوم الأول',
      'selectDayToEdit': 'حدد يوماً للتعديل',
      
      // Saving state
      'saving': 'حفظ',
      
      // Validation and messages
      'atLeastOneActivity': 'الرجاء إضافة نشاط واحد على الأقل لخطة هذا الأسبوع.',
      'goToActivities': 'الذهاب إلى الأنشطة',
      'weeklyPlanComplete': 'تم إكمال الخطة الأسبوعية',
      'oneActivityRequired': 'لا يزال هناك نشاط مطلوب',
      
      // Days of the week
      'sunday': 'الأحد',
      'monday': 'الاثنين',
      'tuesday': 'الثلاثاء',
      'wednesday': 'الأربعاء',
      'thursday': 'الخميس',
      
      // Special activities section
      'specialActivitiesQuestion': 'هل توجد أنشطة خاصة هذا الأسبوع؟',
      'yes': 'نعم',
      'no': 'لا',
      'ifYesDescribe': 'في حال الإجابة بنعم، يرجى الوصف:',
      
      // PDF sharing
      'shareClassDojoPdf': 'مشاركة PDF كلاس دوجو',
      'shareCoordinatorPdf': 'مشاركة PDF المنسق الأكاديمي',
      
      // Profile setup
      'teacherProfileSetup': 'إعداد ملف المعلم',
      'enterYourDetails': 'الرجاء إدخال تفاصيلك',
      'schoolBranch': 'المدرسة / الفرع',
      'className': 'الفصل',
      
      // Review screen
      'reviewScreenTitle': 'مراجعة خطتك الأسبوعية',
      'weekNumber': 'الأسبوع {{weekNumber}}',
      'dateRange': '{{startDate}} – {{endDate}}',
      
      // Signatures
      'signatureLine': "توقيع المعلم: ______________________",
      'dateLine': 'التاريخ: ______________________',
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;