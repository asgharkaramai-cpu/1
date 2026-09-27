import React, { useState } from 'react';
import { X, ShieldCheck, AlertTriangle, Search, Filter } from 'lucide-react';
import { AuditLog, Company } from '../types';

interface AuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  auditLogs: AuditLog[];
  currentCompany: Company;
}

export const AuditLogModal: React.FC<AuditLogModalProps> = ({
  isOpen,
  onClose,
  auditLogs,
  currentCompany,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filtered = auditLogs.filter((log) => {
    if (filterStatus !== 'all' && log.status !== filterStatus) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        log.user_name.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        (log.details && log.details.toLowerCase().includes(q)) ||
        (log.failure_reason && log.failure_reason.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold">لاگ ممیزی و رویدادهای امنیتی (Audit Log)</h3>
              <p className="text-[10px] text-slate-400">
                پایش لحظه‌ای عملیات در محدوده شرکت: {currentCompany.trade_name}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>

        {/* Filters */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 rounded-lg font-medium ${
                filterStatus === 'all' ? 'bg-slate-900 text-white' : 'bg-white border text-slate-600'
              }`}
            >
              همه رویدادها ({auditLogs.length})
            </button>
            <button
              onClick={() => setFilterStatus('forbidden_attempt')}
              className={`px-3 py-1 rounded-lg font-medium ${
                filterStatus === 'forbidden_attempt'
                  ? 'bg-rose-600 text-white'
                  : 'bg-white border border-rose-200 text-rose-700'
              }`}
            >
              تلاش‌های نفوذ و مسدودشده
            </button>
            <button
              onClick={() => setFilterStatus('success')}
              className={`px-3 py-1 rounded-lg font-medium ${
                filterStatus === 'success'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white border border-emerald-200 text-emerald-700'
              }`}
            >
              موفق
            </button>
          </div>

          <div className="relative w-64">
            <input
              type="text"
              placeholder="جستجو در لاگ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white text-xs pl-3 pr-8 py-1 rounded-lg border border-slate-300"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2" />
          </div>
        </div>

        {/* Log List */}
        <div className="p-4 overflow-y-auto space-y-2 text-xs divide-y divide-slate-100">
          {filtered.map((log) => {
            const isForbidden = log.status === 'forbidden_attempt';
            return (
              <div
                key={log.id}
                className={`p-3 rounded-xl border transition-all ${
                  isForbidden ? 'bg-rose-50/70 border-rose-200' : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 font-sans">{log.user_name}</span>
                    <span className="text-slate-400">({log.user_role})</span>
                    <span className="text-slate-500 font-bold bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">
                      {log.module} / {log.action}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 text-[10px]">
                    <span>IP: {log.ip_address}</span>
                    <span>•</span>
                    <span>{log.timestamp}</span>
                  </div>
                </div>

                <p className="mt-1 text-slate-700 font-medium">{log.details || log.action}</p>

                {log.failure_reason && (
                  <p className="mt-1.5 text-[11px] text-rose-800 font-mono bg-rose-100/70 p-2 rounded-lg">
                    علت مسدودسازی: {log.failure_reason}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};
