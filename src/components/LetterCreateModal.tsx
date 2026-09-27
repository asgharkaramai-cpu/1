import React, { useState } from 'react';
import { X, Send, Paperclip, AlertCircle, Shield, Check } from 'lucide-react';
import { Company, User, Letter, LetterDirection, LetterPriority, ConfidentialityLevel } from '../types';
import { SecurityEngine } from '../services/securityEngine';

interface LetterCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (letter: Letter, uploadedFiles: File[]) => void;
  currentCompany: Company;
  currentUser: User;
  nextLetterNumber: string;
}

export const LetterCreateModal: React.FC<LetterCreateModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentCompany,
  currentUser,
  nextLetterNumber,
}) => {
  const [direction, setDirection] = useState<LetterDirection>('outgoing');
  const [letterType, setLetterType] = useState('اداری');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [senderName, setSenderName] = useState(
    `${currentUser.first_name} ${currentUser.last_name} (${currentCompany.trade_name})`
  );
  const [ccRecipients, setCcRecipients] = useState('');
  const [priority, setPriority] = useState<LetterPriority>('normal');
  const [confidentiality, setConfidentiality] = useState<ConfidentialityLevel>('normal');
  const [responseDeadline, setResponseDeadline] = useState('۱۴۰۵/۰۷/۲۰');
  const [keywords, setKeywords] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      // Validate each file through SecurityEngine
      for (const f of selected) {
        const check = SecurityEngine.validateUploadedFile(
          f.name,
          f.size,
          f.type,
          currentCompany.id,
          'secretariat',
          'pending'
        );
        if (!check.isValid) {
          setFileError(check.errorMessageFa || 'فایل غیرمجاز است.');
          return;
        }
      }
      setFiles((prev) => [...prev, ...selected]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !body.trim() || !receiverName.trim()) {
      alert('لطفاً فیلدهای ستاره‌دار الزامی را تکمیل نمایید.');
      return;
    }

    const newLetterId = `let_${Date.now()}`;
    const newLetter: Letter = {
      id: newLetterId,
      company_id: currentCompany.id,
      letter_number: nextLetterNumber,
      secretariat_registration_number: `د-${Math.floor(1000 + Math.random() * 9000)}`,
      letter_type: letterType,
      direction,
      subject: subject.trim(),
      body: body.trim(),
      letter_date: SecurityEngine.getJalaliDateNow(),
      letter_date_gregorian: new Date().toISOString().split('T')[0],
      sender_name: senderName.trim(),
      receiver_name: receiverName.trim(),
      cc_recipients: ccRecipients ? ccRecipients.split(',').map((s) => s.trim()) : [],
      responsible_user_name: `${currentUser.first_name} ${currentUser.last_name}`,
      organizational_unit: 'دبیرخانه مرکزی',
      priority,
      response_deadline: responseDeadline,
      response_status: 'pending',
      confidentiality_level: confidentiality,
      keywords: keywords ? keywords.split(',').map((s) => s.trim()) : [],
      status: 'pending_signature',
      qr_code_token: SecurityEngine.generateQrVerificationToken(currentCompany.id, newLetterId),
      is_locked: false,
      revision_number: 1,
      created_by: `${currentUser.first_name} ${currentUser.last_name}`,
      created_at: SecurityEngine.getJalaliDateTimeNow(),
      updated_at: SecurityEngine.getJalaliDateTimeNow(),
      attachments_count: files.length,
    };

    onSave(newLetter, files);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 text-white"
          style={{ backgroundColor: currentCompany.brand_color }}
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Send className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold">ثبت و صدور نامه سازمانی جدید</h3>
              <p className="text-[10px] text-white/80">
                در بستر ایزوله شرکت: {currentCompany.trade_name} | شماره اختصاصی: {nextLetterNumber}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Metadata Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
            <div>
              <label className="block text-slate-500 font-medium mb-1">نوع گردش نامه *</label>
              <select
                value={direction}
                onChange={(e) => setDirection(e.target.value as LetterDirection)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 font-medium"
              >
                <option value="outgoing">صادره (برون‌سازمانی)</option>
                <option value="incoming">وارده (دریافتی از خارج)</option>
                <option value="internal">داخلی (بین‌واحدی)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-500 font-medium mb-1">نوع سند/موضوع *</label>
              <select
                value={letterType}
                onChange={(e) => setLetterType(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 font-medium"
              >
                <option value="اداری">اداری و اجرایی</option>
                <option value="مالی">مالی و قراردادها</option>
                <option value="فنی">فنی و مهندسی</option>
                <option value="حقوقی">حقوقی و مراجع قانونی</option>
                <option value="حراست">حراست و امنیت</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-500 font-medium mb-1">شماره صادره در سربرگ</label>
              <input
                type="text"
                disabled
                value={nextLetterNumber}
                className="w-full bg-slate-200/80 border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-700"
              />
            </div>
          </div>

          {/* Sender & Receiver Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-700 font-bold mb-1">فرستنده *</label>
              <input
                type="text"
                required
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 font-medium"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">گیرنده (شخص یا سازمان) *</label>
              <input
                type="text"
                required
                placeholder="مثال: جناب آقای دکتر کریمی - معاونت محترم..."
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 font-medium"
              />
            </div>
          </div>

          {/* Subject */}
          <div className="text-xs">
            <label className="block text-slate-700 font-bold mb-1">موضوع نامه *</label>
            <input
              type="text"
              required
              placeholder="موضوع خلاصه، شفاف و رسمی نامه..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg p-2 font-medium"
            />
          </div>

          {/* Body */}
          <div className="text-xs">
            <label className="block text-slate-700 font-bold mb-1">متن اصلی نامه *</label>
            <textarea
              required
              rows={6}
              placeholder="متن نامه سازمانی با رعایت اصول نگارش رسمی..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg p-3 font-normal leading-relaxed"
            />
          </div>

          {/* CC & Response Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-600 font-medium mb-1">رونوشت‌ها (با کاما جدا کنید)</label>
              <input
                type="text"
                placeholder="مدیریت مالی، واحد حقوقی، بازرسی"
                value={ccRecipients}
                onChange={(e) => setCcRecipients(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">مهلت اقدام / پاسخ</label>
              <input
                type="text"
                value={responseDeadline}
                onChange={(e) => setResponseDeadline(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono"
              />
            </div>
          </div>

          {/* Priority & Confidentiality */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-600 font-medium mb-1">اولویت اقدام</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as LetterPriority)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2"
              >
                <option value="normal">عادی</option>
                <option value="instant">فوری</option>
                <option value="critical">آنی و بسیار مهم</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">سطح محرمانگی</label>
              <select
                value={confidentiality}
                onChange={(e) => setConfidentiality(e.target.value as ConfidentialityLevel)}
                className="w-full bg-white border border-slate-300 rounded-lg p-2"
              >
                <option value="normal">عادی</option>
                <option value="confidential">محرمانه</option>
                <option value="secret">خیلی محرمانه</option>
                <option value="top_secret">به‌کلی سری</option>
              </select>
            </div>
          </div>

          {/* Secure Attachment Dropzone */}
          <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5 text-indigo-600" />
                پیوست‌ها و ضمایم امن نامه
              </span>
              <span className="text-[10px] text-slate-500">
                بررسی بدافزار و مسدودسازی خودکار فایلهای اجرایی (EXE, APK, BAT)
              </span>
            </div>

            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="block w-full text-xs text-slate-500 file:mr-0 file:ml-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
            />

            {fileError && (
              <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-[11px] flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{fileError}</span>
              </div>
            )}

            {files.length > 0 && (
              <div className="space-y-1.5 pt-1">
                {files.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 text-[11px]"
                  >
                    <span className="font-mono truncate">{file.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">{(file.size / 1024).toFixed(0)} KB</span>
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="text-rose-600 hover:text-rose-800 font-bold px-1"
                      >
                        حذف
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 text-xs hover:bg-slate-100 transition-colors"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 shadow-sm transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              ثبت نامه در دبیرخانه و ارسال جهت امضا
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
