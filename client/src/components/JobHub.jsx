import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
    Search, MapPin, Briefcase, Clock, DollarSign, 
    Zap, CheckCircle2, AlertCircle, Sparkles, Filter, X, RefreshCw,
    ChevronRight, Calendar
} from 'lucide-react'
import axios from 'axios'
import { ServerUrl } from '../App'

import ResumeManager from './ResumeManager'

function JobHub() {
    const [search, setSearch] = useState({ title: '', location: '' })
    const [jobs, setJobs] = useState([])
    const [trending, setTrending] = useState([])
    const [userData, setUserData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [loadingTrending, setLoadingTrending] = useState(false)
    const [matchingId, setMatchingId] = useState(null)
    const [activeMatch, setActiveMatch] = useState(null)

    // Initial load
    useEffect(() => {
        handleSearch()
        fetchTrending()
        fetchUser()
    }, [])

    const fetchUser = async () => {
        try {
            const response = await axios.get(`${ServerUrl}/api/user/me`, { withCredentials: true })
            setUserData(response.data)
        } catch (error) {
            console.error("Failed to fetch user:", error)
        }
    }

    const fetchTrending = async (force = false) => {
        // ... (existing fetchTrending logic)
        setLoadingTrending(true)
        try {
            const url = force 
                ? `${ServerUrl}/api/career/trending-internships?force=true` 
                : `${ServerUrl}/api/career/trending-internships`
            const response = await axios.get(url, { withCredentials: true })
            setTrending(response.data.internships)
        } catch (error) {
            console.error("Failed to fetch trending:", error)
        } finally {
            setLoadingTrending(false)
        }
    }

    const handleSearch = async () => {
        setLoading(true)
        try {
            const response = await axios.post(`${ServerUrl}/api/career/search-jobs`, search, {
                withCredentials: true
            })
            setJobs(response.data.jobs)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }
    
    // ... rest of the functions (checkMatchPercentage)

    const checkMatchPercentage = async (job) => {
        setMatchingId(job.id)
        try {
            const response = await axios.post(`${ServerUrl}/api/career/match-job`, {
                jobTitle: job.title,
                jobDescription: job.description,
                company: job.company
            }, { withCredentials: true })
            
            setActiveMatch({
                ...response.data.analysis,
                jobTitle: job.title,
                company: job.company
            })
        } catch (error) {
            console.error(error)
            alert("Failed to calculate match score. Ensure your profile is updated!")
        } finally {
            setMatchingId(null)
        }
    }

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Search Header */}
            <div className="p-4 sm:p-8 border-b border-gray-100 bg-linear-to-b from-gray-50/50 to-white">
                <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-3 sm:gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Title or skills..."
                            className="w-full pl-11 pr-4 py-3.5 sm:py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none shadow-sm transition-all text-sm"
                            value={search.title}
                            onChange={(e) => setSearch({ ...search, title: e.target.value })}
                        />
                    </div>
                    <div className="md:w-64 relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Location"
                            className="w-full pl-11 pr-4 py-3.5 sm:py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none shadow-sm transition-all text-sm"
                            value={search.location}
                            onChange={(e) => setSearch({ ...search, location: e.target.value })}
                        />
                    </div>
                    <button 
                        onClick={handleSearch}
                        className="bg-orange-600 text-white px-8 py-3.5 sm:py-4 rounded-2xl font-black text-sm sm:text-base hover:bg-orange-700 transition-all shadow-lg shadow-orange-200 flex items-center justify-center gap-2 active:scale-95"
                    >
                        Search Sequence
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 sm:space-y-12 no-scrollbar">
                <div className="max-w-6xl mx-auto">
                    <ResumeManager user={userData} onUpdate={fetchUser} />
                </div>

                {/* Trending Govt Internships Section */}
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
                        <div>
                            <h2 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2 tracking-tighter">
                                <Sparkles className="text-orange-500" size={20} /> 
                                Trending Sequence
                            </h2>
                            <p className="text-gray-400 text-[10px] sm:text-sm font-bold uppercase tracking-widest mt-1">Live Portals Sync</p>
                        </div>
                        <button 
                            onClick={() => fetchTrending(true)}
                            disabled={loadingTrending}
                            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${
                                loadingTrending 
                                ? 'bg-orange-100 text-orange-400' 
                                : 'bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-100'
                            }`}
                        >
                            <RefreshCw size={14} className={loadingTrending ? 'animate-spin' : ''} />
                            {loadingTrending ? 'Syncing...' : 'Live Sync'}
                        </button>
                    </div>

                    <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 -mx-2 px-2 sm:-mx-4 sm:px-4 no-scrollbar">
                        {loadingTrending ? (
                            [1, 2, 3].map(i => (
                                <div key={i} className="min-w-[280px] sm:min-w-[350px] h-64 bg-gray-50 border border-gray-100 rounded-[32px] p-6 relative overflow-hidden">
                                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-4 animate-pulse" />
                                    <div className="h-8 bg-gray-200 rounded w-3/4 mb-4 animate-pulse" />
                                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-8 animate-pulse" />
                                    <div className="grid grid-cols-2 gap-2">
                                        {[1, 2, 3, 4].map(j => <div key={j} className="h-10 bg-gray-200 rounded-lg animate-pulse" />)}
                                    </div>
                                </div>
                            ))
                        ) : trending.length > 0 ? (
                            trending.map((item, idx) => (
                                <TrendingCard key={idx} item={item} />
                            ))
                        ) : (
                            <div className="w-full py-12 sm:py-16 text-center bg-gray-50/50 rounded-[32px] border border-dashed border-gray-200">
                                <div className="bg-white h-12 w-12 sm:h-16 sm:w-16 rounded-full flex items-center justify-center mx-auto mb-4 text-orange-300 shadow-sm">
                                    <RefreshCw size={20} sm={24} />
                                </div>
                                <h3 className="text-sm sm:text-lg font-black text-gray-900 tracking-tight">No live artifacts found</h3>
                                <p className="text-gray-400 text-[10px] sm:text-sm font-medium mb-6">Initialize sync for govt portal artifacts.</p>
                                <button 
                                    onClick={() => fetchTrending(true)}
                                    className="bg-gray-900 text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                                >
                                    Start Live Sync
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Results Section */}
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
                        <h2 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2 tracking-tighter">
                            <Briefcase className="text-blue-500" size={20} /> Industry Vectors
                        </h2>
                        {jobs.length > 0 && (
                            <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100 self-start sm:self-center">
                                {jobs.length} Opportunities
                            </span>
                        )}
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                            {[1, 2, 3, 4].map(i => <div key={i} className="h-64 bg-gray-50 animate-pulse rounded-[32px]" />)}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
                            {jobs.map((job) => (
                                <JobCard 
                                    key={job.id} 
                                    job={job} 
                                    onMatch={() => checkMatchPercentage(job)} 
                                    isMatching={matchingId === job.id} 
                                    hasResume={!!userData?.resumeUrl}
                                />
                            ))}
                            {jobs.length === 0 && !loading && (
                                <div className="col-span-full py-16 text-center bg-gray-50/50 rounded-[32px] border border-dashed border-gray-200 px-4">
                                    <div className="bg-white h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300 shadow-sm">
                                        <Filter size={24} />
                                    </div>
                                    <h3 className="text-lg font-black text-gray-900 tracking-tight">No vectors matched</h3>
                                    <p className="text-[10px] sm:text-sm text-gray-400 font-bold uppercase tracking-widest">Adjust search filters for expanded results.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Match Modal Overlay */}
            <AnimatePresence>
                {activeMatch && (
                    <MatchModal analysis={activeMatch} onClose={() => setActiveMatch(null)} />
                )}
            </AnimatePresence>
        </div>
    )
}

function TrendingCard({ item }) {
    return (
        <motion.div 
            whileHover={{ y: -5 }}
            className="min-w-[280px] sm:min-w-[350px] bg-linear-to-br from-white to-orange-50/30 border border-gray-100 rounded-[32px] p-5 sm:p-6 shadow-sm hover:shadow-xl transition-all border-l-4 border-l-orange-500 relative"
        >
            {item.matchScore && (
                <div className="absolute top-4 right-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-[9px] font-black shadow-lg animate-pulse z-20 uppercase tracking-widest">
                    {item.matchScore}% Match
                </div>
            )}

            <div className="flex justify-between items-start mb-4">
                <span className="text-[9px] font-black uppercase tracking-widest text-orange-600 bg-orange-100 px-2.5 py-1 rounded-lg">
                    {item.source}
                </span>
                <span className="text-[9px] font-black text-gray-400 bg-gray-100 px-2.5 py-1 rounded-lg uppercase tracking-widest">
                    {item.type}
                </span>
            </div>
            
            <h3 className="text-base sm:text-lg font-black text-gray-900 mb-1 line-clamp-1 tracking-tight">{item.title}</h3>
            <p className="text-gray-400 text-[10px] sm:text-xs font-black uppercase tracking-widest mb-4 truncate opacity-60">{item.org}</p>
            
            {item.matchReason && (
                <div className="mb-4 bg-emerald-50/50 p-3 sm:p-4 rounded-[20px] border border-emerald-100/50">
                    <p className="text-[9px] font-black text-emerald-700 uppercase tracking-widest mb-1 flex items-center gap-1">
                        <Sparkles size={10} /> Intelligence Insight
                    </p>
                    <p className="text-[11px] text-emerald-800 leading-tight italic font-bold">
                        "{item.matchReason}"
                    </p>
                </div>
            )}

            <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-6">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 bg-white/50 p-2 rounded-xl border border-gray-100 truncate">
                    <DollarSign size={12} className="text-emerald-500" /> {item.stipend}
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 bg-white/50 p-2 rounded-xl border border-gray-100 truncate">
                    <Clock size={12} className="text-blue-500" /> {item.duration}
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 bg-white/50 p-2 rounded-xl border border-gray-100 truncate">
                    <Calendar size={12} className="text-orange-500" /> {item.closeDate}
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 bg-white/50 p-2 rounded-xl border border-gray-100 truncate">
                    <MapPin size={12} className="text-gray-400" /> {item.location}
                </div>
            </div>

            <a 
                href={item.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full py-3.5 bg-gray-900 text-white rounded-[18px] text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-orange-600 transition-all active:scale-95"
            >
                View Portal <ChevronRight size={14} />
            </a>
        </motion.div>
    )
}

function JobCard({ job, onMatch, isMatching, hasResume }) {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group bg-white border border-gray-100 rounded-[32px] p-5 sm:p-6 hover:shadow-2xl hover:border-orange-200 transition-all duration-300 relative overflow-hidden"
        >
            <div className="flex items-start gap-3 sm:gap-4 mb-6">
                <div className="h-12 w-12 sm:h-14 sm:w-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 shrink-0 group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors">
                    <Briefcase size={24} sm={28} />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-lg sm:text-xl font-black text-gray-900 group-hover:text-orange-600 transition-colors leading-tight truncate tracking-tight">
                        {job.title}
                    </h3>
                    <p className="text-gray-400 font-bold text-[10px] sm:text-sm uppercase tracking-widest flex items-center gap-1 truncate mt-0.5">
                        {job.company} • <span className="opacity-60">{job.postedAt}</span>
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="flex items-center gap-2 text-[10px] sm:text-xs text-gray-500 font-black uppercase tracking-widest bg-gray-50 px-3 py-2.5 rounded-xl truncate">
                    <MapPin size={14} className="text-gray-400 shrink-0" /> {job.location}
                </div>
                <div className="flex items-center gap-2 text-[10px] sm:text-xs text-gray-500 font-black uppercase tracking-widest bg-gray-50 px-3 py-2.5 rounded-xl truncate">
                    <DollarSign size={14} className="text-gray-400 shrink-0" /> {job.salary}
                </div>
            </div>

            <p className="text-gray-500 text-xs sm:text-sm leading-relaxed line-clamp-2 mb-6 font-medium">
                {job.description}
            </p>

            <div className="flex flex-wrap gap-2 mb-8 h-8 overflow-hidden">
                {job.tags?.map(tag => (
                    <span key={tag} className="px-2.5 py-1 bg-slate-50 text-slate-400 rounded-lg text-[8px] sm:text-[9px] font-black uppercase tracking-widest border border-slate-100/50">
                        {tag}
                    </span>
                ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
                <button 
                    onClick={onMatch}
                    disabled={isMatching}
                    className={`flex-1 py-3.5 sm:py-4 rounded-[18px] font-black text-[10px] sm:text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 group ${
                        isMatching 
                        ? 'bg-gray-100 text-gray-300' 
                        : 'bg-orange-600 text-white shadow-xl shadow-orange-100 hover:bg-black active:scale-95'
                    }`}
                >
                    {isMatching ? (
                        <RefreshCw className="animate-spin" size={16} />
                    ) : (
                        <>
                            <Zap size={14} fill="currentColor" /> {hasResume ? 'Analyze Fit' : 'AI Analysis'}
                        </>
                    )}
                </button>
                {job.link && (
                    <a 
                        href={job.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-3.5 sm:py-4 bg-gray-900 text-white rounded-[18px] font-black text-[10px] sm:text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-orange-600 transition-all active:scale-95"
                    >
                        Apply Artifact <ChevronRight size={16} />
                    </a>
                )}
            </div>
        </motion.div>
    )
}

function MatchModal({ analysis, onClose }) {
    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/80 backdrop-blur-md"
            onClick={onClose}
        >
            <motion.div 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="bg-white rounded-t-[40px] sm:rounded-[48px] shadow-2xl w-full max-w-2xl overflow-hidden relative max-h-[90vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <div className="overflow-y-auto no-scrollbar flex-1 p-6 sm:p-10">
                    <div className="w-12 h-1.5 bg-slate-100 rounded-full mx-auto mb-8 sm:hidden" />
                    
                    <div className="flex items-center gap-4 sm:gap-6 mb-8 sm:mb-12">
                        <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-[24px] sm:rounded-[32px] bg-orange-100 flex flex-col items-center justify-center text-orange-600 font-black text-xl sm:text-2xl shadow-inner border border-orange-200 shrink-0">
                            {analysis.matchScore}%
                        </div>
                        <div>
                            <h3 className="text-xl sm:text-3xl font-[900] text-slate-900 tracking-tighter">AI Alignment.</h3>
                            <p className="text-[10px] sm:text-xs text-slate-400 font-black uppercase tracking-widest mt-1">{analysis.jobTitle} • {analysis.company}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 mb-8 sm:mb-12">
                        <div className="space-y-4 sm:space-y-6">
                            <h4 className="font-black text-[10px] sm:text-xs text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <CheckCircle2 className="text-emerald-500" size={16} />
                                Strength Sequence
                            </h4>
                            <div className="space-y-3">
                                {analysis.reasons.map((r, i) => (
                                    <div key={i} className="bg-emerald-50/50 p-4 rounded-[22px] text-xs sm:text-sm text-emerald-800 font-bold leading-relaxed border border-emerald-100/50">
                                        {r}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4 sm:space-y-6">
                            <h4 className="font-black text-[10px] sm:text-xs text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <AlertCircle className="text-orange-500" size={16} />
                                Gap Identification
                            </h4>
                            <div className="space-y-3">
                                {analysis.missingSkills.map((s, i) => (
                                    <div key={i} className="bg-orange-50/50 p-4 rounded-[22px] text-xs sm:text-sm text-orange-800 font-bold leading-relaxed border border-orange-100/50">
                                        {s}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 sm:p-10 rounded-[32px] sm:rounded-[40px] text-white shadow-xl">
                        <h4 className="flex items-center gap-2 font-black mb-4 text-orange-400 uppercase text-[10px] tracking-[0.2em] opacity-80">
                            <Sparkles size={16} /> Professional Advice
                        </h4>
                        <p className="text-base sm:text-2xl font-bold leading-tight italic tracking-tight">
                            "{analysis.recommendation}"
                        </p>
                    </div>

                    <button 
                        onClick={onClose}
                        className="w-full mt-8 sm:mt-12 py-4.5 bg-slate-100 text-slate-900 font-black text-[10px] sm:text-xs uppercase tracking-widest rounded-[22px] hover:bg-black hover:text-white transition-all active:scale-95"
                    >
                        Continue Sequence
                    </button>
                </div>
            </motion.div>
        </motion.div>
    )
}


export default JobHub
