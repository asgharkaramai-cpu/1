import React, { useState, useEffect } from 'react';
import { storage } from './services/storage';
import { SecurityEngine } from './services/securityEngine';
import {
  Company,
  User,
  CompanyMembership,
  Letter,
  ArchiveDocument,
  Attachment,
  FinancialTransaction,
  Shareholder,
  BoardMeeting,
  Project,
  AuditLog,
  BackupRecord,
  OfflineSyncItem,
} from './types';

import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardTab } from './components/DashboardTab';
import { SecretariatTab } from './components/SecretariatTab';
import { ArchiveTab } from './components/ArchiveTab';
import { FinanceTab } from './components/FinanceTab';
import { BoardMeetingsTab } from './components/BoardMeetingsTab';
import { ProjectsTab } from './components/ProjectsTab';
import { AndroidSimulatorTab } from './components/AndroidSimulatorTab';
import { AndroidCodeTab } from './components/AndroidCodeTab';
import { SecurityTestsTab } from './components/SecurityTestsTab';
import { DocsAndApiTab } from './components/DocsAndApiTab';

import { AuditLogModal } from './components/AuditLogModal';
import { BackupModal } from './components/BackupModal';
import { QrVerifyModal } from './components/QrVerifyModal';
import { LetterCreateModal } from './components/LetterCreateModal';

export default function App() {
  // Global System State
  const [activeCompanyId, setActiveCompanyId] = useState<string>(() => storage.getActiveCompanyId());
  const [activeUserId, setActiveUserId] = useState<string>(() => storage.getActiveUserId());
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isOffline, setIsOffline] = useState<boolean>(() => storage.isOfflineMode());

  // Entity States (Partitioned by active Company)
  const [companies, setCompanies] = useState<Company[]>(() => storage.getCompanies());
  const [letters, setLetters] = useState<Letter[]>([]);
  const [archiveDocs, setArchiveDocs] = useState<ArchiveDocument[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [financials, setFinancials] = useState<FinancialTransaction[]>([]);
  const [shareholders, setShareholders] = useState<Shareholder[]>([]);
  const [boardMeetings, setBoardMeetings] = useState<BoardMeeting[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [backups, setBackups] = useState<BackupRecord[]>([]);
  const [syncQueue, setSyncQueue] = useState<OfflineSyncItem[]>([]);

  // Modals
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [qrTokenToVerify, setQrTokenToVerify] = useState<string>('');
  const [isGlobalLetterCreateOpen, setIsGlobalLetterCreateOpen] = useState(false);

  // Load tenant partitioned data when activeCompanyId changes
  const reloadTenantData = (compId: string) => {
    setLetters(storage.getLetters(compId));
    setArchiveDocs(storage.getArchiveDocuments(compId));
    setAttachments(storage.getAttachments(compId));
    setFinancials(storage.getFinancialTransactions(compId));
    setShareholders(storage.getShareholders(compId));
    setBoardMeetings(storage.getBoardMeetings(compId));
    setProjects(storage.getProjects(compId));
    setAuditLogs(storage.getAuditLogs(compId));
    setBackups(storage.getBackups(compId));
    setSyncQueue(storage.getSyncQueue(compId));
  };

  useEffect(() => {
    reloadTenantData(activeCompanyId);
  }, [activeCompanyId]);

  const currentCompany = companies.find((c) => c.id === activeCompanyId) || companies[0];
  const currentUser = storage.getUser(activeUserId) || storage.getUsers()[0];
  const currentMembership = storage.getUserCompanyMembership(activeUserId, activeCompanyId);

  // Switch Active Company
  const handleSwitchCompany = (newCompanyId: string) => {
    if (newCompanyId === activeCompanyId) return;

    // Log context switch
    const log: AuditLog = {
      id: `log_switch_${Date.now()}`,
      company_id: newCompanyId,
      user_id: currentUser.id,
      user_name: `${currentUser.first_name} ${currentUser.last_name}`,
      user_role: 'system_user',
      module: 'auth',
      action: 'switch_company_context',
      record_type: 'company',
      record_id: newCompanyId,
      ip_address: '192.168.10.1',
      device_name: 'Enterprise Client',
      timestamp: SecurityEngine.getJalaliDateTimeNow(),
      status: 'success',
      details: `تغییر شرکت فعال به [${newCompanyId}] و پاکسازی خودکار کَش موقت شرکت قبلی`,
    };
    storage.appendAuditLog(log);

    storage.setActiveCompanyId(newCompanyId);
    setActiveCompanyId(newCompanyId);
  };

  // Toggle Offline mode
  const handleToggleOffline = () => {
    const nextState = !isOffline;
    setIsOffline(nextState);
    storage.setOfflineMode(nextState);
  };

  // WorkManager Sync Execution
  const handleSyncQueueNow = () => {
    const pendingItems = storage.getSyncQueue(activeCompanyId);
    if (pendingItems.length === 0) return;

    // Simulate processing each offline item
    pendingItems.forEach((item) => {
      if (item.operation === 'create' && item.entity_type === 'letter') {
        const letterData: Letter = item.payload;
        storage.saveLetter({ ...letterData, status: 'sent' });
      }
    });

    // Clear queue
    storage.clearSyncQueue(activeCompanyId);

    // Audit log
    const syncLog: AuditLog = {
      id: `log_sync_${Date.now()}`,
      company_id: activeCompanyId,
      user_id: currentUser.id,
      user_name: currentUser.first_name,
      user_role: 'system_sync',
      module: 'sync',
      action: 'workmanager_offline_sync',
      record_type: 'queue',
      record_id: `batch_${pendingItems.length}`,
      ip_address: '192.168.10.45',
      device_name: 'Android WorkManager',
      timestamp: SecurityEngine.getJalaliDateTimeNow(),
      status: 'success',
      details: `همگام‌سازی موفق ${pendingItems.length} رکورد آفلاین با سرور مرکزی`,
    };
    storage.appendAuditLog(syncLog);

    reloadTenantData(activeCompanyId);
  };

  // Save new letter
  const handleSaveNewLetter = (newLetter: Letter, files: File[]) => {
    if (isOffline) {
      // Add to offline sync queue
      const syncItem: OfflineSyncItem = {
        id: `sync_${Date.now()}`,
        company_id: activeCompanyId,
        module: 'secretariat',
        operation: 'create',
        entity_type: 'letter',
        entity_id: newLetter.id,
        payload: newLetter,
        created_at: SecurityEngine.getJalaliDateTimeNow(),
        status: 'pending',
      };
      storage.enqueueSyncItem(syncItem);
      storage.saveLetter(newLetter);
      reloadTenantData(activeCompanyId);
      return;
    }

    storage.saveLetter(newLetter);

    // Process files
    files.forEach((f) => {
      const check = SecurityEngine.validateUploadedFile(
        f.name,
        f.size,
        f.type,
        activeCompanyId,
        'secretariat',
        newLetter.id
      );
      if (check.isValid) {
        const att: Attachment = {
          id: `att_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          company_id: activeCompanyId,
          module_name: 'secretariat',
          parent_record_type: 'letter',
          parent_record_id: newLetter.id,
          display_name: f.name,
          storage_name: check.storageName,
          storage_path: check.storagePath,
          extension: f.name.split('.').pop() || '',
          mime_type: f.type || 'application/octet-stream',
          actual_mime_type: f.type || 'application/octet-stream',
          file_size: f.size,
          version: 1,
          uploaded_by: `${currentUser.first_name} ${currentUser.last_name}`,
          uploaded_at: SecurityEngine.getJalaliDateTimeNow(),
          confidentiality_level: newLetter.confidentiality_level,
          malware_scan_status: 'clean',
          approval_status: 'approved',
          sha256_hash: check.sha256,
          is_deleted: false,
        };
        storage.saveAttachment(att);
      }
    });

    // Audit log
    const log: AuditLog = {
      id: `log_let_${Date.now()}`,
      company_id: activeCompanyId,
      user_id: currentUser.id,
      user_name: `${currentUser.first_name} ${currentUser.last_name}`,
      user_role: currentMembership?.role || 'secretary',
      module: 'secretariat',
      action: 'create_letter',
      record_type: 'letter',
      record_id: newLetter.id,
      ip_address: '192.168.10.1',
      device_name: 'Web Workstation',
      timestamp: SecurityEngine.getJalaliDateTimeNow(),
      status: 'success',
      details: `ثبت و صدور نامه جدید شماره ${newLetter.letter_number} در سربرگ شرکت`,
    };
    storage.appendAuditLog(log);

    reloadTenantData(activeCompanyId);
  };

  // Sign letter
  const handleSignLetter = (letterId: string, signerUserId: string, signerName: string) => {
    const letter = storage.getLetter(letterId, activeCompanyId);
    if (!letter) return;

    const signed = SecurityEngine.signLetter(letter, signerUserId, signerName);
    storage.saveLetter(signed);

    const log: AuditLog = {
      id: `log_sign_${Date.now()}`,
      company_id: activeCompanyId,
      user_id: signerUserId,
      user_name: signerName,
      user_role: currentMembership?.role || 'manager',
      module: 'secretariat',
      action: 'sign_letter',
      record_type: 'letter',
      record_id: letterId,
      ip_address: '192.168.10.1',
      device_name: 'Secure Signature Client',
      timestamp: SecurityEngine.getJalaliDateTimeNow(),
      status: 'success',
      details: `ثبت امضای دیجیتال برای نامه شماره ${letter.letter_number} و قفل سند با هش SHA-256`,
    };
    storage.appendAuditLog(log);

    reloadTenantData(activeCompanyId);
  };

  // Save new archive document
  const handleSaveNewArchiveDoc = (doc: ArchiveDocument, file?: File) => {
    storage.saveArchiveDocument(doc);
    if (file) {
      const check = SecurityEngine.validateUploadedFile(
        file.name,
        file.size,
        file.type,
        activeCompanyId,
        'archive',
        doc.id
      );
      if (check.isValid) {
        const att: Attachment = {
          id: `att_arc_${Date.now()}`,
          company_id: activeCompanyId,
          module_name: 'archive',
          parent_record_type: 'document',
          parent_record_id: doc.id,
          display_name: file.name,
          storage_name: check.storageName,
          storage_path: check.storagePath,
          extension: file.name.split('.').pop() || '',
          mime_type: file.type || 'application/pdf',
          actual_mime_type: file.type || 'application/pdf',
          file_size: file.size,
          version: 1,
          uploaded_by: `${currentUser.first_name} ${currentUser.last_name}`,
          uploaded_at: SecurityEngine.getJalaliDateTimeNow(),
          confidentiality_level: doc.confidentiality_level,
          malware_scan_status: 'clean',
          approval_status: 'approved',
          sha256_hash: check.sha256,
          is_deleted: false,
        };
        storage.saveAttachment(att);
      }
    }

    reloadTenantData(activeCompanyId);
  };

  // Add new offline letter from mobile
  const handleAddOfflineLetter = (subject: string, body: string, receiver: string) => {
    const letterId = `let_mob_${Date.now()}`;
    const nextNum = `${currentCompany.short_name}-۱۴۰۵-${String(1050 + letters.length).padStart(4, '۰')}`;

    const newLetter: Letter = {
      id: letterId,
      company_id: activeCompanyId,
      letter_number: nextNum,
      secretariat_registration_number: `د-${Math.floor(1000 + Math.random() * 9000)}`,
      letter_type: 'اداری',
      direction: 'internal',
      subject,
      body,
      letter_date: SecurityEngine.getJalaliDateNow(),
      letter_date_gregorian: new Date().toISOString().split('T')[0],
      sender_name: `${currentUser.first_name} ${currentUser.last_name}`,
      receiver_name: receiver,
      cc_recipients: [],
      responsible_user_name: `${currentUser.first_name} ${currentUser.last_name}`,
      organizational_unit: 'کلاینت همراه اندروید',
      priority: 'normal',
      response_status: 'none',
      confidentiality_level: 'normal',
      keywords: ['موبایل', 'آفلاین'],
      status: isOffline ? 'draft' : 'sent',
      qr_code_token: SecurityEngine.generateQrVerificationToken(activeCompanyId, letterId),
      is_locked: false,
      revision_number: 1,
      created_by: `${currentUser.first_name} ${currentUser.last_name}`,
      created_at: SecurityEngine.getJalaliDateTimeNow(),
      updated_at: SecurityEngine.getJalaliDateTimeNow(),
      attachments_count: 0,
    };

    handleSaveNewLetter(newLetter, []);
  };

  // Quick Open QR Verification Modal
  const handleOpenQrVerifyWithToken = (token: string) => {
    setQrTokenToVerify(token);
    setIsQrModalOpen(true);
  };

  // Next letter serial for modal
  const nextLetterSerial = `${currentCompany.short_name}-۱۴۰۵-${String(1040 + letters.length + 1).padStart(4, '۰')}`;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-600 selection:text-white" dir="rtl">
      {/* Top Global Navigation Bar */}
      <Header
        currentCompany={currentCompany}
        currentUser={currentUser}
        currentMembership={currentMembership}
        companies={companies}
        isOffline={isOffline}
        pendingSyncCount={syncQueue.length}
        onSwitchCompany={handleSwitchCompany}
        onToggleOffline={handleToggleOffline}
        onOpenQrVerify={() => {
          setQrTokenToVerify('');
          setIsQrModalOpen(true);
        }}
        onOpenAuditLogs={() => setIsAuditModalOpen(true)}
        onOpenBackup={() => setIsBackupModalOpen(true)}
        onSyncNow={handleSyncQueueNow}
        onGlobalSearch={(q) => {
          alert(`جستجوی امن در محدوده شرکت [${currentCompany.trade_name}] برای: "${q}"`);
        }}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        {/* Enterprise RTL Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentCompany={currentCompany}
          counters={{
            lettersCount: letters.length,
            archiveCount: archiveDocs.length,
            financeCount: financials.length,
            meetingsCount: boardMeetings.length,
            projectsCount: projects.length,
          }}
        />

        {/* View Tab Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {activeTab === 'dashboard' && (
            <DashboardTab
              currentCompany={currentCompany}
              letters={letters}
              archiveDocs={archiveDocs}
              financials={financials}
              boardMeetings={boardMeetings}
              projects={projects}
              auditLogs={auditLogs}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onOpenNewLetter={() => setIsGlobalLetterCreateOpen(true)}
              onOpenNewDocument={() => setActiveTab('archive')}
              onOpenNewVoucher={() => setActiveTab('finance')}
              onOpenNewMeeting={() => setActiveTab('board')}
            />
          )}

          {activeTab === 'secretariat' && (
            <SecretariatTab
              currentCompany={currentCompany}
              currentUser={currentUser}
              letters={letters}
              attachments={attachments}
              onSaveNewLetter={handleSaveNewLetter}
              onSignLetter={handleSignLetter}
              onVerifyQr={handleOpenQrVerifyWithToken}
            />
          )}

          {activeTab === 'archive' && (
            <ArchiveTab
              currentCompany={currentCompany}
              currentUser={currentUser}
              archiveDocs={archiveDocs}
              attachments={attachments}
              onSaveNewDocument={handleSaveNewArchiveDoc}
              onVerifyQr={handleOpenQrVerifyWithToken}
            />
          )}

          {activeTab === 'finance' && (
            <FinanceTab
              currentCompany={currentCompany}
              currentUser={currentUser}
              financials={financials}
              shareholders={shareholders}
              onSaveNewTransaction={(tx) => {
                storage.saveFinancialTransaction(tx);
                reloadTenantData(activeCompanyId);
              }}
            />
          )}

          {activeTab === 'board' && (
            <BoardMeetingsTab
              currentCompany={currentCompany}
              currentUser={currentUser}
              boardMeetings={boardMeetings}
              onSaveNewMeeting={(bm) => {
                storage.saveBoardMeeting(bm);
                reloadTenantData(activeCompanyId);
              }}
              onSignMinutes={(bmId) => {
                const bm = boardMeetings.find((b) => b.id === bmId);
                if (bm) {
                  const updated: BoardMeeting = {
                    ...bm,
                    status: 'minutes_signed',
                    is_locked: true,
                    minutes_signed_at: SecurityEngine.getJalaliDateTimeNow(),
                  };
                  storage.saveBoardMeeting(updated);
                  reloadTenantData(activeCompanyId);
                }
              }}
              onVerifyQr={handleOpenQrVerifyWithToken}
            />
          )}

          {activeTab === 'projects' && (
            <ProjectsTab
              currentCompany={currentCompany}
              currentUser={currentUser}
              projects={projects}
              allCompanies={companies}
              onSaveNewProject={(p) => {
                storage.saveProject(p);
                reloadTenantData(activeCompanyId);
              }}
            />
          )}

          {activeTab === 'android_sim' && (
            <AndroidSimulatorTab
              currentCompany={currentCompany}
              currentUser={currentUser}
              letters={letters}
              isOffline={isOffline}
              syncQueue={syncQueue}
              onToggleOffline={handleToggleOffline}
              onSyncQueueNow={handleSyncQueueNow}
              onAddNewOfflineLetter={handleAddOfflineLetter}
              onVerifyQr={handleOpenQrVerifyWithToken}
            />
          )}

          {activeTab === 'android_code' && <AndroidCodeTab />}

          {activeTab === 'security_tests' && (
            <SecurityTestsTab currentCompany={currentCompany} currentUser={currentUser} />
          )}

          {activeTab === 'docs_api' && <DocsAndApiTab currentCompany={currentCompany} />}
        </main>
      </div>

      {/* Global Modals */}
      {isAuditModalOpen && (
        <AuditLogModal
          isOpen={isAuditModalOpen}
          onClose={() => setIsAuditModalOpen(false)}
          auditLogs={auditLogs}
          currentCompany={currentCompany}
        />
      )}

      {isBackupModalOpen && (
        <BackupModal
          isOpen={isBackupModalOpen}
          onClose={() => setIsBackupModalOpen(false)}
          backups={backups}
          currentCompany={currentCompany}
          onCreateBackup={(b) => {
            storage.saveBackup(b);
            reloadTenantData(activeCompanyId);
          }}
          onRestoreBackup={(bId) => {
            // Restore scenario
            reloadTenantData(activeCompanyId);
          }}
        />
      )}

      {isQrModalOpen && (
        <QrVerifyModal
          isOpen={isQrModalOpen}
          onClose={() => setIsQrModalOpen(false)}
          initialToken={qrTokenToVerify}
          currentCompany={currentCompany}
          currentUser={currentUser}
        />
      )}

      {isGlobalLetterCreateOpen && (
        <LetterCreateModal
          isOpen={isGlobalLetterCreateOpen}
          onClose={() => setIsGlobalLetterCreateOpen(false)}
          onSave={handleSaveNewLetter}
          currentCompany={currentCompany}
          currentUser={currentUser}
          nextLetterNumber={nextLetterSerial}
        />
      )}
    </div>
  );
}
