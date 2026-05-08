import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Sparkles, 
  ArrowRight, 
  Target, 
  FileText, 
  Briefcase, 
  Map, 
  Mic2, 
  Video,
  CheckCircle2
} from 'lucide-react';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Assets
import heroMain from '../assets/hero-main.png';
import previewResume from '../assets/preview-resume.png';
import previewAts from '../assets/preview-ats.png';
import previewInterview from '../assets/preview-interview.png';
import previewRoadmap from '../assets/preview-roadmap.png';

function Home() {
  const { userData } = useSelector((state) => state.user);
  const navigate = useNavigate();

  const handleStart = (tab) => {
    if (userData) {
      navigate(`/dashboard?tab=${tab}`);
    } else {
      navigate('/auth');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* --- HERO SECTION --- */}
      <section className="pt-32 sm:pt-44 pb-12 sm:pb-20 px-6 md:px-12 lg:px-20">
        <div className="max-w-[1920px] mx-auto grid lg:grid-cols-2 gap-12 sm:gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2.5 text-blue-600 font-black text-[10px] sm:text-xs uppercase tracking-[0.2em] mb-6 sm:mb-8 bg-blue-50/50 px-4 py-2 rounded-full">
              <Sparkles size={14} sm={16} />
              The Future of Learning
            </div>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-[1000] tracking-tighter text-slate-900 leading-[0.95] mb-8 sm:mb-10">
              Your Complete <br />
              <span className="text-blue-600">Career Launchpad.</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-500 font-bold leading-relaxed max-w-lg mb-10 sm:mb-12 mx-auto lg:mx-0 opacity-70">
              From building your resume to acing the interview, we guide you every step of the way with professional-grade AI intelligence.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <button 
                onClick={() => handleStart('prep')}
                className="w-full sm:w-auto px-10 py-5 bg-black text-white rounded-[20px] font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-2xl shadow-black/10 active:scale-95 flex items-center justify-center gap-3"
              >
                Get Started for Free <ArrowRight size={18} />
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="flex justify-center relative"
          >
            <div className="absolute inset-0 bg-blue-600/5 blur-[120px] rounded-full" />
            <img 
              src={heroMain} 
              alt="Career Collaboration" 
              className="w-full max-w-xl h-auto drop-shadow-[0_40px_80px_rgba(0,0,0,0.1)] relative z-10"
            />
          </motion.div>
        </div>
      </section>

      {/* --- FEATURE MATRIX GRID --- */}
      <section className="px-6 md:px-12 lg:px-20 xl:px-20 py-12 sm:py-20">
        <div className="max-w-[1920px] mx-auto grid md:grid-cols-2 gap-6 sm:gap-12">
          
          {/* Card 1: Resume Builder */}
          <motion.div 
            whileHover={{ y: -8 }}
            className="p-8 sm:p-12 rounded-[40px] bg-[#f8faff] border border-blue-50 relative overflow-hidden group cursor-pointer"
            onClick={() => handleStart('resume')}
          >
            <div className="max-w-full sm:max-w-[55%] relative z-10">
              <div className="h-14 w-14 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-sm">
                <FileText className="text-blue-600" size={28} />
              </div>
              <h3 className="text-2xl sm:text-3xl font-[1000] text-slate-900 mb-4 tracking-tight">AI Resume Builder</h3>
              <p className="text-sm sm:text-base text-slate-500 font-bold leading-relaxed mb-10 opacity-70">
                Craft a professional resume in minutes with our intuitive, AI-guided builder.
              </p>
              <div className="flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-widest">
                Craft Your Future <ArrowRight size={14} />
              </div>
            </div>
            <img 
              src={previewResume} 
              alt="Resume Preview" 
              className="hidden sm:block absolute -right-4 top-1/2 -translate-y-1/2 w-64 drop-shadow-2xl group-hover:scale-105 transition-all duration-700"
            />
          </motion.div>

          {/* Card 2: ATS Checker */}
          <motion.div 
            whileHover={{ y: -8 }}
            className="p-8 sm:p-12 rounded-[40px] bg-[#f5fff9] border border-emerald-50 relative overflow-hidden group cursor-pointer"
            onClick={() => handleStart('ats')}
          >
            <div className="max-w-full sm:max-w-[55%] relative z-10">
              <div className="h-14 w-14 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-sm">
                <Target className="text-emerald-600" size={28} />
              </div>
              <h3 className="text-2xl sm:text-3xl font-[1000] text-slate-900 mb-4 tracking-tight">ATS Score Checker</h3>
              <p className="text-sm sm:text-base text-slate-500 font-bold leading-relaxed mb-10 opacity-70">
                Optimize your resume to pass Applicant Tracking Systems with ease and precision.
              </p>
              <div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-widest">
                Analyze My Resume <ArrowRight size={14} />
              </div>
            </div>
            <img 
              src={previewAts} 
              alt="ATS Preview" 
              className="hidden sm:block absolute -right-8 top-1/2 -translate-y-1/2 w-64 drop-shadow-2xl group-hover:scale-105 transition-all duration-700"
            />
          </motion.div>

          {/* Card 3: Job Search */}
          <motion.div 
            whileHover={{ y: -8 }}
            className="card-soft bg-card-cyan relative overflow-hidden group cursor-pointer"
            onClick={() => handleStart('jobs')}
          >
            <div className="max-w-full sm:max-w-[55%] relative z-10">
              <div className="h-14 w-14 bg-white rounded-xl flex items-center justify-center mb-6 shadow-sm">
                <Briefcase className="text-cyan-600" size={28} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Job & Internship Search</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8">
                Discover current internship and job openings across the internet, tailored for you.
              </p>
              <div className="flex items-center gap-2 text-cyan-600 font-bold text-xs uppercase tracking-tight">
                Explore Openings <ArrowRight size={14} />
              </div>
            </div>
            <div className="hidden sm:flex absolute -right-12 top-1/2 -translate-y-1/2 w-80 flex flex-col gap-3 group-hover:translate-x-2 transition-transform duration-700 opacity-60 group-hover:opacity-100">
               {[1, 2, 3].map(i => (
                 <div key={i} className="bg-white p-4 rounded-xl shadow-lg border border-slate-50 flex items-center gap-4 translate-x-8 hover:translate-x-0 transition-transform">
                    <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center">
                       <Briefcase className="text-slate-200" size={18} />
                    </div>
                    <div>
                      <div className="h-2.5 w-24 bg-slate-100 rounded-full mb-1.5" />
                      <div className="h-1.5 w-16 bg-slate-50 rounded-full" />
                    </div>
                 </div>
               ))}
            </div>
          </motion.div>

          {/* Card 4: Skill Roadmaps */}
          <motion.div 
            whileHover={{ y: -8 }}
            className="card-soft bg-card-emerald relative overflow-hidden group cursor-pointer"
            onClick={() => handleStart('prep')}
          >
            <div className="max-w-full sm:max-w-[55%] relative z-10">
              <div className="h-14 w-14 bg-white rounded-xl flex items-center justify-center mb-6 shadow-sm">
                <Map className="text-blue-600" size={28} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Skill Roadmaps</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8">
                Define your learning path for new skills with clear, structured, AI-curated roadmaps.
              </p>
              <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-tight">
                View My Path <ArrowRight size={14} />
              </div>
            </div>
            <img 
              src={previewRoadmap} 
              alt="Roadmap Preview" 
              className="hidden sm:block absolute -right-4 top-1/2 -translate-y-1/2 w-64 drop-shadow-xl group-hover:scale-105 transition-transform duration-700"
            />
          </motion.div>
        </div>

        {/* --- WIDE SECTION: INTERVIEW PREPARATION --- */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-[1920px] mx-auto mt-10 card-soft bg-card-blue group cursor-pointer border border-blue-100/30 overflow-hidden"
          onClick={() => handleStart('prep')}
        >
          <div className="grid lg:grid-cols-2 gap-12 sm:gap-16 items-center">
            <div className="lg:pl-6">
              <div className="flex gap-3 mb-8">
                <div className="h-14 w-14 bg-white rounded-xl flex items-center justify-center shadow-md">
                  <Mic2 className="text-blue-600" size={28} />
                </div>
                <div className="h-14 w-14 bg-white rounded-xl flex items-center justify-center shadow-md">
                  <Video className="text-blue-600" size={28} />
                </div>
              </div>
              <h3 className="text-3xl md:text-4xl font-[900] text-slate-900 mb-6 tracking-tighter leading-tight">
                Interview Preparation <br />
                <span className="text-blue-600">(Q&A and Video)</span>
              </h3>
              <p className="text-lg text-slate-500 font-medium leading-relaxed mb-10 max-w-lg">
                Practice common questions and boost confidence with our real-time video interview mode and professional AI analysis.
              </p>
              <button 
                className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2.5"
              >
                Go to Assessment Lab <ArrowRight size={18} />
              </button>
            </div>
            <div className="relative flex justify-center mt-8 sm:mt-0">
              <img 
                src={previewInterview} 
                alt="Interview Mode" 
                className="w-full max-w-xl drop-shadow-2xl rounded-2xl group-hover:scale-[1.01] transition-transform duration-700 hidden sm:block"
              />
            </div>
          </div>
        </motion.div>
      </section>

      {/* --- TRUST BAR --- */}
      <section className="py-24 bg-white flex flex-col items-center">
         <p className="text-[9px] font-black uppercase tracking-[0.6em] text-slate-200 mb-12">The Professional Standard</p>
         <div className="flex flex-wrap justify-center gap-16 opacity-[0.06] grayscale select-none">
            {['Meta', 'Google', 'Deloitte', 'Amazon', 'Netflix'].map(brand => (
              <span key={brand} className="text-4xl font-black tracking-tight">{brand}</span>
            ))}
         </div>
      </section>

      <Footer />
    </div>
  );
}

export default Home;
