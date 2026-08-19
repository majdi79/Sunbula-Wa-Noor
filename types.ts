
export enum Gender {
  MALE = 'ذكر',
  FEMALE = 'أنثى'
}

export interface LessonRecord {
  id: string;
  date: string;
  achievement: string;
  duration?: number; // Duration in minutes
  attendanceStatus?: 'present' | 'absent' | 'excused';
  absenceNote?: string;
}

export interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  note?: string;
  sessionsCovered?: number; // Number of sessions this payment paid for
}

export interface Student {
  id: string;
  name: string;
  gender: Gender;
  avatar?: string; // Icon identifier
  phoneNumber?: string; // WhatsApp number
  lastLessonDate: string;
  achievement: string;
  nextLessonDate: string;
  nextLessonTime?: string; // Time of the session
  sessionCount: number; // 0 to 8 (current cycle - sessions needing payment)
  prepaidSessions: number; // Credit sessions already paid for
  totalSessionsCompleted: number;
  joinDate: string;
  lessons: LessonRecord[]; // History of all sessions
  payments: PaymentRecord[]; // Financial history
}

export interface Stats {
  totalStudents: number;
  upcomingLessons: number;
  paymentDue: number;
  totalRevenue: number;
}
