import React, { useState } from 'react';
import {
  FolderGit2,
  Users2,
  TrendingUp,
  AlertTriangle,
  Plus,
  Share2,
  Briefcase,
  CheckCircle2,
  Building,
} from 'lucide-react';
import { Project, Company, User } from '../types';

interface ProjectsTabProps {
  currentCompany: Company;
  currentUser: User;
  projects: Project[];
  allCompanies: Company[];
  onSaveNewProject: (project: Project) => void;
}

export const ProjectsTab: React.FC<ProjectsTabProps> = ({
  currentCompany,
  currentUser,
  projects,
  allCompanies,
  onSaveNewProject,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [clientName, setClientName] = useState('');
  const [location, setLocation] = useState('تهران');
  const [managerName, setManagerName] = useState('مهندس پریسا رستگار');
  const [budget, setBudget] = useState(25000000000);
  const [progress, setProgress] = useState(45);
  const [directJobs, setDirectJobs] = useState(20);
  const [indirectJobs, setIndirectJobs] = useState(45);
  const [isJoint, setIsJoint] = useState(false);
  const [partnerCompanyId, setPartnerCompanyId] = useState('comp_khavarmianeh');
  const [partnerShare, setPartnerShare] = useState(40);

  const formatTomans = (amount: number) => {
    return (amount / 10000000).toLocaleString('fa-IR') + ' میلیون تومان';
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const projectId = `prj_${Date.now()}`;
    const code = `PRJ-${currentCompany.short_name}-۴۰۵-${String(Math.floor(100 + Math.random() * 900))}`;

    const newProject: Project = {
      id: projectId,
      company_id: currentCompany.id,
      code,
      name: name.trim(),
      client_name: clientName.trim() || 'کارفرمای دولتی/خصوصی',
      location,
      project_manager_name: managerName,
      start_date: '۱۴۰۵/۰۱/۱۵',
      end_date: '۱۴۰۵/۱۲/۲۹',
      progress_percent: progress,
      budget,
      actual_cost: budget * 0.65,
      revenue: budget * 1.15,
      profitability_percent: 22.5,
      direct_employment_count: directJobs,
      indirect_employment_count: indirectJobs,
      job_types: ['مهندس نرم‌افزار', 'کارشناس شبکه', 'مدیر پروژه'],
      status: 'active',
      risks: ['تأخیر در تأمین تجهیزات سخت‌افزاری'],
      is_joint_venture: isJoint,
      joint_partners: isJoint
        ? [
            {
              company_id: currentCompany.id,
              company_name: currentCompany.trade_name,
              share_percentage: 100 - partnerShare,
              allocated_budget: (budget * (100 - partnerShare)) / 100,
            },
            {
              company_id: partnerCompanyId,
              company_name: allCompanies.find((c) => c.id === partnerCompanyId)?.trade_name || 'شرکت شریک',
              share_percentage: partnerShare,
              allocated_budget: (budget * partnerShare) / 100,
            },
          ]
        : undefined,
      created_at: '۱۴۰۵/۰۷/۰۶',
    };

    onSaveNewProject(newProject);
    setIsModalOpen(false);
    setName('');
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-800">
              مدیریت پروژه‌ها و سرمایه‌گذاری‌های مشترک (Joint Ventures)
            </h2>
            <span className="text-[11px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-bold border border-indigo-200">
              چندشرکتی و ایزوله
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            کنترل بودجه، هزینه و درآمد، پیشرفت فیزیکی، آمار اشتغال‌زایی و تسهیم سهم‌الشرکه در پروژه‌های مشترک
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          تعریف پروژه جدید
        </button>
      </div>

      {/* Projects List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {projects.map((proj) => (
          <div
            key={proj.id}
            className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-300 shadow-xs transition-all space-y-4"
          >
            <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                    {proj.code}
                  </span>
                  {proj.is_joint_venture && (
                    <span className="flex items-center gap-1 text-[10px] bg-purple-50 text-purple-700 font-bold px-2 py-0.5 rounded-md border border-purple-200">
                      <Share2 className="w-3 h-3" />
                      پروژه مشترک بین‌شرکتی
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-sm text-slate-800 mt-1.5">{proj.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  کارفرما: {proj.client_name} | محل: {proj.location} | مدیر پروژه: {proj.project_manager_name}
                </p>
              </div>

              <div className="text-left shrink-0">
                <span className="text-sm font-black text-indigo-700 font-mono">
                  {proj.progress_percent}٪
                </span>
                <span className="text-[10px] text-slate-400 block">پیشرفت فیزیکی</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all"
                  style={{ width: `${proj.progress_percent}%` }}
                ></div>
              </div>
            </div>

            {/* Financial Metrics */}
            <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
              <div>
                <span className="text-[11px] text-slate-500">بودجه مصوب:</span>
                <p className="font-bold text-slate-800 mt-0.5">{formatTomans(proj.budget)}</p>
              </div>
              <div>
                <span className="text-[11px] text-slate-500">هزینه واقعی:</span>
                <p className="font-bold text-rose-700 mt-0.5">{formatTomans(proj.actual_cost)}</p>
              </div>
              <div>
                <span className="text-[11px] text-slate-500">سودآوری پیش‌بینی:</span>
                <p className="font-bold text-emerald-700 mt-0.5">{proj.profitability_percent}٪</p>
              </div>
            </div>

            {/* Job Generation Stats */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-100 flex items-center justify-between">
                <span className="text-emerald-900 font-medium">اشتغال مستقیم:</span>
                <span className="font-black text-emerald-700 font-mono">{proj.direct_employment_count} نفر</span>
              </div>
              <div className="p-2.5 bg-blue-50/60 rounded-xl border border-blue-100 flex items-center justify-between">
                <span className="text-blue-900 font-medium">اشتغال غیرمستقیم:</span>
                <span className="font-black text-blue-700 font-mono">{proj.indirect_employment_count} نفر</span>
              </div>
            </div>

            {/* Joint Partners Breakdown if Joint Venture */}
            {proj.is_joint_venture && proj.joint_partners && (
              <div className="p-3 bg-purple-50/40 rounded-xl border border-purple-200/60 text-xs space-y-2">
                <span className="font-bold text-purple-900 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-purple-700" />
                  تسهیم سهم و بودجه بین شرکت‌ها:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {proj.joint_partners.map((jp, idx) => (
                    <div key={idx} className="bg-white p-2 rounded-lg border border-purple-100">
                      <p className="font-bold text-slate-800 text-[11px]">{jp.company_name}</p>
                      <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                        <span>سهم: {jp.share_percentage}٪</span>
                        <span>تعهد بودجه: {formatTomans(jp.allocated_budget)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* New Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="flex items-center justify-between p-4 bg-indigo-700 text-white">
              <h3 className="text-sm font-bold">تعریف پروژه جدید و تعیین سهم</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateProject} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">نام پروژه *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: توسعه زیرساخت و مهاجرت ابری فاز ۴..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">کارفرما *</label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">مدیر پروژه *</label>
                  <input
                    type="text"
                    required
                    value={managerName}
                    onChange={(e) => setManagerName(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">بودجه کل (ریال)</label>
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">اشتغال مستقیم</label>
                  <input
                    type="number"
                    value={directJobs}
                    onChange={(e) => setDirectJobs(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">اشتغال غیرمستقیم</label>
                  <input
                    type="number"
                    value={indirectJobs}
                    onChange={(e) => setIndirectJobs(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>
              </div>

              {/* Joint Project Toggle */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isJoint}
                    onChange={(e) => setIsJoint(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="font-bold text-slate-800">این پروژه به صورت سرمایه‌گذاری مشترک (Joint Venture) است</span>
                </label>

                {isJoint && (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-slate-600 mb-1">شرکت شریک</label>
                      <select
                        value={partnerCompanyId}
                        onChange={(e) => setPartnerCompanyId(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2"
                      >
                        {allCompanies
                          .filter((c) => c.id !== currentCompany.id)
                          .map((c) => (
                            <option key={c.id} value={c.id}>{c.trade_name}</option>
                          ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1">درصد سهم شریک (٪)</label>
                      <input
                        type="number"
                        min="1"
                        max="99"
                        value={partnerShare}
                        onChange={(e) => setPartnerShare(Number(e.target.value))}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                  ثبت پروژه
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
