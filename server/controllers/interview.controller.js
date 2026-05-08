import fs from "fs"
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { askAi } from "../services/openRouter.service.js";
import User from "../models/user.model.js";
import Interview from "../models/interview.model.js";
import Assessment from "../models/assessment.model.js";
import Roadmap from "../models/roadmap.model.js";
import UserTask from "../models/task.model.js";

export const analyzeResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Resume required" });
    }
    const filepath = req.file.path

    const fileBuffer = await fs.promises.readFile(filepath)
    const uint8Array = new Uint8Array(fileBuffer)

    const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;

    let resumeText = "";

    // Extract text from all pages
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();

      const pageText = content.items.map(item => item.str).join(" ");
      resumeText += pageText + "\n";
    }


    resumeText = resumeText
      .replace(/\s+/g, " ")
      .trim();

    const messages = [
      {
        role: "system",
        content: `
Extract structured data from resume.

Return strictly JSON:

{
  "role": "string",
  "experience": "string",
  "projects": ["project1", "project2"],
  "skills": ["skill1", "skill2"]
}
`
      },
      {
        role: "user",
        content: resumeText
      }
    ];


    const aiResponse = await askAi(messages)

    const parsed = JSON.parse(aiResponse);

    fs.unlinkSync(filepath)


    res.json({
      role: parsed.role,
      experience: parsed.experience,
      projects: parsed.projects,
      skills: parsed.skills,
      resumeText
    });

  } catch (error) {
    console.error(error);

    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.status(500).json({ message: error.message });
  }
};


export const generateQuestion = async (req, res) => {
  try {
    let { role, experience, mode, resumeText, projects, skills } = req.body

    role = role?.trim();
    experience = experience?.trim();
    mode = mode?.trim();

    if (!role || !experience || !mode) {
      return res.status(400).json({ message: "Role, Experience and Mode are required." })
    }

    // ATOMIC CREDIT CHECK AND DEDUCTION (1 Hit)
    const user = await User.findOneAndUpdate(
      { _id: req.userId, credits: { $gte: 50 } },
      { $inc: { credits: -50 } },
      { new: true }
    );

    if (!user) {
      return res.status(400).json({
        message: "Insufficient credits or user not found. Minimum 50 required."
      });
    }

    const projectText = Array.isArray(projects) && projects.length
      ? projects.join(", ")
      : "None";

    const skillsText = Array.isArray(skills) && skills.length
      ? skills.join(", ")
      : "None";

    const safeResume = resumeText?.trim() || "None";

    const userPrompt = `
    Role:${role}
    Experience:${experience}
    InterviewMode:${mode}
    Projects:${projectText}
    Skills:${skillsText},
    Resume:${safeResume}
    `;

    if (!userPrompt.trim()) {
      return res.status(400).json({
        message: "Prompt content is empty."
      });
    }

    const messages = [

      {
        role: "system",
        content: `
You are a real human interviewer conducting a professional interview.

Speak in simple, natural English as if you are directly talking to the candidate.

Generate exactly 5 interview questions.

Strict Rules:
- Each question must contain between 15 and 25 words.
- Each question must be a single complete sentence.
- Do NOT number them.
- Do NOT add explanations.
- Do NOT add extra text before or after.
- One question per line only.
- Keep language simple and conversational.
- Questions must feel practical and realistic.

Difficulty progression:
Question 1 → easy  
Question 2 → easy  
Question 3 → medium  
Question 4 → medium  
Question 5 → hard  

Make questions based on the candidate’s role, experience,interviewMode, projects, skills, and resume details.
`
      }
      ,
      {
        role: "user",
        content: userPrompt
      }
    ];


    const aiResponse = await askAi(messages)

    if (!aiResponse || !aiResponse.trim()) {
           
      return res.status(500).json({
        message: "AI returned empty response."
      });

    }

    const questionsArray = aiResponse
      .split("\n")
      .map(q => q.trim())
      .filter(q => q.length > 0)
      .slice(0, 5);

    if (questionsArray.length === 0) {
      
      return res.status(500).json({
        message: "AI failed to generate questions."
      });
    }

    // Credits already deducted atomically above

    const interview = await Interview.create({
      userId: user._id,
      role,
      experience,
      mode,
      resumeText: safeResume,
      questions: questionsArray.map((q, index) => ({
        question: q,
        difficulty: ["easy", "easy", "medium", "medium", "hard"][index],
        timeLimit: [60, 60, 90, 90, 120][index],
      }))
    })

    res.json({
      interviewId: interview._id,
      creditsLeft: user.credits,
      userName: user.name,
      questions: interview.questions
    });
  } catch (error) {
    return res.status(500).json({message:`failed to create interview ${error}`})
  }
}


export const submitAnswer = async (req, res) => {
  try {
    const { interviewId, questionIndex, answer, timeTaken } = req.body

    const interview = await Interview.findById(interviewId)
    const question = interview.questions[questionIndex]

    // If no answer
    if (!answer) {
      question.score = 0;
      question.feedback = "You did not submit an answer.";
      question.answer = "";

      await interview.save();

      return res.json({
        feedback: question.feedback
      });
    }

    // If time exceeded
    if (timeTaken > question.timeLimit) {
      question.score = 0;
      question.feedback = "Time limit exceeded. Answer not evaluated.";
      question.answer = answer;

      await interview.save();

      return res.json({
        feedback: question.feedback
      });
    }


    const messages = [
      {
        role: "system",
        content: `
You are a professional human interviewer evaluating a candidate's answer in a real interview.

Evaluate naturally and fairly, like a real person would.

Score the answer in these areas (0 to 10):

1. Confidence – Does the answer sound clear, confident, and well-presented?
2. Communication – Is the language simple, clear, and easy to understand?
3. Correctness – Is the answer accurate, relevant, and complete?

Rules:
- Be realistic and unbiased.
- Do not give random high scores.
- If the answer is weak, score low.
- If the answer is strong and detailed, score high.
- Consider clarity, structure, and relevance.

Calculate:
finalScore = average of confidence, communication, and correctness (rounded to nearest whole number).

Feedback Rules:
- Write natural human feedback.
- 10 to 15 words only.
- Sound like real interview feedback.
- Can suggest improvement if needed.
- Do NOT repeat the question.
- Do NOT explain scoring.
- Keep tone professional and honest.

Return ONLY valid JSON in this format:

{
  "confidence": number,
  "communication": number,
  "correctness": number,
  "finalScore": number,
  "feedback": "short human feedback"
}
`
      }
      ,
      {
        role: "user",
        content: `
Question: ${question.question}
Answer: ${answer}
`
      }
    ];


    const aiResponse = await askAi(messages)


    const parsed = JSON.parse(aiResponse);

    question.answer = answer;
    question.confidence = parsed.confidence;
    question.communication = parsed.communication;
    question.correctness = parsed.correctness;
    question.score = parsed.finalScore;
    question.feedback = parsed.feedback;
    await interview.save();


    return res.status(200).json({feedback :parsed.feedback})
  } catch (error) {
    return res.status(500).json({message:`failed to submit answer ${error}`})

  }
}


export const finishInterview = async (req,res) => {
  try {
    const {interviewId} = req.body
    const interview = await Interview.findById(interviewId)
    if(!interview){
      return res.status(400).json({message:"failed to find Interview"})
    }

    const totalQuestions = interview.questions.length;

    let totalScore = 0;
    let totalConfidence = 0;
    let totalCommunication = 0;
    let totalCorrectness = 0;

    interview.questions.forEach((q) => {
      totalScore += q.score || 0;
      totalConfidence += q.confidence || 0;
      totalCommunication += q.communication || 0;
      totalCorrectness += q.correctness || 0;
    });

    const finalScore = totalQuestions
      ? totalScore / totalQuestions
      : 0;

    const avgConfidence = totalQuestions
      ? totalConfidence / totalQuestions
      : 0;

    const avgCommunication = totalQuestions
      ? totalCommunication / totalQuestions
      : 0;

    const avgCorrectness = totalQuestions
      ? totalCorrectness / totalQuestions
      : 0;

    interview.finalScore = finalScore;
    interview.status = "completed";

    await interview.save();

    return res.status(200).json({
       finalScore: Number(finalScore.toFixed(1)),
      confidence: Number(avgConfidence.toFixed(1)),
      communication: Number(avgCommunication.toFixed(1)),
      correctness: Number(avgCorrectness.toFixed(1)),
      questionWiseScore: interview.questions.map((q) => ({
        question: q.question,
        score: q.score || 0,
        feedback: q.feedback || "",
        confidence: q.confidence || 0,
        communication: q.communication || 0,
        correctness: q.correctness || 0,
      })),
    })
  } catch (error) {
    return res.status(500).json({message:`failed to finish Interview ${error}`})
  }
}


export const getMyInterviews = async (req,res) => {
  try {
    const interviews = await Interview.find({userId:req.userId})
    .sort({ createdAt: -1 })
    .select("role experience mode finalScore status createdAt");

    return res.status(200).json(interviews)

  } catch (error) {
     return res.status(500).json({message:`failed to find currentUser Interview ${error}`})
  }
}

export const getInterviewReport = async (req,res) => {
  try {
    const interview = await Interview.findById(req.params.id)

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }


    const totalQuestions = interview.questions.length;

    let totalConfidence = 0;
    let totalCommunication = 0;
    let totalCorrectness = 0;

    interview.questions.forEach((q) => {
      totalConfidence += q.confidence || 0;
      totalCommunication += q.communication || 0;
      totalCorrectness += q.correctness || 0;
    });
    const avgConfidence = totalQuestions
      ? totalConfidence / totalQuestions
      : 0;

    const avgCommunication = totalQuestions
      ? totalCommunication / totalQuestions
      : 0;

    const avgCorrectness = totalQuestions
      ? totalCorrectness / totalQuestions
      : 0;

       return res.json({
      finalScore: interview.finalScore,
      confidence: Number(avgConfidence.toFixed(1)),
      communication: Number(avgCommunication.toFixed(1)),
      correctness: Number(avgCorrectness.toFixed(1)),
      questionWiseScore: interview.questions
    });

  } catch (error) {
    return res.status(500).json({message:`failed to find currentUser Interview report ${error}`})
  }
}

export const getAnalytics = async (req, res) => {
  try {
    // PARALLEL DATA FETCHING (Reduced Response Time)
    const [user, interviews, assessments, roadmaps, allTasks] = await Promise.all([
      User.findById(req.userId),
      Interview.find({ userId: req.userId, status: "completed" }).sort({ createdAt: -1 }),
      Assessment.find({ userId: req.userId, status: "Completed" }).sort({ createdAt: -1 }),
      Roadmap.find({ userId: req.userId }),
      UserTask.find({ userId: req.userId })
    ]);

    // ============ 1. INTERVIEW STATS (REAL) ============
    const mocksTaken = interviews.length;
    const totalScore = interviews.reduce((acc, curr) => acc + (curr.finalScore || 0), 0);
    const avgScore = mocksTaken > 0 ? (totalScore / mocksTaken).toFixed(1) : 0;

    // Aggregate skill metrics (Confidence, Communication, Correctness)
    let totalConf = 0, totalComm = 0, totalCorr = 0, qCount = 0;
    interviews.forEach(interview => {
      interview.questions.forEach(q => {
        totalConf += q.confidence || 0;
        totalComm += q.communication || 0;
        totalCorr += q.correctness || 0;
        qCount++;
      });
    });
    const avgConf = qCount > 0 ? (totalConf / qCount) * 10 : 0;
    const avgComm = qCount > 0 ? (totalComm / qCount) * 10 : 0;
    const avgCorr = qCount > 0 ? (totalCorr / qCount) * 10 : 0;

    // ============ 2. REAL ATS SCORE ============
    // Check if user has a resume uploaded — if yes, we have a real ATS score from the last scan
    let atsScore = "N/A";
    if (user?.resumeText) {
      // Last ATS check is stored on user profile; we look at latest data
      atsScore = "Upload resume";
    }
    // We don't store the ATS score persistently yet, so show profile completeness instead
    // Calculate profile completeness as a proxy ATS readiness score
    let profilePoints = 0;
    if (user?.name) profilePoints += 10;
    if (user?.email) profilePoints += 10;
    if (user?.resumeText) profilePoints += 25;
    if (user?.skills?.length > 0) profilePoints += 15;
    if (user?.experience?.length > 0) profilePoints += 15;
    if (user?.education?.length > 0) profilePoints += 10;
    if (user?.profileBrief) profilePoints += 15;
    atsScore = `${profilePoints}%`;

    // ============ 3. ASSESSMENTS (REAL) ============
    const assessments = await Assessment.find({ userId: req.userId, status: "Completed" }).sort({ createdAt: -1 });
    const totalAssessments = assessments.length;
    const avgAssessmentScore = totalAssessments > 0
      ? Math.round(assessments.reduce((acc, a) => acc + ((a.score / a.totalQuestions) * 100), 0) / totalAssessments)
      : 0;

    // ============ 4. ROADMAP PROGRESS (REAL) ============
    const roadmaps = await Roadmap.find({ userId: req.userId });
    const activeRoadmaps = roadmaps.filter(r => r.status === "Active").length;
    const allTasks = await UserTask.find({ userId: req.userId });
    const completedTasks = allTasks.filter(t => t.status === "Completed").length;
    const totalTasks = allTasks.length;
    const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // ============ 5. REAL SKILLS COUNT ============
    const skillsCount = user?.skills?.length || 0;

    // ============ 6. RADAR DATA (REAL from interviews) ============
    const radarData = [
      { subject: 'Confidence', A: Math.round(avgConf), fullMark: 100 },
      { subject: 'Communication', A: Math.round(avgComm), fullMark: 100 },
      { subject: 'Technical', A: Math.round(avgCorr), fullMark: 100 },
      { subject: 'Assessment', A: avgAssessmentScore, fullMark: 100 },
      { subject: 'Task Progress', A: taskCompletionRate, fullMark: 100 },
    ];

    // ============ 7. RECENT ACTIVITY (REAL — merged from interviews + assessments) ============
    const recentInterviews = interviews.slice(0, 3).map(i => ({
      id: i._id,
      title: `${i.role} Interview (${i.mode})`,
      score: `${Math.round(i.finalScore)}/10`,
      time: new Date(i.createdAt).toLocaleDateString(),
      type: 'interview',
      status: i.finalScore > 7 ? 'Good' : 'Moderate'
    }));

    const recentAssessments = assessments.slice(0, 3).map(a => ({
      id: a._id,
      title: `Assessment: ${a.jobDesc?.slice(0, 40)}...`,
      score: `${a.score}/${a.totalQuestions}`,
      time: new Date(a.createdAt).toLocaleDateString(),
      type: 'assessment',
      status: a.feedback
    }));

    // Merge and sort by time
    const recentActivity = [...recentInterviews, ...recentAssessments]
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 5);

    // ============ 8. SCORE TREND (REAL — interview scores over time) ============
    const scoreTrend = interviews.slice().reverse().map(i => ({
      date: new Date(i.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: Math.round(i.finalScore * 10), // scale to 100
      role: i.role
    }));

    // ============ 9. PROFILE SUMMARY ============
    const profileSummary = {
      name: user?.name || "User",
      email: user?.email,
      resumeUploaded: !!user?.resumeText,
      resumeName: user?.resumeName || null,
      skills: user?.skills || [],
      profileBrief: user?.profileBrief || null,
      experienceCount: user?.experience?.length || 0,
      educationCount: user?.education?.length || 0,
      credits: user?.credits || 0
    };

    // ============ 10. NEURAL GUIDANCE (AI Advice) ============
    let profileGuidance = "Analyzing your profile for the perfect career sequence...";
    try {
      const guidancePrompt = `
      You are InterviewIQ's Neural Career Advisor. 
      Analyze the following user stats and profile to provide ONE high-impact, professional "Perfect Answer" for their next career move.
      
      STATS:
      - Mocks Taken: ${mocksTaken}
      - Avg Mock Score: ${avgScore}%
      - ATS Readiness: ${atsScore}
      - Skills Count: ${skillsCount}
      - Profile Completeness: ${profilePoints}%
      - Task Completion: ${taskCompletionRate}%
      
      USER CONTEXT:
      ${user?.profileBrief || "New user"}
      
      TASK:
      Generate a 2-sentence "Neural Guidance" that sounds extremely premium and fintech-aligned. 
      The first sentence should highlight a key strength or progress.
      The second sentence should give a specific, actionable "Perfect Step" (e.g., "Based on your Node.js expertise, your next sequence should focus on High-Level System Design mocks").
      
      TONE: Executive, precise, data-driven.
      `;
      
      const aiResponse = await askAi([
        { role: "system", content: "You are a professional career growth engine. Return ONLY the guidance text." },
        { role: "user", content: guidancePrompt }
      ]);
      profileGuidance = aiResponse?.trim() || profileGuidance;
    } catch (err) {
      console.error("Guidance Generation Error:", err);
    }

    res.json({
      stats: {
        mocksTaken,
        avgScore: `${avgScore}%`,
        skillsCount,
        atsScore,
        assessmentsTaken: totalAssessments,
        avgAssessmentScore: `${avgAssessmentScore}%`,
        activeRoadmaps,
        taskCompletionRate: `${taskCompletionRate}%`,
        completedTasks,
        totalTasks,
        profileCompleteness: profilePoints
      },
      radarData,
      recentActivity,
      scoreTrend,
      profileSummary,
      profileGuidance
    });
  } catch (error) {
    return res.status(500).json({ message: `failed to get analytics ${error}` });
  }
};
