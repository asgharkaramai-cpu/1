import React from 'react';
import {
  LayoutDashboard,
  Mail,
  Archive,
  Wallet,
  Users2,
  CalendarCheck,
  FolderGit2,
  Smartphone,
  Code2,
  ShieldAlert,
  BookOpenText,
  FileCheck2,
  Lock,
} from 'lucide-react';
import { Company } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentCompany: Company;
  counters: {
    lettersCount: number;
    archiveCount: number;
    financeCount: number;
    meetingsCount: number;
    projectsCount: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  currentCompany,
  counters,
}) => {
  const navItems = [
    {
      id: 'dashboard',
      label: 'داشبورد مدیریتی',
      icon: LayoutDashboard,
      badge: null,
      section: 'اصلی',
    },
    {
      id: 'secretariat',
      label: 'دبیرخانه و نامه‌نگاری',
      icon: Mail,
      badge: counters.lettersCount,
      section: 'اصلی',
    },
    {
      id: 'archive',
      label: 'بایگانی امن و اسناد',
      icon: Archive,
      badge: counters.archiveCount,
      section: 'اصلی',
    },
    {
      id: 'finance',
      label: 'امور مالی و سهامداران',
      icon: Wallet,
      badge: counters.financeCount,
      section: 'عملیاتی',
    },
    {
      id: 'board',
      label: 'جلسات هیئت مدیره',
      icon: CalendarCheck,
      badge: counters.meetingsCount,
      section: 'عملیاتی',
    },
    {
      id: 'projects',
      label: 'پروژه‌ها و سرمایه‌گذاری مشترک',
      icon: FolderGit2,
      badge: counters.projectsCount,
      section: 'عملیاتی',
    },
    {
      id: 'android_sim',
      label: 'شبیه‌ساز اپلیکیشن اندروید',
      icon: Smartphone,
      badge: 'نسخه موبایل',
      highlight: true,
      section: 'فنی و پلتفرم',
    },
    {
      id: 'android_code',
      label: 'کد کلاینت Android و پکیج‌ها',
      icon: Code2,
      badge: 'APK & AAB',
      section: 'فنی و پلتفرم',
    },
    {
      id: 'security_tests',
      label: 'تست‌های امنیت و چندمستاجری',
      icon: ShieldAlert,
      badge: '۱۲ آزمون',
      section: 'فنی و پلتفرم',
    },
    {
      id: 'docs_api',
      label: 'مستندات معماری و Swagger API',
      icon: BookOpenText,
      badge: 'REST v1',
      section: 'فنی و پلتفرم',
    },
  ];

  return (
    <aside className="w-64 shrink-0 bg-white border-l border-slate-200 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between hidden md:flex">
      <div className="space-y-6">
        {/* Company Mini Card */}
        <div className="p-3 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/70 border border-slate-200/80">
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-xs shrink-0"
              style={{ backgroundColor: currentCompany.brand_color }}
            >
              {currentCompany.short_name.substring(0, 2)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate leading-tight">
                {currentCompany.trade_name}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <Lock className="w-2.5 h-2.5 text-slate-400" />
                <span className="text-[10px] text-slate-500 font-mono">
                  {currentCompany.id}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-600">
            <span>نوع شخصیت:</span>
            <span className="font-semibold text-slate-800">{currentCompany.legal_type}</span>
          </div>
        </div>

        {/* Navigation Groups */}
        <nav className="space-y-1">
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const showSectionTitle =
              idx === 0 || item.section !== navItems[idx - 1].section;

            return (
              <React.Fragment key={item.id}>
                {showSectionTitle && (
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 pt-3 pb-1">
                    {item.section}
                  </p>
                )}
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs shadow-indigo-200 font-semibold'
                      : item.highlight
                      ? 'text-indigo-700 bg-indigo-50/60 hover:bg-indigo-100/70 border border-indigo-200/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive
                          ? 'text-white'
                          : item.highlight
                          ? 'text-indigo-600'
                          : 'text-slate-500'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge !== null && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold shrink-0 ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : item.highlight
                          ? 'bg-indigo-200 text-indigo-900'
                          : 'bg-slate-200/80 text-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* Footer Info & Security Level Badge */}
      <div className="pt-4 border-t border-slate-100">
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-right">
          <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-bold">
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>ایزولاسیون کامل Tenant فعال</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
            هیچ داده، ضمیمه یا لاگی میان مستاجران به اشتراک گذاشته نمی‌شود.
          </p>
        </div>
      </div>
    </aside>
  );
};
