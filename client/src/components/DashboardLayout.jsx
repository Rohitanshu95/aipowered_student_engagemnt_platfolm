import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu, Zap, Bell, Home, Briefcase, Map, Target, User } from 'lucide-react';

function DashboardLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { id: 'home', icon: Home, label: 'Home', path: '/dashboard' },
    { id: 'career', icon: Target, label: 'Career', path: '/career-suite?tab=ats' },
    { id: 'jobs', icon: Briefcase, label: 'Jobs', path: '/career-suite?tab=jobs' },
    { id: 'prep', icon: Map, label: 'Prep', path: '/career-suite?tab=prep' },
  ];

  const isActive = (path) => location.pathname + location.search === path;

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      {/* Mobile-Only Header */}
      <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-5 sticky top-0 z-[500] shadow-sm">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
            <Zap className="text-white fill-white" size={14} />
          </div>
          <span className="text-lg font-extrabold tracking-tight text-slate-900">InterviewIQ</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button className="p-2 text-slate-400">
             <Bell size={20} />
          </button>
          <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-slate-900"
          >
              <Menu size={22} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 pb-24">
        <div className="p-5 w-full">
          {children}
        </div>
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-slate-100 flex items-center justify-around px-2 z-[501] pb-safe">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center gap-1.5 px-4 py-2 transition-all duration-200 ${
              isActive(item.path) ? 'text-blue-600' : 'text-slate-400'
            }`}
          >
            <item.icon size={20} className={isActive(item.path) ? 'scale-110' : ''} />
            <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
        <button
          onClick={() => navigate('/profile')}
          className={`flex flex-col items-center gap-1.5 px-4 py-2 transition-all duration-200 ${
            location.pathname === '/profile' ? 'text-blue-600' : 'text-slate-400'
          }`}
        >
          <User size={20} className={location.pathname === '/profile' ? 'scale-110' : ''} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Profile</span>
        </button>
      </nav>
    </div>
  );
}

export default DashboardLayout;
