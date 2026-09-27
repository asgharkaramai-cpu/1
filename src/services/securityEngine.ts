import { storage } from './storage';
import { AuditLog, Letter, Attachment, ConfidentialityLevel } from '../types';

export interface SecurityValidationResult {
  allowed: boolean;
  code: number;
  messageFa: string;
  auditLogged: boolean;
}

export interface FileValidationResult {
  isValid: boolean;
  errorMessageFa?: string;
  quarantine: boolean;
  sha256: string;
  storagePath: string;
  storageName: string;
}

// Allowed extensions
const ALLOWED_EXTENSIONS = [
  'pdf',
  'doc',
  'docx',
  'xls',
  'xlsx',
  'ppt',
  'pptx',
  'jpg',
  'jpeg',
  'png',
  'tiff',
  'txt',
  'csv',
];

// Forbidden high-risk executable / script extensions
const FORBIDDEN_EXTENSIONS = [
  'exe',
  'apk',
  'bat',
  'cmd',
  'sh',
  'js',
  'dll',
  'msi',
  'vbs',
  'scr',
  'ps1',
  'com',
  'bin',
];

export class SecurityEngine {
  /**
   * Generates a random UUID v4
   */
  public static generateUuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * Generates a pseudo SHA-256 hex string for demonstration/cryptographic hashing
   */
  public static computeSha256(content: string): string {
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    // expand to 64 chars
    return (hex + 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855').slice(0, 64);
  }

  /**
   * Multi-Tenant Cross-Access Enforcer:
   * Asserts that active company matches record company. If not, throws and logs forbidden attempt.
   */
  public static assertTenantAccess(
    activeCompanyId: string,
    recordCompanyId: string,
    action: string,
    module: string,
    recordId: string,
    currentUser: { id: string; name: string; role: string }
  ): SecurityValidationResult {
    if (activeCompanyId !== recordCompanyId) {
      // Security Incident! Cross-tenant violation
      const incidentLog: AuditLog = {
        id: `inc_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        company_id: recordCompanyId,
        user_id: currentUser.id,
        user_name: currentUser.name,
        user_role: currentUser.role,
        module,
        action: `cross_tenant_violation_${action}`,
        record_type: module,
        record_id: recordId,
        ip_address: '192.168.10.99',
        device_name: 'Client Device',
        timestamp: SecurityEngine.getJalaliDateTimeNow(),
        status: 'forbidden_attempt',
        failure_reason: `تلاش غیرمجاز برای دسترسی به داده شرکت [${recordCompanyId}] توسط کاربر عضو شرکت [${activeCompanyId}]. اصل جداسازی چندمستاجری (Tenant Isolation) نقض شد.`,
        details: `شناسه رکورد درخواستی: ${recordId}. دسترسی در لایه امنیتی Repository مسدود شد.`,
      };
      storage.appendAuditLog(incidentLog);

      return {
        allowed: false,
        code: 403,
        messageFa: 'خطای ۴۰۳ عدم دسترسی بین‌شرکتی: شما مجاز به مشاهده یا ویرایش اطلاعات شرکت دیگر نیستید.',
        auditLogged: true,
      };
    }

    return {
      allowed: true,
      code: 200,
      messageFa: 'دسترسی مجاز است.',
      auditLogged: false,
    };
  }

  /**
   * File Security Validation Engine:
   * Checks extension whitelist, blacklist, size, and generates tenant isolated path.
   */
  public static validateUploadedFile(
    fileName: string,
    fileSize: number,
    claimedMimeType: string,
    companyId: string,
    moduleName: string,
    parentRecordId: string
  ): FileValidationResult {
    const extMatch = fileName.split('.').pop();
    const ext = (extMatch ? extMatch.toLowerCase() : '').trim();

    // 1. Blacklist check
    if (FORBIDDEN_EXTENSIONS.includes(ext)) {
      return {
        isValid: false,
        errorMessageFa: `بارگذاری این نوع فایل (${ext.toUpperCase()}) به دلایل امنیتی و محافظت در برابر بدافزار و اسکریپت‌های اجرایی به طور قطعی مسدود است.`,
        quarantine: true,
        sha256: '',
        storagePath: '',
        storageName: '',
      };
    }

    // 2. Whitelist check
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return {
        isValid: false,
        errorMessageFa: `پسوند فایل (${ext}) در فهرست پسوندهای مجاز سازمانی قرار ندارد. پسوندهای مجاز: PDF, Word, Excel, PowerPoint, تصاویر و متن.`,
        quarantine: false,
        sha256: '',
        storagePath: '',
        storageName: '',
      };
    }

    // 3. Size check (Max 25 MB)
    const MAX_SIZE = 25 * 1024 * 1024;
    if (fileSize > MAX_SIZE) {
      return {
        isValid: false,
        errorMessageFa: `حجم فایل (${(fileSize / (1024 * 1024)).toFixed(1)} مگابایت) بیشتر از سقف مجاز ۲۵ مگابایت است.`,
        quarantine: false,
        sha256: '',
        storagePath: '',
        storageName: '',
      };
    }

    // 4. Generate random file ID and isolated path
    const randomUuid = SecurityEngine.generateUuid();
    const storageName = `${randomUuid}.${ext}`;
    const storagePath = `tenant/${companyId}/${moduleName}/${parentRecordId}/${storageName}`;
    const sha256 = SecurityEngine.computeSha256(fileName + fileSize + storagePath + Date.now());

    return {
      isValid: true,
      quarantine: false,
      sha256,
      storagePath,
      storageName,
    };
  }

  /**
   * Digital Signature Application:
   * Locks the document, hashes the content, records signer ID and timestamp.
   */
  public static signLetter(
    letter: Letter,
    signerUserId: string,
    signerName: string
  ): Letter {
    if (letter.is_locked) {
      throw new Error('این نامه پیش از این امضا و قفل شده است و قابل امضای مجدد مستقیم نمی‌باشد.');
    }

    const docHash = SecurityEngine.computeSha256(
      `${letter.id}_${letter.company_id}_${letter.letter_number}_${letter.body}_${letter.subject}`
    );
    const sigHash = SecurityEngine.computeSha256(
      `${signerUserId}_${docHash}_${Date.now()}`
    );

    const signedLetter: Letter = {
      ...letter,
      status: 'signed',
      signed_by_user_id: signerUserId,
      signed_by_user_name: signerName,
      signed_at: SecurityEngine.getJalaliDateTimeNow(),
      signature_hash: sigHash,
      document_hash: docHash,
      is_locked: true,
      locked_at: SecurityEngine.getJalaliDateTimeNow(),
      updated_at: SecurityEngine.getJalaliDateTimeNow(),
    };

    return signedLetter;
  }

  /**
   * QR Code token generation
   */
  public static generateQrVerificationToken(companyId: string, recordId: string): string {
    const raw = `QR_${companyId}_${recordId}_${Date.now()}_${Math.random().toString(36).substring(4, 10)}`;
    return raw.toUpperCase();
  }

  /**
   * Formats current time into Persian Jalali string (e.g. ۱۴۰۵/۰۷/۰۶ ۱۰:۳۰)
   */
  public static getJalaliDateTimeNow(): string {
    const now = new Date();
    // Simplified Persian Jalali conversion for 2026/2027
    const year = 1405;
    const month = '۰۷';
    const day = String(now.getDate()).padStart(2, '۰');
    const hours = String(now.getHours()).padStart(2, '۰');
    const minutes = String(now.getMinutes()).padStart(2, '۰');
    return `${year}/${month}/${day} ${hours}:${minutes}`;
  }

  public static getJalaliDateNow(): string {
    const now = new Date();
    const year = 1405;
    const month = '۰۷';
    const day = String(now.getDate()).padStart(2, '۰');
    return `${year}/${month}/${day}`;
  }
}
