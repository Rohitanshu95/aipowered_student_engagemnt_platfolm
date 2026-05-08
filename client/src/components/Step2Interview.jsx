import React from 'react'
import maleVideo from "../assets/videos/male-ai.mp4"
import femaleVideo from "../assets/videos/female-ai.mp4"
import Timer from './Timer'
import { motion } from "motion/react"
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import { useState } from 'react'
import { useRef } from 'react'
import { useEffect } from 'react'
import axios from "axios"
import { ServerUrl } from '../App'
import { BsArrowRight } from 'react-icons/bs'

function Step2Interview({ interviewData, onFinish }) {
  const { interviewId, questions, userName } = interviewData;
  const [isIntroPhase, setIsIntroPhase] = useState(true);

  const [isMicOn, setIsMicOn] = useState(true);
  const recognitionRef = useRef(null);
  const [isAIPlaying, setIsAIPlaying] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [timeLeft, setTimeLeft] = useState(
    questions[0]?.timeLimit || 60
  );
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voiceGender, setVoiceGender] = useState("female");
  const [subtitle, setSubtitle] = useState("");


  const videoRef = useRef(null);

  const currentQuestion = questions[currentIndex];


  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return;

      // Try known female voices first
      const femaleVoice =
        voices.find(v =>
          v.name.toLowerCase().includes("zira") ||
          v.name.toLowerCase().includes("samantha") ||
          v.name.toLowerCase().includes("female")
        );

      if (femaleVoice) {
        setSelectedVoice(femaleVoice);
        setVoiceGender("female");
        return;
      }

      // Try known male voices
      const maleVoice =
        voices.find(v =>
          v.name.toLowerCase().includes("david") ||
          v.name.toLowerCase().includes("mark") ||
          v.name.toLowerCase().includes("male")
        );

      if (maleVoice) {
        setSelectedVoice(maleVoice);
        setVoiceGender("male");
        return;
      }

      // Fallback: first voice (assume female)
      setSelectedVoice(voices[0]);
      setVoiceGender("female");
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

  }, [])

  const videoSource = voiceGender === "male" ? maleVideo : femaleVideo;


  /* ---------------- SPEAK FUNCTION ---------------- */
  const speakText = (text) => {
    return new Promise((resolve) => {
      if (!window.speechSynthesis || !selectedVoice) {
        resolve();
        return;
      }

      window.speechSynthesis.cancel();

      // Add natural pauses after commas and periods
      const humanText = text
        .replace(/,/g, ", ... ")
        .replace(/\./g, ". ... ");

      const utterance = new SpeechSynthesisUtterance(humanText);

      utterance.voice = selectedVoice;

      // Human-like pacing
      utterance.rate = 0.92;     // slightly slower than normal
      utterance.pitch = 1.05;    // small warmth
      utterance.volume = 1;

      utterance.onstart = () => {
        setIsAIPlaying(true);
        stopMic()
        videoRef.current?.play();
      };


      utterance.onend = () => {
        videoRef.current?.pause();
        videoRef.current.currentTime = 0;
        setIsAIPlaying(false);



        if (isMicOn) {
          startMic();
        }
        setTimeout(() => {
          setSubtitle("");
          resolve();
        }, 300);
      };


      setSubtitle(text);

      window.speechSynthesis.speak(utterance);
    });
  };


  useEffect(() => {
    if (!selectedVoice) {
      return;
    }
    const runIntro = async () => {
      if (isIntroPhase) {
        await speakText(
          `Hi ${userName}, it's great to meet you today. I hope you're feeling confident and ready.`
        );

        await speakText(
          "I'll ask you a few questions. Just answer naturally, and take your time. Let's begin."
        );

        setIsIntroPhase(false)
      } else if (currentQuestion) {
        await new Promise(r => setTimeout(r, 800));

        // If last question (hard level)
        if (currentIndex === questions.length - 1) {
          await speakText("Alright, this one might be a bit more challenging.");
        }

        await speakText(currentQuestion.question);

        if (isMicOn) {
          startMic();
        }
      }

    }

    runIntro()


  }, [selectedVoice, isIntroPhase, currentIndex])



  useEffect(() => {
    if (isIntroPhase) return;
    if (!currentQuestion) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0;
        }
        return prev - 1

      })
    }, 1000);

    return () => clearInterval(timer)

  }, [isIntroPhase, currentIndex])

  useEffect(() => {
  if (!isIntroPhase && currentQuestion) {
    setTimeLeft(currentQuestion.timeLimit || 60);
  }
}, [currentIndex]);


  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) return;

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript =
        event.results[event.results.length - 1][0].transcript;

      setAnswer((prev) => prev + " " + transcript);
    };

    recognitionRef.current = recognition;

  }, []);


  const startMic = () => {
    if (recognitionRef.current && !isAIPlaying) {
      try {
        recognitionRef.current.start();
      } catch { }
    }
  };

  const stopMic = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };
  const toggleMic = () => {
    if (isMicOn) {
      stopMic();
    } else {
      startMic();
    }
    setIsMicOn(!isMicOn);
  };


  const submitAnswer = async () => {
    if (isSubmitting) return;
    stopMic()
    setIsSubmitting(true)

    try {
      const result = await axios.post(ServerUrl + "/api/interview/submit-answer", {
        interviewId,
        questionIndex: currentIndex,
        answer,
        timeTaken:
          currentQuestion.timeLimit - timeLeft,
      } , {withCredentials:true})

      setFeedback(result.data.feedback)
      speakText(result.data.feedback)
      setIsSubmitting(false)
    } catch (error) {
console.log(error)
setIsSubmitting(false)
    }
  }

  const handleNext =async () => {
    setAnswer("");
    setFeedback("");

    if (currentIndex + 1 >= questions.length) {
      finishInterview();
      return;
    }

    await speakText("Alright, let's move to the next question.");

    setCurrentIndex(currentIndex + 1);
    setTimeout(() => {
      if (isMicOn) startMic();
    }, 500);

   
  }

  const finishInterview = async () => {
    stopMic()
    setIsMicOn(false)
    try {
      const result = await axios.post(ServerUrl+ "/api/interview/finish" , { interviewId} , {withCredentials:true})

      console.log(result.data)
      onFinish(result.data)
    } catch (error) {
      console.log(error)
    }
  }


   useEffect(() => {
    if (isIntroPhase) return;
    if (!currentQuestion) return;

    if (timeLeft === 0 && !isSubmitting && !feedback) {
      submitAnswer()
    }
  }, [timeLeft]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current.abort();
      }

      window.speechSynthesis.cancel();
    };
  }, []);







  return (
    <div className='min-h-screen bg-slate-900 flex items-center justify-center p-0 lg:p-8 overflow-hidden font-sans'>
      <div className='w-full max-w-[1440px] h-full lg:h-[85vh] bg-slate-900/50 backdrop-blur-3xl rounded-none lg:rounded-[40px] border-none lg:border border-slate-800 flex flex-col lg:flex-row shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden relative'>
        
        {/* Background Glows */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-600/10 blur-[120px] rounded-full pointer-events-none" />

        {/* LEFT COLUMN: AI AVATAR (30%) */}
        <div className='w-full lg:w-[32%] bg-slate-900 flex flex-col border-r border-slate-800 relative group'>
          <div className='flex-1 relative overflow-hidden'>
            <video
              src={videoSource}
              key={videoSource}
              ref={videoRef}
              muted
              playsInline
              preload="auto"
              className="w-full h-full object-cover grayscale-[0.2] transition-all duration-700 group-hover:grayscale-0"
            />
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />
            
            {/* Status Indicator */}
            <div className="absolute top-8 left-8 flex items-center gap-3">
               <div className={`w-3 h-3 rounded-full ${isAIPlaying ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`} />
               <span className="text-white text-[10px] font-black uppercase tracking-[0.2em]">{isAIPlaying ? 'AI Speaking' : 'AI Listening'}</span>
            </div>
          </div>

          {/* Subtitles Area */}
          <div className="p-8 pb-12">
             <div className="min-h-[80px] bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
                <p className='text-slate-300 text-sm font-medium leading-relaxed italic'>
                  {subtitle || "The AI is processing the context of your resume..."}
                </p>
             </div>
          </div>
        </div>

        {/* MIDDLE COLUMN: QUESTION & INPUT (43%) */}
        <div className='flex-1 flex flex-col relative bg-slate-900/40'>
           {/* Top Bar */}
           <div className="p-8 pb-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <span className="text-white font-[900] text-lg tracking-tighter">Question {currentIndex + 1} / {questions.length}</span>
                 <div className="flex gap-2">
                    <span className="bg-orange-500/10 text-orange-500 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-orange-500/20">Medium</span>
                    <span className="bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-blue-500/20">System Design</span>
                 </div>
              </div>
              <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                 <Timer timeLeft={timeLeft} totalTime={currentQuestion?.timeLimit} isDark />
              </div>
           </div>

           {/* Question Text */}
           <div className="px-8 pb-12 pt-8 flex-1 flex flex-col">
              <div className="mb-12">
                 <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em] mb-4">Challenge</h3>
                 <p className="text-white text-2xl font-bold leading-tight tracking-tight">
                    {currentQuestion?.question || "Initializing your mock interview environment..."}
                 </p>
              </div>

              {/* Input Area */}
              <div className="flex-1 flex flex-col relative group">
                 <textarea
                   placeholder="Start typing your answer here..."
                   onChange={(e) => setAnswer(e.target.value)}
                   value={answer}
                   className="flex-1 bg-white/[0.03] p-8 rounded-[40px] resize-none outline-none border border-white/5 focus:border-white/20 focus:bg-white/[0.05] transition-all text-white text-lg font-medium leading-relaxed placeholder:text-slate-600 shadow-inner"
                 />
                 
                 {/* Voice Visualizer Mock (only if mic is on) */}
                 {isMicOn && !isAIPlaying && (
                    <div className="absolute bottom-8 left-8 flex gap-1 items-end h-8 overflow-hidden">
                       {[0.4, 0.7, 0.5, 0.9, 0.6, 0.3, 0.8].map((v, i) => (
                         <motion.div 
                           key={i}
                           animate={{ height: [`${v * 10}%`, `${v * 100}%`, `${v * 10}%`] }}
                           transition={{ duration: 0.5 + Math.random(), repeat: Infinity }}
                           className="w-1 bg-blue-500 rounded-full"
                         />
                       ))}
                    </div>
                 )}
              </div>
           </div>

           {/* Controls Bar */}
           <div className="p-8 pt-0 flex gap-4">
              <motion.button
                onClick={toggleMic}
                whileTap={{ scale: 0.9 }}
                className={`w-14 h-14 flex items-center justify-center rounded-2xl transition-all ${isMicOn ? 'bg-white/5 text-white border border-white/10' : 'bg-rose-500/20 text-rose-500 border border-rose-500/30'}`}>
                {isMicOn ? <FaMicrophone size={20} /> : <FaMicrophoneSlash size={20}/>}
              </motion.button>
              
              {!feedback ? (
                <motion.button
                  onClick={submitAnswer}
                  disabled={isSubmitting}
                  whileTap={{ scale: 0.98 }}
                  className='flex-1 bg-white text-slate-900 py-4 rounded-2xl shadow-xl shadow-white/5 hover:bg-slate-200 transition-all font-black text-xs uppercase tracking-widest disabled:bg-slate-800 disabled:text-slate-500'>
                  {isSubmitting ? "Processing Insights..." : "Evaluate Answer"}
                </motion.button>
              ) : (
                <motion.button
                  onClick={handleNext}
                  whileTap={{ scale: 0.98 }}
                  className='flex-1 bg-blue-600 text-white py-4 rounded-2xl shadow-xl shadow-blue-500/20 hover:bg-blue-500 transition-all font-black text-xs uppercase tracking-widest'>
                  Next Challenge
                </motion.button>
              )}
           </div>
        </div>

        {/* RIGHT COLUMN: LIVE FEEDBACK (25%) */}
        <div className='w-full lg:w-[25%] bg-slate-950/20 border-l border-slate-800 p-8 flex flex-col space-y-12'>
           <div className="flex items-center justify-between">
              <h3 className="text-white font-[900] text-sm uppercase tracking-widest">Live Feedback</h3>
              <div className="bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-tighter border border-emerald-500/20">Active</div>
           </div>

           {/* Real-time Meters Mockup */}
           <div className="space-y-10">
              {[
                { label: "Communication", value: 78, color: "bg-blue-500" },
                { label: "Technical Accuracy", value: 82, color: "bg-teal-500" },
                { label: "Confidence", value: 74, color: "bg-indigo-500" },
              ].map((meter) => (
                <div key={meter.label}>
                   <div className="flex justify-between items-end mb-3">
                      <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{meter.label}</span>
                      <span className="text-white font-black text-sm">{meter.value}%</span>
                   </div>
                   <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${meter.value}%` }}
                        className={`h-full ${meter.color} rounded-full`}
                      />
                   </div>
                </div>
              ))}

              <div className="pt-6 border-t border-white/5 mt-auto">
                 <div className="flex justify-between items-center mb-6">
                    <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Sentiment</span>
                    <span className="text-emerald-500 font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2">
                       Positive <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    </span>
                 </div>
              </div>
           </div>

           {/* Finish Button at bottom */}
           <div className="flex-1 flex flex-col justify-end">
              <button 
                onClick={finishInterview}
                className="w-full py-4 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all shadow-lg shadow-rose-900/10"
              >
                End Session
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}

export default Step2Interview
