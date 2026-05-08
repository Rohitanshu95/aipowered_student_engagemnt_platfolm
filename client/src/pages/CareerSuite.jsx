import React, { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Target, Map, Briefcase, ChevronRight, Upload, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react'
import AtsChecker from '../components/AtsChecker'
import ResumeMaker from '../components/ResumeMaker'
import JobHub from '../components/JobHub'
import RoadmapView from '../components/RoadmapView'
import DashboardLayout from '../components/DashboardLayout'

const tabs = [
    { id: 'ats', name: 'ATS Checker', icon: Target, color: 'bg-emerald-500' },
    { id: 'resume', name: 'Resume Maker', icon: FileText, color: 'bg-blue-500' },
    { id: 'jobs', name: 'Job Hub', icon: Briefcase, color: 'bg-blue-600' },
    { id: 'prep', name: 'Preparation', icon: Map, color: 'bg-indigo-600' },
]

function CareerSuite() {
    const [searchParams, setSearchParams] = useSearchParams()
    const tabParam = searchParams.get('tab')
    const activeTab = tabParam === 'roadmap' ? 'prep' : (tabParam || 'prep')

    const handleTabChange = (tabId) => {
        setSearchParams({ tab: tabId }, { replace: true })
    }

    return (
        <DashboardLayout>
            <div className="pb-8">
                {/* Mobile Header */}
                <header className="mb-6 px-1">
                    <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2 text-blue-600 font-bold text-[9px] uppercase tracking-widest mb-2"
                    >
                        <Sparkles size={12} />
                        Professional Suite
                    </motion.div>
                    <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                        {tabs.find(t => t.id === activeTab)?.name || 'Career Suite'}
                    </h1>
                </header>

                {/* Mobile Tab Toggle */}
                <div className="flex items-center gap-2 mb-8 bg-slate-50 p-1.5 rounded-xl border border-slate-100 overflow-x-auto no-scrollbar scrollbar-hide">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 font-bold text-[10px] uppercase tracking-widest whitespace-nowrap ${
                                activeTab === tab.id
                                    ? `bg-slate-900 text-white shadow-md`
                                    : 'text-slate-400 active:bg-slate-100'
                            }`}
                        >
                            <tab.icon size={14} />
                            <span>{tab.name.split(' ')[0]}</span>
                        </button>
                    ))}
                </div>

                {/* Main Content Area - Mobile Optimized */}
                <main className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden min-h-[500px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="p-4 sm:p-6">
                                {activeTab === 'ats' && <AtsChecker />}
                                {activeTab === 'resume' && <ResumeMaker />}
                                {activeTab === 'jobs' && <JobHub />}
                                {activeTab === 'prep' && <RoadmapView />}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </DashboardLayout>
    )
}

export default CareerSuite;
