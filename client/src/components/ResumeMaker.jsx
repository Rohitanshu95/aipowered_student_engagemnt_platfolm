import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
    User, Briefcase, GraduationCap, Code2, Plus, Trash2, 
    ArrowRight, ArrowLeft, Download, RefreshCw, CheckCircle2,
    Mail, Phone, Globe
} from 'lucide-react'
import axios from 'axios'
import { ServerUrl } from '../App'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

function ResumeMaker() {
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [generatedResume, setGeneratedResume] = useState(null)
    
    // Form State
    const [formData, setFormData] = useState({
        personalInfo: { name: '', email: '', phone: '', linkedin: '', github: '', website: '' },
        summary: '',
        experience: [{ company: '', role: '', period: '', description: '' }],
        education: [{ school: '', degree: '', year: '' }],
        skills: { technical: '', soft: '', tools: '' },
        projects: [{ name: '', description: '', link: '' }]
    })

    // Fetch existing user data on mount
    React.useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get(`${ServerUrl}/api/user/me`, { withCredentials: true })
                const user = response.data
                
                if (user) {
                    setFormData(prev => ({
                        ...prev,
                        personalInfo: {
                            name: user.name || '',
                            email: user.email || '',
                            phone: user.phone || '',
                            linkedin: user.linkedin || '',
                            github: user.github || '',
                            website: user.website || ''
                        },
                        summary: user.profileBrief || '',
                        experience: user.experience.length > 0 ? user.experience.map(exp => ({
                            company: exp.company,
                            role: exp.title,
                            period: exp.duration,
                            description: exp.description
                        })) : prev.experience,
                        education: user.education.length > 0 ? user.education.map(edu => ({
                            school: edu.school,
                            degree: edu.degree,
                            year: edu.year
                        })) : prev.education,
                        skills: {
                            technical: user.skills.join(', '),
                            soft: '',
                            tools: ''
                        }
                    }))
                }
            } catch (error) {
                console.error("Failed to fetch user data:", error)
            }
        }
        fetchUserData()
    }, [])

    const handleInput = (section, field, value, index = null) => {
        if (index !== null) {
            const newList = [...formData[section]]
            newList[index][field] = value
            setFormData({ ...formData, [section]: newList })
        } else if (typeof formData[section] === 'object' && !Array.isArray(formData[section])) {
            setFormData({ ...formData, [section]: { ...formData[section], [field]: value } })
        } else {
            setFormData({ ...formData, [section]: value })
        }
    }

    const addListItem = (section, template) => {
        setFormData({ ...formData, [section]: [...formData[section], template] })
    }

    const removeListItem = (section, index) => {
        const newList = [...formData[section]]
        newList.splice(index, 1)
        setFormData({ ...formData, [section]: newList })
    }

    const handleGenerate = async () => {
        setLoading(true)
        try {
            const response = await axios.post(`${ServerUrl}/api/career/generate-resume`, formData, {
                withCredentials: true
            })
            setGeneratedResume(response.data.resume)
            setStep(5) // Move to Preview
        } catch (error) {
            console.error(error)
            alert('Failed to generate resume. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const downloadPDF = async () => {
        const element = document.getElementById('resume-pdf-content')
        const canvas = await html2canvas(element, { scale: 2 })
        const imgData = canvas.toDataURL('image/png')
        const pdf = new jsPDF('p', 'mm', 'a4')
        const imgProps = pdf.getImageProperties(imgData)
        const pdfWidth = pdf.internal.pageSize.getWidth()
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
        pdf.save(`${formData.personalInfo.name.replace(/\s+/g, '_')}_Resume.pdf`)
    }

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Progress Bar */}
            <div className="flex items-center justify-between px-4 sm:px-8 py-4 sm:py-6 border-b border-slate-100 bg-slate-50/30">
                <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto no-scrollbar py-1">
                    {[
                        { id: 1, name: 'Identity', icon: User },
                        { id: 2, name: 'History', icon: Briefcase },
                        { id: 3, name: 'Logic', icon: GraduationCap },
                        { id: 4, name: 'Vectors', icon: Code2 },
                        { id: 5, name: 'Finalize', icon: CheckCircle2 }
                    ].map((s) => (
                        <div key={s.id} className="flex items-center gap-2 shrink-0">
                            <div className={`h-7 w-7 sm:h-9 sm:w-9 rounded-xl flex items-center justify-center text-[10px] sm:text-xs font-black transition-all ${
                                step === s.id ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' : 
                                step > s.id ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                            }`}>
                                {step > s.id ? <CheckCircle2 size={14} className="sm:size-[18px]" /> : s.id}
                            </div>
                            <span className={`text-[10px] sm:text-xs font-black uppercase tracking-widest ${step >= s.id ? 'text-slate-900' : 'text-slate-400'}`}>
                                {s.name}
                            </span>
                            {s.id < 5 && <div className="h-px w-4 sm:w-8 bg-slate-100 mx-1 sm:mx-2" />}
                        </div>
                    ))}
                </div>
            </div>

            <main className="flex-1 overflow-y-auto p-4 sm:p-10 relative no-scrollbar">
                <AnimatePresence mode="wait">
                    {/* Step 1: Personal Info */}
                    {step === 1 && (
                        <motion.div 
                            key="step1"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="max-w-3xl mx-auto space-y-8 sm:space-y-12"
                        >
                            <section>
                                <div className="mb-6 sm:mb-8">
                                    <h3 className="text-xl sm:text-3xl font-[900] text-slate-900 flex items-center gap-3 tracking-tighter">
                                        <User className="text-blue-500" size={24} /> Neural Identity
                                    </h3>
                                    <p className="text-[10px] sm:text-xs text-slate-400 font-black uppercase tracking-widest mt-1 opacity-60">Base profile parameters</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                    <InputField label="Entity Name" value={formData.personalInfo.name} onChange={(v) => handleInput('personalInfo', 'name', v)} placeholder="Full Name" />
                                    <InputField label="Communication" value={formData.personalInfo.email} onChange={(v) => handleInput('personalInfo', 'email', v)} placeholder="Email Address" />
                                    <InputField label="Sequence ID" value={formData.personalInfo.phone} onChange={(v) => handleInput('personalInfo', 'phone', v)} placeholder="Phone Number" />
                                    <InputField label="Network Link" value={formData.personalInfo.linkedin} onChange={(v) => handleInput('personalInfo', 'linkedin', v)} placeholder="LinkedIn Profile" />
                                    <InputField label="Code Repository" value={formData.personalInfo.github} onChange={(v) => handleInput('personalInfo', 'github', v)} placeholder="GitHub Profile" />
                                    <InputField label="Web Vector" value={formData.personalInfo.website} onChange={(v) => handleInput('personalInfo', 'website', v)} placeholder="Portfolio Link" />
                                </div>
                            </section>
                            <section>
                                <h3 className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Core Briefing</h3>
                                <textarea 
                                    className="w-full bg-slate-50 border border-slate-100 rounded-[24px] sm:rounded-[32px] p-5 sm:p-8 min-h-[140px] focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-700 outline-none font-medium text-sm sm:text-base leading-relaxed"
                                    placeholder="Execute professional summary initialization..."
                                    value={formData.summary}
                                    onChange={(e) => handleInput('summary', null, e.target.value)}
                                />
                            </section>
                        </motion.div>
                    )}

                    {/* Step 2: Experience */}
                    {step === 2 && (
                        <motion.div 
                            key="step2"
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            className="max-w-3xl mx-auto space-y-6 sm:space-y-8"
                        >
                            <div className="flex items-center justify-between mb-4 sm:mb-8">
                                <div>
                                    <h3 className="text-xl sm:text-3xl font-[900] text-slate-900 tracking-tighter">History Log</h3>
                                    <p className="text-[10px] sm:text-xs text-slate-400 font-black uppercase tracking-widest mt-1 opacity-60">Career sequence data</p>
                                </div>
                                <button 
                                    onClick={() => addListItem('experience', { company: '', role: '', period: '', description: '' })}
                                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2.5 rounded-xl transition-all active:scale-95 border border-blue-100"
                                >
                                    <Plus size={14} /> Add Segment
                                </button>
                            </div>
                            {formData.experience.map((exp, i) => (
                                <div key={i} className="bg-slate-50/50 p-6 sm:p-8 rounded-[32px] sm:rounded-[40px] border border-slate-100 relative group transition-all hover:bg-white hover:shadow-2xl hover:shadow-slate-100">
                                    <button 
                                        onClick={() => removeListItem('experience', i)}
                                        className="absolute top-6 right-6 p-2 text-rose-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
                                        <InputField label="Organization" value={exp.company} onChange={(v) => handleInput('experience', 'company', v, i)} placeholder="Organization Name" />
                                        <InputField label="Function" value={exp.role} onChange={(v) => handleInput('experience', 'role', v, i)} placeholder="Role Title" />
                                        <InputField label="Duration" value={exp.period} onChange={(v) => handleInput('experience', 'period', v, i)} placeholder="Time Period" />
                                    </div>
                                    <textarea 
                                        className="w-full bg-white border border-slate-100 rounded-2xl p-5 min-h-[120px] outline-none text-sm font-medium leading-relaxed focus:ring-4 focus:ring-slate-100 transition-all"
                                        placeholder="Outline operational impact... AI will optimize these parameters."
                                        value={exp.description}
                                        onChange={(e) => handleInput('experience', 'description', e.target.value, i)}
                                    />
                                </div>
                            ))}
                        </motion.div>
                    )}

                    {/* Step 3: Education */}
                    {step === 3 && (
                        <motion.div 
                            key="step3"
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            className="max-w-3xl mx-auto space-y-6 sm:space-y-8"
                        >
                            <div className="flex items-center justify-between mb-4 sm:mb-8">
                                <div>
                                    <h3 className="text-xl sm:text-3xl font-[900] text-slate-900 tracking-tighter">Logic Core</h3>
                                    <p className="text-[10px] sm:text-xs text-slate-400 font-black uppercase tracking-widest mt-1 opacity-60">Academic infrastructure</p>
                                </div>
                                <button 
                                    onClick={() => addListItem('education', { school: '', degree: '', year: '' })}
                                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2.5 rounded-xl transition-all active:scale-95 border border-blue-100"
                                >
                                    <Plus size={14} /> Add Node
                                </button>
                            </div>
                            {formData.education.map((edu, i) => (
                                <div key={i} className="bg-slate-50/50 p-6 sm:p-8 rounded-[32px] sm:rounded-[40px] border border-slate-100 relative group flex flex-col gap-4 sm:gap-6 hover:bg-white hover:shadow-2xl hover:shadow-slate-100 transition-all">
                                    <button onClick={() => removeListItem('education', i)} className="absolute top-6 right-6 p-2 text-rose-300 hover:text-rose-600 transition-all"><Trash2 size={16} /></button>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                        <InputField label="Institution" value={edu.school} onChange={(v) => handleInput('education', 'school', v, i)} placeholder="University Name" />
                                        <InputField label="Certification" value={edu.degree} onChange={(v) => handleInput('education', 'degree', v, i)} placeholder="Degree Achieved" />
                                        <InputField label="Cycle" value={edu.year} onChange={(v) => handleInput('education', 'year', v, i)} placeholder="Year Range" />
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    )}

                    {/* Step 4: Skills & Projects */}
                    {step === 4 && (
                        <motion.div 
                            key="step4"
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            className="max-w-3xl mx-auto space-y-10 sm:space-y-16"
                        >
                            <section>
                                <div className="mb-6 sm:mb-8">
                                    <h3 className="text-xl sm:text-3xl font-[900] text-slate-900 tracking-tighter">Skill Vectors</h3>
                                    <p className="text-[10px] sm:text-xs text-slate-400 font-black uppercase tracking-widest mt-1 opacity-60">Competency mapping</p>
                                </div>
                                <div className="space-y-4 sm:space-y-6">
                                    <InputField label="Technical Stack" value={formData.skills.technical} onChange={(v) => handleInput('skills', 'technical', v)} placeholder="React, Python, Node, etc." />
                                    <InputField label="Neural/Soft Skills" value={formData.skills.soft} onChange={(v) => handleInput('skills', 'soft', v)} placeholder="Leadership, Agile, etc." />
                                    <InputField label="Operational Tools" value={formData.skills.tools} onChange={(v) => handleInput('skills', 'tools', v)} placeholder="Figma, Docker, JIRA, etc." />
                                </div>
                            </section>

                            <section>
                                <div className="flex items-center justify-between mb-6 sm:mb-8">
                                    <div>
                                        <h3 className="text-xl sm:text-3xl font-[900] text-slate-900 tracking-tighter">Innovation Lab</h3>
                                        <p className="text-[10px] sm:text-xs text-slate-400 font-black uppercase tracking-widest mt-1 opacity-60">Verified proof-of-work</p>
                                    </div>
                                    <button onClick={() => addListItem('projects', { name: '', description: '', link: '' })} className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-4 py-2 rounded-xl border border-blue-100">Add Artifact</button>
                                </div>
                                {formData.projects.map((proj, i) => (
                                    <div key={i} className="bg-slate-50/50 p-6 sm:p-8 rounded-[32px] sm:rounded-[40px] border border-slate-100 mb-6 group relative hover:bg-white hover:shadow-2xl hover:shadow-slate-100 transition-all">
                                        <button onClick={() => removeListItem('projects', i)} className="absolute top-6 right-6 text-rose-300 hover:text-rose-600 transition-all"><Trash2 size={16} /></button>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
                                            <InputField label="Project Identifier" value={proj.name} onChange={(v) => handleInput('projects', 'name', v, i)} placeholder="Project Name" />
                                            <InputField label="Source Vector" value={proj.link} onChange={(v) => handleInput('projects', 'link', v, i)} placeholder="Access Link" />
                                        </div>
                                        <textarea 
                                            className="w-full bg-white border border-slate-100 rounded-2xl p-5 min-h-[100px] outline-none text-sm font-medium leading-relaxed focus:ring-4 focus:ring-slate-100 transition-all"
                                            placeholder="Specify technical complexity..."
                                            value={proj.description}
                                            onChange={(e) => handleInput('projects', 'description', e.target.value, i)}
                                        />
                                    </div>
                                ))}
                            </section>
                        </motion.div>
                    )}

                    {/* Step 5: Final Preview */}
                    {step === 5 && generatedResume && (
                        <motion.div 
                            key="step5"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="max-w-4xl mx-auto pb-20"
                        >
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-10 sm:mb-12">
                                <div>
                                    <h3 className="text-2xl sm:text-4xl font-[900] text-slate-900 tracking-tighter text-center sm:text-left">Final Artifact.</h3>
                                    <p className="text-[10px] sm:text-xs text-slate-400 font-black uppercase tracking-[0.2em] mt-2 text-center sm:text-left">AI Optimzed for ATS Sequences</p>
                                </div>
                                <button 
                                    onClick={downloadPDF}
                                    className="w-full sm:w-auto flex items-center justify-center gap-3 bg-slate-900 text-white px-8 py-4.5 rounded-[22px] font-black text-[10px] sm:text-xs uppercase tracking-widest shadow-2xl shadow-slate-200 hover:bg-blue-600 transition-all active:scale-95"
                                >
                                    <Download size={18} /> Export PDF Artifact
                                </button>
                            </div>

                            {/* Resume Paper Template */}
                            <div className="overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
                                <div id="resume-pdf-content" className="bg-white shadow-2xl border border-slate-100 p-8 sm:p-16 min-h-[1100px] text-slate-800 font-serif leading-relaxed w-[800px] sm:w-full mx-auto origin-top transition-transform">
                                    <header className="text-center mb-12 border-b-2 border-slate-900 pb-10">
                                        <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-[0.1em] mb-6 text-slate-900">{formData.personalInfo.name}</h1>
                                        <div className="flex flex-wrap justify-center gap-6 text-[11px] sm:text-xs text-slate-500 font-bold uppercase tracking-widest">
                                            <div className="flex items-center gap-2"><Mail size={14} className="text-blue-500"/> {formData.personalInfo.email}</div>
                                            <div className="flex items-center gap-2"><Phone size={14} className="text-blue-500"/> {formData.personalInfo.phone}</div>
                                            {formData.personalInfo.linkedin && <div className="flex items-center gap-2"><Globe size={14} className="text-blue-500"/> Profile Vector</div>}
                                        </div>
                                    </header>

                                    <section className="mb-10">
                                        <h2 className="text-sm font-black uppercase border-b border-slate-200 mb-4 pb-1 tracking-[0.2em] text-slate-400">Professional Summary</h2>
                                        <p className="text-sm sm:text-base text-slate-700 italic leading-relaxed">{generatedResume.summary}</p>
                                    </section>

                                    <section className="mb-10">
                                        <h2 className="text-sm font-black uppercase border-b border-slate-200 mb-6 pb-1 tracking-[0.2em] text-slate-400">Career Trajectory</h2>
                                        {generatedResume.experience.map((exp, i) => (
                                            <div key={i} className="mb-8">
                                                <div className="flex justify-between items-baseline mb-2">
                                                    <h3 className="font-black text-slate-900 text-base sm:text-lg tracking-tight">{exp.company}</h3>
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{exp.period}</span>
                                                </div>
                                                <p className="text-xs sm:text-sm font-bold text-blue-600 mb-3 uppercase tracking-widest">{exp.role}</p>
                                                <ul className="space-y-2">
                                                    {exp.points.map((p, pi) => (
                                                        <li key={pi} className="text-sm text-slate-600 pl-5 relative before:content-[''] before:absolute before:left-0 before:top-[0.6em] before:w-1.5 before:h-1.5 before:bg-slate-200 before:rounded-full">{p}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </section>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
                                        <div className="sm:col-span-2">
                                            <section className="mb-10">
                                                <h2 className="text-sm font-black uppercase border-b border-slate-200 mb-6 pb-1 tracking-[0.2em] text-slate-400">Key Projects</h2>
                                                {generatedResume.projects.map((p, i) => (
                                                    <div key={i} className="mb-6">
                                                        <h3 className="font-black text-slate-900 text-sm mb-1">{p.name}</h3>
                                                        <p className="text-xs text-slate-500 leading-relaxed font-medium">{p.description}</p>
                                                    </div>
                                                ))}
                                            </section>
                                            <section>
                                                <h2 className="text-sm font-black uppercase border-b border-slate-200 mb-6 pb-1 tracking-[0.2em] text-slate-400">Education</h2>
                                                {formData.education.map((edu, i) => (
                                                    <div key={i} className="mb-4">
                                                        <p className="text-sm font-black text-slate-900 tracking-tight">{edu.degree}</p>
                                                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-0.5">{edu.school} • {edu.year}</p>
                                                    </div>
                                                ))}
                                            </section>
                                        </div>
                                        <div className="sm:col-span-1">
                                            <section>
                                                <h2 className="text-sm font-black uppercase border-b border-slate-200 mb-6 pb-1 tracking-[0.2em] text-slate-400">Intelligence</h2>
                                                <div className="space-y-6">
                                                    <div>
                                                        <h4 className="text-[10px] font-black uppercase text-blue-500 mb-2 tracking-widest">Stack</h4>
                                                        <p className="text-xs font-bold text-slate-700 leading-loose">{generatedResume.skills.technical.join(', ')}</p>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-[10px] font-black uppercase text-blue-500 mb-2 tracking-widest">Ops</h4>
                                                        <p className="text-xs font-bold text-slate-700 leading-loose">{generatedResume.skills.tools.join(', ')}</p>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-[10px] font-black uppercase text-blue-500 mb-2 tracking-widest">Neural</h4>
                                                        <p className="text-xs font-bold text-slate-700 leading-loose">{generatedResume.skills.soft.join(', ')}</p>
                                                    </div>
                                                </div>
                                            </section>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Footer Navigation */}
            <div className="px-4 sm:px-10 py-5 sm:py-8 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 backdrop-blur-sm">
                {step > 1 && step < 5 ? (
                    <button onClick={() => setStep(step - 1)} className="flex items-center gap-2 text-slate-400 font-black text-[10px] sm:text-xs uppercase tracking-widest hover:text-slate-900 transition-all active:scale-95">
                        <ArrowLeft size={16} /> Back
                    </button>
                ) : <div />}

                {step < 5 ? (
                    <button 
                        onClick={() => step === 4 ? handleGenerate() : setStep(step + 1)}
                        disabled={loading}
                        className={`flex items-center gap-2 px-6 sm:px-10 py-3.5 sm:py-4.5 rounded-[22px] font-black text-[10px] sm:text-xs uppercase tracking-widest shadow-2xl transition-all ${
                            loading ? 'bg-slate-100 text-slate-300' : 'bg-slate-900 text-white hover:bg-blue-600 active:scale-95 shadow-slate-200'
                        }`}
                    >
                        {loading ? (
                            <><RefreshCw className="animate-spin" size={16} /> Architecting Future...</>
                        ) : step === 4 ? (
                            <><Sparkles size={16} /> Build Artifact</>
                        ) : (
                            <>Advance <ArrowRight size={16} /></>
                        )}
                    </button>
                ) : (
                    <button onClick={() => setStep(1)} className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-xl transition-all">Re-initialize Logic</button>
                )}
            </div>
        </div>
    )
}

function InputField({ label, value, onChange, placeholder, type = "text" }) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
            <input 
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-white border border-slate-100 rounded-2xl px-5 py-3.5 focus:ring-4 focus:ring-slate-100 focus:border-slate-300 outline-none text-slate-700 font-bold text-sm transition-all shadow-sm"
            />
        </div>
    )
}
export default ResumeMaker
