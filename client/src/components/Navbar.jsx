import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from "framer-motion"
import { BsRobot, BsCoin } from "react-icons/bs";
import { HiOutlineLogout } from "react-icons/hi";
import { FaUserAstronaut } from "react-icons/fa";
import { Sparkles } from "lucide-react";
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { ServerUrl } from '../App';
import { setUserData } from '../redux/userSlice';
import AuthModel from './AuthModel';

function Navbar() {
    const {userData} = useSelector((state)=>state.user)
    const [showCreditPopup,setShowCreditPopup] = useState(false)
    const [showUserPopup,setShowUserPopup] = useState(false)
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [showAuth, setShowAuth] = useState(false);

    const handleLogout = async () => {
        try {
            await axios.get(ServerUrl + "/api/auth/logout" , {withCredentials:true})
            dispatch(setUserData(null))
            setShowCreditPopup(false)
            setShowUserPopup(false)
            navigate("/")
        } catch (error) {
            console.log(error)
        }
    }

  return (
    <div className='fixed top-0 left-0 w-full z-[1000] px-4 sm:px-10 py-6 flex justify-center pointer-events-none'>
        <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className='w-full max-w-7xl bg-white/90 backdrop-blur-xl rounded-2xl border border-slate-200 px-4 sm:px-8 py-3.5 flex justify-between items-center shadow-lg pointer-events-auto'
        >
            {/* Logo Section */}
            <div 
                className='flex items-center gap-3 cursor-pointer group shrink-0'
                onClick={() => navigate("/")}
            >
                <div className='bg-slate-900 text-white p-2.5 rounded-lg group-hover:bg-blue-600 transition-all shadow-sm'>
                    <BsRobot size={20} />
                </div>
                <div className="flex flex-col">
                    <h1 className='text-xl font-extrabold tracking-tight text-slate-900 leading-none'>InterviewIQ</h1>
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1 hidden sm:block">Professional System</span>
                </div>
            </div>

            {/* Navigation Actions */}
            <div className='flex items-center gap-2 sm:gap-4'>
                <button 
                    onClick={() => {
                        if(!userData){
                            setShowAuth(true)
                            return;
                        }
                        navigate("/career-suite")
                    }}
                    className='hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-all shadow-sm'
                >
                    <Sparkles size={14} />
                    Career Suite
                </button>

                <div className='h-6 w-px bg-slate-200 mx-1 hidden sm:block'></div>

                {/* Credits Display */}
                <div className='relative'>
                    <button 
                        onClick={() => {
                            if(!userData) { setShowAuth(true); return; }
                            setShowCreditPopup(!showCreditPopup);
                            setShowUserPopup(false);
                        }}
                        className='flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 hover:bg-slate-100 transition-all'
                    >
                        <BsCoin size={16} className="text-amber-500" />
                        <span>{userData?.credits || 0}</span>
                    </button>
                    
                    <AnimatePresence>
                        {showCreditPopup && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                className='absolute right-0 mt-4 w-72 bg-white shadow-xl border border-slate-200 rounded-2xl p-6 z-50'
                            >
                                <div className='text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3'>System Tokens</div>
                                <p className='text-sm text-slate-600 mb-5 font-medium leading-relaxed'>Boost your neural processing capacity with enterprise credits.</p>
                                <button 
                                    onClick={() => navigate("/pricing")}
                                    className='w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg shadow-slate-900/10 hover:bg-slate-800 transition-all active:scale-[0.98]'
                                >
                                    Purchase Tokens
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Account Actions */}
                <div className='relative'>
                    {userData ? (
                        <Link
                            to="/profile"
                            className='h-10 w-10 sm:h-11 sm:w-11 bg-slate-900 text-white rounded-lg flex items-center justify-center hover:bg-slate-800 transition-all shadow-sm active:scale-[0.98] shrink-0 overflow-hidden'
                        >
                            {userData?.avatar ? (
                                <img 
                                    src={`${ServerUrl}${userData.avatar}`} 
                                    alt="Profile" 
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className='font-bold text-sm sm:text-base'>{userData?.name.slice(0,1).toUpperCase()}</span>
                            )}
                        </Link>
                    ) : (
                        <button
                            onClick={() => setShowAuth(true)}
                            className='h-10 w-10 sm:h-11 sm:w-11 bg-slate-900 text-white rounded-lg flex items-center justify-center hover:bg-slate-800 transition-all shadow-sm active:scale-[0.98] shrink-0'
                        >
                            <FaUserAstronaut size={16} />
                        </button>
                    )}

                    <AnimatePresence>
                        {showUserPopup && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                className='absolute right-0 mt-4 w-60 bg-white shadow-xl border border-slate-200 rounded-2xl p-4 z-50'
                            >
                                <div className='px-4 py-3 mb-2 bg-slate-50 rounded-xl'>
                                    <div className='text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1'>Identity</div>
                                    <p className='text-sm font-bold text-slate-900 truncate'>{userData?.name}</p>
                                </div>
                                <button 
                                    onClick={() => { navigate("/history"); setShowUserPopup(false); }} 
                                    className='w-full text-left font-bold text-xs py-3 px-4 hover:bg-slate-50 rounded-lg text-slate-600 hover:text-slate-900 transition-all'
                                >
                                    View History
                                </button>
                                <button 
                                    onClick={handleLogout}
                                    className='w-full text-left font-bold text-xs py-3 px-4 flex items-center gap-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-all'
                                >
                                    <HiOutlineLogout size={16} />
                                    Sign Out
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
        {showAuth && <AuthModel onClose={() => setShowAuth(false)} />}
    </div>
  )
}

export default Navbar
