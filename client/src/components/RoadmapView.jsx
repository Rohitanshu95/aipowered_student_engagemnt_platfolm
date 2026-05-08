import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
    Map, Target, Sparkles, BookOpen, Calendar, Clock, 
    CheckCircle2, ChevronRight, ArrowLeft, Play, Upload,
    AlertCircle, FileText, BrainCircuit, BarChart3, Trash2, Plus, ListChecks,
    Activity, TrendingUp, Filter, MoreVertical, Layers, ArrowRight
} from 'lucide-react'
import axios from 'axios'
import { ServerUrl } from '../App'
import AssessmentLab from './AssessmentLab'

function RoadmapView() {
    const [mode, setMode] = useState('choice') 
    const [loading, setLoading] = useState(false)
    const [roadmap, setRoadmap] = useState(null)
    const [roadmaps, setRoadmaps] = useState([])

    useEffect(() => {
        fetchUserRoadmaps()
    }, [])

    const fetchUserRoadmaps = async () => {
        setLoading(true)
        try {
            const resp = await axios.get(`${ServerUrl}/api/career/user-roadmaps`, { withCredentials: true })
            setRoadmaps(resp.data.roadmaps)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteRoadmap = async (e, id) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this study plan?")) return;
        
        try {
            await axios.delete(`${ServerUrl}/api/career/roadmap/${id}`, { withCredentials: true });
            setRoadmaps(prev => prev.filter(r => r._id !== id));
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <div className="h-full bg-white flex flex-col overflow-hidden selection:bg-blue-600 selection:text-white">
            <AnimatePresence mode="wait">
                {mode === 'hub' && (
                    <motion.div 
                        key="hub"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -30 }}
                        className="flex-1 overflow-y-auto p-4 sm:p-8 md:p-12 no-scrollbar"
                    >
                        <div className="max-w-6xl mx-auto">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-10 sm:mb-16">
                                <div>
                                    <h2 className="text-3xl sm:text-4xl font-[1000] text-slate-900 tracking-tighter">Learning Hub.</h2>
                                    <p className="text-[9px] sm:text-[10px] text-slate-400 font-black uppercase tracking-[0.25em] mt-2 sm:mt-3">Neural Preparation Trajectories</p>
                                </div>
                                <button 
                                    onClick={() => setMode('choice')}
                                    className="w-full sm:w-auto bg-black text-white px-8 sm:px-10 py-4 sm:py-5 rounded-[20px] sm:rounded-[32px] font-black text-[9px] sm:text-[10px] uppercase tracking-widest shadow-2xl shadow-black/10 hover:bg-blue-600 transition-all active:scale-95 flex items-center justify-center gap-3"
                                >
                                    <Plus size={18} /> New Preparation
                                </button>
                            </div>

                            {loading && roadmaps.length === 0 ? (
                                <div className="py-20 text-center">
                                    <div className="h-10 sm:h-12 w-10 sm:w-12 border-[6px] border-slate-100 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
                                    <p className="text-slate-400 font-black uppercase tracking-widest text-[9px] sm:text-[10px]">Accessing Vault...</p>
                                </div>
                            ) : roadmaps.length === 0 ? (
                                <div className="py-20 sm:py-32 bg-slate-50/50 border border-slate-100 rounded-[40px] sm:rounded-[64px] text-center flex flex-col items-center px-6">
                                    <div className="h-20 w-20 sm:h-24 sm:w-24 bg-white text-slate-200 rounded-[24px] sm:rounded-[32px] flex items-center justify-center mb-6 sm:mb-8 shadow-xl">
                                        <Layers size={32} sm={40} />
                                    </div>
                                    <h3 className="text-xl sm:text-2xl font-[1000] text-slate-900 mb-2">No Active Sequences.</h3>
                                    <p className="text-xs sm:text-sm text-slate-400 font-bold mb-8 sm:mb-10 uppercase tracking-widest">Start your first AI-guided journey today.</p>
                                    <button onClick={() => setMode('choice')} className="group text-blue-600 font-black text-[10px] sm:text-xs uppercase tracking-widest flex items-center gap-3 hover:gap-5 transition-all">
                                        Initialize Path <ArrowRight size={18} />
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
                                    {roadmaps.map((r, i) => (
                                        <motion.div 
                                            key={r._id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            className="group relative bg-white border border-slate-100 p-6 sm:p-10 rounded-[40px] sm:rounded-[56px] shadow-[0_20px_50px_rgba(0,0,0,0.03)] hover:border-blue-200 transition-all cursor-pointer overflow-hidden"
                                            onClick={() => { setRoadmap(r); setMode('dashboard'); }}
                                        >
                                            <div className="absolute top-0 right-0 p-8 sm:p-12 text-6xl sm:text-8xl font-black text-slate-50/50 pointer-events-none group-hover:text-blue-50 group-hover:scale-110 transition-all duration-1000 uppercase">IQ</div>
                                            
                                            <div className="flex items-center justify-between mb-8 sm:mb-12 relative z-10">
                                                <div className="h-14 w-14 sm:h-16 sm:w-16 bg-black text-white rounded-2xl sm:rounded-3xl flex items-center justify-center group-hover:bg-blue-600 transition-all duration-500 shadow-xl shadow-black/5">
                                                    <BookOpen size={28} sm={32} />
                                                </div>
                                                <div className="flex items-center gap-4 sm:gap-6">
                                                    <button 
                                                        onClick={(e) => handleDeleteRoadmap(e, r._id)}
                                                        className="p-3 sm:p-4 text-slate-200 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all"
                                                    >
                                                        <Trash2 size={18} sm={20} />
                                                    </button>
                                                    <div className="text-right">
                                                        <div className="text-[8px] sm:text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Impact</div>
                                                        <div className="text-2xl sm:text-4xl font-[1000] text-slate-900 leading-none tracking-tighter">{r.progress || 0}%</div>
                                                    </div>
                                                </div>
                                            </div>

                                            <h3 className="text-2xl sm:text-3xl font-[1000] text-slate-900 mb-2 sm:mb-3 relative z-10 tracking-tight">{r.stackName}</h3>
                                            <div className="flex items-center gap-2 mb-8 sm:mb-10 relative z-10">
                                                <span className="text-[9px] sm:text-[10px] font-black text-blue-600 uppercase tracking-widest">{r.planType} Strategy</span>
                                                <span className="h-1 w-1 bg-slate-200 rounded-full"></span>
                                                <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Neural Powered</span>
                                            </div>

                                            <div className="h-2 sm:h-2.5 w-full bg-slate-50 rounded-full overflow-hidden mb-6 sm:mb-8 border border-slate-100 relative z-10 shadow-inner">
                                                <div 
                                                    className="h-full bg-black rounded-full transition-all duration-1000 group-hover:bg-blue-600" 
                                                    style={{ width: `${r.progress || 0}%` }}
                                                />
                                            </div>

                                            <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-black uppercase tracking-widest relative z-10">
                                                <div className="text-slate-300">System Ready</div>
                                                <div className="text-slate-900 flex items-center gap-2 group-hover:text-blue-600 transition-all">
                                                    Open Dashboard <ChevronRight size={14} sm={16} />
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
                {mode === 'choice' && (
                    <motion.div 
                        key="choice"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 max-w-5xl mx-auto text-center"
                    >
                        <div className="h-16 w-16 sm:h-24 sm:w-24 bg-black text-white rounded-2xl sm:rounded-[32px] flex items-center justify-center mb-6 sm:mb-10 shadow-2xl shadow-black/10">
                            <Map size={32} sm={44} />
                        </div>
                        <h2 className="text-4xl sm:text-6xl font-[1000] text-slate-900 mb-6 tracking-tighter">Preparation Lab.</h2>
                        <p className="text-slate-500 font-bold text-sm sm:text-xl mb-10 sm:mb-16 max-w-2xl leading-relaxed opacity-70">
                            Decide your trajectory. Whether it's a deep-dive roadmap or a high-stakes 
                            timed assessment, our AI architects the optimal path for you.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 w-full">
                            <button 
                                onClick={() => setMode('interview')}
                                className="group relative bg-white border border-slate-100 p-8 sm:p-12 rounded-[40px] sm:rounded-[64px] text-left hover:border-blue-600 hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.05)] transition-all duration-700 active:scale-95"
                            >
                                <div className="h-16 w-16 sm:h-20 sm:w-20 bg-slate-50 text-slate-900 rounded-2xl sm:rounded-3xl flex items-center justify-center mb-6 sm:mb-10 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-inner">
                                    <Target size={28} sm={36} />
                                </div>
                                <h3 className="text-2xl sm:text-3xl font-[1000] text-slate-900 mb-3 tracking-tight">Assessments.</h3>
                                <p className="text-xs sm:text-base text-slate-400 font-bold leading-relaxed mb-8 sm:mb-10 uppercase tracking-widest text-[10px] sm:text-xs">
                                    Timed mock examination targeting role-specific technical skills.
                                </p>
                                <div className="flex items-center gap-2 sm:gap-3 text-slate-900 font-black text-[10px] sm:text-xs uppercase tracking-widest group-hover:text-blue-600 transition-colors">
                                    Begin Simulation <ChevronRight size={16} sm={18} />
                                </div>
                            </button>

                            <button 
                                onClick={() => setMode('roadmap')}
                                className="group relative bg-white border border-slate-100 p-8 sm:p-12 rounded-[40px] sm:rounded-[64px] text-left hover:border-black hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.05)] transition-all duration-700 active:scale-95"
                            >
                                <div className="h-16 w-16 sm:h-20 sm:w-20 bg-slate-50 text-slate-900 rounded-2xl sm:rounded-3xl flex items-center justify-center mb-6 sm:mb-10 group-hover:bg-black group-hover:text-white transition-all duration-500 shadow-inner">
                                    <BookOpen size={28} sm={36} />
                                </div>
                                <h3 className="text-2xl sm:text-3xl font-[1000] text-slate-900 mb-3 tracking-tight">Roadmaps.</h3>
                                <p className="text-xs sm:text-base text-slate-400 font-bold leading-relaxed mb-8 sm:mb-10 uppercase tracking-widest text-[10px] sm:text-xs">
                                    Curated learning paths with Daily Focus sessions for total mastery.
                                </p>
                                <div className="flex items-center gap-2 sm:gap-3 text-slate-900 font-black text-[10px] sm:text-xs uppercase tracking-widest group-hover:text-blue-600 transition-colors">
                                    Build Curriculum <ChevronRight size={16} sm={18} />
                                </div>
                            </button>
                        </div>

                        {roadmaps.length > 0 && (
                            <button 
                                onClick={() => setMode('hub')}
                                className="mt-10 sm:mt-16 flex items-center gap-3 px-8 sm:px-10 py-4 sm:py-5 bg-black text-white rounded-2xl font-black text-[9px] sm:text-[10px] uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-2xl shadow-black/10 active:scale-95"
                            >
                                <ListChecks size={16} sm={18} /> Active Hub ({roadmaps.length})
                            </button>
                        )}
                    </motion.div>
                )}

                {/* Transitions to other complex screens */}
                {mode === 'interview' && (
                    <AssessmentLab onBack={() => setMode('choice')} />
                )}

                {mode === 'roadmap' && (
                    <RoadmapBuilder onBack={() => setMode('choice')} onComplete={(data) => { setRoadmaps(prev => [data, ...prev]); setRoadmap(data); setMode('dashboard'); }} />
                )}

                {mode === 'dashboard' && (
                    <RoadmapDashboard roadmap={roadmap} onBack={() => setMode('hub')} />
                )}
            </AnimatePresence>
        </div>
    )
}

function RoadmapBuilder({ onBack, onComplete }) {
    const [role, setRole] = useState('')
    const [planType, setPlanType] = useState('Monthly')
    const [loading, setLoading] = useState(false)

    const generate = async () => {
        if (!role) return;
        setLoading(true)
        try {
            const resp = await axios.post(`${ServerUrl}/api/career/roadmap`, { role, planType }, { withCredentials: true })
            onComplete(resp.data.roadmap)
        } catch (err) {
            console.error(err)
            alert("Generation failed.")
        } finally {
            setLoading(false)
        }
    }

    if (loading) return (
        <div className="flex-1 flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white">
            <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                className="h-20 w-20 sm:h-24 sm:w-24 border-[8px] border-slate-100 border-t-blue-600 rounded-[32px] mb-8 sm:mb-10"
            />
            <h2 className="text-3xl sm:text-4xl font-[1000] text-slate-900 tracking-tighter mb-4">Architecting Path.</h2>
            <p className="text-slate-400 font-black uppercase tracking-widest text-[9px] sm:text-[10px]">Assembling {planType.toLowerCase()} intelligence profile...</p>
        </div>
    )

    return (
        <div className="p-6 sm:p-12 md:p-16 max-w-3xl mx-auto bg-white min-h-full">
            <button onClick={onBack} className="flex items-center gap-3 text-slate-400 hover:text-black mb-10 sm:mb-16 font-black text-[10px] uppercase tracking-widest transition-colors">
                <ArrowLeft size={18} /> Cancel Build
            </button>
            <div className="h-16 w-16 sm:h-20 sm:w-20 bg-blue-600 text-white rounded-2xl sm:rounded-[32px] flex items-center justify-center mb-8 shadow-2xl shadow-blue-100">
                <Sparkles size={28} sm={36} />
            </div>
            <h2 className="text-4xl sm:text-5xl font-[1000] text-slate-900 tracking-tighter mb-6">Build Your Strategy.</h2>
            <p className="text-base sm:text-lg text-slate-500 font-bold leading-relaxed mb-10 sm:mb-16 opacity-70">
                Tell us your target role or stack. We will generate a high-fidelity syllabus 
                and dynamic daily schedule tailored to your mastery goals.
            </p>

            <div className="space-y-10 sm:space-y-12 mb-12 sm:mb-20">
                <div className="group">
                    <label className="block text-[9px] sm:text-[10px] font-black uppercase tracking-[0.25em] text-slate-300 mb-4 group-focus-within:text-blue-600 transition-colors">Focus Area / Technology</label>
                    <input 
                        type="text" 
                        placeholder="e.g. AI Systems, Rust Engineer"
                        className="w-full px-6 sm:px-8 py-5 sm:py-6 bg-slate-50 border-2 border-transparent rounded-[24px] sm:rounded-[32px] focus:bg-white focus:border-blue-600 outline-none font-black text-lg sm:text-xl transition-all shadow-inner"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-[9px] sm:text-[10px] font-black uppercase tracking-[0.25em] text-slate-300 mb-4">Plan Intensity</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        {['Weekly', 'Monthly'].map(type => (
                            <button
                                key={type}
                                onClick={() => setPlanType(type)}
                                className={`px-6 sm:px-8 py-5 sm:py-6 rounded-[24px] sm:rounded-[32px] font-black text-[10px] sm:text-xs uppercase tracking-widest border-2 transition-all ${
                                    planType === type 
                                    ? 'bg-black border-black text-white shadow-2xl' 
                                    : 'bg-white border-slate-100 text-slate-400 hover:border-black hover:text-black'
                                }`}
                            >
                                {type} Cadence
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <button 
                onClick={generate}
                className="w-full py-6 sm:py-7 bg-blue-600 text-white rounded-[24px] sm:rounded-[32px] font-black text-xs sm:text-sm uppercase tracking-[0.3em] shadow-2xl shadow-blue-100 hover:bg-black hover:shadow-black/20 active:scale-95 transition-all"
            >
                Initialize Roadmap
            </button>
        </div>
    )
}

function RoadmapDashboard({ roadmap: initialRoadmap, onBack }) {
    const [roadmap, setRoadmap] = useState(initialRoadmap)
    const [activeTab, setActiveTab] = useState('syllabus')
    const [tasks, setTasks] = useState([])
    const [isTasksLoading, setIsTasksLoading] = useState(true)

    useEffect(() => {
        fetchRoadmapTasks()
    }, [roadmap._id])

    const fetchRoadmapTasks = async () => {
        setIsTasksLoading(true)
        try {
            const resp = await axios.get(`${ServerUrl}/api/career/roadmap-tasks/${roadmap._id}`, { withCredentials: true })
            setTasks(resp.data.tasks || [])
        } catch (err) {
            console.error(err)
        } finally {
            setIsTasksLoading(false)
        }
    }

    const updateStatus = async (taskId, newStatus) => {
        try {
            const resp = await axios.post(`${ServerUrl}/api/career/update-task-status`, { taskId, status: newStatus }, { withCredentials: true })
            setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status: newStatus } : t))
            setRoadmap(prev => ({ ...prev, progress: resp.data.progress }))
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-white overflow-hidden">
            {/* Header */}
            <div className="px-4 sm:px-12 py-4 sm:py-8 bg-white/80 backdrop-blur-xl border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 sticky top-0 z-20">
                <div className="flex items-center gap-4 sm:gap-8">
                    <button onClick={onBack} className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center hover:bg-black hover:text-white transition-all active:scale-95 shadow-inner"><ArrowLeft size={18} sm={20} /></button>
                    <div>
                        <h2 className="text-xl sm:text-3xl font-[1000] text-slate-900 tracking-tighter leading-none">{roadmap.stackName}</h2>
                        <div className="flex items-center gap-2 sm:gap-3 mt-2 sm:mt-3">
                            <span className="text-[8px] sm:text-[10px] font-black text-blue-600 uppercase tracking-widest">{roadmap.planType} Focus</span>
                            <span className="h-1 w-1 bg-slate-200 rounded-full"></span>
                            <span className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">AIGC Verified Path</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 sm:gap-8 w-full sm:w-auto justify-between sm:justify-end bg-slate-50 sm:bg-transparent p-4 sm:p-0 rounded-2xl">
                    <div className="flex flex-col items-end flex-1 sm:flex-initial">
                         <div className="text-[8px] sm:text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2 sm:mb-3">Deployment Progress</div>
                         <div className="h-2 sm:h-2.5 w-full sm:w-48 bg-white border border-slate-100 rounded-full overflow-hidden shadow-inner">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${roadmap.progress}%` }}
                                className="h-full bg-blue-600 rounded-full"
                            />
                         </div>
                    </div>
                    <div className="h-12 w-12 sm:h-14 sm:w-14 flex items-center justify-center bg-black text-white rounded-xl sm:rounded-2xl font-black text-sm sm:text-base shadow-xl">
                        {roadmap.progress}%
                    </div>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                <div className="flex-1 overflow-y-auto p-4 sm:p-12 no-scrollbar">
                    <div className="max-w-5xl mx-auto">
                        
                        <div className="flex gap-6 sm:gap-10 border-b border-slate-100 mb-8 sm:mb-16 overflow-x-auto no-scrollbar scrollbar-hide">
                             {[
                                { id: 'daily', name: 'Field Operations', icon: ListChecks },
                                { id: 'syllabus', name: 'Core Curriculum', icon: BookOpen }
                             ].map(tab => (
                                <button 
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 sm:gap-3 px-1 py-5 sm:py-6 font-black text-[10px] sm:text-xs uppercase tracking-[0.25em] transition-all border-b-4 whitespace-nowrap ${
                                        activeTab === tab.id ? 'border-blue-600 text-slate-900' : 'border-transparent text-slate-300 hover:text-slate-900'
                                    }`}
                                >
                                    <tab.icon size={16} sm={18} /> {tab.name}
                                </button>
                             ))}
                        </div>

                        {activeTab === 'daily' && (
                            <div className="grid gap-4 sm:gap-6 pb-20">
                                {isTasksLoading ? (
                                    <div className="py-20 text-center">
                                        <div className="h-10 w-10 border-[6px] border-slate-100 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
                                        <div className="text-slate-400 font-black uppercase tracking-widest text-[9px] sm:text-[10px]">Syncing Logistics...</div>
                                    </div>
                                ) : tasks.length === 0 ? (
                                    <div className="py-16 sm:py-24 text-center bg-slate-50/50 border border-slate-100 rounded-[40px] px-6">
                                        <AlertCircle className="mx-auto text-slate-200 mb-6" size={40} sm={56} />
                                        <h4 className="text-xl sm:text-2xl font-[1000] text-slate-900 mb-2 uppercase tracking-tighter">No Operations Found.</h4>
                                        <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px] sm:text-[10px]">Planner requires initialization.</p>
                                    </div>
                                ) : (
                                    tasks.map((task, i) => (
                                        <motion.div 
                                            key={task._id || i}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: (i % 15) * 0.05 }}
                                            className={`bg-white border p-6 sm:p-10 rounded-[32px] sm:rounded-[48px] flex flex-col sm:flex-row sm:items-center justify-between gap-6 group transition-all shadow-sm ${
                                                task.status === 'Completed' ? 'border-blue-100 bg-blue-50/20' : 'border-slate-50'
                                            }`}
                                        >
                                            <div className="flex items-center gap-6 sm:gap-10">
                                                <div className="flex flex-col items-center shrink-0">
                                                    <div className="text-[8px] sm:text-[9px] font-black text-slate-300 uppercase mb-3 tracking-widest">W{task.week} D{task.day}</div>
                                                    <button 
                                                        onClick={() => updateStatus(task._id, task.status === 'Completed' ? 'To Do' : 'Completed')}
                                                        className={`h-14 w-14 sm:h-16 sm:w-16 rounded-2xl sm:rounded-3xl border-2 flex items-center justify-center transition-all duration-500 shadow-lg ${
                                                            task.status === 'Completed' ? 'bg-blue-600 border-blue-600 text-white' : 
                                                            'bg-white border-slate-100 text-slate-200 hover:border-black hover:text-black'
                                                        }`}
                                                    >
                                                        {task.status === 'Completed' ? <CheckCircle2 size={24} sm={28} /> : <Play size={20} sm={24} className="ml-1 opacity-20 group-hover:opacity-100" />}
                                                    </button>
                                                </div>
                                                <div>
                                                    <h5 className={`text-xl sm:text-2xl font-[1000] text-slate-900 tracking-tight leading-tight ${task.status === 'Completed' ? 'opacity-30' : ''}`}>
                                                        {task.title}
                                                    </h5>
                                                    <p className="text-xs sm:text-sm text-slate-400 font-bold mt-2 max-w-xl leading-relaxed uppercase tracking-tighter opacity-70">
                                                        {task.description} • {task.duration}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 sm:gap-4 self-end sm:self-auto">
                                                {['To Do', 'Completed'].map(s => (
                                                    <button 
                                                        key={s}
                                                        onClick={() => updateStatus(task._id, s)}
                                                        className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                                                            task.status === s ? 'bg-black text-white shadow-xl' : 'text-slate-300 hover:text-slate-900 hover:bg-slate-50'
                                                        }`}
                                                    >
                                                        {s}
                                                    </button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        )}

                        {activeTab === 'syllabus' && (
                            <div className="space-y-6 sm:space-y-10 pb-20">
                                {roadmap.syllabus.map((phase, i) => (
                                    <div key={i} className="bg-white border border-slate-100 p-8 sm:p-12 rounded-[40px] sm:rounded-[56px] shadow-sm relative overflow-hidden group hover:border-blue-600 transition-all duration-700">
                                         <div className="absolute top-0 right-0 p-6 sm:p-12 text-6xl sm:text-[10rem] font-black text-slate-50/50 pointer-events-none group-hover:text-blue-50 group-hover:scale-110 transition-all duration-1000 uppercase">IQ</div>
                                         <h4 className="text-2xl sm:text-4xl font-[1000] text-slate-900 mb-4 flex items-center gap-4 tracking-tighter relative z-10 leading-none">
                                            <div className="h-3 w-3 sm:h-4 sm:w-4 bg-blue-600 rounded-full"></div> {phase.title}
                                         </h4>
                                         <p className="text-[9px] sm:text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mb-8 relative z-10">Strategic Learning Phase</p>
                                         <div className="flex flex-wrap gap-2 sm:gap-3 relative z-10">
                                            {phase.topics.map((topic, j) => (
                                                <span key={j} className="px-5 sm:px-8 py-2.5 sm:py-3.5 bg-slate-900 text-white rounded-xl sm:rounded-2xl text-[9px] sm:text-[11px] font-black uppercase tracking-widest shadow-lg shadow-black/5 hover:bg-blue-600 transition-colors">
                                                    {topic}
                                                </span>
                                            ))}
                                         </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="w-96 bg-slate-50 border-l border-slate-100 p-12 hidden xl:flex flex-col gap-16">
                    <div>
                        <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-10">Master Calendar</h4>
                        <div className="bg-white border border-slate-100 p-8 rounded-[40px] shadow-sm">
                            <div className="h-48 flex items-center justify-center border-2 border-dashed border-slate-100 rounded-[24px]">
                                <p className="text-[10px] font-black text-slate-200 uppercase tracking-widest">Calendar Native Module</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-100 rounded-[48px] p-10 text-slate-900 text-center relative overflow-hidden shadow-sm">
                        <div className="absolute top-0 right-0 p-4 opacity-5 text-blue-600"><TrendingUp size={120} /></div>
                        <h5 className="text-2xl font-[1000] mb-3 tracking-tighter relative z-10 uppercase">Sync Operations.</h5>
                        <p className="text-[10px] font-black text-slate-400 mb-8 relative z-10 leading-relaxed uppercase tracking-[0.25em]">
                            Update your central planner with the latest task vectors.
                        </p>
                        <button 
                            className="w-full bg-blue-600 text-white py-4 rounded-[20px] font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-blue-100 hover:bg-black transition-all active:scale-95"
                        >
                            Execute Sync
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RoadmapView
