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
  Sparkles
} from 'lucide-react';
import { 
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
    { name: 'Skills Improved', value: analytics?.stats?.skillsImproved || '0', change: 'This Month', color: 'text-blue-500', icon: Map },
  ];

  const skillData = analytics?.radarData || [
    { subject: 'Confidence', A: 0, fullMark: 100 },
    { subject: 'Communication', A: 0, fullMark: 100 },
    { subject: 'Technical', A: 0, fullMark: 100 },
  ];

  const activities = analytics?.recentActivity || [];

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
          <div>
            <h1 className="text-4xl font-[900] tracking-tighter text-slate-900 mb-2">
              Welcome back, {userData?.displayName?.split(' ')[0] || 'User'}! 👋
            </h1>
            <p className="text-slate-500 font-bold text-sm tracking-tight capitalize">
              Let's continue your professional preparation journey.
            </p>
          </div>
          <div className="flex items-center gap-4">
             <div className="relative group flex-1 md:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="Search resources..."
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all"
                />
             </div>
             <button className="p-3.5 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-blue-600 hover:border-blue-100 transition-all relative">
                <Bell size={20} />
                <div className="absolute right-3 top-3 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
             </button>
             <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-blue-200">
                {userData?.displayName?.charAt(0) || 'U'}
             </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-6 rounded-[32px] border border-slate-50 shadow-sm shadow-slate-100/50 flex flex-col justify-between group hover:border-blue-100 transition-all"
            >
              <div className="flex items-center justify-between mb-6">
                 <div className={`p-3 rounded-2xl bg-slate-50 group-hover:bg-blue-50 transition-colors`}>
                    <stat.icon className={stat.color} size={24} />
                 </div>
                 <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-widest">{stat.change}</span>
              </div>
              <div>
                <p className="text-slate-400 text-xs font-black uppercase tracking-widest mb-1.5">{stat.name}</p>
                <p className="text-3xl font-[900] tracking-tighter text-slate-900">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Sections */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xl font-[900] tracking-tighter text-slate-900">Recent Activity</h3>
              <button className="text-blue-600 text-xs font-black uppercase tracking-widest flex items-center gap-1.5 hover:gap-3 transition-all">
                View All <ChevronRight size={14} />
              </button>
            </div>
            
            <div className="bg-white rounded-[40px] border border-slate-50 shadow-sm shadow-slate-100/50 p-4 space-y-2">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-4 p-4 rounded-[28px] hover:bg-slate-50 transition-all group">
                   <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-white transition-colors">
                      <PlayCircle className="text-slate-400" size={20} />
                   </div>
                   <div className="flex-1">
                      <p className="text-sm font-black text-slate-900 tracking-tight mb-0.5">{activity.title}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Score: <span className="text-blue-600">{activity.score}</span> • {activity.time}</p>
                   </div>
                   <button className="px-6 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all">
                      View
                   </button>
                </div>
              ))}
            </div>
          </div>

          {/* Radar Chart */}
          <div className="space-y-6">
             <h3 className="text-xl font-[900] tracking-tighter text-slate-900 px-2 flex items-center gap-2">
                <Sparkles className="text-blue-600" size={18} />
                Skill Strength
             </h3>
             <div className="bg-white rounded-[40px] border border-slate-50 shadow-sm shadow-slate-100/50 p-8 h-[400px] w-full relative">
                {!loading && (
                  <div className="absolute inset-8">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillData}>
                        <PolarGrid stroke="#f1f5f9" />
                        <PolarAngleAxis 
                          dataKey="subject" 
                          tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} 
                        />
                        <Radar
                          name="User"
                          dataKey="A"
                          stroke="#2563eb"
                          fill="#2563eb"
                          fillOpacity={0.1}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                )}
                {loading && (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="animate-pulse w-32 h-32 bg-slate-50 rounded-full" />
                  </div>
                )}
             </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default DashboardHome;
