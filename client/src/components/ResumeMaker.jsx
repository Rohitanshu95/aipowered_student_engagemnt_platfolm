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
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
                <div className="flex items-center gap-4 overflow-x-auto no-scrollbar">
                    {[
                        { id: 1, name: 'Personal', icon: User },
                        { id: 2, name: 'Experience', icon: Briefcase },
                        { id: 3, name: 'Education', icon: GraduationCap },
                        { id: 4, name: 'Skills & Projects', icon: Code2 },
                        { id: 5, name: 'Preview', icon: CheckCircle2 }
                    ].map((s) => (
                        <div key={s.id} className="flex items-center gap-2">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                step === s.id ? 'bg-blue-600 text-white shadow-lg' : 
                                step > s.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                            }`}>
                                {step > s.id ? <CheckCircle2 size={16} /> : s.id}
                            </div>
                            <span className={`text-sm font-medium whitespace-nowrap ${step >= s.id ? 'text-gray-900' : 'text-gray-400'}`}>
                                {s.name}
                            </span>
                            {s.id < 5 && <div className="h-px w-8 bg-gray-100 mx-2" />}
                        </div>
                    ))}
                </div>
            </div>

            <main className="flex-1 overflow-y-auto p-8 relative">
                <AnimatePresence mode="wait">
                    {/* Step 1: Personal Info */}
                    {step === 1 && (
                        <motion.div 
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="max-w-3xl mx-auto space-y-8"
                        >
                            <section>
                                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <User className="text-blue-500" /> Personal Identity
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InputField label="Full Name" value={formData.personalInfo.name} onChange={(v) => handleInput('personalInfo', 'name', v)} placeholder="John Doe" />
                                    <InputField label="Email Address" value={formData.personalInfo.email} onChange={(v) => handleInput('personalInfo', 'email', v)} placeholder="john@example.com" />
                                    <InputField label="Phone" value={formData.personalInfo.phone} onChange={(v) => handleInput('personalInfo', 'phone', v)} placeholder="+1 234 567 890" />
                                    <InputField label="LinkedIn" value={formData.personalInfo.linkedin} onChange={(v) => handleInput('personalInfo', 'linkedin', v)} placeholder="linkedin.com/in/johndoe" />
                                    <InputField label="GitHub" value={formData.personalInfo.github} onChange={(v) => handleInput('personalInfo', 'github', v)} placeholder="github.com/johndoe" />
                                    <InputField label="Portfolio" value={formData.personalInfo.website} onChange={(v) => handleInput('personalInfo', 'website', v)} placeholder="johndoe.com" />
                                </div>
                            </section>
                            <section>
                                <h3 className="text-xl font-bold text-gray-900 mb-4">Professional Summary</h3>
                                <textarea 
                                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 min-h-[120px] focus:ring-2 focus:ring-blue-500 transition-all text-gray-700 outline-none"
                                    placeholder="Briefly describe your career goals and key achievements..."
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
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                            className="max-w-3xl mx-auto space-y-6"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-gray-900">Work Experience</h3>
                                <button 
                                    onClick={() => addListItem('experience', { company: '', role: '', period: '', description: '' })}
                                    className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl transition"
                                >
                                    <Plus size={18} /> Add Role
                                </button>
                            </div>
                            {formData.experience.map((exp, i) => (
                                <div key={i} className="bg-gray-50 p-6 rounded-3xl border border-gray-100 relative group">
                                    <button 
                                        onClick={() => removeListItem('experience', i)}
                                        className="absolute top-4 right-4 p-2 text-rose-400 hover:bg-rose-50 rounded-lg opacity-0 group-hover:opacity-100 transition"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <InputField label="Company" value={exp.company} onChange={(v) => handleInput('experience', 'company', v, i)} placeholder="e.g. Google" />
                                        <InputField label="Role" value={exp.role} onChange={(v) => handleInput('experience', 'role', v, i)} placeholder="e.g. Frontend Engineer" />
                                        <InputField label="Period" value={exp.period} onChange={(v) => handleInput('experience', 'period', v, i)} placeholder="Jan 2022 - Present" />
                                    </div>
                                    <textarea 
                                        className="w-full bg-white border border-gray-200 rounded-xl p-4 min-h-[100px] outline-none text-sm"
                                        placeholder="Outline your impact (don't worry about formatting, AI will polish this)..."
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
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                            className="max-w-3xl mx-auto space-y-6"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-gray-900">Academic Background</h3>
                                <button 
                                    onClick={() => addListItem('education', { school: '', degree: '', year: '' })}
                                    className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl transition"
                                >
                                    <Plus size={18} /> Add School
                                </button>
                            </div>
                            {formData.education.map((edu, i) => (
                                <div key={i} className="bg-gray-50 p-6 rounded-3xl border border-gray-100 relative group flex flex-col gap-4">
                                    <button onClick={() => removeListItem('education', i)} className="absolute top-4 right-4 p-2 text-rose-400 opacity-0 group-hover:opacity-100 transition"><Trash2 size={18} /></button>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <InputField label="School/University" value={edu.school} onChange={(v) => handleInput('education', 'school', v, i)} placeholder="e.g. Stanford University" />
                                        <InputField label="Degree" value={edu.degree} onChange={(v) => handleInput('education', 'degree', v, i)} placeholder="Bachelor of Science" />
                                        <InputField label="Year" value={edu.year} onChange={(v) => handleInput('education', 'year', v, i)} placeholder="2020 - 2024" />
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    )}

                    {/* Step 4: Skills & Projects */}
                    {step === 4 && (
                        <motion.div 
                            key="step4"
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                            className="max-w-3xl mx-auto space-y-8"
                        >
                            <section>
                                <h3 className="text-xl font-bold text-gray-900 mb-6">Skills Mastery</h3>
                                <div className="space-y-4">
                                    <InputField label="Technical Skills" value={formData.skills.technical} onChange={(v) => handleInput('skills', 'technical', v)} placeholder="e.g. React, Node.js, Python, AWS" />
                                    <InputField label="Professional/Soft Skills" value={formData.skills.soft} onChange={(v) => handleInput('skills', 'soft', v)} placeholder="e.g. Agile, Leadership, Communication" />
                                    <InputField label="Tools" value={formData.skills.tools} onChange={(v) => handleInput('skills', 'tools', v)} placeholder="e.g. Figma, Docker, JIRA" />
                                </div>
                            </section>

                            <section>
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold text-gray-900">Featured Projects</h3>
                                    <button onClick={() => addListItem('projects', { name: '', description: '', link: '' })} className="text-blue-600 font-bold text-sm">Add Project</button>
                                </div>
                                {formData.projects.map((proj, i) => (
                                    <div key={i} className="bg-gray-50/50 p-6 rounded-3xl border border-gray-200/50 mb-4 group relative">
                                        <button onClick={() => removeListItem('projects', i)} className="absolute top-4 right-4 text-rose-400 opacity-0 group-hover:opacity-100 transition"><Trash2 size={18} /></button>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <InputField label="Project Name" value={proj.name} onChange={(v) => handleInput('projects', 'name', v, i)} placeholder="e.g. E-Commerce Platform" />
                                            <InputField label="Project Link" value={proj.link} onChange={(v) => handleInput('projects', 'link', v, i)} placeholder="e.g. github.com/..." />
                                        </div>
                                        <textarea 
                                            className="w-full bg-white border border-gray-200 rounded-xl p-4 min-h-[80px] outline-none text-sm"
                                            placeholder="Description..."
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
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="max-w-4xl mx-auto pb-20"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-2xl font-bold text-gray-900">Resume Preview</h3>
                                <button 
                                    onClick={downloadPDF}
                                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold shadow-xl shadow-blue-200 hover:bg-blue-700 transition"
                                >
                                    <Download size={18} /> Download PDF
                                </button>
                            </div>

                            {/* Resume Paper Template */}
                            <div id="resume-pdf-content" className="bg-white shadow-2xl border border-gray-200 p-12 min-h-[1100px] text-gray-800 font-serif leading-relaxed">
                                <header className="text-center mb-10 border-b-2 border-gray-900 pb-8">
                                    <h1 className="text-4xl font-bold uppercase tracking-widest mb-4">{formData.personalInfo.name}</h1>
                                    <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
                                        <div className="flex items-center gap-1"><Mail size={14}/> {formData.personalInfo.email}</div>
                                        <div className="flex items-center gap-1"><Phone size={14}/> {formData.personalInfo.phone}</div>
                                        {formData.personalInfo.linkedin && <div className="flex items-center gap-1"><Globe size={14}/> LinkedIn</div>}
                                        {formData.personalInfo.github && <div className="flex items-center gap-1"><Globe size={14}/> GitHub</div>}
                                    </div>
                                </header>

                                <section className="mb-8">
                                    <h2 className="text-lg font-bold uppercase border-b border-gray-300 mb-3 tracking-wider">Professional Profile</h2>
                                    <p className="text-sm italic">{generatedResume.summary}</p>
                                </section>

                                <section className="mb-8">
                                    <h2 className="text-lg font-bold uppercase border-b border-gray-300 mb-4 tracking-wider">Work Experience</h2>
                                    {generatedResume.experience.map((exp, i) => (
                                        <div key={i} className="mb-6">
                                            <div className="flex justify-between items-baseline mb-1">
                                                <h3 className="font-bold text-md">{exp.company}</h3>
                                                <span className="text-xs font-medium text-gray-500">{exp.period}</span>
                                            </div>
                                            <p className="text-sm font-semibold text-gray-700 mb-2 italic">{exp.role}</p>
                                            <ul className="list-disc list-inside space-y-1">
                                                {exp.points.map((p, pi) => (
                                                    <li key={pi} className="text-sm pl-4 -indent-4">{p}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </section>

                                <div className="grid grid-cols-3 gap-8">
                                    <div className="col-span-2">
                                        <section className="mb-8">
                                            <h2 className="text-lg font-bold uppercase border-b border-gray-300 mb-4 tracking-wider">Projects</h2>
                                            {generatedResume.projects.map((p, i) => (
                                                <div key={i} className="mb-4">
                                                    <h3 className="font-bold text-sm underline">{p.name}</h3>
                                                    <p className="text-xs text-gray-600">{p.description}</p>
                                                </div>
                                            ))}
                                        </section>
                                        <section>
                                            <h2 className="text-lg font-bold uppercase border-b border-gray-300 mb-4 tracking-wider">Education</h2>
                                            {formData.education.map((edu, i) => (
                                                <div key={i} className="mb-2">
                                                    <p className="text-sm font-bold">{edu.degree}</p>
                                                    <p className="text-xs">{edu.school} • {edu.year}</p>
                                                </div>
                                            ))}
                                        </section>
                                    </div>
                                    <div className="col-span-1">
                                        <section>
                                            <h2 className="text-lg font-bold uppercase border-b border-gray-300 mb-4 tracking-wider">Skills</h2>
                                            <div className="space-y-4">
                                                <div>
                                                    <h4 className="text-xs font-bold uppercase text-gray-500 mb-1">Technical</h4>
                                                    <p className="text-xs leading-loose">{generatedResume.skills.technical.join(', ')}</p>
                                                </div>
                                                <div>
                                                    <h4 className="text-xs font-bold uppercase text-gray-500 mb-1">Tools</h4>
                                                    <p className="text-xs leading-loose">{generatedResume.skills.tools.join(', ')}</p>
                                                </div>
                                                <div>
                                                    <h4 className="text-xs font-bold uppercase text-gray-500 mb-1">Soft Skills</h4>
                                                    <p className="text-xs leading-loose">{generatedResume.skills.soft.join(', ')}</p>
                                                </div>
                                            </div>
                                        </section>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Footer Navigation */}
            <div className="px-8 py-6 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
                {step > 1 && step < 5 ? (
                    <button onClick={() => setStep(step - 1)} className="flex items-center gap-2 text-gray-500 font-bold flex items-center gap-2 hover:text-gray-900 transition">
                        <ArrowLeft size={18} /> Back
                    </button>
                ) : <div />}

                {step < 5 ? (
                    <button 
                        onClick={() => step === 4 ? handleGenerate() : setStep(step + 1)}
                        disabled={loading}
                        className={`flex items-center gap-2 px-8 py-3 rounded-2xl font-bold shadow-xl transition-all ${
                            loading ? 'bg-gray-100 text-gray-400' : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-blue-200'
                        }`}
                    >
                        {loading ? (
                            <><RefreshCw className="animate-spin" size={18} /> Architecting Your Future...</>
                        ) : step === 4 ? (
                            <><ArrowRight size={18} /> Build My Resume</>
                        ) : (
                            <>Next Step <ArrowRight size={18} /></>
                        )}
                    </button>
                ) : (
                    <button onClick={() => setStep(1)} className="text-blue-600 font-bold hover:underline py-2">Edit Details</button>
                )}
            </div>
        </div>
    )
}

function InputField({ label, value, onChange, placeholder, type = "text" }) {
    return (
        <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase ml-1">{label}</label>
            <input 
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none text-gray-700 transition-all shadow-sm"
            />
        </div>
    )
}

export default ResumeMaker
