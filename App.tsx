
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  PlusCircle, 
  Users, 
  Calendar, 
  CreditCard, 
  BookOpen, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  MessageSquare,
  AlertCircle,
  Search,
  ChevronLeft,
  GraduationCap,
  History,
  X,
  Send,
  AlertTriangle,
  Clock,
  Sun,
  Moon,
  Monitor,
  Timer,
  Zap,
  User,
  Star,
  Heart,
  Baby,
  Smile,
  Target,
  Rocket,
  Palette,
  Crown,
  FileText,
  Phone,
  Share2,
  CalendarDays,
  CheckCircle,
  Save,
  Type,
  Award,
  BarChart3,
  ClipboardCheck,
  Download,
  Image as ImageIcon,
  Sparkles,
  Leaf,
  Sprout,
  Filter,
  ArrowDownAZ,
  ArrowUpNarrowWide,
  Settings2,
  CalendarOff,
  LayoutList,
  TimerOff,
  Quote,
  Medal,
  Stamp,
  RectangleHorizontal,
  RectangleVertical,
  Wallet,
  Receipt,
  TrendingUp,
  ReceiptText,
  Coins,
  ShieldCheck,
  BarChart,
  PieChart,
  Vault,
  ArrowLeftRight
} from 'lucide-react';
import { Student, Gender, LessonRecord, PaymentRecord } from './types';
import { generateFeedback } from './geminiService';
import html2canvas from 'html2canvas';

type Theme = 'light' | 'dark' | 'system';
type LogoStyle = 'growth' | 'radiance' | 'minimal';
type SortOption = 'alphabetical' | 'nextLesson' | 'gender' | 'payment';
type ReportRange = 'cycle' | 'full';
type Orientation = 'landscape' | 'portrait';

const LOGO_PRESETS = {
  growth: {
    name: 'نماء الهداية',
    icon: Sprout,
    color: 'emerald',
    gradient: 'from-emerald-600 to-teal-500',
    bg: 'bg-emerald-500',
    description: 'يعبر عن السنبلة والنمو'
  },
  radiance: {
    name: 'إشراق البيان',
    icon: Sparkles,
    color: 'amber',
    gradient: 'from-amber-500 to-orange-400',
    bg: 'bg-amber-500',
    description: 'يعبر عن النور والضياء'
  },
  minimal: {
    name: 'المنارة القرآنية',
    icon: BookOpen,
    color: 'blue',
    gradient: 'from-blue-600 to-indigo-500',
    bg: 'bg-blue-600',
    description: 'يعبر عن العلم والقرآن'
  }
};

const CERT_COLORS = [
  { id: 'emerald', name: 'أخضر البرنامج', primary: '#10b981', secondary: 'rgba(16, 185, 129, 0.2)', text: '#064e3b' },
  { id: 'amber', name: 'ذهبي كلاسيك', primary: '#b45309', secondary: 'rgba(180, 83, 9, 0.2)', text: '#78350f' },
  { id: 'blue', name: 'أزرق ملكي', primary: '#1d4ed8', secondary: 'rgba(29, 78, 216, 0.2)', text: '#1e3a8a' },
  { id: 'purple', name: 'بنفسجي فاخر', primary: '#7e22ce', secondary: 'rgba(126, 34, 206, 0.2)', text: '#4c1d95' },
];

const REPORT_PHRASE_TEMPLATES = [
  "بارك الله فيك ونفع بك الإسلام والمسلمين، وجعل القرآن الكريم ربيع قلبك ونور صدرك وجلاء حزنك.",
  "هنيئاً لك هذا الإنجاز المبارك، استمر في الصعود في درجات الجنة بحفظك وتلاوتك لكتاب الله العظيم.",
  "فخورون بك يا بطل القرآن، جعل الله كل حرف حفظته في ميزان حسناتك وتاجاً من نور لوالديك.",
  "ما شاء الله على الهمة العالية، زادك الله علماً وفهماً ونوراً ببركة القرآن الكريم في الدنيا والآخرة."
];

const ProgramLogo = ({ style, size = 42, className = "" }: { style: LogoStyle, size?: number, className?: string }) => {
  const config = LOGO_PRESETS[style];
  const Icon = config.icon;
  
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <div className={`p-4 rounded-[2rem] shadow-2xl shadow-${config.color}-500/30 ring-4 ring-${config.color}-500/10 bg-gradient-to-br ${config.gradient} transition-all hover:scale-110 hover:rotate-3`}>
        <Icon size={size} className="text-white" />
        <div className="absolute -top-1 -right-1">
          <Sparkles size={16} className="text-white animate-pulse" />
        </div>
      </div>
    </div>
  );
};

const AVATAR_OPTIONS = [
  { id: 'User', icon: User },
  { id: 'GraduationCap', icon: GraduationCap },
  { id: 'Star', icon: Star },
  { id: 'Heart', icon: Heart },
  { id: 'Baby', icon: Baby },
  { id: 'Smile', icon: Smile },
  { id: 'Target', icon: Target },
  { id: 'Rocket', icon: Rocket },
  { id: 'Palette', icon: Palette },
  { id: 'Crown', icon: Crown },
];

const StudentAvatar = ({ avatarId, gender, className }: { avatarId?: string, gender: Gender, className?: string }) => {
  const Icon = AVATAR_OPTIONS.find(a => a.id === avatarId)?.icon || User;
  const baseClass = className || `w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold shadow-inner ${gender === Gender.MALE ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'bg-pink-50 dark:bg-pink-900/20 text-pink-600'}`;
  return (
    <div className={baseClass}>
      <Icon size={24} />
    </div>
  );
};

const App: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('iqra-theme') as Theme) || 'system');
  const [logoStyle, setLogoStyle] = useState<LogoStyle>(() => (localStorage.getItem('iqra-logo-style') as LogoStyle) || 'growth');
  const [sortBy, setSortBy] = useState<SortOption>('alphabetical');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<string | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState<string | null>(null);
  const [isFinanceOpen, setIsFinanceOpen] = useState<string | null>(null);
  const [isFinancialReportOpen, setIsFinancialReportOpen] = useState<string | null>(null);
  const [isMonthlyFinanceOpen, setIsMonthlyFinanceOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState<string | null>(null);
  const [isCertificateOpen, setIsCertificateOpen] = useState<string | null>(null);
  const [isAddLessonOpen, setIsAddLessonOpen] = useState<string | null>(null);
  const [isScheduleQuickOpen, setIsScheduleQuickOpen] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<string | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [aiFeedback, setAiFeedback] = useState<{ [key: string]: string }>({});
  const [isLoadingFeedback, setIsLoadingFeedback] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  
  // Custom Period Report State
  const [reportStartDate, setReportStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [reportEndDate, setReportEndDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Report & Certificate Customization States
  const [reportRange, setReportRange] = useState<ReportRange>('cycle');
  const [showDatesInReport, setShowDatesInReport] = useState(true);
  const [showTotalTimeInReport, setShowTotalTimeInReport] = useState(true);
  const [editableReportPhrase, setEditableReportPhrase] = useState(REPORT_PHRASE_TEMPLATES[0]);
  
  // Certificate specific states
  const [certificateTitle, setCertificateTitle] = useState('شهادة إتمام مـنهـج');
  const [certificateMilestone, setCertificateMilestone] = useState('جزء عمَّ كاملاً بالتجويد');
  const [certificateTeacherName, setCertificateTeacherName] = useState('إدارة سنبلة ونور');
  const [certColorId, setCertColorId] = useState('emerald');
  const [certOrientation, setCertOrientation] = useState<Orientation>('landscape');

  // Finance States
  const [paymentAmount, setPaymentAmount] = useState('10');
  const [paymentNote, setPaymentNote] = useState('');
  const [paymentSessions, setPaymentSessions] = useState('8');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);

  const reportRef = useRef<HTMLDivElement>(null);
  const certificateRef = useRef<HTMLDivElement>(null);
  const financeReportRef = useRef<HTMLDivElement>(null);
  const monthlyFinanceRef = useRef<HTMLDivElement>(null);

  const selectedCertColor = useMemo(() => 
    CERT_COLORS.find(c => c.id === certColorId) || CERT_COLORS[0]
  , [certColorId]);

  useEffect(() => {
    localStorage.setItem('iqra-logo-style', logoStyle);
  }, [logoStyle]);

  // Invoice States
  const [invoiceAmount, setInvoiceAmount] = useState('10');
  const [invoiceStartDate, setInvoiceStartDate] = useState('');
  const [invoiceEndDate, setInvoiceEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTemplate, setSelectedTemplate] = useState('official');
  const [editableMessage, setEditableMessage] = useState('');

  // Lesson Editing States
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [tempLessonAchievement, setTempLessonAchievement] = useState('');
  const [tempLessonDuration, setTempLessonDuration] = useState<string>('');
  const [tempLessonDate, setTempLessonDate] = useState<string>('');

  // Form States
  const [formData, setFormData] = useState({
    name: '',
    gender: Gender.MALE,
    avatar: 'User',
    phoneNumber: '',
    lastLessonDate: new Date().toISOString().split('T')[0],
    achievement: '',
    nextLessonDate: '',
    nextLessonTime: '16:00',
    sessionCount: 0,
    prepaidSessions: 0
  });

  const [lessonAchievement, setLessonAchievement] = useState('');
  const [lessonDuration, setLessonDuration] = useState<string>('20');
  const [lessonAttendanceStatus, setLessonAttendanceStatus] = useState<'present' | 'absent' | 'excused'>('present');
  const [lessonAbsenceNote, setLessonAbsenceNote] = useState('');

  // Theme Handling
  useEffect(() => {
    const root = window.document.documentElement;
    localStorage.setItem('iqra-theme', theme);

    const applyTheme = (currentTheme: Theme) => {
      if (currentTheme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        root.classList.toggle('dark', systemTheme === 'dark');
      } else {
        root.classList.toggle('dark', currentTheme === 'dark');
      }
    };

    applyTheme(theme);
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => theme === 'system' && applyTheme('system');
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  useEffect(() => {
    const saved = localStorage.getItem('iqra-students-v6');
    if (saved) setStudents(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('iqra-students-v6', JSON.stringify(students));
  }, [students]);

  const constructMessageText = (student: Student, amount: string, start: string, end: string, template: string) => {
    const dateRange = start && end 
      ? `الفترة من: ${start} إلى: ${end}` 
      : `تاريخ الفاتورة: ${new Date().toLocaleDateString('ar-SA')}`;

    const cycleLessons = student.lessons.slice(0, student.sessionCount);
    let achievementsText = "";
    cycleLessons.forEach((l, i) => {
      achievementsText += `${i + 1}. [${l.date}]: ${l.achievement}\n`;
    });

    if (template === 'official') {
      return `السلام عليكم ورحمة الله وبركاته\n\nنود إفادتكم بصدور فاتورة الرسوم الدراسية لبرنامج (سنبلة ونور)\n\n*بيانات الطالب:*\nالاسم: ${student.name}\n${dateRange}\nعدد الحصص: ${student.sessionCount}\n\n*تفاصيل الإنجازات لهذه الفترة:*\n${achievementsText}\n*المبلغ المستحق:* ${amount} دينار بحريني\n\nبارك الله فيكم وفي جهودكم.`;
    } else if (template === 'friendly') {
      return `حياكم الله وبياكم أهل القرآن الكريم 🌸\n\nنسعد بإبلاغكم بتمام الفترة الحالية لابننا المتميز/ ابنتنا المتميزة *${student.name}* في برنامج (سنبلة ونور).\n\nلقد سعدنا جداً بما حققه من إنجازات خلال هذه الفترة:\n${achievementsText}\nنرسل لكم فاتورة الرسوم الدراسية بقيمة: *${amount} دينار بحريني*.\n\nبارك الله في خطاكم ووفق قرة أعينكم لكل خير. ✨`;
    } else {
      return `*فاتورة برنامج سنبلة ونور*\n\nالطالب: ${student.name}\n${dateRange}\nالرسوم: ${amount} د.ب\n\n*الإنجازات:*\n${achievementsText}`;
    }
  };

  useEffect(() => {
    const invoiceStudent = students.find(s => s.id === isInvoiceOpen);
    if (invoiceStudent) {
      setEditableMessage(constructMessageText(invoiceStudent, invoiceAmount, invoiceStartDate, invoiceEndDate, selectedTemplate));
    }
  }, [isInvoiceOpen, invoiceAmount, invoiceStartDate, invoiceEndDate, selectedTemplate, students]);

  const handleAddOrUpdateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStudent) {
      setStudents(prev => prev.map(s => s.id === editingStudent.id ? { ...s, ...formData } : s));
      setEditingStudent(null);
    } else {
      const newStudent: Student = {
        id: crypto.randomUUID(),
        ...formData,
        totalSessionsCompleted: 0,
        joinDate: new Date().toISOString().split('T')[0],
        lessons: formData.achievement ? [{
          id: crypto.randomUUID(),
          date: formData.lastLessonDate,
          achievement: formData.achievement
        }] : [],
        payments: []
      };
      setStudents(prev => [...prev, newStudent]);
    }
    resetForm();
    setIsModalOpen(false);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      gender: Gender.MALE,
      avatar: 'User',
      phoneNumber: '',
      lastLessonDate: new Date().toISOString().split('T')[0],
      achievement: '',
      nextLessonDate: '',
      nextLessonTime: '16:00',
      sessionCount: 0,
      prepaidSessions: 0
    });
  };

  const confirmDelete = () => {
    if (deleteConfirmText === 'DELETE' && isDeleteModalOpen) {
      setStudents(prev => prev.filter(s => s.id !== isDeleteModalOpen));
      setIsDeleteModalOpen(null);
      setDeleteConfirmText('');
    }
  };

  const editStudent = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      gender: student.gender,
      avatar: student.avatar || 'User',
      phoneNumber: student.phoneNumber || '',
      lastLessonDate: student.lastLessonDate,
      achievement: student.achievement,
      nextLessonDate: student.nextLessonDate,
      nextLessonTime: student.nextLessonTime || '16:00',
      sessionCount: student.sessionCount,
      prepaidSessions: student.prepaidSessions || 0
    });
    setIsModalOpen(true);
  };

  const handleQuickSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isScheduleQuickOpen) return;
    setStudents(prev => prev.map(s => 
      s.id === isScheduleQuickOpen 
        ? { ...s, nextLessonDate: formData.nextLessonDate, nextLessonTime: formData.nextLessonTime } 
        : s
    ));
    setIsScheduleQuickOpen(null);
  };

  const handleRegisterLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAddLessonOpen) return;
    if (lessonAttendanceStatus === 'present' && !lessonAchievement) return;

    setStudents(prev => prev.map(s => {
      if (s.id === isAddLessonOpen) {
        const today = new Date().toISOString().split('T')[0];
        const newLesson: LessonRecord = {
          id: crypto.randomUUID(),
          date: today,
          achievement: lessonAttendanceStatus === 'present' ? lessonAchievement : 'غائب',
          duration: lessonAttendanceStatus === 'present' && lessonDuration ? parseInt(lessonDuration) : 0,
          attendanceStatus: lessonAttendanceStatus,
          absenceNote: lessonAbsenceNote
        };

        let newPrepaid = s.prepaidSessions || 0;
        let newSessionCount = s.sessionCount;

        // Count as a session only if present or unexcused absent.
        if (lessonAttendanceStatus !== 'excused') {
          if (newPrepaid > 0) {
            newPrepaid -= 1;
          } else {
            newSessionCount += 1;
          }
        }

        return { 
          ...s, 
          sessionCount: newSessionCount,
          prepaidSessions: newPrepaid,
          totalSessionsCompleted: lessonAttendanceStatus === 'present' ? s.totalSessionsCompleted + 1 : s.totalSessionsCompleted,
          lastLessonDate: today,
          achievement: lessonAttendanceStatus === 'present' ? lessonAchievement : s.achievement,
          lessons: [newLesson, ...s.lessons]
        };
      }
      return s;
    }));
    setLessonAchievement('');
    setLessonDuration('20');
    setLessonAttendanceStatus('present');
    setLessonAbsenceNote('');
    setIsAddLessonOpen(null);
  };

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFinanceOpen || !paymentAmount) return;

    const numSessions = parseInt(paymentSessions) || 8;
    const newPayment: PaymentRecord = {
      id: crypto.randomUUID(),
      date: paymentDate,
      amount: parseFloat(paymentAmount),
      note: paymentNote,
      sessionsCovered: numSessions
    };

    setStudents(prev => prev.map(s => {
      if (s.id === isFinanceOpen) {
        let remainingDue = s.sessionCount;
        let newPrepaid = (s.prepaidSessions || 0);
        let newSessionCount = remainingDue;

        if (numSessions >= remainingDue) {
          newPrepaid += (numSessions - remainingDue);
          newSessionCount = 0;
        } else {
          newSessionCount = remainingDue - numSessions;
        }

        return { 
          ...s, 
          payments: [newPayment, ...(s.payments || [])], 
          sessionCount: newSessionCount,
          prepaidSessions: newPrepaid
        };
      }
      return s;
    }));
    setPaymentAmount('10');
    setPaymentNote('');
    setPaymentSessions('8');
    setIsFinanceOpen(null);
  };

  const deletePayment = (studentId: string, paymentId: string) => {
    setStudents(prev => prev.map(s => 
      s.id === studentId 
        ? { ...s, payments: (s.payments || []).filter(p => p.id !== paymentId) } 
        : s
    ));
  };

  const saveEditedLesson = (studentId: string, lessonId: string) => {
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        const updatedLessons = s.lessons.map(l => 
          l.id === lessonId 
            ? { ...l, achievement: lessonAttendanceStatus === 'present' ? tempLessonAchievement : 'غائب', duration: lessonAttendanceStatus === 'present' ? parseInt(tempLessonDuration) || 20 : 0, date: tempLessonDate, attendanceStatus: lessonAttendanceStatus, absenceNote: lessonAbsenceNote } 
            : l
        );
        const isMostRecent = s.lessons.length > 0 && s.lessons[0].id === lessonId;
        return {
          ...s,
          lessons: updatedLessons,
          achievement: isMostRecent ? tempLessonAchievement : s.achievement,
          lastLessonDate: isMostRecent ? tempLessonDate : s.lastLessonDate
        };
      }
      return s;
    }));
    setEditingLessonId(null);
  };

  const markPaymentAsDone = (id: string) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, sessionCount: 0 } : s));
    setIsInvoiceOpen(null);
  };

  const handleGenerateFeedback = async (student: Student) => {
    setIsLoadingFeedback(student.id);
    const feedback = await generateFeedback(student.name, student.achievement);
    setAiFeedback(prev => ({ ...prev, [student.id]: feedback }));
    setIsLoadingFeedback(null);
  };

  const sendWhatsAppInvoice = (student: Student) => {
    const encodedMessage = encodeURIComponent(editableMessage);
    const phone = student.phoneNumber?.replace(/\D/g, '');
    window.open(`https://wa.me/${phone ? phone : ''}?text=${encodedMessage}`, '_blank');
  };

  const sendWhatsAppReport = (student: Student, reportText: string) => {
    const encodedMessage = encodeURIComponent(reportText);
    const phone = student.phoneNumber?.replace(/\D/g, '');
    window.open(`https://wa.me/${phone ? phone : ''}?text=${encodedMessage}`, '_blank');
  };

  const openInvoice = (student: Student) => {
    setInvoiceAmount('10');
    const defaultStart = student.lessons.length > 0 
      ? student.lessons[Math.min(student.lessons.length - 1, Math.max(0, student.sessionCount - 1))].date 
      : new Date().toISOString().split('T')[0];
    
    setInvoiceStartDate(defaultStart);
    setInvoiceEndDate(new Date().toISOString().split('T')[0]);
    setSelectedTemplate('official');
    setIsInvoiceOpen(student.id);
  };

  const openFinance = (student: Student) => {
    setPaymentAmount('10');
    setPaymentNote('');
    setPaymentSessions('8');
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setIsFinanceOpen(student.id);
  };

  const openReport = (student: Student) => {
    setReportRange('cycle');
    setShowDatesInReport(true);
    setShowTotalTimeInReport(true);
    setEditableReportPhrase(REPORT_PHRASE_TEMPLATES[0]);
    setIsReportOpen(student.id);
  };

  const openCertificate = (student: Student) => {
    setCertificateTitle('شهادة إتمام مـنهـج');
    setCertificateMilestone('جزء عمَّ كاملاً بالتجويد');
    setCertificateTeacherName(localStorage.getItem('iqra-teacher-name') || 'إدارة سنبلة ونور');
    setCertOrientation('landscape');
    setIsCertificateOpen(student.id);
  };

  const openQuickSchedule = (student: Student) => {
    setFormData({
      ...formData,
      nextLessonDate: student.nextLessonDate || '',
      nextLessonTime: student.nextLessonTime || '16:00'
    });
    setIsScheduleQuickOpen(student.id);
  };

  const downloadCapture = async (ref: React.RefObject<HTMLDivElement>, filename: string, orientation: Orientation = 'landscape') => {
    if (!ref.current) return;
    setIsCapturing(true);
    try {
      const originalWidth = ref.current.style.width;
      const originalHeight = ref.current.style.height;
      
      const targetWidth = orientation === 'landscape' ? '842px' : '595px';
      const targetHeight = orientation === 'landscape' ? '595px' : '842px';
      
      ref.current.style.width = targetWidth;
      ref.current.style.height = targetHeight;
      
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const canvas = await html2canvas(ref.current, {
        scale: 2.5, 
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      });
      
      ref.current.style.width = originalWidth;
      ref.current.style.height = originalHeight;
      
      const dataUrl = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = `${filename}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Capture error:', error);
      alert('حدث خطأ أثناء إنشاء الصورة.');
    } finally {
      setIsCapturing(false);
    }
  };

  const processedStudents = useMemo(() => {
    let result = students.filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    switch (sortBy) {
      case 'alphabetical':
        result.sort((a, b) => a.name.localeCompare(b.name, 'ar'));
        break;
      case 'nextLesson':
        result.sort((a, b) => {
          if (!a.nextLessonDate) return 1;
          if (!b.nextLessonDate) return -1;
          const dateA = new Date(`${a.nextLessonDate}T${a.nextLessonTime || '00:00'}`);
          const dateB = new Date(`${b.nextLessonDate}T${b.nextLessonTime || '00:00'}`);
          return dateA.getTime() - dateB.getTime();
        });
        break;
      case 'gender':
        result.sort((a, b) => a.gender.localeCompare(b.gender, 'ar'));
        break;
      case 'payment':
        result.sort((a, b) => {
          const aNeeds = a.sessionCount >= 8 ? 0 : 1;
          const bNeeds = b.sessionCount >= 8 ? 0 : 1;
          if (aNeeds !== bNeeds) return aNeeds - bNeeds;
          return b.sessionCount - a.sessionCount;
        });
        break;
    }
    return result;
  }, [students, searchTerm, sortBy]);

  const stats = useMemo(() => {
    return {
      total: students.length,
      upcoming: students.filter(s => s.nextLessonDate === new Date().toISOString().split('T')[0]).length,
      paymentNeeded: students.filter(s => s.sessionCount >= 8).length
    };
  }, [students]);

  // Aggregate custom period payments across all students
  const customPeriodPaymentsData = useMemo(() => {
    const allPayments: Array<PaymentRecord & { studentName: string }> = [];
    students.forEach(s => {
      (s.payments || []).forEach(p => {
        if (p.date >= reportStartDate && p.date <= reportEndDate) {
          allPayments.push({ ...p, studentName: s.name });
        }
      });
    });
    allPayments.sort((a, b) => b.date.localeCompare(a.date));
    const totalAmount = allPayments.reduce((acc, p) => acc + p.amount, 0);
    return {
      payments: allPayments,
      totalAmount,
      count: allPayments.length
    };
  }, [students, reportStartDate, reportEndDate]);

  const historyStudent = useMemo(() => students.find(s => s.id === isHistoryOpen), [students, isHistoryOpen]);
  const invoiceStudent = useMemo(() => students.find(s => s.id === isInvoiceOpen), [students, isInvoiceOpen]);
  const financeStudent = useMemo(() => students.find(s => s.id === isFinanceOpen), [students, isFinanceOpen]);
  const financialReportStudent = useMemo(() => students.find(s => s.id === isFinancialReportOpen), [students, isFinancialReportOpen]);
  const reportStudent = useMemo(() => students.find(s => s.id === isReportOpen), [students, isReportOpen]);
  const certStudent = useMemo(() => students.find(s => s.id === isCertificateOpen), [students, isCertificateOpen]);
  const scheduleQuickStudent = useMemo(() => students.find(s => s.id === isScheduleQuickOpen), [students, isScheduleQuickOpen]);

  const generateBriefReport = (student: Student) => {
    const lessonsToInclude = reportRange === 'cycle' 
      ? student.lessons.slice(0, student.sessionCount)
      : student.lessons;

    const totalDuration = lessonsToInclude.reduce((acc, l) => acc + (l.duration || 0), 0);
    const startDate = lessonsToInclude.length > 0 ? lessonsToInclude[lessonsToInclude.length - 1].date : '-';
    const endDate = lessonsToInclude.length > 0 ? lessonsToInclude[0].date : '-';
    
    let achievementsList = "";
    lessonsToInclude.forEach((l, i) => {
      const datePart = showDatesInReport ? ` [${l.date}]` : "";
      achievementsList += `🔹 ${l.achievement}${datePart}\n`;
    });

    const periodLabel = reportRange === 'cycle' ? `فترة الـ ${student.sessionCount} حصص` : "السجل الكامل";

    return `*⭐ تقرير إنجاز ببرنامج سنبلة ونور ⭐*\n\n*الاسم:* ${student.name}\n*النطاق:* ${periodLabel}\n${showDatesInReport ? `*الفترة:* من ${startDate} إلى ${endDate}\n` : ''}*عدد الحصص:* ${lessonsToInclude.length}\n${showTotalTimeInReport ? `*إجمالي الوقت:* ${totalDuration} دقيقة\n` : ''}\n*📋 أبرز ما تم إنجازه:*\n${achievementsList}\n\n${editableReportPhrase}\n\nبارك الله في جهودكم. ✨`;
  };

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--x', `${x}px`);
    card.style.setProperty('--y', `${y}px`);
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 20;
    const rotateY = (centerX - x) / 20;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
  };

  const handleCardMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)`;
  };

  const ThemeToggle = () => (
    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
      {[
        { id: 'light', icon: Sun },
        { id: 'system', icon: Monitor },
        { id: 'dark', icon: Moon }
      ].map((item) => {
        const Icon = item.icon;
        const isActive = theme === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setTheme(item.id as Theme)}
            className={`p-1.5 rounded-lg transition-all ${
              isActive 
                ? 'bg-white dark:bg-slate-600 text-emerald-600 dark:text-emerald-300 shadow-sm' 
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            <Icon size={18} />
          </button>
        );
      })}
    </div>
  );

  const LogoToggle = () => (
    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
      {(Object.keys(LOGO_PRESETS) as LogoStyle[]).map((style) => {
        const config = LOGO_PRESETS[style];
        const Icon = config.icon;
        const isActive = logoStyle === style;
        return (
          <button
            key={style}
            onClick={() => setLogoStyle(style)}
            title={config.name}
            className={`p-1.5 rounded-lg transition-all ${
              isActive 
                ? `bg-white dark:bg-slate-600 text-${config.color}-600 dark:text-${config.color}-400 shadow-sm` 
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
            }`}
          >
            <Icon size={18} />
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen pb-20 bg-slate-50 dark:bg-[#0b1120] transition-colors duration-300 selection:bg-emerald-500 selection:text-white font-tajawal">
      <header className="bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-32 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <ProgramLogo style={logoStyle} />
            <div className="flex flex-col">
              <div className="relative group">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-black bg-gradient-to-br from-amber-600 via-amber-400 to-amber-700 bg-clip-text text-transparent relative z-10"
                    style={{
                      filter: 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.4))'
                    }}>
                  سنبلة ونور
                </h1>
              </div>
              <p className="text-sm sm:text-base text-emerald-600 dark:text-emerald-400 font-bold mt-1 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full bg-${LOGO_PRESETS[logoStyle].color}-500 animate-ping`}></span>
                لإدارة حلقات القرآن الكريم - اقرأ وارتق
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">تغيير الشعار:</span>
              <LogoToggle />
            </div>
            <ThemeToggle />
            <button 
              onClick={() => { resetForm(); setEditingStudent(null); setIsModalOpen(true); }}
              className={`bg-${LOGO_PRESETS[logoStyle].color}-600 hover:brightness-110 text-white px-6 py-4 rounded-3xl font-black shadow-xl transition-all flex items-center gap-3 text-sm active:scale-95 border-b-4 border-black/20 active:border-b-0 active:translate-y-1`}
            >
              <PlusCircle size={24} />
              <span className="hidden sm:inline">إضافة طالب</span>
            </button>
          </div>
        </div>
      </header>

      <section className="bg-slate-50 dark:bg-slate-950/50 py-10 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            { label: 'إجمالي الطلاب', val: stats.total, icon: Users, color: 'blue' },
            { label: 'دروس اليوم', val: stats.upcoming, icon: Calendar, color: 'amber' },
            { 
              label: 'بانتظار الرسوم', 
              val: stats.paymentNeeded, 
              icon: CreditCard, 
              color: 'rose',
              extra: (
                <button 
                  onClick={() => setIsMonthlyFinanceOpen(true)}
                  className="absolute left-6 top-1/2 -translate-y-1/2 p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                  title="التقارير المالية المخصصة"
                >
                  <Vault size={24} />
                </button>
              )
            }
          ].map((s, idx) => (
            <div key={idx} className="relative bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-5 group transition-all hover:shadow-lg hover:-translate-y-1">
              <div className={`p-4 rounded-2xl bg-${s.color}-500/10 text-${s.color}-600 dark:text-${s.color}-400 group-hover:bg-${s.color}-500 group-hover:text-white transition-all`}>
                <s.icon size={28} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase mb-1 tracking-wider">{s.label}</p>
                <p className="text-3xl font-black text-slate-800 dark:text-white">{s.val}</p>
              </div>
              {s.extra}
            </div>
          ))}
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 pt-12">
        <div className="mb-12 flex flex-col md:flex-row gap-6 justify-between items-end">
          <div className="space-y-4 w-full md:w-auto">
            <div className="flex items-center gap-3">
              <div className={`p-2 bg-${LOGO_PRESETS[logoStyle].color}-500/10 rounded-lg`}><Zap size={20} className={`text-${LOGO_PRESETS[logoStyle].color}-500`} /></div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white">قائمة الطلاب</h2>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
               <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="p-2 text-slate-400"><Filter size={18} /></div>
                  {[
                    { id: 'alphabetical', icon: ArrowDownAZ, label: 'أبجدي' },
                    { id: 'nextLesson', icon: Calendar, label: 'الموعد' },
                    { id: 'gender', icon: Users, label: 'الجنس' },
                    { id: 'payment', icon: CreditCard, label: 'الدفع' }
                  ].map((opt) => {
                    const Icon = opt.icon;
                    const isActive = sortBy === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => setSortBy(opt.id as SortOption)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                          isActive 
                            ? `bg-${LOGO_PRESETS[logoStyle].color}-500 text-white shadow-lg` 
                            : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <Icon size={14} />
                        <span className="hidden sm:inline">{opt.label}</span>
                      </button>
                    );
                  })}
               </div>
            </div>
          </div>

          <div className="relative w-full md:w-96 group">
            <Search className={`absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-${LOGO_PRESETS[logoStyle].color}-500 transition-colors`} size={20} />
            <input 
              type="text" 
              placeholder="ابحث عن اسم طالب أو طالبة..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pr-12 pl-6 py-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-4 focus:ring-${LOGO_PRESETS[logoStyle].color}-500/10 focus:border-${LOGO_PRESETS[logoStyle].color}-500 outline-none transition-all shadow-sm dark:text-white text-lg`}
            />
          </div>
        </div>

        {processedStudents.length === 0 ? (
          <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-800">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users size={40} className="text-slate-300 dark:text-slate-700" />
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-bold text-xl">لا توجد نتائج مطابقة للبحث</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {processedStudents.map(student => (
              <div 
                key={student.id} 
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleCardMouseLeave}
                className="interactive-card card-inner relative bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-all flex flex-col group overflow-hidden"
              >
                <div className="spotlight"></div>
                <div className="relative z-10 p-6 flex justify-between items-start border-b border-slate-100 dark:border-slate-800/50">
                  <div className="flex items-center gap-4">
                    <StudentAvatar avatarId={student.avatar} gender={student.gender} />
                    <div>
                      <h3 className={`font-bold text-lg text-slate-800 dark:text-white truncate max-w-[150px] group-hover:text-${LOGO_PRESETS[logoStyle].color}-500 transition-colors`}>{student.name}</h3>
                      <div className="flex gap-2 items-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${student.gender === Gender.MALE ? 'border-blue-100 text-blue-600 bg-blue-50/50' : 'border-pink-100 text-pink-600 bg-pink-50/50'}`}>
                          {student.gender}
                        </span>
                        {student.prepaidSessions > 0 && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg border border-emerald-100 text-emerald-600 bg-emerald-50 flex items-center gap-1">
                            <ShieldCheck size={10} className="text-emerald-500" /> رصيد: {student.prepaidSessions}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                    <button onClick={() => openFinance(student)} className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-all" title="الحسابات"><Wallet size={18} /></button>
                    <button onClick={() => openInvoice(student)} className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-xl transition-all" title="فاتورة"><FileText size={18} /></button>
                    <button onClick={() => editStudent(student)} className={`p-2 text-slate-400 hover:text-${LOGO_PRESETS[logoStyle].color}-500 hover:bg-${LOGO_PRESETS[logoStyle].color}-500/10 rounded-xl transition-all`} title="تعديل"><Edit3 size={18} /></button>
                    <button onClick={() => setIsDeleteModalOpen(student.id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all" title="حذف"><Trash2 size={18} /></button>
                  </div>
                </div>

                <div className="relative z-10 p-6 space-y-6 flex-1">
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 p-3 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 transition-all hover:bg-white dark:hover:bg-slate-800 ring-1 ring-slate-100 dark:ring-slate-800">
                      <div className="p-2.5 bg-white dark:bg-slate-700 rounded-xl shadow-sm"><BookOpen size={18} className="text-slate-400" /></div>
                      <div className="overflow-hidden">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">آخر إنجاز</p>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed line-clamp-2 min-h-[40px]">{student.achievement || 'في انتظار الحصة الأولى...'}</p>
                      </div>
                    </div>
                    <div 
                      onClick={() => openQuickSchedule(student)}
                      className={`cursor-pointer flex items-start gap-4 p-3 rounded-2xl bg-${LOGO_PRESETS[logoStyle].color}-50/50 dark:bg-${LOGO_PRESETS[logoStyle].color}-900/10 transition-all hover:bg-white dark:hover:bg-slate-800 ring-1 ring-${LOGO_PRESETS[logoStyle].color}-100 dark:ring-${LOGO_PRESETS[logoStyle].color}-900/20 group/schedule`}
                    >
                      <div className={`p-2.5 bg-white dark:bg-slate-700 rounded-xl shadow-sm transition-transform group-hover/schedule:scale-110`}><Calendar size={18} className={`text-${LOGO_PRESETS[logoStyle].color}-500`} /></div>
                      <div>
                        <p className={`text-[10px] font-bold text-${LOGO_PRESETS[logoStyle].color}-500 uppercase tracking-wider mb-1`}>الموعد القادم</p>
                        <p className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                          {student.nextLessonDate || 'لم يحدد بعد'}
                          {student.nextLessonTime && <span className="text-xs opacity-60 font-medium">({student.nextLessonTime})</span>}
                          {!student.nextLessonDate && <PlusCircle size={14} className="opacity-40" />}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="pt-2">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">الحصص المستحقة (8 حصص)</p>
                      <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${student.sessionCount >= 8 ? 'bg-rose-100 text-rose-600' : `bg-${LOGO_PRESETS[logoStyle].color}-100 text-${LOGO_PRESETS[logoStyle].color}-600`}`}>
                        {student.sessionCount} / 8
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                      <div 
                        className={`h-full transition-all duration-1000 ease-out ${student.sessionCount >= 8 ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : `bg-${LOGO_PRESETS[logoStyle].color}-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]`}`}
                        style={{ width: `${(Math.min(student.sessionCount, 8) / 8) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 p-5 bg-slate-50/80 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2">
                   <div className="flex-1 grid grid-cols-2 gap-2">
                      <button 
                        onClick={() => setIsAddLessonOpen(student.id)}
                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 py-3 rounded-2xl text-[10px] font-bold hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-1 shadow-sm"
                      >
                        <PlusCircle size={14} className={`text-${LOGO_PRESETS[logoStyle].color}-500`} /> حصة
                      </button>
                      <button 
                        onClick={() => openReport(student)} 
                        className="bg-blue-600/10 text-blue-600 py-3 rounded-2xl text-[10px] font-bold hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-1 shadow-sm"
                      >
                        <BarChart3 size={14} /> تقرير
                      </button>
                      <button 
                        onClick={() => openCertificate(student)} 
                        className="col-span-2 bg-amber-500/10 text-amber-600 py-3 rounded-2xl text-[10px] font-bold hover:bg-amber-500 hover:text-white transition-all flex items-center justify-center gap-2 shadow-sm"
                      >
                        <Medal size={14} /> إصدار شهادة إتمام
                      </button>
                   </div>
                  
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={() => setIsHistoryOpen(student.id)} 
                      className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-emerald-500 rounded-2xl shadow-sm" 
                    >
                      <History size={16} />
                    </button>
                    <button 
                      onClick={() => handleGenerateFeedback(student)} 
                      disabled={isLoadingFeedback === student.id} 
                      className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-purple-500 rounded-2xl shadow-sm"
                    >
                      {isLoadingFeedback === student.id ? <Clock size={16} className="animate-spin" /> : <MessageSquare size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* General Finance Report Modal - Custom Period */}
      {isMonthlyFinanceOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl animate-in zoom-in duration-300 border dark:border-slate-800 overflow-hidden my-auto flex flex-col">
            <div className="bg-slate-900 p-8 text-white flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-500/20"><TrendingUp size={32} /></div>
                <div>
                  <h2 className="text-2xl font-black">التقرير المالي العام</h2>
                  <p className="text-xs text-slate-400 font-bold">تخصيص فترة التقرير لجميع الطلاب</p>
                </div>
              </div>
              <button onClick={() => setIsMonthlyFinanceOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-all"><X size={24} /></button>
            </div>

            <div className="p-8 space-y-8">
              <div className="flex flex-col gap-6 bg-slate-50 dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><Calendar size={12} /> من تاريخ:</label>
                    <input 
                      type="date" 
                      value={reportStartDate} 
                      onChange={e => setReportStartDate(e.target.value)} 
                      className="w-full bg-white dark:bg-slate-900 p-3 rounded-xl border-none ring-1 ring-slate-200 dark:ring-slate-700 font-bold text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><Calendar size={12} /> إلى تاريخ:</label>
                    <input 
                      type="date" 
                      value={reportEndDate} 
                      onChange={e => setReportEndDate(e.target.value)} 
                      className="w-full bg-white dark:bg-slate-900 p-3 rounded-xl border-none ring-1 ring-slate-200 dark:ring-slate-700 font-bold text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-6 pt-4 border-t border-slate-200 dark:border-slate-700/50">
                   <div className="text-left flex-1 min-w-[120px]">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">إجمالي التحصيل</p>
                    <p className="text-3xl font-black text-emerald-600">{customPeriodPaymentsData.totalAmount} <span className="text-xs">د.ب</span></p>
                  </div>
                  <div className="text-left flex-1 min-w-[120px] border-r pr-6 border-slate-200 dark:border-slate-700">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">عدد العمليات</p>
                    <p className="text-3xl font-black text-blue-600">{customPeriodPaymentsData.count}</p>
                  </div>
                  <div className="text-left flex-1 min-w-[120px] border-r pr-6 border-slate-200 dark:border-slate-700">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">المتوسط</p>
                    <p className="text-3xl font-black text-amber-500">
                      {customPeriodPaymentsData.count > 0 ? (customPeriodPaymentsData.totalAmount / customPeriodPaymentsData.count).toFixed(1) : 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="max-h-[250px] overflow-y-auto pr-2 custom-scrollbar border-b dark:border-slate-800">
                {customPeriodPaymentsData.payments.length === 0 ? (
                  <div className="text-center py-12 space-y-4">
                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto"><Receipt size={32} className="text-slate-300" /></div>
                    <p className="text-slate-400 font-bold">لا توجد عمليات مسجلة في هذه الفترة</p>
                  </div>
                ) : (
                  <table className="w-full text-right">
                    <thead className="sticky top-0 bg-white dark:bg-slate-900 z-10 shadow-sm">
                      <tr className="border-b border-slate-100 dark:border-slate-800">
                        <th className="py-3 text-[10px] font-black text-slate-400 uppercase">التاريخ</th>
                        <th className="py-3 text-[10px] font-black text-slate-400 uppercase text-right">الطالب</th>
                        <th className="py-3 text-[10px] font-black text-slate-400 uppercase text-center">الحصص</th>
                        <th className="py-3 text-[10px] font-black text-slate-400 uppercase text-left">المبلغ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800/30">
                      {customPeriodPaymentsData.payments.map((p, idx) => (
                        <tr key={idx} className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 text-xs font-bold text-slate-500">{p.date}</td>
                          <td className="py-3 text-sm font-black text-slate-800 dark:text-slate-200">{p.studentName}</td>
                          <td className="py-3 text-xs font-bold text-slate-500 text-center">{p.sessionsCovered}</td>
                          <td className="py-3 text-sm font-black text-emerald-600 text-left">{p.amount} د.ب</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Printable Custom Period Summary Area (Hidden) */}
              <div className="hidden">
                <div 
                  ref={monthlyFinanceRef} 
                  className="bg-white p-12 relative overflow-hidden" 
                  style={{ width: '800px', minHeight: '1000px' }}
                >
                   <div className="flex justify-between items-start mb-12">
                      <div>
                        <h1 className="text-4xl font-black text-emerald-600 mb-2">سنبلة ونور</h1>
                        <div className="flex items-center gap-3 text-lg font-bold text-slate-400">
                          <span>التقرير المالي المخصص</span>
                          <div className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-lg text-slate-600">
                            <span>{reportStartDate}</span>
                            <ArrowLeftRight size={14} />
                            <span>{reportEndDate}</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-5 bg-emerald-50 rounded-3xl"><Coins size={64} className="text-emerald-600" /></div>
                   </div>

                   <div className="grid grid-cols-3 gap-6 mb-12">
                      <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 text-center">
                        <p className="text-xs font-black text-slate-400 uppercase mb-2">إجمالي التحصيل</p>
                        <p className="text-4xl font-black text-emerald-600">{customPeriodPaymentsData.totalAmount} د.ب</p>
                      </div>
                      <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 text-center">
                        <p className="text-xs font-black text-slate-400 uppercase mb-2">عدد العمليات</p>
                        <p className="text-4xl font-black text-blue-600">{customPeriodPaymentsData.count}</p>
                      </div>
                      <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 text-center">
                        <p className="text-xs font-black text-slate-400 uppercase mb-2">متوسط الدفع</p>
                        <p className="text-4xl font-black text-amber-600">{customPeriodPaymentsData.count > 0 ? (customPeriodPaymentsData.totalAmount / customPeriodPaymentsData.count).toFixed(2) : 0} د.ب</p>
                      </div>
                   </div>

                   <div className="space-y-6">
                      <h3 className="text-xl font-black text-slate-800 border-r-4 border-emerald-500 pr-4">كشف تفصيلي بالعمليات</h3>
                      <table className="w-full text-right border-collapse">
                        <thead>
                          <tr className="border-b-2 border-emerald-100">
                            <th className="py-4 text-sm font-black text-emerald-600">التاريخ</th>
                            <th className="py-4 text-sm font-black text-emerald-600">اسم الطالب</th>
                            <th className="py-4 text-sm font-black text-emerald-600 text-center">الحصص</th>
                            <th className="py-4 text-sm font-black text-emerald-600 text-left">المبلغ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {customPeriodPaymentsData.payments.map((p, idx) => (
                            <tr key={idx} className="border-b border-slate-50">
                              <td className="py-4 text-sm font-bold text-slate-500">{p.date}</td>
                              <td className="py-4 text-lg font-black text-slate-800">{p.studentName}</td>
                              <td className="py-4 text-sm font-bold text-slate-500 text-center">{p.sessionsCovered}</td>
                              <td className="py-4 text-lg font-black text-slate-900 text-left">{p.amount} د.ب</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                   </div>

                   <div className="absolute bottom-12 left-12 right-12 flex justify-between items-end">
                      <div>
                        <p className="text-xs font-bold text-slate-400">تاريخ الإصدار: {new Date().toLocaleDateString('ar-SA')}</p>
                        <p className="text-xs font-bold text-slate-400 mt-1">إدارة برنامج سنبلة ونور لتعليم القرآن</p>
                      </div>
                      <div className="text-center">
                        <div className="w-32 h-px bg-slate-200 mb-2 mx-auto"></div>
                        <p className="text-sm font-black text-slate-800">ختم الإدارة</p>
                      </div>
                   </div>
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button 
                  onClick={() => downloadCapture(monthlyFinanceRef, `تقرير_مالي_مخصص_${reportStartDate}_إلى_${reportEndDate}`, 'portrait')}
                  disabled={customPeriodPaymentsData.payments.length === 0}
                  className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-xl disabled:opacity-50"
                >
                  <Download size={20} /> تحميل التقرير للفترة (PNG)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Finance Modal - Focus on 8-session cycles and Prepayment */}
      {isFinanceOpen && financeStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl animate-in zoom-in duration-300 border dark:border-slate-800 overflow-hidden my-auto flex flex-col">
            <div className="bg-emerald-600 p-6 text-white flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl"><Wallet size={24} /></div>
                <div>
                  <h2 className="text-xl font-black">الحساب المالي الذكي</h2>
                  <p className="text-[10px] opacity-80">{financeStudent.name}</p>
                </div>
              </div>
              <button onClick={() => setIsFinanceOpen(null)} className="p-2 hover:bg-white/20 rounded-full transition-all"><X size={20} /></button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-800/50 flex flex-col items-center">
                  <p className="text-[10px] font-bold text-emerald-600 mb-1">رصيد حصص متوفر</p>
                  <p className="text-2xl font-black text-slate-800 dark:text-white">{financeStudent.prepaidSessions || 0}</p>
                </div>
                <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-2xl border border-rose-100 dark:border-rose-800/50 flex flex-col items-center">
                  <p className="text-[10px] font-bold text-rose-600 mb-1">حصص مستحقة للدفع</p>
                  <p className="text-2xl font-black text-slate-800 dark:text-white">{financeStudent.sessionCount || 0}</p>
                </div>
              </div>

              <form onSubmit={handleAddPayment} className="space-y-4 p-5 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><CreditCard size={14} /> تسجيل دفع دورة (8 حصص)</h3>
                  <button type="button" onClick={() => setPaymentSessions('8')} className="text-[10px] font-bold text-emerald-600 hover:underline">إعادة ضبط للـ 8</button>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                   <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400">المبلغ (د.ب):</label>
                    <input type="number" step="0.1" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} className="w-full bg-white dark:bg-slate-900 p-3 rounded-xl border-none ring-1 ring-slate-200 dark:ring-slate-700 font-black text-lg text-emerald-600 focus:ring-2 focus:ring-emerald-500 outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400">عدد الحصص المدفوعة:</label>
                    <input type="number" value={paymentSessions} onChange={e => setPaymentSessions(e.target.value)} className="w-full bg-white dark:bg-slate-900 p-3 rounded-xl border-none ring-1 ring-slate-200 dark:ring-slate-700 font-black text-lg text-blue-600 focus:ring-2 focus:ring-blue-500 outline-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400">ملاحظة عن الدفعة:</label>
                  <input type="text" value={paymentNote} onChange={e => setPaymentNote(e.target.value)} placeholder="مثلاً: دفع مسبق لـ 8 حصص جديدة..." className="w-full bg-white dark:bg-slate-900 p-3 rounded-xl border-none ring-1 ring-slate-200 dark:ring-slate-700 text-xs outline-none" />
                </div>

                <button type="submit" className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-sm shadow-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-2">
                  <ShieldCheck size={18} /> تأكيد تسجيل الدفعة
                </button>
              </form>

              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">سجل العمليات المالية</h3>
                  <button onClick={() => setIsFinancialReportOpen(financeStudent.id)} className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 hover:underline"><ReceiptText size={12} /> استخراج كشف حساب</button>
                </div>
                <div className="max-h-32 overflow-y-auto space-y-2 pr-1">
                  {(financeStudent.payments || []).length === 0 ? (
                    <p className="text-[10px] text-slate-400 text-center py-4">لا توجد عمليات سابقة</p>
                  ) : (
                    financeStudent.payments.map(p => (
                      <div key={p.id} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 flex justify-between items-center group">
                        <div>
                          <p className="text-sm font-black text-slate-700 dark:text-slate-200">{p.amount} د.ب <span className="text-[10px] font-normal text-slate-400">({p.sessionsCovered} حصص)</span></p>
                          <div className="flex items-center gap-2 text-[8px] font-bold text-slate-400">
                            <span>{p.date}</span>
                            {p.note && <span className="text-emerald-500">• {p.note}</span>}
                          </div>
                        </div>
                        <button onClick={() => deletePayment(financeStudent.id, p.id)} className="p-1.5 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14} /></button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Financial Statement Report Modal */}
      {isFinancialReportOpen && financialReportStudent && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl animate-in zoom-in duration-300 border dark:border-slate-800 overflow-hidden my-auto flex flex-col">
            <div className="p-4 border-b dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-sm flex items-center gap-2"><ReceiptText size={18} className="text-emerald-500" /> كشف الحساب المالي</h3>
              <button onClick={() => setIsFinancialReportOpen(null)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-all"><X size={18} /></button>
            </div>

            <div className="flex-1 overflow-auto bg-slate-200 dark:bg-slate-800 p-4 flex justify-center">
              <div className="scale-[0.6] origin-top">
                <div 
                  ref={financeReportRef} 
                  className="bg-white p-10 relative overflow-hidden capture-area shadow-2xl" 
                  style={{ width: '450px', minHeight: '600px' }}
                >
                    <div className="flex justify-between items-start mb-10">
                      <div>
                        <h1 className="text-2xl font-black text-emerald-600">سنبلة ونور</h1>
                        <p className="text-[10px] font-bold text-slate-400">تقرير كشف حساب مالي</p>
                      </div>
                      <div className="p-3 bg-emerald-50 rounded-2xl"><Coins size={32} className="text-emerald-600" /></div>
                    </div>

                    <div className="mb-8 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 mb-1">اسم الطالب:</p>
                      <h2 className="text-xl font-black text-slate-800">{financialReportStudent.name}</h2>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <p className="text-[10px] font-bold text-emerald-600 flex items-center gap-1"><ShieldCheck size={10} /> الرصيد: {financialReportStudent.prepaidSessions || 0} حصة</p>
                        <p className="text-[10px] font-bold text-rose-600 flex items-center gap-1"><AlertCircle size={10} /> المستحق: {financialReportStudent.sessionCount || 0} حصة</p>
                      </div>
                      <p className="text-[8px] font-bold text-slate-400 mt-3">تاريخ الإصدار: {new Date().toLocaleDateString('ar-SA')}</p>
                    </div>

                    <div className="space-y-4">
                      <table className="w-full text-right border-collapse">
                        <thead>
                          <tr className="border-b-2 border-emerald-100">
                            <th className="py-2 text-[10px] font-black text-emerald-600">التاريخ</th>
                            <th className="py-2 text-[10px] font-black text-emerald-600">البيان</th>
                            <th className="py-2 text-[10px] font-black text-emerald-600 text-left">المبلغ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(financialReportStudent.payments || []).map(p => (
                            <tr key={p.id} className="border-b border-slate-50">
                              <td className="py-3 text-[10px] font-bold text-slate-500">{p.date}</td>
                              <td className="py-3 text-[10px] font-bold text-slate-700">{p.note || `دفع لعدد ${p.sessionsCovered} حصص`}</td>
                              <td className="py-3 text-[10px] font-black text-slate-900 text-left">{p.amount} د.ب</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td colSpan={2} className="py-6 text-xs font-black text-slate-400">إجمالي التحصيل:</td>
                            <td className="py-6 text-lg font-black text-emerald-600 text-left">{(financialReportStudent.payments || []).reduce((acc, p) => acc + p.amount, 0)} د.ب</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    <div className="absolute bottom-10 left-10 right-10 flex flex-col items-center">
                      <div className="w-full h-px bg-slate-100 mb-4"></div>
                      <p className="text-[10px] font-bold text-slate-400">"بارك الله في جهودكم ونفع بكم"</p>
                    </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t dark:border-slate-700 flex gap-2">
              <button 
                onClick={() => downloadCapture(financeReportRef, `كشف_حساب_${financialReportStudent.name}`, 'portrait')}
                className="flex-1 bg-emerald-600 text-white py-2.5 rounded-xl font-bold text-xs shadow-lg flex items-center justify-center gap-2"
              >
                <Download size={16} /> تحميل كصورة (PNG)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Schedule Modal */}
      {isScheduleQuickOpen && scheduleQuickStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2rem] shadow-2xl animate-in zoom-in duration-200 border dark:border-slate-800">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-xl dark:text-white flex items-center gap-2"><Calendar className={`text-${LOGO_PRESETS[logoStyle].color}-500`} /> تحديد موعد جديد</h3>
              <button onClick={() => setIsScheduleQuickOpen(null)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-all"><X size={24} /></button>
            </div>
            <form onSubmit={handleQuickSchedule} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">تاريخ الحصة القادمة</label>
                <input 
                  type="date" 
                  value={formData.nextLessonDate} 
                  onChange={e => setFormData({...formData, nextLessonDate: e.target.value})} 
                  className={`w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-${LOGO_PRESETS[logoStyle].color}-500 outline-none dark:text-white font-bold text-lg`}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">وقت الحصة</label>
                <input 
                  type="time" 
                  value={formData.nextLessonTime} 
                  onChange={e => setFormData({...formData, nextLessonTime: e.target.value})} 
                  className={`w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-${LOGO_PRESETS[logoStyle].color}-500 outline-none dark:text-white font-bold text-lg`}
                />
              </div>
              <button type="submit" className={`w-full bg-${LOGO_PRESETS[logoStyle].color}-600 text-white py-4 rounded-2xl font-bold text-lg hover:brightness-110 shadow-xl transition-all`}>حفظ الموعد</button>
            </form>
          </div>
        </div>
      )}

      {/* Certificate Modal */}
      {isCertificateOpen && certStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl animate-in zoom-in duration-300 border dark:border-slate-800 overflow-hidden my-auto flex flex-col">
            
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-b dark:border-slate-700 flex flex-col space-y-4 shrink-0">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Medal size={20} className="text-emerald-600" />
                  <h3 className="font-bold text-slate-700 dark:text-slate-200 text-sm">تخصيص الشهادة</h3>
                </div>
                <button onClick={() => setIsCertificateOpen(null)} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-all"><X size={20} /></button>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">الاتجاه:</label>
                  <div className="flex bg-white dark:bg-slate-700 p-1 rounded-xl border border-slate-200 dark:border-slate-600">
                    <button onClick={() => setCertOrientation('landscape')} className={`flex-1 py-1.5 rounded-lg flex justify-center items-center transition-all ${certOrientation === 'landscape' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}><RectangleHorizontal size={16} /></button>
                    <button onClick={() => setCertOrientation('portrait')} className={`flex-1 py-1.5 rounded-lg flex justify-center items-center transition-all ${certOrientation === 'portrait' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}><RectangleVertical size={16} /></button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">اللون:</label>
                  <select value={certColorId} onChange={(e) => setCertColorId(e.target.value)} className="w-full bg-white dark:bg-slate-700 p-1.5 rounded-xl border border-slate-200 dark:border-slate-600 text-xs font-bold outline-none dark:text-white">
                    {CERT_COLORS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">اسم المعلم:</label>
                <input type="text" value={certificateTeacherName} onChange={(e) => { setCertificateTeacherName(e.target.value); localStorage.setItem('iqra-teacher-name', e.target.value); }} className="w-full bg-white dark:bg-slate-700 p-2 rounded-xl border border-slate-200 dark:border-slate-600 text-xs font-bold outline-none dark:text-white" />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">عنوان الشهادة والمنهج:</label>
                <div className="flex gap-2">
                  <input type="text" value={certificateTitle} onChange={(e) => setCertificateTitle(e.target.value)} className="flex-1 bg-white dark:bg-slate-700 p-2 rounded-xl border border-slate-200 dark:border-slate-600 text-xs font-bold outline-none dark:text-white" placeholder="العنوان" />
                  <input type="text" value={certificateMilestone} onChange={(e) => setCertificateMilestone(e.target.value)} className="flex-1 bg-white dark:bg-slate-700 p-2 rounded-xl border border-slate-200 dark:border-slate-600 text-xs font-bold outline-none dark:text-white" placeholder="المنهج" />
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-auto bg-slate-200 dark:bg-slate-800 p-4 flex justify-center min-h-[300px]">
              <div className={`transition-all duration-300 ${certOrientation === 'landscape' ? 'scale-[0.4] origin-top' : 'scale-[0.35] origin-top'}`}>
                <div 
                  ref={certificateRef} 
                  className="relative overflow-hidden capture-area shadow-2xl bg-[#fcf9f2] flex flex-col items-center text-center justify-center" 
                  style={{ width: certOrientation === 'landscape' ? '842px' : '595px', height: certOrientation === 'landscape' ? '595px' : '842px', padding: '40px' }}
                >
                    <div className="absolute inset-4 border-[12px] border-double rounded-lg pointer-events-none" style={{ borderColor: selectedCertColor.secondary }}></div>
                    <div className="absolute inset-8 border rounded-lg pointer-events-none" style={{ borderColor: selectedCertColor.secondary }}></div>
                    <div className="absolute top-6 left-6 w-16 h-16 border-t-4 border-l-4 rounded-tl-xl" style={{ borderColor: selectedCertColor.primary }}></div>
                    <div className="absolute top-6 right-6 w-16 h-16 border-t-4 border-r-4 rounded-tr-xl" style={{ borderColor: selectedCertColor.primary }}></div>
                    <div className="absolute bottom-6 left-6 w-16 h-16 border-b-4 border-l-4 rounded-bl-xl" style={{ borderColor: selectedCertColor.primary }}></div>
                    <div className="absolute bottom-6 right-6 w-16 h-16 border-b-4 border-r-4 rounded-br-xl" style={{ borderColor: selectedCertColor.primary }}></div>

                    <div className={`relative z-10 w-full flex flex-col items-center justify-center ${certOrientation === 'landscape' ? 'space-y-8' : 'space-y-12'} py-10`}>
                      <div className="flex flex-col items-center">
                        <div className="mb-2 text-emerald-600">{React.createElement(LOGO_PRESETS[logoStyle].icon, { size: 48 })}</div>
                        <h4 className="quran-font text-emerald-600 text-xl font-bold">سنبلة ونور</h4>
                      </div>
                      <h1 className={`${certOrientation === 'landscape' ? 'text-5xl' : 'text-6xl'} quran-font font-black text-slate-900 mt-4 tracking-widest`}>{certificateTitle}</h1>
                      <div className="space-y-6 max-w-2xl px-10">
                        <p className={`${certOrientation === 'landscape' ? 'text-xl' : 'text-2xl'} text-slate-600 font-medium`}>تشهد إدارة برنامج سنبلة ونور بأن الطالب/ة:</p>
                        <h2 className={`${certOrientation === 'landscape' ? 'text-5xl' : 'text-6xl'} quran-font font-black`} style={{ color: selectedCertColor.primary }}>{certStudent.name}</h2>
                        <p className={`${certOrientation === 'landscape' ? 'text-xl' : 'text-2xl'} text-slate-600 font-medium leading-loose pt-4`}>قد أتمَّ بنجاحٍ وتوفيقٍ من اللهِ عزَّ وجلَّ مـنهـج:<br/><span className={`${certOrientation === 'landscape' ? 'text-2xl' : 'text-3xl'} font-black text-slate-900 border-b-2 px-6 inline-block mt-2`} style={{ borderBottomColor: selectedCertColor.secondary }}>{certificateMilestone}</span></p>
                      </div>
                      <div className={`pt-12 flex justify-between w-full ${certOrientation === 'landscape' ? 'px-12' : 'px-8'} text-slate-500 relative`}>
                        <div className="text-center"><p className="text-sm font-bold opacity-60">تاريخ الإصدار</p><p className="text-lg font-black text-slate-800 mt-1">{new Date().toLocaleDateString('ar-SA')}</p></div>
                        <div className="text-center"><p className="text-sm font-bold opacity-60">توقيع المعلم</p><p className="quran-font text-2xl font-bold mt-1 truncate max-w-[300px]" style={{ color: selectedCertColor.primary }}>{certificateTeacherName}</p></div>
                      </div>
                      <p className="absolute bottom-12 text-[10px] text-slate-400 font-bold tracking-[0.2em] uppercase">"وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا"</p>
                    </div>
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `radial-gradient(#10b981 0.5px, transparent 0.5px)`, backgroundSize: '24px 24px' }}></div>
                </div>
              </div>
            </div>

            <div className="p-5 bg-slate-50 dark:bg-slate-800/50 border-t dark:border-slate-700 flex gap-4">
              <button onClick={() => downloadCapture(certificateRef, `شهادة_${certStudent.name}`, certOrientation)} disabled={isCapturing} className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 active:scale-95 transition-all shadow-lg">{isCapturing ? <Clock size={18} className="animate-spin" /> : <Download size={18} />} تحميل (PNG)</button>
              <button onClick={() => setIsCertificateOpen(null)} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all">إغلاق</button>
            </div>
          </div>
        </div>
      )}

      {/* Progress Report Modal */}
      {isReportOpen && reportStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl animate-in zoom-in duration-300 border dark:border-slate-800 overflow-hidden my-auto flex flex-col">
            <div className="p-5 bg-slate-50 dark:bg-slate-800/50 border-b dark:border-slate-700 shrink-0 space-y-4">
              <div className="flex justify-between items-center"><div className="flex items-center gap-2"><Settings2 size={18} className={`text-${LOGO_PRESETS[logoStyle].color}-500`} /><h3 className="font-bold text-slate-700 dark:text-slate-200 text-sm">تخصيص التقرير</h3></div><button onClick={() => setIsReportOpen(null)} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-all"><X size={20} /></button></div>
              <div className="space-y-3">
                <div className="flex bg-white dark:bg-slate-700 p-1 rounded-xl border border-slate-200 dark:border-slate-600"><button onClick={() => setReportRange('cycle')} className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all ${reportRange === 'cycle' ? `bg-${LOGO_PRESETS[logoStyle].color}-600 text-white shadow-sm` : 'text-slate-400'}`}>فترة ({reportStudent.sessionCount})</button><button onClick={() => setReportRange('full')} className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all ${reportRange === 'full' ? `bg-${LOGO_PRESETS[logoStyle].color}-600 text-white shadow-sm` : 'text-slate-400'}`}>السجل الكامل</button></div>
                <div className="flex gap-2"><button onClick={() => setShowDatesInReport(!showDatesInReport)} className={`flex-1 py-2 rounded-xl text-[10px] font-bold transition-all border ${showDatesInReport ? `bg-blue-50 border-blue-200 text-blue-600` : `bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-400`}`}>تاريخ</button><button onClick={() => setShowTotalTimeInReport(!showTotalTimeInReport)} className={`flex-1 py-2 rounded-xl text-[10px] font-bold transition-all border ${showTotalTimeInReport ? `bg-amber-50 border-amber-200 text-amber-600` : `bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-400`}`}>وقت</button></div>
                <textarea value={editableReportPhrase} onChange={(e) => setEditableReportPhrase(e.target.value)} className="w-full bg-white dark:bg-slate-700 p-2 rounded-xl border border-slate-200 dark:border-slate-600 text-[10px] font-medium leading-relaxed outline-none focus:ring-2 focus:ring-emerald-500/20 min-h-[50px] resize-none dark:text-white" placeholder="عبارة الختام..." />
              </div>
            </div>
            <div className="flex-1 overflow-auto bg-slate-200 dark:bg-slate-800 p-4 flex justify-center min-h-[300px]"><div className="scale-[0.5] origin-top"><div ref={reportRef} className="bg-white p-0 relative overflow-hidden capture-area shadow-2xl" style={{ width: '450px', minHeight: '800px' }}><div className={`bg-gradient-to-br ${LOGO_PRESETS[logoStyle].gradient} p-8 pb-12 text-white relative`}><div className="relative z-10"><div className="flex items-center gap-3 mb-6"><div className="bg-white/20 p-2 rounded-xl">{React.createElement(LOGO_PRESETS[logoStyle].icon, { size: 28 })}</div><h1 className="text-2xl font-black">سنبلة ونور</h1></div><h2 className="text-4xl font-black mb-1 leading-tight">بطاقة إنجاز<br/>بطل القرآن</h2></div></div><div className="p-8 space-y-8 bg-white -mt-6 rounded-t-[2.5rem] relative z-20"><div className="flex items-center gap-5 p-5 rounded-3xl bg-slate-50 border border-slate-100 shadow-sm"><StudentAvatar avatarId={reportStudent.avatar} gender={reportStudent.gender} className="w-20 h-20 rounded-2xl flex items-center justify-center bg-white shadow-sm text-3xl font-black shrink-0" /><div><h3 className="text-2xl font-black text-slate-900 leading-tight">{reportStudent.name}</h3><span className={`bg-${LOGO_PRESETS[logoStyle].color}-500/10 text-${LOGO_PRESETS[logoStyle].color}-600 px-3 py-0.5 rounded-full text-xs font-bold`}>طالب متميز</span></div></div><div className="grid grid-cols-2 gap-4"><div className="p-5 bg-blue-50 rounded-3xl border border-blue-100 flex flex-col items-center text-center"><p className="text-[10px] font-bold text-blue-400 uppercase mb-1">الحصص</p><p className="text-3xl font-black text-slate-900">{reportRange === 'cycle' ? reportStudent.sessionCount : reportStudent.lessons.length}</p></div><div className={`p-5 bg-${LOGO_PRESETS[logoStyle].color}-50 rounded-3xl border border-${LOGO_PRESETS[logoStyle].color}-100 flex flex-col items-center text-center`}><p className="text-[10px] font-bold text-slate-400 uppercase mb-1">الدقائق</p><p className="text-3xl font-black text-slate-900">{(reportRange === 'cycle' ? reportStudent.lessons.slice(0, reportStudent.sessionCount) : reportStudent.lessons).reduce((acc, l) => acc + (l.duration || 0), 0)}</p></div></div><div className="space-y-4"><label className="text-xs font-black text-slate-900 flex items-center gap-2 mb-4 bg-slate-50 w-fit px-4 py-2 rounded-full">🔹 أبرز الإنجازات:</label><div className="space-y-6">{(reportRange === 'cycle' ? reportStudent.lessons.slice(0, reportStudent.sessionCount) : reportStudent.lessons).map((lesson, idx, arr) => (<div key={lesson.id} className="flex gap-4"><div className={`w-7 h-7 rounded-full bg-${LOGO_PRESETS[logoStyle].color}-600 text-white flex items-center justify-center text-[10px] font-black shrink-0`}>{arr.length - idx}</div><div>{showDatesInReport && <span className="text-[10px] font-black text-slate-400 block mb-1">{lesson.date}</span>}<p className="text-slate-800 font-bold text-lg leading-snug">{lesson.achievement}</p>{lesson.absenceNote && <p className="text-[10px] text-slate-500 mt-1 italic">{lesson.absenceNote}</p>}</div></div>))}</div></div><div className="pt-8 border-t border-slate-100 flex flex-col items-center text-center space-y-4"><p className="text-sm text-slate-600 font-bold italic leading-relaxed whitespace-pre-wrap">"{editableReportPhrase}"</p></div></div></div></div></div>
            <div className="p-5 bg-slate-50 dark:bg-slate-800/50 border-t dark:border-slate-700 flex gap-3 shrink-0"><button onClick={() => downloadCapture(reportRef, `تقرير_${reportStudent.name}`)} className={`flex-1 bg-${LOGO_PRESETS[logoStyle].color}-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:brightness-110 shadow-lg`}>تحميل</button><button onClick={() => sendWhatsAppReport(reportStudent, generateBriefReport(reportStudent))} className="flex-1 bg-[#25D366] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg">مشاركة</button></div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {isInvoiceOpen && invoiceStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl animate-in zoom-in duration-300 border dark:border-slate-800 overflow-hidden my-auto">
            <div className={`bg-${LOGO_PRESETS[logoStyle].color}-600 p-8 text-white flex justify-between items-start`}><div><h2 className="text-3xl font-black mb-1">فاتورة الرسوم</h2><p className="text-sm opacity-80">برنامج سنبلة ونور لتعليم القرآن</p></div><button onClick={() => setIsInvoiceOpen(null)} className="p-2 hover:bg-white/20 rounded-full transition-all"><X size={24} /></button></div>
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700"><div><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">اسم الطالب</p><p className="text-lg font-bold dark:text-white">{invoiceStudent.name}</p></div><StudentAvatar avatarId={invoiceStudent.avatar} gender={invoiceStudent.gender} className="w-12 h-12 rounded-xl flex items-center justify-center bg-white dark:bg-slate-700 shadow-sm" /></div>
              <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><CalendarDays size={12} /> من تاريخ</label><input type="date" value={invoiceStartDate} onChange={(e) => setInvoiceStartDate(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 py-3 px-4 rounded-xl font-bold text-sm text-slate-700 dark:text-slate-200 border-none ring-1 ring-slate-100 dark:ring-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none transition-all" /></div><div className="space-y-2"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><CalendarDays size={12} /> إلى تاريخ</label><input type="date" value={invoiceEndDate} onChange={(e) => setInvoiceEndDate(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 py-3 px-4 rounded-xl font-bold text-sm text-slate-700 dark:text-slate-200 border-none ring-1 ring-slate-100 dark:ring-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none transition-all" /></div></div>
              <div className="space-y-3"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><MessageSquare size={12} /> الرسالة</label><textarea value={editableMessage} onChange={(e) => setEditableMessage(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 text-sm font-medium leading-relaxed dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 min-h-[120px] resize-none" dir="rtl" /></div>
              <div className="space-y-4 pt-2"><div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">مبلغ الرسوم:</label><div className="relative"><input type="number" step="0.001" value={invoiceAmount} onChange={(e) => setInvoiceAmount(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 py-3 pr-4 pl-12 rounded-xl font-black text-2xl text-emerald-600 focus:ring-2 focus:ring-emerald-500 outline-none transition-all" /><span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">د.ب</span></div></div></div>
              <div className="space-y-3"><button onClick={() => sendWhatsAppInvoice(invoiceStudent)} className="w-full bg-[#25D366] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-[#25D366]/20"><Phone size={20} fill="currentColor" /> إرسال عبر الواتساب</button><button onClick={() => markPaymentAsDone(invoiceStudent.id)} className="w-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-200 transition-all"><CheckCircle2 size={20} /> تأكيد استلام الدفع</button></div>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {isHistoryOpen && historyStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md max-h-[85vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in duration-300 border dark:border-slate-800">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start shrink-0"><div><h3 className="font-bold text-xl dark:text-white">سجل حصص الطالب</h3><p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">{historyStudent.name}</p></div><button onClick={() => setIsHistoryOpen(null)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-all"><X size={20} /></button></div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white dark:bg-slate-900/30">{historyStudent.lessons.map((lesson, idx) => (<div key={lesson.id} className="relative pr-6 border-r-2 border-slate-100 dark:border-slate-800 pb-6 last:pb-0 group/lesson"><div className={`absolute right-[-7px] top-2 w-3 h-3 bg-${LOGO_PRESETS[logoStyle].color}-500 rounded-full border-2 border-white dark:border-slate-900 shadow-md`}></div><div className={`p-4 rounded-2xl border transition-all ${editingLessonId === lesson.id ? `ring-2 ring-${LOGO_PRESETS[logoStyle].color}-500 bg-${LOGO_PRESETS[logoStyle].color}-50/30 border-${LOGO_PRESETS[logoStyle].color}-200` : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 shadow-sm'}`}><div className="flex justify-between items-center mb-2"><div className="flex items-center gap-2"><span className="text-[8px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500">حصة # {historyStudent.lessons.length - idx}</span>{lesson.attendanceStatus === 'absent' && <span className="text-[8px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-600">غائب</span>}{lesson.attendanceStatus === 'excused' && <span className="text-[8px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-600">مستأذن</span>}<div className={`flex items-center gap-1 text-[8px] font-bold text-${LOGO_PRESETS[logoStyle].color}-600`}><Timer size={10} /> {lesson.duration || 20} د</div></div><span className="text-[10px] font-bold text-slate-400">{lesson.date}</span></div>{editingLessonId === lesson.id ? (<div className="space-y-3"><div className="flex gap-2"><button type="button" onClick={() => setLessonAttendanceStatus('present')} className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${lessonAttendanceStatus === 'present' ? `bg-emerald-50 border-emerald-200 text-emerald-600` : `bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-400`}`}>حاضر</button><button type="button" onClick={() => setLessonAttendanceStatus('absent')} className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${lessonAttendanceStatus === 'absent' ? `bg-rose-50 border-rose-200 text-rose-600` : `bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-400`}`}>غائب</button><button type="button" onClick={() => setLessonAttendanceStatus('excused')} className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${lessonAttendanceStatus === 'excused' ? `bg-amber-50 border-amber-200 text-amber-600` : `bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-400`}`}>مستأذن</button></div><div className="grid grid-cols-2 gap-2"><input type="date" value={tempLessonDate} onChange={e => setTempLessonDate(e.target.value)} className="w-full px-2 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-900 ring-1 ring-slate-200 outline-none" />{lessonAttendanceStatus === 'present' && <input type="number" value={tempLessonDuration} onChange={e => setTempLessonDuration(e.target.value)} className="w-full px-2 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-900 ring-1 ring-slate-200 outline-none" />}</div>{lessonAttendanceStatus === 'present' ? <textarea value={tempLessonAchievement} onChange={e => setTempLessonAchievement(e.target.value)} className="w-full px-3 py-2 rounded-lg text-xs bg-white dark:bg-slate-900 ring-1 ring-slate-200 outline-none" rows={2} placeholder="الإنجاز..." /> : <textarea value={lessonAbsenceNote} onChange={e => setLessonAbsenceNote(e.target.value)} className="w-full px-3 py-2 rounded-lg text-xs bg-white dark:bg-slate-900 ring-1 ring-slate-200 outline-none" rows={2} placeholder="ملاحظات الغياب..." />}<div className="flex gap-2 justify-end"><button onClick={() => saveEditedLesson(historyStudent.id, lesson.id)} className={`px-4 py-1.5 bg-${LOGO_PRESETS[logoStyle].color}-600 text-white rounded-lg text-[10px] font-bold`}>حفظ</button><button onClick={() => setEditingLessonId(null)} className="px-4 py-1.5 bg-slate-100 rounded-lg text-[10px] font-bold">إلغاء</button></div></div>) : (<div className="space-y-2"><p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-bold">{lesson.achievement}</p>{lesson.absenceNote && <p className="text-[10px] text-slate-500 mt-1">{lesson.absenceNote}</p>}<div className="flex gap-2 justify-end opacity-0 group-hover/lesson:opacity-100 transition-opacity"><button onClick={() => { setEditingLessonId(lesson.id); setTempLessonAchievement(lesson.achievement); setTempLessonDate(lesson.date); setTempLessonDuration(lesson.duration?.toString() || '20'); setLessonAttendanceStatus(lesson.attendanceStatus || 'present'); setLessonAbsenceNote(lesson.absenceNote || ''); }} className="p-1.5 text-slate-400 hover:text-emerald-500 rounded-lg"><Edit3 size={14} /></button></div></div>)}</div></div>))}</div>
          </div>
        </div>
      )}

      {/* Register Session Modal */}
      {isAddLessonOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2rem] shadow-2xl animate-in zoom-in duration-200 border dark:border-slate-800 overflow-hidden my-auto">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-lg dark:text-white flex items-center gap-2"><PlusCircle size={20} className={`text-${LOGO_PRESETS[logoStyle].color}-500`} /> تسجيل حصة</h3>
              <button onClick={() => setIsAddLessonOpen(null)} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-full transition-all"><X size={20} /></button>
            </div>
            <form onSubmit={handleRegisterLesson} className="p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">حالة الحضور:</label>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setLessonAttendanceStatus('present')} className={`flex-1 py-2 rounded-xl text-[10px] font-bold transition-all border ${lessonAttendanceStatus === 'present' ? `bg-emerald-50 border-emerald-200 text-emerald-600` : `bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-400`}`}>حاضر</button>
                  <button type="button" onClick={() => setLessonAttendanceStatus('absent')} className={`flex-1 py-2 rounded-xl text-[10px] font-bold transition-all border ${lessonAttendanceStatus === 'absent' ? `bg-rose-50 border-rose-200 text-rose-600` : `bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-400`}`}>غائب</button>
                  <button type="button" onClick={() => setLessonAttendanceStatus('excused')} className={`flex-1 py-2 rounded-xl text-[10px] font-bold transition-all border ${lessonAttendanceStatus === 'excused' ? `bg-amber-50 border-amber-200 text-amber-600` : `bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-400`}`}>مستأذن</button>
                </div>
              </div>

              {lessonAttendanceStatus === 'present' ? (
                <>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">الإنجاز:</label>
                    <textarea required autoFocus rows={3} value={lessonAchievement} onChange={e => setLessonAchievement(e.target.value)} className={`w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-${LOGO_PRESETS[logoStyle].color}-500 outline-none dark:text-white resize-none font-medium text-sm`} placeholder="أدخل تفاصيل الإنجاز..." />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">المدة (د):</label>
                    <div className={`flex items-center gap-3 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 focus-within:ring-2 focus-within:ring-${LOGO_PRESETS[logoStyle].color}-500 transition-all`}>
                      <Timer size={16} className="text-slate-400" />
                      <input type="number" value={lessonDuration} onChange={e => setLessonDuration(e.target.value)} className="bg-transparent border-none outline-none flex-1 text-sm font-bold dark:text-white" />
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ملاحظات الغياب:</label>
                  <textarea rows={3} value={lessonAbsenceNote} onChange={e => setLessonAbsenceNote(e.target.value)} className={`w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-${LOGO_PRESETS[logoStyle].color}-500 outline-none dark:text-white resize-none font-medium text-sm`} placeholder="اختياري..." />
                </div>
              )}
              <button type="submit" className={`w-full bg-${LOGO_PRESETS[logoStyle].color}-600 text-white py-3.5 rounded-xl font-bold text-sm hover:brightness-110 shadow-lg transition-all`}>إدراج في السجل</button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Student Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md"><div className="bg-white dark:bg-slate-900 w-full max-w-xs rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in border-4 border-rose-500/20 my-auto"><div className="p-6 bg-rose-500 text-white text-center"><AlertTriangle className="mx-auto mb-2" size={32} /><h3 className="font-bold text-lg">حذف الطالب؟</h3></div><div className="p-6 space-y-4 text-center"><p className="text-[10px] text-slate-500 font-medium">اكتب <span className="font-bold text-rose-500 underline">DELETE</span> للتأكيد</p><input type="text" autoFocus value={deleteConfirmText} onChange={e => setDeleteConfirmText(e.target.value)} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 text-center font-bold text-lg text-rose-500 transition-all focus:ring-2 focus:ring-rose-500/20" placeholder="DELETE" /><div className="flex gap-2"><button onClick={() => { setIsDeleteModalOpen(null); setDeleteConfirmText(''); }} className="flex-1 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-all">إلغاء</button><button onClick={confirmDelete} disabled={deleteConfirmText !== 'DELETE'} className="flex-[2] py-2.5 text-xs font-bold bg-rose-500 text-white rounded-xl shadow-md disabled:opacity-20 hover:bg-rose-600 transition-all">تأكيد الحذف</button></div></div></div></div>
      )}
      
      {/* Student Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl animate-in zoom-in duration-300 my-auto border dark:border-slate-800 overflow-hidden"><div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center"><h2 className="text-xl font-bold dark:text-white flex items-center gap-2"><PlusCircle size={20} className={`text-${LOGO_PRESETS[logoStyle].color}-500`} /> {editingStudent ? 'تعديل الطالب' : 'إضافة طالب'}</h2><button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-all"><X size={20} /></button></div><form onSubmit={handleAddOrUpdateStudent} className="p-6 space-y-5"><div className="space-y-2"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">الأيقونة:</label><div className="flex flex-wrap gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">{AVATAR_OPTIONS.map(opt => (<button key={opt.id} type="button" onClick={() => setFormData({...formData, avatar: opt.id})} className={`p-2 rounded-lg transition-all ${formData.avatar === opt.id ? `bg-${LOGO_PRESETS[logoStyle].color}-600 text-white shadow-md scale-105` : 'bg-white dark:bg-slate-700 text-slate-400'}`}><opt.icon size={16} /></button>))}</div></div><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">الاسم:</label><input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white font-bold text-sm" /></div><div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">الجوال:</label><input value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white font-bold text-sm" placeholder="973xxxxxxxx" /></div></div><div className="grid grid-cols-2 gap-4"><div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">الجنس:</label><select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value as Gender})} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white font-bold text-sm"><option value={Gender.MALE}>ذكر</option><option value={Gender.FEMALE}>أنثى</option></select></div><div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">الحصص الحالية:</label><input type="number" max="8" min="0" value={formData.sessionCount} onChange={e => setFormData({...formData, sessionCount: parseInt(e.target.value) || 0})} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white font-bold text-sm" /></div></div><div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800"><div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">تاريخ القادم:</label><input type="date" value={formData.nextLessonDate} onChange={e => setFormData({...formData, nextLessonDate: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700 text-xs font-bold dark:text-white" /></div><div className="space-y-1.5"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">وقت القادم:</label><input type="time" value={formData.nextLessonTime} onChange={e => setFormData({...formData, nextLessonTime: e.target.value})} className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border-none ring-1 ring-slate-200 dark:ring-slate-700 text-xs font-bold dark:text-white" /></div></div><button type="submit" className={`w-full bg-${LOGO_PRESETS[logoStyle].color}-600 text-white py-4 rounded-xl font-bold text-sm shadow-lg hover:brightness-110 transition-all`}>حفظ البيانات</button></form></div></div>
      )}
    </div>
  );
};

export default App;
