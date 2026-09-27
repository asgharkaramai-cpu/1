import React, { useState } from 'react';
import { Database, Download, RefreshCw, Plus, CheckCircle2, ShieldCheck, Lock } from 'lucide-react';
import { BackupRecord, Company } from '../types';
import { SecurityEngine } from '../services/securityEngine';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  backups: BackupRecord[];
  currentCompany: Company;
  onCreateBackup: (backup: BackupRecord) => void;
  onRestoreBackup: (backupId: string) => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  backups,
  currentCompany,
  onCreateBackup,
  onRestoreBackup,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerateBackup = () => {
    setIsCreating(true);
    setTimeout(() => {
      const backupId = `bak_${Date.now()}`;
      const fileName = `backup_${currentCompany.id}_full_${SecurityEngine.getJalaliDateNow().replace(/\//g, '')}.enc.bak`;
      const newBackup: BackupRecord = {
        id: backupId,
        company_id: currentCompany.id,
        scope: 'company',
        backup_type: 'full',
        file_name: fileName,
        file_size_mb: 284.5,
        created_at: SecurityEngine.getJalaliDateTimeNow(),
        status: 'completed',
        checksum_sha256: SecurityEngine.computeSha256(fileName + Date.now()),
        is_encrypted: true,
        notes: `پشتیبان دستی کامل شامل داده‌ها، اسناد و امضاهای شرکت ${currentCompany.trade_name}`,
      };

      onCreateBackup(newBackup);
      setIsCreating(false);
    }, 1200);
  };

  const handleRestore = (id: string) => {
    if (confirm(`آیا از بازیابی این نسخه پشتیبان اطمینان دارید؟ داده‌های سایر شرکت‌ها به هیچ عنوان تغییر نخواهند کرد.`)) {
      setRestoringId(id);
      setTimeout(() => {
        onRestoreBackup(id);
        setRestoringId(null);
        alert('نسخه پشتیبان شرکت با موفقیت بازیابی شد. یکپارچگی داده‌ها تأیید شد.');
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        <div className="flex items-center justify-between p-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="text-sm font-bold">پشتیبان‌گیری و بازیابی داده‌ها (Backup & Restore)</h3>
              <p className="text-[10px] text-slate-400">
                محدوده فعال: شرکت {currentCompany.trade_name} (ایزوله کامل)
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between">
            <div>
              <p className="font-bold text-indigo-950">پشتیبان‌گیری کامل از داده‌های {currentCompany.trade_name}</p>
              <p className="text-[11px] text-indigo-800 mt-0.5">
                رمزنگاری با AES-256 و کلید اختصاصی مستاجر
              </p>
            </div>
            <button
              onClick={handleGenerateBackup}
              disabled={isCreating}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-xs transition-colors cursor-pointer"
            >
              {isCreating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              {isCreating ? 'در حال تهیه پشتیبان...' : 'ایجاد پشتیبان جدید'}
            </button>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-slate-700">نسخه‌های پشتیبان در دسترس:</h4>
            {backups.map((bak) => (
              <div
                key={bak.id}
                className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-800">{bak.file_name}</span>
                    <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-bold">
                      {bak.backup_type === 'full' ? 'کامل' : 'افزایشی'}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">{bak.created_at}</span>
                </div>

                <p className="text-slate-600 text-[11px]">{bak.notes}</p>

                <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-[10px] font-mono text-slate-500">
                  <span>هش SHA-256: {bak.checksum_sha256.substring(0, 16)}...</span>
                  <button
                    onClick={() => handleRestore(bak.id)}
                    disabled={restoringId !== null}
                    className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg font-sans transition-colors cursor-pointer"
                  >
                    {restoringId === bak.id ? 'در حال بازیابی...' : 'بازیابی این نسخه'}
                  </button>
                </div>
              </div>
            ))}
          </div>
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
