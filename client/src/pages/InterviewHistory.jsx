import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { ServerUrl } from '../App';
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
            <div className="max-w-5xl mx-auto pb-12">
                <div className="mb-10 px-2">
                    <h1 className="text-3xl font-[900] tracking-tighter text-slate-900 mb-2">
                        Interview History
                    </h1>
                    <p className="text-slate-500 font-bold text-sm tracking-tight">
                        Review your past performances and skill diagnostics.
                    </p>
                </div>

                {loading ? (
                    <div className="bg-white p-12 rounded-[40px] border border-slate-50 text-center">
                        <div className="animate-pulse flex flex-col items-center">
                            <div className="w-12 h-12 bg-slate-100 rounded-2xl mb-4" />
                            <div className="h-4 w-48 bg-slate-50 rounded-full" />
                        </div>
                    </div>
                ) : interviews.length === 0 ? (
                    <div className="bg-white p-12 rounded-[40px] border border-slate-50 text-center shadow-sm shadow-slate-100/50">
                        <PlayCircle className="mx-auto text-slate-200 mb-4" size={48} />
                        <p className="text-slate-400 font-bold text-sm tracking-tight mb-6">
                            No interviews found. Start your first session to see analytics.
                        </p>
                        <button 
                            onClick={() => navigate('/interview')}
                            className="px-8 py-3 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-500 transition-colors"
                        >
                            Start First Mock
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {interviews.map((item) => (
                            <div 
                                key={item._id}
                                onClick={() => navigate(`/report/${item._id}`)}
                                className="bg-white p-6 rounded-[32px] border border-slate-50 shadow-sm shadow-slate-100/50 hover:border-blue-100 transition-all cursor-pointer group flex items-center gap-6"
                            >
                                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                                    <Target className="text-slate-400 group-hover:text-blue-600 transition-colors" size={24} />
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-[900] tracking-tighter text-slate-900 mb-1 truncate">
                                        {item.role}
                                    </h3>
                                    <div className="flex items-center gap-3 text-slate-400">
                                        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest">
                                            <PlayCircle size={12} />
                                            {item.mode}
                                        </div>
                                        <div className="w-1 h-1 rounded-full bg-slate-200" />
                                        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest">
                                            <Calendar size={12} />
                                            {new Date(item.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-8 px-4">
                                    <div className="text-right">
                                        <p className="text-2xl font-[900] tracking-tighter text-blue-600">
                                            {Math.round(item.finalScore || 0)}%
                                        </p>
                                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Score</p>
                                    </div>
                                    
                                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                                        item.status === "completed"
                                            ? "bg-emerald-50 text-emerald-600"
                                            : "bg-amber-50 text-amber-600"
                                    }`}>
                                        {item.status}
                                    </span>
                                    
                                    <ChevronRight className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" size={20} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

export default InterviewHistory;
