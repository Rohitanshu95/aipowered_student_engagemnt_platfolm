import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
    Sparkles, Brain, Clock, Target, CheckCircle2, 
    AlertCircle, RefreshCw, ArrowRight, BrainCircuit, 
    Trophy, ChevronRight, BarChart3, ListChecks, History, ArrowLeft, Play
} from 'lucide-react'
import axios from 'axios'
import { ServerUrl } from '../App'

function AssessmentLab({ onBack }) {
    const [step, setStep] = useState('setup') 
    const [jobDesc, setJobDesc] = useState('')
    const [assessment, setAssessment] = useState(null)
    const [userAnswers, setUserAnswers] = useState({})
    const [currentQuestion, setCurrentQuestion] = useState(0)
    const [timer, setTimer] = useState(900) 
    const [history, setHistory] = useState([])
    const [saving, setSaving] = useState(false)
    const timerRef = useRef()

    useEffect(() => {
        fetchHistory()
    }, [])

    const fetchHistory = async () => {
        try {
            const resp = await axios.get(`${ServerUrl}/api/career/assessments`, { withCredentials: true })
            setHistory(resp.data.assessments)
        } catch (err) {
            console.error("History fetch failed", err)
        }
    }

    const startAssessment = async () => {
        if (!jobDesc.trim()) return
        setStep('loading')
        try {
            const resp = await axios.post(`${ServerUrl}/api/career/generate-assessment`, { jobDesc }, { withCredentials: true })
            setAssessment(resp.data.assessment)
            setStep('quiz')
            setTimer(900)
            setUserAnswers({})
            setCurrentQuestion(0)
        } catch (err) {
            console.error(err)
            alert("Generation failed. Please try again.")
            setStep('setup')
        }
    }

    useEffect(() => {
        if (step === 'quiz' && timer > 0) {
            timerRef.current = setInterval(() => {
                setTimer(prev => prev - 1)
            }, 1000)
        } else if (timer === 0 && step === 'quiz') {
            finishAssessment()
        }
        return () => clearInterval(timerRef.current)
    }, [step, timer])

    const finishAssessment = async () => {
        clearInterval(timerRef.current)
        const score = assessment.questions.reduce((acc, q, idx) => {
            return acc + (userAnswers[idx] === q.correctAnswer ? 1 : 0)
        }, 0)

        const perc = (score / assessment.questions.length) * 100
        let feedback = perc >= 80 ? "Superior" : (perc >= 50 ? "Competent" : "Evolving")

        setAssessment(prev => ({ ...prev, score, feedback }))
        setStep('report')

        setSaving(true)
        try {
            await axios.post(`${ServerUrl}/api/career/save-assessment`, {
                jobDesc,
                questions: assessment.questions,
                score,
                totalQuestions: assessment.questions.length,
                feedback
            }, { withCredentials: true })
            fetchHistory()
        } catch (err) {
            console.error("Save failed", err)
        } finally {
            setSaving(false)
        }
    }

    const formatTime = (s) => {
        const mins = Math.floor(s / 60)
        const secs = s % 60
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`
    }

    if (step === 'setup') {
        return (
            <div className="p-12 md:p-24 h-full flex flex-col items-center justify-center text-center selection:bg-orange-500 selection:text-white">
                <div className="max-w-3xl w-full">
                    <div className="h-24 w-24 bg-black text-white rounded-[32px] flex items-center justify-center mx-auto mb-10 shadow-2xl">
                        <BrainCircuit size={44} />
                    </div>
                    <h2 className="text-6xl font-black text-black tracking-tighter mb-6">Assessment Lab.</h2>
                    <p className="text-xl text-gray-400 font-medium leading-relaxed mb-16">
                        Test your professional readiness with 25 AI-curated MCQs targeting 
                        Technical, Situation, and Logical domains for your selected role.
                    </p>

                    <div className="bg-white p-8 rounded-[48px] border-2 border-black/5 shadow-2xl shadow-black/5 mb-12">
                        <textarea 
                            value={jobDesc}
                            onChange={(e) => setJobDesc(e.target.value)}
                            placeholder="Describe your target role or paste the Job Description here..."
                            className="w-full h-40 p-6 bg-gray-50 border-none rounded-[32px] focus:ring-4 focus:ring-orange-500/10 outline-none resize-none font-black text-xl text-black transition-all"
                        />
                    </div>

                    <div className="flex gap-6">
                        <button 
                            onClick={startAssessment}
                            disabled={!jobDesc.trim()}
                            className="flex-1 py-6 bg-orange-600 text-white rounded-[32px] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-orange-200 hover:bg-black hover:shadow-black/20 active:scale-95 transition-all disabled:bg-gray-100 disabled:text-gray-400 disabled:shadow-none"
                        >
                            Execute Simulation (15m)
                        </button>
                        <button 
                            onClick={() => setStep('history')}
                            className="h-20 w-20 bg-white border-2 border-black/5 rounded-[32px] text-gray-400 hover:text-black hover:border-black transition-all shadow-xl flex items-center justify-center"
                        >
                            <History size={28} />
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    if (step === 'loading') {
        return (
            <div className="p-24 h-full flex flex-col items-center justify-center text-center">
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                    className="h-24 w-24 border-8 border-black border-t-orange-600 rounded-[32px] mb-12"
                />
                <h3 className="text-4xl font-black text-black tracking-tighter mb-4">Synthesizing Logic.</h3>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                    Analysis of Vector Space Completed. Generating Test Scenario...
                </p>
                <div className="w-80 h-3 bg-gray-50 rounded-full mt-16 overflow-hidden border border-black/5">
                    <motion.div 
                        className="h-full bg-black rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 12 }}
                    />
                </div>
            </div>
        )
    }

    if (step === 'quiz') {
        const q = assessment.questions[currentQuestion]
        const progress = ((currentQuestion + 1) / assessment.questions.length) * 100

        return (
            <div className="p-4 md:p-12 h-full flex flex-col selection:bg-orange-600 selection:text-white bg-white">
                <div className="max-w-6xl mx-auto w-full flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <span className="text-[10px] font-black text-orange-600 uppercase tracking-[0.3em]">
                                Level: {q.category}
                            </span>
                            <h2 className="text-4xl font-black text-black tracking-tighter mt-3">Objective {currentQuestion + 1} <span className="text-gray-200 ml-2">/ 25</span></h2>
                        </div>
                        <div className={`flex items-center gap-6 px-10 py-5 rounded-[32px] border-2 transition-all duration-500 ${timer < 60 ? 'bg-orange-50 border-orange-600 text-orange-600 animate-pulse' : 'bg-white border-black/5'}`}>
                            <Clock size={24} />
                            <span className="text-3xl font-black tabular-nums tracking-tighter">{formatTime(timer)}</span>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-3 bg-gray-50 rounded-full mb-16 border-2 border-black/5 overflow-hidden">
                        <motion.div 
                            className="h-full bg-black rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                        />
                    </div>

                    {/* Question Card */}
                    <div className="flex-1 bg-white border-4 border-black/5 rounded-[64px] p-16 shadow-2xl shadow-black/5 relative overflow-hidden flex flex-col">
                        <div className="absolute top-0 right-0 p-16 text-[12rem] font-black text-gray-50/50 pointer-events-none">{currentQuestion + 1}</div>
                        
                        <h3 className="text-4xl font-black text-black mb-16 leading-tight max-w-4xl relative z-10 tracking-tight">
                            {q.question}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-auto relative z-10">
                            {q.options.map((opt, i) => (
                                <button 
                                    key={i}
                                    onClick={() => setUserAnswers(prev => ({ ...prev, [currentQuestion]: opt }))}
                                    className={`p-10 rounded-[40px] text-left font-black text-lg transition-all duration-500 border-2 active:scale-95 ${
                                        userAnswers[currentQuestion] === opt 
                                            ? 'bg-black border-black text-white shadow-2xl' 
                                            : 'bg-white border-black/5 hover:border-black text-gray-400 hover:text-black'
                                    }`}
                                >
                                    <div className="flex items-center gap-6">
                                        <span className={`h-12 w-12 rounded-2xl flex items-center justify-center text-sm font-black transition-colors ${
                                             userAnswers[currentQuestion] === opt ? 'bg-white/20' : 'bg-gray-100 text-gray-300'
                                        }`}>
                                            {String.fromCharCode(65 + i)}
                                        </span>
                                        {opt}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between items-center mt-12">
                        <button 
                            disabled={currentQuestion === 0}
                            onClick={() => setCurrentQuestion(prev => prev - 1)}
                            className="px-10 py-5 text-gray-300 font-black uppercase tracking-[0.3em] hover:text-black disabled:opacity-0 transition-all"
                        >
                            Backtrack
                        </button>

                        <div className="flex gap-6">
                            {currentQuestion === assessment.questions.length - 1 ? (
                                <button 
                                    onClick={finishAssessment}
                                    className="px-16 py-6 bg-orange-600 text-white rounded-[32px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-orange-200 hover:bg-black transition-all active:scale-95"
                                >
                                    Submit Profile
                                </button>
                            ) : (
                                <button 
                                    onClick={() => setCurrentQuestion(prev => prev + 1)}
                                    className="px-16 py-6 bg-black text-white rounded-[32px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-black/20 hover:bg-orange-600 transition-all active:scale-95 flex items-center gap-4"
                                >
                                    Next Phase <ChevronRight size={22} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (step === 'report') {
        const score = assessment.score
        const total = assessment.questions.length
        const perc = Math.round((score / total) * 100)

        return (
            <div className="p-12 md:p-20 overflow-y-auto h-full bg-white selection:bg-orange-600 selection:text-white">
                <div className="max-w-5xl mx-auto space-y-16 pb-32">
                    <header className="flex items-center justify-between">
                        <h2 className="text-5xl font-black text-black tracking-tighter">Performance Analysis.</h2>
                        <button 
                            onClick={() => setStep('setup')}
                            className="h-16 w-16 bg-white border-2 border-black/5 rounded-3xl text-gray-300 hover:text-black hover:border-black transition-all shadow-xl flex items-center justify-center"
                        >
                            <RefreshCw size={28} />
                        </button>
                    </header>

                    {/* Score Panel */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        <div className="bg-white border-4 border-black rounded-[56px] p-16 text-black text-center shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] flex flex-col justify-center items-center">
                            <div className="relative h-48 w-48 mb-8">
                                <svg className="h-full w-full rotate-[-90deg]" viewBox="0 0 100 100">
                                    <circle className="text-gray-100" stroke="currentColor" strokeWidth="6" fill="transparent" r="44" cx="50" cy="50" />
                                    <motion.circle 
                                        className="text-orange-600" 
                                        stroke="currentColor" 
                                        strokeWidth="8" 
                                        strokeDasharray="276.46" 
                                        initial={{ strokeDashoffset: 276.46 }}
                                        animate={{ strokeDashoffset: 276.46 - (276.46 * perc) / 100 }}
                                        transition={{ duration: 2.5, ease: "circOut" }}
                                        strokeLinecap="round" 
                                        fill="transparent" 
                                        r="44" cx="50" cy="50" 
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-5xl font-black tracking-tighter">{perc}%</span>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1">Accuracy</span>
                                </div>
                            </div>
                            <h4 className="text-xl font-black uppercase tracking-widest mb-2">Rank.</h4>
                            <div className="px-8 py-3 bg-black text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em]">
                                {assessment.feedback}
                            </div>
                        </div>

                        <div className="md:col-span-2 bg-gray-50/50 rounded-[56px] p-16 border-2 border-black/5 flex flex-col justify-center">
                            <div className="flex items-center gap-8 mb-10">
                                <div className="h-20 w-20 bg-black text-white rounded-[32px] flex items-center justify-center shadow-2xl">
                                    <Trophy size={40} />
                                </div>
                                <div>
                                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2">Simulation Vector</div>
                                    <div className="text-6xl font-black text-black tracking-tighter leading-none">{score} <span className="text-gray-200 text-4xl">/ {total}</span></div>
                                </div>
                            </div>
                            <p className="text-2xl text-black font-medium leading-relaxed tracking-tight italic opacity-80">
                                "This assessment indicates a <span className='text-orange-600 font-bold'>{assessment.feedback.toLowerCase()}</span> capacity for the role. Your technical foundations are noted. Proceed to detailed review for precise optimization."
                            </p>
                        </div>
                    </div>

                    {/* Question Review */}
                    <div className="space-y-10">
                        <div className="flex items-center justify-between px-6">
                            <h3 className="text-2xl font-black text-black tracking-tight">Granular Review.</h3>
                            <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest">
                                <span className="flex items-center gap-2"><div className="h-2 w-2 bg-black rounded-full" /> SUCCESS</span>
                                <span className="flex items-center gap-2"><div className="h-2 w-2 bg-orange-600 rounded-full" /> FAILURE</span>
                            </div>
                        </div>

                        <div className="grid gap-8">
                            {assessment.questions.map((q, i) => (
                                <motion.div 
                                    key={i} 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className={`p-12 bg-white border-2 rounded-[56px] shadow-2xl shadow-black/5 transition-all duration-700 ${
                                        userAnswers[i] === q.correctAnswer ? 'border-black/5 hover:border-black' : 'border-orange-600/10 hover:border-orange-600'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-10">
                                        <div className="flex items-center gap-4">
                                            <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">{q.category} UNIT</span>
                                            <span className="h-1 w-1 bg-gray-200 rounded-full" />
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">SEQUENCE {i+1}</span>
                                        </div>
                                        {userAnswers[i] === q.correctAnswer ? (
                                            <div className='bg-black text-white p-2 rounded-xl'><CheckCircle2 size={24} /></div>
                                        ) : (
                                            <div className='bg-orange-600 text-white p-2 rounded-xl'><AlertCircle size={24} /></div>
                                        )}
                                    </div>
                                    <h4 className="text-3xl font-black text-black mb-10 tracking-tight leading-tight">{q.question}</h4>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                                        {q.options.map((opt, oi) => (
                                            <div key={oi} className={`px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest border-2 flex items-center justify-between transition-all ${
                                                opt === q.correctAnswer ? 'bg-black text-white border-black' : 
                                                opt === userAnswers[i] ? 'bg-orange-50 text-orange-600 border-orange-600' : 
                                                'bg-gray-50/50 text-gray-300 border-transparent grayscale'
                                            }`}>
                                                {opt}
                                                {opt === q.correctAnswer && <CheckCircle2 size={16} />}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="bg-gray-50/50 p-8 rounded-[32px] flex gap-6 border-2 border-black/5">
                                        <div className="h-10 w-10 bg-black text-white rounded-xl flex items-center justify-center shrink-0 shadow-xl">
                                            <Sparkles size={20} />
                                        </div>
                                        <p className="text-sm text-gray-500 font-bold leading-relaxed">
                                            <span className="text-black font-black uppercase tracking-widest mr-3">AIGC Logic:</span> {q.explanation}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (step === 'history') {
        return (
            <div className="p-12 md:p-24 overflow-y-auto h-full bg-white selection:bg-orange-600 selection:text-white">
                <div className="max-w-5xl mx-auto space-y-16">
                    <header className="flex items-center justify-between">
                        <div>
                            <h2 className="text-5xl font-black text-black tracking-tighter mb-3">Simulation History.</h2>
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.3em]">Trajectory Analysis Sequence</p>
                        </div>
                        <button 
                            onClick={() => setStep('setup')}
                            className="px-10 py-5 bg-orange-600 text-white rounded-3xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-2xl shadow-orange-200"
                        >
                            Initialize New Path
                        </button>
                    </header>

                    {history.length === 0 ? (
                        <div className="py-40 text-center bg-gray-50/50 border-2 border-dashed border-black/5 rounded-[64px] flex flex-col items-center">
                            <History className="text-gray-200 mb-8" size={64} />
                            <h3 className="text-2xl font-black text-gray-300 uppercase tracking-widest">No Logged Data.</h3>
                        </div>
                    ) : (
                        <div className="grid gap-8">
                            {history.map((h, i) => (
                                <motion.div 
                                    key={h._id} 
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="bg-white border-2 border-black/5 p-12 rounded-[56px] shadow-2xl shadow-black/5 flex items-center justify-between group hover:border-black transition-all cursor-pointer overflow-hidden relative"
                                    onClick={() => {
                                        setAssessment(h)
                                        setUserAnswers({}) 
                                        setStep('report')
                                    }}
                                >
                                    <div className="absolute top-0 right-0 p-12 text-6xl font-black text-gray-50/50 pointer-events-none group-hover:text-orange-50 transition-all duration-700">REPORT_ID_{i+1}</div>
                                    
                                    <div className="flex items-center gap-10 relative z-10">
                                        <div className={`h-24 w-24 rounded-[32px] flex flex-col items-center justify-center font-black shadow-2xl ${
                                            h.feedback === 'Superior' ? 'bg-black text-white' : 
                                            h.feedback === 'Competent' ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-400'
                                        }`}>
                                            <span className="text-3xl leading-none">{(h.score / h.totalQuestions * 100).toFixed(0)}</span>
                                            <span className="text-[10px] uppercase mt-2 tracking-widest">% Vector</span>
                                        </div>
                                        <div>
                                            <h4 className="text-3xl font-black text-black group-hover:text-orange-600 transition-all tracking-tighter mb-2">{h.jobDesc}</h4>
                                            <div className="flex items-center gap-4">
                                                <div className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">{new Date(h.createdAt).toLocaleDateString()} Deployment</div>
                                                <div className="h-1 w-1 bg-gray-200 rounded-full" />
                                                <div className="text-[10px] font-black text-orange-600 uppercase tracking-widest">{h.feedback} RESULT SCALE</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='h-16 w-16 rounded-full border-2 border-black/5 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all relative z-10'>
                                        <ChevronRight size={28} />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        )
    }

    return null
}

export default AssessmentLab
