import React, { useState } from 'react';
import {
  Mail,
  Send,
  Inbox,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  Plus,
  Search,
  Filter,
  Lock,
  PenTool,
  QrCode,
  FileCheck2,
  Paperclip,
  CheckCircle,
} from 'lucide-react';
import { Letter, Company, User, Attachment, LetterDirection } from '../types';
import { LetterDetailModal } from './LetterDetailModal';
import { LetterCreateModal } from './LetterCreateModal';
import { SignaturePadModal } from './SignaturePadModal';

interface SecretariatTabProps {
  currentCompany: Company;
  currentUser: User;
  letters: Letter[];
  attachments: Attachment[];
  onSaveNewLetter: (letter: Letter, uploadedFiles: File[]) => void;
  onSignLetter: (letterId: string, signerUserId: string, signerName: string) => void;
  onVerifyQr: (token: string) => void;
}

export const SecretariatTab: React.FC<SecretariatTabProps> = ({
  currentCompany,
  currentUser,
  letters,
  attachments,
  onSaveNewLetter,
  onSignLetter,
  onVerifyQr,
}) => {
  const [filterDirection, setFilterDirection] = useState<'all' | LetterDirection>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSignPadOpen, setIsSignPadOpen] = useState(false);
  const [signingLetterId, setSigningLetterId] = useState<string | null>(null);

  // Compute next sequential letter number for this specific company
  const currentCount = letters.length + 1;
  const nextLetterNumber = `${currentCompany.short_name}-۱۴۰۵-${String(1040 + currentCount).padStart(4, '۰')}`;

  const filteredLetters = letters.filter((l) => {
    if (filterDirection !== 'all' && l.direction !== filterDirection) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        l.letter_number.toLowerCase().includes(q) ||
        l.subject.toLowerCase().includes(q) ||
        l.receiver_name.toLowerCase().includes(q) ||
        l.sender_name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getDirectionBadge = (dir: LetterDirection) => {
    switch (dir) {
      case 'outgoing':
        return (
          <span className="flex items-center gap-1 text-[11px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-semibold border border-blue-200">
            <ArrowUpRight className="w-3 h-3" />
            صادره
          </span>
        );
      case 'incoming':
        return (
          <span className="flex items-center gap-1 text-[11px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-semibold border border-emerald-200">
            <ArrowDownLeft className="w-3 h-3" />
            وارده
          </span>
        );
      case 'internal':
        return (
          <span className="flex items-center gap-1 text-[11px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded-md font-semibold border border-purple-200">
            <RefreshCw className="w-3 h-3" />
            داخلی
          </span>
        );
    }
  };

  const handleOpenSign = (letterId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSigningLetterId(letterId);
    setIsSignPadOpen(true);
  };

  const handleCompleteSignature = () => {
    if (signingLetterId) {
      onSignLetter(
        signingLetterId,
        currentUser.id,
        `${currentUser.first_name} ${currentUser.last_name}`
      );
      if (selectedLetter && selectedLetter.id === signingLetterId) {
        setSelectedLetter((prev) => (prev ? { ...prev, is_locked: true, status: 'signed' } : null));
      }
      setSigningLetterId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-800">
              دبیرخانه و نامه‌نگاری رسمی {currentCompany.trade_name}
            </h2>
            <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-mono">
              شماره‌گذاری مستقل شرکت
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            ثبت، صدور، ارجاع، امضای الکترونیکی و چاپ نامه‌های وارده، صادره و داخلی با سربرگ و مهر رسمی
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          ثبت و صدور نامه جدید
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          <button
            onClick={() => setFilterDirection('all')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
              filterDirection === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            همه مکاتبات ({letters.length})
          </button>
          <button
            onClick={() => setFilterDirection('outgoing')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
              filterDirection === 'outgoing'
                ? 'bg-blue-600 text-white'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
          >
            صادره ({letters.filter((l) => l.direction === 'outgoing').length})
          </button>
          <button
            onClick={() => setFilterDirection('incoming')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
              filterDirection === 'incoming'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            وارده ({letters.filter((l) => l.direction === 'incoming').length})
          </button>
          <button
            onClick={() => setFilterDirection('internal')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
              filterDirection === 'internal'
                ? 'bg-purple-600 text-white'
                : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
            }`}
          >
            داخلی ({letters.filter((l) => l.direction === 'internal').length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="جستجوی شماره، موضوع یا طرف نامه..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 text-xs text-slate-800 placeholder-slate-400 pl-3 pr-8 py-1.5 rounded-xl border border-slate-200 focus:bg-white outline-hidden"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
        </div>
      </div>

      {/* Letters Table / Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
              <tr>
                <th className="p-3.5">نوع</th>
                <th className="p-3.5">شماره نامه</th>
                <th className="p-3.5">موضوع نامه</th>
                <th className="p-3.5">طرف مکاتبه (گیرنده/فرستنده)</th>
                <th className="p-3.5">تاریخ صدور</th>
                <th className="p-3.5">وضعیت و امضا</th>
                <th className="p-3.5 text-center">پیوست</th>
                <th className="p-3.5 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLetters.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    هیچ نامه‌ای با شرایط انتخابی یافت نشد.
                  </td>
                </tr>
              ) : (
                filteredLetters.map((l) => {
                  return (
                    <tr
                      key={l.id}
                      onClick={() => setSelectedLetter(l)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      <td className="p-3.5">{getDirectionBadge(l.direction)}</td>
                      <td className="p-3.5 font-mono font-bold text-slate-800">{l.letter_number}</td>
                      <td className="p-3.5 max-w-xs font-semibold text-slate-800 truncate">{l.subject}</td>
                      <td className="p-3.5 text-slate-600 truncate max-w-[180px]">
                        {l.direction === 'incoming' ? l.sender_name : l.receiver_name}
                      </td>
                      <td className="p-3.5 text-slate-500 font-mono">{l.letter_date}</td>
                      <td className="p-3.5">
                        {l.is_locked ? (
                          <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-bold">
                            <Lock className="w-3 h-3 text-emerald-600" />
                            امضا و قفل شده
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[11px] text-amber-600 font-medium">
                            در انتظار امضا
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-center">
                        {l.attachments_count > 0 ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-bold text-[10px]">
                            <Paperclip className="w-2.5 h-2.5" />
                            {l.attachments_count}
                          </span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          {!l.is_locked && (
                            <button
                              onClick={(e) => handleOpenSign(l.id, e)}
                              className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                              title="امضای دیجیتال نامه"
                            >
                              <PenTool className="w-3 h-3" />
                              امضا
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedLetter(l)}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-medium transition-colors cursor-pointer"
                          >
                            مشاهده و سربرگ
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Letter Detail Modal */}
      {selectedLetter && (
        <LetterDetailModal
          isOpen={!!selectedLetter}
          onClose={() => setSelectedLetter(null)}
          letter={selectedLetter}
          currentCompany={currentCompany}
          currentUser={currentUser}
          attachments={attachments.filter((a) => a.parent_record_id === selectedLetter.id)}
          onOpenSignPad={() => {
            setSigningLetterId(selectedLetter.id);
            setIsSignPadOpen(true);
          }}
          onVerifyQr={onVerifyQr}
        />
      )}

      {/* Letter Create Modal */}
      {isCreateOpen && (
        <LetterCreateModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onSave={onSaveNewLetter}
          currentCompany={currentCompany}
          currentUser={currentUser}
          nextLetterNumber={nextLetterNumber}
        />
      )}

      {/* Signature Pad Modal */}
      {isSignPadOpen && (
        <SignaturePadModal
          isOpen={isSignPadOpen}
          onClose={() => setIsSignPadOpen(false)}
          onSaveSignature={handleCompleteSignature}
          currentUser={currentUser}
          currentCompany={currentCompany}
          documentTitle={
            selectedLetter?.subject || 'نامه رسمی در انتظار امضا'
          }
        />
      )}
    </div>
  );
};
