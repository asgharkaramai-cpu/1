import React from 'react';
import {
  Mail,
  Archive,
  TrendingUp,
  Calendar,
  ShieldCheck,
  Building,
  UserCheck,
  Briefcase,
  AlertTriangle,
  ArrowUpRight,
  PlusCircle,
  FileSignature,
  FileText,
  Lock,
} from 'lucide-react';
import {
  Company,
  Letter,
  ArchiveDocument,
  FinancialTransaction,
  BoardMeeting,
  Project,
  AuditLog,
} from '../types';

interface DashboardTabProps {
  currentCompany: Company;
  letters: Letter[];
  archiveDocs: ArchiveDocument[];
  financials: FinancialTransaction[];
  boardMeetings: BoardMeeting[];
  projects: Project[];
  auditLogs: AuditLog[];
  onNavigateTab: (tab: string) => void;
  onOpenNewLetter: () => void;
  onOpenNewDocument: () => void;
  onOpenNewVoucher: () => void;
  onOpenNewMeeting: () => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  currentCompany,
  letters,
  archiveDocs,
  financials,
  boardMeetings,
  projects,
  auditLogs,
  onNavigateTab,
  onOpenNewLetter,
  onOpenNewDocument,
  onOpenNewVoucher,
  onOpenNewMeeting,
}) => {
  // Compute analytics for current company
  const pendingSignLetters = letters.filter((l) => l.status === 'draft' || l.status === 'pending_signature').length;
  const lockedSignedLetters = letters.filter((l) => l.is_locked).length;

  const totalIncome = financials
    .filter((f) => f.type === 'income' || f.type === 'receipt')
    .reduce((sum, f) => sum + f.amount, 0);

  const totalExpense = financials
    .filter((f) => f.type === 'expense' || f.type === 'payment' || f.type === 'payroll')
    .reduce((sum, f) => sum + f.amount, 0);

  const totalDirectJobs = projects.reduce((sum, p) => sum + p.direct_employment_count, 0);
  const totalIndirectJobs = projects.reduce((sum, p) => sum + p.indirect_employment_count, 0);

  // Next meeting in 15-day interval
  const upcomingMeeting = boardMeetings.find((b) => b.status === 'scheduled');

  const formatTomans = (amount: number) => {
    return (amount / 10000000).toLocaleString('fa-IR') + ' میلیون تومان';
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Active Company Identification & Multi-Tenant Assurance */}
      <div
        className="rounded-2xl p-6 text-white shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4"
        style={{
          background: `linear-gradient(135deg, ${currentCompany.brand_color} 0%, #1e1b4b 100%)`,
        }}
      >
        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full font-medium">
              محیط اختصاصی مستاجر (Tenant ID: {currentCompany.id})
            </span>
            <span className="text-[11px] bg-emerald-500/80 px-2 py-0.5 rounded-full font-bold">
              فعال و معتبر
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-black">{currentCompany.legal_name}</h1>
          <p className="text-xs md:text-sm text-white/80 max-w-2xl leading-relaxed">
            {currentCompany.business_scope} | مدیرعامل: {currentCompany.ceo_name} | رئیس هیئت مدیره: {currentCompany.chairman_name}
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap gap-2">
          <button
            onClick={onOpenNewLetter}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 shadow-sm transition-transform active:scale-95 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-indigo-600" />
            ثبت نامه جدید
          </button>
          <button
            onClick={onOpenNewDocument}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs border border-white/20 transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            بایگانی سند
          </button>
        </div>

        {/* Background decorative watermark */}
        <div className="absolute -left-10 -bottom-10 opacity-10 pointer-events-none">
          <Building className="w-64 h-64 text-white" />
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Letters Card */}
        <div
          onClick={() => onNavigateTab('secretariat')}
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-300 shadow-xs hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">مکاتبات و نامه‌نگاری</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Mail className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-800">{letters.length}</span>
            <span className="text-xs text-slate-500">فقره نامه</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-amber-600 font-medium">امضا نشده: {pendingSignLetters}</span>
            <span className="text-emerald-600 font-medium">قفل و امضا شده: {lockedSignedLetters}</span>
          </div>
        </div>

        {/* Archive Card */}
        <div
          onClick={() => onNavigateTab('archive')}
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-300 shadow-xs hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">اسناد بایگانی و ضمایم</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Archive className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-800">{archiveDocs.length}</span>
            <span className="text-xs text-slate-500">پرونده فعال</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>اسکن امن و هش SHA-256</span>
            <span className="text-emerald-600 font-semibold">۱۰۰٪ ایزوله</span>
          </div>
        </div>

        {/* Financial Flow Card */}
        <div
          onClick={() => onNavigateTab('finance')}
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-amber-300 shadow-xs hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">گردش مالی شرکت</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-lg font-black text-slate-800 truncate block">
              {formatTomans(totalIncome - totalExpense)}
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-emerald-700">ورودی: {formatTomans(totalIncome)}</span>
          </div>
        </div>

        {/* Board & Governance Card */}
        <div
          onClick={() => onNavigateTab('board')}
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-purple-300 shadow-xs hover:shadow-sm transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">جلسات هیئت مدیره</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-800">{boardMeetings.length}</span>
            <span className="text-xs text-slate-500">جلسه برگزار/ثبت شده</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-indigo-600 font-medium">فاصله پیش‌فرض: ۱۵ روز</span>
            {upcomingMeeting && (
              <span className="text-slate-600 font-bold">{upcomingMeeting.scheduled_date}</span>
            )}
          </div>
        </div>
      </div>

      {/* Two Column Layout: Quick Actions & Tenant Security Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Quick Actions & Operational Stats */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions Panel */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200">
            <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-600" />
              عملیات پرکاربرد سازمانی برای {currentCompany.trade_name}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={onOpenNewLetter}
                className="p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/70 border border-slate-200 hover:border-indigo-200 text-right transition-colors cursor-pointer group"
              >
                <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <Mail className="w-4 h-4" />
                </div>
                <p className="text-xs font-bold text-slate-800">صدور نامه رسمی</p>
                <p className="text-[10px] text-slate-500 mt-0.5">با سربرگ، مهر و QR</p>
              </button>

              <button
                onClick={onOpenNewDocument}
                className="p-3 rounded-xl bg-slate-50 hover:bg-emerald-50/70 border border-slate-200 hover:border-emerald-200 text-right transition-colors cursor-pointer group"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <Archive className="w-4 h-4" />
                </div>
                <p className="text-xs font-bold text-slate-800">بارگذاری پرونده</p>
                <p className="text-[10px] text-slate-500 mt-0.5">اسکن امن بدافزار</p>
              </button>

              <button
                onClick={onOpenNewVoucher}
                className="p-3 rounded-xl bg-slate-50 hover:bg-amber-50/70 border border-slate-200 hover:border-amber-200 text-right transition-colors cursor-pointer group"
              >
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <FileSignature className="w-4 h-4" />
                </div>
                <p className="text-xs font-bold text-slate-800">ثبت سند حسابداری</p>
                <p className="text-[10px] text-slate-500 mt-0.5">دریافت، پرداخت، تنخواه</p>
              </button>

              <button
                onClick={onOpenNewMeeting}
                className="p-3 rounded-xl bg-slate-50 hover:bg-purple-50/70 border border-slate-200 hover:border-purple-200 text-right transition-colors cursor-pointer group"
              >
                <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <Calendar className="w-4 h-4" />
                </div>
                <p className="text-xs font-bold text-slate-800">تشکیل جلسه هیئت</p>
                <p className="text-[10px] text-slate-500 mt-0.5">دوره‌ای ۱۵ روزه</p>
              </button>
            </div>
          </div>

          {/* Project & Job Generation Insights */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                پروژه‌های جاری و آمار اشتغال‌زایی شرکت
              </h2>
              <button
                onClick={() => onNavigateTab('projects')}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
              >
                مشاهده همه
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
                <span className="text-[11px] font-semibold text-emerald-800">اشتغال مستقیم ایجاد شده</span>
                <p className="text-2xl font-black text-emerald-700 mt-1">{totalDirectJobs} نفر</p>
                <p className="text-[10px] text-emerald-600 mt-1">تیم‌های فنی، مهندسی، ستادی و کارگاهی</p>
              </div>

              <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100">
                <span className="text-[11px] font-semibold text-blue-800">اشتغال غیرمستقیم ایجاد شده</span>
                <p className="text-2xl font-black text-blue-700 mt-1">{totalIndirectJobs} نفر</p>
                <p className="text-[10px] text-blue-600 mt-1">پیمانکاران، زنجیره تأمین و خدمات جانبی</p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {projects.map((proj) => (
                <div
                  key={proj.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 truncate">{proj.name}</p>
                    <p className="text-[10px] text-slate-500">کارفرما: {proj.client_name} | مدیر: {proj.project_manager_name}</p>
                  </div>
                  <div className="text-left shrink-0">
                    <span className="font-bold text-indigo-700">{proj.progress_percent}٪ پیشرفت</span>
                    <div className="w-24 bg-slate-200 rounded-full h-1.5 mt-1 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-1.5 rounded-full"
                        style={{ width: `${proj.progress_percent}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Tenant Identity Details & Real-Time Audit Log */}
        <div className="space-y-6">
          {/* Identity & Legal Info Box */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200">
            <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Building className="w-4 h-4 text-slate-600" />
              شناسنامه ثبتی و قانونی شرکت
            </h2>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">شناسه ملی:</span>
                <span className="font-mono font-bold text-slate-800">{currentCompany.national_id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">شماره ثبت:</span>
                <span className="font-mono font-bold text-slate-800">{currentCompany.registration_number}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">کد اقتصادی:</span>
                <span className="font-mono font-bold text-slate-800">{currentCompany.economic_code}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">کد کارگاه بیمه:</span>
                <span className="font-mono font-bold text-slate-800">{currentCompany.workshop_code}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">تلفن رسمی:</span>
                <span className="font-bold text-slate-800">{currentCompany.phone}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">کد پستی:</span>
                <span className="font-mono font-bold text-slate-800">{currentCompany.postal_code}</span>
              </div>
            </div>
          </div>

          {/* Audit Stream for current tenant */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                رویدادهای امنیتی اخیر شرکت
              </h2>
            </div>
            <div className="space-y-3">
              {auditLogs.slice(0, 4).map((log) => {
                const isForbidden = log.status === 'forbidden_attempt';
                return (
                  <div
                    key={log.id}
                    className={`p-2.5 rounded-xl border text-xs ${
                      isForbidden
                        ? 'bg-rose-50/80 border-rose-200 text-rose-900'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between font-medium">
                      <span className="font-bold truncate">{log.user_name}</span>
                      <span className="text-[10px] text-slate-400">{log.timestamp}</span>
                    </div>
                    <p className="text-[11px] mt-1 font-semibold">{log.details || log.action}</p>
                    {isForbidden && (
                      <div className="mt-1 text-[10px] text-rose-700 bg-rose-100/70 p-1 rounded-md font-mono">
                        {log.failure_reason}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
