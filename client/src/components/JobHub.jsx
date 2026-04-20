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
            <div className="p-8 border-b border-gray-100 bg-linear-to-b from-gray-50/50 to-white">
                <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input 
                            type="text" 
                            placeholder="Job title, skills, or company"
                            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none shadow-sm transition-all"
                            value={search.title}
                            onChange={(e) => setSearch({ ...search, title: e.target.value })}
                        />
                    </div>
                    <div className="md:w-64 relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input 
                            type="text" 
                            placeholder="Location"
                            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none shadow-sm transition-all"
                            value={search.location}
                            onChange={(e) => setSearch({ ...search, location: e.target.value })}
                        />
                    </div>
                    <button 
                        onClick={handleSearch}
                        className="bg-orange-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-orange-700 transition-all shadow-lg shadow-orange-200 flex items-center justify-center gap-2"
                    >
                        Search
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-8 space-y-12">
                <div className="max-w-6xl mx-auto">
                    <ResumeManager user={userData} onUpdate={fetchUser} />
                </div>

                {/* Trending Govt Internships Section */}
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <Sparkles className="text-orange-500" /> Trending Govt Internships
                            </h2>
                            <p className="text-gray-500 text-sm italic">Direct live results from official government portals</p>
                        </div>
                        <button 
                            onClick={() => fetchTrending(true)}
                            disabled={loadingTrending}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm ${
                                loadingTrending 
                                ? 'bg-orange-100 text-orange-400' 
                                : 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                            }`}
                        >
                            <RefreshCw size={16} className={loadingTrending ? 'animate-spin' : ''} />
                            {loadingTrending ? 'Syncing...' : 'Live Sync'}
                        </button>
                    </div>

                    <div className="flex gap-6 overflow-x-auto pb-6 -mx-4 px-4 no-scrollbar">
                        {loadingTrending ? (
                            [1, 2, 3].map(i => (
                                <div key={i} className="min-w-[350px] h-64 bg-gray-50 border border-gray-100 rounded-3xl p-6 relative overflow-hidden">
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
                            <div className="w-full py-16 text-center bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
                                <div className="bg-white h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4 text-orange-300 shadow-sm">
                                    <RefreshCw size={24} />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">No live data fetched yet</h3>
                                <p className="text-gray-500 mb-4">Click "Live Sync" to pull the latest results from government portals.</p>
                                <button 
                                    onClick={() => fetchTrending(true)}
                                    className="bg-gray-900 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg active:scale-95 transition-all"
                                >
                                    Start Live Sync
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Results Section */}
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Briefcase className="text-blue-500" /> Live Industry Opportunities
                        </h2>
                        {jobs.length > 0 && (
                            <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-black">
                                {jobs.length} REAL ROLES FOUND
                            </span>
                        )}
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[1, 2, 3, 4].map(i => <div key={i} className="h-64 bg-gray-50 animate-pulse rounded-3xl" />)}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
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
                                <div className="col-span-full py-20 text-center bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
                                    <div className="bg-white h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300 shadow-sm">
                                        <Filter size={32} />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">No original roles found yet</h3>
                                    <p className="text-gray-500">Try searching for simple titles like "Java", "Python" or "Intern".</p>
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
            className="min-w-[350px] bg-linear-to-br from-white to-orange-50/30 border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all border-l-4 border-l-orange-500 relative"
        >
            {item.matchScore && (
                <div className="absolute top-4 right-4 bg-emerald-500 text-white px-3 py-1 rounded-full text-[10px] font-black shadow-lg animate-pulse z-20">
                    {item.matchScore}% MATCH
                </div>
            )}

            <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-600 bg-orange-100 px-2 py-1 rounded-md">
                    {item.source}
                </span>
                <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-md">
                    {item.type}
                </span>
            </div>
            
            <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">{item.title}</h3>
            <p className="text-gray-500 text-sm font-medium mb-4 truncate">{item.org}</p>
            
            {item.matchReason && (
                <div className="mb-4 bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100/50">
                    <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-1 flex items-center gap-1">
                        <Sparkles size={10} /> Why you?
                    </p>
                    <p className="text-[11px] text-emerald-800 leading-tight italic font-medium">
                        "{item.matchReason}"
                    </p>
                </div>
            )}

            <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 bg-white/50 p-2 rounded-lg border border-gray-100">
                    <DollarSign size={14} className="text-emerald-500" /> {item.stipend}
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 bg-white/50 p-2 rounded-lg border border-gray-100">
                    <Clock size={14} className="text-blue-500" /> {item.duration}
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 bg-white/50 p-2 rounded-lg border border-gray-100">
                    <Calendar size={14} className="text-orange-500" /> {item.closeDate}
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 bg-white/50 p-2 rounded-lg border border-gray-100">
                    <MapPin size={14} className="text-gray-400" /> {item.location}
                </div>
            </div>

            <a 
                href={item.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full py-3 bg-gray-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-black transition-colors"
            >
                View on Official Portal <ChevronRight size={14} />
            </a>
        </motion.div>
    )
}

function JobCard({ job, onMatch, isMatching, hasResume }) {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group bg-white border border-gray-100 rounded-3xl p-6 hover:shadow-2xl hover:border-orange-200 transition-all duration-300 relative overflow-hidden"
        >
            <div className="flex items-start gap-4 mb-6">
                <div className="h-14 w-14 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 shrink-0 group-hover:bg-orange-100 group-hover:text-orange-600 transition-colors">
                    <Briefcase size={28} />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors leading-tight truncate">
                        {job.title}
                    </h3>
                    <p className="text-gray-500 font-medium flex items-center gap-1 truncate">
                        {job.company} • <span className="text-gray-400 text-sm">{job.postedAt}</span>
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600 font-medium bg-gray-50 px-3 py-2 rounded-xl truncate">
                    <MapPin size={16} className="text-gray-400 shrink-0" /> {job.location}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 font-medium bg-gray-50 px-3 py-2 rounded-xl truncate">
                    <DollarSign size={16} className="text-gray-400 shrink-0" /> {job.salary}
                </div>
            </div>

            <p className="text-gray-500 text-sm line-clamp-2 mb-6">
                {job.description}
            </p>

            <div className="flex flex-wrap gap-2 mb-8 h-14 overflow-hidden">
                {job.tags?.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-gray-50 text-gray-500 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        {tag}
                    </span>
                ))}
            </div>

            <div className="flex gap-4">
                <button 
                    onClick={onMatch}
                    disabled={isMatching}
                    className={`flex-1 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 group ${
                        isMatching 
                        ? 'bg-gray-100 text-gray-400' 
                        : 'bg-orange-600 text-white shadow-xl shadow-orange-100 hover:shadow-orange-200 active:scale-95'
                    }`}
                >
                    {isMatching ? (
                        <RefreshCw className="animate-spin" size={18} />
                    ) : (
                        <>
                            <Zap size={18} fill="currentColor" /> {hasResume ? 'Match Resume' : 'AI Match'}
                        </>
                    )}
                </button>
                {job.link && (
                    <a 
                        href={job.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-4 bg-gray-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-95"
                    >
                        Apply <ChevronRight size={18} />
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden relative"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-8">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="h-16 w-16 rounded-3xl bg-orange-100 flex flex-col items-center justify-center text-orange-600 font-black text-xl shadow-inner border border-orange-200 shrink-0">
                            {analysis.matchScore}%
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900">AI Match Analysis</h3>
                            <p className="text-gray-500">{analysis.jobTitle} @ {analysis.company}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div className="space-y-4">
                            <h4 className="font-bold text-gray-900 flex items-center gap-2">
                                <CheckCircle2 className="text-emerald-500" size={18} />
                                Why You're a Match
                            </h4>
                            <div className="space-y-3">
                                {analysis.reasons.map((r, i) => (
                                    <div key={i} className="bg-emerald-50 p-4 rounded-2xl text-sm text-emerald-800 font-medium leading-relaxed">
                                        {r}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="font-bold text-gray-900 flex items-center gap-2">
                                <AlertCircle className="text-orange-500" size={18} />
                                Gaps to Close
                            </h4>
                            <div className="space-y-3">
                                {analysis.missingSkills.map((s, i) => (
                                    <div key={i} className="bg-orange-50 p-4 rounded-2xl text-sm text-orange-800 font-medium leading-relaxed">
                                        {s}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-linear-to-r from-gray-900 to-gray-800 p-6 rounded-3xl text-white">
                        <h4 className="flex items-center gap-2 font-bold mb-2 text-orange-400 uppercase text-xs tracking-widest">
                            <Sparkles size={16} /> AI Advice
                        </h4>
                        <p className="text-lg font-medium leading-relaxed italic">
                            "{analysis.recommendation}"
                        </p>
                    </div>

                    <button 
                        onClick={onClose}
                        className="w-full mt-8 py-4 bg-gray-100 text-gray-900 font-bold rounded-2xl hover:bg-gray-200 transition-all active:scale-95"
                    >
                        Great, thanks!
                    </button>
                </div>
            </motion.div>
        </motion.div>
    )
}

export default JobHub
