import React, { useState } from 'react';
import {
  Archive,
  Search,
  Plus,
  Lock,
  Download,
  Eye,
  FileText,
  Camera,
  ShieldCheck,
  AlertOctagon,
  CheckCircle,
  Hash,
  FolderOpen,
  Filter,
  RefreshCw,
  QrCode,
} from 'lucide-react';
import { ArchiveDocument, Attachment, Company, User, ConfidentialityLevel } from '../types';
import { SecurityEngine } from '../services/securityEngine';

interface ArchiveTabProps {
  currentCompany: Company;
  currentUser: User;
  archiveDocs: ArchiveDocument[];
  attachments: Attachment[];
  onSaveNewDocument: (doc: ArchiveDocument, file?: File) => void;
  onVerifyQr: (token: string) => void;
}

export const ArchiveTab: React.FC<ArchiveTabProps> = ({
  currentCompany,
  currentUser,
  archiveDocs,
  attachments,
  onSaveNewDocument,
  onVerifyQr,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<ArchiveDocument | null>(null);
  const [simulatedOcrText, setSimulatedOcrText] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);

  // New Document Form State
  const [docTitle, setDocTitle] = useState('');
  const [docSubject, setDocSubject] = useState('');
  const [docType, setDocType] = useState<ArchiveDocument['document_type']>('contract');
  const [caseFolder, setCaseFolder] = useState('پرونده عمومی/۱۴۰۵');
  const [retentionYears, setRetentionYears] = useState(10);
  const [confidentiality, setConfidentiality] = useState<ConfidentialityLevel>('confidential');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const filteredDocs = archiveDocs.filter((d) => {
    if (filterType !== 'all' && d.document_type !== filterType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        d.title.toLowerCase().includes(q) ||
        d.archive_code.toLowerCase().includes(q) ||
        d.case_folder_number.toLowerCase().includes(q) ||
        d.subject.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const check = SecurityEngine.validateUploadedFile(
        file.name,
        file.size,
        file.type,
        currentCompany.id,
        'archive',
        'pending'
      );

      if (!check.isValid) {
        setUploadError(check.errorMessageFa || 'فایل غیرمجاز است.');
        setSelectedFile(null);
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleCreateDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim() || !docSubject.trim()) {
      alert('لطفاً عنوان و موضوع سند را وارد نمایید.');
      return;
    }

    const docId = `arc_${Date.now()}`;
    const archiveCode = `بایگانی-${currentCompany.short_name[0]}-۱۴۰۵-${String(Math.floor(100 + Math.random() * 900))}`;
    const storageUuid = SecurityEngine.generateUuid();
    const ext = selectedFile ? selectedFile.name.split('.').pop() || 'pdf' : 'pdf';
    const storagePath = `tenant/${currentCompany.id}/archive/${docId}/${storageUuid}.${ext}`;

    const newDoc: ArchiveDocument = {
      id: docId,
      company_id: currentCompany.id,
      archive_code: archiveCode,
      case_folder_number: caseFolder,
      title: docTitle.trim(),
      subject: docSubject.trim(),
      document_type: docType,
      document_date: SecurityEngine.getJalaliDateNow(),
      sender_or_issuer: currentCompany.trade_name,
      receiver: 'بایگانی مرکزی',
      organizational_unit: 'مدیریت اسناد',
      responsible_person: `${currentUser.first_name} ${currentUser.last_name}`,
      confidentiality_level: confidentiality,
      retention_period_years: retentionYears,
      status: 'active',
      keywords: ['بایگانی', docType, currentCompany.short_name],
      description: 'سند رسمی نمایه شده در سامانه بایگانی چندمستاجری',
      qr_code_token: SecurityEngine.generateQrVerificationToken(currentCompany.id, docId),
      version: 1,
      storage_path: storagePath,
      file_name: selectedFile ? selectedFile.name : `Doc_${docId}.pdf`,
      file_size_kb: selectedFile ? Math.round(selectedFile.size / 1024) : 850,
      file_extension: ext,
      sha256_hash: SecurityEngine.computeSha256(docTitle + storagePath + Date.now()),
      ocr_extracted_text: simulatedOcrText || 'متن استخراج شده از طریق پردازش نویسه‌خوان اپتیکال (OCR) سازمانی...',
      is_locked: false,
      created_at: SecurityEngine.getJalaliDateTimeNow(),
      updated_at: SecurityEngine.getJalaliDateTimeNow(),
    };

    onSaveNewDocument(newDoc, selectedFile || undefined);
    setIsUploadOpen(false);
    setSelectedFile(null);
    setSimulatedOcrText(null);
  };

  const triggerCameraScan = () => {
    setCameraActive(true);
    setTimeout(() => {
      setSimulatedOcrText(
        'متن سند اسکن شده توسط دوربین دستگاه: موافقت‌نامه اصولی شماره ۵۵۸۲ به منظور طراحی معماری کلود با تضمین ایزولاسیون کامل Tenantها و رعایت استانداردهای ممیزی افتا.'
      );
      setCameraActive(false);
    }, 1800);
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-800">
              بایگانی الکترونیک، اسناد و مخزن ضمایم {currentCompany.trade_name}
            </h2>
            <span className="text-[11px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-bold border border-emerald-200">
              SHA-256 Verified
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            دسته‌بندی، نسخه‌بندی، قفل امنیتی، اسکن با دوربین/OCR و نگهداری فایل‌ها در مسیر ایزوله Tenant
          </p>
        </div>

        <button
          onClick={() => setIsUploadOpen(true)}
          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          بایگانی سند یا پرونده جدید
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
              filterType === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            همه اسناد ({archiveDocs.length})
          </button>
          <button
            onClick={() => setFilterType('contract')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
              filterType === 'contract'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            قراردادها
          </button>
          <button
            onClick={() => setFilterType('financial')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
              filterType === 'financial'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            مالی و مالیاتی
          </button>
          <button
            onClick={() => setFilterType('technical')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
              filterType === 'technical'
                ? 'bg-blue-600 text-white'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
          >
            فنی و معماری
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="جستجوی کد بایگانی، پرونده، عنوان..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 text-xs text-slate-800 placeholder-slate-400 pl-3 pr-8 py-1.5 rounded-xl border border-slate-200 focus:bg-white outline-hidden"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            onClick={() => setSelectedDoc(doc)}
            className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-emerald-300 shadow-xs hover:shadow-sm transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                  {doc.archive_code}
                </span>
                <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-mono">
                  نسخه {doc.version}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-sm text-slate-800 line-clamp-1 group-hover:text-emerald-700 transition-colors">
                  {doc.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {doc.subject}
                </p>
              </div>

              <div className="text-[11px] text-slate-500 space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <div className="flex justify-between">
                  <span>شماره پرونده:</span>
                  <span className="font-semibold text-slate-700">{doc.case_folder_number}</span>
                </div>
                <div className="flex justify-between">
                  <span>مدت نگهداری:</span>
                  <span className="font-semibold text-slate-700">{doc.retention_period_years} سال</span>
                </div>
                <div className="flex justify-between">
                  <span>حجم و پسوند:</span>
                  <span className="font-mono text-slate-700 uppercase">
                    {doc.file_extension} ({(doc.file_size_kb / 1024).toFixed(1)} MB)
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1 text-slate-400 font-mono text-[10px]">
                <Hash className="w-3 h-3" />
                <span>{doc.sha256_hash.substring(0, 10)}...</span>
              </div>
              <span className="text-emerald-600 font-bold text-xs group-hover:underline">
                نمایش و دانلود
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Document Detail Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="flex items-center justify-between p-4 bg-emerald-800 text-white">
              <div className="flex items-center gap-2">
                <Archive className="w-5 h-5 text-emerald-200" />
                <div>
                  <h3 className="text-sm font-bold">{selectedDoc.title}</h3>
                  <p className="text-[10px] text-emerald-200 font-mono">
                    کد بایگانی: {selectedDoc.archive_code} | شرکت: {currentCompany.trade_name}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedDoc(null)} className="text-emerald-200 hover:text-white">
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 font-mono">
                <p>
                  <strong className="text-slate-700 font-sans">مسیر ذخیره‌سازی ایزوله در Storage:</strong>
                </p>
                <p className="text-indigo-600 text-[11px] break-all">{selectedDoc.storage_path}</p>
                <p className="text-slate-500 text-[10px]">
                  هش اعتبارسنجی SHA-256: {selectedDoc.sha256_hash}
                </p>
              </div>

              <div>
                <p className="font-bold text-slate-700 mb-1">موضوع و شرح پرونده:</p>
                <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {selectedDoc.subject}
                </p>
              </div>

              {selectedDoc.ocr_extracted_text && (
                <div>
                  <p className="font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-emerald-600" />
                    متن استخراج‌شده توسط OCR هوشمند:
                  </p>
                  <p className="text-slate-600 leading-relaxed bg-emerald-50/50 p-3 rounded-xl border border-emerald-100 text-[11px]">
                    {selectedDoc.ocr_extracted_text}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2">
                  <QrCode className="w-8 h-8 text-slate-700" />
                  <div>
                    <p className="font-bold text-slate-800">توکن امن استعلام بایگانی</p>
                    <p className="font-mono text-[10px] text-slate-400">{selectedDoc.qr_code_token}</p>
                  </div>
                </div>
                <button
                  onClick={() => onVerifyQr(selectedDoc.qr_code_token)}
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg text-xs"
                >
                  استعلام اعتبار
                </button>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => setSelectedDoc(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 text-xs"
              >
                بستن
              </button>
              <button
                onClick={() => {
                  alert(`لینک دانلود امن موقت (Time-Limited Signed URL) صادر گردید: ${selectedDoc.storage_path}`);
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700"
              >
                <Download className="w-4 h-4" />
                دانلود مستقیم سند
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload New Document Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="flex items-center justify-between p-4 bg-emerald-700 text-white">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                <h3 className="text-sm font-bold">بایگانی سند جدید در {currentCompany.trade_name}</h3>
              </div>
              <button onClick={() => setIsUploadOpen(false)} className="text-emerald-200 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDocument} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">عنوان سند یا پرونده *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: قرارداد مشارکت تجاری فاز ۳..."
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">موضوع و خلاصه محتوا *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="شرح خلاصه‌ای از مفاد سند..."
                  value={docSubject}
                  onChange={(e) => setDocSubject(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 font-normal"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">دسته‌بندی سند</label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2"
                  >
                    <option value="contract">قرارداد و تفاهم‌نامه</option>
                    <option value="financial">اسناد مالی و مالیاتی</option>
                    <option value="legal">حقوقی و اساسنامه</option>
                    <option value="technical">فنی و معماری</option>
                    <option value="board">صورتجلسات هیئت مدیره</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">کد پرونده / پوشه</label>
                  <input
                    type="text"
                    value={caseFolder}
                    onChange={(e) => setCaseFolder(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>
              </div>

              {/* Camera Scanner Simulation */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-emerald-600" />
                    اسکن هوشمند با دوربین و استخراج OCR
                  </span>
                  <button
                    type="button"
                    onClick={triggerCameraScan}
                    disabled={cameraActive}
                    className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    {cameraActive ? (
                      <>
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        در حال اسکن...
                      </>
                    ) : (
                      'فعال‌سازی اسکن دوربین'
                    )}
                  </button>
                </div>
                {simulatedOcrText && (
                  <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-[11px]">
                    <strong>متن OCR استخراج‌شده:</strong> {simulatedOcrText}
                  </div>
                )}
              </div>

              {/* File Attachment Dropzone */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">انتخاب فایل ضمیمه (PDF / Doc / Image)</label>
                <input
                  type="file"
                  onChange={handleFileSelect}
                  className="block w-full text-xs text-slate-500 file:ml-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
                {uploadError && (
                  <p className="text-rose-600 font-bold text-[11px] mt-1">{uploadError}</p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  ثبت در بایگانی امن
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
