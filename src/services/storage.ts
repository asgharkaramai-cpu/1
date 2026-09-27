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
  UserDevice,
  BackupRecord,
  OfflineSyncItem,
} from '../types';
import {
  INITIAL_COMPANIES,
  INITIAL_USERS,
  INITIAL_MEMBERSHIPS,
  INITIAL_LETTERS,
  INITIAL_ATTACHMENTS,
  INITIAL_ARCHIVE_DOCUMENTS,
  INITIAL_FINANCIAL_TRANSACTIONS,
  INITIAL_SHAREHOLDERS,
  INITIAL_BOARD_MEETINGS,
  INITIAL_PROJECTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_USER_DEVICES,
  INITIAL_BACKUPS,
} from './mockData';

const STORAGE_KEYS = {
  COMPANIES: 'ea_companies',
  USERS: 'ea_users',
  MEMBERSHIPS: 'ea_memberships',
  LETTERS: 'ea_letters',
  ATTACHMENTS: 'ea_attachments',
  ARCHIVE: 'ea_archive',
  FINANCE: 'ea_finance',
  SHAREHOLDERS: 'ea_shareholders',
  BOARD_MEETINGS: 'ea_board_meetings',
  PROJECTS: 'ea_projects',
  AUDIT_LOGS: 'ea_audit_logs',
  USER_DEVICES: 'ea_user_devices',
  BACKUPS: 'ea_backups',
  ACTIVE_COMPANY_ID: 'ea_active_company_id',
  ACTIVE_USER_ID: 'ea_active_user_id',
  OFFLINE_SYNC_QUEUE: 'ea_offline_sync_queue',
  IS_OFFLINE_MODE: 'ea_is_offline_mode',
};

function getStorageItem<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultVal;
    return JSON.parse(raw);
  } catch {
    return defaultVal;
  }
}

function setStorageItem<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error(`Failed to write to localStorage for key ${key}`, e);
  }
}

class SystemStorage {
  private inMemoryCache: Record<string, any> = {};

  constructor() {
    this.initIfEmpty();
  }

  public initIfEmpty() {
    if (!localStorage.getItem(STORAGE_KEYS.COMPANIES)) {
      setStorageItem(STORAGE_KEYS.COMPANIES, INITIAL_COMPANIES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      setStorageItem(STORAGE_KEYS.USERS, INITIAL_USERS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.MEMBERSHIPS)) {
      setStorageItem(STORAGE_KEYS.MEMBERSHIPS, INITIAL_MEMBERSHIPS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.LETTERS)) {
      setStorageItem(STORAGE_KEYS.LETTERS, INITIAL_LETTERS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.ATTACHMENTS)) {
      setStorageItem(STORAGE_KEYS.ATTACHMENTS, INITIAL_ATTACHMENTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.ARCHIVE)) {
      setStorageItem(STORAGE_KEYS.ARCHIVE, INITIAL_ARCHIVE_DOCUMENTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.FINANCE)) {
      setStorageItem(STORAGE_KEYS.FINANCE, INITIAL_FINANCIAL_TRANSACTIONS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SHAREHOLDERS)) {
      setStorageItem(STORAGE_KEYS.SHAREHOLDERS, INITIAL_SHAREHOLDERS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.BOARD_MEETINGS)) {
      setStorageItem(STORAGE_KEYS.BOARD_MEETINGS, INITIAL_BOARD_MEETINGS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.PROJECTS)) {
      setStorageItem(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
      setStorageItem(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.USER_DEVICES)) {
      setStorageItem(STORAGE_KEYS.USER_DEVICES, INITIAL_USER_DEVICES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.BACKUPS)) {
      setStorageItem(STORAGE_KEYS.BACKUPS, INITIAL_BACKUPS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.ACTIVE_COMPANY_ID)) {
      setStorageItem(STORAGE_KEYS.ACTIVE_COMPANY_ID, 'comp_sepehr');
    }
    if (!localStorage.getItem(STORAGE_KEYS.ACTIVE_USER_ID)) {
      setStorageItem(STORAGE_KEYS.ACTIVE_USER_ID, 'usr_admin');
    }
    if (!localStorage.getItem(STORAGE_KEYS.OFFLINE_SYNC_QUEUE)) {
      setStorageItem(STORAGE_KEYS.OFFLINE_SYNC_QUEUE, []);
    }
  }

  // Companies
  public getCompanies(): Company[] {
    return getStorageItem(STORAGE_KEYS.COMPANIES, INITIAL_COMPANIES);
  }

  public getCompany(id: string): Company | undefined {
    return this.getCompanies().find((c) => c.id === id);
  }

  public saveCompany(company: Company): void {
    const list = this.getCompanies();
    const idx = list.findIndex((c) => c.id === company.id);
    if (idx >= 0) {
      list[idx] = company;
    } else {
      list.push(company);
    }
    setStorageItem(STORAGE_KEYS.COMPANIES, list);
  }

  // Users & Memberships
  public getUsers(): User[] {
    return getStorageItem(STORAGE_KEYS.USERS, INITIAL_USERS);
  }

  public getUser(id: string): User | undefined {
    return this.getUsers().find((u) => u.id === id);
  }

  public getMemberships(): CompanyMembership[] {
    return getStorageItem(STORAGE_KEYS.MEMBERSHIPS, INITIAL_MEMBERSHIPS);
  }

  public getUserMemberships(userId: string): CompanyMembership[] {
    return this.getMemberships().filter((m) => m.user_id === userId && m.is_active);
  }

  public getUserCompanyMembership(userId: string, companyId: string): CompanyMembership | undefined {
    return this.getMemberships().find((m) => m.user_id === userId && m.company_id === companyId && m.is_active);
  }

  // Active Company and User Context
  public getActiveCompanyId(): string {
    return getStorageItem(STORAGE_KEYS.ACTIVE_COMPANY_ID, 'comp_sepehr');
  }

  public setActiveCompanyId(companyId: string): void {
    setStorageItem(STORAGE_KEYS.ACTIVE_COMPANY_ID, companyId);
  }

  public getActiveUserId(): string {
    return getStorageItem(STORAGE_KEYS.ACTIVE_USER_ID, 'usr_admin');
  }

  public setActiveUserId(userId: string): void {
    setStorageItem(STORAGE_KEYS.ACTIVE_USER_ID, userId);
  }

  // Letters (Tenant Scoped)
  public getLetters(companyId?: string): Letter[] {
    const all = getStorageItem<Letter[]>(STORAGE_KEYS.LETTERS, INITIAL_LETTERS);
    if (!companyId) return all;
    return all.filter((l) => l.company_id === companyId);
  }

  public getLetter(letterId: string, companyId?: string): Letter | undefined {
    const letters = this.getLetters(companyId);
    return letters.find((l) => l.id === letterId);
  }

  public saveLetter(letter: Letter): void {
    const all = this.getLetters();
    const idx = all.findIndex((l) => l.id === letter.id);
    if (idx >= 0) {
      all[idx] = letter;
    } else {
      all.unshift(letter);
    }
    setStorageItem(STORAGE_KEYS.LETTERS, all);
  }

  // Attachments (Tenant Scoped)
  public getAttachments(companyId?: string): Attachment[] {
    const all = getStorageItem<Attachment[]>(STORAGE_KEYS.ATTACHMENTS, INITIAL_ATTACHMENTS);
    if (!companyId) return all;
    return all.filter((a) => a.company_id === companyId && !a.is_deleted);
  }

  public getRecordAttachments(recordId: string, companyId?: string): Attachment[] {
    const all = this.getAttachments(companyId);
    return all.filter((a) => a.parent_record_id === recordId);
  }

  public saveAttachment(attachment: Attachment): void {
    const all = getStorageItem<Attachment[]>(STORAGE_KEYS.ATTACHMENTS, INITIAL_ATTACHMENTS);
    const idx = all.findIndex((a) => a.id === attachment.id);
    if (idx >= 0) {
      all[idx] = attachment;
    } else {
      all.unshift(attachment);
    }
    setStorageItem(STORAGE_KEYS.ATTACHMENTS, all);
  }

  // Archive Documents (Tenant Scoped)
  public getArchiveDocuments(companyId?: string): ArchiveDocument[] {
    const all = getStorageItem<ArchiveDocument[]>(STORAGE_KEYS.ARCHIVE, INITIAL_ARCHIVE_DOCUMENTS);
    if (!companyId) return all;
    return all.filter((d) => d.company_id === companyId);
  }

  public saveArchiveDocument(doc: ArchiveDocument): void {
    const all = this.getArchiveDocuments();
    const idx = all.findIndex((d) => d.id === doc.id);
    if (idx >= 0) {
      all[idx] = doc;
    } else {
      all.unshift(doc);
    }
    setStorageItem(STORAGE_KEYS.ARCHIVE, all);
  }

  // Financial (Tenant Scoped)
  public getFinancialTransactions(companyId?: string): FinancialTransaction[] {
    const all = getStorageItem<FinancialTransaction[]>(STORAGE_KEYS.FINANCE, INITIAL_FINANCIAL_TRANSACTIONS);
    if (!companyId) return all;
    return all.filter((f) => f.company_id === companyId);
  }

  public saveFinancialTransaction(tx: FinancialTransaction): void {
    const all = this.getFinancialTransactions();
    const idx = all.findIndex((f) => f.id === tx.id);
    if (idx >= 0) {
      all[idx] = tx;
    } else {
      all.unshift(tx);
    }
    setStorageItem(STORAGE_KEYS.FINANCE, all);
  }

  // Shareholders (Tenant Scoped)
  public getShareholders(companyId?: string): Shareholder[] {
    const all = getStorageItem<Shareholder[]>(STORAGE_KEYS.SHAREHOLDERS, INITIAL_SHAREHOLDERS);
    if (!companyId) return all;
    return all.filter((s) => s.company_id === companyId);
  }

  public saveShareholder(sh: Shareholder): void {
    const all = this.getShareholders();
    const idx = all.findIndex((s) => s.id === sh.id);
    if (idx >= 0) {
      all[idx] = sh;
    } else {
      all.push(sh);
    }
    setStorageItem(STORAGE_KEYS.SHAREHOLDERS, all);
  }

  // Board Meetings (Tenant Scoped)
  public getBoardMeetings(companyId?: string): BoardMeeting[] {
    const all = getStorageItem<BoardMeeting[]>(STORAGE_KEYS.BOARD_MEETINGS, INITIAL_BOARD_MEETINGS);
    if (!companyId) return all;
    return all.filter((b) => b.company_id === companyId);
  }

  public saveBoardMeeting(bm: BoardMeeting): void {
    const all = this.getBoardMeetings();
    const idx = all.findIndex((b) => b.id === bm.id);
    if (idx >= 0) {
      all[idx] = bm;
    } else {
      all.unshift(bm);
    }
    setStorageItem(STORAGE_KEYS.BOARD_MEETINGS, all);
  }

  // Projects (Tenant Scoped or Joint)
  public getProjects(companyId?: string): Project[] {
    const all = getStorageItem<Project[]>(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
    if (!companyId) return all;
    return all.filter(
      (p) => p.company_id === companyId || p.joint_partners?.some((jp) => jp.company_id === companyId)
    );
  }

  public saveProject(p: Project): void {
    const all = getStorageItem<Project[]>(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
    const idx = all.findIndex((item) => item.id === p.id);
    if (idx >= 0) {
      all[idx] = p;
    } else {
      all.unshift(p);
    }
    setStorageItem(STORAGE_KEYS.PROJECTS, all);
  }

  // Audit Logs
  public getAuditLogs(companyId?: string): AuditLog[] {
    const all = getStorageItem<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
    if (!companyId) return all;
    return all.filter((l) => l.company_id === companyId);
  }

  public appendAuditLog(log: AuditLog): void {
    const all = this.getAuditLogs();
    all.unshift(log);
    setStorageItem(STORAGE_KEYS.AUDIT_LOGS, all.slice(0, 150)); // keep top 150
  }

  // User Devices
  public getUserDevices(userId?: string): UserDevice[] {
    const all = getStorageItem<UserDevice[]>(STORAGE_KEYS.USER_DEVICES, INITIAL_USER_DEVICES);
    if (!userId) return all;
    return all.filter((d) => d.user_id === userId);
  }

  public revokeDevice(deviceId: string): void {
    const all = this.getUserDevices();
    const target = all.find((d) => d.id === deviceId);
    if (target) {
      target.is_active = false;
      setStorageItem(STORAGE_KEYS.USER_DEVICES, all);
    }
  }

  // Backups
  public getBackups(companyId?: string | null): BackupRecord[] {
    const all = getStorageItem<BackupRecord[]>(STORAGE_KEYS.BACKUPS, INITIAL_BACKUPS);
    if (companyId === undefined) return all;
    return all.filter((b) => b.company_id === companyId);
  }

  public saveBackup(backup: BackupRecord): void {
    const all = this.getBackups();
    all.unshift(backup);
    setStorageItem(STORAGE_KEYS.BACKUPS, all);
  }

  // Offline Mode & Sync Queue
  public isOfflineMode(): boolean {
    return getStorageItem<boolean>(STORAGE_KEYS.IS_OFFLINE_MODE, false);
  }

  public setOfflineMode(isOffline: boolean): void {
    setStorageItem(STORAGE_KEYS.IS_OFFLINE_MODE, isOffline);
  }

  public getSyncQueue(companyId?: string): OfflineSyncItem[] {
    const all = getStorageItem<OfflineSyncItem[]>(STORAGE_KEYS.OFFLINE_SYNC_QUEUE, []);
    if (!companyId) return all;
    return all.filter((item) => item.company_id === companyId);
  }

  public enqueueSyncItem(item: OfflineSyncItem): void {
    const all = getStorageItem<OfflineSyncItem[]>(STORAGE_KEYS.OFFLINE_SYNC_QUEUE, []);
    all.push(item);
    setStorageItem(STORAGE_KEYS.OFFLINE_SYNC_QUEUE, all);
  }

  public clearSyncQueue(companyId?: string): void {
    if (!companyId) {
      setStorageItem(STORAGE_KEYS.OFFLINE_SYNC_QUEUE, []);
    } else {
      const all = getStorageItem<OfflineSyncItem[]>(STORAGE_KEYS.OFFLINE_SYNC_QUEUE, []);
      setStorageItem(
        STORAGE_KEYS.OFFLINE_SYNC_QUEUE,
        all.filter((i) => i.company_id !== companyId)
      );
    }
  }

  // Complete Database Reset
  public resetToDefaults(): void {
    localStorage.clear();
    this.initIfEmpty();
  }
}

export const storage = new SystemStorage();
