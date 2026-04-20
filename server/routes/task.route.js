import express from "express";
import { createTask, getTasks, updateTask, deleteTask } from "../controllers/task.controller.js";
import isAuth from "../middlewares/isAuth.js";

const taskRouter = express.Router();

taskRouter.post("/create", isAuth, createTask);
taskRouter.get("/all", isAuth, getTasks);
taskRouter.put("/update/:id", isAuth, updateTask);
taskRouter.delete("/delete/:id", isAuth, deleteTask);

export default taskRouter;
