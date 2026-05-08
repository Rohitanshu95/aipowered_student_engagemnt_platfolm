import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { ServerUrl } from '../App';
import { motion } from 'framer-motion';
import { PlayCircle, Calendar, Target, ChevronRight } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';

function InterviewHistory() {
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const getMyInterviews = async () => {
            try {
                const result = await axios.get(ServerUrl + "/api/interview/get-interview", { withCredentials: true });
                setInterviews(result.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        getMyInterviews();
    }, []);

    return (
        <DashboardLayout>
            <div className="pb-12 px-1">
                <header className="mb-10 text-center sm:text-left">
                    <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="inline-flex items-center gap-2 text-blue-600 font-bold text-[9px] uppercase tracking-widest mb-2"
                    >
                        <Target size={12} />
                        Sequence Archive
                    </motion.div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">
                        Interview History
                    </h1>
                    <p className="text-slate-500 font-medium text-xs">
                        Review your historical performance diagnostics.
                    </p>
                </header>

                {loading ? (
                    <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center shadow-sm">
                        <div className="animate-pulse flex flex-col items-center">
                            <div className="w-12 h-12 bg-slate-50 rounded-2xl mb-4" />
                            <div className="h-2 w-32 bg-slate-50 rounded-full" />
                        </div>
                    </div>
                ) : interviews.length === 0 ? (
                    <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center shadow-sm">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <PlayCircle className="text-slate-200" size={32} />
                        </div>
                        <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mb-8">
                            No historical data found.
                        </p>
                        <button 
                            onClick={() => navigate('/interview')}
                            className="w-full sm:w-auto px-10 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10"
                        >
                            Initialize Sequence
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {interviews.map((item) => (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={item._id}
                                onClick={() => navigate(`/report/${item._id}`)}
                                className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-100 shadow-sm hover:border-blue-600/30 transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-6"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 transition-all shadow-inner border border-slate-100/50">
                                        <Target className="text-slate-400 group-hover:text-white transition-colors" size={20} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-base font-extrabold text-slate-900 mb-1 truncate tracking-tight">
                                            {item.role}
                                        </h3>
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <span className="text-[9px] font-bold uppercase tracking-widest text-blue-600">{item.mode}</span>
                                            <span className="w-1 h-1 rounded-full bg-slate-200" />
                                            <span className="text-[9px] font-bold uppercase tracking-widest">{new Date(item.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between sm:justify-end sm:flex-1 gap-6 pt-4 sm:pt-0 border-t sm:border-t-0 border-slate-50">
                                    <div className="text-left sm:text-right">
                                        <p className="text-2xl font-black text-slate-900 tracking-tighter">
                                            {Math.round(item.finalScore || 0)}<span className="text-xs text-slate-400 ml-0.5">/10</span>
                                        </p>
                                        <p className="text-[8px] text-slate-400 font-bold uppercase tracking-[0.2em]">Sequence Score</p>
                                    </div>
                                    
                                    <div className="flex items-center gap-4">
                                        <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                                            item.status === "completed"
                                                ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                                : "bg-amber-50 text-amber-600 border-amber-100"
                                        }`}>
                                            {item.status}
                                        </span>
                                        <ChevronRight className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all hidden sm:block" size={18} />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

export default InterviewHistory;
