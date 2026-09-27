import React, { useState } from 'react';
import {
  Building2,
  ChevronDown,
  Wifi,
  WifiOff,
  QrCode,
  ShieldCheck,
  Database,
  RefreshCw,
  Bell,
  Search,
  User,
  Smartphone,
  Layers,
} from 'lucide-react';
import { Company, User as UserType, CompanyMembership } from '../types';

interface HeaderProps {
  currentCompany: Company;
  currentUser: UserType;
  currentMembership?: CompanyMembership;
  companies: Company[];
  isOffline: boolean;
  pendingSyncCount: number;
  onSwitchCompany: (companyId: string) => void;
  onToggleOffline: () => void;
  onOpenQrVerify: () => void;
  onOpenAuditLogs: () => void;
  onOpenBackup: () => void;
  onSyncNow: () => void;
  onGlobalSearch: (query: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentCompany,
  currentUser,
  currentMembership,
  companies,
  isOffline,
  pendingSyncCount,
  onSwitchCompany,
  onToggleOffline,
  onOpenQrVerify,
  onOpenAuditLogs,
  onOpenBackup,
  onSyncNow,
  onGlobalSearch,
  activeTab,
  setActiveTab,
}) => {
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  const getRoleTitle = (role?: string) => {
    switch (role) {
      case 'super_admin':
        return 'مدیر کل و راهبر ارشد سامانه';
      case 'company_admin':
        return 'مدیرعامل شرکت';
      case 'financial_manager':
        return 'مدیر امور مالی';
      case 'secretary':
        return 'مسئول دبیرخانه';
      case 'archivist':
        return 'مدیر بایگانی';
      case 'board_member':
        return 'عضو هیئت مدیره';
      case 'shareholder':
        return 'سهامدار';
      default:
        return 'کاربر سازمانی';
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      onGlobalSearch(searchVal.trim());
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Right Section: Active Company Picker with brand badge */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setShowCompanyDropdown(!showCompanyDropdown)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-right group shadow-2xs cursor-pointer"
                title="تغییر شرکت فعال (Multi-Tenant Context)"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-xs transition-transform group-hover:scale-105"
                  style={{ backgroundColor: currentCompany.brand_color }}
                >
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs sm:text-sm text-slate-800 leading-tight">
                      {currentCompany.trade_name}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium border border-emerald-200">
                      شرکت فعال
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    شناسه ملی: {currentCompany.national_id}
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-transform mr-1" />
              </button>

              {/* Company Switcher Dropdown */}
              {showCompanyDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-500">انتخاب شرکت مستقل (Multi-Tenant)</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      با انتخاب هر شرکت، تمام اسناد، داده‌ها و کلیدهای آن به صورت کاملاً ایزوله بارگذاری می‌شوند.
                    </p>
                  </div>
                  <div className="max-h-64 overflow-y-auto p-1.5 space-y-1">
                    {companies.map((comp) => {
                      const isSelected = comp.id === currentCompany.id;
                      return (
                        <button
                          key={comp.id}
                          onClick={() => {
                            onSwitchCompany(comp.id);
                            setShowCompanyDropdown(false);
                          }}
                          className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-right transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-50/70 border border-indigo-200'
                              : 'hover:bg-slate-50 border border-transparent'
                          }`}
                        >
                          <div
                            className="w-7 h-7 rounded-md flex items-center justify-center text-white text-xs font-bold shrink-0"
                            style={{ backgroundColor: comp.brand_color }}
                          >
                            {comp.short_name[0]}
                          </div>
                          <div className="grow min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate">{comp.legal_name}</p>
                            <p className="text-[10px] text-slate-500 truncate">
                              کد کارگاه: {comp.workshop_code} | ش.ثبت: {comp.registration_number}
                            </p>
                          </div>
                          {isSelected && (
                            <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0"></span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Switch to Android View or Architecture */}
            <div className="hidden lg:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab !== 'android_sim' && activeTab !== 'android_code'
                    ? 'bg-white text-indigo-700 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                پنل مدیریت وب
              </button>
              <button
                onClick={() => setActiveTab('android_sim')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'android_sim'
                    ? 'bg-indigo-600 text-white shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                شبیه‌ساز اندروید
              </button>
            </div>
          </div>

          {/* Middle: Global Search */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-2">
            <form onSubmit={handleSearchSubmit} className="w-full relative">
              <input
                type="text"
                placeholder="جستجوی شماره نامه، پرونده بایگانی، مصوبه یا طرف‌حساب..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="w-full bg-slate-100 hover:bg-slate-50 focus:bg-white text-xs text-slate-800 placeholder-slate-400 pl-8 pr-9 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-hidden"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              {searchVal && (
                <button
                  type="submit"
                  className="absolute left-2.5 top-1.5 text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-md hover:bg-indigo-700"
                >
                  بیاب
                </button>
              )}
            </form>
          </div>

          {/* Left Section: Offline state, QR Scan, Audit, Backup, Profile */}
          <div className="flex items-center gap-2">
            {/* Offline Simulation Toggle */}
            <button
              onClick={onToggleOffline}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                isOffline
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100/50'
              }`}
              title={isOffline ? 'وضعیت: آفلاین (داده‌ها در صف ذخیره محلی Room)' : 'وضعیت: برخط (متصل به سرور مرکزی)'}
            >
              {isOffline ? (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                  <span className="hidden sm:inline">حالت آفلاین</span>
                  {pendingSyncCount > 0 && (
                    <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                      {pendingSyncCount}
                    </span>
                  )}
                </>
              ) : (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden sm:inline">برخط (Online)</span>
                </>
              )}
            </button>

            {/* Sync Now button if queue has items */}
            {pendingSyncCount > 0 && !isOffline && (
              <button
                onClick={onSyncNow}
                className="flex items-center gap-1 px-2 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors cursor-pointer"
                title="همگام‌سازی فوری صف تغییرات آفلاین"
              >
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span className="text-[11px]">Sync ({pendingSyncCount})</span>
              </button>
            )}

            {/* QR Code Verifier Modal Trigger */}
            <button
              onClick={onOpenQrVerify}
              className="p-2 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-slate-100 border border-slate-200/80 transition-colors cursor-pointer"
              title="استعلام و اعتبارسنجی QR Code سند"
            >
              <QrCode className="w-4 h-4" />
            </button>

            {/* Audit Log Modal Trigger */}
            <button
              onClick={onOpenAuditLogs}
              className="p-2 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-slate-100 border border-slate-200/80 transition-colors cursor-pointer"
              title="لاگ ممیزی و رویدادهای امنیتی (Audit Log)"
            >
              <ShieldCheck className="w-4 h-4" />
            </button>

            {/* Backup & Restore Modal Trigger */}
            <button
              onClick={onOpenBackup}
              className="p-2 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-slate-100 border border-slate-200/80 transition-colors cursor-pointer"
              title="پشتیبان‌گیری و بازیابی داده‌ها (Backup & Restore)"
            >
              <Database className="w-4 h-4" />
            </button>

            {/* User Profile Capsule */}
            <div className="flex items-center gap-2 border-r border-slate-200 pr-2 mr-1">
              <img
                src={currentUser.profile_image_url}
                alt={currentUser.first_name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-100"
              />
              <div className="hidden xl:block text-right">
                <p className="text-xs font-bold text-slate-800 leading-tight">
                  {currentUser.first_name} {currentUser.last_name}
                </p>
                <p className="text-[10px] text-slate-500 font-medium">
                  {currentMembership?.position_title || getRoleTitle(currentMembership?.role)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
