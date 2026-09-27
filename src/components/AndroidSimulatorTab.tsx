import React, { useState } from 'react';
import {
  Smartphone,
  Wifi,
  WifiOff,
  Battery,
  Signal,
  QrCode,
  Lock,
  Fingerprint,
  RefreshCw,
  Plus,
  Mail,
  Archive,
  Wallet,
  Calendar,
  Layers,
  CheckCircle2,
  FileCheck2,
  ArrowRight,
  ShieldAlert,
  Building,
} from 'lucide-react';
import { Company, User, Letter, OfflineSyncItem } from '../types';
import { SecurityEngine } from '../services/securityEngine';

interface AndroidSimulatorTabProps {
  currentCompany: Company;
  currentUser: User;
  letters: Letter[];
  isOffline: boolean;
  syncQueue: OfflineSyncItem[];
  onToggleOffline: () => void;
  onSyncQueueNow: () => void;
  onAddNewOfflineLetter: (subject: string, body: string, receiver: string) => void;
  onVerifyQr: (token: string) => void;
}

export const AndroidSimulatorTab: React.FC<AndroidSimulatorTabProps> = ({
  currentCompany,
  currentUser,
  letters,
  isOffline,
  syncQueue,
  onToggleOffline,
  onSyncQueueNow,
  onAddNewOfflineLetter,
  onVerifyQr,
}) => {
  const [mobileScreen, setMobileScreen] = useState<'home' | 'letters' | 'new_letter' | 'qr_scan' | 'biometric'>('letters');
  const [newSubj, setNewSubj] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newReceiver, setNewReceiver] = useState('');
  const [bioPrompt, setBioPrompt] = useState(false);
  const [bioSuccess, setBioSuccess] = useState(false);

  const handleSimulateCreateLetter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubj.trim() || !newReceiver.trim()) return;

    onAddNewOfflineLetter(newSubj.trim(), newBody.trim() || 'متن پیش‌فرض...', newReceiver.trim());
    setNewSubj('');
    setNewBody('');
    setNewReceiver('');
    setMobileScreen('letters');
  };

  const triggerBiometricAuth = () => {
    setBioPrompt(true);
    setBioSuccess(false);
    setTimeout(() => {
      setBioSuccess(true);
      setTimeout(() => {
        setBioPrompt(false);
        alert('احراز هویت بیومتریک (اثر انگشت) در محیط امن Android Keystore با موفقیت تأیید شد.');
      }, 1000);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner explaining Android implementation */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-800">
              شبیه‌ساز تعاملی کلاینت اندروید (Jetpack Compose & Offline-First)
            </h2>
            <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-bold border border-indigo-200">
              Kotlin 2.0 / Room DB
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            این شبیه‌ساز رفتار دقیق اپلیکیشن موبایل را در سناریوهای قطع اتصال اینترنت، صف همگام‌سازی WorkManager، و اعتبارسنجی چندمستاجری نشان می‌دهد.
          </p>
        </div>

        {/* Offline Controller & WorkManager Trigger */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleOffline}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              isOffline
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
            }`}
          >
            {isOffline ? <WifiOff className="w-4 h-4 text-amber-600" /> : <Wifi className="w-4 h-4 text-emerald-600" />}
            {isOffline ? 'شبیه‌سازی: اینترنت قطع است' : 'شبیه‌سازی: اینترنت متصل است'}
          </button>

          {syncQueue.length > 0 && !isOffline && (
            <button
              onClick={onSyncQueueNow}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              اجرای فوری WorkManager Sync ({syncQueue.length})
            </button>
          )}
        </div>
      </div>

      {/* Main Dual Pane: Phone Mockup on Left + Room / Sync Inspector on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Mobile Device Mockup */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="w-[340px] h-[670px] bg-slate-900 rounded-[48px] p-3 shadow-2xl border-4 border-slate-700 relative flex flex-col overflow-hidden">
            {/* Phone Notch & Speaker */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-4 bg-slate-950 rounded-full z-50 flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-slate-800 rounded-full mr-2"></div>
              <div className="w-10 h-1 bg-slate-800 rounded-full"></div>
            </div>

            {/* Screen Inner Frame */}
            <div className="w-full h-full bg-slate-50 rounded-[38px] overflow-hidden flex flex-col relative text-slate-800">
              {/* Android Status Bar */}
              <div className="h-7 bg-slate-900 text-white px-5 flex items-center justify-between text-[11px] pt-1 select-none z-40">
                <span className="font-mono font-bold">10:45</span>
                <div className="flex items-center gap-1.5">
                  {isOffline ? (
                    <WifiOff className="w-3 h-3 text-amber-400" />
                  ) : (
                    <Wifi className="w-3 h-3 text-emerald-400" />
                  )}
                  <Signal className="w-3 h-3 text-white" />
                  <Battery className="w-3.5 h-3.5 text-white" />
                </div>
              </div>

              {/* App Top Bar */}
              <div
                className="p-3 text-white shadow-xs z-30 transition-colors"
                style={{ backgroundColor: currentCompany.brand_color }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-md bg-white/20 flex items-center justify-center text-xs font-bold">
                      {currentCompany.short_name[0]}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold leading-tight">{currentCompany.trade_name}</h4>
                      <span className="text-[9px] text-white/80 block">اتوماسیون همراه (Jetpack)</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={triggerBiometricAuth}
                      className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-white text-[10px]"
                      title="شبیه‌سازی احراز هویت با اثر انگشت"
                    >
                      <Fingerprint className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setMobileScreen('qr_scan')}
                      className="p-1 rounded-md bg-white/10 hover:bg-white/20 text-white text-[10px]"
                      title="اسکن دوربین و بارکد"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Offline Notification Strip inside Mobile App */}
                {isOffline && (
                  <div className="mt-2 py-0.5 px-2 bg-amber-500/90 rounded-md text-[10px] text-white flex items-center justify-between font-medium">
                    <span>حالت آفلاین (ذخیره در دیتابیس Room)</span>
                    <span className="font-bold">صف: {syncQueue.length}</span>
                  </div>
                )}
              </div>

              {/* Mobile Body Content */}
              <div className="flex-1 overflow-y-auto p-3 text-xs space-y-3">
                {mobileScreen === 'letters' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700 text-xs">صندوق نامه‌های جاری</span>
                      <button
                        onClick={() => setMobileScreen('new_letter')}
                        className="flex items-center gap-1 px-2 py-1 bg-indigo-600 text-white rounded-lg text-[10px] font-bold"
                      >
                        <Plus className="w-3 h-3" />
                        ثبت آفلاین
                      </button>
                    </div>

                    <div className="space-y-2">
                      {letters.map((l) => (
                        <div
                          key={l.id}
                          className="p-2.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[10px] font-bold text-indigo-700">
                              {l.letter_number}
                            </span>
                            <span className="text-[9px] text-slate-400 font-mono">{l.letter_date}</span>
                          </div>
                          <p className="font-bold text-slate-800 text-[11px] truncate">{l.subject}</p>
                          <p className="text-[10px] text-slate-500 truncate">گیرنده: {l.receiver_name}</p>
                          <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[9px]">
                            <span className="text-slate-400">{l.priority === 'critical' ? 'آنی' : 'عادی'}</span>
                            {l.is_locked ? (
                              <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                امضا شده
                              </span>
                            ) : (
                              <span className="text-amber-600">پیش‌نویس</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {mobileScreen === 'new_letter' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700">ثبت پیش‌نویس جدید</span>
                      <button
                        onClick={() => setMobileScreen('letters')}
                        className="text-slate-400 hover:text-slate-600 text-[10px]"
                      >
                        بازگشت
                      </button>
                    </div>

                    <form onSubmit={handleSimulateCreateLetter} className="space-y-2 text-[11px]">
                      <div>
                        <label className="block text-slate-600 mb-0.5">گیرنده:</label>
                        <input
                          type="text"
                          required
                          placeholder="نام مخاطب..."
                          value={newReceiver}
                          onChange={(e) => setNewReceiver(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-lg p-1.5"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 mb-0.5">موضوع:</label>
                        <input
                          type="text"
                          required
                          placeholder="موضوع نامه..."
                          value={newSubj}
                          onChange={(e) => setNewSubj(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-lg p-1.5"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-600 mb-0.5">متن نامه:</label>
                        <textarea
                          rows={3}
                          placeholder="متن..."
                          value={newBody}
                          onChange={(e) => setNewBody(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-lg p-1.5"
                        />
                      </div>

                      <div className="p-2 bg-amber-50 rounded-lg text-amber-900 text-[10px] leading-relaxed">
                        {isOffline
                          ? 'دستگاه آفلاین است؛ نامه بلافاصله در Room DB ذخیره شده و پس از برقراری اینترنت همگام‌سازی می‌شود.'
                          : 'دستگاه متصل است؛ نامه همزمان در پایگاه داده محلی و سرور ثبت می‌شود.'}
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 bg-indigo-600 text-white rounded-xl font-bold shadow-xs text-xs"
                      >
                        ذخیره در پایگاه داده دستگاه
                      </button>
                    </form>
                  </div>
                )}

                {mobileScreen === 'qr_scan' && (
                  <div className="text-center space-y-3 py-4">
                    <div className="w-48 h-48 mx-auto border-2 border-dashed border-indigo-400 rounded-2xl flex flex-col items-center justify-center p-4 bg-slate-900/5 relative overflow-hidden">
                      <div className="w-full h-0.5 bg-indigo-600 absolute animate-pulse top-1/2"></div>
                      <QrCode className="w-16 h-16 text-indigo-600 mb-2" />
                      <span className="text-[10px] text-slate-500">دوربین CameraX در حال پویش QR Code سند</span>
                    </div>

                    <div className="space-y-1">
                      <button
                        onClick={() => {
                          if (letters.length > 0) {
                            onVerifyQr(letters[0].qr_code_token);
                            setMobileScreen('letters');
                          }
                        }}
                        className="w-full py-1.5 bg-indigo-600 text-white font-bold rounded-lg text-[11px]"
                      >
                        شبیه‌سازی اسکن موفق QR نامه اول
                      </button>
                      <button
                        onClick={() => setMobileScreen('letters')}
                        className="w-full py-1 bg-slate-200 text-slate-700 rounded-lg text-[11px]"
                      >
                        بستن دوربین
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Biometric Prompt Dialog Overlay */}
              {bioPrompt && (
                <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
                  <div className="bg-white rounded-2xl p-5 w-64 text-center space-y-3">
                    <div className="w-14 h-14 mx-auto rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Fingerprint className={`w-8 h-8 ${bioSuccess ? 'text-emerald-600' : 'animate-pulse'}`} />
                    </div>
                    <div>
                      <h5 className="font-bold text-xs text-slate-800">احراز هویت بیومتریک</h5>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {bioSuccess ? 'اثر انگشت با موفقیت تأیید شد' : 'انگشت خود را روی حسگر قرار دهید'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Android Navigation Bar */}
              <div className="h-10 bg-slate-100 border-t border-slate-200 flex items-center justify-around px-8">
                <button
                  onClick={() => setMobileScreen('letters')}
                  className="w-4 h-4 border border-slate-400 rounded-xs hover:bg-slate-300"
                ></button>
                <button
                  onClick={() => setMobileScreen('letters')}
                  className="w-4 h-4 rounded-full border border-slate-400 hover:bg-slate-300"
                ></button>
                <button
                  onClick={() => setMobileScreen('letters')}
                  className="w-3 h-3 border-r-2 border-b-2 border-slate-400 rotate-45 hover:bg-slate-300"
                ></button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Pane: Room Database & Offline Architecture Inspection */}
        <div className="lg:col-span-6 space-y-4">
          {/* Room DB Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                پایگاه داده محلی Room با رمزنگاری SQLCipher
              </h3>
              <span className="text-[10px] bg-slate-100 text-slate-600 font-mono px-2 py-0.5 rounded-md">
                AES-256 GCM
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              تمام اطلاعات آفلاین در دستگاه بر اساس <code className="font-bold text-indigo-700">company_id</code> پارتیشن‌بندی شده و با کلید ذخیره‌شده در Android Keystore رمزنگاری می‌شوند.
            </p>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">شرکت فعال در SQLite:</span>
                <span className="font-bold text-slate-800">{currentCompany.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">تعداد رکوردهای محلی:</span>
                <span className="font-bold text-slate-800">{letters.length} رکورد</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">آیتم‌های در انتظار Sync:</span>
                <span className="font-bold text-amber-600">{syncQueue.length} مورد</span>
              </div>
            </div>
          </div>

          {/* Sync Queue Inspector */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-amber-600" />
                صف همگام‌سازی پس‌زمینه (WorkManager Queue)
              </h3>
              {syncQueue.length > 0 && !isOffline && (
                <button
                  onClick={onSyncQueueNow}
                  className="text-xs text-indigo-600 hover:underline font-bold"
                >
                  همگام‌سازی همه
                </button>
              )}
            </div>

            {syncQueue.length === 0 ? (
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl text-center text-xs text-emerald-800">
                ✓ تمام داده‌های محلی دستگاه با سرور مرکزی کاملاً همگام هستند.
              </div>
            ) : (
              <div className="space-y-2">
                {syncQueue.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 text-xs flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-slate-800">
                        {item.operation.toUpperCase()}: {item.entity_type}
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                        شناسه: {item.entity_id} | زمان: {item.created_at}
                      </p>
                    </div>
                    <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded-md font-bold">
                      در صف ارسال
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Android Architecture Highlights */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2 text-xs">
            <h4 className="font-bold text-slate-800 flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-emerald-600" />
              الزامات پیاده‌سازی شده در پشته اندروید:
            </h4>
            <ul className="list-disc list-inside space-y-1 text-slate-600">
              <li>رابط کاربری مدرن Declarative بر پایه <strong>Jetpack Compose</strong> با چیدمان راست‌چین کامل (RTL).</li>
              <li>مدل معماری لایه‌ای <strong>Clean Architecture + MVVM</strong> با تزریق وابستگی <strong>Hilt</strong>.</li>
              <li>ذخیره امن توکن‌ها در <strong>EncryptedSharedPreferences</strong> و محافظت با سخت‌افزار <strong>Keystore</strong>.</li>
              <li>اینترسپتور اختصاصی جهت درج خودکار <code className="font-mono text-indigo-700">X-Company-Id</code> در هدر تمام درخواست‌های Retrofit.</li>
              <li>سرویس پس‌زمینه <strong>WorkManager</strong> جهت همگام‌سازی بدون قطعی در صورت برگشت اتصال.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
