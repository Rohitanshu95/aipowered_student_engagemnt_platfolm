import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Target, Map, Briefcase, ChevronRight, Upload, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react'
import AtsChecker from '../components/AtsChecker'
import ResumeMaker from '../components/ResumeMaker'
import JobHub from '../components/JobHub'
import RoadmapView from '../components/RoadmapView'
import Navbar from '../components/Navbar'
import { useSearchParams } from 'react-router-dom'

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
        <div className="min-h-screen bg-white selection:bg-blue-500 selection:text-white pb-24">
            <Navbar />
            <div className="max-w-7xl mx-auto px-6 pt-48">
                {/* Header */}
                <header className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-12">
                    <div className="max-w-3xl">
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-3 text-blue-600 font-black text-[10px] uppercase tracking-widest mb-6"
                        >
                            <Sparkles size={16} />
                            Professional Intelligence
                        </motion.div>
                        <h1 className="text-6xl md:text-7xl font-black tracking-tighter text-black mb-6">
                            Career Suite.
                        </h1>
                        <p className="text-xl text-gray-400 font-medium leading-relaxed">
                            A curated collection of AI tools designed to optimize your professional identity 
                            and accelerate your role-specific mastery.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 bg-gray-50 p-2 rounded-[32px] border border-gray-100">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id)}
                                className={`flex items-center gap-2.5 px-6 py-3.5 rounded-2xl transition-all duration-500 font-black text-[10px] uppercase tracking-widest ${
                                    activeTab === tab.id
                                        ? `bg-black text-white shadow-2xl scale-105`
                                        : 'text-gray-400 hover:text-black hover:bg-white'
                                }`}
                            >
                                <tab.icon size={16} />
                                <span>{tab.name}</span>
                            </button>
                        ))}
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="relative bg-white rounded-[48px] border-2 border-black/5 shadow-2xl shadow-black/5 overflow-hidden min-h-[700px]">
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
        </div>
    )
}

export default CareerSuite
