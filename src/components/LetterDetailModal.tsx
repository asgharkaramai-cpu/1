import React, { useState } from 'react';
import {
  X,
  Printer,
  FileCheck2,
  Lock,
  QrCode,
  ShieldAlert,
  Paperclip,
  PenTool,
  Download,
  AlertTriangle,
  History,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import { Letter, Company, User, Attachment } from '../types';
import { SecurityEngine } from '../services/securityEngine';

interface LetterDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  letter: Letter;
  currentCompany: Company;
  currentUser: User;
  attachments: Attachment[];
  onOpenSignPad: () => void;
  onVerifyQr: (token: string) => void;
}

export const LetterDetailModal: React.FC<LetterDetailModalProps> = ({
  isOpen,
  onClose,
  letter,
  currentCompany,
  currentUser,
  attachments,
  onOpenSignPad,
  onVerifyQr,
}) => {
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadAttachment = (att: Attachment) => {
    // Multi-tenant check
    const check = SecurityEngine.assertTenantAccess(
      currentCompany.id,
      att.company_id,
      'download_attachment',
      'secretariat',
      att.id,
      { id: currentUser.id, name: currentUser.first_name, role: 'user' }
    );

    if (!check.allowed) {
      alert(check.messageFa);
      return;
    }

    setDownloadNotice(`لینک امن دانلود موقت صادر شد: ${att.storage_path} (اعتبار: ۱۵ دقیقه)`);
    setTimeout(() => setDownloadNotice(null), 5000);
  };

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'critical':
        return <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded-md font-bold text-[10px]">آنی و بسیار مهم</span>;
      case 'instant':
        return <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md font-bold text-[10px]">فوری</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md text-[10px]">عادی</span>;
    }
  };

  const getConfidentialityBadge = (c: string) => {
    switch (c) {
      case 'top_secret':
        return <span className="bg-red-800 text-white px-2 py-0.5 rounded-md font-bold text-[10px]">به‌کلی سری</span>;
      case 'secret':
        return <span className="bg-rose-700 text-white px-2 py-0.5 rounded-md font-bold text-[10px]">خیلی محرمانه</span>;
      case 'confidential':
        return <span className="bg-amber-700 text-white px-2 py-0.5 rounded-md font-bold text-[10px]">محرمانه</span>;
      default:
        return <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md text-[10px]">عادی</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-4 flex flex-col max-h-[92vh]">
        {/* Modal Top Bar (Hidden in Print) */}
        <div className="no-print flex items-center justify-between p-3.5 bg-slate-100 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs text-slate-700">پیش‌نمایش نامه رسمی سربرگ‌دار</span>
            <span className="font-mono text-xs px-2 py-0.5 bg-white rounded-md border border-slate-300 font-bold">
              {letter.letter_number}
            </span>
            {letter.is_locked ? (
              <span className="flex items-center gap-1 text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-medium">
                <Lock className="w-3 h-3 text-emerald-600" />
                سند قفل و امضا شده
              </span>
            ) : (
              <span className="text-[11px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md font-medium">
                پیش‌نویس / در انتظار امضا
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!letter.is_locked && (
              <button
                onClick={onOpenSignPad}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                <PenTool className="w-3.5 h-3.5" />
                امضای دیجیتال و قفل سند
              </button>
            )}

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-200/80 border border-slate-300 text-slate-700 rounded-xl text-xs font-medium transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              چاپ / خروجی PDF
            </button>

            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {downloadNotice && (
          <div className="no-print bg-indigo-50 border-b border-indigo-200 p-2 text-indigo-900 text-xs text-center font-mono">
            {downloadNotice}
          </div>
        )}

        {/* The Printable Letter Sheet (A4-like Aspect) */}
        <div className="overflow-y-auto p-6 sm:p-10 bg-slate-50/50 flex justify-center">
          <div className="w-full max-w-2xl bg-white p-8 sm:p-12 shadow-sm rounded-xl border border-slate-200 text-slate-900 space-y-6 relative print:shadow-none print:border-none print:p-0">
            {/* 1. Official Letterhead (سربرگ رسمی شرکت) */}
            <div className="border-b-2 border-slate-800 pb-5">
              <div className="flex items-start justify-between">
                {/* Right: Company Logo & Identity */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-xs"
                    style={{ backgroundColor: currentCompany.brand_color }}
                  >
                    {currentCompany.short_name.substring(0, 2)}
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-slate-900">
                      {currentCompany.legal_name}
                    </h2>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      شماره ثبت: {currentCompany.registration_number} | شناسه ملی: {currentCompany.national_id}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      کد کارگاه تأمین اجتماعی: {currentCompany.workshop_code}
                    </p>
                  </div>
                </div>

                {/* Left: Metadata Box */}
                <div className="text-left text-xs space-y-1 font-mono">
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-slate-500 text-[11px]">شماره:</span>
                    <span className="font-bold text-slate-900">{letter.letter_number}</span>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-slate-500 text-[11px]">تاریخ:</span>
                    <span className="font-semibold text-slate-900">{letter.letter_date}</span>
                  </div>
                  <div className="flex items-center justify-end gap-2 text-[10px] text-slate-400">
                    <span>تاریخ میلادی:</span>
                    <span>{letter.letter_date_gregorian}</span>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-slate-500 text-[11px]">پیوست:</span>
                    <span className="font-semibold text-slate-900">
                      {letter.attachments_count > 0 ? `${letter.attachments_count} برگ/فایل` : 'ندارد'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status and Priority badges strip */}
              <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 text-[11px]">اولویت:</span>
                  {getPriorityBadge(letter.priority)}
                  <span className="text-slate-500 text-[11px] mr-2">طبقه‌بندی:</span>
                  {getConfidentialityBadge(letter.confidentiality_level)}
                </div>

                <div className="text-[11px] text-slate-500 font-mono">
                  کد دبیرخانه: {letter.secretariat_registration_number}
                </div>
              </div>
            </div>

            {/* 2. Recipient, Subject */}
            <div className="space-y-3 pt-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="font-bold text-slate-700 shrink-0">به:</span>
                <span className="font-bold text-slate-900">{letter.receiver_name}</span>
              </div>

              <div className="flex items-start gap-2">
                <span className="font-bold text-slate-700 shrink-0">از:</span>
                <span className="text-slate-800">{letter.sender_name}</span>
              </div>

              <div className="flex items-start gap-2 bg-slate-100/60 p-2.5 rounded-lg border border-slate-200/80">
                <span className="font-bold text-indigo-900 shrink-0">موضوع:</span>
                <span className="font-extrabold text-indigo-950">{letter.subject}</span>
              </div>
            </div>

            {/* 3. Letter Body */}
            <div className="py-4 text-justify text-slate-800 text-sm sm:text-base leading-loose whitespace-pre-line min-h-[140px]">
              {letter.body}
            </div>

            {/* 4. Response Deadline notice if any */}
            {letter.response_deadline && (
              <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200 text-xs text-amber-900">
                <strong>مهلت اقدام/پاسخ:</strong> حداکثر تا تاریخ {letter.response_deadline}
              </div>
            )}

            {/* 5. Signatures, Official Stamp, and QR Code Verification Box */}
            <div className="pt-6 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-6 items-end">
              {/* QR Verification Token */}
              <div className="flex flex-col items-center sm:items-start text-center sm:text-right space-y-1">
                <div
                  onClick={() => onVerifyQr(letter.qr_code_token)}
                  className="p-2 bg-white rounded-lg border-2 border-slate-300 shadow-2xs hover:border-indigo-500 transition-colors cursor-pointer group"
                  title="کلیک جهت استعلام صحت سند در سرور"
                >
                  <QrCode className="w-16 h-16 text-slate-800 group-hover:text-indigo-600 transition-colors" />
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  توکن استعلام: {letter.qr_code_token.substring(0, 14)}...
                </span>
                <button
                  type="button"
                  onClick={() => onVerifyQr(letter.qr_code_token)}
                  className="text-[10px] text-indigo-600 hover:underline font-bold"
                >
                  اعتبارسنجی اصالت سند
                </button>
              </div>

              {/* Company Official Stamp */}
              <div className="flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 rounded-full border-2 border-dashed border-indigo-400 p-2 flex flex-col items-center justify-center text-indigo-700 bg-indigo-50/40">
                  <Building2 className="w-6 h-6 mb-0.5 opacity-70" />
                  <span className="text-[9px] font-black">{currentCompany.short_name}</span>
                  <span className="text-[8px] font-bold">مهر رسمی شرکت</span>
                </div>
                <span className="text-[10px] text-slate-400 mt-1">مهر الکترونیک معتبر</span>
              </div>

              {/* Signer Box */}
              <div className="flex flex-col items-center sm:items-end text-center sm:text-left space-y-1">
                <p className="text-xs font-bold text-slate-800">
                  {letter.signed_by_user_name || currentCompany.ceo_name}
                </p>
                <p className="text-[11px] text-slate-500">{currentCompany.trade_name}</p>

                {letter.is_locked ? (
                  <div className="mt-1 p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-center">
                    <div className="flex items-center gap-1 text-emerald-800 text-xs font-bold justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>امضای الکترونیکی تأیید شد</span>
                    </div>
                    <span className="text-[9px] text-slate-400 block font-mono">
                      زمان: {letter.signed_at}
                    </span>
                    <span className="text-[8px] text-slate-400 block font-mono truncate max-w-[140px]">
                      هش: {letter.signature_hash?.substring(0, 16)}...
                    </span>
                  </div>
                ) : (
                  <div className="mt-2 text-center text-amber-700 text-xs border border-dashed border-amber-300 p-2 rounded-lg bg-amber-50/50">
                    در انتظار امضای مجاز
                  </div>
                )}
              </div>
            </div>

            {/* 6. CCs Footer */}
            {letter.cc_recipients && letter.cc_recipients.length > 0 && (
              <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                <strong>رونوشت:</strong> {letter.cc_recipients.join(' - ')}
              </div>
            )}

            {/* 7. Letterhead Footer: Address and Contact */}
            <div className="pt-3 border-t border-slate-200 text-[10px] text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-1 text-center">
              <span>نشانی: {currentCompany.head_office_address}</span>
              <span>تلفن: {currentCompany.phone} | وب‌سایت: {currentCompany.website}</span>
            </div>
          </div>
        </div>

        {/* Attachments Section in Modal (no-print) */}
        {attachments.length > 0 && (
          <div className="no-print p-4 bg-slate-100 border-t border-slate-200">
            <h4 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
              <Paperclip className="w-3.5 h-3.5 text-indigo-600" />
              فایل‌های پیوست ثبت‌شده در مخزن امن مستاجر:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200 text-xs shadow-2xs"
                >
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 truncate">{att.display_name}</p>
                    <p className="text-[10px] text-slate-400 font-mono truncate">{att.storage_path}</p>
                  </div>
                  <button
                    onClick={() => handleDownloadAttachment(att)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg text-[11px] shrink-0 transition-colors cursor-pointer"
                  >
                    <Download className="w-3 h-3" />
                    دانلود امن
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
