import React from 'react'
import { BsRobot } from "react-icons/bs";
import { motion } from "motion/react"
import { FcGoogle } from "react-icons/fc";
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { ServerUrl } from '../App';
import { useDispatch } from 'react-redux';
import { setUserData } from '../redux/userSlice';
import { useEffect } from 'react';

import { useNavigate } from 'react-router-dom';

function Auth({isModel = false}) {
    const dispatch = useDispatch()
    const navigate = useNavigate();

    const login = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                console.log("Google Auth Success. Token received. Sending to backend...");
                const { access_token } = tokenResponse;
                
                const backendResult = await axios.post(
                    ServerUrl + "/api/auth/google", 
                    { token: access_token }, 
                    { withCredentials: true }
                );
                
                console.log("Backend Auth Result:", backendResult.data);
                dispatch(setUserData(backendResult.data));
                
                if (!isModel) {
                    navigate('/');
                }
            } catch (error) {
                console.error("Backend Auth Error:", error);
                dispatch(setUserData(null));
            }
        },
        onError: (error) => {
            console.error("Google Login Failed:", error);
            dispatch(setUserData(null));
        }
    });

    const handleGoogleAuth = () => {
        console.log("Initiating Google Auth...");
        login();
    }

  return (
    <div className={`
      w-full overflow-hidden
      ${isModel ? "py-4" : "min-h-screen bg-white flex items-center justify-center px-6 py-20"}
    `}>
        <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className={`
        w-full 
        ${isModel ? "max-w-md p-10 rounded-[48px]" : "max-w-lg p-16 rounded-[64px]"}
        bg-white shadow-2xl border-2 border-black/5
      `}>
            <div className='flex items-center justify-center gap-3 mb-10'>
                <div className='bg-black text-white p-3 rounded-2xl'>
                    <BsRobot size={22}/>
                </div>
                <h2 className='font-black text-2xl tracking-tighter text-black'>InterviewIQ</h2>
            </div>

            <div className='text-center mb-12'>
                <h1 className='text-4xl md:text-5xl font-black tracking-tighter leading-[0.9] mb-6'>
                    Elevate Your <br />
                    <span className='text-orange-600'>Perspective.</span>
                </h1>
                <p className='text-gray-400 font-bold leading-relaxed'>
                    Join the elite network of professionals using AI to master the high-stakes interview process.
                </p>
            </div>

            <motion.button 
                onClick={handleGoogleAuth}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                className='w-full flex items-center justify-center gap-4 py-5 bg-black text-white rounded-3xl shadow-xl shadow-black/10 font-black text-xs uppercase tracking-[0.2em] hover:bg-orange-600 transition-all duration-500'
            >
                <FcGoogle size={22}/>
                Authorize with Google
            </motion.button>

            <div className='mt-10 text-center'>
                <p className='text-[10px] font-black uppercase tracking-widest text-gray-300'>
                    Instant access • No password required
                </p>
            </div>
        </motion.div>
    </div>
  )
}

export default Auth
