import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Upload, FileText, CheckCircle2, AlertCircle, RefreshCw, Star, ArrowRight, Sparkles } from 'lucide-react'
import axios from 'axios'
import { ServerUrl } from '../App'

function AtsChecker() {
    const [file, setFile] = useState(null)
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null)
    const [error, setError] = useState(null)
    const [user, setUser] = useState(null)

    // Fetch existing user data on mount
    React.useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get(`${ServerUrl}/api/user/me`, { withCredentials: true })
                setUser(response.data)
            } catch (error) {
                console.error("Failed to fetch user:", error)
            }
        }
        fetchUserData()
    }, [])

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0]
        if (selectedFile && selectedFile.type === 'application/pdf') {
            setFile(selectedFile)
            setError(null)
        } else {
            setError('Please upload a valid PDF file.')
        }
    }

    const handleUpload = async () => {
        if (!file) return
        setLoading(true)
        setError(null)

        const formData = new FormData()
        formData.append('resume', file)

        try {
            const response = await axios.post(`${ServerUrl}/api/career/ats-check`, formData, {
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            setResult(response.data.analysis)
            setLoading(false)
        } catch (err) {
            console.error(err)
            setError(err.response?.data?.message || 'Failed to analyze resume. Check your API key or connection.')
            setLoading(false)
        }
    }

    const reset = () => {
        setFile(null)
        setResult(null)
        setError(null)
    }

    if (result) {
        return (
            <div className="p-6 md:p-8 max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-gray-900">Analysis Results</h2>
                    <button 
                        onClick={reset}
                        className="flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition"
                    >
                        <RefreshCw size={16} /> Check Another
                    </button>
                </div>

                {/* Score Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="md:col-span-1 bg-emerald-50 rounded-3xl p-8 flex flex-col items-center justify-center text-center border border-emerald-100 shadow-sm">
                        <div className="relative mb-4">
                            <svg className="h-32 w-32 transform -rotate-90">
                                <circle
                                    className="text-emerald-100"
                                    strokeWidth="8"
                                    stroke="currentColor"
                                    fill="transparent"
                                    r="52"
                                    cx="64"
                                    cy="64"
                                />
                                <motion.circle
                                    className="text-emerald-500"
                                    strokeWidth="8"
                                    strokeDasharray={326.7}
                                    initial={{ strokeDashoffset: 326.7 }}
                                    animate={{ strokeDashoffset: 326.7 - (326.7 * result.score) / 100 }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    strokeLinecap="round"
                                    stroke="currentColor"
                                    fill="transparent"
                                    r="52"
                                    cx="64"
                                    cy="64"
                                />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-emerald-700">
                                {result.score}%
                            </span>
                        </div>
                        <p className="font-semibold text-emerald-800">ATS Match Score</p>
                    </div>

                    <div className="md:col-span-2 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <Star className="text-amber-400 h-5 w-5 fill-amber-400" />
                            Executive Summary
                        </h3>
                        <p className="text-gray-600 leading-relaxed text-lg italic">
                            "{result.summary}"
                        </p>
                    </div>
                </div>

                {/* Strengths & Weaknesses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                    <div className="space-y-4">
                        <h4 className="font-bold text-gray-900 flex items-center gap-2">
                            <CheckCircle2 className="text-emerald-500" size={20} />
                            Key Strengths
                        </h4>
                        <div className="grid gap-3">
                            {result.strengths.map((s, i) => (
                                <div key={i} className="flex gap-3 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100/50">
                                    <div className="h-2 w-2 rounded-full bg-emerald-400 mt-2 shrink-0" />
                                    <p className="text-gray-700 text-sm">{s}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-bold text-gray-900 flex items-center gap-2">
                            <AlertCircle className="text-rose-500" size={20} />
                            Areas for Improvement
                        </h4>
                        <div className="grid gap-3">
                            {result.weaknesses.map((w, i) => (
                                <div key={i} className="flex gap-3 bg-rose-50/50 p-4 rounded-xl border border-rose-100/50">
                                    <div className="h-2 w-2 rounded-full bg-rose-400 mt-2 shrink-0" />
                                    <p className="text-gray-700 text-sm">{w}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recommendations */}
                <div className="bg-linear-to-r from-gray-900 to-gray-800 rounded-3xl p-8 text-white shadow-xl">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <Sparkles className="text-yellow-400" size={24} />
                        Actionable Recommendations
                    </h3>
                    <div className="grid gap-4">
                        {result.recommendations.map((rec, i) => (
                            <div key={i} className="flex items-center gap-4 group">
                                <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-sm shrink-0">
                                    {i + 1}
                                </div>
                                <p className="text-gray-300 group-hover:text-white transition">{rec}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="p-8 md:p-16 h-full flex flex-col items-center justify-center text-center">
            <div className="max-w-xl w-full">
                <div className="mb-8">
                    <div className="h-20 w-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <Upload size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Your Resume</h2>
                    <p className="text-gray-500 mb-4">
                        Get a detailed AI-powered analysis of your resume against current ATS standards. We support PDF formats up to 5MB.
                    </p>
                    {user?.resumeUrl && (
                        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-xs font-bold border border-blue-100 mb-4 shadow-sm">
                            <CheckCircle2 size={16} /> Active: {user.resumeName || 'Resume on file'}
                        </div>
                    )}
                </div>

                <div className="relative group">
                    <input 
                        type="file" 
                        accept=".pdf" 
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className={`border-2 border-dashed rounded-3xl p-10 transition-all duration-300 ${
                        file ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-emerald-400 group-hover:bg-gray-50'
                    }`}>
                        {file ? (
                            <div className="flex flex-col items-center">
                                <FileText className="text-emerald-500 h-10 w-10 mb-3" />
                                <p className="font-semibold text-gray-900">{file.name}</p>
                                <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center">
                                <p className="text-gray-600 font-medium mb-1">Click to browse or drag and drop</p>
                                <p className="text-sm text-gray-400">Only PDF files are supported</p>
                            </div>
                        )}
                    </div>
                </div>

                {error && (
                    <div className="mt-4 flex items-center gap-2 text-rose-600 bg-rose-50 px-4 py-2 rounded-xl text-sm justify-center border border-rose-100">
                        <AlertCircle size={14} /> {error}
                    </div>
                )}

                <button
                    onClick={handleUpload}
                    disabled={!file || loading}
                    className={`w-full mt-8 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-emerald-200/50 transition-all flex items-center justify-center gap-3 ${
                        !file || loading 
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                            : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95'
                    }`}
                >
                    {loading ? (
                        <>
                            <RefreshCw className="animate-spin" size={20} /> Analyzing with Gemini...
                        </>
                    ) : (
                        <>
                            Run ATS Analysis <ArrowRight size={20} />
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}

export default AtsChecker
