import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { 
  Target, 
  PlayCircle, 
  BarChart3, 
  Map, 
  ChevronRight, 
  Bell,
  Search,
  Sparkles,
  RefreshCw,
  Bot
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  ResponsiveContainer 
} from 'recharts';
import axios from 'axios';
import { ServerUrl } from '../App';
import DashboardLayout from '../components/DashboardLayout';

function DashboardHome() {
  const { userData } = useSelector((state) => state.user);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await axios.get(`${ServerUrl}/api/interview/analytics`, { withCredentials: true });
        setAnalytics(res.data);
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const stats = [
    { name: 'ATS Score', value: analytics?.stats?.atsScore || '0%', change: '+2%', color: 'text-emerald-600', icon: Target },
    { name: 'Mocks Taken', value: analytics?.stats?.mocksTaken || '0', change: 'Keep it up!', color: 'text-blue-600', icon: PlayCircle },
    { name: 'Avg. Score', value: analytics?.stats?.avgScore || '0%', change: 'Good Progress', color: 'text-indigo-600', icon: BarChart3 },
    { name: 'Skills Count', value: analytics?.stats?.skillsCount || '0', change: 'Active', color: 'text-blue-500', icon: Map },
  ];

  const activities = analytics?.recentActivity || [];
  const profileGuidance = analytics?.profileGuidance;
  const skillData = analytics?.radarData || [
    { subject: 'Confidence', A: 0, fullMark: 100 },
    { subject: 'Communication', A: 0, fullMark: 100 },
    { subject: 'Technical', A: 0, fullMark: 100 },
    { subject: 'Assessment', A: 0, fullMark: 100 },
    { subject: 'Task Progress', A: 0, fullMark: 100 },
  ];
  const scoreTrend = analytics?.scoreTrend || [
    { date: 'Seq 1', score: 30 },
    { date: 'Seq 2', score: 45 },
    { date: 'Seq 3', score: 38 },
    { date: 'Seq 4', score: 62 },
    { date: 'Seq 5', score: 75 },
  ];

  return (
    <DashboardLayout>
      <div className="pb-8">
        {/* Mobile-Centric Welcome */}
        <div className="mb-8">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1">
              Operational Status
            </h1>
            <p className="text-slate-500 font-medium text-xs">
              Neural sequence scan complete for {userData?.displayName || 'User'}
            </p>
        </div>

        {/* AI Guidance Card - Mobile Optimized */}
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
            <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600" />
            <div className="p-6">
                <div className="flex items-center gap-2 text-blue-600 font-bold text-[9px] uppercase tracking-widest mb-3">
                    <Sparkles size={12} />
                    Neural Sequence Advisor
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 mb-3 tracking-tight">
                    {loading ? "Analyzing metrics..." : "Strategic Guidance"}
                </h2>
                <p className="text-slate-600 text-xs font-medium leading-relaxed mb-6">
                    {loading ? "System is synthesizing your professional sequence." : profileGuidance}
                </p>
                <button 
                    onClick={() => navigate('/career-suite?tab=prep')}
                    className="w-full flex items-center justify-center gap-2 py-3.5 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-slate-800 transition-all active:scale-[0.98]"
                >
                    View Roadmap <ChevronRight size={16} />
                </button>
            </div>
        </motion.div>



        {/* Stats Grid - 2 Columns for Mobile */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * idx }}
              className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm"
            >
              <div className="flex items-center justify-between mb-6">
                 <div className="p-2.5 rounded-lg bg-slate-50">
                    <stat.icon className={stat.color} size={18} />
                 </div>
                 <span className="text-[8px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md uppercase">{stat.change}</span>
              </div>
              <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest mb-1">{stat.name}</p>
              <p className="text-xl font-extrabold text-slate-900">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">System Log</h3>
            <button className="text-blue-600 text-[10px] font-bold uppercase tracking-widest">
              Full Archive
            </button>
          </div>
          
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {activities.length > 0 ? activities.slice(0, 3).map((activity, idx) => (
              <div key={activity.id} className={`flex items-center gap-4 p-4 active:bg-slate-50 transition-all ${idx !== activities.slice(0, 3).length - 1 ? 'border-b border-slate-50' : ''}`}>
                 <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center shrink-0">
                    <PlayCircle className="text-slate-400" size={18} />
                 </div>
                 <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 mb-0.5 truncate">{activity.title}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] text-blue-600 font-bold uppercase">Score: {activity.score}</span>
                      <span className="text-[9px] text-slate-400 font-medium">{activity.time}</span>
                    </div>
                 </div>
              </div>
            )) : (
              <div className="py-12 text-center">
                <p className="text-slate-300 font-bold text-[10px] uppercase tracking-widest">No activity log</p>
              </div>
            )}
          </div>
        </div>

        {/* Neural Matrix - Radar Chart (Primary Analytics) */}
        <div className="space-y-4">
           <h3 className="text-lg font-extrabold text-slate-900 px-1 tracking-tight">Neural Matrix</h3>
           <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 h-[320px] w-full relative">
              {!loading && (
                <div className="absolute inset-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={skillData}>
                      <PolarGrid stroke="#f1f5f9" />
                      <PolarAngleAxis 
                        dataKey="subject" 
                        tick={{ fill: '#94a3b8', fontSize: 8, fontWeight: 700 }} 
                      />
                      <Radar
                        name="User"
                        dataKey="A"
                        stroke="#0F172A"
                        fill="#0F172A"
                        fillOpacity={0.05}
                        strokeWidth={2}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              )}
              {loading && (
                <div className="w-full h-full flex items-center justify-center">
                    <RefreshCw size={20} className="text-slate-200 animate-spin" />
                </div>
              )}
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default DashboardHome;
