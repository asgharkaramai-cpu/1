export type ConfidentialityLevel = 'normal' | 'confidential' | 'secret' | 'top_secret';

export type LetterDirection = 'incoming' | 'outgoing' | 'internal';
export type LetterPriority = 'normal' | 'instant' | 'critical';
export type LetterStatus = 'draft' | 'pending_signature' | 'signed' | 'sent' | 'delivered' | 'archived';

export type UserRole =
  | 'super_admin'
  | 'company_admin'
  | 'unit_manager'
  | 'employee'
  | 'financial_manager'
  | 'secretary'
  | 'archivist'
  | 'board_member'
  | 'shareholder'
  | 'auditor'
  | 'project_manager'
  | 'legal_representative'
  | 'read_only_observer';

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  father_name: string;
  national_id: string;
  birth_date: string;
  mobile: string;
  email: string;
  username: string;
  profile_image_url: string;
  is_active: boolean;
  last_login_at: string;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  legal_name: string;
  trade_name: string;
  short_name: string;
  national_id: string;
  registration_number: string;
  legal_type: string;
  establishment_date: string;
  economic_code: string;
  workshop_code: string;
  business_scope: string;
  phone: string;
  mobile: string;
  official_email: string;
  website: string;
  head_office_address: string;
  postal_code: string;
  ceo_name: string;
  chairman_name: string;
  legal_representative: string;
  brand_color: string;
  logo_url: string;
  stamp_url: string;
  letterhead_url: string;
  subscription_start_at: string;
  subscription_end_at: string;
  status: 'active' | 'suspended' | 'expired';
  description: string;
  created_at: string;
  updated_at: string;
}

export interface CompanyMembership {
  id: string;
  user_id: string;
  company_id: string;
  organizational_unit: string;
  position_title: string;
  role: UserRole;
  access_start_at: string;
  access_end_at: string;
  is_active: boolean;
  is_default_company: boolean;
  signature_url?: string;
  signature_valid_until?: string;
  created_at: string;
}

export interface Letter {
  id: string;
  company_id: string;
  letter_number: string;
  secretariat_registration_number: string;
  letter_type: string;
  direction: LetterDirection;
  subject: string;
  body: string;
  letter_date: string; // Jalali representation
  letter_date_gregorian: string;
  received_date?: string;
  sent_date?: string;
  sender_name: string;
  receiver_name: string;
  cc_recipients: string[];
  referred_to_user_id?: string;
  responsible_user_name: string;
  organizational_unit: string;
  priority: LetterPriority;
  response_deadline?: string;
  response_status: 'none' | 'pending' | 'answered' | 'expired';
  confidentiality_level: ConfidentialityLevel;
  keywords: string[];
  description?: string;
  status: LetterStatus;
  qr_code_token: string;
  signed_by_user_id?: string;
  signed_by_user_name?: string;
  signed_at?: string;
  signature_hash?: string;
  document_hash?: string;
  is_locked: boolean;
  locked_at?: string;
  revision_number: number;
  amendment_reason?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  attachments_count: number;
}

export interface ArchiveDocument {
  id: string;
  company_id: string;
  archive_code: string;
  case_folder_number: string;
  title: string;
  subject: string;
  document_type: 'contract' | 'financial' | 'legal' | 'administrative' | 'project' | 'board' | 'technical';
  direction?: LetterDirection;
  document_date: string;
  sender_or_issuer: string;
  receiver: string;
  organizational_unit: string;
  responsible_person: string;
  confidentiality_level: ConfidentialityLevel;
  retention_period_years: number;
  status: 'active' | 'archived' | 'expired' | 'locked';
  keywords: string[];
  description: string;
  qr_code_token: string;
  version: number;
  storage_path: string;
  file_name: string;
  file_size_kb: number;
  file_extension: string;
  sha256_hash: string;
  ocr_extracted_text?: string;
  is_locked: boolean;
  created_at: string;
  updated_at: string;
}

export interface Attachment {
  id: string;
  company_id: string;
  module_name: 'secretariat' | 'archive' | 'finance' | 'projects' | 'board';
  parent_record_type: 'letter' | 'document' | 'voucher' | 'meeting' | 'project';
  parent_record_id: string;
  display_name: string;
  storage_name: string;
  storage_path: string;
  extension: string;
  mime_type: string;
  actual_mime_type: string;
  file_size: number;
  version: number;
  uploaded_by: string;
  uploaded_at: string;
  description?: string;
  confidentiality_level: ConfidentialityLevel;
  malware_scan_status: 'clean' | 'scanning' | 'quarantined' | 'rejected';
  approval_status: 'approved' | 'pending' | 'rejected';
  sha256_hash: string;
  is_deleted: boolean;
}

export interface FinancialTransaction {
  id: string;
  company_id: string;
  voucher_number: string;
  type: 'receipt' | 'payment' | 'expense' | 'income' | 'petty_cash' | 'payroll' | 'tax';
  title: string;
  amount: number; // in Rials / Tomans
  transaction_date: string;
  payer_or_payee: string;
  bank_account: string;
  check_number?: string;
  check_due_date?: string;
  project_id?: string;
  cost_center: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'settled';
  approved_by?: string;
  description: string;
  attachments_count: number;
  created_at: string;
}

export interface Shareholder {
  id: string;
  company_id: string;
  shareholder_code: string;
  full_name: string;
  national_id: string;
  share_type: 'ordinary' | 'preferred';
  shares_count: number;
  nominal_value_per_share: number;
  total_value: number;
  ownership_percentage: number;
  purchase_date: string;
  sheba_number: string;
  bank_name: string;
  phone: string;
  has_digital_signature: boolean;
  status: 'active' | 'transferred' | 'suspended';
}

export interface BoardMeeting {
  id: string;
  company_id: string;
  meeting_number: string;
  title: string;
  scheduled_date: string;
  time: string;
  venue: string;
  meeting_type: 'in_person' | 'online' | 'hybrid';
  interval_days: number; // default 15
  suggested_next_meeting_date: string;
  status: 'scheduled' | 'in_progress' | 'concluded' | 'minutes_signed' | 'cancelled';
  agenda_items: string[];
  attendees: {
    user_id: string;
    name: string;
    role: string;
    is_present: boolean;
    has_signed: boolean;
    signature_time?: string;
  }[];
  decisions: {
    id: string;
    title: string;
    description: string;
    responsible_person: string;
    due_date: string;
    status: 'pending' | 'in_progress' | 'completed';
  }[];
  minutes_text?: string;
  minutes_signed_at?: string;
  is_locked: boolean;
  qr_code_token: string;
  created_at: string;
}

export interface Project {
  id: string;
  company_id: string;
  code: string;
  name: string;
  client_name: string;
  location: string;
  project_manager_name: string;
  start_date: string;
  end_date: string;
  progress_percent: number;
  budget: number;
  actual_cost: number;
  revenue: number;
  profitability_percent: number;
  direct_employment_count: number;
  indirect_employment_count: number;
  job_types: string[];
  status: 'planning' | 'active' | 'on_hold' | 'completed';
  risks: string[];
  is_joint_venture: boolean;
  joint_partners?: {
    company_id: string;
    company_name: string;
    share_percentage: number;
    allocated_budget: number;
  }[];
  created_at: string;
}

export interface AuditLog {
  id: string;
  company_id: string;
  user_id: string;
  user_name: string;
  user_role: string;
  module: string;
  action: string;
  record_type: string;
  record_id: string;
  ip_address: string;
  device_name: string;
  timestamp: string;
  status: 'success' | 'failure' | 'forbidden_attempt' | 'quarantined';
  failure_reason?: string;
  details?: string;
}

export interface UserDevice {
  id: string;
  user_id: string;
  device_name: string;
  platform: 'Android' | 'Web_Chrome' | 'Web_Firefox' | 'Windows_Desktop';
  device_identifier_hash: string;
  last_login_at: string;
  last_seen_at: string;
  is_active: boolean;
  ip_address: string;
  location: string;
}

export interface BackupRecord {
  id: string;
  company_id: string | null; // null means whole system backup
  scope: 'system' | 'company' | 'module';
  module_name?: string;
  backup_type: 'full' | 'incremental';
  file_name: string;
  file_size_mb: number;
  created_at: string;
  status: 'completed' | 'failed' | 'in_progress';
  checksum_sha256: string;
  is_encrypted: boolean;
  notes: string;
}

export interface OfflineSyncItem {
  id: string;
  company_id: string;
  module: string;
  operation: 'create' | 'update' | 'delete' | 'sign';
  entity_type: string;
  entity_id: string;
  payload: any;
  created_at: string;
  status: 'pending' | 'synced' | 'conflict';
  error_message?: string;
}
