import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Zap, 
  ShieldCheck, 
  LogOut, 
  CreditCard, 
  Bell, 
  Globe,
  Camera,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import axios from 'axios';
import { ServerUrl } from '../App';
import { setUserData } from '../redux/userSlice';
import DashboardLayout from '../components/DashboardLayout';

const SettingsSection = ({ title, children, icon: Icon }) => (
  <section className="mb-12">
    <div className="flex items-center gap-3 mb-6 px-2">
      <div className="p-2 bg-blue-50 rounded-lg">
        <Icon className="text-blue-600" size={18} />
      </div>
      <h3 className="text-lg font-[900] tracking-tighter text-slate-900">{title}</h3>
    </div>
    <div className="bg-white rounded-[32px] border border-slate-50 shadow-sm shadow-slate-100/50 p-8 space-y-6">
      {children}
    </div>
  </section>
);

const SettingItem = ({ label, value, type = 'text', readOnly = true }) => (
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 border-b border-slate-50 last:border-0">
    <div className="space-y-0.5">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <p className="text-sm font-bold text-slate-900 tracking-tight">{value || 'Not set'}</p>
    </div>
    {!readOnly && (
      <button className="text-blue-600 font-black text-[10px] uppercase tracking-widest hover:text-blue-700 transition-colors">
        Edit Info
      </button>
    )}
  </div>
);

function Settings() {
  const { userData } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setLoading(true);
      await axios.get(`${ServerUrl}/api/auth/logout`, { withCredentials: true });
      dispatch(setUserData(null));
      navigate('/');
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <header className="mb-12">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 text-blue-600 font-black text-[10px] uppercase tracking-[0.2em] mb-4"
          >
            <Sparkles size={16} />
            Command Center
          </motion.div>
          <h1 className="text-5xl font-[900] tracking-tighter text-slate-900 mb-2">Account Settings.</h1>
          <p className="text-slate-500 font-bold text-sm tracking-tight">
            Manage your professional identity and platform preferences.
          </p>
        </header>

        {/* Profile Card */}
        <div className="bg-slate-900 rounded-[40px] p-8 mb-12 relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="relative flex flex-col md:flex-row items-center gap-8">
            <div className="relative">
              <div className="w-24 h-24 bg-blue-600 rounded-3xl flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-blue-900/50">
                {userData?.name?.charAt(0) || 'U'}
              </div>
              <button className="absolute -bottom-2 -right-2 p-2 bg-white rounded-xl shadow-lg border border-slate-100 text-slate-900 hover:text-blue-600 transition-all">
                <Camera size={16} />
              </button>
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-[900] text-white tracking-tighter mb-1">{userData?.name}</h2>
              <p className="text-slate-400 font-bold text-sm tracking-tight mb-4">{userData?.email}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <span className="px-4 py-1.5 bg-blue-600/20 text-blue-400 rounded-full text-[10px] font-bold uppercase tracking-widest border border-blue-600/30">
                  Free Member
                </span>
                <span className="px-4 py-1.5 bg-emerald-600/20 text-emerald-400 rounded-full text-[10px] font-bold uppercase tracking-widest border border-emerald-600/30">
                  Account Verified
                </span>
              </div>
            </div>
          </div>
        </div>

        <SettingsSection title="Profile Information" icon={User}>
          <SettingItem label="Full Name" value={userData?.name} />
          <SettingItem label="Email Address" value={userData?.email} />
          <SettingItem label="Professional Brief" value={userData?.profileBrief || 'Add a short brief to help AI tailor your interviews'} readOnly={false} />
        </SettingsSection>

        <SettingsSection title="Account & Credits" icon={CreditCard}>
          <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Available Credits</p>
              <p className="text-3xl font-[900] text-slate-900 tracking-tighter">{userData?.credits || 0} Points</p>
            </div>
            <button className="px-8 py-3 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all shadow-lg shadow-blue-200">
              Buy Credits
            </button>
          </div>
          <SettingItem label="Current Plan" value="Explorer (Free)" />
          <SettingItem label="Last Transaction" value="None" />
        </SettingsSection>

        <SettingsSection title="Preferences" icon={Globe}>
          <SettingItem label="Language" value="English (US)" readOnly={false} />
          <SettingItem label="AI Interview Mode" value="Balanced Logic" readOnly={false} />
        </SettingsSection>

        {/* Danger Zone */}
        <div className="mt-16 p-8 border border-rose-100 bg-rose-50/30 rounded-[40px]">
          <h3 className="text-rose-600 font-black text-xs uppercase tracking-widest mb-6 flex items-center gap-2">
            <ShieldCheck size={16} />
            Security & Access
          </h3>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <p className="text-slate-900 font-[900] tracking-tight mb-1">Session Management</p>
              <p className="text-slate-500 text-xs font-bold tracking-tight">Ending your session will require re-authentication with Google.</p>
            </div>
            <button 
              onClick={handleLogout}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-8 py-3.5 bg-white border border-rose-200 text-rose-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all shadow-sm"
            >
              <LogOut size={16} />
              {loading ? 'Signing out...' : 'Secure Sign Out'}
            </button>
          </div>
        </div>

        <div className="mt-12 text-center text-slate-300 text-[10px] font-black uppercase tracking-[0.3em] pb-12">
          InterviewIQ v1.0.4 • 2026 Edition
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Settings;
