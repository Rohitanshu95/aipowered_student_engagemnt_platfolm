import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Upload, CheckCircle2, RefreshCw, X, ArrowRight, AlertCircle } from 'lucide-react'
import axios from 'axios'
import { ServerUrl } from '../App'

function ResumeManager({ user, onUpdate }) {
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState(null)
    const fileInputRef = useRef(null)

    const handleFileChange = async (e) => {
        const file = e.target.files[0]
        if (!file) return
        
        if (file.type !== 'application/pdf') {
            setError("Please upload a PDF file.")
            return
        }

        setUploading(true)
        setError(null)

        const formData = new FormData()
        formData.append('resume', file)

        try {
            await axios.post(`${ServerUrl}/api/career/ats-check`, formData, {
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            // Refresh parent state
            onUpdate()
        } catch (err) {
            console.error(err)
            setError("Failed to sync resume. Please try again.")
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm mb-10 overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                <FileText size={120} />
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
                <div className="flex items-center gap-5">
                    <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
                        <FileText size={32} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            Active Career Resume
                            {user?.resumeUrl && <CheckCircle2 className="text-emerald-500" size={18} />}
                        </h3>
                        <p className="text-gray-500 font-medium">
                            {user?.resumeName || "No resume uploaded yet"}
                        </p>
                        {user?.updatedAt && (
                            <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider font-bold">
                                Last Synced: {new Date(user.updatedAt).toLocaleDateString()}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                    <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden" 
                        accept=".pdf"
                    />
                    
                    <button 
                        onClick={() => fileInputRef.current.click()}
                        disabled={uploading}
                        className={`flex-1 sm:flex-none px-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${
                            uploading 
                            ? 'bg-gray-100 text-gray-400' 
                            : 'bg-gray-900 text-white hover:bg-black shadow-lg shadow-gray-200'
                        }`}
                    >
                        {uploading ? (
                            <RefreshCw className="animate-spin" size={16} />
                        ) : (
                            <Upload size={16} />
                        )}
                        {uploading ? 'Analyzing...' : user?.resumeUrl ? 'Update Resume' : 'Upload Resume'}
                    </button>

                    {user?.resumeUrl && (
                        <a 
                            href={`${ServerUrl}${user.resumeUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 sm:flex-none px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                        >
                            View Active <ArrowRight size={16} />
                        </a>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {error && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-4 flex items-center gap-2 text-rose-600 bg-rose-50 px-4 py-2 rounded-xl text-xs font-bold border border-rose-100"
                    >
                        <AlertCircle size={14} /> {error}
                        <button onClick={() => setError(null)} className="ml-auto hover:scale-110 transition">
                            <X size={14} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
            
            {!user?.resumeUrl && (
                <div className="mt-6 flex items-start gap-3 bg-blue-50/50 p-4 rounded-2xl border border-blue-50">
                    <div className="h-5 w-5 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 shrink-0 mt-0.5">
                        <CheckCircle2 size={12} fill="currentColor" />
                    </div>
                    <p className="text-xs text-blue-800 leading-relaxed">
                        <span className="font-bold">Pro Tip:</span> Uploading your resume allows our AI to automatically calculate 
                        a match percentage for every internship listing, personalized specifically for your skills and experience.
                    </p>
                </div>
            )}
        </div>
    )
}

export default ResumeManager
