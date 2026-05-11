import React, { useState, useRef } from 'react';
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
  const [uploading, setUploading] = useState(false);
  const [editingBrief, setEditingBrief] = useState(false);
  const [profileBrief, setProfileBrief] = useState(userData?.profileBrief || "");
  const [showPlanModal, setShowPlanModal] = useState(false);
  const fileInputRef = useRef(null);

  const plans = [
    { id: 'basic', name: 'Starter Pack', credits: 500, price: 49, icon: Zap },
    { id: 'pro', name: 'Professional', credits: 1500, price: 99, icon: ShieldCheck, popular: true },
    { id: 'elite', name: 'Elite Performance', credits: 4000, price: 199, icon: Sparkles }
  ];

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      setUploading(true);
      const res = await axios.post(`${ServerUrl}/api/user/update-avatar`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        dispatch(setUserData(res.data.user));
      }
    } catch (err) {
      console.error("Avatar upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      const res = await axios.post(`${ServerUrl}/api/user/update-profile`, {
        name: userData.name,
        profileBrief
      }, { withCredentials: true });

      if (res.data.success) {
        dispatch(setUserData(res.data.user));
        setEditingBrief(false);
      }
    } catch (err) {
      console.error("Profile update failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyCredits = async (plan) => {
    try {
      setLoading(true);
      const { data: order } = await axios.post(`${ServerUrl}/api/payment/order`, {
        planId: plan.id,
        amount: plan.price,
        credits: plan.credits
      }, { withCredentials: true });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "InterviewIQ.AI",
        description: `Purchase ${plan.credits} Credits`,
        order_id: order.id,
        handler: async (response) => {
          try {
            const { data } = await axios.post(`${ServerUrl}/api/payment/verify`, response, { withCredentials: true });
            if (data.success) {
              dispatch(setUserData(data.user));
              setShowPlanModal(false);
              alert("Credits added successfully!");
            }
          } catch (err) {
            console.error("Verification failed:", err);
          }
        },
        prefill: {
          name: userData?.name,
          email: userData?.email
        },
        theme: { color: "#2563eb" }
      };

      if (!window.Razorpay) {
        alert("Razorpay SDK failed to load. Please check your internet connection.");
        return;
      }

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment failed:", err);
    } finally {
      setLoading(false);
    }
  };

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
      <div className="max-w-4xl mx-auto px-4 md:px-0">
        <header className="mb-12">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 text-blue-600 font-black text-[10px] uppercase tracking-[0.2em] mb-4"
          >
            <Sparkles size={16} />
            Command Center
          </motion.div>
          <h1 className="text-5xl font-[900] tracking-tighter text-slate-900 mb-2">Account Profile.</h1>
          <p className="text-slate-500 font-bold text-sm tracking-tight">
            Manage your professional identity and platform preferences.
          </p>
        </header>

        {/* Profile Card */}
        <div className="bg-slate-900 rounded-[40px] p-8 mb-12 relative overflow-hidden group">
          <div className="absolute right-0 top-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="relative flex flex-col md:flex-row items-center gap-8">
            <div className="relative">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleAvatarUpload} 
                className="hidden" 
                accept="image/*"
              />
              <div className="w-24 h-24 bg-blue-600 rounded-3xl flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-blue-900/50 overflow-hidden relative">
                {userData?.avatar ? (
                  <img 
                    src={`${ServerUrl}${userData.avatar}`} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  userData?.name?.charAt(0) || 'U'
                )}
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute -bottom-2 -right-2 p-2 bg-white rounded-xl shadow-lg border border-slate-100 text-slate-900 hover:text-blue-600 transition-all disabled:opacity-50"
              >
                <Camera size={16} />
              </button>
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-[900] text-white tracking-tighter mb-1">{userData?.name}</h2>
              <p className="text-slate-400 font-bold text-sm tracking-tight mb-4">{userData?.email}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <span className="px-4 py-1.5 bg-blue-600/20 text-blue-400 rounded-full text-[10px] font-bold uppercase tracking-widest border border-blue-600/30">
                  {userData?.credits > 1000 ? "Pro Tier" : "Free Member"}
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
          <div className="py-4 space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-0.5">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Professional Brief</p>
                {!editingBrief ? (
                  <p className="text-sm font-bold text-slate-900 tracking-tight leading-relaxed max-w-xl">
                    {userData?.profileBrief || 'Add a short brief to help AI tailor your interviews'}
                  </p>
                ) : (
                  <textarea 
                    value={profileBrief}
                    onChange={(e) => setProfileBrief(e.target.value)}
                    className="w-full mt-2 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    rows={4}
                    placeholder="Describe your background, skills, and goals..."
                  />
                )}
              </div>
              <button 
                onClick={() => editingBrief ? handleUpdateProfile() : setEditingBrief(true)}
                disabled={loading}
                className="text-blue-600 font-black text-[10px] uppercase tracking-widest hover:text-blue-700 transition-colors"
              >
                {editingBrief ? (loading ? 'Saving...' : 'Save Changes') : 'Edit Info'}
              </button>
            </div>
          </div>
        </SettingsSection>

        <SettingsSection title="Account & Credits" icon={CreditCard}>
          <div className="flex items-center justify-between p-8 bg-blue-600 rounded-[32px] text-white shadow-xl shadow-blue-100 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16" />
            <div className="relative">
              <p className="text-[10px] font-black text-blue-100 uppercase tracking-[0.2em] mb-2">Available Credits</p>
              <div className="flex items-baseline gap-2">
                <p className="text-5xl font-[900] tracking-tighter">{userData?.credits || 0}</p>
                <p className="text-xs font-black uppercase text-blue-100">Points</p>
              </div>
            </div>
            <button 
              onClick={() => setShowPlanModal(true)}
              className="relative px-8 py-4 bg-white text-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-xl"
            >
              Add Credits
            </button>
          </div>
          <SettingItem label="Usage Efficiency" value={`${userData?.credits > 0 ? "Optimized" : "Low"}`} />
          <SettingItem label="Last Credit Injection" value={userData?.lastPurchase || "N/A"} />
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

      {/* Plans Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white w-full max-w-2xl rounded-[48px] p-10 relative overflow-hidden"
          >
            <button 
              onClick={() => setShowPlanModal(false)}
              className="absolute top-8 right-8 text-slate-400 hover:text-slate-900"
            >
              <ChevronRight className="rotate-90" />
            </button>
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-[900] tracking-tighter text-slate-900 mb-2">Fuel Your Progress.</h2>
              <p className="text-slate-500 font-bold text-sm tracking-tight">Select a credit injection plan to unlock more AI features.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div 
                  key={plan.id}
                  className={`p-6 rounded-[32px] border-2 transition-all cursor-pointer hover:scale-[1.02] ${plan.popular ? 'border-blue-600 bg-blue-50/30' : 'border-slate-50 bg-slate-50/50'}`}
                  onClick={() => handleBuyCredits(plan)}
                >
                  <div className={`p-3 rounded-2xl w-fit mb-6 ${plan.popular ? 'bg-blue-600 text-white' : 'bg-white text-slate-900'}`}>
                    <plan.icon size={20} />
                  </div>
                  <h4 className="font-black text-sm text-slate-900 uppercase tracking-widest mb-1">{plan.name}</h4>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-2xl font-black text-slate-900 tracking-tighter">₹{plan.price}</span>
                  </div>
                  <p className="text-xs font-bold text-slate-500 mb-6">{plan.credits} AI Credits</p>
                  <button className={`w-full py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${plan.popular ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white text-slate-900 border border-slate-100'}`}>
                    Choose Plan
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default Settings;
