import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { ServerUrl } from '../App';
import { setUserData } from '../redux/userSlice';
import { 
  LayoutDashboard, 
  Target, 
  PlayCircle, 
  Map, 
  BarChart3, 
  Bookmark, 
  FileText, 
  User,
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
  { id: 'profile', name: 'Account Profile', icon: User, path: '/profile' },
];

function Sidebar({ isOpen, setIsOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      await axios.get(ServerUrl + "/api/auth/logout", { withCredentials: true });
      dispatch(setUserData(null));
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  const isActive = (itemPath) => {
    const currentPath = location.pathname;
    const currentSearch = location.search;
    
    if (itemPath.includes('?tab=')) {
      return (currentPath + currentSearch) === itemPath;
    }
    
    if (itemPath === '/dashboard') {
      return currentPath === '/dashboard';
    }
    
    if (itemPath === '/history') {
      return currentPath.startsWith('/history') || currentPath.startsWith('/report');
    }
    
    if (itemPath === '/interview') {
      return currentPath.startsWith('/interview');
    }
    
    return currentPath === itemPath;
  };

  return (
    <>
      {/* Backdrop for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[1000] lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.div 
        className={`fixed inset-y-0 left-0 z-[1001] w-72 bg-white flex flex-col transition-all duration-300 lg:translate-x-0 lg:static border-r border-slate-200 ${isOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full'}`}
      >
        {/* Logo & Close Button */}
        <div className="p-8 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-9 h-9 bg-slate-900 rounded-lg flex items-center justify-center shadow-sm">
              <Zap className="text-white fill-white" size={16} />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900">InterviewIQ</span>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-900 lg:hidden"
          >
            <LogOut size={18} className="rotate-180" />
          </button>
        </div>

        {/* Main Menu */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto no-scrollbar">
          <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4 mt-2">Platform</p>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                navigate(item.path);
                if (window.innerWidth < 1024) setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive(item.path)
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon size={18} className={isActive(item.path) ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'} />
              <span className="text-sm font-semibold">{item.name}</span>
            </button>
          ))}

          <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4 mt-8">Resources</p>
          {secondaryItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                navigate(item.path);
                if (window.innerWidth < 1024) setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            >
              <item.icon size={18} className="text-slate-400 group-hover:text-slate-600" />
              <span className="text-sm font-semibold">{item.name}</span>
            </button>
          ))}

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-rose-600 hover:bg-rose-50 mt-4"
          >
            <LogOut size={18} />
            <span className="text-sm font-semibold">Sign Out</span>
          </button>
        </nav>

        {/* Pro Banner */}
        <div className="p-6">
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
            <p className="text-slate-900 font-bold text-xs mb-1">Upgrade to Pro</p>
            <p className="text-slate-500 text-[11px] mb-4 leading-relaxed">Access advanced AI insights and priority processing.</p>
            <button 
              onClick={() => navigate('/pricing')}
              className="w-full py-2.5 bg-white border border-slate-200 text-slate-900 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors"
            >
              View Plans
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

export default Sidebar;
