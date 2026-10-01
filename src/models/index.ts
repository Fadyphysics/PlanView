export interface DayPlan {
  day: string; // 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday'
  lessonTopic: string;
  learningObjectives: string;
  activities: string;
  activityTools: string;
  homeworkAssessment: string;
}

export interface WeeklyActivities {
  hasSpecialActivity: boolean;
  description?: string;
  materialsNeeded?: string;
  teacherNotes?: string;
}

export interface WeeklyPlan {
  id: number;
  teacherId: number;
  academicYear: string;
  weekNumber: number;
  startDate: Date;
  endDate: Date;
  teacher: string;
  subject: string;
  grade: string;
  class: string;
  days: DayPlan[];
  weeklyActivities: WeeklyActivities;
  createdAt: Date;
  updatedAt: Date;
}

export interface TeacherProfile {
  id: number;
  name: string;
  email?: string;
  subject: string;
  grade: string;
  class: string;
  school: string;
  branch: string;
  classes?: string[]; // Array of class names the teacher teaches
  currentClass?: string; // Currently selected class for planning
  createdAt: Date;
  updatedAt: Date;
}

export interface AppSettings {
  language: 'en' | 'ar';
  theme: 'light' | 'dark';
  academicYear: string;
}