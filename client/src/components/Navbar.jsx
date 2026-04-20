import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from "framer-motion"
import { BsRobot, BsCoin } from "react-icons/bs";
import { HiOutlineLogout } from "react-icons/hi";
import { FaUserAstronaut } from "react-icons/fa";
import { Sparkles } from "lucide-react";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    <div className='fixed top-0 left-0 w-full z-[1000] px-6 py-8 flex justify-center pointer-events-none'>
        <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className='w-full max-w-[1920px] bg-white/80 backdrop-blur-xl rounded-[32px] border border-gray-100 px-8 py-5 flex justify-between items-center shadow-2xl shadow-black/5 pointer-events-auto'
        >
            {/* Logo Section */}
            <div 
                className='flex items-center gap-3 cursor-pointer group'
                onClick={() => navigate("/")}
            >
                <div className='bg-black text-white p-2.5 rounded-xl group-hover:bg-blue-600 transition-colors duration-500'>
                    <BsRobot size={22}/>
                </div>
                <h1 className='text-xl font-black tracking-tighter text-black'>InterviewIQ</h1>
            </div>

            {/* Navigation Actions */}
            <div className='flex items-center gap-4'>
                <button 
                    onClick={() => {
                        if(!userData){
                            setShowAuth(true)
                            return;
                        }
                        navigate("/career-suite")
                    }}
                    className='hidden md:flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gray-50 text-gray-900 font-bold text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-all duration-300'
                >
                    <Sparkles size={14} className="text-blue-500" />
                    Career Suite
                </button>

                <div className='h-8 w-px bg-gray-100 mx-2 hidden sm:block'></div>

                {/* Credits Display */}
                <div className='relative'>
                    <button 
                        onClick={() => {
                            if(!userData) { setShowAuth(true); return; }
                            setShowCreditPopup(!showCreditPopup);
                            setShowUserPopup(false);
                        }}
                        className='flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-blue-50 text-blue-700 font-black text-xs uppercase tracking-widest border border-blue-100 hover:bg-blue-100 transition-all'
                    >
                        <BsCoin size={18}/>
                        {userData?.credits || 0}
                    </button>
                    
                    <AnimatePresence>
                        {showCreditPopup && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                className='absolute right-0 mt-4 w-72 bg-white shadow-2xl border border-gray-100 rounded-3xl p-6 z-50'
                            >
                                <div className='text-xs font-black text-gray-400 uppercase tracking-widest mb-4'>Token Balance</div>
                                <p className='text-sm text-gray-600 mb-6 font-bold leading-relaxed'>Elevate your performance with premium AI credits.</p>
                                <button 
                                    onClick={() => navigate("/pricing")}
                                    className='w-full py-4 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-gray-200 hover:bg-blue-600 transition-all'
                                >
                                    Boost My Credits
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Account Actions */}
                <div className='relative'>
                    <button
                        onClick={() => {
                            if(!userData) { setShowAuth(true); return; }
                            setShowUserPopup(!showUserPopup);
                            setShowCreditPopup(false);
                        }}
                        className='h-12 w-12 bg-black text-white rounded-2xl flex items-center justify-center hover:scale-105 transition-all shadow-lg active:scale-95'
                    >
                        {userData ? (
                            <span className='font-black text-lg'>{userData?.name.slice(0,1).toUpperCase()}</span>
                        ) : (
                            <FaUserAstronaut size={18}/>
                        )}
                    </button>

                    <AnimatePresence>
                        {showUserPopup && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                className='absolute right-0 mt-4 w-56 bg-white shadow-2xl border border-gray-100 rounded-3xl p-4 z-50'
                            >
                                <div className='px-4 py-3 mb-2'>
                                    <div className='text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1'>Identity</div>
                                    <p className='text-sm font-black text-black truncate'>{userData?.name}</p>
                                </div>
                                <div className='h-px bg-gray-50 mb-2 mx-4'></div>
                                <button 
                                    onClick={() => { navigate("/history"); setShowUserPopup(false); }} 
                                    className='w-full text-left font-black text-[10px] uppercase tracking-widest py-3 px-4 hover:bg-gray-50 rounded-xl text-gray-600 hover:text-black transition-all'
                                >
                                    Session History
                                </button>
                                <button 
                                    onClick={handleLogout}
                                    className='w-full text-left font-black text-[10px] uppercase tracking-widest py-3 px-4 flex items-center gap-2 text-red-500 hover:bg-red-50 rounded-xl transition-all'
                                >
                                    <HiOutlineLogout size={16}/>
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
