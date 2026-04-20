import express from "express";
import { 
    checkATS, getDetailedRoadmap, generateAssessment, saveAssessment,
    getAssessments, generateResume, 
    searchJobs, matchJob, getTrendingInternships, 
    updateTaskStatus, getRoadmapAnalytics, getUserRoadmaps, deleteRoadmap,
    getRoadmapTasks
} from "../controllers/career.controller.js";
import upload from "../middlewares/upload.middleware.js";
import isAuth from "../middlewares/isAuth.js";

const careerRouter = express.Router();

careerRouter.post("/ats-check", isAuth, upload.single("resume"), checkATS);
careerRouter.post("/roadmap", isAuth, getDetailedRoadmap);
careerRouter.get("/user-roadmaps", isAuth, getUserRoadmaps);
careerRouter.get("/roadmap-tasks/:roadmapId", isAuth, getRoadmapTasks);
careerRouter.delete("/roadmap/:id", isAuth, deleteRoadmap);
careerRouter.post("/generate-assessment", isAuth, generateAssessment);
careerRouter.post("/save-assessment", isAuth, saveAssessment);
careerRouter.get("/assessments", isAuth, getAssessments);
careerRouter.post("/update-task-status", isAuth, updateTaskStatus);
careerRouter.get("/roadmap-analytics/:roadmapId", isAuth, getRoadmapAnalytics);
careerRouter.post("/generate-resume", isAuth, generateResume);
careerRouter.post("/search-jobs", searchJobs);
careerRouter.post("/match-job", isAuth, matchJob);
careerRouter.get("/trending-internships", getTrendingInternships);

export default careerRouter;
