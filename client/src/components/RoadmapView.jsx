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
        <div className="h-full bg-white flex flex-col overflow-hidden selection:bg-orange-500 selection:text-white">
            <AnimatePresence mode="wait">
                {mode === 'hub' && (
                    <motion.div 
                        key="hub"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -30 }}
                        className="flex-1 overflow-y-auto p-12"
                    >
                        <div className="max-w-6xl mx-auto">
                            <div className="flex items-center justify-between mb-16">
                                <div>
                                    <h2 className="text-4xl font-black text-black tracking-tighter">Your Education.</h2>
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mt-3">Manage Your Active Learning Trajectories</p>
                                </div>
                                <button 
                                    onClick={() => setMode('choice')}
                                    className="bg-black text-white px-10 py-5 rounded-[24px] font-black text-[10px] uppercase tracking-widest shadow-2xl hover:bg-orange-600 transition-all active:scale-95 flex items-center gap-3"
                                >
                                    <Plus size={18} /> New Preparation
                                </button>
                            </div>

                            {loading && roadmaps.length === 0 ? (
                                <div className="py-20 text-center">
                                    <div className="h-12 w-12 border-4 border-black border-t-orange-600 rounded-full animate-spin mx-auto mb-6"></div>
                                    <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Accessing Vault...</p>
                                </div>
                            ) : roadmaps.length === 0 ? (
                                <div className="py-32 bg-gray-50/50 border-2 border-black/5 rounded-[64px] text-center flex flex-col items-center">
                                    <div className="h-24 w-24 bg-white text-gray-200 rounded-[32px] flex items-center justify-center mb-8 shadow-xl">
                                        <Layers size={40} />
                                    </div>
                                    <h3 className="text-2xl font-black text-black mb-2">No active roadmaps.</h3>
                                    <p className="text-gray-400 font-bold mb-10">Start your first AI-guided journey today.</p>
                                    <button onClick={() => setMode('choice')} className="group text-orange-600 font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:gap-5 transition-all">
                                        Initialize Path <ArrowRight size={18} />
                                    </button>
                                </div>
                            ) : (
                                <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-10">
                                    {roadmaps.map((r, i) => (
                                        <motion.div 
                                            key={r._id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            className="group relative bg-white border-2 border-black/5 p-10 rounded-[56px] shadow-2xl shadow-black/5 hover:border-black transition-all cursor-pointer overflow-hidden"
                                            onClick={() => { setRoadmap(r); setMode('dashboard'); }}
                                        >
                                            <div className="absolute top-0 right-0 p-12 text-8xl font-black text-gray-50/50 pointer-events-none group-hover:text-orange-50 transition-all duration-700">0{i+1}</div>
                                            
                                            <div className="flex items-center justify-between mb-12 relative z-10">
                                                <div className="h-16 w-16 bg-black text-white rounded-2xl flex items-center justify-center group-hover:bg-orange-600 transition-all duration-500">
                                                    <BookOpen size={32} />
                                                </div>
                                                <div className="flex items-center gap-6">
                                                    <button 
                                                        onClick={(e) => handleDeleteRoadmap(e, r._id)}
                                                        className="p-4 text-gray-200 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all"
                                                    >
                                                        <Trash2 size={22} />
                                                    </button>
                                                    <div className="text-right">
                                                        <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest leading-none mb-1">Impact</div>
                                                        <div className="text-4xl font-black text-black leading-none">{r.progress || 0}%</div>
                                                    </div>
                                                </div>
                                            </div>

                                            <h3 className="text-3xl font-black text-black mb-3 relative z-10">{r.stackName}</h3>
                                            <div className="flex items-center gap-2 mb-10 relative z-10">
                                                <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">{r.planType} Strategy</span>
                                                <span className="h-1 w-1 bg-gray-200 rounded-full"></span>
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">AIGC Powered</span>
                                            </div>

                                            <div className="h-3 w-full bg-gray-50 rounded-full overflow-hidden mb-8 border border-gray-100 relative z-10">
                                                <div 
                                                    className="h-full bg-black rounded-full transition-all duration-1000 group-hover:bg-orange-600" 
                                                    style={{ width: `${r.progress || 0}%` }}
                                                />
                                            </div>

                                            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest relative z-10">
                                                <div className="text-gray-400">System Ready</div>
                                                <div className="text-black flex items-center gap-2 group-hover:text-orange-600 transition-all">
                                                    Open Dashboard <ChevronRight size={16} />
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
                        className="flex-1 flex flex-col items-center justify-center p-12 max-w-5xl mx-auto text-center"
                    >
                        <div className="h-24 w-24 bg-black text-white rounded-[32px] flex items-center justify-center mb-10 shadow-2xl">
                            <Map size={44} />
                        </div>
                        <h2 className="text-6xl font-black text-black mb-6 tracking-tighter">Preparation Lab.</h2>
                        <p className="text-gray-400 font-bold text-lg mb-16 max-w-2xl leading-relaxed">
                            Decide your trajectory. Whether it's a deep-dive roadmap or a high-stakes 
                            timed assessment, our AI architects the optimal path for you.
                        </p>

                        <div className="grid md:grid-cols-2 gap-10 w-full">
                            <button 
                                onClick={() => setMode('interview')}
                                className="group relative bg-white border-2 border-black/5 p-12 rounded-[56px] text-left hover:border-black hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] transition-all duration-700 active:scale-95"
                            >
                                <div className="h-20 w-20 bg-gray-50 text-black rounded-3xl flex items-center justify-center mb-10 group-hover:bg-orange-600 group-hover:text-white transition-all duration-500 shadow-inner">
                                    <Target size={36} />
                                </div>
                                <h3 className="text-3xl font-black text-black mb-4 tracking-tight">Assessments.</h3>
                                <p className="text-gray-400 font-bold leading-relaxed mb-10">
                                    A timed mock examination targeting role-specific technical skills and situational aptitude.
                                </p>
                                <div className="flex items-center gap-3 text-black font-black text-xs uppercase tracking-widest group-hover:text-orange-600 transition-colors">
                                    Begin Simulation <ChevronRight size={18} />
                                </div>
                            </button>

                            <button 
                                onClick={() => setMode('roadmap')}
                                className="group relative bg-white border-2 border-black/5 p-12 rounded-[56px] text-left hover:border-black hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] transition-all duration-700 active:scale-95"
                            >
                                <div className="h-20 w-20 bg-gray-50 text-black rounded-3xl flex items-center justify-center mb-10 group-hover:bg-black group-hover:text-white transition-all duration-500 shadow-inner">
                                    <BookOpen size={36} />
                                </div>
                                <h3 className="text-3xl font-black text-black mb-4 tracking-tight">Roadmaps.</h3>
                                <p className="text-gray-400 font-bold leading-relaxed mb-10">
                                    Curated learning paths with Daily Focus sessions and Milestone Tracking for total stack mastery.
                                </p>
                                <div className="flex items-center gap-3 text-black font-black text-xs uppercase tracking-widest group-hover:text-orange-600 transition-colors">
                                    Build Curriculum <ChevronRight size={18} />
                                </div>
                            </button>
                        </div>

                        {roadmaps.length > 0 && (
                            <button 
                                onClick={() => setMode('hub')}
                                className="mt-16 flex items-center gap-3 px-8 py-4 bg-gray-50 text-black rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black hover:text-white transition-all border border-black/5"
                            >
                                <ListChecks size={18} /> Return to Active Hub ({roadmaps.length})
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
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-white">
            <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                className="h-24 w-24 border-8 border-black border-t-orange-600 rounded-[32px] mb-10"
            />
            <h2 className="text-4xl font-black text-black tracking-tighter mb-4">Architecting Path.</h2>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Assembling {planType.toLowerCase()} intelligence profile...</p>
        </div>
    )

    return (
        <div className="p-16 max-w-3xl mx-auto bg-white min-h-full">
            <button onClick={onBack} className="flex items-center gap-3 text-gray-400 hover:text-black mb-16 font-black text-[10px] uppercase tracking-widest transition-colors">
                <ArrowLeft size={18} /> Cancel Build
            </button>
            <div className="h-20 w-20 bg-orange-600 text-white rounded-[32px] flex items-center justify-center mb-8 shadow-2xl shadow-orange-200">
                <Sparkles size={36} />
            </div>
            <h2 className="text-5xl font-black text-black tracking-tighter mb-6">Build Your Strategy.</h2>
            <p className="text-xl text-gray-400 font-medium leading-relaxed mb-16">
                Tell us your target role or stack. We will generate a high-fidelity syllabus 
                and dynamic daily schedule tailored to your mastery goals.
            </p>

            <div className="space-y-12 mb-20">
                <div className="group">
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4 group-focus-within:text-orange-600 transition-colors">Focus Area / Technology</label>
                    <input 
                        type="text" 
                        placeholder="e.g. AI Product Manager, Rust Systems Engineer"
                        className="w-full px-8 py-6 bg-gray-50 border-2 border-transparent rounded-[32px] focus:bg-white focus:border-black outline-none font-black text-xl transition-all"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Plan Intensity</label>
                    <div className="grid grid-cols-2 gap-6">
                        {['Weekly', 'Monthly'].map(type => (
                            <button
                                key={type}
                                onClick={() => setPlanType(type)}
                                className={`px-8 py-6 rounded-[32px] font-black text-xs uppercase tracking-widest border-2 transition-all ${
                                    planType === type 
                                    ? 'bg-black border-black text-white shadow-2xl' 
                                    : 'bg-white border-black/5 text-gray-400 hover:border-black hover:text-black'
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
                className="w-full py-7 bg-orange-600 text-white rounded-[32px] font-black text-sm uppercase tracking-[0.3em] shadow-2xl shadow-orange-200 hover:bg-black hover:shadow-black/20 active:scale-95 transition-all"
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
            <div className="px-12 py-8 bg-white border-b-2 border-black/5 flex items-center justify-between sticky top-0 z-20">
                <div className="flex items-center gap-8">
                    <button onClick={onBack} className="h-14 w-14 rounded-full border-2 border-black/5 flex items-center justify-center hover:bg-black hover:text-white transition-all"><ArrowLeft size={20} /></button>
                    <div>
                        <h2 className="text-3xl font-black text-black tracking-tighter leading-none">{roadmap.stackName} Dashboard.</h2>
                        <div className="flex items-center gap-3 mt-3">
                            <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">{roadmap.planType} Focus</span>
                            <span className="h-1 w-1 bg-gray-300 rounded-full"></span>
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">AIGC Verified Path</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    <div className="flex flex-col items-end">
                         <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-3">Deployment Progress</div>
                         <div className="h-3 w-64 bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${roadmap.progress}%` }}
                                className="h-full bg-black rounded-full"
                            />
                         </div>
                    </div>
                    <div className="h-16 w-16 flex items-center justify-center bg-orange-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-orange-100">
                        {roadmap.progress}%
                    </div>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                <div className="flex-1 overflow-y-auto p-12">
                    <div className="max-w-5xl mx-auto">
                        
                        <div className="flex gap-10 border-b-2 border-black/5 mb-16">
                             {[
                                { id: 'daily', name: 'Field Operations', icon: ListChecks },
                                { id: 'syllabus', name: 'Core Curriculum', icon: BookOpen }
                             ].map(tab => (
                                <button 
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-3 px-2 py-6 font-black text-xs uppercase tracking-[0.2em] transition-all border-b-4 ${
                                        activeTab === tab.id ? 'border-orange-600 text-black' : 'border-transparent text-gray-300 hover:text-black'
                                    }`}
                                >
                                    <tab.icon size={18} /> {tab.name}
                                </button>
                             ))}
                        </div>

                        {activeTab === 'daily' && (
                            <div className="grid gap-6 pb-20">
                                {isTasksLoading ? (
                                    <div className="py-20 text-center">
                                        <div className="h-10 w-10 border-4 border-black border-t-orange-600 rounded-full animate-spin mx-auto mb-4" />
                                        <div className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Syncing Logistics...</div>
                                    </div>
                                ) : tasks.length === 0 ? (
                                    <div className="py-24 text-center bg-gray-50/50 border-2 border-dashed border-black/10 rounded-[56px]">
                                        <AlertCircle className="mx-auto text-gray-200 mb-6" size={56} />
                                        <h4 className="text-2xl font-black text-black mb-2">No Operations Found.</h4>
                                        <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Planner requires initialization for tracking.</p>
                                    </div>
                                ) : (
                                    tasks.map((task, i) => (
                                        <motion.div 
                                            key={task._id || i}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: (i % 15) * 0.05 }}
                                            className={`bg-white border-2 p-10 rounded-[48px] flex items-center justify-between group transition-all group ${
                                                task.status === 'Completed' ? 'border-orange-600/10 bg-orange-50/5' : 'border-black/5'
                                            }`}
                                        >
                                            <div className="flex items-center gap-10">
                                                <div className="flex flex-col items-center">
                                                    <div className="text-[10px] font-black text-gray-300 uppercase mb-3 tracking-tighter">W{task.week} D{task.day}</div>
                                                    <button 
                                                        onClick={() => updateStatus(task._id, task.status === 'Completed' ? 'To Do' : 'Completed')}
                                                        className={`h-16 w-16 rounded-[24px] border-2 flex items-center justify-center transition-all duration-500 shadow-xl ${
                                                            task.status === 'Completed' ? 'bg-black border-black text-white' : 
                                                            'bg-white border-black/5 text-gray-200 hover:border-black hover:text-black'
                                                        }`}
                                                    >
                                                        {task.status === 'Completed' ? <CheckCircle2 size={32} /> : <Play size={24} className="ml-1 opacity-20 group-hover:opacity-100" />}
                                                    </button>
                                                </div>
                                                <div>
                                                    <h5 className={`text-2xl font-black text-black tracking-tight ${task.status === 'Completed' ? 'opacity-30' : ''}`}>
                                                        {task.title}
                                                    </h5>
                                                    <p className="text-sm text-gray-400 font-bold mt-2 max-w-xl leading-relaxed uppercase tracking-tighter">
                                                        {task.description} • {task.duration}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                {['To Do', 'Completed'].map(s => (
                                                    <button 
                                                        key={s}
                                                        onClick={() => updateStatus(task._id, s)}
                                                        className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                                                            task.status === s ? 'bg-black text-white shadow-xl' : 'text-gray-300 hover:text-black'
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
                            <div className="space-y-10 pb-20">
                                {roadmap.syllabus.map((phase, i) => (
                                    <div key={i} className="bg-white border-2 border-black/5 p-12 rounded-[56px] shadow-2xl shadow-black/5 relative overflow-hidden group hover:border-black transition-all duration-700">
                                         <div className="absolute top-0 right-0 p-12 text-[12rem] font-black text-gray-50/50 pointer-events-none group-hover:text-orange-50 group-hover:scale-110 transition-all duration-1000">{i + 1}</div>
                                         <h4 className="text-4xl font-black text-black mb-4 flex items-center gap-4 tracking-tighter relative z-10">
                                            <div className="h-4 w-4 bg-orange-600 rounded-full"></div> {phase.title}.
                                         </h4>
                                         <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.3em] mb-10 relative z-10">Strategic Learning Phase</p>
                                         <div className="flex flex-wrap gap-3 relative z-10">
                                            {phase.topics.map((topic, j) => (
                                                <span key={j} className="px-8 py-3 bg-black text-white rounded-[20px] text-[11px] font-black uppercase tracking-widest">
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

                <div className="w-96 bg-gray-50/50 border-l-2 border-black/5 p-12 hidden lg:flex flex-col gap-16">
                    <div>
                        <h4 className="text-[10px] font-black text-black mb-10 uppercase tracking-[0.3em]">Master Calendar</h4>
                        <div className="bg-white border-2 border-black/5 p-8 rounded-[40px] shadow-2xl shadow-black/5">
                            <div className="h-48 flex items-center justify-center border-2 border-dashed border-black/10 rounded-[24px]">
                                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Calendar Native Module</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border-4 border-black rounded-[48px] p-10 text-black text-center relative overflow-hidden shadow-2xl">
                        <div className="absolute top-0 right-0 p-4 opacity-5"><TrendingUp size={120} /></div>
                        <h5 className="text-2xl font-black mb-3 tracking-tighter relative z-10 uppercase">Sync Operations.</h5>
                        <p className="text-[10px] font-black text-gray-500 mb-8 relative z-10 leading-relaxed uppercase tracking-[0.2em]">
                            Update your central planner with the latest task vectors for this trajectory.
                        </p>
                        <button 
                            className="w-full bg-orange-600 text-white py-4 rounded-[20px] font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-orange-100 hover:bg-black transition-all active:scale-95"
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
