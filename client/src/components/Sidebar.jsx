import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Target, 
  PlayCircle, 
  Map, 
  BarChart3, 
  Bookmark, 
  FileText, 
  Settings,
  Zap,
  LogOut
} from 'lucide-react';

const menuItems = [
  { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { id: 'ats', name: 'ATS Checker', icon: Target, path: '/career-suite?tab=ats' },
  { id: 'interview', name: 'Interview Room', icon: PlayCircle, path: '/interview' },
  { id: 'roadmap', name: 'Skill Roadmap', icon: Map, path: '/career-suite?tab=prep' },
  { id: 'analytics', name: 'Analytics', icon: BarChart3, path: '/history' },
];

const secondaryItems = [
  { id: 'bookmarks', name: 'Bookmarks', icon: Bookmark, path: '#' },
  { id: 'resume', name: 'Resume', icon: FileText, path: '/career-suite?tab=resume' },
  { id: 'settings', name: 'Settings', icon: Settings, path: '/settings' },
];

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (itemPath) => {
    const currentPath = location.pathname;
    const currentSearch = location.search;
    
    // For specific tabs in Career Suite
    if (itemPath.includes('?tab=')) {
      return (currentPath + currentSearch) === itemPath;
    }
    
    // For Dashboard
    if (itemPath === '/dashboard') {
      return currentPath === '/dashboard';
    }
    
    // For Analytics (History & Reports)
    if (itemPath === '/history') {
      return currentPath.startsWith('/history') || currentPath.startsWith('/report');
    }
    
    // For Interview Room
    if (itemPath === '/interview') {
      return currentPath.startsWith('/interview');
    }
    
    return currentPath === itemPath;
  };

  return (
    <div className="w-72 h-screen bg-white border-r border-gray-100 flex flex-col sticky top-0 overflow-y-auto">
      {/* Logo */}
      <div className="p-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
          <Zap className="text-white fill-white" size={20} />
        </div>
        <span className="text-xl font-[900] tracking-tighter text-slate-900">InterviewIQ</span>
      </div>

      {/* Main Menu */}
      <nav className="flex-1 px-4 space-y-1">
        <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 mt-4">Main Menu</p>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(item.path)}
            className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
              isActive(item.path)
                ? 'bg-blue-50 text-blue-600 font-bold'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <item.icon size={20} className={isActive(item.path) ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'} />
            <span className="text-sm font-bold tracking-tight">{item.name}</span>
            {isActive(item.path) && (
              <motion.div 
                layoutId="activeTab"
                className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600"
              />
            )}
          </button>
        ))}

        <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 mt-10">Account</p>
        {secondaryItems.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(item.path)}
            className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all duration-300 group text-slate-500 hover:bg-slate-50 hover:text-slate-900"
          >
            <item.icon size={20} className="text-slate-400 group-hover:text-slate-600" />
            <span className="text-sm font-bold tracking-tight">{item.name}</span>
          </button>
        ))}
      </nav>

      {/* Pro Banner */}
      <div className="p-6">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-blue-500/20 rounded-full blur-2xl group-hover:bg-blue-500/30 transition-all duration-500" />
          <p className="text-white font-black text-sm mb-1 tracking-tight">Pro Upgrade</p>
          <p className="text-slate-400 text-[10px] font-bold mb-4 leading-relaxed">Unlock unlimited AI interviews and high-priority parsing.</p>
          <button className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black shadow-lg shadow-blue-900/20 hover:bg-blue-500 transition-colors">
            Get Pro Access
          </button>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
