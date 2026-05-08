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
    // Alias roadmap to prep and default to prep
    const activeTab = tabParam === 'roadmap' ? 'prep' : (tabParam || 'prep')

    const handleTabChange = (tabId) => {
        setSearchParams({ tab: tabId }, { replace: true })
    }

    return (
        <DashboardLayout>
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div>
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-3 text-blue-600 font-black text-[10px] uppercase tracking-[0.2em] mb-4"
                        >
                            <Sparkles size={16} />
                            Professional Intelligence
                        </motion.div>
                        <h1 className="text-5xl font-[900] tracking-tighter text-slate-900 mb-4">
                            {tabs.find(t => t.id === activeTab)?.name || 'Career Suite'}.
                        </h1>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id)}
                                className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl transition-all duration-300 font-bold text-xs ${
                                    activeTab === tab.id
                                        ? `bg-blue-600 text-white shadow-lg`
                                        : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'
                                }`}
                            >
                                <tab.icon size={16} />
                                <span>{tab.name}</span>
                            </button>
                        ))}
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="relative bg-white rounded-[40px] border border-slate-50 shadow-sm overflow-hidden min-h-[600px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -30 }}
                            transition={{ type: "spring", stiffness: 100, damping: 20 }}
                            className="h-full p-8 md:p-12"
                        >
                            {activeTab === 'ats' && <AtsChecker />}
                            {activeTab === 'resume' && <ResumeMaker />}
                            {activeTab === 'jobs' && <JobHub />}
                            {activeTab === 'prep' && <RoadmapView />}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </DashboardLayout>
    )
}

export default CareerSuite
