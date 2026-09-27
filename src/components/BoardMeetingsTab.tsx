import React, { useState } from 'react';
import {
  Calendar,
  CalendarCheck,
  Clock,
  MapPin,
  Users,
  CheckCircle,
  Plus,
  FileSignature,
  Lock,
  QrCode,
  AlertCircle,
  Building,
} from 'lucide-react';
import { BoardMeeting, Company, User } from '../types';
import { SecurityEngine } from '../services/securityEngine';

interface BoardMeetingsTabProps {
  currentCompany: Company;
  currentUser: User;
  boardMeetings: BoardMeeting[];
  onSaveNewMeeting: (bm: BoardMeeting) => void;
  onSignMinutes: (meetingId: string) => void;
  onVerifyQr: (token: string) => void;
}

export const BoardMeetingsTab: React.FC<BoardMeetingsTabProps> = ({
  currentCompany,
  currentUser,
  boardMeetings,
  onSaveNewMeeting,
  onSignMinutes,
  onVerifyQr,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<BoardMeeting | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [scheduledDate, setScheduledDate] = useState('۱۴۰۵/۰۷/۱۰');
  const [time, setTime] = useState('۱۰:۰۰');
  const [venue, setVenue] = useState('اتاق جلسات هیئت مدیره - طبقه ۸');
  const [meetingType, setMeetingType] = useState<BoardMeeting['meeting_type']>('hybrid');
  const [intervalDays, setIntervalDays] = useState(15);
  const [agendas, setAgendas] = useState('بررسی عملکرد مالی, تصویب خط‌مشی امنیت چندمستاجری, برنامه افزایش سرمایه');

  const handleCreateMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('لطفاً عنوان جلسه را وارد کنید.');
      return;
    }

    const meetingId = `bm_${Date.now()}`;
    const meetingNumber = `جلسه-${currentCompany.short_name}-۱۴۰۵-${String(boardMeetings.length + 15)}`;

    const newMeeting: BoardMeeting = {
      id: meetingId,
      company_id: currentCompany.id,
      meeting_number: meetingNumber,
      title: title.trim(),
      scheduled_date: scheduledDate,
      time,
      venue,
      meeting_type: meetingType,
      interval_days: intervalDays,
      suggested_next_meeting_date: '۱۴۰۵/۰۷/۲۵', // +15 days
      status: 'scheduled',
      agenda_items: agendas.split(',').map((s) => s.trim()),
      attendees: [
        {
          user_id: currentUser.id,
          name: `${currentUser.first_name} ${currentUser.last_name}`,
          role: 'رئیس جلسه',
          is_present: true,
          has_signed: false,
        },
        {
          user_id: 'usr_radmanesh',
          name: currentCompany.ceo_name,
          role: 'مدیرعامل',
          is_present: true,
          has_signed: false,
        },
      ],
      decisions: [],
      is_locked: false,
      qr_code_token: SecurityEngine.generateQrVerificationToken(currentCompany.id, meetingId),
      created_at: SecurityEngine.getJalaliDateTimeNow(),
    };

    onSaveNewMeeting(newMeeting);
    setIsModalOpen(false);
    setTitle('');
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-800">
              جلسات هیئت مدیره و تنظیم صورتجلسات {currentCompany.trade_name}
            </h2>
            <span className="text-[11px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded-md font-bold border border-purple-200">
              فاصله پیشنهادی خودکار: ۱۵ روز
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            دستور جلسات، حضور و غیاب، مصوبات و صدور صورتجلسه رسمی با امضای دیجیتال و قفل ضدجعل
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          ثبت و فراخوان جلسه جدید
        </button>
      </div>

      {/* Meetings Grid */}
      <div className="space-y-4">
        {boardMeetings.map((bm) => (
          <div
            key={bm.id}
            className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-purple-300 shadow-xs transition-all space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                  {bm.meeting_number}
                </span>
                <h3 className="font-bold text-sm text-slate-800">{bm.title}</h3>
              </div>

              <div className="flex items-center gap-2">
                {bm.status === 'minutes_signed' ? (
                  <span className="flex items-center gap-1 text-[11px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-md border border-emerald-200">
                    <Lock className="w-3 h-3 text-emerald-600" />
                    صورتجلسه امضا و قفل شد
                  </span>
                ) : (
                  <span className="text-[11px] bg-amber-50 text-amber-700 font-medium px-2 py-0.5 rounded-md border border-amber-200">
                    برنامه‌ریزی‌شده
                  </span>
                )}
              </div>
            </div>

            {/* Date, Venue, Time row */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
              <div className="flex items-center gap-1.5 text-slate-600">
                <Calendar className="w-4 h-4 text-purple-600" />
                <span>تاریخ برگزاری:</span>
                <strong className="text-slate-800 font-mono">{bm.scheduled_date}</strong>
              </div>

              <div className="flex items-center gap-1.5 text-slate-600">
                <Clock className="w-4 h-4 text-purple-600" />
                <span>ساعت:</span>
                <strong className="text-slate-800 font-mono">{bm.time}</strong>
              </div>

              <div className="flex items-center gap-1.5 text-slate-600 sm:col-span-2">
                <MapPin className="w-4 h-4 text-purple-600" />
                <span>محل:</span>
                <strong className="text-slate-800 truncate">{bm.venue}</strong>
              </div>
            </div>

            {/* Agenda Items */}
            <div>
              <p className="text-xs font-bold text-slate-700 mb-2">دستور جلسه مصوب:</p>
              <ul className="list-disc list-inside space-y-1 text-xs text-slate-600">
                {bm.agenda_items.map((item, idx) => (
                  <li key={idx} className="leading-relaxed">{item}</li>
                ))}
              </ul>
            </div>

            {/* Decisions if any */}
            {bm.decisions && bm.decisions.length > 0 && (
              <div className="bg-purple-50/50 p-3 rounded-xl border border-purple-100 space-y-2">
                <p className="text-xs font-bold text-purple-900">مصوبات جلسه:</p>
                <div className="space-y-1.5">
                  {bm.decisions.map((dec) => (
                    <div key={dec.id} className="text-xs text-purple-950 flex items-start gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>{dec.title}:</strong> {dec.description} (مسئول: {dec.responsible_person} - مهلت: {dec.due_date})
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Attendees & Signature Actions */}
            <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-500">
                <Users className="w-4 h-4 text-slate-400" />
                <span>حاضرین جلسه:</span>
                {bm.attendees.map((att, idx) => (
                  <span
                    key={idx}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                      att.has_signed
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {att.name} {att.has_signed ? '✓ امضا شده' : ''}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onVerifyQr(bm.qr_code_token)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  استعلام QR
                </button>

                {!bm.is_locked && (
                  <button
                    onClick={() => onSignMinutes(bm.id)}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    <FileSignature className="w-3.5 h-3.5" />
                    امضای الکترونیک صورتجلسه
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Meeting Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="flex items-center justify-between p-4 bg-purple-700 text-white">
              <h3 className="text-sm font-bold">فراخوان جلسه رسمی هیئت مدیره</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateMeeting} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">عنوان جلسه *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: جلسه دوره‌ای بررسی صورت‌های مالی و قراردادهای راهبردی..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">تاریخ جلسه (شمسی) *</label>
                  <input
                    type="text"
                    required
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">ساعت شروع *</label>
                  <input
                    type="text"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">محل برگزاری *</label>
                <input
                  type="text"
                  required
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">موارد دستور جلسه (با کاما جدا کنید) *</label>
                <textarea
                  required
                  rows={3}
                  value={agendas}
                  onChange={(e) => setAgendas(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2"
                />
              </div>

              <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 text-[11px] text-purple-900">
                فاصله زمانی پیش‌فرض جلسه بعدی طبق الزامات اساسنامه بر روی <strong>۱۵ روز</strong> تنظیم شده و جلسه بعدی در تاریخ ۱۴۰۵/۰۷/۲۵ پیشنهاد خواهد شد.
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
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold"
                >
                  ثبت و ابلاغ به اعضا
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
