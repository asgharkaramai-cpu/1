import React, { useState } from 'react';
import {
  BookOpenText,
  Terminal,
  Server,
  Database,
  ShieldCheck,
  Code2,
  Copy,
  Check,
  ExternalLink,
  ChevronDown,
  Layers,
  FileCode,
} from 'lucide-react';
import { Company } from '../types';

interface Endpoint {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  path: string;
  summaryFa: string;
  descriptionFa: string;
  authRequired: boolean;
  sampleRequest?: string;
  sampleResponse: string;
}

const API_ENDPOINTS: Endpoint[] = [
  // Auth
  {
    method: 'POST',
    path: '/api/v1/auth/login',
    summaryFa: 'ورود به سامانه با نام کاربری و رمز عبور',
    descriptionFa: 'ارزیابی اعتبار، اعتبارسنجی دو مرحله‌ای، صدور Access Token کوتاه‌مدت (۱۵ دقیقه) و Refresh Token قابل ابطال.',
    authRequired: false,
    sampleRequest: `{\n  "username": "s.radmanesh",\n  "password": "Password@2026!"\n}`,
    sampleResponse: `{\n  "statusCode": 200,\n  "data": {\n    "accessToken": "eyJhbGciOiJIUzI1NiIs...",\n    "refreshToken": "ref_9a8b7c6d5e...",\n    "expiresIn": 900,\n    "user": {\n      "id": "usr_radmanesh",\n      "name": "سارا رادمنش",\n      "defaultCompanyId": "comp_sepehr"\n    }\n  }\n}`,
  },
  {
    method: 'GET',
    path: '/api/v1/companies',
    summaryFa: 'فهرست شرکت‌های مجاز کاربر',
    descriptionFa: 'دریافت فهرست شرکت‌هایی که کاربر در آنها عضویت فعال دارد به همراه نقش و اختیارات.',
    authRequired: true,
    sampleResponse: `{\n  "statusCode": 200,\n  "data": [\n    {\n      "companyId": "comp_sepehr",\n      "tradeName": "فناوری نوین سپهر",\n      "role": "company_admin",\n      "isDefault": true\n    }\n  ]\n}`,
  },
  {
    method: 'POST',
    path: '/api/v1/companies/{companyId}/switch',
    summaryFa: 'تغییر شرکت فعال و پاکسازی کَش قبلی',
    descriptionFa: 'تغییر زمینه مستاجر فعال (Tenant Context). توکن موقت با شرکت فعال جدید صادر شده و کَش دستگاه پاک می‌شود.',
    authRequired: true,
    sampleResponse: `{\n  "statusCode": 200,\n  "message": "زمینه شرکت فعال با موفقیت تغییر یافت.",\n  "activeCompanyId": "comp_sepehr"\n}`,
  },
  {
    method: 'GET',
    path: '/api/v1/companies/{companyId}/letters',
    summaryFa: 'فهرست نامه‌های دبیرخانه شرکت فعال',
    descriptionFa: 'دریافت نامه‌ها با اعتبارسنجی هدر X-Company-Id و جلوگیری از دسترسی بین‌شرکتی.',
    authRequired: true,
    sampleResponse: `{\n  "statusCode": 200,\n  "companyId": "comp_sepehr",\n  "total": 48,\n  "items": [\n    {\n      "id": "let_sep_101",\n      "letterNumber": "سپهر-۱۴۰۵-۱۰۴۲",\n      "subject": "ارسال پیش‌نویس قرارداد ابری",\n      "status": "signed",\n      "isLocked": true\n    }\n  ]\n}`,
  },
  {
    method: 'POST',
    path: '/api/v1/companies/{companyId}/letters/{letterId}/sign',
    summaryFa: 'امضای الکترونیکی دیجیتال و قفل سند',
    descriptionFa: 'محاسبه هش SHA-256 محتوای نامه، ثبت امضای کاربر با کلید اختصاصی Keystore و قفل قطعی سند.',
    authRequired: true,
    sampleRequest: `{\n  "signatureHash": "e3b0c44298fc1c149afbf4c8...",\n  "signerRole": "company_admin"\n}`,
    sampleResponse: `{\n  "statusCode": 200,\n  "message": "نامه با موفقیت امضا و قفل گردید.",\n  "documentHash": "a1b2c3d4e5f6...",\n  "isLocked": true,\n  "signedAt": "۱۴۰۵/۰۷/۰۶ ۱۰:۳۰"\n}`,
  },
  {
    method: 'POST',
    path: '/api/v1/companies/{companyId}/attachments/upload-init',
    summaryFa: 'آغاز بارگذاری فایل با بررسی پسوند و بدافزار',
    descriptionFa: 'بررسی پسوندهای ممنوعه (EXE, APK, BAT, SH)، تولید مسیر ایزوله Storage و اعتبارسنجی اندازه فایل.',
    authRequired: true,
    sampleRequest: `{\n  "fileName": "contract_draft.pdf",\n  "fileSize": 2458000,\n  "claimedMimeType": "application/pdf",\n  "module": "secretariat",\n  "parentRecordId": "let_sep_101"\n}`,
    sampleResponse: `{\n  "statusCode": 201,\n  "uploadId": "upl_889921",\n  "storagePath": "tenant/comp_sepehr/secretariat/let_sep_101/f47ac10b.pdf",\n  "presignedUploadUrl": "https://storage.local/upload?sig=..."\n}`,
  },
  {
    method: 'POST',
    path: '/api/v1/companies/{companyId}/backup',
    summaryFa: 'تهیه نسخه پشتیبان تفکیک‌شده شرکت',
    descriptionFa: 'پشتیبان‌گیری کامل از پایگاه داده، ضمایم، امضاها و لاگ‌های شرکت مشخص بدون تداخل با سایر مستاجران.',
    authRequired: true,
    sampleResponse: `{\n  "statusCode": 202,\n  "backupId": "bak_comp_sepehr_14050706",\n  "status": "completed",\n  "fileSizeMb": 284.5,\n  "checksumSha256": "9a8b7c6d5e4f3a2b1c..."\n}`,
  },
];

const DOCKER_COMPOSE_SNIPPET = `version: '3.8'

services:
  # NestJS / TypeScript Backend Enterprise Core
  backend:
    image: enterprise-automation-backend:1.4.0
    restart: always
    environment:
      - NODE_ENV=production
      - PORT=3000
      - DATABASE_URL=postgresql://tenant_admin:SecPostgres2026!@postgres:5432/enterprise_db
      - REDIS_URL=redis://:RedisSecureAuth2026!@redis:6379/0
      - S3_ENDPOINT=minio:9000
      - S3_ACCESS_KEY=MinioAdminEnterprise
      - S3_SECRET_KEY=MinioSecretSecure2026!
      - JWT_SECRET=SuperSecretEnterpriseJwtSignKey2026!
    depends_on:
      - postgres
      - redis
      - minio
    ports:
      - "3000:3000"

  # PostgreSQL with Row-Level Security (RLS) for Multi-Tenancy
  postgres:
    image: postgres:16-alpine
    restart: always
    environment:
      POSTGRES_USER: tenant_admin
      POSTGRES_PASSWORD: SecPostgres2026!
      POSTGRES_DB: enterprise_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  # Redis for Token Blacklist, Cache & Rate Limiting
  redis:
    image: redis:7-alpine
    restart: always
    command: redis-server --requirepass RedisSecureAuth2026!
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"

  # MinIO S3-Compatible Object Storage for Attachments
  minio:
    image: minio/minio:latest
    restart: always
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: MinioAdminEnterprise
      MINIO_ROOT_PASSWORD: MinioSecretSecure2026!
    volumes:
      - minio_data:/data
    ports:
      - "9000:9000"
      - "9001:9001"

  # Reverse Proxy & SSL Termination
  nginx:
    image: nginx:alpine
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - backend

volumes:
  postgres_data:
  redis_data:
  minio_data:
`;

export const DocsAndApiTab: React.FC<{ currentCompany: Company }> = ({ currentCompany }) => {
  const [activeDocSection, setActiveDocSection] = useState<'swagger' | 'architecture' | 'docker'>('swagger');
  const [expandedEndpoint, setExpandedEndpoint] = useState<string | null>(API_ENDPOINTS[0].path);
  const [copiedCode, setCopiedCode] = useState(false);

  const getMethodBadge = (m: string) => {
    switch (m) {
      case 'GET':
        return <span className="bg-blue-600 text-white px-2 py-0.5 rounded font-mono font-bold text-[10px]">GET</span>;
      case 'POST':
        return <span className="bg-emerald-600 text-white px-2 py-0.5 rounded font-mono font-bold text-[10px]">POST</span>;
      case 'PATCH':
        return <span className="bg-amber-600 text-white px-2 py-0.5 rounded font-mono font-bold text-[10px]">PATCH</span>;
      case 'DELETE':
        return <span className="bg-rose-600 text-white px-2 py-0.5 rounded font-mono font-bold text-[10px]">DELETE</span>;
      default:
        return null;
    }
  };

  const handleCopyDocker = () => {
    navigator.clipboard.writeText(DOCKER_COMPOSE_SNIPPET);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-800">
              مستندات معماری کلان، استقرار Docker و Swagger OpenAPI
            </h2>
            <span className="text-[11px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-bold border border-indigo-200">
              OpenAPI v3.0 / REST v1
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            راهنمای کامل توسعه‌دهندگان، مهندسان DevOps و تیم ممیزی امنیت برای یکپارچه‌سازی و تست اندپوینت‌ها
          </p>
        </div>

        {/* Section Tabs */}
        <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 text-xs">
          <button
            onClick={() => setActiveDocSection('swagger')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeDocSection === 'swagger' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600'
            }`}
          >
            کنسول Swagger API
          </button>
          <button
            onClick={() => setActiveDocSection('architecture')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeDocSection === 'architecture' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600'
            }`}
          >
            سند معماری و چندمستاجری
          </button>
          <button
            onClick={() => setActiveDocSection('docker')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activeDocSection === 'docker' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600'
            }`}
          >
            فایل Docker Compose
          </button>
        </div>
      </div>

      {activeDocSection === 'swagger' && (
        <div className="space-y-3">
          <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl text-xs text-indigo-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-indigo-700" />
              <span>
                سرور اصلی: <code className="font-mono font-bold">https://api.enterprise.local/api/v1</code>
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">
              X-Company-Id Header: {currentCompany.id}
            </span>
          </div>

          <div className="space-y-2">
            {API_ENDPOINTS.map((ep) => {
              const isExpanded = expandedEndpoint === ep.path;
              return (
                <div
                  key={ep.path}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs transition-all"
                >
                  <button
                    onClick={() => setExpandedEndpoint(isExpanded ? null : ep.path)}
                    className="w-full p-3.5 flex items-center justify-between text-right hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      {getMethodBadge(ep.method)}
                      <span className="font-mono font-bold text-slate-800 text-xs">{ep.path}</span>
                      <span className="text-slate-400 text-xs hidden sm:inline">-</span>
                      <span className="text-xs font-semibold text-slate-700 hidden sm:inline">{ep.summaryFa}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {ep.authRequired && (
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                          Bearer JWT
                        </span>
                      )}
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="p-4 bg-slate-50/70 border-t border-slate-200 space-y-3 text-xs">
                      <p className="text-slate-600 leading-relaxed">{ep.descriptionFa}</p>

                      {ep.sampleRequest && (
                        <div>
                          <p className="font-bold text-slate-700 mb-1 font-mono text-[11px]">Request Body (JSON):</p>
                          <pre className="p-3 bg-slate-900 text-emerald-400 rounded-xl font-mono text-[11px] overflow-x-auto" dir="ltr">
                            <code>{ep.sampleRequest}</code>
                          </pre>
                        </div>
                      )}

                      <div>
                        <p className="font-bold text-slate-700 mb-1 font-mono text-[11px]">Response (200 OK / 201 Created):</p>
                        <pre className="p-3 bg-slate-900 text-emerald-400 rounded-xl font-mono text-[11px] overflow-x-auto" dir="ltr">
                          <code>{ep.sampleResponse}</code>
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeDocSection === 'architecture' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6 text-xs text-slate-700 leading-relaxed">
          <div className="border-b border-slate-200 pb-4">
            <h3 className="text-base font-bold text-slate-900 mb-2">
              اصول معماری چندشرکتی و تفکیک داده‌ها (Multi-Tenant Architecture Constitution)
            </h3>
            <p>
              در این سامانه هر شرکت به عنوان یک مستاجر مستقل (Tenant) در نظر گرفته می‌شود. کلیه داده‌ها در پایگاه داده دارای شناسه <code className="font-bold text-indigo-700">company_id</code> بوده و تفکیک داده‌ها در ۷ لایه اعمال می‌گردد.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Database className="w-4 h-4 text-indigo-600" />
                ۱. تفکیک پایگاه داده و مخزن فایل
              </h4>
              <p>
                فایل‌ها با ساختار امن <code className="font-mono text-indigo-600">tenant/{'{company_id}'}/{'{module}'}/{'{record_id}'}/{'{uuid}'}</code> بدون استفاده از نام کاربر در سرور MinIO ذخیره می‌شوند.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                ۲. ممیزی و Audit Log غیرقابل تغییر
              </h4>
              <p>
                کوچک‌ترین تلاش برای دسترسی به رکورد شرکت دیگر در جدول لاگ ممیزی ثبت و کد ۴۰۳ فوربیدن صادر می‌گردد.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeDocSection === 'docker' && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl text-xs">
          <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex items-center justify-between text-slate-300">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-emerald-400" />
              <span className="font-mono font-bold text-emerald-400">docker-compose.yml</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">استقرار سازمانی (PostgreSQL, Redis, MinIO, Nginx)</span>
            </div>

            <button
              onClick={handleCopyDocker}
              className="flex items-center gap-1 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-sans transition-colors cursor-pointer"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedCode ? 'کپی شد!' : 'کپی فایل Docker'}
            </button>
          </div>

          <pre className="p-4 font-mono text-slate-200 overflow-x-auto max-h-[500px] leading-relaxed selection:bg-indigo-600 selection:text-white" dir="ltr">
            <code>{DOCKER_COMPOSE_SNIPPET}</code>
          </pre>
        </div>
      )}
    </div>
  );
};
