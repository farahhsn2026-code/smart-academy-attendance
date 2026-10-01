import { useState, useEffect } from 'react';
import {
    Settings as SettingsIcon,
    Shield,
    Palette,
    Server,
    Save,
    CheckCircle2,
    Database,
    Info
} from 'lucide-react';
import { useToast } from '../components/Toast';

const Settings = () => {
  const [institutionName, setInstitutionName] = useState('Smart Academy');
  const [academicTerm, setAcademicTerm] = useState('Fall 2026 / Spring 2027');
  const [adminEmail, setAdminEmail] = useState('hasanfaarah07@gmail.com.edu');
  const [lateThreshold, setLateThreshold] = useState('15');
  const [theme, setTheme] = useState('light');
  const [autoSaveNotification, setAutoSaveNotification] = useState(true);

  const toast = useToast();
useEffect(() => {
    const savedSettings = localStorage.getItem('smartAcademySettings');

    if (savedSettings) {
        const settings = JSON.parse(savedSettings);

        setInstitutionName(settings.institutionName || 'Smart Academy');
        setAcademicTerm(settings.academicTerm || 'Fall 2026 / Spring 2027');
        setAdminEmail(settings.adminEmail || 'hasanfaarah07@gmail.com');
        setLateThreshold(settings.lateThreshold || '15');
        setTheme(settings.theme || 'light');
        setAutoSaveNotification(settings.autoSaveNotification ?? true);
    }
}, []);
  const handleSave = (e) => {
    e.preventDefault();

    const settings = {
        institutionName,
        academicTerm,
        adminEmail,
        lateThreshold,
        theme,
        autoSaveNotification,
    };

    localStorage.setItem('smartAcademySettings', JSON.stringify(settings));

    toast.success('Configuration preferences saved successfully!');
};

  return (
    <div className="max-w-4xl space-y-6">
      <div className="card p-6">
        <div className="flex items-center gap-3 pb-6 border-b border-gray-100">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <SettingsIcon size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Application Configuration</h2>
            <p className="text-xs text-gray-500">
              Customize institution profile, system thresholds, and UI options.
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6 pt-6">
          {/* General Information */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Shield size={16} className="text-blue-600" />
              <span>Institution Identity</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Institution / Bootcamp Name</label>
                <input
                  type="text"
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label className="label">Academic Term</label>
                <input
                  type="text"
                  value={academicTerm}
                  onChange={(e) => setAcademicTerm(e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="label">Administrator Contact Email</label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Attendance Rules */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Database size={16} className="text-blue-600" />
              <span>Attendance Policies</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Late Arrival Grace Period (Minutes)</label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={lateThreshold}
                  onChange={(e) => setLateThreshold(e.target.value)}
                  className="input-field"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Students arriving past this threshold will be marked Late.
                </p>
              </div>

              <div>
                <label className="label">Interface Theme Mode</label>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="input-field bg-white"
                >
                  <option value="light">Modern Crisp Light (Default)</option>
                  <option value="system">Auto Match System</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoSaveNotification}
                  onChange={(e) => setAutoSaveNotification(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span>Show toast feedback notifications when saving attendance entries</span>
              </label>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button type="submit" className="btn-primary">
              <Save size={18} />
              <span>Save System Settings</span>
            </button>
          </div>
        </form>
      </div>

      {/* System Technical Specs Card */}
      <div className="card p-6 bg-slate-900 text-slate-100 border-0">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-slate-800 rounded-xl text-blue-400">
            <Server size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">System Architecture & Health</h3>
            <p className="text-xs text-slate-400">MERN Stack Technical Specifications</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-800">
            <p className="text-slate-400 font-medium">Frontend</p>
            <p className="text-white font-bold text-sm mt-0.5">React + Vite</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-800">
            <p className="text-slate-400 font-medium">Styling Engine</p>
            <p className="text-white font-bold text-sm mt-0.5">Tailwind CSS</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-800">
            <p className="text-slate-400 font-medium">Backend Runtime</p>
            <p className="text-white font-bold text-sm mt-0.5">Node.js + Express</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-800">
            <p className="text-slate-400 font-medium">Database</p>
            <p className="text-white font-bold text-sm mt-0.5">MongoDB Mongoose</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
