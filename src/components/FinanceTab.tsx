import React, { useState } from 'react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Plus,
  Users2,
  PieChart,
  ShieldCheck,
  CheckCircle,
  FileSpreadsheet,
  Building,
} from 'lucide-react';
import { FinancialTransaction, Shareholder, Company, User } from '../types';
import { SecurityEngine } from '../services/securityEngine';

interface FinanceTabProps {
  currentCompany: Company;
  currentUser: User;
  financials: FinancialTransaction[];
  shareholders: Shareholder[];
  onSaveNewTransaction: (tx: FinancialTransaction) => void;
}

export const FinanceTab: React.FC<FinanceTabProps> = ({
  currentCompany,
  currentUser,
  financials,
  shareholders,
  onSaveNewTransaction,
}) => {
  const [subTab, setSubTab] = useState<'transactions' | 'shareholders'>('transactions');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [txTitle, setTxTitle] = useState('');
  const [txType, setTxType] = useState<FinancialTransaction['type']>('income');
  const [txAmount, setTxAmount] = useState<number>(50000000);
  const [txPayerPayee, setTxPayerPayee] = useState('');
  const [txAccount, setTxAccount] = useState('حساب جاری بانک ملت');
  const [txCostCenter, setTxCostCenter] = useState('عملیات جاری و پروژه‌ها');
  const [txDesc, setTxDesc] = useState('');

  const formatTomans = (amount: number) => {
    return (amount / 10000000).toLocaleString('fa-IR') + ' میلیون تومان';
  };

  const handleCreateVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txTitle.trim() || !txPayerPayee.trim()) {
      alert('لطفاً عنوان و طرف‌حساب را وارد نمایید.');
      return;
    }

    const txId = `fin_${Date.now()}`;
    const voucherNumber = `سند-${currentCompany.short_name}-۴۰۵-${String(Math.floor(100 + Math.random() * 900))}`;

    const newTx: FinancialTransaction = {
      id: txId,
      company_id: currentCompany.id,
      voucher_number: voucherNumber,
      type: txType,
      title: txTitle.trim(),
      amount: Number(txAmount),
      transaction_date: SecurityEngine.getJalaliDateNow(),
      payer_or_payee: txPayerPayee.trim(),
      bank_account: txAccount,
      cost_center: txCostCenter,
      status: 'approved',
      approved_by: `${currentUser.first_name} ${currentUser.last_name}`,
      description: txDesc || 'سند ثبت شده با اعتبارسنجی سطح دسترسی مالی',
      attachments_count: 0,
      created_at: SecurityEngine.getJalaliDateTimeNow(),
    };

    onSaveNewTransaction(newTx);
    setIsModalOpen(false);
    setTxTitle('');
    setTxPayerPayee('');
    setTxDesc('');
  };

  const totalShares = shareholders.reduce((sum, s) => sum + s.shares_count, 0);

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-800">
              مدیریت امور مالی، خزانه‌داری و سهامداران {currentCompany.trade_name}
            </h2>
            <span className="text-[11px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md font-bold border border-amber-200">
              دفتر مالی تفکیک‌شده
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            گردش حساب‌ها، اسناد پرداخت و دریافت، حقوق و دستمزد و کنترل مالکیت سهام به تفکیک شرکت
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 text-xs">
            <button
              onClick={() => setSubTab('transactions')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                subTab === 'transactions'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              اسناد مالی و خزانه‌داری
            </button>
            <button
              onClick={() => setSubTab('shareholders')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                subTab === 'shareholders'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              دفتر سهامداران ({shareholders.length})
            </button>
          </div>

          {subTab === 'transactions' && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              ثبت سند حسابداری
            </button>
          )}
        </div>
      </div>

      {subTab === 'transactions' ? (
        <div className="space-y-4">
          {/* Transactions Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
                  <tr>
                    <th className="p-3.5">نوع سند</th>
                    <th className="p-3.5">شماره سند</th>
                    <th className="p-3.5">شرح تراکنش</th>
                    <th className="p-3.5">طرف‌حساب</th>
                    <th className="p-3.5">مبلغ سند</th>
                    <th className="p-3.5">تاریخ سند</th>
                    <th className="p-3.5">حساب بانکی</th>
                    <th className="p-3.5">وضعیت</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {financials.map((tx) => {
                    const isIncome = tx.type === 'income' || tx.type === 'receipt';
                    return (
                      <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3.5">
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md font-semibold ${
                              isIncome
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {isIncome ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {tx.type === 'income'
                              ? 'درآمد'
                              : tx.type === 'receipt'
                              ? 'دریافت'
                              : tx.type === 'payroll'
                              ? 'حقوق'
                              : 'هزینه'}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono font-bold text-slate-800">{tx.voucher_number}</td>
                        <td className="p-3.5 font-semibold text-slate-800 max-w-xs truncate">{tx.title}</td>
                        <td className="p-3.5 text-slate-600">{tx.payer_or_payee}</td>
                        <td className="p-3.5 font-bold font-mono text-slate-900">
                          {formatTomans(tx.amount)}
                        </td>
                        <td className="p-3.5 text-slate-500 font-mono">{tx.transaction_date}</td>
                        <td className="p-3.5 text-slate-500 text-[11px] truncate max-w-[140px]">
                          {tx.bank_account}
                        </td>
                        <td className="p-3.5">
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium text-[11px]">
                            تأیید شده
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Shareholders View */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200">
              <span className="text-xs text-slate-500">تعداد کل سهامداران ثبت‌شده</span>
              <p className="text-2xl font-black text-slate-800 mt-1">{shareholders.length} شخص/حقوقی</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200">
              <span className="text-xs text-slate-500">مجموع سهام منتشره</span>
              <p className="text-2xl font-black text-indigo-700 mt-1 font-mono">
                {totalShares.toLocaleString('fa-IR')} سهم
              </p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200">
              <span className="text-xs text-slate-500">ارزش اسمی هر سهم</span>
              <p className="text-2xl font-black text-emerald-700 mt-1">۱۰,۰۰۰ ریال</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
                  <tr>
                    <th className="p-3.5">کد سهامداری</th>
                    <th className="p-3.5">نام سهامدار</th>
                    <th className="p-3.5">کد ملی / شناسه ملی</th>
                    <th className="p-3.5">نوع سهم</th>
                    <th className="p-3.5">تعداد سهام</th>
                    <th className="p-3.5">درصد مالکیت</th>
                    <th className="p-3.5">ارزش اسمی (تومان)</th>
                    <th className="p-3.5">شماره شبا</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {shareholders.map((sh) => (
                    <tr key={sh.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-slate-700">{sh.shareholder_code}</td>
                      <td className="p-3.5 font-bold text-slate-800">{sh.full_name}</td>
                      <td className="p-3.5 font-mono text-slate-600">{sh.national_id}</td>
                      <td className="p-3.5">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold text-[10px]">
                          {sh.share_type === 'ordinary' ? 'عادی با حق رأی' : 'ممتاز'}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono font-bold text-slate-800">
                        {sh.shares_count.toLocaleString('fa-IR')}
                      </td>
                      <td className="p-3.5 font-mono font-bold text-indigo-700">
                        {sh.ownership_percentage}٪
                      </td>
                      <td className="p-3.5 font-mono text-slate-700">
                        {(sh.total_value / 10).toLocaleString('fa-IR')} تومان
                      </td>
                      <td className="p-3.5 font-mono text-slate-500 text-[10px]">{sh.sheba_number}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* New Voucher Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="flex items-center justify-between p-4 bg-indigo-700 text-white">
              <h3 className="text-sm font-bold">ثبت سند حسابداری جدید</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateVoucher} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">نوع سند *</label>
                <select
                  value={txType}
                  onChange={(e) => setTxType(e.target.value as any)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2"
                >
                  <option value="income">درآمد و فروش</option>
                  <option value="expense">هزینه جاری</option>
                  <option value="receipt">رسید دریافت وجه</option>
                  <option value="payment">حواله پرداخت</option>
                  <option value="payroll">حقوق و دستمزد</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">شرح سند *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: خرید تجهیزات سرور و رک شبکه..."
                  value={txTitle}
                  onChange={(e) => setTxTitle(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">مبلغ سند (ریال) *</label>
                  <input
                    type="number"
                    required
                    value={txAmount}
                    onChange={(e) => setTxAmount(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">طرف‌حساب *</label>
                  <input
                    type="text"
                    required
                    placeholder="نام شخص یا شرکت..."
                    value={txPayerPayee}
                    onChange={(e) => setTxPayerPayee(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">حساب بانکی یا صندوق</label>
                <input
                  type="text"
                  value={txAccount}
                  onChange={(e) => setTxAccount(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2"
                />
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
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700"
                >
                  ثبت قطعی سند
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
