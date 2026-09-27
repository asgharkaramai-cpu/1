import React, { useState } from 'react';
import { QrCode, CheckCircle2, XCircle, Search, ShieldCheck, FileCheck } from 'lucide-react';
import { storage } from '../services/storage';
import { Company, User } from '../types';

interface QrVerifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialToken?: string;
  currentCompany: Company;
  currentUser: User;
}

export const QrVerifyModal: React.FC<QrVerifyModalProps> = ({
  isOpen,
  onClose,
  initialToken = '',
  currentCompany,
  currentUser,
}) => {
  const [tokenInput, setTokenInput] = useState(initialToken);
  const [verificationResult, setVerificationResult] = useState<{
    status: 'success' | 'invalid' | 'cross_tenant';
    title: string;
    details: string;
    recordCompanyTradeName?: string;
    date?: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleVerify = (tokenToTest: string) => {
    const token = tokenToTest.trim();
    if (!token) return;

    // Check letters
    const letters = storage.getLetters();
    const foundLetter = letters.find((l) => l.qr_code_token === token);

    if (foundLetter) {
      const comp = storage.getCompany(foundLetter.company_id);
      if (foundLetter.company_id !== currentCompany.id) {
        setVerificationResult({
          status: 'cross_tenant',
          title: 'توکن متعلق به شرکت دیگری است',
          details: `این سند متعلق به شرکت [${comp?.trade_name || foundLetter.company_id}] می‌باشد. با توجه به قوانین تفکیک چندمستاجری، برای مشاهده جزئیات باید به شرکت مذکور سوئیچ نمایید.`,
          recordCompanyTradeName: comp?.trade_name,
        });
        return;
      }

      setVerificationResult({
        status: 'success',
        title: 'اصالت و اعتبار سند تأیید شد',
        details: `نامه رسمی شماره ${foundLetter.letter_number} با موضوع "${foundLetter.subject}" با امضای دیجیتال معتبر ${foundLetter.signed_by_user_name || 'مدیرعامل'} به ثبت رسیده است.`,
        recordCompanyTradeName: comp?.trade_name,
        date: foundLetter.letter_date,
      });
      return;
    }

    // Check archive docs
    const docs = storage.getArchiveDocuments();
    const foundDoc = docs.find((d) => d.qr_code_token === token);
    if (foundDoc) {
      const comp = storage.getCompany(foundDoc.company_id);
      setVerificationResult({
        status: 'success',
        title: 'سند بایگانی معتبر و اصیل است',
        details: `سند با کد بایگانی ${foundDoc.archive_code} با عنوان "${foundDoc.title}" در بایگانی امن شرکت ثبت گردیده است.`,
        recordCompanyTradeName: comp?.trade_name,
        date: foundDoc.document_date,
      });
      return;
    }

    setVerificationResult({
      status: 'invalid',
      title: 'توکن نامعتبر یا جعلی است',
      details: 'هیچ سند رسمی منطبق با این توکن در پایگاه داده امن مستاجران یافت نشد. احتمال جعل یا منقضی شدن توکن وجود دارد.',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        <div className="flex items-center justify-between p-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold">سامانه امن استعلام و اعتبارسنجی QR</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-bold mb-1">
              توکن امن استعلام (Security Verification Token):
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="QR_TOK_SEP_... یا اسکن شده"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono text-xs"
              />
              <button
                type="button"
                onClick={() => handleVerify(tokenInput)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg shrink-0 cursor-pointer"
              >
                بررسی اصالت
              </button>
            </div>
          </div>

          {verificationResult && (
            <div
              className={`p-4 rounded-xl border space-y-2 ${
                verificationResult.status === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : verificationResult.status === 'cross_tenant'
                  ? 'bg-amber-50 border-amber-200 text-amber-950'
                  : 'bg-rose-50 border-rose-200 text-rose-950'
              }`}
            >
              <div className="flex items-center gap-2">
                {verificationResult.status === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : verificationResult.status === 'cross_tenant' ? (
                  <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                )}
                <h4 className="font-bold text-sm">{verificationResult.title}</h4>
              </div>

              <p className="leading-relaxed text-xs">{verificationResult.details}</p>

              {verificationResult.recordCompanyTradeName && (
                <div className="pt-2 border-t border-slate-200/60 flex justify-between text-[11px] font-medium">
                  <span>شرکت صادرکننده:</span>
                  <span className="font-bold">{verificationResult.recordCompanyTradeName}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button onClick={onClose} className="px-4 py-1.5 bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold">
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};
