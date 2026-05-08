import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";
import { buildStyles, CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ChevronRight } from 'lucide-react';

function Step3Report({ report }) {
  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">Loading Report...</p>
      </div>
    );
  }
  const navigate = useNavigate()
  const {
    finalScore = 0,
    confidence = 0,
    communication = 0,
    correctness = 0,
    questionWiseScore = [],
  } = report;

  const questionScoreData = questionWiseScore.map((score, index) => ({
    name: `Q${index + 1}`,
    score: score.score || 0
  }))

  const skills = [
    { label: "Confidence", value: confidence },
    { label: "Communication", value: communication },
    { label: "Correctness", value: correctness },
  ];

  let performanceText = "";
  let shortTagline = "";

  if (finalScore >= 8) {
    performanceText = "Ready for job opportunities.";
    shortTagline = "Excellent clarity and structured responses.";
  } else if (finalScore >= 5) {
    performanceText = "Needs minor improvement before interviews.";
    shortTagline = "Good foundation, refine articulation.";
  } else {
    performanceText = "Significant improvement required.";
    shortTagline = "Work on clarity and confidence.";
  }

  const score = finalScore;
  const percentage = (score / 10) * 100;


  const downloadPDF = () => {
  const doc = new jsPDF("p", "mm", "a4");

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  let currentY = 25;

  // ================= TITLE =================
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(34, 197, 94);
  doc.text("AI Interview Performance Report", pageWidth / 2, currentY, {
    align: "center",
  });

  currentY += 5;

  // underline
  doc.setDrawColor(34, 197, 94);
  doc.line(margin, currentY + 2, pageWidth - margin, currentY + 2);

  currentY += 15;

  // ================= FINAL SCORE BOX =================
  doc.setFillColor(240, 253, 244);
  doc.roundedRect(margin, currentY, contentWidth, 20, 4, 4, "F");

  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text(
    `Final Score: ${finalScore}/10`,
    pageWidth / 2,
    currentY + 12,
    { align: "center" }
  );

  currentY += 30;

  // ================= SKILLS BOX =================
  doc.setFillColor(249, 250, 251);
  doc.roundedRect(margin, currentY, contentWidth, 30, 4, 4, "F");

  doc.setFontSize(12);

  doc.text(`Confidence: ${confidence}`, margin + 10, currentY + 10);
  doc.text(`Communication: ${communication}`, margin + 10, currentY + 18);
  doc.text(`Correctness: ${correctness}`, margin + 10, currentY + 26);

  currentY += 45;

  // ================= ADVICE =================
  let advice = "";

  if (finalScore >= 8) {
    advice =
      "Excellent performance. Maintain confidence and structure. Continue refining clarity and supporting answers with strong real-world examples.";
  } else if (finalScore >= 5) {
    advice =
      "Good foundation shown. Improve clarity and structure. Practice delivering concise, confident answers with stronger supporting examples.";
  } else {
    advice =
      "Significant improvement required. Focus on structured thinking, clarity, and confident delivery. Practice answering aloud regularly.";
  }

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(220);
  doc.roundedRect(margin, currentY, contentWidth, 35, 4, 4);

  doc.setFont("helvetica", "bold");
  doc.text("Professional Advice", margin + 10, currentY + 10);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);

  const splitAdvice = doc.splitTextToSize(advice, contentWidth - 20);
  doc.text(splitAdvice, margin + 10, currentY + 20);

  currentY += 50;

  // ================= QUESTION TABLE =================
  autoTable(doc, {
  startY: currentY,
  margin: { left: margin, right: margin },
  head: [["#", "Question", "Score", "Feedback"]],
  body: questionWiseScore.map((q, i) => [
    `${i + 1}`,
    q.question,
    `${q.score}/10`,
    q.feedback,
  ]),
  styles: {
    fontSize: 9,
    cellPadding: 5,
    valign: "top",
  },
  headStyles: {
    fillColor: [34, 197, 94],
    textColor: 255,
    halign: "center",
  },
  columnStyles: {
    0: { cellWidth: 10, halign: "center" }, // index
    1: { cellWidth: 55 }, // question
    2: { cellWidth: 20, halign: "center" }, // score
    3: { cellWidth: "auto" }, // feedback
  },
  alternateRowStyles: {
    fillColor: [249, 250, 251],
  },
});


  doc.save("AI_Interview_Report.pdf");
};

  return (
    <div className="max-w-6xl mx-auto pb-12">
      {/* Header section with score overview */}
      <div className="flex flex-col gap-6 mb-10 px-1">
        <div className="text-center sm:text-left">
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 text-blue-600 font-bold text-[9px] uppercase tracking-widest mb-2"
          >
            <Sparkles size={12} />
            Diagnostic Report
          </motion.div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-2">
            Interview Analytics
          </h1>
          <p className="text-slate-500 font-medium text-xs leading-relaxed max-w-sm mx-auto sm:mx-0">
            Synthesized professional diagnostics and performance artifacts.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button 
            onClick={() => navigate("/history")} 
            className="w-full sm:w-auto px-6 py-4 bg-white border border-slate-200 rounded-2xl text-slate-600 text-[10px] font-bold uppercase tracking-widest hover:border-blue-600 transition-all flex items-center justify-center gap-2"
          >
            <ChevronRight className="rotate-180" size={14} />
            Sequence History
          </button>
          <button 
            onClick={downloadPDF} 
            className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10"
          >
            Export Artifact (PDF)
          </button>
        </div>
      </div>


      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Sidebar Analytics */}
        <div className='space-y-6'>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-500" />
            <h3 className="text-slate-400 mb-8 text-[9px] font-bold uppercase tracking-widest">
              Overall Performance
            </h3>
            <div className='relative w-32 h-32 mx-auto mb-6'>
              <CircularProgressbar
                value={percentage}
                text={`${score}/10`}
                styles={buildStyles({
                  textSize: "20px",
                  pathColor: "#10b981",
                  textColor: "#0F172A",
                  trailColor: "#f1f5f9",
                  strokeLinecap: 'round'
                })}
              />
            </div>
            <div className="space-y-1">
              <p className="font-extrabold text-slate-900 text-base tracking-tight">
                {performanceText}
              </p>
              <p className="text-slate-500 text-[11px] font-medium leading-relaxed">
                {shortTagline}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className='bg-white rounded-3xl border border-slate-100 shadow-sm p-8'>
            <h3 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-8">
              Skill Diagnostics
            </h3>
            <div className='space-y-6'>
              {skills.map((s, i) => (
                <div key={i}>
                  <div className='flex justify-between mb-3 items-end'>
                    <span className='text-[10px] font-bold text-slate-900 uppercase tracking-tight'>{s.label}</span>
                    <span className='text-sm font-black text-emerald-600'>{s.value}<span className='text-[10px] text-slate-400 ml-0.5'>/10</span></span>
                  </div>
                  <div className='bg-slate-50 h-2.5 rounded-full overflow-hidden border border-slate-100'>
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${s.value * 10}%` }}
                      transition={{ duration: 1, delay: 0.3 }}
                      className='bg-emerald-500 h-full rounded-full'
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Main Content Analytics */}
        <div className='lg:col-span-2 space-y-6'>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className='bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 relative overflow-hidden'>
            <h3 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-10 px-1">
              Performance Matrix
            </h3>
            <div className='h-[280px] w-full'>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={questionScoreData}>
                  <defs>
                    <linearGradient id="colorReport" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} dy={10} />
                  <YAxis hide domain={[0, 10]} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: '700' }} />
                  <Area type="monotone" dataKey="score" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorReport)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className='bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8'>
            <h3 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-10 px-1">
              Neural Sequence Breakdown
            </h3>
            <div className='space-y-6'>
              {questionWiseScore.map((q, i) => (
                <div key={i} className="relative group">
                  <div className="flex items-start gap-4 mb-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 font-bold text-slate-400 text-[10px]">
                      {i + 1}
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="text-xs font-extrabold text-slate-900 leading-relaxed mb-3">
                        {q.question || "Artifact missing"}
                      </p>
                      <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg font-black text-[10px] uppercase tracking-widest border border-emerald-100">
                        Score: {q.score ?? 0}/10
                      </div>
                    </div>
                  </div>
                  <div className='bg-slate-50 border border-slate-100 p-5 rounded-2xl relative overflow-hidden'>
                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-400/30" />
                    <p className='text-[8px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-2'>
                      AI Diagnostic Synthesis
                    </p>
                    <p className='text-[11px] text-slate-600 leading-relaxed font-medium'>
                      {q.feedback && q.feedback.trim() !== "" ? q.feedback : "Synthesis pending for this artifact."}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
      </div>
    </div>
  </div>
  )
}

export default Step3Report
