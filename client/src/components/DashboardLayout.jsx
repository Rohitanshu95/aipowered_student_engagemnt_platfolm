import React from 'react';
import Sidebar from './Sidebar';

function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-slate-50/50">
      <Sidebar />
      <main className="flex-1 min-w-0">
        <div className="p-8 lg:p-12">
          {children}
        </div>
      </main>
    </div>
  );
}

export default DashboardLayout;
