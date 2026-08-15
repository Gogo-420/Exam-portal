import React, { useState, useEffect } from 'react';
import {
  Bell, Monitor, Globe, Shield,
  Save, CheckCircle2, RotateCcw,
} from 'lucide-react';
import Loader from '../../components/student/Loader';
import { getStudentSettings, saveStudentSettings } from '../../services/studentService';

const SECTION_ICON_CLASS = 'w-4 h-4 text-slate-600';

// Reusable toggle switch
function Toggle({ checked, onChange, label, description, disabled = false }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-slate-100 last:border-0">
      <div>
        <p className={`text-xs font-semibold ${disabled ? 'text-slate-400' : 'text-slate-800'}`}>{label}</p>
        {description && <p className="text-[11px] text-slate-400 mt-0.5">{description}</p>}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`relative shrink-0 w-9 h-5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 ${
          checked ? 'bg-blue-600' : 'bg-slate-200'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
            checked ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

// Reusable select row
function SelectRow({ label, description, value, onChange, options }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-slate-100 last:border-0">
      <div>
        <p className="text-xs font-semibold text-slate-800">{label}</p>
        {description && <p className="text-[11px] text-slate-400 mt-0.5">{description}</p>}
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-xs bg-slate-50 border border-slate-200 text-slate-800 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-400 transition shrink-0 max-w-[140px]"
      >
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [saved, setSaved]       = useState(false);

  useEffect(() => {
    // TODO: replace with real API — getStudentSettings()
    const timer = setTimeout(async () => {
      const s = await getStudentSettings();
      setSettings(s);
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const update = (key, val) => setSettings((prev) => ({ ...prev, [key]: val }));

  const handleSave = async () => {
    // TODO: await saveStudentSettings(settings)
    await saveStudentSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = async () => {
    localStorage.removeItem('student_settings');
    const fresh = await getStudentSettings();
    setSettings(fresh);
  };

  if (loading) return <Loader message="Loading settings…" />;

  const sections = [
    {
      id: 'notifications',
      icon: Bell,
      title: 'Notifications',
      subtitle: 'Control how and when you receive alerts.',
      content: (
        <>
          <Toggle checked={settings.emailNotifications}  onChange={(v) => update('emailNotifications', v)}  label="Email Notifications"  description="Receive exam assignments and result alerts via email." />
          <Toggle checked={settings.smsNotifications}    onChange={(v) => update('smsNotifications', v)}    label="SMS Notifications"    description="Get text alerts for urgent exam reminders." />
          <Toggle checked={settings.examReminders}       onChange={(v) => update('examReminders', v)}       label="Exam Reminders"       description="Send a reminder 30 minutes before exam start." />
          <Toggle checked={settings.resultAlerts}        onChange={(v) => update('resultAlerts', v)}        label="Result Alerts"        description="Notify immediately when a result is published." />
          <Toggle checked={settings.warningAlerts}       onChange={(v) => update('warningAlerts', v)}       label="Proctoring Warnings"  description="Alert when an AI proctoring flag is issued." />
        </>
      ),
    },
    {
      id: 'appearance',
      icon: Monitor,
      title: 'Appearance',
      subtitle: 'Personalise your portal display.',
      content: (
        <>
          <Toggle
            checked={settings.darkMode}
            onChange={(v) => update('darkMode', v)}
            label="Dark Mode"
            description="Switch to a dark colour scheme (coming soon)."
            disabled
          />
          <SelectRow
            label="Language"
            description="Portal interface language."
            value={settings.language}
            onChange={(v) => update('language', v)}
            options={['English', 'Hindi', 'Tamil', 'Telugu', 'Kannada']}
          />
        </>
      ),
    },
    {
      id: 'regional',
      icon: Globe,
      title: 'Regional',
      subtitle: 'Timezone and locale preferences.',
      content: (
        <>
          <SelectRow
            label="Timezone"
            description="Used for exam schedule display."
            value={settings.timezone}
            onChange={(v) => update('timezone', v)}
            options={[
              'Asia/Kolkata (IST)',
              'Asia/Dubai (GST)',
              'Europe/London (GMT)',
              'America/New_York (EST)',
              'America/Los_Angeles (PST)',
            ]}
          />
          <SelectRow
            label="Session Timeout"
            description="Auto-logout after inactivity (minutes)."
            value={String(settings.sessionTimeout)}
            onChange={(v) => update('sessionTimeout', Number(v))}
            options={['15', '30', '60', '120']}
          />
        </>
      ),
    },
    {
      id: 'security',
      icon: Shield,
      title: 'Security',
      subtitle: 'Account protection settings.',
      content: (
        <>
          <Toggle
            checked={settings.twoFactorAuth}
            onChange={(v) => update('twoFactorAuth', v)}
            label="Two-Factor Authentication"
            description="Require OTP on each login (coming soon)."
            disabled
          />
          <div className="py-3 text-[11px] text-slate-500 leading-relaxed bg-slate-50 rounded-lg px-3 mt-1 border border-slate-100">
            Your session is secured with an encrypted auth token. Tokens expire automatically after your chosen session timeout period.
          </div>
        </>
      ),
    },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6 text-slate-800">

      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Settings</h2>
          <p className="text-xs text-slate-500 mt-0.5">Manage your notification, display, and security preferences.</p>
        </div>
      </div>

      {/* Save feedback */}
      {saved && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          Settings saved successfully.
        </div>
      )}

      {/* Sections */}
      {sections.map(({ id, icon: Icon, title, subtitle, content }) => (
        <div key={id} className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          {/* Section header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50/60">
            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shadow-xs">
              <Icon className={SECTION_ICON_CLASS} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">{title}</p>
              <p className="text-[11px] text-slate-400">{subtitle}</p>
            </div>
          </div>
          {/* Section body */}
          <div className="px-5 pb-2">{content}</div>
        </div>
      ))}

      {/* Action bar */}
      <div className="flex items-center justify-between pt-2 pb-6">
        <button
          onClick={handleReset}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset to defaults
        </button>
        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#374151] hover:bg-[#1F2937] text-white font-semibold text-xs rounded-lg shadow-xs transition-colors"
        >
          <Save className="w-3.5 h-3.5" />
          Save Settings
        </button>
      </div>
    </div>
  );
}
