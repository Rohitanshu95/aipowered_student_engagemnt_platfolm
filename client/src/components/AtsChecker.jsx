import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, CheckCircle2, AlertCircle, RefreshCw, Star, ArrowRight, Sparkles, XCircle, AlertTriangle, ChevronDown, ChevronUp, Search, Shield, Type, BarChart3, Zap, Target, FileSearch, Briefcase } from 'lucide-react'
import axios from 'axios'
import { ServerUrl } from '../App'

// --- Sub-Components ---

const ScoreRing = ({ score, size = 140, stroke = 10, label }) => {
    const radius = (size - stroke) / 2
    const circumference = 2 * Math.PI * radius
    const color = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444'
    return (
        <div className="flex flex-col items-center">
            <svg width={size} height={size} className="transform -rotate-90">
                <circle cx={size/2} cy={size/2} r={radius} fill="transparent" stroke="#e5e7eb" strokeWidth={stroke} />
                <motion.circle
                    cx={size/2} cy={size/2} r={radius} fill="transparent"
                    stroke={color} strokeWidth={stroke} strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: circumference - (circumference * score) / 100 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                />
            </svg>
            <div className="absolute flex flex-col items-center justify-center" style={{ width: size, height: size }}>
                <span className="text-3xl font-black" style={{ color }}>{score}</span>
                <span className="text-xs text-gray-400 font-semibold">/100</span>
            </div>
            {label && <p className="mt-2 text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</p>}
        </div>
    )
}

const VerdictBadge = ({ verdict, message }) => {
    const styles = {
        PASS: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', icon: <CheckCircle2 size={20} />, label: 'ATS PASS' },
        NEEDS_WORK: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', icon: <AlertTriangle size={20} />, label: 'NEEDS WORK' },
        HIGH_RISK: { bg: 'bg-red-50 border-red-200', text: 'text-red-700', icon: <XCircle size={20} />, label: 'HIGH RISK' }
    }
    const s = styles[verdict] || styles.NEEDS_WORK
    return (
        <div className={`${s.bg} border rounded-2xl p-5 flex items-start gap-4`}>
            <div className={`${s.text} mt-0.5`}>{s.icon}</div>
            <div>
                <p className={`font-black text-sm uppercase tracking-wider ${s.text}`}>{s.label}</p>
                <p className="text-gray-600 text-sm mt-1 leading-relaxed">{message}</p>
            </div>
        </div>
    )
}

const SectionRow = ({ name, data, icon }) => {
    const score = data?.score ?? 0
    const color = score >= 75 ? 'text-emerald-600 bg-emerald-50' : score >= 50 ? 'text-amber-600 bg-amber-50' : 'text-red-600 bg-red-50'
    const barColor = score >= 75 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-500'
    const [open, setOpen] = useState(false)
    return (
        <div className="border border-gray-100 rounded-2xl overflow-hidden">
            <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-4 p-4 hover:bg-gray-50/50 transition text-left">
                <div className={`h-9 w-9 rounded-xl flex items-center justify-center text-sm font-black ${color}`}>{score}</div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        {icon}
                        <p className="font-bold text-gray-900 text-sm">{name}</p>
                        {data?.found === false && <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">MISSING</span>}
                        {data?.found === true && <span className="text-[10px] bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full font-bold">FOUND</span>}
                    </div>
                    <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div className={`h-full rounded-full ${barColor}`} initial={{ width: 0 }} animate={{ width: `${score}%` }} transition={{ duration: 1, delay: 0.3 }} />
                    </div>
                </div>
                {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="px-5 pb-4 space-y-2 border-t border-gray-50 pt-3">
                            {data?.details && <p className="text-sm text-gray-600"><span className="font-semibold text-gray-800">Details:</span> {data.details}</p>}
                            {data?.fix && <p className="text-sm text-amber-700 bg-amber-50 p-3 rounded-xl"><span className="font-semibold">💡 Fix:</span> {data.fix}</p>}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

const FormatCheckRow = ({ check, status, detail }) => {
    const icon = status === 'pass' ? <CheckCircle2 size={16} className="text-emerald-500" /> : status === 'fail' ? <XCircle size={16} className="text-red-500" /> : <AlertTriangle size={16} className="text-amber-500" />
    const bg = status === 'pass' ? 'bg-emerald-50/50' : status === 'fail' ? 'bg-red-50/50' : 'bg-amber-50/50'
    return (
        <div className={`flex items-start gap-3 p-3 rounded-xl ${bg}`}>
            <div className="mt-0.5 shrink-0">{icon}</div>
            <div>
                <p className="text-sm font-semibold text-gray-900">{check}</p>
                <p className="text-xs text-gray-500 mt-0.5">{detail}</p>
            </div>
        </div>
    )
}

const KeywordTag = ({ word, type }) => {
    const styles = { matched: 'bg-emerald-100 text-emerald-700 border-emerald-200', missing: 'bg-red-100 text-red-700 border-red-200', suggested: 'bg-blue-100 text-blue-700 border-blue-200' }
    return <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full border ${styles[type]}`}>{word}</span>
}

const IssueRow = ({ severity, issue, fix }) => {
    const s = { critical: { bg: 'bg-red-50 border-red-100', dot: 'bg-red-500', label: 'CRITICAL' }, major: { bg: 'bg-amber-50 border-amber-100', dot: 'bg-amber-500', label: 'MAJOR' }, minor: { bg: 'bg-blue-50 border-blue-100', dot: 'bg-blue-500', label: 'MINOR' } }
    const style = s[severity] || s.minor
    return (
        <div className={`p-4 rounded-xl border ${style.bg}`}>
            <div className="flex items-center gap-2 mb-1">
                <div className={`h-2 w-2 rounded-full ${style.dot}`} />
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">{style.label}</span>
            </div>
            <p className="text-sm font-semibold text-gray-900">{issue}</p>
            {fix && <p className="text-xs text-gray-500 mt-1">→ {fix}</p>}
        </div>
    )
}

// --- Main Component ---

function AtsChecker() {
    const [file, setFile] = useState(null)
    const [jobDescription, setJobDescription] = useState('')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null)
    const [error, setError] = useState(null)
    const [user, setUser] = useState(null)
    const [activeResultTab, setActiveResultTab] = useState('overview')

    React.useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get(`${ServerUrl}/api/user/me`, { withCredentials: true })
                setUser(response.data)
            } catch (error) { console.error("Failed to fetch user:", error) }
        }
        fetchUserData()
    }, [])

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0]
        if (selectedFile && selectedFile.type === 'application/pdf') { setFile(selectedFile); setError(null) }
        else { setError('Please upload a valid PDF file.') }
    }

    const handleUpload = async () => {
        if (!file) return
        setLoading(true); setError(null)
        const formData = new FormData()
        formData.append('resume', file)
        if (jobDescription.trim()) formData.append('jobDescription', jobDescription)
        try {
            const response = await axios.post(`${ServerUrl}/api/career/ats-check`, formData, {
                withCredentials: true, headers: { 'Content-Type': 'multipart/form-data' }
            })
            setResult(response.data.analysis)
        } catch (err) {
            console.error(err)
            setError(err.response?.data?.message || 'Failed to analyze resume.')
        } finally { setLoading(false) }
    }

    const reset = () => { setFile(null); setResult(null); setError(null); setJobDescription(''); setActiveResultTab('overview') }

    const sectionIcons = {
        contactInfo: <FileText size={14} className="text-gray-400" />,
        summary: <Star size={14} className="text-gray-400" />,
        experience: <Briefcase size={14} className="text-gray-400" />,
        education: <BarChart3 size={14} className="text-gray-400" />,
        skills: <Zap size={14} className="text-gray-400" />,
        projects: <Target size={14} className="text-gray-400" />,
        certifications: <Shield size={14} className="text-gray-400" />
    }
    const sectionNames = { contactInfo: 'Contact Information', summary: 'Professional Summary', experience: 'Work Experience', education: 'Education', skills: 'Skills & Technologies', projects: 'Projects', certifications: 'Certifications' }

    const resultTabs = [
        { id: 'overview', label: 'Overview', icon: <BarChart3 size={15} /> },
        { id: 'sections', label: 'Sections', icon: <FileSearch size={15} /> },
        { id: 'keywords', label: 'Keywords', icon: <Search size={15} /> },
        { id: 'formatting', label: 'Formatting', icon: <Type size={15} /> },
        { id: 'issues', label: 'Issues', icon: <AlertTriangle size={15} /> }
    ]

    // --- RESULTS VIEW ---
    if (result) {
        return (
            <div className="max-w-5xl mx-auto px-2 sm:px-4">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 md:mb-8">
                    <h2 className="text-xl md:text-2xl font-black text-gray-900 flex items-center gap-2">
                        <Shield size={20} sm={24} className="text-emerald-600" /> 
                        <span className="tracking-tighter">ATS Deep Analysis</span>
                    </h2>
                    <button onClick={reset} className="w-full sm:w-auto flex items-center justify-center gap-2 text-[10px] sm:text-sm font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-5 py-2.5 rounded-xl transition border border-emerald-100">
                        <RefreshCw size={14} /> New Check
                    </button>
                </div>

                {/* Top Score + Verdict */}
                <div className="flex flex-col gap-4 mb-6">
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col items-center justify-center relative min-h-[180px]">
                        <ScoreRing score={result.overallScore || 0} size={140} />
                        <p className="mt-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Overall ATS Score</p>
                    </div>
                    <div className="space-y-4">
                        <VerdictBadge verdict={result.verdict} message={result.verdictMessage} />
                        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
                            <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed italic font-medium">"{result.summary}"</p>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation - Scrollable on Mobile */}
                <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar scrollbar-hide pb-2 px-1">
                    {resultTabs.map(tab => (
                        <button 
                            key={tab.id} 
                            onClick={() => setActiveResultTab(tab.id)}
                            className={`flex items-center gap-2 py-3 px-5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition whitespace-nowrap shrink-0 ${
                                activeResultTab === tab.id 
                                ? 'bg-slate-900 text-white shadow-lg' 
                                : 'bg-slate-50 text-slate-400 hover:text-slate-600 border border-slate-100'
                            }`}
                        >
                            {tab.icon} <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <AnimatePresence mode="wait">
                    <motion.div key={activeResultTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>

                        {/* OVERVIEW TAB */}
                        {activeResultTab === 'overview' && (
                            <div className="space-y-6 md:space-y-8">
                                {/* Strengths & Improvements */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                                    <div className="bg-white border border-gray-100 rounded-[32px] p-5 sm:p-8 shadow-sm">
                                        <h4 className="font-black text-gray-900 mb-4 sm:mb-6 flex items-center gap-2 text-[10px] sm:text-xs uppercase tracking-widest">
                                            <CheckCircle2 className="text-emerald-500" size={16} sm={18} /> Strengths
                                        </h4>
                                        <div className="space-y-3">
                                            {(result.strengths || []).map((s, i) => (
                                                <div key={i} className="flex gap-3 sm:gap-4 p-3 sm:p-4 bg-emerald-50/60 rounded-[20px]">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                                                    <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-bold tracking-tight">{s}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="bg-white border border-gray-100 rounded-[32px] p-5 sm:p-8 shadow-sm">
                                        <h4 className="font-black text-gray-900 mb-4 sm:mb-6 flex items-center gap-2 text-[10px] sm:text-xs uppercase tracking-widest">
                                            <AlertCircle className="text-amber-500" size={16} sm={18} /> Improvements
                                        </h4>
                                        <div className="space-y-3">
                                            {(result.improvements || []).map((w, i) => (
                                                <div key={i} className="flex gap-3 sm:gap-4 p-3 sm:p-4 bg-amber-50/60 rounded-[20px]">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                                                    <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-bold tracking-tight">{w}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                {/* Content Quality Insights */}
                                {result.contentQuality && (
                                    <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden group border border-slate-800">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[100px] -mr-32 -mt-32 transition-all" />
                                        <h4 className="font-bold mb-6 flex items-center gap-2 text-[9px] uppercase tracking-widest text-slate-400">
                                            <Sparkles className="text-blue-400" size={14} /> Neural Insights
                                        </h4>
                                        <div className="flex flex-col gap-4">
                                            <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5">
                                                <p className="text-3xl font-black text-blue-400">{result.contentQuality.quantifiedAchievements?.count || 0}</p>
                                                <p className="text-[9px] font-bold text-slate-500 mt-1 uppercase tracking-widest">Quantified Achievements</p>
                                            </div>
                                            <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5">
                                                <p className="text-3xl font-black text-emerald-400">{result.contentQuality.impactStatements || 0}<span className="text-sm text-slate-500 ml-1">/10</span></p>
                                                <p className="text-[9px] font-bold text-slate-500 mt-1 uppercase tracking-widest">Strategic Impact</p>
                                            </div>
                                            <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5">
                                                <p className="text-3xl font-black text-amber-400">{result.contentQuality.actionVerbs?.strong?.length || 0}</p>
                                                <p className="text-[9px] font-bold text-slate-500 mt-1 uppercase tracking-widest">Action Artifacts</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* SECTIONS TAB */}
                        {activeResultTab === 'sections' && result.sectionScores && (
                            <div className="space-y-3">
                                <p className="text-[10px] sm:text-xs text-gray-400 mb-2 font-black uppercase tracking-widest text-center">Tap sections for analysis & fixes</p>
                                {Object.entries(result.sectionScores).map(([key, data]) => (
                                    <SectionRow key={key} name={sectionNames[key] || key} data={data} icon={sectionIcons[key]} />
                                ))}
                            </div>
                        )}

                        {/* KEYWORDS TAB */}
                        {activeResultTab === 'keywords' && result.keywordAnalysis && (
                            <div className="space-y-4 sm:space-y-6">
                                <div className="bg-white border border-gray-100 rounded-[32px] p-5 sm:p-8 shadow-sm">
                                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                                        <h4 className="font-black text-[10px] sm:text-xs text-gray-400 uppercase tracking-widest">Keyword Match Rate</h4>
                                        <span className={`text-2xl sm:text-4xl font-black ${(result.keywordAnalysis.matchPercentage || 0) >= 70 ? 'text-emerald-600' : (result.keywordAnalysis.matchPercentage || 0) >= 40 ? 'text-amber-600' : 'text-red-600'}`}>{result.keywordAnalysis.matchPercentage || 0}%</span>
                                    </div>
                                    <div className="h-2.5 sm:h-3.5 bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                                        <motion.div className={`h-full rounded-full ${(result.keywordAnalysis.matchPercentage || 0) >= 70 ? 'bg-emerald-500' : (result.keywordAnalysis.matchPercentage || 0) >= 40 ? 'bg-amber-500' : 'bg-red-500'}`} initial={{ width: 0 }} animate={{ width: `${result.keywordAnalysis.matchPercentage || 0}%` }} transition={{ duration: 1 }} />
                                    </div>
                                </div>
                                {[{ title: 'Matched Keywords', items: result.keywordAnalysis.matchedKeywords, type: 'matched' },
                                  { title: 'Missing Keywords', items: result.keywordAnalysis.missingKeywords, type: 'missing' },
                                  { title: 'Suggested Keywords', items: result.keywordAnalysis.suggestedKeywords, type: 'suggested' }
                                ].map(group => group.items?.length > 0 && (
                                    <div key={group.type} className="bg-white border border-gray-100 rounded-[32px] p-5 sm:p-8 shadow-sm">
                                        <h4 className="font-black text-[10px] sm:text-xs text-gray-400 uppercase tracking-widest mb-4 sm:mb-6">{group.title}</h4>
                                        <div className="flex flex-wrap gap-2">{group.items.map((kw, i) => <KeywordTag key={i} word={kw} type={group.type} />)}</div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* FORMATTING TAB */}
                        {activeResultTab === 'formatting' && (
                            <div className="bg-white border border-gray-100 rounded-[32px] p-5 sm:p-8 shadow-sm">
                                <h4 className="font-black text-[10px] sm:text-xs text-gray-400 uppercase tracking-widest mb-6">ATS Parsability Engine</h4>
                                <div className="grid gap-3 sm:gap-4">
                                    {(result.formattingChecks || []).map((fc, i) => <FormatCheckRow key={i} {...fc} />)}
                                </div>
                            </div>
                        )}

                        {/* ISSUES TAB */}
                        {activeResultTab === 'issues' && (
                            <div className="space-y-3">
                                {(result.topIssues || []).length === 0 && <p className="text-center text-gray-400 py-16 font-black uppercase tracking-[0.2em] text-[10px]">🎉 No critical blocks identified</p>}
                                {(result.topIssues || []).map((iss, i) => <IssueRow key={i} {...iss} />)}
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        )
    }

    // --- UPLOAD VIEW ---
    return (
        <div className="h-full flex flex-col items-center justify-center px-4 py-12 lg:py-24">
            <div className="max-w-3xl w-full">
                <div className="text-center mb-12 lg:mb-16">
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="h-16 w-16 lg:h-20 lg:w-20 bg-slate-900 text-white rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg"
                    >
                        <Shield size={28} />
                    </motion.div>
                    <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">ATS System Scan</h2>
                    <p className="text-slate-500 font-medium max-w-lg mx-auto text-sm lg:text-base leading-relaxed">
                        Execute a professional analysis of your professional artifacts. Our system provides strategic alignment scoring and structural optimization.
                    </p>
                    {user?.resumeUrl && (
                        <div className="inline-flex items-center gap-2.5 bg-slate-50 text-slate-700 px-5 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-slate-200 mt-8 shadow-sm">
                            <CheckCircle2 size={14} className="text-emerald-600" /> Active Profile: {user.resumeName || 'Active Resume'}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
                    {/* Job Description Input */}
                    <div className="space-y-3">
                        <label className="flex items-center gap-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                            <Briefcase size={14} /> Target Description
                        </label>
                        <textarea
                            value={jobDescription} onChange={(e) => setJobDescription(e.target.value)}
                            placeholder="Paste the target role description here for keyword alignment..."
                            rows={6}
                            className="w-full border border-slate-200 bg-white rounded-xl p-5 text-sm text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600/20 resize-none transition-all"
                        />
                    </div>

                    {/* File Upload */}
                    <div className="space-y-3">
                        <label className="flex items-center gap-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                            <FileText size={14} /> Resume Document
                        </label>
                        <div className="relative group h-[200px]">
                            <input type="file" accept=".pdf" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                            <div className={`h-full border border-dashed rounded-xl p-8 transition-all duration-300 flex flex-col items-center justify-center text-center ${file ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-200 bg-slate-50/30 hover:border-blue-400 hover:bg-white'}`}>
                                {file ? (
                                    <div className="flex flex-col items-center">
                                        <div className="p-4 bg-white rounded-xl shadow-sm mb-4">
                                            <FileText className="text-emerald-500 h-8 w-8" />
                                        </div>
                                        <p className="font-bold text-slate-900 tracking-tight text-sm mb-1">{file.name}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{(file.size / 1024).toFixed(1)} KB</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <div className="p-4 bg-white rounded-xl shadow-sm mb-4">
                                            <Upload size={20} className="text-slate-400" />
                                        </div>
                                        <p className="text-slate-900 font-bold text-sm mb-1">Select Document</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">PDF Artifact • Max 5MB</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {error && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 flex items-center gap-3 text-rose-600 bg-rose-50 px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest justify-center border border-rose-100">
                        <AlertCircle size={16} /> {error}
                    </motion.div>
                )}

                <button onClick={handleUpload} disabled={!file || loading}
                    className={`w-full mt-8 py-4 rounded-xl font-bold text-sm tracking-widest uppercase transition-all flex items-center justify-center gap-3 ${!file || loading ? 'bg-slate-100 text-slate-300 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/10 active:scale-[0.98]'}`}>
                    {loading ? (
                        <><RefreshCw className="animate-spin" size={18} /> Processing Scan...</>
                    ) : (
                        <>Initialize Deep Scan <ArrowRight size={18} /></>
                    )}
                </button>
            </div>
        </div>
    )
}


export default AtsChecker
