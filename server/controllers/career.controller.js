import { askGeminiJSON } from "../services/gemini.service.js";
import * as pdfjs from "pdfjs-dist";
import fs from "fs";
import axios from "axios";
import * as cheerio from "cheerio";
import User from "../models/user.model.js";
import Roadmap from "../models/roadmap.model.js";
import UserTask from "../models/task.model.js";
import Interview from "../models/interview.model.js";
import Assessment from "../models/assessment.model.js";

/**
 * Extracts text from a PDF file on disk
 * @param {string} filePath 
 * @returns {Promise<string>}
 */
const extractTextFromPDF = async (filePath) => {
    const buffer = fs.readFileSync(filePath);
    const data = new Uint8Array(buffer);
    const pdf = await pdfjs.getDocument({ data }).promise;
    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(" ");
        fullText += pageText + " ";
    }
    return fullText;
};

/**
 * ATS Score Checker Logic
 */
export const checkATS = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No resume file uploaded." });
        }

        // 1. Extract text from the saved file
        const resumeText = await extractTextFromPDF(req.file.path);

        // 2. Update User Profile with the permanent resume data
        const resumeUrl = `/uploads/resumes/${req.file.filename}`;
        const resumeName = req.file.originalname;
        await User.findByIdAndUpdate(req.userId, { 
            resumeUrl,
            resumeText,
            resumeName
        });

        const prompt = `
        You are an expert Applicant Tracking System (ATS) and Senior Technical Recruiter.
        Analyze the following resume text and provide a detailed ATS score and feedback.

        RESUME TEXT:
        ${resumeText}

        RESPONSE FORMAT (Strict JSON):
        {
            "score": number (0-100),
            "summary": "Short 2 sentence summary of the profile",
            "strengths": ["list of 3-4 key strengths"],
            "weaknesses": ["list of 3-4 critical areas for improvement"],
            "recommendations": ["step-by-step actionable advice to increase score"],
            "missingKeywords": ["important tools/skills missing"]
        }
        `;

        const analysis = await askGeminiJSON(prompt);

        res.status(200).json({
            success: true,
            analysis,
            resumeUrl
        });
    } catch (error) {
        console.error("ATS Check Error:", error.message);
        res.status(500).json({ success: false, message: "Failed to analyze resume." });
    }
};

/**
 * Generate Detailed Career Roadmap (High-level + Daily Plan)
 */
export const getDetailedRoadmap = async (req, res) => {
    const { role, planType } = req.body;
    try {
        const user = await User.findById(req.userId);
        const prompt = `
        You are a Career Growth Architect. 
        Generate a comprehensive 12-WEEK (3 MONTH) roadmap for learning "${role}".
        The user's profile: ${user?.profileBrief || "Beginner"}.

        REQUIREMENTS:
        1. "syllabus": 12 Weeks of learning, grouped into 4 Phases (3 weeks per phase).
        2. "dailyPlan": 84 Granular daily tasks (12 Weeks * 7 Days). Each task MUST be highly specific and actionable.
           - Day 1-7: Fundamentals
           - Day 8-14: Advance Concepts... and so on.

        RESPONSE FORMAT (Strict JSON):
        {
            "role": "${role}",
            "syllabus": [
                { "title": "Phase 1: Week 1-3", "topics": ["topic 1", "topic 2"], "order": 1 }
            ],
            "dailyPlan": [
                { "title": "Week 1 - Day 1", "description": "Specific task", "duration": "2h", "week": 1, "day": 1 }
            ]
        }
        `;

        const roadmapData = await askGeminiJSON(prompt);
        
        // Save to Database
        const newRoadmap = new Roadmap({
            userId: req.userId,
            stackName: role,
            planType,
            syllabus: roadmapData.syllabus,
            dailyPlan: roadmapData.dailyPlan
        });
        await newRoadmap.save();

        // Auto-create UserTask entries for each day in the roadmap
        // ENSURE 84 DAYS (12 weeks * 7 days)
        const dailyPlan = roadmapData.dailyPlan || [];
        const tasksToCreate = [];
        
        for (let i = 0; i < 84; i++) {
            const dayData = dailyPlan[i];
            const weekNumber = Math.floor(i / 7) + 1;
            const dayInWeek = (i % 7) + 1;
            
            tasksToCreate.push({
                userId: req.userId,
                roadmapId: newRoadmap._id,
                title: dayData 
                    ? `[${role}] ${dayData.title}: ${dayData.description}`
                    : `[${role}] Week ${weekNumber} Day ${dayInWeek}: Review and Deep Dive`,
                date: new Date(Date.now() + i * 24 * 60 * 60 * 1000), 
                status: "Pending",
                source: "Roadmap",
                week: dayData?.week || weekNumber,
                day: dayData?.day || dayInWeek
            });
        }
        
        await UserTask.insertMany(tasksToCreate);

        res.status(200).json({ success: true, roadmap: newRoadmap });
    } catch (error) {
        console.error("Roadmap Error:", error);
        res.status(500).json({ success: false, message: "Failed to generate detailed roadmap." });
    }
};

/**
 * Generate Mock Exam (MCQs: Reasoning + Technical + Aptitude)
 */
/**
 * Generate 25-Question Assessment (Mixed Categories)
 */
export const generateAssessment = async (req, res) => {
    const { jobDesc } = req.body;
    try {
        const user = await User.findById(req.userId);
        const resumeContext = user?.resumeText || user?.profileBrief || "";

        const prompt = `
        You are a Recruitment Specialist. 
        Generate exactly 25 multiple-choice questions (MCQs) for a person preparing for the job described here: "${jobDesc}".
        Use this Resume Context for personalizing the technical questions: ${resumeContext}

        THE ASSESSMENT MUST BE CATEGORIZED AS FOLLOWS:
        - 10 Technical Questions (Based explicitly on the Job Description + Resume)
        - 5 Aptitude Questions
        - 5 Logical Reasoning Questions
        - 5 Ability/Behavioral Questions

        RESPONSE FORMAT (Strict JSON):
        {
            "title": "Interview Assessment: ${jobDesc}",
            "questions": [
                {
                    "question": "What is...",
                    "options": ["Option A", "Option B", "Option C", "Option D"],
                    "correctAnswer": "Option A",
                    "explanation": "Why this is correct",
                    "category": "Technical"
                }
            ]
        }
        
        Ensure you generate EXACTLY 25 questions in the array.
        `;

        const assessmentData = await askGeminiJSON(prompt);
        res.status(200).json({ success: true, assessment: assessmentData });
    } catch (error) {
        console.error("Assessment Gen Error:", error);
        res.status(500).json({ success: false, message: "Failed to generate assessment questions." });
    }
};

/**
 * Save Assessment Result
 */
export const saveAssessment = async (req, res) => {
    const { jobDesc, questions, score, totalQuestions, feedback } = req.body;
    try {
        const newAssessment = new Assessment({
            userId: req.userId,
            jobDesc,
            questions,
            score,
            totalQuestions,
            feedback,
            status: "Completed"
        });
        await newAssessment.save();
        res.status(200).json({ success: true, assessment: newAssessment });
    } catch (error) {
        console.error("Save Assessment Error:", error);
        res.status(500).json({ success: false, message: "Failed to save assessment result." });
    }
};

/**
 * Get User Assessment History
 */
export const getAssessments = async (req, res) => {
    try {
        const assessments = await Assessment.find({ userId: req.userId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, assessments });
    } catch (error) {
        console.error("Fetch Assessments Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch assessment history." });
    }
};

/**
 * Synthesize Resume Content and Sync with Profile
 */
export const generateResume = async (req, res) => {
    const { personalInfo, experience, education, skills, projects, summary } = req.body;
    
    try {
        const prompt = `
        You are a Professional Resume Architect. 
        Transform the following raw user details into high-impact, professional resume content.
        
        USER DATA:
        Summary: ${summary}
        Personal: ${JSON.stringify(personalInfo)}
        Experience: ${JSON.stringify(experience)}
        Education: ${JSON.stringify(education)}
        Skills: ${JSON.stringify(skills)}
        Projects: ${JSON.stringify(projects)}

        RESPONSE FORMAT (Strict JSON):
        {
            "summary": "Polished summary",
            "experience": [{ "company": "Name", "role": "Role", "period": "Time", "points": ["bullet"] }],
            "projects": [{ "name": "Name", "description": "Desc", "link": "link" }],
            "skills": { "technical": ["list"], "soft": ["list"], "tools": ["list"] }
        }
        `;

        const polishedResume = await askGeminiJSON(prompt);

        // SYNC WITH USER PROFILE PERMANENTLY
        const flatSkills = [
            ...polishedResume.skills.technical,
            ...polishedResume.skills.soft,
            ...polishedResume.skills.tools
        ];

        await User.findByIdAndUpdate(req.userId, {
            skills: flatSkills,
            experience: experience.map(exp => ({
                title: exp.role || exp.title,
                company: exp.company,
                duration: exp.duration || exp.period,
                description: exp.description
            })),
            education: education.map(edu => ({
                degree: edu.degree,
                school: edu.school,
                year: edu.year
            })),
            profileBrief: polishedResume.summary
        });

        res.status(200).json({ success: true, resume: polishedResume });
    } catch (error) {
        console.error("Resume Generation Error:", error);
        res.status(500).json({ success: false, message: "Failed to generate resume." });
    }
};

/**
 * Search for Jobs (AICTE Live Scrape)
 */
import FormData from 'form-data';

export const searchJobs = async (req, res) => {
    const { title, location } = req.body;
    
    try {
        console.log(`Performing live search for "${title}" in "${location}"...`);
        
        // 1. Prepare form data for AICTE search
        const form = new FormData();
        form.append('searchInput', title || "");
        form.append('search_bar', location || "");
        
        // 2. Fetch results from AICTE
        const response = await axios.post('https://internship.aicte-india.org/internships.php', form, {
            headers: {
                ...form.getHeaders(),
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        
        const $ = cheerio.load(response.data);
        const jobs = [];
        
        // 3. Parse the results (using the same selector logic as the trending scraper)
        $('.box_intern_list').each((i, el) => {
            const jobTitle = $(el).find('.intern_title, h4').text().trim();
            const company = $(el).find('.intern_org, .company_name').text().trim();
            const jobLoc = $(el).find('.location').text().trim() || location || "India";
            const stipend = $(el).find('.stipend').text().trim() || "See portal";
            const duration = $(el).find('.duration').text().trim() || "N/A";
            const postedAt = $(el).find('.posted_on').text().trim() || "Recently";
            const description = $(el).find('.description, p').first().text().trim() || `Exciting internship opportunity at ${company}.`;
            const relativeLink = $(el).find('a.btn-primary').attr('href');
            
            if (jobTitle && company) {
                jobs.push({
                    id: `aicte-${i}-${Date.now()}`,
                    title: jobTitle,
                    company: company,
                    location: jobLoc,
                    salary: stipend,
                    description: description,
                    tags: [duration, "Govt Portal"],
                    postedAt: postedAt,
                    link: relativeLink ? `https://internship.aicte-india.org/${relativeLink}` : 'https://internship.aicte-india.org/internships.php'
                });
            }
        });

        console.log(`Search complete: Found ${jobs.length} original results.`);
        res.status(200).json({ success: true, jobs });
    } catch (error) {
        console.error("Live Search Error:", error.message);
        res.status(500).json({ success: false, message: "Failed to fetch live results." });
    }
};

/**
 * AI Job Match Scoring
 */
export const matchJob = async (req, res) => {
    const { jobTitle, jobDescription, company } = req.body;
    
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ success: false, message: "User profile not found." });

        const profileData = {
            resumeText: user.resumeText || user.profileBrief,
            skills: user.skills,
            experience: user.experience
        };

        const prompt = `
        You are an AI Career Matchmaker. 
        Compare the following user's high-fidelity resume content with the job description for the role of "${jobTitle}" at "${company}".
        
        USER RESUME/PROFILE CONTENT:
        ${JSON.stringify(profileData)}
 
        JOB DESCRIPTION:
        ${jobDescription}

        TASK:
        Calculated a match percentage and provide specific reasoning.

        RESPONSE FORMAT (Strict JSON):
        {
            "matchScore": number (0-100),
            "reasons": ["top 3 alignment points"],
            "missingSkills": ["top 3 missing skills or technologies"],
            "recommendation": "One sentence advice (e.g., 'Strong match, focus on your X project in the interview')"
        }
        `;

        const matchAnalysis = await askGeminiJSON(prompt);
        res.status(200).json({ success: true, analysis: matchAnalysis });
    } catch (error) {
        console.error("Match Job Error:", error);
        res.status(500).json({ success: false, message: "Failed to calculate match score." });
    }
};

/**
 * Get Trending Government Internships (PinchTab)
 */
import { fetchGovtInternships } from '../services/internship.service.js';

import jwt from 'jsonwebtoken';

export const getTrendingInternships = async (req, res) => {
    const force = req.query.force === 'true';
    try {
        let internships = await fetchGovtInternships(force);
        
        // AUTO-MATCHING LOGIC
        const { token } = req.cookies;
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const user = await User.findById(decoded.userId);

                if (user && user.resumeText) {
                    console.log(`Auto-matching trending roles for user: ${user.name}`);
                    
                    // Take top 4 for batch matching
                    const topItems = internships.slice(0, 4);
                    const prompt = `
                    You are a High-Speed Career Matching Engine.
                    Given the following USER RESUME and a list of 4 INTERNSHIPS, calculate a match percentage and a 1-sentence "Why" for each.

                    USER RESUME:
                    ${user.resumeText}

                    INTERNSHIPS:
                    ${JSON.stringify(topItems.map(it => ({ title: it.title, org: it.org, desc: it.description })))}

                    RESPONSE FORMAT (Strict JSON Array of exactly 4 objects):
                    [
                        { "score": 85, "reason": "Your background in React aligns perfectly with their frontend needs." },
                        ...
                    ]
                    `;

                    const matchResults = await askGeminiJSON(prompt);
                    
                    // Attach results back
                    if (Array.isArray(matchResults)) {
                        internships = internships.map((it, idx) => {
                            if (idx < matchResults.length) {
                                return { 
                                    ...it, 
                                    matchScore: matchResults[idx].score,
                                    matchReason: matchResults[idx].reason,
                                    isPersonalized: true
                                };
                            }
                            return it;
                        });
                    }
                }
            } catch (err) {
                console.error("Auto-match failed:", err.message);
            }
        }

        res.status(200).json({ success: true, internships });
    } catch (error) {
        console.error("Trending Internship Error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch trending internships." });
    }
};
/**
 * Update Roadmap Progress and UserTask Status
 */
export const updateTaskStatus = async (req, res) => {
    const { taskId, status } = req.body;
    try {
        const task = await UserTask.findOneAndUpdate(
            { _id: taskId, userId: req.userId },
            { status },
            { returnDocument: "after" }
        );

        if (task && task.roadmapId) {
            // Recalculate % for the entire roadmap
            const allTasks = await UserTask.find({ roadmapId: task.roadmapId });
            const completedTasks = allTasks.filter(t => t.status === "Completed").length;
            const progress = Math.round((completedTasks / allTasks.length) * 100);

            await Roadmap.findByIdAndUpdate(task.roadmapId, { progress });
            return res.status(200).json({ success: true, progress, task });
        }

        res.status(200).json({ success: true, task });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to update status." });
    }
};

/**
 * Get Progress Analytics for Line Graph
 */
export const getRoadmapAnalytics = async (req, res) => {
    const { roadmapId } = req.params;
    try {
        // Find all tasks for this roadmap
        const tasks = await UserTask.find({ roadmapId, userId: req.userId });
        
        // Group by date (simplified for line graph)
        // We look at the date when they were marked 'Completed' (updatedAt)
        const completedTasks = tasks.filter(t => t.status === "Completed");
        
        // Daily progression data point logic
        const dataPoints = [];
        let cumulative = 0;
        
        // Mocking some spread for the line graph if they just started, 
        // otherwise calculate from real completion dates.
        const sorted = completedTasks.sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt));
        
        sorted.forEach(t => {
            cumulative++;
            const dateStr = new Date(t.updatedAt).toLocaleDateString();
            dataPoints.push({ date: dateStr, count: cumulative });
        });

        res.status(200).json({ success: true, analytics: dataPoints });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch analytics." });
    }
};
/**
 * Get all roadmaps for the current user
 */
export const getUserRoadmaps = async (req, res) => {
    try {
        const roadmaps = await Roadmap.find({ userId: req.userId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, roadmaps });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch roadmaps." });
    }
};

/**
 * Delete a roadmap and its associated tasks
 */
export const deleteRoadmap = async (req, res) => {
    const { id } = req.params;
    try {
        await Roadmap.findOneAndDelete({ _id: id, userId: req.userId });
        // Clean up associated tasks
        await UserTask.deleteMany({ roadmapId: id, userId: req.userId });
        res.status(200).json({ success: true, message: "Roadmap deleted successfully." });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to delete roadmap." });
    }
};

/**
 * Get all tasks associated with a specific roadmap
 */
export const getRoadmapTasks = async (req, res) => {
    const { roadmapId } = req.params;
    try {
        const tasks = await UserTask.find({ roadmapId, userId: req.userId }).sort({ date: 1 });
        res.status(200).json({ success: true, tasks });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch tasks." });
    }
};
